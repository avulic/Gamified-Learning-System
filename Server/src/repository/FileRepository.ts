import { injectable } from 'inversify';
import { MongoRepository } from "./MongoRepository";
import File, { IFileDb } from "@/models/db/mongo/File";
import { IFile } from "@/models/app";
import { FileMapper } from "@/utils/ModelMapper";
import { Types } from 'mongoose';

@injectable()
export class FileRepository extends MongoRepository<IFile, IFileDb> {
    constructor() {
        super(File);
    }

    toDomain(dbModel: IFileDb): IFile {
        return FileMapper.toDomain(dbModel);
    }

    toDatabase(domainModel: Partial<IFile>): Partial<IFileDb> {
        return FileMapper.toDatabase(domainModel);
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