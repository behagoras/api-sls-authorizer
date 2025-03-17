import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export const auctionSchema: JSONSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    status: { type: 'string' },
    name: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
    title: { type: 'string' },
    createdAt: { type: 'string' },
    endingAt: { type: 'string' },
    highestBid: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
        bidder: { type: ['string', 'null'] },
      },
    },
  },
  required: ['name', 'lastName', 'email', 'status']
};

export type AuctionSchema = FromSchema<typeof auctionSchema>;

export const getAuctionSchema: JSONSchema = {
  type: 'object',
  properties: {
    pathParameters: {
      type: 'object',
      properties: {
        id: { type: 'string' },
      },
      required: ['id'],
    },
  },
  required: ['pathParameters'],
};