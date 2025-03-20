import { FromSchema, JSONSchema } from 'json-schema-to-ts';

// We don't need complex schemas for our example endpoints
export const privateRequestSchema: JSONSchema = {
  type: 'object',
  properties: {
    // No specific properties required for the private endpoint
  },
};

export type PrivateRequestSchema = FromSchema<typeof privateRequestSchema>;
