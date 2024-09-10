import { inject, injectable } from 'inversify';
import { MongoRepository } from "./MongoRepository";
import Module,{ IModuleDb } from "@/models/db/mongo/Module"; // Assume these are defined elsewhere
import { IModule } from "@/models/app";
import { ModuleMapper,  } from "@/utils/ModelMapper";
import { Roles } from '@/models/enums';
import { NotFoundError } from '@/models/app/Errors/NotFoundError';
import { ClientSession, Types } from 'mongoose';
import { MongoUnitOfWork } from './MongoUnitOfWork';
import { IRepositoryContext } from './interface/IRepositoryContext';
import { TYPES } from '@/types';
import Logger from '@/utils/logger';

@injectable()
export class ModuleRepository extends MongoRepository<IModule, IModuleDb> {
    constructor(
        @inject(TYPES.Logger) private logger: Logger
    ) {
        super(Module);
    }

    toDomain(dbModel: IModuleDb): IModule {
        return ModuleMapper.dbToDomain(dbModel);
    }

    toDatabase(domainModel: Partial<IModule>): Partial<IModuleDb> {
        return ModuleMapper.toDb(domainModel);
    }

    async findByModulename(modulename: string, options?: { populate?: string[]}, context?: ClientSession): Promise<IModule | null> {
        const { populate = [] } = options || {};
        const module = await this.model.findOne({ modulename }).populate(populate).session(context!);
        return module ? this.toDomain(module) : null;
    }

    async findAll(options?: { populate?: string[]}, context?: ClientSession): Promise<IModule[] | null> {
        const { populate = [] } = options || {};
        const module = await this.model.find().populate(populate).session(context!);
        return module ? module.map(this.toDomain) : null;
    }

    async bulkCreate(modules: Partial<IModule>[], context: ClientSession): Promise<IModule[]> {
        const createdModules = await this.model.insertMany(
            modules.map(module => this.toDatabase(module)),
            { session: context }
        );
        return createdModules.map(module => this.toDomain(module));
    }

    async addLessonToModule(moduleId: string, lesson: { title: string; content: string; order: number }): Promise<IModule> {
        const module = await this.model.findById(moduleId);
        if (!module) {
            throw new NotFoundError('Module not found');
        }

        const newLesson = {
            _id: new Types.ObjectId(),
            title: lesson.title,
            content: lesson.content,
            order: lesson.order
        };

        module.lessons.push(newLesson);

        // Sort lessons by order after adding the new lesson
        module.lessons.sort((a, b) => a.order - b.order);

        const updatedModule = await module.save();
        return this.toDomain(updatedModule);
    }

}