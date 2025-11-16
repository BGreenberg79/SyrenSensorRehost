import { defineFunction } from "@aws-amplify/backend";

export const generateRandomVitals = defineFunction({
  name: "GenerateRandomVitals",
  entry: "./amplify/functions/generateRandomVitals/index.ts",
  runtime: 18,
  timeoutSeconds: 60,
  environment: {
    USERS_TABLE_NAME: process.env.USERS_TABLE_NAME ?? "Users",
    VITALS_TABLE_NAME: process.env.VITALS_TABLE_NAME ?? "Vitals",
  },
});