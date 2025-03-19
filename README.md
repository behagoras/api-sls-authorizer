# Auction Service with Reusable Auth0 Authorizer

This project serves a dual purpose:
1. A serverless auction service with complete CRUD operations
2. A reusable Auth0 JWT Authorizer that can be shared across multiple services

## Features

* Complete auction service with create, bid, and process functionality
* Reusable Auth0 JWT authorizer for API Gateway
* TypeScript implementation with proper typing
* DynamoDB for auction data storage
* Cross-service authorization capability
* Multi-environment deployment support

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Auth0

1. Create an Auth0 account and API at [auth0.com](https://auth0.com/)
2. Go to **APIs** > **Create API**
   - Name: "Auction API" (or your preferred name)
   - Identifier: Your API identifier (audience)
   - Signing Algorithm: RS256

### 3. Set Environment Variables

Create a `.env.development` file:

```
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
AUTH0_PUBLIC_KEY=-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----
```

Get your Auth0 public key from API settings > Signing Certificate.

### 4. Deploy

```bash
# Development deployment
npm run deploy

# Production deployment
npm run deploy:production
```

### 5. Test Protected Endpoints

```bash
# Example: Place a bid on an auction
curl -X PATCH https://your-api-id.execute-api.region.amazonaws.com/dev/auction/123/bid \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}'
```

## Auction Service Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | /auction | Create a new auction | Yes |
| GET | /auctions | Get all auctions | No |
| GET | /auction/{id} | Get auction by ID | No |
| PATCH | /auction/{id}/bid | Place a bid on an auction | Yes |

The system also includes a scheduled function that processes ended auctions automatically.

## Auth0 Authorizer

The Auth0 authorizer is designed to be reused across multiple services:

1. **Standalone deployment**: Deploy this project as a dedicated authorizer service
2. **Combined deployment**: Use both auction functionality and the authorizer
3. **Cross-reference**: Reference this authorizer from other services

## Project Structure

```
.
├── serverless.ts              # Serverless configuration
├── src/
│   ├── functions/
│   │   ├── authorizer/        # Auth0 authorizer function (reusable)
│   │   │   ├── handler.ts     # Token verification implementation
│   │   │   └── index.ts       # Function configuration
│   │   └── auction/           # Auction service functions
│   │       ├── create/        # Create auction endpoint
│   │       ├── getAll/        # Get all auctions endpoint
│   │       ├── getAuction/    # Get single auction endpoint
│   │       ├── bid/           # Place bid endpoint
│   │       └── processAuctions/ # Process ended auctions
│   └── libs/
│       ├── authPolicy.ts      # API Gateway policy generator
│       └── tokenVerifier.ts   # JWT verification logic
├── resources/                 # CloudFormation resources
└── iam/                       # IAM role definitions
```

## Protected vs Public Endpoints

To protect an endpoint, add the authorizer to its configuration:

```typescript
{
  http: {
    method: 'POST',
    path: 'path',
    authorizer: {
      name: 'auth',
      type: 'token',
      identitySource: 'method.request.header.Authorization',
    },
    cors: true
  }
}
```

## Using The Authorizer Across Services

Reference this authorizer from other services:

```yaml
authorizer: 
  arn: arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:auction-${self:provider.stage}-auth
```

## Troubleshooting

- **401 Unauthorized**: Check token validity
- **Missing Authentication Token**: Ensure `Authorization: Bearer YOUR_TOKEN` header is included
- **Invalid Token**: Verify audience and domain settings match Auth0 configuration
- **Invalid Bid**: Ensure bid amount is higher than current highest bid

## License

MIT

---

Based on [serverless/examples/aws-node-auth0-custom-authorizers-api](https://github.com/arielweinberger/serverless-auth0-authorizer) by Ariel Weinberger.
