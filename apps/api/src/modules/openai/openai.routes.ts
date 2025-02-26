/**
 * OpenAI API Routes
 *
 * These routes provide endpoints for:
 * - Chat completions
 * - Token counting
 * - Model information
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { openaiService, OpenAIModel } from './openai-service';
import { ChatCompletionMessageParam } from 'openai/resources';
// Import the appropriate auth middleware for your project
import { auth, requireAuth, getUserId } from '@/pkg/middleware/clerk-auth';
// Or if using Supabase:
// import { auth, requireAuth, getUserId } from '@/pkg/middleware/supabase-auth';
import { logger } from '@repo/logs';

// Create the routes
export const openaiRoutes = new Hono()
  // Authentication can be applied based on your requirements
  // Uncomment the line below to require authentication
  // .use(auth(), requireAuth)

  /**
   * Chat completion endpoint
   * POST /chat
   */
  .post('/chat', zValidator('json', z.object({
    messages: z.array(
      z.object({
        role: z.enum(['system', 'user', 'assistant', 'function', 'tool']),
        content: z.string(),
        name: z.string().optional(),
        tool_call_id: z.string().optional(),
      })
    ),
    model: z.string().default(OpenAIModel.GPT4O_MINI),
    temperature: z.number().min(0).max(2).default(0.7),
    max_tokens: z.number().min(1).max(4096).default(1000),
  })), async (c) => {
    try {
      const { messages, model, temperature, max_tokens } = c.req.valid('json');
      
      // Convert the validated messages to the OpenAI format with proper typing
      const openaiMessages: ChatCompletionMessageParam[] = messages.map(msg => {
        // Handle each role type separately to satisfy TypeScript
        if (msg.role === 'system') {
          return { role: 'system', content: msg.content };
        } else if (msg.role === 'user') {
          return { role: 'user', content: msg.content };
        } else if (msg.role === 'assistant') {
          return { role: 'assistant', content: msg.content };
        } else if (msg.role === 'function') {
          // function role requires a name
          return { 
            role: 'function', 
            content: msg.content,
            name: msg.name || 'unknown_function', // Provide a default if none given
          };
        } else if (msg.role === 'tool') {
          // tool role requires a tool_call_id
          if (!msg.tool_call_id) {
            // If tool_call_id is missing, fallback to user role to prevent errors
            return { role: 'user', content: msg.content };
          }
          return { 
            role: 'tool', 
            content: msg.content,
            tool_call_id: msg.tool_call_id
          };
        }
        
        // This should never happen due to the enum validation
        return { role: 'user', content: msg.content };
      });
      
      const response = await openaiService.createChatCompletion({
        model,
        messages: openaiMessages,
        temperature,
        max_tokens,
      });
      
      return c.json(response);
    } catch (error) {
      logger.error('Error in chat completion:', error);
      if (error instanceof Error) {
        return c.json({ error: error.message }, 500);
      }
      return c.json({ error: 'Unknown error occurred' }, 500);
    }
  })

  /**
   * Token counting endpoint
   * POST /tokens
   */
  .post('/tokens', zValidator('json', z.object({
    text: z.string(),
    model: z.string().default(OpenAIModel.GPT4O_MINI),
  })), async (c) => {
    try {
      const { text, model } = c.req.valid('json');
      
      const tokenCount = openaiService.countTokens(text, model);
      
      return c.json({
        text,
        model,
        tokens: tokenCount,
      });
    } catch (error) {
      logger.error('Error counting tokens:', error);
      if (error instanceof Error) {
        return c.json({ error: error.message }, 500);
      }
      return c.json({ error: 'Unknown error occurred' }, 500);
    }
  })

  /**
   * Message token counting endpoint
   * POST /message-tokens
   */
  .post('/message-tokens', zValidator('json', z.object({
    messages: z.array(
      z.object({
        role: z.enum(['system', 'user', 'assistant', 'function', 'tool']),
        content: z.string(),
        name: z.string().optional(),
        tool_call_id: z.string().optional(),
      })
    ),
    model: z.string().default(OpenAIModel.GPT4O_MINI),
  })), async (c) => {
    try {
      const { messages, model } = c.req.valid('json');
      
      // Convert the validated messages to the OpenAI format with proper typing
      const openaiMessages: ChatCompletionMessageParam[] = messages.map(msg => {
        // Handle each role type separately to satisfy TypeScript
        if (msg.role === 'system') {
          return { role: 'system', content: msg.content };
        } else if (msg.role === 'user') {
          return { role: 'user', content: msg.content };
        } else if (msg.role === 'assistant') {
          return { role: 'assistant', content: msg.content };
        } else if (msg.role === 'function') {
          // function role requires a name
          return { 
            role: 'function', 
            content: msg.content,
            name: msg.name || 'unknown_function', // Provide a default if none given
          };
        } else if (msg.role === 'tool') {
          // tool role requires a tool_call_id
          if (!msg.tool_call_id) {
            // If tool_call_id is missing, fallback to user role to prevent errors
            return { role: 'user', content: msg.content };
          }
          return { 
            role: 'tool', 
            content: msg.content,
            tool_call_id: msg.tool_call_id
          };
        }
        
        // This should never happen due to the enum validation
        return { role: 'user', content: msg.content };
      });
      
      const tokenCount = openaiService.countMessageTokens(openaiMessages, model);
      
      return c.json({
        model,
        tokens: tokenCount,
      });
    } catch (error) {
      logger.error('Error counting message tokens:', error);
      if (error instanceof Error) {
        return c.json({ error: error.message }, 500);
      }
      return c.json({ error: 'Unknown error occurred' }, 500);
    }
  })

  /**
   * Available models endpoint
   * GET /models
   */
  .get('/models', (c) => {
    return c.json({
      models: Object.values(OpenAIModel),
    });
  }); 