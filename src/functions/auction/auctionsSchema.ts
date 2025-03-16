import { FromSchema } from 'json-schema-to-ts';

const schema = {
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
} as const;

export type AuctionSchema = FromSchema<typeof schema>;

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

export default schema;