import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'PATCH',
        path: 'auction/{id}/bid',
        authorizer: {
          name: 'auth',
          type: 'token',
          identitySource: 'method.request.header.Authorization',
        },
        cors: true,
      },
    },
  ],
};