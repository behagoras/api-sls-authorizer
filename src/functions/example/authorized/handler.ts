import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { commonMiddleware } from '@utils';

/**
 * Private endpoint that requires authentication
 * When called with a valid Auth0 token, it will return the decoded token claims
 */
export const privateHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Auth0 user info is available in requestContext.authorizer
  const userContext = event.requestContext.authorizer || {};
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'This is a private endpoint that requires authentication',
      auth: {
        userId: userContext.sub || userContext.userId,
        scope: userContext.scope,
        email: userContext.email
      },
      event: {
        path: event.path,
        method: event.httpMethod,
        requestId: event.requestContext.requestId
      }
    }),
  };
};

export const main = commonMiddleware(privateHandler);