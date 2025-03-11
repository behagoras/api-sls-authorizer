import { auctionTableName } from '../src/constants';

const AuctionsTableResource = {
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

export default AuctionsTableResource;