
import { a, type ClientSchema } from "@aws-amplify/backend";

export const schema = a.schema({
  Users: a
    .model({
      email: a.string(),
      userId: a.string(),
      createdAt: a.string(),
      updatedAt: a.string(),
    })
    .identifier(["email"])
    .authorization((allow) => [allow.authenticated()]),


  UserProfiles: a
    .model({
      userId: a.string(),
      email: a.string(),
      firstName: a.string(),
      lastName: a.string(),
      age: a.integer(),
      gender: a.string(),
      height: a.string(),
      weight: a.integer(),
      phoneNumber: a.string(),
      emergencyContactId: a.string(),
      addressId: a.string(),
      createdAt: a.string(),
    })
    .identifier(["userId"])
    .authorization((allow) => [allow.authenticated()]),

  EmergencyContacts: a
    .model({
      contactId: a.string(),
      userId: a.string(),
      firstName: a.string(),
      lastName: a.string(),
      phoneNumber: a.string(),
      relationship: a.string(),
      createdAt: a.string(),
    })
    .identifier(["contactId"])
    .authorization((allow) => [allow.authenticated()]),

  Addresses: a
    .model({
      addressId: a.string(),
      userId: a.string(),
      buildingNumber: a.string(),
      street: a.string(),
      aptUnitNumber: a.string(),
      city: a.string(),
      state: a.string(),
      zipCode: a.string(),
      country: a.string(),
      createdAt: a.string(),
    })
    .identifier(["addressId"])
    .authorization((allow) => [allow.authenticated()]),

  Vitals: a
    .model({
      userId: a.string(),
      timestamp: a.integer(),
      skinTemp: a.integer(),
      pulse: a.integer(),
      spO2: a.integer(),
      createdAt: a.string(),
    })
    .identifier(["userId", "timestamp"])
    .authorization((allow) => [allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;