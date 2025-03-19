import { default as AuctionsTableResource } from './AuctionsTable';
import { 
  GatewayResponseDefault4XX, 
  GatewayResponseExpiredToken, 
  GatewayResponseUnauthorized 
} from './GatewayResponses';

const resources = {
  AuctionsTableResource,
  GatewayResponseDefault4XX,
  GatewayResponseExpiredToken,
  GatewayResponseUnauthorized,
};

export default resources;
export { 
  AuctionsTableResource,
  GatewayResponseDefault4XX,
  GatewayResponseExpiredToken,
  GatewayResponseUnauthorized,
};
