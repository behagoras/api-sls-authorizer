import type { AWS } from '@serverless/typescript';
import * as dotenv from 'dotenv';

// Load environment variables from .env.development
const stage = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${stage}` });

import { AuctionsTableIam } from './iam';
import { 
  AuctionsTableResource, 
  GatewayResponseDefault4XX,
  GatewayResponseExpiredToken,
  GatewayResponseUnauthorized
} from './resources';

import { auctionFunctions, authorizerFunctions } from '@functions';

const serverlessConfiguration: AWS = {
  service: 'auction',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
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
      AUCTION_TABLE_NAME: '${self:custom.AuctionsTable.tableName}',
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '',
      AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || '',
      AUTH0_PUBLIC_KEY: process.env.AUTH0_PUBLIC_KEY || '',
    },
    iam: {
      role: {
        statements: [
          AuctionsTableIam,
        ]
      },
    },
  },
  resources: {
    Resources: {
      AuctionsTable: AuctionsTableResource,
      // Gateway responses for CORS and authorization failures
      GatewayResponseDefault4XX,
      GatewayResponseExpiredToken,
      GatewayResponseUnauthorized
    }
  },
  configValidationMode: 'error',
  functions: {
    ...auctionFunctions,
    ...authorizerFunctions,
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
    AuctionsTable: {
      tableName: "AuctionsTable-${self:provider.stage}",
      arn: {
        "Fn::Sub": `arn:aws:dynamodb:\${AWS::Region}:\${AWS::AccountId}:table/\${self:custom.AuctionsTable.tableName}`,
      },
    },
  },
};

module.exports = serverlessConfiguration;
