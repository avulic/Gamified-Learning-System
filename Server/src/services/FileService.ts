import { inject, injectable } from 'inversify';
import { ILogger, TYPES } from '@/types';
import { File as IFile } from '@/models/app';
import { FileRepository } from '@/repository/FileRepository';
import { NotFoundError } from '../models/app/Errors/NotFoundError';
import { ClientError } from '../models/app/Errors/ClientError';
import Logger from '../utils/logger';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { promisify } from 'util';
import mime from 'mime-types';
import { FileStatus } from '@/models/app/File.entity';

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);

@injectable()
export class FileService {
    private uploadDir: string;
    private readonly ALLOWED_MIMETYPES = [
        'application/pdf', 'image/jpeg', 'image/png', 'image/gif',
        'text/plain', 'text/csv', 'application/json', 'text/html',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    constructor(
        @inject(TYPES.FileRepository) private fileRepository: FileRepository,
        @inject(TYPES.Logger) private logger: ILogger
    ) {
        this.uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '..', '..', 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    private validateFile(file: Express.Multer.File) {
        if (!this.ALLOWED_MIMETYPES.includes(file.mimetype)) {
            throw new ClientError(`Unsupported file type: ${file.mimetype}`);
        }
        if (file.size > this.MAX_FILE_SIZE) {
            throw new ClientError(`File size exceeds limit of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
    }

    private async saveFileToDisk(file: Express.Multer.File): Promise<{ filename: string, filePath: string }> {
        const filename = `${uuidv4()}-${file.originalname}`;
        const filePath = path.join(this.uploadDir, filename);
        await writeFileAsync(filePath, file.buffer);
        return { filename, filePath };
    }

    async uploadFile(
        file: Express.Multer.File,
        userId: string,
        parentType: string,
        parentId: string
    ): Promise<IFile> {
        try {
            this.validateFile(file);
            const { filename, filePath } = await this.saveFileToDisk(file);

            const newFile: IFile = {
                filename,
                originalName: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                url: filePath,
                uploadedBy: userId,
                uploadedAt: new Date(),
                isPublic: false,
                tags: [],
                status: FileStatus.PROCESSING,
                parentType,
                parentId,
                encoding: file.encoding || 'utf-8',
                path: filePath,
                lastModified: new Date(),
                version: 1
            } as unknown as IFile;

            const savedFile = await this.fileRepository.create(newFile);
            this.logger.info(`File uploaded successfully: ${filename}`);
            return savedFile;

        } catch (error: any) {
            this.logger.error(`File upload failed: ${error.message}`);
            throw error;
        }
    }

    async downloadFile(fileId: string): Promise<{ buffer: Buffer; mimetype: string; filename: string }> {
        const file = await this.getFileInfo(fileId);

        if (!file.url) {
            throw new ClientError('File URL is missing');
        }

        try {
            const buffer = await readFileAsync(file.url);
            return {
                buffer,
                mimetype: file.mimetype,
                filename: file.originalName
            };
        } catch (error: any) {
            this.logger.error(`File download failed: ${error.message}`);
            throw new Error(`Failed to download file: ${error.message}`);
        }
    }

    async deleteFile(fileId: string, userId: string): Promise<boolean> {
        const file = await this.getFileInfo(fileId);

        if (file.uploadedBy !== userId) {
            throw new ClientError('Unauthorized to delete this file');
        }

        try {
            if (file.url) {
                await unlinkAsync(file.url);
            }
            return await this.fileRepository.delete(fileId);
        } catch (error: any) {
            this.logger.error(`File deletion failed: ${error.message}`);
            throw error;
        }
    }


    async getFileInfo(fileId: string): Promise<IFile> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new NotFoundError('File not found');
        }
        return file;
    }

    async getUserFiles(userId: string): Promise<IFile[]> {
        return await this.fileRepository.findByUploadedBy(userId);
    }

    async updateFileInfo(fileId: string, updateData: IFile): Promise<IFile> {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw new NotFoundError('File not found');
        }

        // Prevent updating critical fields
        // delete updateData.filename;
        // delete updateData.url;
        // delete updateData.uploadedBy;
        // delete updateData.uploadedAt;

        const updatedFile = await this.fileRepository.update(fileId, updateData);
        if (!updatedFile) {
            throw new Error('Failed to update file');
        }

        return updatedFile;
    }


    async getFileContent(fileId: string, encoding: BufferEncoding = 'utf-8'): Promise<string | Buffer> {
        try {
            const file = await this.fileRepository.findById(fileId);
            if (!file) {
                throw new NotFoundError('File not found');
            }

            if (!file.url) {
                throw new ClientError('File URL is missing');
            }

            // For binary files, return raw buffer
            const binaryTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/octet-stream'];
            if (binaryTypes.includes(file.mimetype)) {
                return await readFileAsync(file.url);
            }

            // For text files, return string with specified encoding
            const textTypes = ['text/plain', 'text/csv', 'text/markdown', 'application/json', 'text/html', 'application/xml'];
            if (textTypes.includes(file.mimetype)) {
                return await readFileAsync(file.url, encoding);
            }

            // For other types, try to read as text first, fallback to binary
            try {
                return await readFileAsync(file.url, encoding);
            } catch (error: any) {
                this.logger.warn(`Failed to read file as text, falling back to binary: ${error.message}`);
                return await readFileAsync(file.url);
            }
        } catch (error: any) {
            this.logger.error(`Error reading file content: ${error.message}`);
            if (error instanceof NotFoundError || error instanceof ClientError) {
                throw error;
            }
            throw new Error(`Failed to read file content: ${error.message}`);
        }
    }

    // Helper method to get file content as string (throws if file is binary)
    async getFileContentAsString(fileId: string, encoding: BufferEncoding = 'utf-8'): Promise<string> {
        const content = await this.getFileContent(fileId, encoding);
        if (Buffer.isBuffer(content)) {
            throw new ClientError('File content is binary and cannot be converted to string');
        }
        return content;
    }

    // Helper method to get file content as buffer
    async getFileContentAsBuffer(fileId: string): Promise<Buffer> {
        const content = await this.getFileContent(fileId);
        if (!Buffer.isBuffer(content)) {
            return Buffer.from(content);
        }
        return content;
    }
}

export default FileService;