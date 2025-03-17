import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyResult } from 'aws-lambda';
import createError from "http-errors";

import { APIGatewayTypedEvent } from '@types';
import { commonMiddleware, createNewAuctionItem } from '@utils';
import { AuctionSchema } from "../auctionsSchema";


export const placeBid = async (
  event: APIGatewayTypedEvent<AuctionSchema>,
): Promise<APIGatewayProxyResult> => {
  const { title } = event.body;

  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const now = new Date();
  const auction = createNewAuctionItem(title, now);

  const command = new PutCommand({
    TableName: process.env.AUCTION_TABLE_NAME,
    Item: auction,
  });

  try {
    const response = await docClient.send(command);
    return {
      statusCode: 201,
      body: JSON.stringify(
        {
          auction,
          $metadata: response.$metadata
        }),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
};

export const main = commonMiddleware(placeBid);