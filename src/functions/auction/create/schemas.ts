import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export const createAuctionInputSchema: JSONSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        title: { type: 'string' },
      },
      required: ['title'],
    },
  },
  required: ['body'],
};

export type CreateAuctionInputSchema = FromSchema<typeof createAuctionInputSchema>;
