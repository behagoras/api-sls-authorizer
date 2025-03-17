import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import validator from "@middy/validator";
import type { APIGatewayProxyResult } from 'aws-lambda';
import createError from "http-errors";

import { APIGatewayTypedEvent } from '@types';
import { commonMiddleware, createNewAuctionItem } from '@utils';

import { CreateAuctionInputSchema, createAuctionInputSchema } from "./schemas";


export const placeBid = async (
  event: APIGatewayTypedEvent<CreateAuctionInputSchema>,
): Promise<APIGatewayProxyResult> => {
  const { title } = event.body;

  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const now = new Date();
  const endDate = new Date();
  endDate.setHours(now.getHours() + 1);

  const auction = createNewAuctionItem(title, now, endDate);

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

export const main = commonMiddleware(placeBid)
  .use(
    validator({
      inputSchema: createAuctionInputSchema,
      ajvOptions: {
        strict: false,
        useDefaults: true,
      }
    })
  );