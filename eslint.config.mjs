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
    ignores: ["**/node_modules/**", "**/dist/**"],
  },
]

export default config
