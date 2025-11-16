// ============================================
// 2. GETUSERPROFILE
// ============================================
// Gets complete user profile by email or userId

import { DynamoDBClient as Client2 } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient as DocClient2, GetCommand as GetCmd2 } from "@aws-sdk/lib-dynamodb";

const client2 = new Client2({ region: "us-east-1" });
const docClient2 = DocClient2.from(client2);

export const handler2 = async (event) => {
  try {
    const email = event.queryStringParameters?.email;
    const userId = event.queryStringParameters?.userId;

    if (!email && !userId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "email or userId is required" }),
      };
    }

    let actualUserId = userId;

    // If email provided, look up userId in Users table (PK: email)
    if (email && !userId) {
      const userResult = await docClient2.send(
        new GetCmd2({
          TableName: "Users",
          Key: { email },
        })
      );

      if (!userResult.Item) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ error: "User not found" }),
        };
      }

      actualUserId = userResult.Item.userId;
    }

    if (!actualUserId) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "User ID not found" }),
      };
    }

    // Get UserProfile (PK: userId)
    const profileResult = await docClient2.send(
      new GetCmd2({
        TableName: "UserProfiles",
        Key: { userId: actualUserId },
      })
    );

    if (!profileResult.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Profile not found" }),
      };
    }

    const profile = profileResult.Item;

    // Get EmergencyContact (PK: contactId)
    let emergencyContact = {};
    if (profile.emergencyContactId) {
      const contactResult = await docClient2.send(
        new GetCmd2({
          TableName: "EmergencyContacts",
          Key: { contactId: profile.emergencyContactId },
        })
      );
      emergencyContact = contactResult.Item || {};
    }

    // Get AddressInfo (PK: addressId)
    let address = {};
    if (profile.addressId) {
      const addressResult = await docClient2.send(
        new GetCmd2({
          TableName: "AddressInfo",
          Key: { addressId: profile.addressId },
        })
      );
      address = addressResult.Item || {};
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        ...profile,
        emergencyContact,
        address,
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