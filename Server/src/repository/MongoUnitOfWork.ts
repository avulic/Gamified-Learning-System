import mongoose, { ClientSession, Connection } from "mongoose";
import { IUnitOfWork } from "./interface/IUnitOfWork";
import { RoleRepository } from "./RoleRepository";
import { UserRepository } from "./UserRepository";
import { inject, injectable } from "inversify";
import { CourseRepository } from "./CourseRepository";
import { FileRepository } from "./FileRepository";
import { ModuleRepository } from "./ModuleRepository";
import AssignmentRepository from "./AssignmentRepository";
import { TYPES } from "@/types";


@injectable()
export class MongoUnitOfWork implements IUnitOfWork {
    constructor(
        @inject(TYPES.DbConnection) private readonly connection: Connection,
    ) {}

    async beginTransaction(): Promise<ClientSession> {
        const session = await this.connection.startSession();
        session.startTransaction({
            readPreference: 'primary',
            readConcern: { level: 'local' },
            writeConcern: { w: 'majority' }
        });



        return session;
    }

    async commitTransaction(session: ClientSession): Promise<mongoose.mongo.BSON.Document> {
        const result = await session.commitTransaction();
        await session.endSession();

        return result;
    }

    async rollbackTransaction(session: ClientSession): Promise<void> {
        await session.abortTransaction();
        await session.endSession();
    }
}
