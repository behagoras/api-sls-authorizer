import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { createPolicyBuilder, HttpVerb } from '@utils/policyBuilder';

/**
 * Example function that demonstrates direct use of the PolicyBuilder
 * This doesn't actually build a policy, it just shows how you might use PolicyBuilder
 * in your own code if needed
 */
const privateHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Example only - normally you wouldn't need this in your API functions
    // Just demonstrating how you could use the PolicyBuilder directly
    const policyBuilderExample = () => {
      // In a real scenario, you'd get these from event or context
      const userId = 'user123';
      const methodArn = 'arn:aws:execute-api:us-west-2:123456789012:api123/dev/GET/private';
      const userPermissions = ['read:resources', 'create:resources'];
      
      // Create a builder and chain methods
      const builder = createPolicyBuilder(userId, methodArn);
      
      // You can chain methods in different ways depending on your needs:
      
      // Example 1: Apply all permissions from the token
      builder.applyPermissions(userPermissions);
      
      // Example 2: Add specific methods
      builder
        .allowMethod(HttpVerb.GET, '/users')
        .allowMethod(HttpVerb.POST, '/orders');
      
      // Example 3: Combine approaches
      builder
        .allowMethod(HttpVerb.GET, '/products/*')
        .applyPermissions(userPermissions)
        .allowMinimalAccess();
      
      // Or you could just allow everything
      // builder.allowAll();
      
      // Or deny everything
      // builder.denyAll();
      
      return "These are just examples of how to use the PolicyBuilder";
    };

    // Show the user their identity from the Auth0 token context
    const identity = {
      userId: event.requestContext.authorizer?.userId || 'unknown',
      email: event.requestContext.authorizer?.email || 'unknown',
      name: event.requestContext.authorizer?.name || 'unknown',
      scope: event.requestContext.authorizer?.scope || '',
      message: "This is a private endpoint that requires authentication",
      policyBuilderExamples: policyBuilderExample()
    };

    return formatJSONResponse({
      authenticated: true,
      identity,
    });
  } catch (error) {
    // Create a custom response for errors
    return {
      statusCode: 500,
      body: JSON.stringify({
        authenticated: false,
        error: error.message,
      })
    };
  }
};

export const main = middyfy(privateHandler); 