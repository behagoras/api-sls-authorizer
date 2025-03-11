const AuctionsTableIam = {
  Effect: 'Allow',
  Action: [
    'dynamodb:PutItem',
    'dynamodb:GetItem',
  ],
  Resource: '${self:custom.AuctionsTable.arn}',
}

export default AuctionsTableIam;