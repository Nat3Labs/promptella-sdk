import type {
  SDKConfig,
  EnhancePromptOptions,
  EnhancePromptResponse,
  Environment,
  SDKEventName,
  SDKEventHandler,
} from './types';
import { HttpClient } from './http-client';
import { ValidationError, ConfigurationError } from './errors';

/**
 * Official Promptella SDK for TypeScript/JavaScript
 * 
 * @example
 * ```typescript
 * const sdk = new PromptellaSDK({
 *   apiKey: 'sk_live_your_api_key_here',
 *   projectId: 'proj_...'
 * });
 * 
 * const result = await sdk.enhancePrompt('Make this better');
 * console.log(result.suggestions);
 * ```
 */
export class PromptellaSDK {
  private readonly httpClient: HttpClient;
  private readonly isTest: boolean;

  constructor(config: SDKConfig) {
    this.validateConfig(config);
    this.httpClient = new HttpClient(config);
    this.isTest = config.apiKey.startsWith('sk_test_');
  }

  /**
   * Validate SDK configuration
   */
  private validateConfig(config: SDKConfig): void {
    if (!config.apiKey) {
      throw new ConfigurationError('API key is required');
    }

    if (!config.apiKey.match(/^sk_(live|test)_[a-zA-Z0-9]{32}$/)) {
      throw new ConfigurationError('Invalid API key format. Must be sk_live_xxx or sk_test_xxx');
    }

    if (!config.projectId) {
      throw new ConfigurationError('Project ID is required');
    }

    if (!config.projectId.match(/^proj_[a-zA-Z0-9]{24}$/)) {
      throw new ConfigurationError('Invalid Project ID format. Must be proj_xxx');
    }

    if (config.timeout && (config.timeout < 1000 || config.timeout > 300000)) {
      throw new ConfigurationError('Timeout must be between 1000ms and 300000ms (5 minutes)');
    }
  }

  /**
   * Enhance a prompt using AI analysis
   * 
   * @param prompt The prompt text to enhance (max 5000 characters)
   * @param options Additional options for the enhancement
   * @returns Enhanced prompt with suggestions and analysis
   * 
   * @example
   * ```typescript
   * const result = await sdk.enhancePrompt('Write a blog post about AI', {
   *   maxSuggestions: 3,
   *   categories: ['clarity', 'specificity']
   * });
   * 
   * result.suggestions.forEach(suggestion => {
   *   console.log('Enhanced:', suggestion.enhanced_prompt);
   *   console.log('Explanation:', suggestion.explanation);
   * });
   * ```
   */
  async enhancePrompt(
    prompt: string,
    options: EnhancePromptOptions = {}
  ): Promise<EnhancePromptResponse> {
    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      throw new ValidationError('Prompt must be a non-empty string');
    }

    if (prompt.length > 5000) {
      throw new ValidationError('Prompt cannot exceed 5000 characters');
    }

    if (prompt.trim().length === 0) {
      throw new ValidationError('Prompt cannot be empty or only whitespace');
    }

    // Validate options
    if (options.maxSuggestions && (options.maxSuggestions < 1 || options.maxSuggestions > 10)) {
      throw new ValidationError('maxSuggestions must be between 1 and 10');
    }

