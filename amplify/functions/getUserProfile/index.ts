import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";

const region = process.env.AWS_REGION ?? "us-east-1";
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME ?? "Users";
const USER_PROFILES_TABLE_NAME = process.env.USER_PROFILES_TABLE_NAME ?? "UserProfiles";
const EMERGENCY_CONTACTS_TABLE_NAME =
  process.env.EMERGENCY_CONTACTS_TABLE_NAME ?? "EmergencyContacts";
const ADDRESSES_TABLE_NAME = process.env.ADDRESSES_TABLE_NAME ?? "Addresses";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

const jsonResponse = (
  statusCode: number,
  body: Record<string, unknown>
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

    const profileResult = await docClient.send(
      new GetCommand({
        TableName: USER_PROFILES_TABLE_NAME,
        Key: { userId: actualUserId },
      })
    );

    if (!profileResult.Item) {
      return jsonResponse(404, { error: "Profile not found" });
    }

    const profile = profileResult.Item;

    const contactResult = await docClient.send(
      new GetCommand({
        TableName: EMERGENCY_CONTACTS_TABLE_NAME,
        Key: { contactId: profile.emergencyContactId },
      })
    );

    const addressResult = await docClient.send(
      new GetCommand({
        TableName: ADDRESSES_TABLE_NAME,
        Key: { addressId: profile.addressId },
      })
    );

    return jsonResponse(200, {
      ...profile,
      emergencyContact: contactResult.Item ?? {},
      address: addressResult.Item ?? {},
    });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse(500, { error: (error as Error).message });
  }
};