/**
 * Basic SDK Usage Examples
 * 
 * This file demonstrates how to use the Promptella SDK
 * for basic prompt enhancement tasks.
 */

import { PromptellaSDK, RateLimitError, AuthenticationError } from '@nation3labs/promptella-sdk';

// Initialize SDK with your credentials
const sdk = new PromptellaSDK({
  apiKey: process.env.PROMPTELLA_API_KEY || 'your-api-key-here',
  projectId: process.env.PROMPTELLA_PROJECT_ID || 'your-project-id-here',
  debug: true // Enable debug logging
});

// Basic prompt enhancement
async function basicEnhancement() {
  try {
    const result = await sdk.enhancePrompt('Write a blog post about AI');
    
    console.log('Original prompt:', result.original_prompt);
    console.log('Processing time:', result.processing_time_ms + 'ms');
    
    result.suggestions.forEach((suggestion, index) => {
      console.log(`\n--- Suggestion ${index + 1} ---`);
      console.log('Type:', suggestion.improvement_type);
      console.log('Enhanced:', suggestion.enhanced_prompt);
      console.log('Explanation:', suggestion.explanation);
    });
    
  } catch (error) {
    if (error instanceof RateLimitError) {
      console.log(`Rate limited! Retry in ${error.retryAfter} seconds`);
      console.log('Current limits:', error.limits);
    } else if (error instanceof AuthenticationError) {
      console.error('Authentication failed. Check your API key and Project ID.');
    } else {
      console.error('Enhancement failed:', error.message);
    }
  }
}

// Enhanced prompt with options
async function enhancedUsage() {
  try {
    const result = await sdk.enhancePrompt(
      'Create a marketing campaign for eco-friendly products',
      {
        maxSuggestions: 3,
        categories: ['clarity', 'specificity', 'context']
      }
    );
    
    console.log(`Received ${result.suggestions.length} suggestions:`);
    result.suggestions.forEach(suggestion => {
      console.log(`- ${suggestion.improvement_type}: ${suggestion.enhanced_prompt}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test connection
async function testConnection() {
  try {
    const status = await sdk.testConnection();
    console.log('✅ Connected successfully!');
    console.log('Environment:', status.environment);
    console.log('Timestamp:', status.timestamp);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

// Event listening
function setupEventListeners() {
  sdk.on('request', ({ method, url }) => {
    console.log(`📤 ${method} ${url}`);
  });
  
  sdk.on('response', ({ status, duration }) => {
    console.log(`📥 ${status} (${duration}ms)`);
  });
  
  sdk.on('error', ({ error, duration }) => {
    console.error(`❌ Error after ${duration}ms:`, error.message);
  });
  
  sdk.on('rateLimit', ({ retryAfter }) => {
    console.warn(`⏰ Rate limited. Retrying in ${retryAfter}s`);
  });
  
  sdk.on('retry', ({ attempt, maxAttempts, delay }) => {
    console.log(`🔄 Retry ${attempt}/${maxAttempts} in ${delay}ms`);
  });
}

// Run examples
async function runExamples() {
  setupEventListeners();
  
  console.log('=== Testing Connection ===');
  await testConnection();
  
  console.log('\n=== Basic Enhancement ===');
  await basicEnhancement();
  
  console.log('\n=== Enhanced Usage ===');
  await enhancedUsage();
}

// Uncomment to run examples
// runExamples();
