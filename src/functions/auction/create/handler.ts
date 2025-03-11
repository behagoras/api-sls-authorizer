import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid';

export const createAuction = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const { title } = JSON.parse(event.body);

  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const now = new Date().toISOString();

  const auction = {
    id: uuid(),
    title,
    status: 'OPEN',
    createdAt: now,
  };

  const command = new PutCommand({
    TableName: process.env.AUCTION_TABLE_NAME,
    Item: auction,
  });

  const response = await docClient.send(command);

  return {
    statusCode: 201,
    body: JSON.stringify(
      {
        auction,
        $metadata: response.$metadata
      }),
  };
};

export const main = createAuction;