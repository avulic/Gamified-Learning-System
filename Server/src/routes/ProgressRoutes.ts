import express from 'express';
import { ProgressController } from "@/controllers/ProgressController";
import { asyncHandler } from '@/utils/asyncHandler';
import Logger from '@/utils/logger';

export default class ProgressRoute {
    public router = express.Router();
    private logger = new Logger()
    constructor(private progressController: ProgressController) {
        this.setRoutes();
    }

    setRoutes() {
        this.router.get('/:userId/:courseId', asyncHandler(this.progressController.getUserProgress));
        this.router.put('/:userId/:courseId', this.progressController.updateUserProgress);

        this.router.get('/task/:userId/:assignmentId/:taskId', this.progressController.getTaskProgress);
        this.router.post('/task', this.progressController.updateTaskProgress);
    }
}
