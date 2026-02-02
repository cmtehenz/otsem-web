// eslint.config.mjs
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const project = "./tsconfig.json";

const nextConfigs = compat.extends("next/core-web-vitals", "next/typescript");

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.d.ts",
      "public/sw.js",
    ],
  },

  ...nextConfigs.map((cfg) => ({
    ...cfg,
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...(cfg.languageOptions?.parserOptions ?? {}),
        project,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      ...cfg.plugins,
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...cfg.rules,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  })),
];

export default config;
