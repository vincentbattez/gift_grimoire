import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettierConfig from "eslint-config-prettier";
import eslintPluginPrettier from "eslint-plugin-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

export default tseslint.config(
  { ignores: ["dist/", "node_modules/", "eslint.config.js"] },
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  eslintPluginUnicorn.configs["flat/all"],
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  prettierConfig,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
      "unused-imports": unusedImports,
    },
    rules: {
      // — Prettier
      "prettier/prettier": "error",

      // — Unused imports (replaces @typescript-eslint/no-unused-vars)
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // — TypeScript strict
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/use-unknown-in-catch-callback-variable": "error",
      "@typescript-eslint/no-unsafe-call": "warn",
      "@typescript-eslint/no-unsafe-assignment": "warn",
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-unsafe-member-access": "warn",
      "@typescript-eslint/no-unsafe-return": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/no-dynamic-delete": "warn",
      "@typescript-eslint/no-shadow": "warn",
      "@typescript-eslint/naming-convention": [
        "error",
        // — Variables & params: camelCase (+ UPPER_CASE for constants)
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "parameter",
          format: ["camelCase"],
          leadingUnderscore: "allow",
        },
        // — Booleans: prefix is/has/should/can/did/will/must
        {
          selector: "variable",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: ["is", "has", "should", "can", "did", "will", "must"],
        },
        // — Functions: camelCase (+ PascalCase for React components & HOCs)
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        // — Types & interfaces: PascalCase
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        // — Enums members: PascalCase
        {
          selector: "enumMember",
          format: ["PascalCase"],
        },
      ],

      // — Code style
      "consistent-return": "warn",
      "no-else-return": "error",
      "prefer-template": "error",
      curly: ["error", "all"],
      "no-nested-ternary": "warn",
      eqeqeq: "error",
      "no-shadow": "off",
      "padding-line-between-statements": [
        "error",
        { blankLine: "always", prev: "*", next: "return" },
        { blankLine: "always", prev: "*", next: "try" },
        { blankLine: "always", prev: "*", next: "multiline-expression" },
        { blankLine: "always", prev: "*", next: "if" },
        { blankLine: "always", prev: "*", next: "export" },
      ],

      // — Unicorn overrides (too strict for React)
      "unicorn/no-null": "off",
      "unicorn/filename-case": "off",
      "unicorn/numeric-separators-style": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/no-keyword-prefix": "off",
    },
  },
);
