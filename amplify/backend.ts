import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { postConfirmation } from "./backend/function/syrensensor6dc1427fPostConfirmation/src/add-to-group.js";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  postConfirmation,
});

// Grant the Lambda ALL necessary permissions to manage groups and users
const postConfirmationLambda = backend.postConfirmation.resources.lambda;

postConfirmationLambda.addToRolePolicy(
  new PolicyStatement({
    actions: [
      "cognito-idp:AdminAddUserToGroup",
      "cognito-idp:GetGroup",
      "cognito-idp:CreateGroup",
    ],
    resources: [
      `arn:aws:cognito-idp:${process.env.AWS_REGION || "us-east-1"}:*:userpool/${process.env.MY_USER_POOL_ID}`,
    ],
  })
);