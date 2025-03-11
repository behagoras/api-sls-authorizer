const AuctionsTableResource = {
  Type: 'AWS::DynamoDB::Table',
  Properties: {
    TableName: '${self:custom.AuctionsTable.tableName}',
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