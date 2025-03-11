import { auctionTableName } from "../src/constants";

const AuctionsTableIam = {
  Effect: 'Allow',
  Action: [
    's3:*',
    'cloudformation:*',
    'apigateway:*',
    'dynamodb:PutItem',
    'dynamodb:GetItem',
    'dynamodb:*',
  ],
  Resource: {
    "Fn::Sub": `arn:aws:dynamodb:\${AWS::Region}:\${AWS::AccountId}:table/${auctionTableName}`
  },
}

export default AuctionsTableIam;