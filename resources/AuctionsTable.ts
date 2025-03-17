import type { AWS } from '@serverless/typescript'

type CloudFormationResource = NonNullable<AWS['resources']>['Resources'][string];

const AuctionsTableResource: CloudFormationResource = {
  Type: 'AWS::DynamoDB::Table',
  Properties: {
    TableName: '${self:custom.AuctionsTable.tableName}',
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      {
        AttributeName: 'id',
        AttributeType: 'S'
      },
      {
        AttributeName: 'status',
        AttributeType: 'S'
      },
      {
        AttributeName: 'endingAt',
        AttributeType: 'S'
      },
    ],
    KeySchema: [
      {
        AttributeName: 'id',
        KeyType: 'HASH'
      }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'statusAndEndDate',
        KeySchema: [
          {
            AttributeName: 'status',
            KeyType: 'HASH'
          },
          {
            AttributeName: 'endingAt',
            KeyType: 'RANGE'
          }
        ],
        Projection: {
          ProjectionType: 'ALL'
        }
      }
    ],
  }
}

export default AuctionsTableResource;