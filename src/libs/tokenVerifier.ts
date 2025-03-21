import * as jwt from 'jsonwebtoken';
import { promisify } from 'util';
import https from 'https';

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
 * Fetches user information from Auth0 userinfo endpoint using the access token
 */
const fetchUserInfo = async (token: string): Promise<any> => {
  const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
  
  if (!AUTH0_DOMAIN) {
    throw new Error('Missing AUTH0_DOMAIN environment variable');
  }
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: AUTH0_DOMAIN,
      port: 443,
      path: '/userinfo',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const userInfo = JSON.parse(data);
            console.log('Successfully fetched user info from Auth0');
            resolve(userInfo);
          } catch (err) {
            reject(new Error('Failed to parse userinfo response'));
          }
        } else {
          reject(new Error(`Failed to fetch userinfo: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Error fetching userinfo:', error);
      reject(error);
    });
    
    req.end();
  });
};

/**
 * Extract user profile info (email, name) from token or userinfo endpoint
 * This centralizes all the profile extraction logic in one place
 */
const extractUserProfileInfo = async (
  decodedToken: DecodedToken, 
  token: string
): Promise<void> => {
  // DIRECT APPROACH: Get user info from Auth0 userinfo endpoint
  try {
    console.log('Getting user profile from Auth0 userinfo endpoint');
    const userInfo = await fetchUserInfo(token);
    
    if (userInfo.email) {
      decodedToken.email = userInfo.email;
    }
    
    if (userInfo.name) {
      decodedToken.name = userInfo.name;
    }
    
    // Use email as name if name is missing but email is present
    if (!decodedToken.name && decodedToken.email) {
      decodedToken.name = decodedToken.email;
    }
    
    console.log('User profile from userinfo endpoint:', {
      emailFound: !!decodedToken.email,
      nameFound: !!decodedToken.name
    });
  } catch (error) {
    console.log('Failed to get user info from Auth0:', error.message);
  }
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
    
    // Only log non-sensitive information about the token
    console.log('Token validation initiated for token issued to subject with ID ending in:', 
      decodedWithHeader.payload.sub ? `...${decodedWithHeader.payload.sub.slice(-6)}` : 'unknown');
    
    // Verify the token with proper audience check
    const decodedToken = await verifyPromise(token, cert, {
      // Enable proper audience validation
      audience: AUTH0_AUDIENCE,
      issuer: `https://${AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    });
    
    // Get user profile information from Auth0 userinfo endpoint
    await extractUserProfileInfo(decodedToken, token);
    
    // Manual audience check only if needed for arrays
    const tokenAud = decodedToken.aud;
    const expectedAud = AUTH0_AUDIENCE;
    
    const audIsValid = Array.isArray(tokenAud) 
      ? tokenAud.includes(expectedAud)
      : tokenAud === expectedAud;
    
    if (!audIsValid) {
      throw new Error('Token audience validation failed');
    }
    
    // Log minimal information
    console.log('Token verified successfully for user ID ending in:', 
      decodedToken.sub ? `...${decodedToken.sub.slice(-6)}` : 'unknown');
    
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