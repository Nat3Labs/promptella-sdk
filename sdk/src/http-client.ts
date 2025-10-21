import type { SDKConfig, SDKEventName, SDKEventHandler, SDKEvents } from './types';
import { TimeoutError, createErrorFromResponse } from './errors';

/**
 * Internal HTTP client for Promptella API requests
 */
export class HttpClient {
  private readonly config: Required<SDKConfig>;
  private readonly eventHandlers: Map<SDKEventName, SDKEventHandler<any>[]> = new Map();
  private readonly abortController = new AbortController();

  constructor(config: SDKConfig) {
    this.config = {
      baseUrl: 'https://promptella.ai',
      timeout: 30000,
      debug: false,
      headers: {},
      ...config,
    };

    // Validate configuration
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.apiKey || !this.config.apiKey.startsWith('sk_')) {
      throw new Error('Invalid API key format. Must start with "sk_"');
    }

    if (!this.config.projectId || !this.config.projectId.startsWith('proj_')) {
      throw new Error('Invalid Project ID format. Must start with "proj_"');
    }

    try {
      new URL(this.config.baseUrl);
    } catch {
      throw new Error('Invalid base URL format');
    }
  }

  /**
   * Add event listener for SDK events
   */
  on<T extends SDKEventName>(event: T, handler: SDKEventHandler<T>): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  /**
   * Remove event listener
   */
  off<T extends SDKEventName>(event: T, handler: SDKEventHandler<T>): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit SDK event
   */
  private emit<T extends SDKEventName>(event: T, data: SDKEvents[T]): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          if (this.config.debug) {
            console.error('Error in event handler:', error);
          }
        }
      });
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: any,
    options: {
      retries?: number;
      retryDelay?: number;
      timeout?: number;
    } = {}
  ): Promise<T> {
    const {
      retries = 3,
      retryDelay = 1000,
      timeout = this.config.timeout,
    } = options;

    const url = `${this.config.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Project-ID': this.config.projectId,
      'User-Agent': '@nation3labs/promptella-sdk/1.0.0',
      ...this.config.headers,
    };

    // Emit request event
    this.emit('request', { url, method, headers });

    if (this.config.debug) {
      console.log(`[Promptella SDK] ${method} ${url}`);
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      const requestStartTime = Date.now();
      
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new TimeoutError(timeout)), timeout);
        });

        // Create fetch promise
        const fetchPromise = fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: this.abortController.signal,
        });

        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        const duration = Date.now() - requestStartTime;

        if (!response.ok) {
          const error = await createErrorFromResponse(response, requestStartTime);
          
          // Emit error event
          this.emit('error', { error, duration });
          
          // Handle rate limiting with retry
          if (response.status === 429 && attempt < retries) {
            const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10) * 1000;
            this.emit('rateLimit', { 
              limits: (error as any).limits,
              retryAfter: retryAfter / 1000 
            });
            
            if (attempt < retries) {
              const delay = Math.max(retryAfter, retryDelay * Math.pow(2, attempt));
              this.emit('retry', { 
                attempt: attempt + 1, 
                maxAttempts: retries + 1, 
                delay 
              });
              
              if (this.config.debug) {
                console.log(`[Promptella SDK] Rate limited, retrying in ${delay}ms`);
              }
              
              await this.sleep(delay);
              continue;
            }
          }
          
          // Handle server errors with retry
          if (response.status >= 500 && attempt < retries) {
            const delay = retryDelay * Math.pow(2, attempt);
            this.emit('retry', { 
              attempt: attempt + 1, 
              maxAttempts: retries + 1, 
              delay 
            });
            
            if (this.config.debug) {
              console.log(`[Promptella SDK] Server error, retrying in ${delay}ms`);
            }
            
            await this.sleep(delay);
            continue;
          }
          
          throw error;
        }

        // Parse successful response
        const data = await response.json();
        
        // Emit success event
        this.emit('response', { 
          status: response.status, 
          data, 
          duration 
        });

        if (this.config.debug) {
          console.log(`[Promptella SDK] Response received in ${duration}ms`);
        }

        return data;
        
      } catch (error: any) {
        const duration = Date.now() - requestStartTime;
        
        // Don't retry on certain errors
        if (error.code === 'AUTHENTICATION_ERROR' || 
            error.code === 'VALIDATION_ERROR' ||
            error.name === 'AbortError') {
          this.emit('error', { error, duration });
          throw error;
        }
        
        // Retry on network errors
        if (attempt < retries && 
            (error.name === 'NetworkError' || 
             error.name === 'TypeError' ||
             error.message?.includes('fetch'))) {
          
          const delay = retryDelay * Math.pow(2, attempt);
          this.emit('retry', { 
            attempt: attempt + 1, 
            maxAttempts: retries + 1, 
            delay 
          });
          
          if (this.config.debug) {
            console.log(`[Promptella SDK] Network error, retrying in ${delay}ms:`, error.message);
          }
          
          await this.sleep(delay);
          continue;
        }
        
        // Last attempt failed
        this.emit('error', { error, duration });
        throw error;
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error('Maximum retries exceeded');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cancel all pending requests
   */
  cancel(): void {
    this.abortController.abort();
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<SDKConfig>> {
    return { ...this.config };
  }
}
