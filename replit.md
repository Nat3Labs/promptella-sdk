# Promptella SDK

## Overview

The Promptella SDK is an official TypeScript/JavaScript SDK for the Promptella API, a prompt enhancement service. The SDK provides a strongly-typed interface for enhancing AI prompts through various improvement categories including clarity, specificity, context, structure, examples, and constraints. It's designed to be published as an NPM package (`@nation3labs/promptella-sdk`) and supports both production and test environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Module System
- **Build Target**: Dual-format package supporting both CommonJS (`dist/index.js`) and ES Modules (`dist/index.mjs`)
- **Build Tool**: tsup for bundling TypeScript to multiple output formats
- **Type Definitions**: Generated TypeScript declaration files (`dist/index.d.ts`) for full type safety
- **Rationale**: Dual-format packaging ensures compatibility with both modern ESM-based projects and legacy CommonJS applications

### TypeScript Configuration
- **Target**: ES2020 with DOM and ES2020 lib support
- **Module Resolution**: Node-style resolution with ESNext modules
- **Strict Mode**: Enabled for maximum type safety
- **Design Decision**: Strict typing prevents runtime errors and provides better IDE support, critical for SDK reliability

### SDK Architecture
- **Client Pattern**: Single `PromptellaSDK` class provides the main interface
- **HTTP Client**: Separate `HttpClient` class handles all network communication
- **Factory Functions**: `createProductionSDK()` and `createTestSDK()` convenience methods for quick initialization
- **Rationale**: Separation of concerns between business logic (SDK) and transport (HTTP client) enables easier testing and maintenance

### Error Handling Strategy
- **Typed Errors**: Custom error classes for specific failure scenarios:
  - `PromptellaBadRequestError`: Base error class
  - `AuthenticationError`: Invalid API credentials (401)
  - `RateLimitError`: Rate limit exceeded (429) with retry information
  - `ValidationError`: Invalid request parameters
  - `NetworkError`: Network-level failures
  - `TimeoutError`: Request timeout
- **Error Context**: Errors include status codes, retry information, and rate limit details
- **Rationale**: Strongly-typed errors enable consumers to handle different failure modes appropriately with proper TypeScript support

### Configuration System
- **Validation**: API keys must match format `sk_(live|test)_[a-zA-Z0-9]{32}`
- **Project IDs**: Must start with `proj_` prefix
- **Environment Detection**: Automatic test/production mode based on API key prefix
- **Customization**: Supports custom base URLs, timeouts, debug mode, and custom headers
- **Rationale**: Strict validation prevents configuration errors, while flexibility supports different deployment scenarios

### Event System
- **Event Handlers**: SDK supports event listeners for request/response lifecycle
- **Event Types**: Defined via `SDKEventName` type
- **Use Case**: Enables logging, monitoring, and custom middleware patterns
- **Rationale**: Event-driven architecture allows extension without modifying core SDK code

### Request/Response Types
- **Input Options**: `EnhancePromptOptions` for configuring enhancement requests
  - `maxSuggestions`: Limit results (1-10, default 5)
  - `categories`: Filter by improvement types
  - `includeProcessingTime`: Toggle performance metrics
- **Response Format**: `EnhancePromptResponse` with original prompt, suggestions array, processing time, and usage metadata
- **Suggestion Structure**: `EnhancementSuggestion` includes enhanced prompt, improvement type, explanation, and category
- **Rationale**: Rich type definitions provide IDE autocomplete and compile-time validation

### Security
- **API Key Storage**: No hardcoded credentials; expects environment variables
- **Key Validation**: Format checking prevents invalid credentials from being sent
- **Test vs Production**: Separate key prefixes prevent accidental production usage in test environments
- **Rationale**: Defense-in-depth approach reduces risk of credential leakage and misuse

## External Dependencies

### Runtime Dependencies
- **None**: Zero runtime dependencies for minimal bundle size and reduced supply chain risk

### Development Dependencies
- **TypeScript** (`^5.0.0`): Type system and compilation
- **tsup** (`^8.0.0`): Zero-config bundler for TypeScript libraries
- **@types/node** (`^20.0.0`): Node.js type definitions for TypeScript

### Peer Dependencies
- **TypeScript** (`>=4.5.0`): Required for consumers using TypeScript

### Build & Publishing
- **Node.js**: Requires `>=16.0.0` for execution
- **NPM**: Package published to NPM registry under `@nation3labs` scope
- **GitHub Actions**: Automated publishing workflow (repository: `nat3labs/promptella-sdk`)
- **NPM Trusted Publisher**: Configured for secure automated publishing

### External API
- **Promptella API**: Primary service endpoint at `https://promptella.ai`
- **Authentication**: Bearer token authentication using API key and Project ID headers
- **Rate Limiting**: API enforces rate limits with `RateLimitInfo` returned in error responses
- **Endpoints**: POST `/api/enhance` for prompt enhancement

### Quality & Security
- **Semgrep**: Static analysis configuration for security scanning (Bicep-focused rules present but may need expansion for TypeScript)
- **License**: MIT License for open-source distribution