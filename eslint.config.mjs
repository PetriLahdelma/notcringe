import nextConfig from "eslint-config-next"

const config = [
  ...nextConfig,
  {
    files: ["components/component-example.tsx"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx"],
    languageOptions: {
      globals: {
        afterEach: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        vi: "readonly",
      },
    },
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**"],
  },
]

export default config
