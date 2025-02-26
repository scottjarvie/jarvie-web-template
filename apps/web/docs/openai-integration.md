# OpenAI Integration Guide

This guide covers how to use the OpenAI API integration features in the template, including token counting, chat completions, and UI components.

## Overview

The template includes full OpenAI API integration with support for:

- GPT-4o
- GPT-4o-mini

Features include:

- Chat completions for generating AI responses
- Token counting with Tiktoken for accurate token usage estimation
- Reusable React components for token visualization and counting
- Type-safe API client

## Setup

1. **API Key Configuration**

   Add your OpenAI API key to your `.env` files:

   ```
   # In apps/api/.env
   OPENAI_API_KEY=your-api-key
   ```

2. **Install Dependencies**

   The dependencies are already included in the template. If you need to reinstall:

   ```bash
   cd apps/api
   pnpm add openai tiktoken
   ```

## Backend API Endpoints

The template provides the following API endpoints:

| Endpoint                     | Method | Description                   |
| ---------------------------- | ------ | ----------------------------- |
| `/api/openai/chat`           | POST   | Create a chat completion      |
| `/api/openai/tokens`         | POST   | Count tokens in text          |
| `/api/openai/message-tokens` | POST   | Count tokens in chat messages |
| `/api/openai/models`         | GET    | Get available models          |

### Example Request: Chat Completion

```typescript
// POST /api/openai/chat
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "Hello, who are you?"}
  ],
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "max_tokens": 500
}
```

### Example Request: Token Counting

```typescript
// POST /api/openai/tokens
{
  "text": "Hello, how many tokens is this?",
  "model": "gpt-4o-mini"
}
```

## Frontend Integration

### API Client Usage

Import the OpenAI API client functions:

```typescript
import { createChatCompletion, countTokens } from "@/api/openai.api";

// Count tokens
const response = await countTokens({
  text: "How many tokens is this?",
  model: "gpt-4o-mini",
});

// Create chat completion
const completion = await createChatCompletion({
  messages: [{ role: "user", content: "Hello!" }],
  model: "gpt-4o-mini",
});
```

### UI Components

The template includes React components for token visualization:

```typescript
import { TokenCounter, TokenVisualizer } from '@/components/ai';

// Simple token counter
<TokenCounter text="Count the tokens in this text" />

// Full token visualizer with model selection
<TokenVisualizer />
```

## Helper Libraries

The template provides utility functions in `src/lib/openai.ts`:

```typescript
import { OpenAIModel, countTokens, formatTokenCount } from "@/lib/openai";

// Use predefined model constants
const model = OpenAIModel.GPT4O_MINI;

// Count tokens (returns a number)
const count = await countTokens("Hello world", model);

// Format token count for display
const formatted = formatTokenCount(count); // "12 tokens" or "1.5K tokens"
```

## Customization

### Adding New Models

To add support for new OpenAI models:

1. Update the `OpenAIModel` enum in `apps/api/src/modules/openai/openai-service.ts`
2. Update the corresponding enum in `apps/web/src/lib/openai.ts`

### Extending Token Visualization

The `TokenVisualizer` component uses a simplified approach to visualize tokens. For more accurate token boundaries, you could extend it to:

1. Call a new endpoint that returns the actual token splits from tiktoken
2. Update the visualization to show the exact token boundaries

## Examples

A full example page is available at `/examples/token-counter` which demonstrates both the `TokenCounter` and `TokenVisualizer` components.

## Troubleshooting

- **API Key Issues**: Ensure your OpenAI API key is correctly set in both development and production environments
- **Token Limit Errors**: Check that your messages don't exceed the model's token limits
- **Rate Limiting**: Implement retry logic for production applications to handle OpenAI's rate limits

## Resources

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Tiktoken GitHub Repository](https://github.com/openai/tiktoken)
- [Token Usage Optimization Guide](https://platform.openai.com/docs/guides/text-generation/managing-tokens)
