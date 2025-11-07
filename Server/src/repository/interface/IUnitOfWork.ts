import mongoose, { ClientSession } from "mongoose";
import { CourseRepository } from "../CourseRepository";
import { FileRepository } from "../FileRepository";
import { ModuleRepository } from "../ModuleRepository";
import AssignmentRepository from "../AssignmentRepository";

export interface IUnitOfWork<TContext = unknown> {    
    beginTransaction(): Promise<ClientSession>;
    commitTransaction(session: ClientSession): Promise<mongoose.mongo.BSON.Document>;
    rollbackTransaction(session: ClientSession): Promise<void>;
}