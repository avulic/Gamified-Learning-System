
export interface IUnitOfWork<TContext = unknown> {
    startTransaction(): Promise<TContext>;
    commitTransaction(session: TContext): Promise<void>;
    rollbackTransaction(session: TContext): Promise<void>;
    runInTransaction<T>(work: (session: TContext) => Promise<T>): Promise<T>;
}