import { AuthPolicy } from '@libs/authPolicy';

export enum Permission {
  ReadResources = 'read:resources',
  CreateResources = 'create:resources',
  UpdateResources = 'update:resources',
  DeleteResources = 'delete:resources',
}

/**
 * HTTP verbs supported by API Gateway
 */
export enum HttpVerb {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  ALL = '*',
}

/**
 * Resource path and HTTP method combination
 */
export interface ResourceMethod {
  method: HttpVerb;
  path: string;
}

/**
 * Default permission mappings for common REST operations
 */
export const DEFAULT_PERMISSION_MAPPINGS: Record<string, ResourceMethod[]> = {
  [Permission.ReadResources]: [
    { method: HttpVerb.GET, path: '/resources' },
    { method: HttpVerb.GET, path: '/resource/*' },
    { method: HttpVerb.GET, path: '/auctions' },
    { method: HttpVerb.GET, path: '/auction/*' },
  ],
  [Permission.CreateResources]: [
    { method: HttpVerb.POST, path: '/resource' },
    { method: HttpVerb.POST, path: '/auction' },
  ],
  [Permission.UpdateResources]: [
    { method: HttpVerb.PUT, path: '/resource/*' },
    { method: HttpVerb.PATCH, path: '/resource/*' },
    { method: HttpVerb.PATCH, path: '/auction/*/bid' },
  ],
  [Permission.DeleteResources]: [
    { method: HttpVerb.DELETE, path: '/resource/*' },
  ],
};

/**
 * Flexible and chainable API Gateway policy builder
 */
export class PolicyBuilder {
  private policy: AuthPolicy;
  private hasExplicitPermissions: boolean = false;

  /**
   * Creates a new PolicyBuilder instance
   * 
   * @param userId User identifier
   * @param methodArn API Gateway method ARN
   */
  constructor(userId: string, methodArn: string) {
    // Extract the API ID, stage, and region from the methodArn
    const arnParts = methodArn.split(':');
    const awsAccountId = arnParts[4];
    
    // Create a new policy for this user
    this.policy = new AuthPolicy(userId, awsAccountId, {
      region: arnParts[3],
      restApiId: arnParts[5].split('/')[0],
      stage: arnParts[5].split('/')[1]
    });
  }

  /**
   * Allow access to all methods and resources
   */
  allowAll(): PolicyBuilder {
    this.policy.allowAllMethods();
    this.hasExplicitPermissions = true;
    return this;
  }

  /**
   * Explicitly deny access to all methods and resources
   */
  denyAll(): PolicyBuilder {
    this.policy.denyAllMethods();
    this.hasExplicitPermissions = true;
    return this;
  }

  /**
   * Allow access to a specific method and resource path
   */
  allowMethod(method: HttpVerb, path: string): PolicyBuilder {
    this.policy.allowMethod(method, path);
    this.hasExplicitPermissions = true;
    return this;
  }

  /**
   * Deny access to a specific method and resource path
   */
  denyMethod(method: HttpVerb, path: string): PolicyBuilder {
    this.policy.denyMethod(method, path);
    this.hasExplicitPermissions = true;
    return this;
  }

  /**
   * Apply permissions based on scopes/permissions from the token
   */
  applyPermissions(
    permissions: string[], 
    mappings: Record<string, ResourceMethod[]> = DEFAULT_PERMISSION_MAPPINGS
  ): PolicyBuilder {
    for (const permission of permissions) {
      const resourceMethods = mappings[permission];
      if (resourceMethods) {
        for (const { method, path } of resourceMethods) {
          this.allowMethod(method, path);
        }
      }
    }
    
    // If there are any permissions at all, we'll also allow all methods by default
    // This is a fallback to ensure basic functionality during development
    if (permissions.length > 0) {
      this.allowAll();
    }
    
    return this;
  }

  /**
   * Allow default minimal access (typically for health checks or auth tests)
   */
  allowMinimalAccess(): PolicyBuilder {
    this.allowMethod(HttpVerb.GET, '/health');
    this.allowMethod(HttpVerb.GET, '/hello');
    return this;
  }

  /**
   * Build the policy and ensure it has at least minimal permissions if none were set
   */
  build(): ReturnType<AuthPolicy['build']> {
    // If no explicit permissions were set, provide minimal access
    if (!this.hasExplicitPermissions) {
      this.allowMinimalAccess();
    }
    
    return this.policy.build();
  }

  /**
   * Create a policy with context that includes user information
   */
  buildWithContext(context: Record<string, any>): ReturnType<AuthPolicy['build']> {
    const response = this.build();
    response.context = context;
    return response;
  }
}

/**
 * Create a new PolicyBuilder instance (convenience function)
 */
export const createPolicyBuilder = (userId: string, methodArn: string): PolicyBuilder => {
  return new PolicyBuilder(userId, methodArn);
}; 