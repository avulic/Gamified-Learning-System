// TaskRepository.ts
import { inject, injectable } from 'inversify';
import { MongoRepository } from "./MongoRepository";
import BaseTask, { IBaseTaskDb, ITaskDb, BaseTaskDocument } from '@/models/db/mongo/Task.db';
import { Task } from "@/models/app";
import { ClientSession, Types } from 'mongoose';
import { taskMapper } from '@/utils/mapper/autoMapper';
import { TaskTypeEnum, ProgressTypeEnum } from '@/models/enums';

@injectable()
export class TaskRepository extends MongoRepository<Task, ITaskDb, BaseTaskDocument> {
    constructor() {
        super(BaseTask);
    }

    toDomain(dbModel: ITaskDb): Task {
        return taskMapper.toEntity(dbModel);
    }

    toDatabase(domainModel: Task): ITaskDb {
        return taskMapper.toDb(domainModel);
    }

    async findByAssignmentId(
        assignmentId: string, 
        options?: { populate?: string[] }, 
        context?: ClientSession
    ): Promise<Task[]> {
        const { populate = [] } = options || {};
        const tasks = await this.model
            .find({ assignmentId: new Types.ObjectId(assignmentId) })
            .populate(populate)
            .session(context!);
        return tasks.map(task => this.toDomain(task.toObject()));
    }

    async findTasksByType(
        taskType: TaskTypeEnum,
        options?: { populate?: string[] },
        context?: ClientSession
    ): Promise<Task[]> {
        const { populate = [] } = options || {};
        const tasks = await this.model
            .find({ taskType })
            .populate(populate)
            .session(context!);
        return tasks.map(task => this.toDomain(task.toObject()));
    }

    async findAll(options?: { populate?: string[] }, context?: ClientSession): Promise<Task[] | null> {
        const query = this.model.find();
        
        if (context) {
            query.session(context);
        }

        const courses = await query.exec();
        return courses ? courses.map(c => this.toDomain(c.toObject())) : null;
    }
}
