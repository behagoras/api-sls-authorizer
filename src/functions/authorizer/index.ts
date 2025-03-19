import { handlerPath } from '@libs/handler-resolver';

const auth = {
  handler: `${handlerPath(__dirname)}/handler.handler`,
};

const authorizerFunctions = { auth };

export default authorizerFunctions;