    if (options.categories) {
      const validCategories = ['clarity', 'specificity', 'context', 'structure', 'examples', 'constraints'];
      const invalidCategories = options.categories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        throw new ValidationError(`Invalid categories: ${invalidCategories.join(', ')}. Valid categories: ${validCategories.join(', ')}`);
      }
    }

    // Prepare request body
    const requestBody: { prompt: string } = {
      prompt: prompt.trim(),
    };

    // Make API request
    const response = await this.httpClient.request<EnhancePromptResponse>(
      'POST',
      '/api/v1/enhance-prompt',
      requestBody,
      {
        retries: 3,
        retryDelay: 1000,
      }
    );

    return response;
  }

  /**
   * Test API connectivity and authentication
   * 
   * @returns Promise that resolves if connection is successful
   * 
   * @example
   * ```typescript
   * try {
   *   await sdk.testConnection();
   *   console.log('API connection successful!');
   * } catch (error) {
   *   console.error('API connection failed:', error.message);
   * }
   * ```
   */
  async testConnection(): Promise<{ 
    status: 'connected'; 
    environment: Environment;
    timestamp: string;
  }> {
    const response = await this.httpClient.request<{
      message: string;
      timestamp: string;
      request_count: number;
    }>(
      'POST',
      '/api/v1/test-rate-limit',
      {},
      { retries: 1 }
    );

    return {
      status: 'connected',
      environment: this.isTest ? 'test' : 'production',
      timestamp: response.timestamp,
    };
  }

  /**
   * Add event listener for SDK events
   * 
   * @param event Event name to listen for
   * @param handler Event handler function
   * 
   * @example
   * ```typescript
   * sdk.on('request', ({ url, method }) => {
   *   console.log(`Making ${method} request to ${url}`);
   * });
   * 
   * sdk.on('error', ({ error, duration }) => {
   *   console.error(`Request failed after ${duration}ms:`, error.message);
   * });
   * 
   * sdk.on('rateLimit', ({ retryAfter }) => {
   *   console.warn(`Rate limited. Retrying in ${retryAfter}s`);
   * });
   * ```
   */
  on<T extends SDKEventName>(event: T, handler: SDKEventHandler<T>): void {
    this.httpClient.on(event, handler);
  }

  /**
   * Remove event listener
   * 
   * @param event Event name
   * @param handler Event handler to remove
   */
  off<T extends SDKEventName>(event: T, handler: SDKEventHandler<T>): void {
    this.httpClient.off(event, handler);
  }

  /**
   * Cancel all pending requests
   * 
   * Useful for cleanup when component unmounts or user navigates away
   * 
   * @example
   * ```typescript
   * // In React component cleanup
   * useEffect(() => {
   *   return () => {
   *     sdk.cancel();
   *   };
   * }, []);
   * ```
   */
  cancel(): void {
    this.httpClient.cancel();
  }

  /**
   * Get current SDK configuration
   * 
   * @returns Read-only configuration object
   */
  getConfig(): Readonly<{
    environment: Environment;
    baseUrl: string;
    timeout: number;
    debug: boolean;
  }> {
    const config = this.httpClient.getConfig();
    return {
      environment: this.isTest ? 'test' : 'production',
      baseUrl: config.baseUrl,
      timeout: config.timeout,
      debug: config.debug,
    };
  }

  /**
   * Get SDK version
   */
  static getVersion(): string {
    return '1.0.0';
  }

  /**
   * Create SDK instance with test environment defaults
   * 
   * @param apiKey Test API key (sk_test_...)
   * @param projectId Project ID
   * @param options Additional configuration options
   * @returns SDK instance configured for testing
   * 
   * @example
   * ```typescript
   * const testSDK = PromptellaSDK.forTesting(
   *   'sk_test_[YOUR_API_KEY]',
   *   'proj_[YOUR_PROJECT_ID]'
   * );
   * ```
   */
  static forTesting(
    apiKey: string,
    projectId: string,
    options: Partial<Omit<SDKConfig, 'apiKey' | 'projectId'>> = {}
  ): PromptellaSDK {
    if (!apiKey.startsWith('sk_test_')) {
      throw new ConfigurationError('Test SDK requires a test API key (sk_test_...)');
    }

    return new PromptellaSDK({
      apiKey,
      projectId,
      debug: true,
      timeout: 10000, // Shorter timeout for testing
      ...options,
    });
  }

  /**
   * Create SDK instance with production environment defaults
   * 
   * @param apiKey Production API key (sk_live_...)
   * @param projectId Project ID
   * @param options Additional configuration options
   * @returns SDK instance configured for production
   * 
   * @example
   * ```typescript
   * const prodSDK = PromptellaSDK.forProduction(
   *   'sk_live_[YOUR_API_KEY]',
   *   'proj_[YOUR_PROJECT_ID]'
   * );
   * ```
   */
  static forProduction(
    apiKey: string,
    projectId: string,
    options: Partial<Omit<SDKConfig, 'apiKey' | 'projectId'>> = {}
  ): PromptellaSDK {
    if (!apiKey.startsWith('sk_live_')) {
      throw new ConfigurationError('Production SDK requires a live API key (sk_live_...)');
    }

    return new PromptellaSDK({
      apiKey,
      projectId,
      debug: false,
      timeout: 30000,
      ...options,
    });
  }
}
