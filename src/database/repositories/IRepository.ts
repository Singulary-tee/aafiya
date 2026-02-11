/**
 * Repository Pattern Base Interface
 * Defines common CRUD operations all repositories should implement
 */

export interface IRepository<T, CreateInput, UpdateInput> {
  create(input: CreateInput): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(filters?: Record<string, unknown>): Promise<T[]>;
  update(id: string, input: UpdateInput): Promise<T>;
  delete(id: string): Promise<boolean>;
}
