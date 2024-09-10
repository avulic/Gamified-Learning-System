import mongoose, { ClientSession } from "mongoose";
import { IUnitOfWork } from "./interface/IUnitOfWork";
import { RoleRepository } from "./RoleRepository";
import { UserRepository } from "./UserRepository";
import { injectable } from "inversify";

@injectable()
export class MongoUnitOfWork implements IUnitOfWork<ClientSession> {

    async startTransaction(): Promise<ClientSession> {
        const session = await mongoose.startSession();
        session.startTransaction();
        return session;
    }

    async commitTransaction(session: ClientSession): Promise<void> {
        await session.commitTransaction();
        await session.endSession();
    }

    async rollbackTransaction(session: ClientSession): Promise<void> {
        await session.abortTransaction();
        await session.endSession();
    }

    async runInTransaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
        const session = await this.startTransaction();
        try {
            const result = await work(session);
            await this.commitTransaction(session);
            return result;
        } catch (error) {
            await this.rollbackTransaction(session);
            throw error;
        }
    }
}