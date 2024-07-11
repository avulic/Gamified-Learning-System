module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "json", "node"],
  testMatch: ["**/?(*.)+(spec|test).ts?(x)"],
  testTimeout: 60000, // Increase the global timeout to 30 seconds
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
};
