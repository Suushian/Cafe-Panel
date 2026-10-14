const fs = require("node:fs");
const path = require("node:path");

// npm exec places ephemeral tool binaries on PATH. Resolve the parser from
// that same installation so linting works without mutating package-lock.json.
const eslintBin = (process.env.PATH || "")
  .split(path.delimiter)
  .map((dir) => path.join(dir, process.platform === "win32" ? "eslint.cmd" : "eslint"))
  .find((candidate) => fs.existsSync(candidate));
if (!eslintBin) throw new Error("ESLint executable was not found on PATH.");
const toolModules = path.resolve(path.dirname(eslintBin), "..");
const tsParser = require(path.join(toolModules, "@typescript-eslint/parser"));

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
