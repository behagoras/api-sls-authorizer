import { APIGatewayProxyEvent } from "aws-lambda";

export type APIGatewayTypedEvent<T={}, P = {}> = Omit<APIGatewayProxyEvent, "body"> & { body: T, pathParameters: P };

export enum AUCTION_STATUS {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export type Auction = {
  id: string;
  title: string;
  status: AUCTION_STATUS;
  createdAt: string;
  endingAt: string;
  highestBid: {
    amount: number;
    bidder: string | null;
  };
};