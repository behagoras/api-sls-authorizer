import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import httpEventNormalizer from "@middy/http-event-normalizer";
import jsonBodyParser from "@middy/http-json-body-parser";
import httpResponseSerializer from "@middy/http-response-serializer";
import cors from "@middy/http-cors";
import { Handler } from "aws-lambda";

// Base middleware for all API endpoints
export const commonMiddleware = (handler: Handler) => middy(handler)
  .use([
    jsonBodyParser(),           // Parse JSON bodies
    httpEventNormalizer(),      // Normalize event structure
    httpErrorHandler(),         // Handle errors gracefully
    cors(),                     // Enable CORS for all endpoints
    httpResponseSerializer({    // Standardize response formatting
      serializers: [
        {
          regex: /^application\/json$/,
          serializer: ({ body }) => JSON.stringify(body)
        }
      ],
      defaultContentType: 'application/json'
    })
  ]);

// Auction-specific middleware
export const auctionMiddleware = (handler: Handler) => commonMiddleware(handler)
  .use([
    // Add auction-specific middleware here
    // Example: validation middleware
  ]);

// Bid-specific middleware
export const bidMiddleware = (handler: Handler) => commonMiddleware(handler)
  .use([
    // Add bid-specific middleware here
    // Example: validation middleware for bid inputs
  ]);

export default commonMiddleware; 