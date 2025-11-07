import { injectable } from 'inversify';
import { MongoRepository } from "./MongoRepository";
import File, { FileDocument, IFileDb } from "@/models/db/mongo/File.db";
import { File as IFile } from "@/models/app";
import { fileMapper } from "@/utils/mapper/autoMapper";
import { Types } from 'mongoose';

@injectable()
export class FileRepository extends MongoRepository<IFile, IFileDb, FileDocument> {
    constructor() {
        super(File);
    }

    toDomain(dbModel: IFileDb): IFile {
        return fileMapper.toEntity(dbModel);
    }

    toDatabase(domainModel: IFile): IFileDb {
        return fileMapper.toDb(domainModel);
    }

    async findByFilename(filename: string): Promise<IFile | null> {
        const file = await this.model.findOne({ filename });
        return file ? this.toDomain(file) : null;
    }

    async findByUploadedBy(userId: string): Promise<IFile[]> {
        const files = await this.model.find({ uploadedBy: new Types.ObjectId(userId) });
        return files.map(file => this.toDomain(file));
    }
}