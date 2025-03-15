import { FromSchema } from 'json-schema-to-ts';

const schema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
  },
  required: ['name', 'lastName', 'email']
} as const;

export type AuctionSchema = FromSchema<typeof schema>;

export default schema;