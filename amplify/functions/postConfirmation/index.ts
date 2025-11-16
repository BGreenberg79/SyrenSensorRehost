import AWS from "aws-sdk";
import type { PostConfirmationTriggerEvent } from "aws-lambda";

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamo = new AWS.DynamoDB.DocumentClient();

const defaultGroup = process.env.DEFAULT_USER_GROUP ?? "Patients";
const usersTableName = process.env.USERS_TABLE_NAME;
const userPoolId = process.env.USER_POOL_ID;

const ensureGroupExists = async () => {
  if (!userPoolId) {
    return;
  }

  try {
    await cognito
      .getGroup({
        GroupName: defaultGroup,
        UserPoolId: userPoolId,
      })
      .promise();
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code !== "ResourceNotFoundException") {
      throw error;
    }

    await cognito
      .createGroup({
        GroupName: defaultGroup,
        UserPoolId: userPoolId,
      })
      .promise();
  }
};

const addUserToGroup = async (username: string) => {
  if (!userPoolId) {
    return;
  }

  await cognito
    .adminAddUserToGroup({
      GroupName: defaultGroup,
      UserPoolId: userPoolId,
      Username: username,
    })
    .promise();
};

const upsertUserRecord = async (userId: string, email?: string) => {
  if (!usersTableName || !email) {
    return;
  }

  await dynamo
    .put({
      TableName: usersTableName,
      Item: {
        email,
        userId,
        updatedAt: new Date().toISOString(),
      },
    })
    .promise();
};

export const handler = async (event: PostConfirmationTriggerEvent) => {
  const email = event.request?.userAttributes?.email;
  const userId = event.request?.userAttributes?.sub ?? event.userName;

  if (!userId) {
    console.warn("PostConfirmation event did not include a user identifier.");
    return event;
  }

  if (userPoolId) {
    await ensureGroupExists();
    await addUserToGroup(userId);
  } else {
    console.warn("USER_POOL_ID is not configured; skipping group management.");
  }

  if (usersTableName) {
    await upsertUserRecord(userId, email);
  } else {
    console.warn("USERS_TABLE_NAME not set; skipping Users table sync.");
  }

  return event;
};