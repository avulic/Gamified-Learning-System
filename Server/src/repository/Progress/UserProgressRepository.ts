import { IUserProgressDb, UserProgressDb, UserProgressDocument } from '@/models/db/mongo';
import { inject, injectable } from 'inversify';
import { MongoRepository } from '../MongoRepository';


import { ILogger, TYPES } from '@/types';
import Logger from '@/utils/logger';
import { IUserProgress as IUserProgress } from '@/models/app/Progress/UserProgress.entity';
import { User } from '@/models/app';




@injectable()
export class UserProgressRepository extends MongoRepository<IUserProgress, IUserProgressDb, UserProgressDocument> {
    constructor(
        @inject(TYPES.Logger) private logger: ILogger
    ) {
        super(UserProgressDb);
    }

    toDomain(dbModel: IUserProgressDb): IUserProgress {
        return {} as unknown as IUserProgress;
    }

    toDatabase(domainModel: IUserProgress): IUserProgressDb {
        return {} as unknown as IUserProgressDb;
    }

    async getUserProgress(userId: string,): Promise<IUserProgress | null> {
        const dbProgress = await this.model.findOne({ userId: userId });
        this.logger.info(dbProgress)
        return dbProgress ? this.toDomain(dbProgress) : null;
    }

    async findByUserIdAndCourseId(userId: string, courseId: string): Promise<IUserProgress | null> {
        const dbProgress = await this.model.findOne({ userId: userId, courseId: courseId });
        this.logger.info(dbProgress)
        return dbProgress ? this.toDomain(dbProgress) : null;
    }

    async updateUserProgress(userId: string, courseId: string, update: IUserProgress): Promise<IUserProgress | null> {
        const dbUpdate = this.toDatabase(update);
        const updatedDbProgress = await this.model.findOneAndUpdate(
            { userId: userId, courseId: courseId },
            { $set: dbUpdate },
            { new: true, upsert: true }
        );
        return updatedDbProgress ? this.toDomain(updatedDbProgress) : null;
    }
}

export default UserProgressRepository;
