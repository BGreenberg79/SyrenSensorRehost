import { defineFunction } from "@aws-amplify/backend";

export const get30DayVitals = defineFunction({
  name: "Get30DayVitals",
  entry: "./amplify/functions/get30DayVitals/index.ts",
  runtime: 18,
  timeoutSeconds: 30,
  environment: {
    USERS_TABLE_NAME: process.env.USERS_TABLE_NAME ?? "Users",
    VITALS_TABLE_NAME: process.env.VITALS_TABLE_NAME ?? "Vitals",
  },
});