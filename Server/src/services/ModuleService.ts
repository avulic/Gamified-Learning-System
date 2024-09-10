import { IModule } from "@/models/app";
import { NotFoundError } from "@/models/app/Errors/NotFoundError";
import { ILesson } from "@/models/app/Lesson";
import { CreateModuleDto, UpdateModuleDto } from "@/models/dto";
import { FileRepository } from "@/repository/FileRepository";
import { ModuleRepository } from "@/repository/ModuleRepository";
import { TYPES } from "@/types";
import { ModuleMapper } from "@/utils/ModelMapper";
import { injectable, inject } from "inversify";
import { Logger } from "winston";


@injectable()
export class ModuleService {
    constructor(
        @inject(TYPES.ModuleRepository) private moduleRepository: ModuleRepository,
        @inject(TYPES.FileRepository) private fileRepository: FileRepository,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    async createModule(newModule: IModule): Promise<IModule> {
        if (newModule.filesId && newModule.filesId.length > 0) {
            newModule.files = await Promise.all(
                newModule.filesId.map(async id => {
                    const file = await this.fileRepository.findById(id);
                    if(!file)
                        throw new NotFoundError("module not found");
                    return file;
                })
            );
        }

        // Create the module
        const createdModule = await this.moduleRepository.create(newModule);
        return createdModule;
    }

    async getModuleById(id: string): Promise<IModule> {
        const module = await this.moduleRepository.findById(id, { populate: ['lessons', 'files'] });
        if (!module) {
            throw new NotFoundError('Module not found');
        }
        return module;
    }

    async updateModule(id: string, updateModuleData: Partial<IModule>): Promise<IModule> {
        const existingModule = await this.moduleRepository.findById(id);
        if (!existingModule) {
            throw new NotFoundError('Module not found');
        } 

        // Update files if provided
        if (updateModuleData.filesId && updateModuleData.filesId.length > 0) {
            updateModuleData.files = await Promise.all(
                updateModuleData.filesId.map(async id => {
                    const file = await this.fileRepository.findById(id);
                    if(!file)
                        throw new NotFoundError("module not found");
                    return file;
                })
            );
        }

        const updatedModule = await this.moduleRepository.update(id, updateModuleData);
        if (!updatedModule) {
            throw new NotFoundError("Module not updated");
        }

        return updatedModule;
    }

    async deleteModule(id: string): Promise<boolean> {
        const result = await this.moduleRepository.delete(id);
        if (!result) {
            throw new NotFoundError('Module not found');
        }
        return result;
    }

    async getAllModules(): Promise<IModule[]> {
        const modules = await this.moduleRepository.findAll();
        if (!modules) {
            throw new NotFoundError("No modules found");
        }
        return modules;
    }

    async addLessonToModule(moduleId: string, lesson: ILesson): Promise<IModule> {
        const module = await this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new NotFoundError('Module not found');
        }

        const updatedModule = await this.moduleRepository.addLessonToModule(moduleId, lesson);
        if (!updatedModule) {
            throw new NotFoundError('Lesson not found');
        }

        return updatedModule;
    }

    async removeLessonFromModule(moduleId: string, lessonId: string): Promise<IModule> {
        const module = await this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new NotFoundError('Module not found');
        }

        module.lessons = module.lessons?.filter(lesson => lesson.id !== lessonId) || [];
        const updatedModule = await this.moduleRepository.update(moduleId, { lessons: module.lessons });
        if(!updatedModule)
            throw new NotFoundError("Module not found");

        return updatedModule;
    }

    async addFileToModule(moduleId: string, fileId: string): Promise<IModule> {
        const module = await this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new NotFoundError('Module not found');
        }

        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new NotFoundError('File not found');
        }

        module.files = module.files || [];
        module.files.push(file);

        const updatedModule = await this.moduleRepository.update(moduleId, { files: module.files });
        if(!updatedModule)
            throw new NotFoundError("Module not found");

        return updatedModule;
    }

    async removeFileFromModule(moduleId: string, fileId: string): Promise<IModule> {
        const module = await this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new NotFoundError('Module not found');
        }

        module.files = module.files?.filter(file => file.id !== fileId) || [];
        const updatedModule = await this.moduleRepository.update(moduleId, { files: module.files });
        if(!updatedModule)
            throw new NotFoundError("Module not found");

        return updatedModule;
    }
}

export default ModuleService;