module.exports = {
  extends: ["stylelint-config-standard"],
  plugins: ["stylelint-use-logical"],
  rules: {
    "csstools/use-logical": "always",
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "apply",
          "custom-variant",
          "layer",
          "responsive",
          "screen",
          "tailwind",
          "theme",
          "variants",
        ],
      },
    ],
    "hue-degree-notation": null,
    "import-notation": "string",
    "lightness-notation": null,
    "rule-empty-line-before": null,
  },
}
