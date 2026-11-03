export default [
  { ignores: ["node_modules/**", "apps/**", ".venv/**"] },
  {
    files: ["src/**/*.js", "server.js", "scripts/**/*.js"],
    languageOptions: { ecmaVersion: 2023, sourceType: "commonjs" },
    rules: {
      "no-unreachable": "error",
      "no-constant-condition": "error",
      "no-duplicate-case": "error",
    },
  },
];
