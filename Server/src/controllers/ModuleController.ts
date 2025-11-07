
import { Request, Response } from 'express';

import Logger from '../utils/logger';
import { inject, injectable } from 'inversify';
import { ILogger, TYPES } from '@/types';
import ModuleService from '@/services/ModuleService';
import { Module } from '@/models/app';
import { RequestDto, ResponseDto } from '@/models/dto';

import { CreateModuleDto } from '@/models/dto/request';
import { ModuleResponseDto } from '@/models/dto/response';

@injectable()
class ModuleController {
    constructor(
        @inject(TYPES.ModuleService) private moduleService: ModuleService,
        @inject(TYPES.Logger) private logger: ILogger
    ) { }

    public createModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const newModuleDTO: CreateModuleDto = req.body;
            const newModule: Module = newModuleDTO as unknown as Module;

            const createdModule = await this.moduleService.createModule(newModule);
            const response: ModuleResponseDto = createdModule as unknown as ModuleResponseDto;
            res.status(201).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create Module' + err });
        }
    }

    // public createModules = async (req: Request, res: Response): Promise<void> => {
    //     try {
    //         const newModules: Module[] = req.body;
    //         console.log(req.body)
    //         const createdModules = await this.ModuleService.createModules(newModules);
    //         res.status(201).json(createdModules);
    //     } catch (err) {
    //         res.status(500).json({ error: 'Failed to create Modules' + err });
    //     }
    // }

    public getAllModules = async (req: Request, res: Response): Promise<void> => {
        try {
            const modules = await this.moduleService.getAllModules();
            const response: ModuleResponseDto[] = modules as unknown as ModuleResponseDto[];

            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch Modules' });
        }
    }

    public getModuleById = async (req: Request, res: Response): Promise<void> => {
        try {
            const moduleId = req.params.id;
            const module = await this.moduleService.getModuleById(moduleId);
            if (!module) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            const response: ModuleResponseDto = module as unknown as ModuleResponseDto;

            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch Module' });
        }
    }

    public updateModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const moduleId = req.params.id;
            const updatedModuleDTO: CreateModuleDto = req.body;
            const moduleData: Module = updatedModuleDTO as unknown as Module;

            const updatedModule = await this.moduleService.updateModule(moduleId, moduleData);
            if (!updatedModule) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            const response: ModuleResponseDto = updatedModule as unknown as ModuleResponseDto;

            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update Module' });
        }
    }

    public deleteModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const moduleId = req.params.id;
            const deletedModule = await this.moduleService.deleteModule(moduleId);

            if (!deletedModule) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            res.status(200).json({ message: 'Module deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete Module' });
        }
    }

    public deleteLessonFromModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const lessonId = req.params.lessonId;
            const deletedModule = await this.moduleService.deleteLessonFromModule(lessonId);

            if (!deletedModule) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            res.status(200).json({ message: 'Module deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete Module' });
        }
    }

}

export default ModuleController;
