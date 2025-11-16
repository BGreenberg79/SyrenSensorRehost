import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

type GenerateRandomVitalsEvent = {
  email?: string;
  numDataPoints?: number;
};

const region = process.env.AWS_REGION ?? "us-east-1";
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME ?? "Users";
const VITALS_TABLE_NAME = process.env.VITALS_TABLE_NAME ?? "Vitals";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }));

export const handler = async (event: GenerateRandomVitalsEvent) => {
  try {
    console.log("Starting vitals generation");

    const email = event.email ?? "test@example.com";
    const numDataPoints = event.numDataPoints ?? 30;

    const userResult = await docClient.send(
      new GetCommand({
        TableName: USERS_TABLE_NAME,
        Key: { email },
      })
    );

    if (!userResult.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `User with email ${email} not found` }),
      };
    }

    const userId = userResult.Item.userId as string;

    console.log(`Generating ${numDataPoints} records for user ${userId}`);

    for (let i = 0; i < numDataPoints; i += 1) {
      const daysAgo = numDataPoints - i - 1;
      const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
      const pulse = Math.floor(Math.random() * 41) + 60; // 60-100 bpm
      const spO2 = Math.floor(Math.random() * 6) + 95; // 95-100%
      const skinTemp = Math.floor(Math.random() * 4) + 98; // 98-102°F

      await docClient.send(
        new PutCommand({
          TableName: VITALS_TABLE_NAME,
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

      console.log(
        `Record ${i + 1}: Temp=${skinTemp}°F, Pulse=${pulse}bpm, O2=${spO2}%`
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Created ${numDataPoints} records` }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};