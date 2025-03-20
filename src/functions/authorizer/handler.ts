import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { AuthPolicy } from '@libs/authPolicy';
import { verifyToken, getUserInfoFromToken } from '@libs/tokenVerifier';
import { Permission } from '@types';

/**
 * Determines which API Gateway resources the user should have access to
 * based on their permissions in the Auth0 token
 */
const buildPolicyForUser = (userId: string, methodArn: string, permissions: string[]): AuthPolicy => {
  // Extract the API ID, stage, and region from the methodArn
  const arnParts = methodArn.split(':');
  const awsAccountId = arnParts[4];
  
  // Create a new policy for this user
  const policy = new AuthPolicy(userId, awsAccountId, {
    region: arnParts[3],
    restApiId: arnParts[5].split('/')[0],
    stage: arnParts[5].split('/')[1]
  });
  
  // Set permissions based on the user's scopes/permissions from Auth0
  if (permissions.includes(Permission.ReadAuctions)) {
    policy.allowMethod(AuthPolicy.HttpVerb.GET, '/auctions');
    policy.allowMethod(AuthPolicy.HttpVerb.GET, '/auction/*');
  }
  
  if (permissions.includes(Permission.CreateAuctions)) {
    policy.allowMethod(AuthPolicy.HttpVerb.POST, '/auction');
  }
  
  if (permissions.includes(Permission.PlaceBids)) {
    policy.allowMethod(AuthPolicy.HttpVerb.PATCH, '/auction/*/bid');
  }
  
  // If no specific permissions match, provide minimal access
  // This is needed for the Authorization test endpoint
  if (policy.allowMethods.length === 0) {
    policy.allowMethod(AuthPolicy.HttpVerb.GET, '/hello');
  }
  
  return policy;
};

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    if (!event.authorizationToken) {
      throw new Error('Unauthorized: No authorization token was found');
    }

    // The token is in the format 'Bearer xxxxxx', so we need to extract the token part
    const token = event.authorizationToken.substring(7);
    
    // Verify the token and get the user information
    const decodedToken = await verifyToken(token);
    const userInfo = getUserInfoFromToken(decodedToken);
    
    // For development, log the permissions (remove in production)
    console.log('User permissions:', userInfo.permissions);
    
    // Generate a policy document based on the user's permissions
    const policy = buildPolicyForUser(userInfo.userId, event.methodArn, userInfo.permissions);
    
    // Build the final response with context
    const response = policy.build();
    
    // Add custom context attributes to be accessible in the Lambda functions
    response.context = {
      userId: userInfo.userId,
      scope: decodedToken.scope || '',
      email: decodedToken.email,
    };
    
    return response;
  } catch (error) {
    console.error('Authorization error:', error);
    throw new Error('Unauthorized');
  }
}; 