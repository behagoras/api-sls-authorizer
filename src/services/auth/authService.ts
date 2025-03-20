import { Auth0DecodedToken, Auth0UserInfo, Permission } from '@types';
import { verifyToken, getUserInfoFromToken } from '@libs/tokenVerifier';

/**
 * AuthService provides functions for authentication and authorization
 */
export class AuthService {
  /**
   * Verifies a JWT token and returns decoded user information
   * 
   * @param token JWT token to verify
   * @returns Decoded token with user information
   */
  public static async verifyUserToken(token: string): Promise<Auth0DecodedToken> {
    if (!token) {
      throw new Error('Token is required');
    }
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    return await verifyToken(cleanToken);
  }
  
  /**
   * Gets user information from decoded token
   * 
   * @param token Decoded Auth0 token
   * @returns User information with permissions
   */
  public static getUserInfo(token: Auth0DecodedToken): Auth0UserInfo {
    return getUserInfoFromToken(token);
  }
  
  /**
   * Checks if a user has a specific permission
   * 
   * @param userInfo User information with permissions
   * @param permission Permission to check
   * @returns true if user has permission, false otherwise
   */
  public static hasPermission(userInfo: Auth0UserInfo, permission: Permission): boolean {
    return userInfo.permissions.includes(permission);
  }
  
  /**
   * Gets API Gateway policy context with user information
   * 
   * @param token Decoded token
   * @returns Context object for API Gateway
   */
  public static getApiGatewayContext(token: Auth0DecodedToken): Record<string, any> {
    return {
      userId: token.sub,
      scope: token.scope || '',
      email: token.email,
      name: token.name,
      isAdmin: token.permissions?.includes('admin:all') || false
    };
  }
} 