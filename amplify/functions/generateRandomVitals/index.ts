// ============================================
// 5. GENERATERANDOMVITALS
// ============================================
// Generates 30 days of random vitals for testing (PK: userId, SK: timestamp)

import { DynamoDBClient as Client5 } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient as DocClient5, PutCommand as PutCmd5, GetCommand as GetCmd5 } from "@aws-sdk/lib-dynamodb";

const client5 = new Client5({ region: "us-east-1" });
const docClient5 = DocClient5.from(client5);

export const handler5 = async (event) => {
  try {
    console.log("Starting vitals generation");
    
    // Accept email from query params, body, or event
    const email = event.queryStringParameters?.email || event.email || "test@example.com";
    const numDataPoints = event.numDataPoints || 30;

    // Look up userId by email in Users table (PK: email)
    const userResult = await docClient5.send(
      new GetCmd5({
        TableName: "Users",
        Key: { email },
      })
    );

    if (!userResult.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: `User with email ${email} not found` }),
      };
    }

    const userId = userResult.Item.userId;

    console.log(`Generating ${numDataPoints} records for user ${userId}`);

    for (let i = 0; i < numDataPoints; i++) {
      const daysAgo = numDataPoints - i - 1;
      const timestamp = Date.now() - (daysAgo * 24 * 60 * 60 * 1000);
      const pulse = Math.floor(Math.random() * 41) + 60; // 60-100 bpm
      const spO2 = Math.floor(Math.random() * 6) + 95; // 95-100%
      const skinTemp = Math.floor(Math.random() * 4) + 98; // 98-102°F

      // Put Vitals record (PK: userId, SK: timestamp)
      await docClient5.send(
        new PutCmd5({
          TableName: "Vitals",
          Item: {
            userId,
            timestamp,
            skinTemp,
            pulse,
            spO2,
            createdAt: new Date().toISOString(),
          },
        })
      );

      console.log(`Record ${i + 1}: Temp=${skinTemp}°F, Pulse=${pulse}bpm, O2=${spO2}%`);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: `Created ${numDataPoints} records` }),
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