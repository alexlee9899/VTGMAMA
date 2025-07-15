// jest.config.js
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // 指向Next.js应用的路径
  dir: "./",
});

// Jest自定义配置
const customJestConfig = {
  // 添加更多自定义配置
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    // 处理模块别名（与tsconfig.json中的paths一致）
    "^@/(.*)$": "<rootDir>/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
};

// createJestConfig会将Next.js的配置与我们的自定义配置合并
module.exports = createJestConfig(customJestConfig);
