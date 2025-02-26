/**
 * Base Repository Pattern Implementation
 * 
 * This class provides a foundation for implementing the repository pattern
 * with Drizzle ORM, providing common database operations with type safety.
 */

import { SQL, eq, sql } from "drizzle-orm";
import { PgTable, TableConfig } from "drizzle-orm/pg-core";
import { db } from "../client";

// Alias for a TypeScript cast-through to avoid query builder typing issues
type AnyQuery = any;

interface TableWithId {
  id: any;
}

export class BaseRepository<
  T extends PgTable<TableConfig> & TableWithId,
  SelectModel,
  InsertModel
> {
  protected table: T;
  
  constructor(table: T) {
    this.table = table;
  }
  
  /**
   * Find all records with optional filtering, limit, and offset
   */
  async findAll(where?: SQL<unknown>, limit?: number, offset?: number): Promise<SelectModel[]> {
    let query: AnyQuery = db.select().from(this.table as any);
    
    if (where) {
      query = query.where(where);
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    if (offset) {
      query = query.offset(offset);
    }
    
    const result = await query;
    return result as SelectModel[];
  }
  
  /**
   * Find a record by its ID
   */
  async findById(id: string): Promise<SelectModel | undefined> {
    const [result] = await db
      .select()
      .from(this.table as any)
      .where(eq(this.table.id, id))
      .limit(1);
    
    return result as unknown as SelectModel;
  }
  
  /**
   * Create a new record
   */
  async create(data: InsertModel): Promise<SelectModel> {
    const [result] = await db
      .insert(this.table)
      .values(data as any)
      .returning();
    
    return result as unknown as SelectModel;
  }
  
  /**
   * Update an existing record by ID
   */
  async update(id: string, data: Partial<InsertModel>): Promise<SelectModel | undefined> {
    const [result] = await db
      .update(this.table)
      .set({ ...data as any, updatedAt: new Date() })
      .where(eq(this.table.id, id))
      .returning();
    
    return result as unknown as SelectModel;
  }
  
  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<SelectModel | undefined> {
    const [result] = await db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();
    
    return result as unknown as SelectModel;
  }
  
  /**
   * Count records with optional filtering
   */
  async count(where?: SQL<unknown>): Promise<number> {
    let query: AnyQuery = db.select({ count: sql`count(*)` }).from(this.table as any);
    
    if (where) {
      query = query.where(where);
    }
    
    const result = await query;
    return Number(result[0]?.count || 0);
  }
} 