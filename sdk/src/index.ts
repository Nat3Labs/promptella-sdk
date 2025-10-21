/**
 * @nation3labs/promptella-sdk - Official TypeScript SDK for Promptella API
 * 
 * @author Promptella Team
 * @version 1.0.0
 * @license MIT
 * 
 * @example Basic Usage
 * ```typescript
 * import { PromptellaSDK } from '@nation3labs/promptella-sdk';
 * 
 * const sdk = new PromptellaSDK({
 *   apiKey: 'sk_live_...',
 *   projectId: 'proj_...'
 * });
 * 
 * const result = await sdk.enhancePrompt('Make this prompt better');
 * console.log(result.suggestions);
 * ```
 * 
 * @example Error Handling
 * ```typescript
 * import { PromptellaSDK, RateLimitError, AuthenticationError } from '@nation3labs/promptella-sdk';
 * 
 * try {
 *   const result = await sdk.enhancePrompt('Your prompt');
 *   // Handle success
 * } catch (error) {
 *   if (error instanceof RateLimitError) {
 *     console.log(`Rate limited. Retry in ${error.retryAfter}s`);
 *   } else if (error instanceof AuthenticationError) {
 *     console.error('Invalid API key');
 *   }
 * }
 * ```
 */

// Main SDK class
export { PromptellaSDK } from './promptella-sdk';

// Import for internal use
import { PromptellaSDK } from './promptella-sdk';
import type { SDKConfig } from './types';

// Type definitions
export type {
  SDKConfig,
  EnhancePromptOptions,
  EnhancePromptResponse,
  EnhancementSuggestion,
  RateLimitInfo,
  APIError,
  Environment,
  SDKEvents,
  SDKEventName,
  SDKEventHandler,
} from './types';

// Error classes for specific error handling
export {
  PromptellaBadRequestError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NetworkError,
  TimeoutError,
  ConfigurationError,
  isPromptellaBadRequestError,
} from './errors';

// Default export for convenience
export default PromptellaSDK;

/**
 * SDK version information
 */
export const VERSION = '1.0.0';

/**
 * Quick start factory functions
 */
export const createSDK = (config: SDKConfig) => {
  return new PromptellaSDK(config);
};

export const createTestSDK = (
  apiKey: string,
  projectId: string,
  options?: Partial<Omit<SDKConfig, 'apiKey' | 'projectId'>>
) => {
  return PromptellaSDK.forTesting(apiKey, projectId, options);
};

export const createProductionSDK = (
  apiKey: string,
  projectId: string,
  options?: Partial<Omit<SDKConfig, 'apiKey' | 'projectId'>>
) => {
  return PromptellaSDK.forProduction(apiKey, projectId, options);
};
