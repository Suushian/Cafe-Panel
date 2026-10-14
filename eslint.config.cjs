const fs = require("node:fs");
const path = require("node:path");

const tsParser = require("@typescript-eslint/parser");

module.exports = [
  {
    ignores: ["node_modules/**", ".next/**", "data/**", "coverage/**"],
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.mjs", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      "no-debugger": "error",
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-duplicate-imports": "error",
      "no-unsafe-finally": "error",
      "no-fallthrough": "error",
    },
  },
];
