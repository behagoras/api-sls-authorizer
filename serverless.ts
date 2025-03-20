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

// Define AWS regions as a type
type AWSRegion = 'us-west-2' | 'us-east-1' | 'us-east-2' | 'us-west-1' | 'eu-west-1' | 'eu-west-2' | 'eu-central-1' | 'ap-northeast-1';

// Get region with type safety
const getRegion = (): AWSRegion => {
  const configuredRegion = process.env.AWS_REGION || 'us-west-2';
  // Validate region is one we support
  const validRegions: AWSRegion[] = ['us-west-2', 'us-east-1', 'us-east-2', 'us-west-1', 'eu-west-1', 'eu-west-2', 'eu-central-1', 'ap-northeast-1'];
  
  return validRegions.includes(configuredRegion as AWSRegion) 
    ? configuredRegion as AWSRegion
    : 'us-west-2'; // Default to us-west-2 if not valid
};

// Get profile based on environment - use psychologist for development
const getProfile = (): string => {
  console.log("🚀 ~ getProfile ~ AWS_PROFILE from env:", process.env.AWS_PROFILE);
  return process.env.AWS_PROFILE || 'default';
};

const serverlessConfiguration: AWS = {
  service: 'api-authorizer',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild'],
  provider: {
    profile: getProfile(), // Use psychologist for dev, env variable for prod
    name: 'aws',
    runtime: 'nodejs18.x',
    region: getRegion(),
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
    // Add logging configuration to prevent sensitive data logging
    logRetentionInDays: 14, // Shorter retention for logs with potential sensitive info
    tracing: {
      apiGateway: true,
      lambda: true,
    },
    // Add IAM statement for least privilege
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'logs:CreateLogGroup',
              'logs:CreateLogStream',
              'logs:PutLogEvents'
            ],
            Resource: 'arn:aws:logs:*:*:*'
          }
        ]
      }
    }
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
