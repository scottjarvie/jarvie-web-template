/**
 * Type-safe query building utilities for Drizzle ORM
 * 
 * This module provides reusable functions to build common queries
 * in a type-safe manner with PostgreSQL-specific features.
 */

import { SQL, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

/**
 * Builds a search query for PostgreSQL text columns using to_tsquery
 */
export function buildSearchQuery(searchTerm: string, columns: PgColumn[]): SQL {
  // Convert search term to tsquery format
  const formattedTerm = searchTerm
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(term => `${term}:*`)
    .join(" & ");
  
  if (!formattedTerm) {
    return sql`TRUE`;
  }
  
  // Create to_tsvector expressions for each column
  const tsvectorExpressions = columns.map(
    column => sql`to_tsvector('english', ${column})`
  );
  
  // Combine all tsvector expressions with ||
  const combinedTsvector = tsvectorExpressions.reduce(
    (acc, expr) => sql`${acc} || ${expr}`
  );
  
  // Return the final search condition
  return sql`${combinedTsvector} @@ to_tsquery('english', ${formattedTerm})`;
}

/**
 * Creates a case-insensitive partial match condition for text columns
 */
export function ilike(column: PgColumn, value: string): SQL {
  return sql`${column} ILIKE ${'%' + value + '%'}`;
}

/**
 * Builds pagination parameters
 */
export function getPaginationParams(
  page: number = 1, 
  pageSize: number = 10
): { limit: number; offset: number } {
  const limit = pageSize;
  const offset = (page - 1) * pageSize;
  
  return {
    limit,
    offset,
  };
}

/**
 * Orders query results by a specific column
 */
export function getOrderBy(
  column: PgColumn, 
  direction: 'asc' | 'desc' = 'asc'
): SQL {
  return direction === 'asc' 
    ? sql`${column} ASC` 
    : sql`${column} DESC`;
} 