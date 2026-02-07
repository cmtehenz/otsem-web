#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import ts from "typescript";

const HTTP_DECORATORS = new Set(["Get", "Post", "Patch", "Put", "Delete"]);
const HTTP_CLIENT_METHODS = new Set(["get", "post", "put", "patch", "delete", "del"]);
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "dist", "coverage"]);
const KNOWN_ROUTE_EXCEPTIONS = new Set([
  "admin/sell-conversions",
  "customers/me/verify-cpf",
  "customers/me/cpf-status",
  "customers/me/onboarding",
  "customers/me/phone/send-code",
  "customers/me/phone/verify-code",
  "customers/me/photo",
  "auth/2fa/setup",
  "auth/2fa/verify",
  "auth/2fa/disable",
  "auth/2fa/verify-login",
]);

const frontendRoot = process.cwd();
const backendInput = process.argv[2] || process.env.BACKEND_REPO_PATH || "../otsem-api";
const backendRoot = path.resolve(frontendRoot, backendInput);
const frontendSrc = path.join(frontendRoot, "src");
const backendSrc = path.join(backendRoot, "src");

if (!fs.existsSync(frontendSrc)) {
  console.error(`[contract-check] Frontend src not found: ${frontendSrc}`);
  process.exit(1);
}

if (!fs.existsSync(backendSrc)) {
  console.error(`[contract-check] Backend src not found: ${backendSrc}`);
  console.error(
    "[contract-check] Pass the backend path as argv[2], e.g. `npm run check:api-contract -- ../otsem-api`.",
  );
  process.exit(1);
}

function listFiles(dir, predicate, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".well-known") continue;
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      listFiles(path.join(dir, entry.name), predicate, acc);
      continue;
    }
    const filePath = path.join(dir, entry.name);
    if (predicate(filePath)) acc.push(filePath);
  }
  return acc;
}

function getDecorators(node) {
  if (!ts.canHaveDecorators(node)) return [];
  return ts.getDecorators(node) ?? [];
}

function getDecoratorCall(decorator) {
  if (!ts.isCallExpression(decorator.expression)) return null;
  const call = decorator.expression;
  let name = null;

  if (ts.isIdentifier(call.expression)) {
    name = call.expression.text;
  } else if (ts.isPropertyAccessExpression(call.expression)) {
    name = call.expression.name.text;
  }

  if (!name) return null;
  return { name, call };
}

function parseDecoratorPath(callExpression) {
  if (callExpression.arguments.length === 0) return "";
  const arg = callExpression.arguments[0];

  if (ts.isStringLiteralLike(arg) || ts.isNoSubstitutionTemplateLiteral(arg)) {
    return arg.text;
  }

  return null;
}

function normalizePath(raw, { stripApiPrefix = false } = {}) {
  if (!raw) return "";
  let value = raw.trim();
  if (!value) return "";
  value = value.split("?")[0].split("#")[0];
  if (!value) return "";

  if (stripApiPrefix) {
    if (value === "/api") value = "/";
    if (value.startsWith("/api/")) value = value.slice(4);
  }

  value = value.replace(/\/+/g, "/");
  value = value.replace(/^\/+|\/+$/g, "");
  return value;
}

function joinPaths(base, route) {
  const normalizedBase = normalizePath(base);
  const normalizedRoute = normalizePath(route);
  const joined = [normalizedBase, normalizedRoute].filter(Boolean).join("/");
  return normalizePath(joined);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compileBackendRouteRegex(route) {
  const segments = route.split("/").filter(Boolean);
  const pattern = segments
    .map((segment) => {
      if (segment.startsWith(":")) return "[^/]+";
      return escapeRegex(segment);
    })
    .join("/");

  return new RegExp(`^${pattern}$`);
}

function matchesDynamicPrefix(callPath, backendRoutes) {
  const token = "/:param";
  if (!callPath.includes(token)) return false;
  const staticPrefix = callPath.slice(0, callPath.indexOf(token));
  if (!staticPrefix) return false;
  return backendRoutes.some((route) => route === staticPrefix || route.startsWith(`${staticPrefix}/`));
}

function templateToPattern(node) {
  if (ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (!ts.isTemplateExpression(node)) return null;

  let out = node.head.text;
  for (const span of node.templateSpans) {
    out += ":param";
    out += span.literal.text;
  }
  return out;
}

function binaryToPattern(node) {
  if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }

  if (ts.isTemplateExpression(node)) {
    return templateToPattern(node);
  }

  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = binaryToPattern(node.left);
    const right = binaryToPattern(node.right);
    if (left === null || right === null) return null;
    return `${left}${right}`;
  }

  if (
    ts.isIdentifier(node) ||
    ts.isPropertyAccessExpression(node) ||
    ts.isElementAccessExpression(node) ||
    ts.isCallExpression(node)
  ) {
    return ":param";
  }

  return null;
}

function extractCallPath(argumentNode) {
  if (!argumentNode) return null;

  if (ts.isStringLiteralLike(argumentNode) || ts.isNoSubstitutionTemplateLiteral(argumentNode)) {
    return argumentNode.text;
  }

  if (ts.isTemplateExpression(argumentNode)) {
    return templateToPattern(argumentNode);
  }

  if (ts.isBinaryExpression(argumentNode) && argumentNode.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    return binaryToPattern(argumentNode);
  }

  return null;
}

