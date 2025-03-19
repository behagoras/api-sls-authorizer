import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { AuthPolicy } from '../../libs/authPolicy';
import { verifyToken } from '../../libs/tokenVerifier';

export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    if (!event.authorizationToken) {
      throw new Error('Unauthorized: No authorization token was found');
    }

    // The token is in the format 'Bearer xxxxxx', so we need to extract the token part
    const token = event.authorizationToken.substring(7);
    
    // Verify the token and get the user information
    const user = await verifyToken(token);

    // Generate a policy document based on the user information
    // TODO: Give less access to the user
    // const apiGatewayWildcard = event.methodArn.split('/', 2).join('/') + '/*';
    const policy = new AuthPolicy(user.sub, '*', event.methodArn);
    policy.allowAllMethods();

    return policy.build();
  } catch (error) {
    console.error('Authorization error:', error);
    throw new Error('Unauthorized');
  }
}; 