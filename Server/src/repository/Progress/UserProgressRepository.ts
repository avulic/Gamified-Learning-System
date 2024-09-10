import { IUserProgressDb, UserProgressDb } from '@/models/db/mongo';
import { inject, injectable } from 'inversify';
import { MongoRepository } from '../MongoRepository';
import { IUserProgress, ICourseProgress } from '@/models/app/Progress/Progress';
import { ProgressMapper } from '@/utils/ModelMapper';
import { TYPES } from '@/types';
import Logger from '@/utils/logger';




@injectable()
export class UserProgressRepository extends MongoRepository<IUserProgress,  IUserProgressDb> {
    constructor(
        @inject(TYPES.Logger) private logger:Logger
    ) {
        super(UserProgressDb);
    }

    toDomain(dbModel: IUserProgressDb): IUserProgress {
        return ProgressMapper.userProgressDbToAppModel(dbModel);
    }

    toDatabase(domainModel: Partial<IUserProgress>): Partial<IUserProgressDb> {
        return ProgressMapper.userProgressToDbModel(domainModel);
    }

    async findByUserIdAndCourseId(userId: string, courseId: string): Promise<IUserProgress | null> {
        const dbProgress = await this.model.findOne({ userId: userId, courseId: courseId });
        this.logger.info(dbProgress)
        return dbProgress ? this.toDomain(dbProgress) : null;
    }

    async updateUserProgress(userId: string, courseId: string, update: Partial<IUserProgress>): Promise<IUserProgress | null> {
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
