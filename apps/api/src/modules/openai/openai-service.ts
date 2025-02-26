/**
 * OpenAI Service
 *
 * This service provides methods for interacting with OpenAI APIs, including:
 * - Chat completions for text generation
 * - Token counting for input text and chat messages
 * - Support for GPT-4o and GPT-4o-mini models
 */

import OpenAI from 'openai';
import type { ChatCompletion, ChatCompletionMessageParam } from 'openai/resources';
import tiktoken, { encoding_for_model, get_encoding } from 'tiktoken';
import { logger } from '@repo/logs';

/**
 * OpenAI models
 */
export enum OpenAIModel {
  GPT4O = 'gpt-4o',
  GPT4O_MINI = 'gpt-4o-mini'
}

// Types for OpenAI message formats
export type OpenAIMessage = ChatCompletionMessageParam;

/**
 * OpenAI service class for API interactions
 */
export class OpenAIService {
  private client: OpenAI;
  
  constructor() {
    const apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!apiKey) {
      logger.error('OPENAI_API_KEY is not set in environment variables');
    }
    
    this.client = new OpenAI({
      apiKey: apiKey,
    });
  }
  
  /**
   * Create a chat completion with the OpenAI API
   */
  async createChatCompletion(params: {
    model: string;
    messages: OpenAIMessage[];
    temperature?: number;
    max_tokens?: number;
  }): Promise<ChatCompletion> {
    try {
      // Create request parameters
      const requestParams: any = {
        model: params.model,
        messages: params.messages,
        max_tokens: params.max_tokens || 1000,
      };
      
      // Only add temperature for non-o3 models
      if (params.temperature && !params.model.includes('o3')) {
        requestParams.temperature = params.temperature;
      }
      
      // Call OpenAI API
      const completion = await this.client.chat.completions.create(requestParams);
      
      return completion;
    } catch (error) {
      logger.error('Error in createChatCompletion:', error);
      throw error;
    }
  }
  
  /**
   * Count tokens in a text string
   * @param text The text to count tokens for
   * @param model Optional model name to use specific encoding
   * @returns The number of tokens in the text
   */
  countTokens(text: string, model?: string): number {
    try {
      let enc;
      
      // Try to get the encoding for the specific model if provided
      if (model) {
        try {
          // Cast the model string to any to avoid TypeScript errors
          // tiktoken will handle invalid models internally
          enc = encoding_for_model(model as any);
        } catch (error) {
          // If model-specific encoding fails, fall back to cl100k_base
          logger.warn(`Could not find encoding for model ${model}, falling back to cl100k_base`);
          enc = get_encoding('cl100k_base');
        }
      } else {
        // Default to cl100k_base which is used by GPT-4o models
        enc = get_encoding('cl100k_base');
      }
      
      // Encode the text and get token count
      const tokens = enc.encode(text);
      const count = tokens.length;
      
      // Free the encoder to prevent memory leaks
      enc.free();
      
      return count;
    } catch (error) {
      logger.error('Error counting tokens with tiktoken:', error);
      // Fallback estimation: ~4 characters per token as a rough estimate
      return Math.ceil(text.length / 4);
    }
  }
  
  /**
   * Count tokens in a chat message array
   * @param messages Array of chat messages
   * @param model Optional model name to use specific encoding
   * @returns The total number of tokens in all messages
   */
  countMessageTokens(messages: Array<ChatCompletionMessageParam>, model?: string): number {
    try {
      // For accurate token counting of chat messages, we need to account for message formatting
      // Each message follows format: <im_start>{role/name}\n{content}<im_end>\n
      // Plus there's a constant overhead for the entire message array
      
      let enc;
      
      // Try to get the encoding for the specific model if provided
      if (model) {
        try {
          enc = encoding_for_model(model as any);
        } catch (error) {
          logger.warn(`Could not find encoding for model ${model}, falling back to cl100k_base`);
          enc = get_encoding('cl100k_base');
        }
      } else {
        // Default to cl100k_base which is used by GPT-4o models
        enc = get_encoding('cl100k_base');
      }
      
      // Count tokens for each message
      let totalTokens = 0;
      
      for (const message of messages) {
        // Count tokens in the content
        if (typeof message.content === 'string') {
          totalTokens += enc.encode(message.content).length;
        } else if (Array.isArray(message.content)) {
          // Handle content array (for multi-modal messages)
          for (const contentPart of message.content) {
            if (contentPart.type === 'text' && typeof contentPart.text === 'string') {
              totalTokens += enc.encode(contentPart.text).length;
            }
            // Image parts are counted differently
            if (contentPart.type === 'image_url') {
              totalTokens += 85; // Approximate token count for a standard image
            }
          }
        }
        
        // Add tokens for role (and name if present)
        totalTokens += enc.encode(message.role).length;
        
        // Check for name property
        if ('name' in message && message.name) {
          totalTokens += enc.encode(message.name).length;
        }
        
        // Add overhead for each message format
        totalTokens += 4;
      }
      
      // Add overhead for the entire request
      totalTokens += 3;
      
      // Free the encoder to prevent memory leaks
      enc.free();
      
      return totalTokens;
    } catch (error) {
      logger.error('Error counting message tokens with tiktoken:', error);
      
      // Fallback estimation
      return messages.reduce((total, msg) => {
        const content = typeof msg.content === 'string' 
          ? msg.content 
          : Array.isArray(msg.content) 
            ? msg.content.filter(part => part.type === 'text').map(part => part.text).join(' ')
            : '';
        return total + this.countTokens(content);
      }, 0);
    }
  }
}

// Create and export a singleton instance
export const openaiService = new OpenAIService(); 