import { injectable } from 'inversify';
import { MongoRepository } from '../MongoRepository';
import { ITaskProgressDb, TaskProgressDb } from '@/models/db/mongo';
import { ITaskProgress } from '@/models/app/Progress/Progress';
import { ProgressMapper } from '@/utils/ModelMapper';
import { ObjectId } from 'mongodb';


@injectable()
export class TaskProgressRepository extends MongoRepository<ITaskProgress, ITaskProgressDb> {
    constructor() {
        super(TaskProgressDb);
    }

    toDomain(dbModel: ITaskProgressDb): ITaskProgress {
        return ProgressMapper.taskProgressDbToAppModel(dbModel);
    }

    toDatabase(domainModel: Partial<ITaskProgress>): Partial<ITaskProgressDb> {
        return ProgressMapper.taskProgressToDbModel(domainModel);
    }

    async findByUserAssignmentAndTask(userId: string, assignmentId: string, taskId: string): Promise<ITaskProgress | null> {
        const dbTaskProgress = await this.model.findOne({
            userId: new ObjectId(userId),
            assignmentId: new ObjectId(assignmentId),
            taskId: new ObjectId(taskId)
        });
        return dbTaskProgress ? this.toDomain(dbTaskProgress) : null;
    }

    async updateTaskProgress(taskProgress: Partial<ITaskProgress>): Promise<ITaskProgress> {
        const dbTaskProgress = this.toDatabase(taskProgress);
        const updatedDbTaskProgress = await this.model.findOneAndUpdate(
            {
                userId: dbTaskProgress.userId,
                assignmentId: dbTaskProgress.assignmentId,
                taskId: dbTaskProgress.taskId
            },
            { $set: dbTaskProgress },
            { new: true, upsert: true }
        );
        return this.toDomain(updatedDbTaskProgress);
    }
}

export default TaskProgressRepository;
