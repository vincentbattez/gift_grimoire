import prettierConfig from "eslint-config-prettier";
import eslintPluginImport from "eslint-plugin-import";
import eslintPluginPrettier from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";


export default tseslint.config(
  { ignores: ["dist/", "node_modules/", "eslint.config.js", "commitlint.config.ts"] },
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
      import: eslintPluginImport,
      "unused-imports": unusedImports,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
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
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unnecessary-type-conversion": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
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
        // — Arrays: suffix List
        {
          selector: ["variable", "typeProperty"],
          types: ["array"],
          format: null,
          custom: {
            regex: "^(?!data(?:List)?$)([a-z][a-zA-Z0-9]*List[a-zA-Z0-9]*(?<!Data)|[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*_LIST[A-Z0-9_]*)$",
            match: true,
          },
        },
        // — Interfaces: prefix I
        {
          selector: "interface",
          format: ["PascalCase"],
          prefix: ["I"],
        },
        // — Enums: suffix Enum
        {
          selector: "enum",
          format: ["PascalCase"],
          suffix: ["Enum"],
        },
        // — Enums members: UPPER_CASE
        {
          selector: "enumMember",
          format: ["UPPER_CASE"],
        },
      ],

      // — Imports
      "import/extensions": "off",
      "import/no-unresolved": "off",
      "import/prefer-default-export": "off",
      "import/no-default-export": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: ["~/*", "../*"],
        },
      ],

      // — Code style
      "consistent-return": "warn",
      "no-else-return": "error",
      "prefer-template": "error",
      curly: ["error", "all"],
      "no-nested-ternary": "warn",
      eqeqeq: "error",
      "new-cap": "warn",
      "no-shadow": "off",
      "no-param-reassign": "off",
      "no-underscore-dangle": "off",
      "no-use-before-define": "off",
      "no-restricted-syntax": [
        "error",
        {
          selector: ":matches(PropertyDefinition, MethodDefinition)[accessibility=\"private\"]",
          message: "Use `#private` members instead.",
        },
      ],
      "function-paren-newline": "off",
      "array-bracket-newline": ["warn", { multiline: true }],
      "array-bracket-spacing": ["warn", "never"],
      "array-element-newline": ["warn", "consistent"],
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
  // Allow default exports in app.ts
  {
    files: [
      "src/App.tsx",
      "vite.config.ts"
    ],
    rules: {
      "import/no-default-export": "off"
    },
  },
);
