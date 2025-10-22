Promptella SDK

Official TypeScript/JavaScript SDK for the [Promptella API](https://promptella.ai) - enhance your AI prompts with intelligent suggestions.

Features

✨ Smart Prompt Enhancement** - Get AI-powered suggestions to improve your prompts
🔒 Type-Safe** - Full TypeScript support with comprehensive type definitions
🚀 Zero Dependencies** - Minimal bundle size, no external runtime dependencies
🌍 Dual Format** - Supports both CommonJS and ES Modules
⚡ Modern** - Built with latest TypeScript and bundled with tsup
🛡️ Error Handling** - Strongly-typed custom errors for better debugging

Installation

```bash
npm install @nation3labs/promptella-sdk

Quick Start
import { createProductionSDK } from '@nation3labs/promptella-sdk';

// Initialize the SDK
const sdk = createProductionSDK({
apiKey: 'sk_live_your_api_key_here',
projectId: 'proj_your_project_id'
});

// Enhance your prompt
const result = await sdk.enhancePrompt({
prompt: 'Write a blog post about AI',
maxSuggestions: 3
});

console.log(result.suggestions);

Usage
Production vs Test Mode
import { createProductionSDK, createTestSDK } from '@nation3labs/promptella-sdk';

// Production mode
const prodSDK = createProductionSDK({
apiKey: 'sk_live_...',
projectId: 'proj_...'
});

// Test mode
const testSDK = createTestSDK({
apiKey: 'sk_test_...',
projectId: 'proj_...'
});

Enhancement Options
const result = await sdk.enhancePrompt({
prompt: 'Your original prompt here',
maxSuggestions: 5, // 1-10, default: 5
categories: ['clarity', 'specificity'], // Optional: filter by category
includeProcessingTime: true // Optional: include performance metrics
});

Available Categories
	•	clarity - Improve prompt clarity
	•	specificity - Add specific details
	•	context - Provide better context
	•	structure - Improve structure
	•	examples - Add examples
	•	constraints - Define constraints
Error Handling
import {
AuthenticationError,
RateLimitError,
ValidationError
} from '@nation3labs/promptella-sdk';

try {
const result = await sdk.enhancePrompt({ prompt: '...' });
} catch (error) {
if (error instanceof AuthenticationError) {
console.error('Invalid API credentials');
} else if (error instanceof RateLimitError) {
console.error('Rate limit exceeded, retry after:', error.retryAfter);
} else if (error instanceof ValidationError) {
console.error('Invalid request:', error.message);
}
}

API Reference
enhancePrompt(options)
Enhance a prompt with AI-powered suggestions.
Parameters:
	•	prompt (string, required) - The original prompt to enhance
	•	maxSuggestions (number, optional) - Number of suggestions to return (1-10, default: 5)
	•	categories (string[], optional) - Filter suggestions by category
	•	includeProcessingTime (boolean, optional) - Include processing time in response
Returns: Promise<EnhancePromptResponse>
Configuration
Custom Configuration
import { PromptellaSDK } from '@nation3labs/promptella-sdk';

const sdk = new PromptellaSDK({
apiKey: 'sk_live_...',
projectId: 'proj_...',
baseUrl: 'https://custom-endpoint.com', // Optional
timeout: 30000, // Optional (ms)
debug: true // Optional: enable debug logging
});

Requirements
	•	Node.js >= 16.0.0
	•	TypeScript >= 4.5.0 (if using TypeScript)
License
MIT License - see LICENSE for details
Links
	•	NPM Package (https://www.npmjs.com/package/@nation3labs/promptella-sdk)
	•	GitHub Repository (https://github.com/Nat3Labs/promptella-sdk)
	•	Promptella API (https://promptella.ai/)
Support
For issues and questions, please open an issue on GitHub (https://github.com/Nat3Labs/promptella-sdk/issues).
