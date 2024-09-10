// IRepositoryContext.ts
import { ClientSession } from 'mongoose';

export interface IRepositoryContext {
    getSession(): ClientSession | null;
}