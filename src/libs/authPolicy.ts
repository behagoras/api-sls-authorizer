import { APIGatewayAuthorizerResult } from 'aws-lambda';

/**
 * HTTP verb enum for use with AuthPolicy methods
 */
export enum HttpVerb {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  ALL = '*'
}

/**
 * AuthPolicy receives a set of allowed and denied methods and generates a valid
 * AWS policy for the API Gateway authorizer. The constructor receives the principal id
 * (user identifier) and the API options (region, account id, api id, and stage).
 * 
 * Based on the AWS Custom Authorizer example
 */
export class AuthPolicy {
  private readonly awsAccountId: string;
  private readonly principalId: string;
  private readonly version: string;
  private readonly pathRegex: RegExp;
  public readonly allowMethods: any[];
  private readonly denyMethods: any[];
  private readonly restApiId: string;
  private readonly region: string;
  private readonly stage: string;
  
  // Static reference to HttpVerb enum for external use
  static HttpVerb = HttpVerb;

  constructor(principal: string, awsAccountId: string, apiOptions: any) {
    this.principalId = principal;
    this.awsAccountId = awsAccountId;
    this.allowMethods = [];
    this.denyMethods = [];
    this.version = '2012-10-17';
    this.pathRegex = /^[/.a-zA-Z0-9-*]+$/;

    if (!apiOptions.region) {
      this.region = '*';
    } else {
      this.region = apiOptions.region;
    }
    
    if (!apiOptions.restApiId) {
      this.restApiId = '*';
    } else {
      this.restApiId = apiOptions.restApiId;
    }
    
    if (!apiOptions.stage) {
      this.stage = '*';
    } else {
      this.stage = apiOptions.stage;
    }
  }

  /**
   * Adds a method to the internal lists of allowed or denied methods.
   */
  private addMethod(effect: string, verb: string, resource: string, conditions?: any): void {
    if (verb !== '*' && !Object.values(HttpVerb).includes(verb as HttpVerb)) {
      throw new Error(`Invalid HTTP verb ${verb}. Allowed verbs are '*', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', and 'OPTIONS'.`);
    }

    if (!this.pathRegex.test(resource)) {
      throw new Error(`Invalid resource path: ${resource}. Path should match ${this.pathRegex}`);
    }

    let resourceArn = `arn:aws:execute-api:${this.region}:${this.awsAccountId}:${this.restApiId}/${this.stage}/${verb}/${resource}`;

    if (resource.substring(0, 1) === '/') {
      resourceArn = `arn:aws:execute-api:${this.region}:${this.awsAccountId}:${this.restApiId}/${this.stage}/${verb}${resource}`;
    }

    if (effect.toLowerCase() === 'allow') {
      this.allowMethods.push({
        resourceArn,
        conditions,
      });
    } else if (effect.toLowerCase() === 'deny') {
      this.denyMethods.push({
        resourceArn,
        conditions,
      });
    }
  }

  /**
   * Returns an empty statement object prepopulated with the correct action and the
   * desired effect.
   */
  private getEmptyStatement(effect: string): any {
    return {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: [],
    };
  }

  /**
   * This function loops over an array of objects containing a resourceArn and
   * conditions statement and generates the array of statements for the policy.
   */
  private getStatementsForEffect(effect: string, methods: any[]): any[] {
    const statements = [];

    if (methods.length > 0) {
      const statement = this.getEmptyStatement(effect);

      for (const method of methods) {
        if (method.conditions) {
          throw new Error('Conditions are not supported');
        }
        statement.Resource.push(method.resourceArn);
      }

      statements.push(statement);
    }

    return statements;
  }

  /**
   * Adds an allow '*' statement to the policy.
   */
  public allowAllMethods(): void {
    this.addMethod('Allow', '*', '*');
  }

  /**
   * Adds a deny '*' statement to the policy.
   */
  public denyAllMethods(): void {
    this.addMethod('Deny', '*', '*');
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
   * methods for the policy.
   */
  public allowMethod(verb: HttpVerb, resource: string): void {
    this.addMethod('Allow', verb, resource);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of denied
   * methods for the policy.
   */
  public denyMethod(verb: HttpVerb, resource: string): void {
    this.addMethod('Deny', verb, resource);
  }

  /**
   * Generates the policy document based on the internal lists of allowed and denied
   * methods. This will generate a policy with two main statements for the effect:
   * one statement for Allow and one statement for Deny.
   */
  public build(): APIGatewayAuthorizerResult {
    if ((!this.allowMethods || this.allowMethods.length === 0) &&
        (!this.denyMethods || this.denyMethods.length === 0)) {
      throw new Error('No statements defined for the policy');
    }

    const policy: any = {
      principalId: this.principalId,
      policyDocument: {
        Version: this.version,
        Statement: [
          ...this.getStatementsForEffect('Allow', this.allowMethods),
          ...this.getStatementsForEffect('Deny', this.denyMethods),
        ],
      },
      // Include additional context in the response
      context: {
        sub: this.principalId
      }
    };

    return policy;
  }
} 