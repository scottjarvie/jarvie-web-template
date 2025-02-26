/**
 * OpenAI API Client
 * 
 * This file provides client-side functions for interacting with the OpenAI API endpoints.
 * It includes type-safe methods for chat completions and token counting.
 */

import { apiRpc, getApiClient, InferRequestType } from "./client";

// Define request types for use in components
const $createChatCompletion = apiRpc.openai.chat.$post;
const $countTokens = apiRpc.openai.tokens.$post;
const $countMessageTokens = apiRpc.openai["message-tokens"].$post;

export type CreateChatCompletionParams = InferRequestType<typeof $createChatCompletion>["json"];
export type CountTokensParams = InferRequestType<typeof $countTokens>["json"];
export type CountMessageTokensParams = InferRequestType<typeof $countMessageTokens>["json"];

/**
 * Create a chat completion using OpenAI's API
 */
export async function createChatCompletion(params: CreateChatCompletionParams) {
  const client = await getApiClient();
  const response = await client.openai.chat.$post({ json: params });
  return response.json();
}

/**
 * Count tokens in a text string
 */
export async function countTokens(params: CountTokensParams) {
  const client = await getApiClient();
  const response = await client.openai.tokens.$post({ json: params });
  return response.json();
}

/**
 * Count tokens in a chat message array
 */
export async function countMessageTokens(params: CountMessageTokensParams) {
  const client = await getApiClient();
  const response = await client.openai["message-tokens"].$post({ json: params });
  return response.json();
}

/**
 * Get available OpenAI models
 */
export async function getOpenAIModels() {
  const client = await getApiClient();
  const response = await client.openai.models.$get();
  return response.json();
} 