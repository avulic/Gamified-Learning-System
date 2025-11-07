export interface IBaseRepository<T, TContext = unknown> {
    create(item: T, options?: {}, context?: TContext): Promise<T>;
    createMany(items: T[], context?: TContext): Promise<T[]>;
    findById(id: string, options?: {}, context?: TContext): Promise<T | null>;
    findOne(query: any, context?: TContext): Promise<T | null>;
    find(filter: T, options?: {}, context?: TContext): Promise<T[]>;
    update(id: string, item: Partial<T>, context?: TContext): Promise<T | null>;
    delete(id: string, context?: TContext): Promise<boolean>;
    deleteMany(filter: T, context?: TContext): Promise<number>;
    count(query?: any, context?: TContext): Promise<number>;
    exists(query: any, context?: TContext): Promise<boolean>;
}
