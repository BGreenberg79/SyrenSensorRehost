import { defineFunction } from "@aws-amplify/backend";

export const getLatestVitals = defineFunction({
  name: "GetLatestVitals",
  entry: "./amplify/functions/getLatestVitals/index.ts",
  runtime: 18,
  timeoutSeconds: 30,
  environment: {
    USERS_TABLE_NAME: process.env.USERS_TABLE_NAME ?? "Users",
    VITALS_TABLE_NAME: process.env.VITALS_TABLE_NAME ?? "Vitals",
  },
});