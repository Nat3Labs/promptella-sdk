import type { APIError, RateLimitInfo } from './types';

/**
 * Base class for all Promptella SDK errors
 */
export class PromptellaBadRequestError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, code: string, statusCode: number, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }

  static fromAPIError(apiError: APIError, statusCode: number): PromptellaBadRequestError {
    return new PromptellaBadRequestError(
      apiError.error,
      'API_ERROR',
      statusCode,
      apiError.details
    );
  }
}

/**
 * Thrown when API key is invalid or missing
 */
export class AuthenticationError extends PromptellaBadRequestError {
  constructor(message: string = 'Invalid API key or Project ID') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

/**
 * Thrown when rate limits are exceeded
 */
export class RateLimitError extends PromptellaBadRequestError {
  public readonly limits: RateLimitInfo;
  public readonly retryAfter: number;

  constructor(message: string, limits: RateLimitInfo, retryAfter: number = 60) {
    super(message, 'RATE_LIMIT_ERROR', 429, limits);
    this.limits = limits;
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown when request validation fails
 */
export class ValidationError extends PromptellaBadRequestError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

/**
 * Thrown when network or server errors occur
 */
export class NetworkError extends PromptellaBadRequestError {
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message, 'NETWORK_ERROR', statusCode, details);
  }
}

/**
 * Thrown when requests timeout
 */
export class TimeoutError extends PromptellaBadRequestError {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`, 'TIMEOUT_ERROR', 408);
  }
}

/**
 * Thrown when configuration is invalid
 */
export class ConfigurationError extends Error {
  public readonly name = 'ConfigurationError';

  constructor(message: string) {
    super(message);
  }
}

/**
 * Type guard to check if error is a Promptella SDK error
 */
export function isPromptellaBadRequestError(error: any): error is PromptellaBadRequestError {
  return error instanceof PromptellaBadRequestError;
}

/**
 * Create appropriate error from HTTP response
 */
export async function createErrorFromResponse(
  response: Response,
  requestStartTime: number
): Promise<PromptellaBadRequestError> {
  const duration = Date.now() - requestStartTime;
  
  try {
    const errorData: APIError = await response.json();
    
    switch (response.status) {
      case 401:
        return new AuthenticationError(errorData.error);
      case 429:
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
        return new RateLimitError(
          errorData.error,
          errorData.limits || {
            minutelyRemaining: 0,
            hourlyRemaining: 0,
            dailyRemaining: 0,
            resetsAt: {
              minute: new Date(Date.now() + 60000),
              hour: new Date(Date.now() + 3600000),
              day: new Date(Date.now() + 86400000),
            }
          },
          retryAfter
        );
      case 400:
        return new ValidationError(errorData.error, errorData.details);
      default:
        return new NetworkError(errorData.error, response.status, errorData.details);
    }
  } catch {
    // If response body is not JSON, create generic error
    const message = `HTTP ${response.status}: ${response.statusText}`;
    return new NetworkError(message, response.status);
  }
}
