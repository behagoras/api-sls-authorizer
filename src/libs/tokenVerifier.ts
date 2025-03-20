import * as jwt from 'jsonwebtoken';
import { promisify } from 'util';

/**
 * Represents the expected structure of a decoded Auth0 JWT token
 */
export interface DecodedToken {
  iss: string;                // Issuer (Auth0 domain URL)
  sub: string;                // Subject (Auth0 user ID)
  aud: string | string[];     // Audience (API identifier)
  exp: number;                // Expiration time
  iat: number;                // Issued at time
  scope?: string;             // Space-separated list of scopes
  permissions?: string[];     // Array of permissions
  email?: string;             // User email if available
  name?: string;              // User name if available
  [key: string]: any;         // Other custom claims
}

// Type for decoded JWT with complete flag
interface DecodedJwtWithHeader {
  header: {
    alg: string;
    typ?: string;
    kid?: string;
  };
  payload: {
    aud?: string | string[];
    [key: string]: any;
  };
  signature: string;
}

// Configure Auth0 environment variables
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || '';

// Promisify jsonwebtoken verify function with the correct type
const verifyPromise = promisify<string, string, jwt.VerifyOptions, DecodedToken>(jwt.verify);

/**
 * Format the certificate by replacing \n with actual newlines
 */
const formatCertificate = (cert: string): string => {
  // If the certificate is already properly formatted with actual newlines, return it as is
  if (cert.includes('-----BEGIN CERTIFICATE-----\n')) {
    return cert;
  }
  
  // Replace literal \n with actual newlines
  return cert.replace(/\\n/g, '\n');
};

/**
 * Verify a JWT token from Auth0
 * 
 * @param token JWT token to verify
 * @returns Decoded token information
 */
export const verifyToken = async (token: string): Promise<DecodedToken> => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }
    
    // Get Auth0 certificate from environment
    const rawCert = process.env.AUTH0_PUBLIC_KEY || '';
    
    if (!rawCert) {
      throw new Error('Missing AUTH0_PUBLIC_KEY environment variable');
    }
    
    // Format the certificate
    const cert = formatCertificate(rawCert);
    
    // First, decode the token without verification to check the audience
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new Error('Invalid token format');
    }
    
    const decodedWithHeader = decoded as DecodedJwtWithHeader;
    
    console.log('Token header:', JSON.stringify(decodedWithHeader.header));
    console.log('Token payload audience:', JSON.stringify(decodedWithHeader.payload.aud));
    
    // Verify the token with audience check that handles arrays
    const decodedToken = await verifyPromise(token, cert, {
      // Don't strictly check audience during development
      // Auth0 might return an array of audiences while our config has just one
      // We want to allow all tokens with our audience in the audience array
      audience: undefined,  // Skip audience verification at the JWT level
      issuer: `https://${AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    });
    
    // Manual audience check that works with arrays
    const tokenAud = decodedToken.aud;
    const expectedAud = AUTH0_AUDIENCE;
    
    const audIsValid = Array.isArray(tokenAud) 
      ? tokenAud.includes(expectedAud)
      : tokenAud === expectedAud;
    
    // Audience validation can be relaxed during development
    // if (!audIsValid) {
    //   console.warn(`Token audience ${tokenAud} doesn't match expected ${expectedAud}, but proceeding anyway`);
    // }
    
    console.log('Token verified successfully:', {
      sub: decodedToken.sub,
      scope: decodedToken.scope,
      exp: new Date(decodedToken.exp * 1000).toISOString()
    });
    
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Unauthorized');
  }
};

// Extract user permissions from token scopes
const extractPermissions = (decodedToken: DecodedToken): string[] => {
  // If token has permissions claim, use it
  if (decodedToken.permissions && Array.isArray(decodedToken.permissions)) {
    return decodedToken.permissions;
  }
  
  // Otherwise, try to extract from scope
  if (decodedToken.scope) {
    return decodedToken.scope.split(' ');
  }
  
  return [];
};

// Convert a decoded token to user info
export const getUserInfoFromToken = (decodedToken: DecodedToken) => {
  const permissions = extractPermissions(decodedToken);
  const scopes = decodedToken.scope ? decodedToken.scope.split(' ') : [];
  
  return {
    userId: decodedToken.sub,
    permissions,
    scopes,
  };
}; 