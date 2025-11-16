// ============================================
// 1. SAVEUSERPROFILE
// ============================================
// Saves complete user registration including profile, emergency contact, and address

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      relationship,
      height,
      weight,
    } = body;

    if (!email) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "email is required" }),
      };
    }

    // Generate UUIDs for related records
    const userId = randomUUID();
    const contactId = randomUUID();
    const addressId = randomUUID();
    const now = new Date().toISOString();

    // 1. Create Users record (PK: email)
    await docClient.send(
      new PutCommand({
        TableName: "Users",
        Item: {
          email,
          userId,
          createdAt: now,
        },
      })
    );

    // 2. Create UserProfiles record (PK: userId)
    await docClient.send(
      new PutCommand({
        TableName: "UserProfiles",
        Item: {
          userId,
          email,
          firstName: firstName || "",
          lastName: lastName || "",
          phoneNumber: phoneNumber || "",
          height: height || "",
          weight: weight || "",
          emergencyContactId: contactId,
          addressId,
          createdAt: now,
        },
      })
    );

    // 3. Create EmergencyContacts record (PK: contactId)
    await docClient.send(
      new PutCommand({
        TableName: "EmergencyContacts",
        Item: {
          contactId,
          userId,
          firstName: firstName || "",
          lastName: lastName || "",
          phoneNumber: phoneNumber || "",
          relationship: relationship || "",
          createdAt: now,
        },
      })
    );

    // 4. Create AddressInfo record (PK: addressId)
    await docClient.send(
      new PutCommand({
        TableName: "AddressInfo",
        Item: {
          addressId,
          userId,
          createdAt: now,
        },
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        message: "Profile saved successfully",
        userId,
        email,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};