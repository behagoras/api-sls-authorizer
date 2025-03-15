const AuctionsTableIam = {
  Effect: 'Allow',
  Action: [
    'dynamodb:PutItem',
    'dynamodb:GetItem',
    'dynamodb:Scan',
  ],
  Resource: '${self:custom.AuctionsTable.arn}',
}

export default AuctionsTableIam;