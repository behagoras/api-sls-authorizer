import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyResult } from 'aws-lambda';
import createError from "http-errors";

import { APIGatewayTypedEvent } from '@types';
import { commonMiddleware } from '@utils';
import { getAuctionById } from "../getAuction/handler";


export const processAuctions = async (
  event: APIGatewayTypedEvent<{}, {}>,
  context,
): Promise<void> => {
  console.log('Processing auctions...');
};

export const main = processAuctions;