import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { randomUUID } from "node:crypto";

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
    const body = JSON.parse(event.body ?? "{}");
    const {
      email,
      patientFirstName,
      patientLastName,
      firstName: contactFirstName,
      lastName: contactLastName,
      phoneNumber,
      relationship,
      height,
      weight,
      age,
      name,
      buildingNumber,
      street,
      aptUnitNumber,
      city,
      state,
      zipCode,
      country,
    } = body as Record<string, string>;

    if (!email) {
      return jsonResponse(400, { error: "email is required" });
    }

    const userId = randomUUID();
    const contactId = randomUUID();
    const addressId = randomUUID();
    const now = new Date().toISOString();

    await docClient.send(
      new PutCommand({
        TableName: USERS_TABLE_NAME,
        Item: {
          email,
          userId,
          createdAt: now,
        },
      })
    );

    const normalizedFullName = (name ?? "").trim();
    const [fallbackFirstName = "", ...restOfName] = normalizedFullName
      .split(/\s+/)
      .filter(Boolean);
    const fallbackLastName = restOfName.join(" ");

    await docClient.send(
      new PutCommand({
        TableName: USER_PROFILES_TABLE_NAME,
        Item: {
          userId,
          email,
          firstName: patientFirstName ?? fallbackFirstName,
          lastName: patientLastName ?? fallbackLastName,
          age: age ? Number.parseInt(age, 10) : 0,
          gender: "",
          height: height ?? "",
          weight: weight ? Number.parseInt(weight, 10) : 0,
          phoneNumber: phoneNumber ?? "",
          emergencyContactId: contactId,
          addressId,
          createdAt: now,
        },
      })
    );

    await docClient.send(
      new PutCommand({
        TableName: EMERGENCY_CONTACTS_TABLE_NAME,
        Item: {
          contactId,
          userId,
          firstName: contactFirstName ?? "",
          lastName: contactLastName ?? "",
          phoneNumber: phoneNumber ?? "",
          relationship: relationship ?? "",
          createdAt: now,
        },
      })
    );

    await docClient.send(
      new PutCommand({
        TableName: ADDRESSES_TABLE_NAME,
        Item: {
          addressId,
          userId,
          buildingNumber: buildingNumber ?? "",
          street: street ?? "",
          aptUnitNumber: aptUnitNumber ?? "",
          city: city ?? "",
          state: state ?? "",
          zipCode: zipCode ?? "",
          country: country ?? "",
          createdAt: now,
        },
      })
    );

    return jsonResponse(200, {
      message: "Profile saved successfully",
      userId,
      email,
    });
  } catch (error) {
    console.error("Error:", error);
    return jsonResponse(500, { error: (error as Error).message });
  }
};