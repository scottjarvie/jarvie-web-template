/**
 * Centralized Logging Package
 * 
 * This package provides structured logging functionality using Pino.
 * It includes consistent formatting, log levels, and context tracking.
 */

import pino, { stdTimeFunctions } from "pino";

/**
 * Logger configuration options
 */
interface LoggerOptions {
  /** Log level (trace, debug, info, warn, error, fatal) */
  level?: string;
  /** Enable pretty printing for development */
  prettyPrint?: boolean;
  /** Default name/component for this logger */
  name?: string;
  /** Whether to include request IDs in logs */
  trackRequestIds?: boolean;
}

/**
 * Request context for tracking IDs across log entries
 */
interface RequestContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
}

// Maintain a global request context
const requestContext: RequestContext = {};

/**
 * Set the current request context for logs
 * @param context Request-specific context values
 */
function setRequestContext(context: RequestContext) {
  Object.assign(requestContext, context);
}

/**
 * Clear the current request context
 */
function clearRequestContext() {
  Object.keys(requestContext).forEach(key => {
    delete requestContext[key as keyof RequestContext];
  });
}

/**
 * Create a configured Pino logger
 */
function createLogger({ 
  level = "info", 
  prettyPrint = process.env.NODE_ENV !== "production", 
  name = "app",
  trackRequestIds = true 
}: LoggerOptions = {}) {
  
  const options: pino.LoggerOptions = {
    level,
    name,
    formatters: {
      level: (label) => {
        return { level: label.toUpperCase() };
      },
      bindings: () => {
        // Include request context in all logs if tracking is enabled
        return trackRequestIds ? { ...requestContext } : {};
      },
    },
    timestamp: stdTimeFunctions.isoTime,
    // Don't log during tests unless explicitly enabled
    enabled: process.env.NODE_ENV !== "test" || process.env.ENABLE_LOGS === "true",
  };

  // For development, use pretty printing
  if (prettyPrint) {
    options.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    };
  }

  return pino(options);
}

/**
 * Default logger instance
 */
const logger = createLogger({
  prettyPrint: process.env.NODE_ENV !== "production",
  level: process.env.LOG_LEVEL || "info",
});

/**
 * Create a middleware for Hono that adds request ID tracking
 */
function createRequestLogger() {
  return async (c: any, next: () => Promise<void>) => {
    // Generate a unique ID for this request
    const requestId = crypto.randomUUID();
    
    // Set request context with ID and auth info if available
    setRequestContext({ 
      requestId,
      userId: c.get('userId') || undefined,
      sessionId: c.get('sessionId') || undefined,
    });
    
    // Add request ID to response headers
    c.res.headers.set('X-Request-ID', requestId);
    
    // Log the incoming request
    logger.info({
      msg: 'Incoming request',
      method: c.req.method,
      path: c.req.path,
      ip: c.req.header('x-forwarded-for') || c.req.header('CF-Connecting-IP') || 'unknown',
      userAgent: c.req.header('user-agent') || 'unknown',
    });
    
    const startTime = performance.now();
    
    try {
      // Process the request
      await next();
      
      // Calculate request duration
      const duration = Math.round(performance.now() - startTime);
      
      // Log the completed request
      logger.info({
        msg: 'Request completed',
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        duration: `${duration}ms`,
      });
    } catch (error) {
      // Calculate request duration
      const duration = Math.round(performance.now() - startTime);
      
      // Log the error
      logger.error({
        msg: 'Request error',
        method: c.req.method,
        path: c.req.path,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : String(error),
        duration: `${duration}ms`,
      });
      
      // Re-throw the error to be handled by error middleware
      throw error;
    } finally {
      // Clear request context after request is complete
      clearRequestContext();
    }
  };
}

export { 
  createLogger, 
  logger, 
  setRequestContext, 
  clearRequestContext,
  createRequestLogger,
  type RequestContext 
};
