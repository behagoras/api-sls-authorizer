/**
 * API Gateway Response resources for CORS and authorization failures
 */

export const GatewayResponseDefault4XX = {
  Type: 'AWS::ApiGateway::GatewayResponse',
  Properties: {
    ResponseParameters: {
      'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
      'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
    },
    ResponseType: 'DEFAULT_4XX',
    RestApiId: {
      Ref: 'ApiGatewayRestApi'
    }
  }
};

export const GatewayResponseExpiredToken = {
  Type: 'AWS::ApiGateway::GatewayResponse',
  Properties: {
    ResponseParameters: {
      'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
      'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
    },
    ResponseType: 'EXPIRED_TOKEN',
    RestApiId: {
      Ref: 'ApiGatewayRestApi'
    },
    StatusCode: '401'
  }
};

export const GatewayResponseUnauthorized = {
  Type: 'AWS::ApiGateway::GatewayResponse',
  Properties: {
    ResponseParameters: {
      'gatewayresponse.header.Access-Control-Allow-Origin': "'*'",
      'gatewayresponse.header.Access-Control-Allow-Headers': "'*'"
    },
    ResponseType: 'UNAUTHORIZED',
    RestApiId: {
      Ref: 'ApiGatewayRestApi'
    },
    StatusCode: '401'
  }
}; 