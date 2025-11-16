import { defineFunction } from "@aws-amplify/backend";

export const saveUserProfile = defineFunction({
  name: "SaveUserProfile",
  entry: "./amplify/functions/saveUserProfile/index.ts",
  runtime: 18,
  timeoutSeconds: 30,
  environment: {
    USERS_TABLE_NAME: process.env.USERS_TABLE_NAME ?? "Users",
    USER_PROFILES_TABLE_NAME: process.env.USER_PROFILES_TABLE_NAME ?? "UserProfiles",
    EMERGENCY_CONTACTS_TABLE_NAME:
      process.env.EMERGENCY_CONTACTS_TABLE_NAME ?? "EmergencyContacts",
    ADDRESSES_TABLE_NAME: process.env.ADDRESSES_TABLE_NAME ?? "Addresses",
  },
});