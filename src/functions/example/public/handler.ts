import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { commonMiddleware } from "@utils";

/**
 * Public endpoint that doesn't require authentication
 */
export const publicHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'This is a public endpoint that anyone can access',
      event: {
        path: event.path,
        method: event.httpMethod,
        requestId: event.requestContext.requestId
      }
    }),
  };
};

export const main = commonMiddleware(publicHandler);