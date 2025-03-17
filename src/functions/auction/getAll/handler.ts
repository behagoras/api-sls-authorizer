import { DynamoDBClient, ScanCommand, ScanCommandInput } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, QueryCommandInput } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import createError from "http-errors";

import { commonMiddleware, formatAuctionFromDynamo } from "@utils";

export const getAuctions = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { status } = event.queryStringParameters || {};

  const client = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(client);

  let command;
  if (status && status.trim() !== "") {
    const params: QueryCommandInput = {
      TableName: process.env.AUCTION_TABLE_NAME!,
      IndexName: "statusAndEndDate",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeValues: {
        ":status": status,
      },
      ExpressionAttributeNames: {
        "#status": "status",
      },
    };
    command = new QueryCommand(params);
  } else {
    const params: ScanCommandInput = {
      TableName: process.env.AUCTION_TABLE_NAME!,
    };
    command = new ScanCommand(params);
  }

  try {
    const response = (await docClient.send(command)) as { Items?: any[] };
    const items = response.Items || [];

    console.log("Auctions:", { items });

    const auctions = !status
      ? items.map((item) => formatAuctionFromDynamo(item))
      : items;

    return {
      statusCode: 200,
      body: JSON.stringify({ auctions }),
    };
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError(error);
  }
};

export const main = commonMiddleware(getAuctions);