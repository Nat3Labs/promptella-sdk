/**
 * Official TypeScript types for Promptella API SDK
 */

export interface SDKConfig {
  /** Your API key (sk_live_... or sk_test_...) */
  apiKey: string;
  /** Your Project ID (proj_...) */
  projectId: string;
  /** API base URL (optional, defaults to production) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
  /** Custom headers to include with requests */
  headers?: Record<string, string>;
}

export interface EnhancePromptOptions {
  /** Maximum number of suggestions to return (1-10, default: 5) */
  maxSuggestions?: number;
  /** Specific categories to focus on */
  categories?: ('clarity' | 'specificity' | 'context' | 'structure' | 'examples' | 'constraints')[];
  /** Include processing time in response (default: true) */
  includeProcessingTime?: boolean;
}

export interface EnhancementSuggestion {
  /** Enhanced version of the prompt */
  enhanced_prompt: string;
  /** Type of improvement made */
  improvement_type: string;
  /** Detailed explanation of the enhancement */
  explanation: string;
  /** Visual category for UI display */
  category: string;
}

export interface EnhancePromptResponse {
  /** The original prompt that was enhanced */
  original_prompt: string;
  /** Array of enhancement suggestions */
  suggestions: EnhancementSuggestion[];
  /** Processing time in milliseconds */
  processing_time_ms: number;
  /** Usage information */
  usage: {
    endpoint: string;
    project_id: string;
    timestamp: string;
  };
}

export interface RateLimitInfo {
  /** Requests remaining this minute */
  minutelyRemaining: number;
  /** Requests remaining this hour */
  hourlyRemaining: number;
  /** Requests remaining today */
  dailyRemaining: number;
  /** When limits reset */
  resetsAt: {
    minute: Date;
    hour: Date;
    day: Date;
  };
}

export interface APIError {
  /** Error message */
  error: string;
  /** Additional error details */
  details?: any;
  /** Rate limit information if applicable */
  limits?: RateLimitInfo;
}

export type Environment = 'production' | 'test';

/**
 * Events emitted by the SDK
 */
export interface SDKEvents {
  /** Emitted before each API request */
  'request': { url: string; method: string; headers: Record<string, string> };
  /** Emitted after successful API response */
  'response': { status: number; data: any; duration: number };
  /** Emitted when an error occurs */
  'error': { error: Error; duration?: number };
  /** Emitted when rate limited */
  'rateLimit': { limits: RateLimitInfo; retryAfter: number };
  /** Emitted during retry attempts */
  'retry': { attempt: number; maxAttempts: number; delay: number };
}

export type SDKEventName = keyof SDKEvents;
export type SDKEventHandler<T extends SDKEventName> = (data: SDKEvents[T]) => void;
