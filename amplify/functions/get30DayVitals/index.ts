// ============================================
// 3. GET30DAYVITALS
// ============================================
// Gets vitals from last 30 days (PK: userId, SK: timestamp)

import { DynamoDBClient as Client3 } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient as DocClient3, QueryCommand as QueryCmd3, GetCommand as GetCmd3 } from "@aws-sdk/lib-dynamodb";

const client3 = new Client3({ region: "us-east-1" });
const docClient3 = DocClient3.from(client3);

export const handler3 = async (event) => {
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
      const userResult = await docClient3.send(
        new GetCmd3({
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

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Query Vitals table (PK: userId, SK: timestamp)
    const result = await docClient3.send(
      new QueryCmd3({
        TableName: "Vitals",
        KeyConditionExpression: "userId = :userId AND #ts >= :thirtyDaysAgo",
        ExpressionAttributeNames: {
          "#ts": "timestamp",
        },
        ExpressionAttributeValues: {
          ":userId": actualUserId,
          ":thirtyDaysAgo": thirtyDaysAgo,
        },
        ScanIndexForward: true, // Sort ascending by timestamp
      })
    );

    // Format vitals to match frontend interface
    const formattedVitals = (result.Items || []).map((item) => ({
      vitalsId: 0,
      skinTemp: item.skinTemp || 98,
      pulse: item.pulse || 70,
      spO2: item.spO2 || 98,
      timestamp: item.timestamp,
    }));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(formattedVitals),
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