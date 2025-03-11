import type { AWS } from '@serverless/typescript';

import { auctionFunctions } from '@functions/index'
import { auctionTableName } from '@constants'

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
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              's3:*',
              'cloudformation:*',
              'apigateway:*',
              'dynamodb:PutItem',
              'dynamodb:GetItem',
              'dynamodb:*',
            ],
            Resource: 'arn:aws:dynamodb:us-west-2:619071311902:table/AuctionsTable',
          }
        ]
      },
    },
  },
  resources: {
    Resources: {
      AuctionsTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          TableName: auctionTableName,
          BillingMode: 'PAY_PER_REQUEST',
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S'
            }
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH'
            }
          ]
        }
      }
    }
  },
  configValidationMode: 'error',
  functions: {
    ...auctionFunctions,
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
    }

  },
};

module.exports = serverlessConfiguration;
