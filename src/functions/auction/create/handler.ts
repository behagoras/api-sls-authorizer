import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export const createAuction = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const { title } = JSON.parse(event.body);
  const now = new Date();

  const auction = {
    title,
    status: 'OPEN',
    createdAt: now,
  };
  return {
    statusCode: 201, // 201 - Created
    body: JSON.stringify(auction),
  };
};

export const main = createAuction;