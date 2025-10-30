// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

// Exportar via variável evita warning de anonymous default export
const config = [
  // 0) Ignora pastas/arquivos gerados
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",        // evita o triple-slash warning
      "**/*.d.ts",            // tipagens geradas
    ],
  },

  // 1) Presets do Next + TS (mantém recomendações)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 2) Regras mínimas para o projeto (sem type-aware)
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // Sem "project" → não carrega type info (RÁPIDO e não traz .next/types)
        sourceType: "module",
      },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      // ✅ Somente o que você pediu como erro
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // 🔕 Silenciar barulhos
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/ban-ts-comment": "off",

      // Next (deixa só aviso fraco ou desliga)
      "@next/next/no-img-element": "warn",

      // Import (desliga warning de anonymous default export)
      "import/no-anonymous-default-export": "off",

      // JS básicos — opcionais
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["warn", "always", { null: "ignore" }],
      curly: ["off"],
    },
  },
];

export default config;
