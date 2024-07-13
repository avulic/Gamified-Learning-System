'use Strict'
import { Request, Response } from 'express';
import ModuleService from '../services/ModuleService';
import { IModule, IModuleDb } from '../models/Module';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig';
import {logger} from '../utils/logger';

class ModuleController {
    private ModuleService: ModuleService;

    constructor(ModuleService: ModuleService) {
        this.ModuleService = ModuleService;
    }

    // Function to create a new Module
    public createModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const newModule: IModule = req.body;

            const createdModule = await this.ModuleService.createModule(newModule);
            res.status(201).json(createdModule);
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
            const Modules = await this.ModuleService.getAllModules();
            
            res.status(200).json(Modules);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch Modules' });
        }
    }

    // Function to get a Module by ID
    public getModuleById = async (req: Request, res: Response): Promise<void> => {
        try {
            const ModuleId = req.params.id;
            const Module = await this.ModuleService.getModuleById(ModuleId);
            if (!Module) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            res.status(200).json(Module);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch Module' });
        }
    }

    // Function to update a Module
    public updateModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const ModuleId = req.params.id;
            const updatedModuleData: IModule = req.body;
            const updatedModule = await this.ModuleService.updateModule(ModuleId, updatedModuleData);
            if (!updatedModule) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            res.status(200).json(updatedModule);
        } catch (err) {
            res.status(500).json({ error: 'Failed to update Module' });
        }
    }

    // Function to delete a Module
    public deleteModule = async (req: Request, res: Response): Promise<void> => {
        try {
            const ModuleId = req.params.id;
            const deletedModule = await this.ModuleService.deleteModule(ModuleId);

            if (!deletedModule) {
                res.status(404).json({ error: 'Module not found' });
                return;
            }
            res.status(200).json(deletedModule);
        } catch (err) {
            res.status(500).json({ error: 'Failed to delete Module' });
        }
    }

    
}

export default ModuleController;
