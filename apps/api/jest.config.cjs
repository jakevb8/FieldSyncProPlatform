/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@repo/shared/(.*)$": "<rootDir>/../../packages/shared/src/$1",
    "^@repo/shared$": "<rootDir>/../../packages/shared/src/index.ts",
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          module: "ESNext",
          moduleResolution: "Bundler",
        },
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts"],
};

module.exports = config;
