import { Module as IModule } from "@/models/app";
import { NotFoundError } from "@/models/app/Errors/NotFoundError";
import { Lesson as ILesson } from "@/models/app/Lesson.entity";
import { File } from "@/models/app/File.entity";

import { FileRepository } from "@/repository/FileRepository";
import { ModuleRepository } from "@/repository/ModuleRepository";
import { TYPES } from "@/types";

import { injectable, inject } from "inversify";
import { Logger } from "winston";
import { ClientSession, Types } from "mongoose";
import AssignmentService from "./AssignmentService";
import { IAssignmentDb } from "@/models/db/mongo";


@injectable()
export class ModuleService {
    constructor(
        @inject(TYPES.ModuleRepository) private moduleRepository: ModuleRepository,
        @inject(TYPES.FileRepository) private fileRepository: FileRepository,
        @inject(TYPES.AssignmentService) private assignmentService: AssignmentService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    async createModule(newModule: IModule): Promise<IModule> {
        if (newModule.files && newModule.files.length > 0) {
            newModule.files = await Promise.all(
                newModule.files.map(async (f: File) => {
                    var file;
                    if (f.id)
                        file = await this.fileRepository.findById(f.id);
                    else
                        file = await this.fileRepository.create(f)
                    if (!file)
                        throw new NotFoundError("file error on module createw");
                    return file;
                })
            );
        }

        // Create the module
        const createdModule = await this.moduleRepository.create(newModule);
        return createdModule;
    }

    async getModuleById(id: string): Promise<IModule> {
        const module = await this.moduleRepository.findById(id, { populate: ['lessons', 'fileIds'] });
        if (!module) {
            throw new NotFoundError('Module not found');
        }
        return module;
    }

    async getModulesByCourseIdDetail(id: string, session?: ClientSession): Promise<IModule[]> {
        const modules = await this.moduleRepository.findByCourseId(id, { populate: ['lessons', 'fileIds', 'lessons.fileIds'] }, session);
        if (!modules || modules.length === 0) {
            throw new NotFoundError('Module not found');
        }

        const modulesWithAssignments = await Promise.all(
            modules.map(async (module) => {
                // Get assignments for this module
                const moduleAssignments = await this.assignmentService.getAssignmentsByModule(module.id as string, session);
                module.assignments = moduleAssignments;

                // If module has lessons, get assignments for each lesson
                if (module.lessons && module.lessons.length > 0) {
                    await Promise.all(
                        module.lessons.map(async (lesson) => {
                            // Get assignments for this lesson
                            const lessonAssignments = await this.assignmentService.getAssignmentsByLesson(lesson.id as string, session);
                            lesson.assignments = lessonAssignments;
                            return lesson; // Explicit return for clarity
                        })
                    );
                }

                return module;
            })
        );

        return modulesWithAssignments;
    }

    async updateModule(id: string, updateModuleData: IModule): Promise<IModule> {
        const existingModule = await this.moduleRepository.findById(id);
        if (!existingModule) {
            throw new NotFoundError('Module not found');
        }

        // Update files if provided
        if (updateModuleData.files && updateModuleData.files.length > 0) {
            updateModuleData.files = await Promise.all(
                updateModuleData.files.map(async f => {
                    if (!f.id)
                        throw new NotFoundError("file not found");
                    const file = await this.fileRepository.findById(f.id);
                    if (!file)
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
        const updatedModule = await this.moduleRepository.addLessonToModule(moduleId, lesson);
        return updatedModule;
    }

    async deleteLessonFromModule(lessonId: string): Promise<IModule> {
        const module = await this.moduleRepository.findByLessonId(lessonId);
        if (!module) {
            throw new NotFoundError('Module not found');
        }

        module.lessons = module.lessons?.filter(lesson => lesson.id !== lessonId) || [];
        const updatedModule = await this.moduleRepository.update(module.id as string, module);
        if (!updatedModule)
            throw new NotFoundError("Module not updated");

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

        const updatedModule = await this.moduleRepository.update(moduleId, module);
        if (!updatedModule)
            throw new NotFoundError("Module not found");

        return updatedModule;
    }

    async removeFileFromModule(moduleId: string, fileId: string): Promise<IModule> {
        const module = await this.moduleRepository.findById(moduleId);
        if (!module) {
            throw new NotFoundError('Module not found');
        }

        module.files = module.files?.filter(file => file.id !== fileId) || [];
        const updatedModule = await this.moduleRepository.update(moduleId, module);
        if (!updatedModule)
            throw new NotFoundError("Module not found");

        return updatedModule;
    }
}

export default ModuleService;