/**
 * OpenAI Utility Library
 * 
 * This file provides utilities for working with OpenAI in the frontend,
 * including model definitions and helper functions.
 */

import { countTokens as apiCountTokens } from '@/api/openai.api';

/**
 * OpenAI models supported by the application
 */
export enum OpenAIModel {
  GPT4O = 'gpt-4o',
  GPT4O_MINI = 'gpt-4o-mini'
}

/**
 * Type for token count response
 */
type TokenCountResponse = {
  text: string;
  model: string;
  tokens: number;
} | {
  error: string;
};

/**
 * Count tokens in a text string using the OpenAI API
 */
export async function countTokens(text: string, model: string = OpenAIModel.GPT4O_MINI): Promise<number> {
  try {
    const response = await apiCountTokens({ text, model });
    
    // Check if response has error
    if ('error' in response) {
      throw new Error(response.error);
    }
    
    return response.tokens;
  } catch (error) {
    console.error('Error counting tokens:', error);
    throw error;
  }
}

/**
 * Format token count with appropriate units
 */
export function formatTokenCount(count: number): string {
  if (count < 1000) {
    return `${count} tokens`;
  } else {
    return `${(count / 1000).toFixed(1)}K tokens`;
  }
} 