import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

const region = process.env.AWS_REGION ?? "us-east-1";
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME ?? "Users";
const VITALS_TABLE_NAME = process.env.VITALS_TABLE_NAME ?? "Vitals";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

const jsonResponse = (
  statusCode: number,
  body: unknown
): APIGatewayProxyStructuredResultV2 => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(body),
});

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyStructuredResultV2> => {
  try {
    const email = event.queryStringParameters?.email;
    const userId = event.queryStringParameters?.userId;

    if (!email && !userId) {
      return jsonResponse(400, { error: "email or userId is required" });
    }

    let actualUserId = userId;

    if (email && !userId) {
      const userResult = await docClient.send(
        new GetCommand({
          TableName: USERS_TABLE_NAME,
          Key: { email },
        })
      );

      if (!userResult.Item) {
        return jsonResponse(404, { error: "User not found" });
      }

      actualUserId = userResult.Item.userId as string;
    }

    if (!actualUserId) {
      return jsonResponse(404, { error: "User not found" });
    }

    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const result = await docClient.send(
      new QueryCommand({
        TableName: VITALS_TABLE_NAME,
        KeyConditionExpression: "userId = :userId AND #ts >= :thirtyDaysAgo",
        ExpressionAttributeNames: {
          "#ts": "timestamp",
        },
        ExpressionAttributeValues: {
          ":userId": actualUserId,
          ":thirtyDaysAgo": thirtyDaysAgo,
        },
        ScanIndexForward: true,
      })
    );

    const formattedVitals = (result.Items ?? []).map((item) => ({
      vitalsId: 0,
      skinTemp: item.skinTemp ?? 98,
      pulse: item.pulse ?? 70,
      spO2: item.spO2 ?? 98,
      timestamp: item.timestamp,
    }));

    return jsonResponse(200, formattedVitals);
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse(500, { error: (error as Error).message });
  }
};