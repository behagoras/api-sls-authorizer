import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyResult } from 'aws-lambda';
import createError from "http-errors";

import { APIGatewayTypedEvent } from '@types';
import { commonMiddleware } from '@utils';


export const placeBid = async (
  event: APIGatewayTypedEvent<{ amount: string }, { id: string }>,
): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const params: UpdateCommandInput = {
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id },
    UpdateExpression: 'set highestBid.amount = :amount',
    ExpressionAttributeValues: {
      ':amount': amount,
    },
    ReturnValues: 'ALL_NEW',
  }

  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);
  const command = new UpdateCommand(params);

  let updatedAuction;

  try {
    const response = await docClient.send(command);
    updatedAuction = response.Attributes;
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
};

export const main = commonMiddleware(placeBid);