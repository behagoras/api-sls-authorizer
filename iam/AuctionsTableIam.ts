const AuctionsTableIam = {
  Effect: 'Allow',
  Action: [
    'dynamodb:PutItem',
    'dynamodb:GetItem',
    'dynamodb:Scan',
    'dynamodb:UpdateItem',
    'dynamodb:Query'
  ],
  Resource: [
    { "Fn::GetAtt": ["AuctionsTable", "Arn"] },
    {
      "Fn::Join": [
        "/",
        [
          { "Fn::GetAtt": ["AuctionsTable", "Arn"] },
          "index/*"
        ]
      ]
    }
  ]
};

export default AuctionsTableIam;