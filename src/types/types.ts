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

// Auth0 types
export interface Auth0DecodedToken {
  iss: string;                // Issuer (Auth0 domain URL)
  sub: string;                // Subject (Auth0 user ID)
  aud: string | string[];     // Audience (API identifier)
  exp: number;                // Expiration time
  iat: number;                // Issued at time
  scope?: string;             // Space-separated list of scopes
  permissions?: string[];     // Array of permissions
  gty?: string;               // Grant type
  email?: string;             // User email if available
  name?: string;              // User name if available
  [key: string]: any;         // Other custom claims
}

export interface Auth0UserInfo {
  userId: string;
  permissions: string[];
  scopes: string[];
}

export enum Permission {
  ReadAuctions = 'read:auctions',
  WriteAuctions = 'write:auctions',
  CreateAuctions = 'create:auctions',
  PlaceBids = 'place:bids',
}