import { inject, injectable } from 'inversify';
import { MongoRepository } from "./MongoRepository";
import Module, { ILessonDb, IModuleDb, ModuleDocument } from "@/models/db/mongo/Module.db";
import { Module as IModule } from "@/models/app";
import { moduleMapper } from "@/utils/mapper/autoMapper";
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { ClientSession, Types } from 'mongoose';

import { ILogger, TYPES } from '@/types';
import Logger from '@/utils/logger';
import { Lesson as ILesson } from '@/models/app/Lesson.entity';
@injectable()
export class ModuleRepository extends MongoRepository<IModule, IModuleDb, ModuleDocument> {
    constructor(
        @inject(TYPES.Logger) private logger: ILogger
    ) {
        super(Module);
    }

    toDomain(dbModel: IModuleDb): IModule {
        return moduleMapper.toEntity(dbModel);
    }

    toDatabase(domainModel: IModule): IModuleDb {
        return moduleMapper.toDb(domainModel);
    }

    async findByModulename(modulename: string, options?: { populate?: string[] }, context?: ClientSession): Promise<IModule | null> {
        const { populate = [] } = options || {};
        const module = await this.model.findOne({ modulename }).populate(populate).session(context!);
        return module ? this.toDomain(module) : null;
    }

    async findByLessonId(lessonId: string, options?: { populate?: string[] }, context?: ClientSession): Promise<IModule | null> {
        const { populate = [] } = options || {};
        const module = await this.model.findOne({ "lessons._id": lessonId }).populate(populate).session(context!);
        return module ? this.toDomain(module) : null;
    }

    async findByCourseId(courseId: string, options?: { populate?: string[] }, context?: ClientSession): Promise<IModule[] | null> {
        const { populate = [] } = options || {};
        const module = await this.model.find({ "courseId": courseId }).populate(populate).session(context!);
        return module ? module.map(m => this.toDomain(m.toObject({ versionKey: false }))) : null;
    }

    async findAll(options?: { populate?: string[] }, context?: ClientSession): Promise<IModule[] | null> {
        const { populate = [] } = options || {};
        const module = await this.model.find().populate(populate).session(context!);
        return module ? module.map(m => this.toDomain(m.toObject({ versionKey: false }))) : null;
    }

    async bulkCreate(modules: IModule[], context: ClientSession): Promise<IModule[]> {
        const createdModules = await this.model.insertMany(
            modules.map(module => this.toDatabase(module)),
            { session: context }
        );
        return createdModules.map(module => this.toDomain(module));
    }

    async addLessonToModule(moduleId: string, lessonData: ILesson, context?: ClientSession): Promise<IModule> {
        const moduleLessons = moduleMapper.toDb({ lessons: [lessonData] } as IModule)

        const updatedModule = await this.model.findByIdAndUpdate(moduleId,
            {
                $push: {
                    lessons: moduleLessons
                }
            }
        );

        if (!updatedModule) {
            throw new NotFoundError('Module not found');
        }

        return this.toDomain(updatedModule.toObject());
    }

}