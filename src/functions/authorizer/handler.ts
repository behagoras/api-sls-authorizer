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

    // Ensure token starts with Bearer prefix
    if (!event.authorizationToken.startsWith('Bearer ')) {
      throw new Error('Unauthorized: Invalid token format');
    }

    // The token is in the format 'Bearer xxxxxx', so we need to extract the token part
    const token = event.authorizationToken.substring(7);

    // Verify the token and get the user information
    const decodedToken = await verifyToken(token);
    
    // Extract scopes from the token (if present)
    const scopes = decodedToken.scope?.split(' ') || [];
    
    // Log minimal information - just enough for troubleshooting without exposing sensitive data
    console.log('Authorizing user ID ending in:', decodedToken.sub ? `...${decodedToken.sub.slice(-6)}` : 'unknown');
    console.log('Resource type:', event.methodArn.split(':').slice(-1)[0]);
    console.log('Number of scopes:', scopes.length);
    
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
    
    console.log("🚀 ~ handler ~ response:", response)
    return response;
  } catch (error) {
    // Log error without exposing sensitive details
    console.error('Authorization error:', error.name, error.message);
    
    // Don't expose internal error details in the thrown error
    throw new Error('Unauthorized');
  }
}; 