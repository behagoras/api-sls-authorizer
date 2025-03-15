import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";

import createError from "http-errors";


export const getAuctions = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);


  const command = new ScanCommand({
    TableName: process.env.AUCTION_TABLE_NAME,
  });

  try {
    const response = await docClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(
        { auctions: response.Items }),
    };
  } catch (error) {
    throw new createError.InternalServerError(error);
  }
};

export const main = middy(getAuctions)
  .use(jsonBodyParser())
  .use(httpEventNormalizer())
  .use(httpErrorHandler());