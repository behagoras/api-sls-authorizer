import { FromSchema, JSONSchema } from 'json-schema-to-ts';

export const placeBidInputSchema: JSONSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        amount: { type: 'number' },
      },
      required: ['amount'],
    },
  },
  required: ['body'],
};

export type PlaceBidInputSchema = FromSchema<typeof placeBidInputSchema>;
