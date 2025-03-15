import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuid } from 'uuid';

import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import createError from "http-errors";

import { APIGatewayTypedEvent } from '@types';
import { AuctionSchema } from "./schema";


export const createAuction = async (
  event: APIGatewayTypedEvent<AuctionSchema>,
): Promise<APIGatewayProxyResult> => {
  const { title } = event.body;

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
    throw new createError.InternalServerError(error);
  }
};

export const main = middy(createAuction)
  .use(jsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());