function isHttpModule(moduleName) {
  return moduleName === "@/lib/http" || moduleName.endsWith("/lib/http") || moduleName === "./http";
}

function collectBackendRoutes() {
  const controllerFiles = listFiles(backendSrc, (file) => file.endsWith(".controller.ts"));
  const routes = new Set();

  for (const filePath of controllerFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);

    function visit(node) {
      if (ts.isClassDeclaration(node)) {
        const controllerPaths = [];
        for (const decorator of getDecorators(node)) {
          const call = getDecoratorCall(decorator);
          if (!call || call.name !== "Controller") continue;
          const parsed = parseDecoratorPath(call.call);
          if (parsed === null) continue;
          controllerPaths.push(parsed);
        }

        if (controllerPaths.length > 0) {
          for (const member of node.members) {
            if (!ts.isMethodDeclaration(member)) continue;

            const methodPaths = [];
            for (const decorator of getDecorators(member)) {
              const call = getDecoratorCall(decorator);
              if (!call || !HTTP_DECORATORS.has(call.name)) continue;
              const parsed = parseDecoratorPath(call.call);
              if (parsed === null) continue;
              methodPaths.push(parsed);
            }

            for (const base of controllerPaths) {
              if (methodPaths.length === 0) continue;
              for (const route of methodPaths) {
                const full = joinPaths(base, route);
                if (full) routes.add(full);
              }
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return routes;
}

function collectFrontendApiCalls() {
  const sourceFiles = listFiles(
    frontendSrc,
    (file) => (file.endsWith(".ts") || file.endsWith(".tsx")) && !file.endsWith(".d.ts"),
  );

  const calls = [];

  for (const filePath of sourceFiles) {
    const content = fs.readFileSync(filePath, "utf8");
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

    const defaultImportNames = new Set();
    const namespaceImportNames = new Set();
    const namedImports = new Map();

    for (const statement of sourceFile.statements) {
      if (!ts.isImportDeclaration(statement) || !statement.importClause) continue;
      if (!ts.isStringLiteralLike(statement.moduleSpecifier)) continue;

      const moduleName = statement.moduleSpecifier.text;
      if (!isHttpModule(moduleName)) continue;

      const clause = statement.importClause;
      if (clause.name) {
        defaultImportNames.add(clause.name.text);
      }

      if (!clause.namedBindings) continue;

      if (ts.isNamespaceImport(clause.namedBindings)) {
        namespaceImportNames.add(clause.namedBindings.name.text);
      } else if (ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) {
          const imported = (element.propertyName ?? element.name).text;
          namedImports.set(element.name.text, imported);
        }
      }
    }

    function visit(node) {
      if (ts.isCallExpression(node)) {
        let isHttpCall = false;

        if (ts.isIdentifier(node.expression)) {
          const importedName = namedImports.get(node.expression.text);
          if (importedName && HTTP_CLIENT_METHODS.has(importedName)) {
            isHttpCall = true;
          }
        } else if (ts.isPropertyAccessExpression(node.expression)) {
          const obj = node.expression.expression;
          const method = node.expression.name.text;
          if (
            ts.isIdentifier(obj) &&
            HTTP_CLIENT_METHODS.has(method) &&
            (defaultImportNames.has(obj.text) || namespaceImportNames.has(obj.text))
          ) {
            isHttpCall = true;
          }
        }

        if (isHttpCall) {
          const rawPath = extractCallPath(node.arguments[0]);
          if (rawPath && rawPath.startsWith("/")) {
            const normalized = normalizePath(rawPath, { stripApiPrefix: true });
            if (normalized) {
              const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
              calls.push({
                path: normalized,
                rawPath,
                filePath,
                line: line + 1,
              });
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  return calls;
}

const backendRoutes = Array.from(collectBackendRoutes()).sort();
const backendMatchers = backendRoutes.map((route) => ({
  route,
  regex: compileBackendRouteRegex(route),
}));

const frontendCalls = collectFrontendApiCalls();
const unmatched = [];

for (const call of frontendCalls) {
  if (KNOWN_ROUTE_EXCEPTIONS.has(call.path)) continue;
  if (matchesDynamicPrefix(call.path, backendRoutes)) continue;

  const matched = backendMatchers.some(({ regex }) => regex.test(call.path));
  if (!matched) unmatched.push(call);
}

if (unmatched.length > 0) {
  const grouped = new Map();
  for (const issue of unmatched) {
    const key = issue.path;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(issue);
  }

  console.error("\n[contract-check] Frontend API paths without backend match:");
  for (const [pathKey, items] of grouped.entries()) {
    const first = items[0];
    const relative = path.relative(frontendRoot, first.filePath);
    console.error(`- /${pathKey} (e.g. ${relative}:${first.line})`);
  }
  console.error(
    `\n[contract-check] Checked ${frontendCalls.length} frontend calls against ${backendRoutes.length} backend routes.`,
  );
  process.exit(1);
}

console.log(
  `[contract-check] OK - ${frontendCalls.length} frontend calls matched ${backendRoutes.length} backend routes.`,
);
