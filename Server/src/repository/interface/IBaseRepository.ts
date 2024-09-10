export interface IBaseRepository<T, TContext = unknown> {
    create(item: Partial<T>, options?: {}, context?: TContext): Promise<T>;
    createMany(items: Partial<T>[], context?: TContext): Promise<T[]>;
    findById(id: string, options?: {}, context?: TContext): Promise<T | null>;
    findOne(query: any, context?: TContext): Promise<T | null>;
    find(filter: Partial<T>, options?: {}, context?: TContext): Promise<T[]>;
    update(id: string, item: Partial<T>, context?: TContext): Promise<T | null>;
    delete(id: string, context?: TContext): Promise<boolean>;
    deleteMany(filter: Partial<T>, context?: TContext): Promise<number>;
    count(query?: any, context?: TContext): Promise<number>;
    exists(query: any, context?: TContext): Promise<boolean>;
}
