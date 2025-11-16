import { defineBackend } from "@aws-amplify/backend";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { postConfirmation } from "./functions/postConfirmation/resource";
import { generateRandomVitals } from "./functions/generateRandomVitals/resource";
import { get30DayVitals } from "./functions/get30DayVitals/resource";
import { getLatestVitals } from "./functions/getLatestVitals/resource";
import { getUserProfile } from "./functions/getUserProfile/resource";
import { saveUserProfile } from "./functions/saveUserProfile/resource";


const backend = defineBackend({
  auth,
  data,
  postConfirmation,
  generateRandomVitals,
  get30DayVitals,
  getLatestVitals,
  getUserProfile,
  saveUserProfile,
});

const region = process.env.AWS_REGION ?? "us-east-1";
const userPoolId = process.env.MY_USER_POOL_ID;

if (!userPoolId) {
  throw new Error(
    "MY_USER_POOL_ID must be defined in the environment so the PostConfirmation trigger can be granted permissions."
  );
}

backend.postConfirmation.resources.lambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      "cognito-idp:AdminAddUserToGroup",
      "cognito-idp:GetGroup",
      "cognito-idp:CreateGroup",
    ],
    resources: [`arn:aws:cognito-idp:${region}:*:userpool/${userPoolId}`],
  })
);