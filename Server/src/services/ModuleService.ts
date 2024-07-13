import { Types } from 'mongoose';
import Module, { IModule, IModuleDb } from '../models/Module';
import User from '../models/User';
import { ClientError } from '../models/Errors/ClientError';
import { NotFoundError } from '../models/Errors/NotFoundError';
import { logger } from '../utils/logger';
import { mappedModuleToAppModel } from '../utils/ModelMapper';

class ModuleService {
    public async createModule(moduleData: Omit<IModule, 'id'>): Promise<IModule> {
        const module = new Module(moduleData);
        await module.save();
        logger.info('Module created', { moduleId: module._id });
        return mappedModuleToAppModel(module);
    }

    public async getModuleById(moduleId: string): Promise<IModule> {
        if (!Types.ObjectId.isValid(moduleId)) {
            throw new ClientError('Invalid Module ID');
        }
        
        const module = await Module.findById(moduleId);
        if (!module) {
            throw new NotFoundError(`Module with ID ${moduleId} not found`);
        }

        return mappedModuleToAppModel(module);
    }

    public async getAllModules(): Promise<IModule[]> {
        const modules = await Module.find();
        return modules.map(mappedModuleToAppModel);
    }

    public async updateModule(moduleId: string, updateData: Partial<Omit<IModule, 'id'>>): Promise<IModule> {
        if (!Types.ObjectId.isValid(moduleId)) {
            throw new ClientError('Invalid Module ID');
        }

        const module = await Module.findByIdAndUpdate(moduleId, updateData, { new: true });
        if (!module) {
            throw new NotFoundError(`Module with ID ${moduleId} not found`);
        }

        logger.info('Module updated', { moduleId: module._id });
        return mappedModuleToAppModel(module);
    }

    public async deleteModule(moduleId: string): Promise<boolean> {
        if (!Types.ObjectId.isValid(moduleId)) {
            throw new ClientError('Invalid Module ID');
        }

        const module = await Module.findByIdAndDelete(moduleId);
        if (!module) {
            throw new NotFoundError(`Module with ID ${moduleId} not found`);
        }

        logger.info('Module deleted', { moduleId: module._id });

        return !!module;
    }
}

export default ModuleService;