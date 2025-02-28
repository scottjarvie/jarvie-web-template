/**
 * Error handling middleware for API routes
 * 
 * This middleware provides consistent error handling and formatting for API routes.
 * It catches errors, logs them with appropriate context, and returns standardized responses.
 */

import { logger } from "@repo/logs";
import type { MiddlewareHandler, Context } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * Standard error response format
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    status: number;
    details?: unknown;
  };
}

/**
 * Creates an error handling middleware
 * @returns Hono middleware function
 */
export const errorHandler = (): MiddlewareHandler => {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (err) {
      // Default values
      let message = "An unexpected error occurred";
      let status = 500;
      let code = "INTERNAL_SERVER_ERROR";
      let details: unknown = undefined;

      // Extract error information based on error type
      if (err instanceof HTTPException) {
        status = err.status;
        message = err.message;
        
        // Map HTTP status codes to error codes
        switch (status) {
          case 400: code = "BAD_REQUEST"; break;
          case 401: code = "UNAUTHORIZED"; break;
          case 403: code = "FORBIDDEN"; break;
          case 404: code = "NOT_FOUND"; break;
          case 409: code = "CONFLICT"; break;
          case 422: code = "VALIDATION_ERROR"; break;
          case 429: code = "RATE_LIMITED"; break;
          default: 
            if (status >= 400 && status < 500) {
              code = "CLIENT_ERROR";
            } else {
              code = "SERVER_ERROR";
            }
        }

        // Extract additional details if available
        if (err.getResponse) {
          try {
            const errJson = await err.getResponse().json();
            if (errJson.details) {
              details = errJson.details;
            }
          } catch (e) {
            // Ignore JSON parsing errors
          }
        }
      } else if (err instanceof Error) {
        message = err.message;
        
        // Extract error code from custom errors
        if ('code' in err && typeof (err as any).code === 'string') {
          code = (err as any).code;
        }
        
        // Extract status from custom errors
        if ('status' in err && typeof (err as any).status === 'number') {
          status = (err as any).status;
        }
        
        // Extract details from custom errors
        if ('details' in err) {
          details = (err as any).details;
        }
        
        // Check for validation errors
        if (err.name === "ValidationError") {
          status = 400;
          code = "VALIDATION_ERROR";
        }
      }

      // Log the error with contextual information
      logger.error({
        msg: "API error",
        path: c.req.path,
        method: c.req.method,
        status,
        code,
        error: err instanceof Error ? {
          name: err.name,
          message: err.message,
          stack: err.stack
        } : String(err),
        details
      });

      // Create standardized error response
      const errorResponse: ErrorResponse = {
        success: false,
        error: {
          message,
          code,
          status,
        }
      };

      // Include details in development mode
      if (details && process.env.NODE_ENV !== "production") {
        errorResponse.error.details = details;
      }

      // Return JSON response with appropriate status code
      return c.json(errorResponse, status);
    }
  };
};
