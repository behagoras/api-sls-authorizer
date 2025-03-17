import { JSONSchema7 } from 'json-schema';

export const getAuctionsInputSchema: JSONSchema7 = {
  type: 'object',
  properties: {
    queryStringParameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['OPEN', 'CLOSED'],
          default: 'OPEN',
        },
      },
    },
  },
  required: ['queryStringParameters'],
};