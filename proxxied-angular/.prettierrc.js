/** @type {import("prettier").Config} */
module.exports = {
  singleQuote: false,
  semi: true,
  tabWidth: 2,
  trailingComma: "es5",
  plugins: [
    "prettier-plugin-organize-imports",
    "prettier-plugin-tailwindcss"
  ],
  htmlWhitespaceSensitivity: "ignore"
};
