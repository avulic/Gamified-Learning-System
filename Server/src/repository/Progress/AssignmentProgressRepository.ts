import { DatabaseError } from "@/models/app/Errors/ServerError";
import { AssignmentProgress } from "@/models/app/Progress/AssignmentProgress.entity";
import AssignmentProgressModel, { IAssignmentProgressDb, AssignmentProgressDocument } from "@/models/db/mongo/AssignmentProgress.db";
import { ProgressTypeEnum } from "@/models/enums";
import { assignmentProgressMapper } from "@/utils/mapper/autoMapper";
import { injectable } from "inversify";
import { ClientSession } from "mongoose";
import { MongoRepository } from "../MongoRepository";

@injectable()
export class AssignmentProgressRepository extends MongoRepository<AssignmentProgress, IAssignmentProgressDb, AssignmentProgressDocument> {
    constructor() {
        super(AssignmentProgressModel);
    }

    toDomain(dbModel: IAssignmentProgressDb): AssignmentProgress {
        return assignmentProgressMapper.toEntity(dbModel);
    }

    toDatabase(domainModel: AssignmentProgress): IAssignmentProgressDb {
        return assignmentProgressMapper.toDb(domainModel);
    }

    async findByUserAndAssignment(
        userId: string,
        assignmentId: string,
        session?: ClientSession
    ): Promise<AssignmentProgress | null> {
        try {
            const query = this.model.findOne({
                userId,
                assignmentId
            });

            if (session) {
                query.session(session);
            }

            const progress = await query.exec();
            return progress ? this.toDomain(progress.toObject()) : null;
        } catch (error: any) {
            throw new DatabaseError('Database error: ' + error);
        }
    }

    async findByAssignment(
        assignmentId: string,
        options?: { populate?: string[] },
        session?: ClientSession
    ): Promise<AssignmentProgress[]> {
        try {
            const { populate = [] } = options || {};
            const query = this.model.find({ assignmentId });

            if (populate.length > 0) {
                populate.forEach(path => {
                    query.populate(path);
                });
            }

            if (session) {
                query.session(session);
            }

            const progresses = await query.exec();
            return progresses.map(progress => this.toDomain(progress.toObject()));
        } catch (error: any) {
            throw new DatabaseError('Database error: ' + error);
        }
    }

    async findUserAssignmentProgresses(
        userId: string,
        options?: { status?: ProgressTypeEnum },
        session?: ClientSession
    ): Promise<AssignmentProgress[]> {
        try {
            const filter: any = { userId };

            if (options?.status) {
                filter.status = options.status;
            }

            const query = this.model.find(filter);

            if (session) {
                query.session(session);
            }

            const progresses = await query.exec();
            return progresses.map(progress => this.toDomain(progress.toObject()));
        } catch (error: any) {
            throw new DatabaseError('Database error: ' + error);
        }
    }

    async findCompletedAssignments(
        userId: string,
        session?: ClientSession
    ): Promise<AssignmentProgress[]> {
        return this.findUserAssignmentProgresses(
            userId,
            { status: ProgressTypeEnum.COMPLETED },
            session
        );
    }

    async findByUser(
        userId: string,
        session?: ClientSession
    ): Promise<AssignmentProgress[]> {
        try {
            const query = this.model.find({ userId });

            if (session) {
                query.session(session);
            }

            const progresses = await query.exec();
            return progresses.map(progress => this.toDomain(progress.toObject()));
        } catch (error: any) {
            throw new DatabaseError('Database error: ' + error);
        }
    }
}

export default AssignmentProgressRepository;