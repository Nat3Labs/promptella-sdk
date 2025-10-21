/**
 * Advanced SDK Usage Examples
 * 
 * Demonstrates advanced patterns including error handling,
 * retry strategies, and production best practices.
 */

import {
  PromptellaSDK,
  createTestSDK,
  createProductionSDK,
  RateLimitError,
  NetworkError,
  ValidationError
} from '../src/index';

// Production SDK with custom configuration
const productionSDK = createProductionSDK(
  process.env.PROMPTELLA_API_KEY!,
  process.env.PROMPTELLA_PROJECT_ID!,
  {
    timeout: 60000, // 60 second timeout
    debug: false,
    headers: {
      'X-Client-Version': '1.0.0',
      'X-Client-Name': 'MyApp'
    }
  }
);

// Test SDK for development
const testSDK = createTestSDK(
  process.env.PROMPTELLA_TEST_API_KEY || 'sk_test_your_test_key_here',
  process.env.PROMPTELLA_TEST_PROJECT_ID || 'proj_test_your_project_id',
  {
    debug: true,
    timeout: 10000
  }
);

/**
 * Robust enhancement with automatic retry and fallback
 */
async function robustEnhancement(prompt: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await productionSDK.enhancePrompt(prompt);
      console.log(`✅ Enhancement successful on attempt ${attempt}`);
      return result;
      
    } catch (error) {
      if (error instanceof RateLimitError) {
        if (attempt < maxRetries) {
          console.log(`⏸️ Rate limited, waiting ${error.retryAfter}s...`);
          await new Promise(resolve => setTimeout(resolve, error.retryAfter * 1000));
          continue;
        }
        throw error;
        
      } else if (error instanceof NetworkError && error.statusCode >= 500) {
        if (attempt < maxRetries) {
          console.log(`🔄 Server error, retrying in ${attempt * 2}s...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        throw error;
        
      } else if (error instanceof ValidationError) {
        console.error('❌ Validation error (won\'t retry):', error.message);
        throw error;
        
      } else {
        console.error(`❌ Unexpected error on attempt ${attempt}:`, error.message);
        if (attempt === maxRetries) throw error;
      }
    }
  }
}

/**
 * Batch processing with rate limit awareness
 */
async function batchEnhance(prompts: string[]) {
  const results: (any | null)[] = [];
  const batchSize = 3; // Process 3 at a time to avoid rate limits
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(prompts.length/batchSize)}`);
    
    const batchPromises = batch.map(async (prompt, index) => {
      try {
        // Add small delay between requests in batch
        await new Promise(resolve => setTimeout(resolve, index * 200));
        return await productionSDK.enhancePrompt(prompt);
      } catch (error) {
        console.warn(`Failed to enhance prompt ${i + index + 1}:`, error.message);
        return null;
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Wait between batches to be nice to the API
    if (i + batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results.filter(result => result !== null);
}

/**
 * Enhanced prompt with validation and preprocessing
 */
async function validateAndEnhance(prompt: string) {
  // Client-side validation
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  
  if (prompt.length > 4800) { // Leave some buffer for API limit
    console.warn('Prompt too long, truncating...');
    prompt = prompt.substring(0, 4800) + '...';
  }
  
  // Clean up the prompt
  const cleanPrompt = prompt
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:()-]/g, ''); // Remove special chars
  
  try {
    const result = await productionSDK.enhancePrompt(cleanPrompt);
    
    // Post-process results
    const enhancedResults = {
      ...result,
      suggestions: result.suggestions.map(suggestion => ({
        ...suggestion,
        // Add confidence score based on explanation length
        confidence: Math.min(suggestion.explanation.length / 100, 1),
        // Add readability score
        readability: suggestion.enhanced_prompt.split(' ').length > 10 ? 'detailed' : 'concise'
      }))
    };
    
    return enhancedResults;
    
  } catch (error) {
    console.error('Enhancement failed:', error.message);
    throw error;
  }
}

/**
 * SDK health monitoring
 */
class SDKMonitor {
  private requestCount = 0;
  private errorCount = 0;
  private totalResponseTime = 0;
  
  constructor(private sdk: PromptellaSDK) {
    this.setupMonitoring();
  }
  
  private setupMonitoring() {
    this.sdk.on('request', () => {
      this.requestCount++;
    });
    
    this.sdk.on('response', ({ duration }) => {
      this.totalResponseTime += duration;
    });
    
    this.sdk.on('error', () => {
      this.errorCount++;
    });
  }
  
  getStats() {
    return {
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      errorRate: this.requestCount > 0 ? this.errorCount / this.requestCount : 0,
      averageResponseTime: this.requestCount > 0 ? this.totalResponseTime / this.requestCount : 0,
      successRate: this.requestCount > 0 ? 1 - (this.errorCount / this.requestCount) : 0
    };
  }
  
  reset() {
    this.requestCount = 0;
    this.errorCount = 0;
    this.totalResponseTime = 0;
  }
}

// Example usage
async function runAdvancedExamples() {
  // Set up monitoring
  const monitor = new SDKMonitor(productionSDK);
  
  try {
    // Single robust enhancement
    console.log('=== Robust Enhancement ===');
    const result1 = await robustEnhancement('Optimize database queries for better performance');
    if (result1) {
      console.log('Success:', result1.suggestions.length, 'suggestions received');
    }
    
    // Batch processing
    console.log('\n=== Batch Processing ===');
    const prompts = [
      'Write documentation for an API',
      'Create user onboarding flow',
      'Design error handling strategy',
      'Implement caching mechanism',
      'Build monitoring dashboard'
    ];
    
    const batchResults = await batchEnhance(prompts);
    console.log(`Batch complete: ${batchResults.length}/${prompts.length} successful`);
    
    // Validated enhancement
    console.log('\n=== Validated Enhancement ===');
    const result3 = await validateAndEnhance('   Create a   comprehensive   testing   strategy   ');
    console.log('Enhanced with confidence scores:', result3.suggestions.map(s => ({
      type: s.improvement_type,
      confidence: (s as any).confidence,
      readability: (s as any).readability
    })));
    
  } catch (error) {
    console.error('Advanced examples failed:', error.message);
  } finally {
    // Show monitoring stats
    console.log('\n=== SDK Statistics ===');
    console.log(monitor.getStats());
  }
}

// Uncomment to run examples
// runAdvancedExamples();
