# API Gateway Authorizer

This project provides a reusable API Gateway authorizer for API authentication using Auth0. It can be deployed as a standalone service and imported into other Serverless applications.

## Features

- Token-based authentication using Auth0
- Role-based access control for API endpoints
- JWT token validation and verification
- Flexible policy generation with chainable methods
- Custom policy generation based on user permissions

## Prerequisites

- Node.js 18.x or later
- Serverless Framework 3.x
- AWS CLI configured with appropriate credentials
- Auth0 account and configured application

## Environment Variables

Copy `.env.development.example` to `.env.development` and fill in your Auth0 credentials:

```
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=your-api-identifier
AUTH0_PUBLIC_KEY=your-auth0-public-key
```

⚠️ **Security Note**: NEVER commit `.env.development` or other environment files with real credentials to the repository. These files are listed in `.gitignore` and should remain only on your local development environment.

## Deployment

```bash
# Install dependencies
npm install

# Deploy to AWS (default stage: dev)
serverless deploy

# Deploy to a specific stage
serverless deploy --stage production
```

## Usage

After deployment, the authorizer can be referenced in other Serverless projects:

```yaml
# In your API's serverless.yml
provider:
  apiGateway:
    authorizers:
      auth0Authorizer:
        type: token
        name: auth0Authorizer
        arn:
          'Fn::ImportValue': 'auction-authorizer-${self:provider.stage}-AuthorizerLambdaFunctionQualifiedArn'
        identitySource: method.request.header.Authorization
        resultTtlInSeconds: 0

functions:
  yourFunction:
    handler: src/yourHandler.handler
    events:
      - http:
          path: your-endpoint
          method: get
          authorizer: auth0Authorizer
```

## Local Development

```bash
# Start offline mode for local testing
serverless offline
```

## Architecture

The authorizer works by:

1. Receiving the JWT token from the Authorization header
2. Verifying the token's signature and expiration
3. Extracting user permissions from the token
4. Generating an IAM policy based on those permissions
5. Returning the policy to API Gateway for enforcement

## Permissions

The authorizer supports the following permissions:

- `read:auctions` - Allows viewing auction listings
- `create:auctions` - Allows creating new auctions
- `place:bids` - Allows placing bids on auctions

## License

MIT
