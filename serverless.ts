import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';

// Load environment variables from .env.development
const stage = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${stage}` });

import { 
  GatewayResponseDefault4XX,
  GatewayResponseExpiredToken,
  GatewayResponseUnauthorized
} from './resources';

import { authorizerFunctions, exampleFunctions } from '@functions';

const serverlessConfiguration: AWS = {
  service: 'api-authorizer',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    profile: 'psychologist', // aws profile:
    name: 'aws',
    runtime: 'nodejs18.x',
    region: 'us-west-2',
    memorySize: 256,
    stage: '${opt:stage, "dev"}',
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      NODE_ENV: '${opt:stage, "development"}',
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '',
      AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || '',
      AUTH0_PUBLIC_KEY: process.env.AUTH0_PUBLIC_KEY || '',
    },
  },
  resources: {
    Resources: {
      // Gateway responses for CORS and authorization failures
      GatewayResponseDefault4XX,
      GatewayResponseExpiredToken,
      GatewayResponseUnauthorized
    },
    Outputs: {
      AuthorizerLambdaFunctionQualifiedArn: {
        Description: "Authorizer Lambda Function ARN",
        Value: { 
          "Fn::GetAtt": ["AuthLambdaFunction", "Arn"]
        },
        Export: {
          Name: "${self:service}-${self:provider.stage}-AuthorizerLambdaFunctionArn"
        }
      }
    }
  },
  configValidationMode: 'error',
  functions: {
    ...authorizerFunctions,
    ...exampleFunctions,  // Add example functions that include public and private endpoints
  },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node18',
      platform: 'node',
      concurrency: 10,

      external: [
        '@aws-sdk/client-dynamodb',
        '@aws-sdk/lib-dynamodb',
      ],
    },
    bundle: {
      linting: false,
    },
  },
};

module.exports = serverlessConfiguration;
