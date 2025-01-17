import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      ...pluginJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-namespace": "off",
      eqeqeq: ["error", "always"],
      "no-duplicate-imports": "error",
      "no-empty": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "off",
    },
  },
];
