import { inject, injectable } from 'inversify';
import { TYPES } from '@/types';
import { IFile } from '@/models/app';
import { FileRepository } from '@/repository/FileRepository';
import { NotFoundError } from '../models/app/Errors/NotFoundError';
import { ClientError } from '../models/app/Errors/ClientError';
import Logger from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import { FileMapper } from '@/utils/ModelMapper';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

@injectable()
export class FileService {
    private uploadDir: string;

    constructor(
        @inject(TYPES.FileRepository) private fileRepository: FileRepository,
        @inject(TYPES.Logger) private logger: Logger
    ) {
        this.uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File, userId: string): Promise<IFile> {
        const filename = `${uuidv4()}-${file.originalname}`;
        const filePath = path.join(this.uploadDir, filename);

        await writeFileAsync(filePath, file.buffer);

        const newFile: Partial<IFile> = {
            filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: filePath,
            uploadedBy: userId,
            uploadedAt: new Date(),
            version: 1
        };

        return await this.fileRepository.create(newFile);
    }

    async getFileInfo(fileId: string): Promise<IFile> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new NotFoundError('File not found');
        }
        return file;
    }

    async downloadFile(fileId: string): Promise<{ buffer: Buffer; mimetype: string; filename: string }> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new NotFoundError('File not found');
        }

        const buffer = await readFileAsync(file.path);
        return {
            buffer,
            mimetype: file.mimetype,
            filename: file.originalname
        };
    }

    async deleteFile(fileId: string): Promise<boolean> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new NotFoundError('File not found');
        }

        await unlinkAsync(file.path);
        return await this.fileRepository.delete(fileId);
    }

    async getUserFiles(userId: string): Promise<IFile[]> {
        return await this.fileRepository.findByUploadedBy(userId);
    }

    async updateFileInfo(fileId: string, updateData: Partial<IFile>): Promise<IFile> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new NotFoundError('File not found');
        }

        // Prevent updating critical fields
        delete updateData.filename;
        delete updateData.path;
        delete updateData.uploadedBy;
        delete updateData.uploadedAt;

        const updatedFile = await this.fileRepository.update(fileId, updateData);
        if (!updatedFile) {
            throw new Error('Failed to update file');
        }

        return updatedFile;
    }
}

export default FileService;