import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';

import { ProgressService } from '@/services/Progress/ProgressService';
import { TaskStatus } from '@/models/enums';
import { UserProgressDTO, TaskProgressDTO } from '@/models/dto/Progress';
import { ProgressMapper } from '@/utils/ModelMapper';
import Logger from '@/utils/logger';

@injectable()
export class ProgressController {
    constructor(
        @inject(TYPES.ProgressService) private progressService: ProgressService,
        @inject(TYPES.Logger) private logger: Logger
    ) {}

    
    public getUserProgress = async(req: Request, res: Response) => {
        try {
            
            const { userId, courseId } = req.params;
            this.logger.info("s");
            const progress = await this.progressService.getUserProgress(userId, courseId);
            const progressDto: UserProgressDTO = ProgressMapper.toDto(progress);
            res.status(200).json(progressDto);
        } catch (error) {
            res.status(500).json({  message: error });
        }
    }

    async updateUserProgress(req: Request, res: Response) {
        try {
            const { userId, courseId } = req.params;
            const progressUpdate = req.body;
            const updatedProgress = await this.progressService.updateUserProgress(userId, courseId, progressUpdate);
            const progressDto: UserProgressDTO = ProgressMapper.toDto(updatedProgress);
            res.json(progressDto);
        } catch (error) {
            res.status(400).json({ message: error });
        }
    }

    async getTaskProgress(req: Request, res: Response) {
        try {
            const { userId, assignmentId, taskId } = req.params;
            const taskProgress = await this.progressService.getTaskProgress(userId, assignmentId, taskId);
            const taskProgressDto: TaskProgressDTO = ProgressMapper.taskToDto(taskProgress);
            res.json(taskProgressDto);
        } catch (error) {
            res.status(404).json({ message: error });
        }
    }

    async updateTaskProgress(req: Request, res: Response) {
        try {
            const taskProgressUpdate = req.body;
            const updatedTaskProgress = await this.progressService.updateTaskProgress(taskProgressUpdate);
            const taskProgressDto: TaskProgressDTO = ProgressMapper.taskToDto(updatedTaskProgress);
            res.json(taskProgressDto);
        } catch (error) {
            res.status(400).json({ message: error });
        }
    }
}