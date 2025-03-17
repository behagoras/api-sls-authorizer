import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyResult } from 'aws-lambda';
import createError from "http-errors";

import { APIGatewayTypedEvent } from '@types';
import { commonMiddleware } from "@utils";
import { Auction, AuctionSchema } from "../auctionsSchema";

export const getAuctionById = async (id: string) => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);
  const command = new GetCommand({
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id },
  });
  try {
    const { Item: auction } = await docClient.send(command);
    if (!auction) {
      throw new createError.NotFound(`Auction with ID "${id}" not found.`);
    }
    return auction as Auction;
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
};

export const getAuction = async (
  event: APIGatewayTypedEvent<AuctionSchema, { id: string }>,
): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters.id;
    const auction = await getAuctionById(id);

    return {
      statusCode: 200,
      body: JSON.stringify({ auction }),
    };
  } catch (error) {
    if (error && (error as any).statusCode) throw error;
    throw new createError.InternalServerError(error);
  }
};

export const main = commonMiddleware(getAuction);