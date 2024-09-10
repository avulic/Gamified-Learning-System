'use Strict'
import { Request, Response } from 'express';

import Logger from '../utils/logger';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import ModuleService from '@/services/ModuleService';
import { IModule } from '@/models/app';
import { CreateModuleDto, ModuleResponseDto } from '@/models/dto';
import { ModuleMapper } from '@/utils/ModelMapper';

@injectable()
class ModuleController {
    constructor(
        @inject(TYPES.ModuleService) private moduleService: ModuleService,
        @inject(TYPES.Logger) private logger: Logger
    ) { }

    // Function to create a new Module
    public createModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const newModuleDTO: CreateModuleDto = req.body;
            const newModule: IModule = ModuleMapper.createDtoToDomain(newModuleDTO);

            const createdModule = await this.moduleService.createModule(newModule);
            const response: ModuleResponseDto = ModuleMapper.toResponseDto(createdModule);
            res.status(201).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to create Module' + err });
        }
    }

    // Function to create a new Modules
    // public createModules = async (req: Request, res: Response): Promise<void> => {
    //     try {
    //         const newModules: IModule[] = req.body;
    //         console.log(req.body)
    //         const createdModules = await this.ModuleService.createModules(newModules);
    //         res.status(201).json(createdModules);
    //     } catch (err) {
    //         res.status(500).json({ error: 'Failed to create Modules' + err });
    //     }
    // }

    // Function to get all Modules
    public getAllModules = async (req: Request, res: Response): Promise<void> => {
        try {
            const modules = await this.moduleService.getAllModules();
            const response: ModuleResponseDto[] = modules.map(ModuleMapper.toResponseDto);
            
            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch Modules' });
        }
    }

    // Function to get a Module by ID
    public getModuleById = async (req: Request, res: Response): Promise<void> => {
        try {
            const moduleId = req.params.id;
            const module = await this.moduleService.getModuleById(moduleId);
            if (!module) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            const response: ModuleResponseDto = ModuleMapper.toResponseDto(module);

            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch Module' });
        }
    }

    // Function to update a Module
    public updateModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const moduleId = req.params.id;
            const updatedModuleDTO: CreateModuleDto = req.body;
            const moduleData: Partial<IModule> = ModuleMapper.updateDtoToDomain(updatedModuleDTO);

            const updatedModule = await this.moduleService.updateModule(moduleId, moduleData);
            if (!updatedModule) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            const response: ModuleResponseDto = ModuleMapper.toResponseDto(updatedModule);

            res.status(200).json(response);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update Module' });
        }
    }

    // Function to delete a Module
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

    
}

export default ModuleController;
