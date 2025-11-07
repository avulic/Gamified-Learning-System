import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';

import FileService from '@/services/FileService';

@injectable()
export class FileController {
    constructor(@inject(TYPES.FileService) private fileService: FileService) {}

    async uploadFile(req: Request, res: Response) {
        try {
            const file = req.file as Express.Multer.File; // This is now correctly typed
            const userId = req.body.userId as string; // Assuming userId is part of the body
            const parentType = req.body.parentType as string; // Assuming userId is part of the body
            const parentId = req.body.parentId as string; // Assuming userId is part of the body
            const uploadedFile = await this.fileService.uploadFile(file, userId, parentType, parentId);
            res.status(201).json(uploadedFile);
        } catch (error) {
            res.status(500).json({ message: 'Error uploading file', error });
        }
    }

    async getFileInfo(req: Request, res: Response) {
        try {
            const fileId = req.params.id;
            const file = await this.fileService.getFileInfo(fileId);
            res.json(file);
        } catch (error) {
            res.status(404).json({ message: 'File not found', error });
        }
    }

    
    async downloadFile(req: Request, res: Response) {
        try {
            const fileId = req.params.id;
            const { buffer, mimetype, filename } = await this.fileService.downloadFile(fileId);
            res.setHeader('Content-Type', mimetype);
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.send(buffer);
        } catch (error) {
            res.status(404).json({ message: 'File not found', error });
        }
    }

    
    async deleteFile(req: Request, res: Response) {
        try {
            const fileId = req.params.id;
            const userId = req.params.userId;
            await this.fileService.deleteFile(fileId, userId);
            res.status(204).send();
        } catch (error) {
            res.status(404).json({ message: 'File not found', error });
        }
    }

    async getUserFiles(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const files = await this.fileService.getUserFiles(userId);
            res.json(files);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving user files', error });
        }
    }

    async updateFileInfo(req: Request, res: Response) {
        try {
            const fileId = req.params.id;
            const updateData = req.body;
            const updatedFile = await this.fileService.updateFileInfo(fileId, updateData);
            res.json(updatedFile);
        } catch (error) {
            res.status(404).json({ message: 'File not found', error });
        }
    }
}