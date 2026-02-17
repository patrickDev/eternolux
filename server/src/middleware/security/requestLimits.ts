// middleware/security/requestLimits.ts
import { Request, Response, NextFunction } from "express";

/**
 * Middleware: Limit request body size
 */
export const limitBodySize = (maxSizeInMB: number = 10) => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);

    if (contentLength > maxSizeInBytes) {
      return res.status(413).json({
        error: "Payload Too Large",
        message: `Request body exceeds ${maxSizeInMB}MB limit`,
        code: "BODY_TOO_LARGE",
      });
    }

    next();
  };
};

/**
 * Middleware: Validate Content-Type
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Skip for GET, HEAD, DELETE (no body)
    if (["GET", "HEAD", "DELETE"].includes(req.method)) {
      return next();
    }

    const contentType = req.headers["content-type"];

    if (!contentType) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Content-Type header required",
        code: "MISSING_CONTENT_TYPE",
      });
    }

    const isAllowed = allowedTypes.some(type => 
      contentType.toLowerCase().includes(type.toLowerCase())
    );

    if (!isAllowed) {
      return res.status(415).json({
        error: "Unsupported Media Type",
        message: `Content-Type must be one of: ${allowedTypes.join(", ")}`,
        code: "INVALID_CONTENT_TYPE",
        allowed: allowedTypes,
      });
    }

    next();
  };
};

/**
 * Middleware: Limit URL length
 */
export const limitUrlLength = (maxLength: number = 2048) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl || req.url;

    if (url.length > maxLength) {
      return res.status(414).json({
        error: "URI Too Long",
        message: `URL exceeds ${maxLength} characters`,
        code: "URL_TOO_LONG",
      });
    }

    next();
  };
};

/**
 * Middleware: Limit number of query parameters
 */
export const limitQueryParams = (maxParams: number = 50) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const paramCount = Object.keys(req.query).length;

    if (paramCount > maxParams) {
      return res.status(400).json({
        error: "Bad Request",
        message: `Too many query parameters (max ${maxParams})`,
        code: "TOO_MANY_PARAMS",
      });
    }

    next();
  };
};

/**
 * Middleware: Detect parameter pollution
 */
export const preventParameterPollution = (req: Request, res: Response, next: NextFunction) => {
  // Check for duplicate parameters (array values when not expected)
  const checkForArrays = (obj: any): boolean => {
    for (const key in obj) {
      if (Array.isArray(obj[key]) && obj[key].length > 10) {
        return true; // Suspicious: too many values for one param
      }
    }
    return false;
  };

  if (checkForArrays(req.query) || checkForArrays(req.body)) {
    return res.status(400).json({
      error: "Bad Request",
      message: "Parameter pollution detected",
      code: "PARAMETER_POLLUTION",
    });
  }

  next();
};

/**
 * Middleware: Validate request method
 */
export const allowedMethods = (methods: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!methods.includes(req.method)) {
      res.setHeader("Allow", methods.join(", "));
      return res.status(405).json({
        error: "Method Not Allowed",
        message: `Method ${req.method} not allowed`,
        code: "METHOD_NOT_ALLOWED",
        allowed: methods,
      });
    }

    next();
  };
};

/**
 * Middleware: Slow down repeated requests from same IP
 */
export const slowDown = (
  delayAfter: number = 5,
  delayMs: number = 500,
  maxDelayMs: number = 5000
) => {
  const requests = new Map<string, number>();

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const count = requests.get(ip) || 0;

    requests.set(ip, count + 1);

    // Cleanup old entries periodically
    if (Math.random() < 0.001) {
      requests.clear();
    }

    if (count > delayAfter) {
      const delay = Math.min(
        (count - delayAfter) * delayMs,
        maxDelayMs
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }

    next();
  };
};

/**
 * Middleware: Block suspicious user agents
 */
export const blockSuspiciousUserAgents = (req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers["user-agent"] || "";

  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scraper/i,
    /spider/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
    /^$/,  // Empty user agent
  ];

  // Allow legitimate bots (Googlebot, etc.)
  const allowedBots = [
    /googlebot/i,
    /bingbot/i,
  ];

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  const isAllowed = allowedBots.some(pattern => pattern.test(userAgent));

  if (isSuspicious && !isAllowed) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Automated requests not allowed",
      code: "BOT_DETECTED",
    });
  }

  next();
};

/**
 * Middleware: Validate request origin
 */
export const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || req.headers.referer;

  if (!origin) {
    // No origin header - could be legitimate (mobile apps, Postman)
    return next();
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:5173",
  ];

  const isAllowed = allowedOrigins.some(allowed => 
    origin.startsWith(allowed)
  );

  if (!isAllowed) {
    return res.status(403).json({
      error: "Forbidden",
      message: "Origin not allowed",
      code: "INVALID_ORIGIN",
    });
  }

  next();
};
