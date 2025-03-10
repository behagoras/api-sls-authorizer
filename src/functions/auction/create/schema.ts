export default {
  type: 'object',
  properties: {
    name: { type: 'string' },
    lastName: { type: 'string' },
    email: { type: 'string' },
  },
  required: ['name', 'lastName', 'email']
} as const;