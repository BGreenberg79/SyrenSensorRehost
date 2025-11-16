import { defineFunction } from "@aws-amplify/backend";
import "dotenv/config";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be defined for the PostConfirmation function.`);
  }
  return value;
};

export const postConfirmation = defineFunction({
  name: "syrensensor6dc1427fPostConfirmation",
  entry: "./amplify/functions/postConfirmation/index.ts",
  runtime: 18,
  timeoutSeconds: 30,
  environment: {
    USER_POOL_ID: requireEnv("MY_USER_POOL_ID"),
    DEFAULT_USER_GROUP: process.env.DEFAULT_USER_GROUP ?? "Patients",
    USERS_TABLE_NAME: process.env.USERS_TABLE_NAME ?? "",
  },
});