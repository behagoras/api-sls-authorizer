import * as jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Auth0DecodedToken } from '@types';

// Configure Auth0 environment variables
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || '';

// Promisify jsonwebtoken verify function with the correct type
const verifyPromise = promisify<string, string, jwt.VerifyOptions, Auth0DecodedToken>(jwt.verify);

// Format the certificate by replacing \n with actual newlines
const formatCertificate = (cert: string): string => {
  // If the certificate is already properly formatted with actual newlines, return it as is
  if (cert.includes('-----BEGIN CERTIFICATE-----\n')) {
    return cert;
  }
  
  // Replace literal \n with actual newlines
  return cert.replace(/\\n/g, '\n');
};

// Extract user permissions from token scopes
const extractPermissions = (decodedToken: Auth0DecodedToken): string[] => {
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

// Verify JWT token from Auth0
export const verifyToken = async (token: string): Promise<Auth0DecodedToken> => {
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
    
    // Verify the token
    const decodedToken = await verifyPromise(token, cert, {
      audience: AUTH0_AUDIENCE,
      issuer: `https://${AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    });
    
    return decodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Unauthorized');
  }
};

// Convert a decoded token to user info
export const getUserInfoFromToken = (decodedToken: Auth0DecodedToken) => {
  const permissions = extractPermissions(decodedToken);
  const scopes = decodedToken.scope ? decodedToken.scope.split(' ') : [];
  
  return {
    userId: decodedToken.sub,
    permissions,
    scopes,
  };
}; 