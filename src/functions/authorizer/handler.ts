import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { verifyToken } from '@libs/tokenVerifier';
import { createPolicyBuilder } from '@utils/policyBuilder';

/**
 * Lambda authorizer that verifies Auth0 tokens and generates appropriate policies
 */
export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    if (!event.authorizationToken) {
      throw new Error('Unauthorized: No authorization token was found');
    }

    // The token is in the format 'Bearer xxxxxx', so we need to extract the token part
    const token = event.authorizationToken.substring(7);
    
    // Verify the token and get the user information
    const decodedToken = await verifyToken(token);
    
    // Extract scopes from the token (if present)
    const scopes = decodedToken.scope?.split(' ') || [];
    
    console.log('Authorizing user:', decodedToken.sub);
    console.log('Resource:', event.methodArn);
    console.log('Scopes:', scopes);
    
    // Create a policy using the chainable PolicyBuilder
    const policyBuilder = createPolicyBuilder(decodedToken.sub, event.methodArn);
    
    // Allow all methods for now since we have a valid token
    const response = policyBuilder
      .allowAll()
      .buildWithContext({
        userId: decodedToken.sub,
        scope: decodedToken.scope || '',
        email: decodedToken.email || '',
        name: decodedToken.name || '',
      });
    
    return response;
  } catch (error) {
    console.error('Authorization error:', error);
    throw new Error('Unauthorized');
  }
}; 