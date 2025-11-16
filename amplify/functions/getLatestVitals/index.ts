// ============================================
// 4. GETLATESTVITALS
// ============================================
// Gets most recent vital for user (PK: userId, SK: timestamp)

import { DynamoDBClient as Client4 } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient as DocClient4, QueryCommand as QueryCmd4, GetCommand as GetCmd4 } from "@aws-sdk/lib-dynamodb";

const client4 = new Client4({ region: "us-east-1" });
const docClient4 = DocClient4.from(client4);

export const handler4 = async (event) => {
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
      const userResult = await docClient4.send(
        new GetCmd4({
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

    // Query Vitals table (PK: userId, SK: timestamp), get most recent
    const result = await docClient4.send(
      new QueryCmd4({
        TableName: "Vitals",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": actualUserId,
        },
        ScanIndexForward: false, // Descending = most recent first
        Limit: 1,
      })
    );

    const latestVital = result.Items?.[0];

    if (!latestVital) {
      // Return default vitals if none exist
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          vitalsId: 0,
          skinTemp: 98,
          pulse: 70,
          spO2: 98,
          timestamp: null,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        vitalsId: 0,
        skinTemp: latestVital.skinTemp || 98,
        pulse: latestVital.pulse || 70,
        spO2: latestVital.spO2 || 98,
        timestamp: latestVital.timestamp,
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
