import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import createError from "http-errors";

import { commonMiddleware, formatAuctionFromDynamo } from "@utils";


export const getAuctions = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  const command = new ScanCommand({
    TableName: process.env.AUCTION_TABLE_NAME,
  });

  try {
    const response = await docClient.send(command);
    const items = response.Items || [];

    // Format each auction item.
    const formattedAuctions = items.map((item: any) => (formatAuctionFromDynamo(item)));

    return {
      statusCode: 200,
      body: JSON.stringify({ auctions: formattedAuctions }),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
};

export const main = commonMiddleware(getAuctions);