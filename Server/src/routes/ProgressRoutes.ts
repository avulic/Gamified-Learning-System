import express, { Router } from 'express';
import { ProgressController } from "@/controllers/ProgressController";
import { asyncHandler } from '@/utils/asyncHandler';
import logger from '@/utils/logger';

export default class ProgressRoute {
    public router: Router = Router();
    constructor(private progressController: ProgressController) {
        this.setRoutes();
    }

    setRoutes() {
        // this.router.get('/:userId/:courseId', asyncHandler(this.progressController.getUserProgress));
        // this.router.put('/:userId/:courseId', this.progressController.updateUserProgress);

        // this.router.get('/task/:userId/:assignmentId/:taskId', this.progressController.getTaskProgress);
        // this.router.post('/task', this.progressController.updateTaskProgress);
    }
}
