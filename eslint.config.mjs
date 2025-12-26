// eslint.config.mjs
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vercel from "@vercel/style-guide/eslint/next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const project = "./tsconfig.json";

const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/*.d.ts",
    ],
  },

  // Vercel strict: base config for Next + TS + Prettier opinions
  ...vercel.map((cfg) => ({
    ...cfg,
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...(cfg.languageOptions?.parserOptions ?? {}),
        project,
        tsconfigRootDir: __dirname,
      },
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
