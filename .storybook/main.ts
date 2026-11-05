import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/preset-create-react-app",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/react-webpack5",
  "staticDirs": [
    "../public"
  ],
  // Storybookにも API の接続先を渡す（環境変数がなければローカルのjson-serverを使う）
  env: (config) => ({
    ...config,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL ?? 'http://localhost:3001',
  }),
};
export default config;

