/**
 * API Client for Hono Backend
 * 
 * This file provides typed API clients for frontend-to-backend communication using Hono's client.
 * It handles authentication, error handling, and provides both client and server-side API access.
 */

import { hc } from "hono/client";
import { HTTPException } from "hono/http-exception";
import type { AppType } from "../../../api/src"; // Import the Hono app type for full type safety
import { getToken } from "@/lib/clerk";

// Re-export useful types
export type { InferRequestType, InferResponseType } from "hono/client";

/**
 * Get the base URL for the API from environment variables
 */
const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_API_URL!;
};

/**
 * Basic API client without authentication
 * Useful for public endpoints or when auth is handled separately
 */
export const apiRpc = hc<AppType>(getBaseUrl(), {
  fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, init);
  },
}).api;

/**
 * Client-side API client with authentication
 * Automatically attaches the user's auth token to all requests
 * For use in React components and client-side code
 */
export const getApiClient = () => {
  return hc<AppType>(getBaseUrl(), {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const authToken = await getToken();

      headers.set("Authorization", `Bearer ${authToken}`);

      const response = await fetch(input, {
        ...init,
        headers,
        cache: "no-store", // Prevent caching to ensure fresh data
      });

      if (!response.ok) {
        throw new HTTPException(response.status as any, {
          message: "Network response was not ok",
        });
      }

      return response;
    },
  }).api;
};

/**
 * Server-side API client
 * For use in Server Components or API routes
 * Does not include auth token - use for server-to-server communication
 */
export const getServerClient = () => {
  return hc<AppType>(getBaseUrl(), {
    fetch: async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const response = await fetch(input, {
        ...init,
        headers,
        cache: "no-store", // Prevent caching to ensure fresh data
      });

      if (!response.ok) {
        throw new HTTPException(response.status as any, {
          message: "Network response was not ok",
        });
      }

      return response;
    },
  }).api;
};
