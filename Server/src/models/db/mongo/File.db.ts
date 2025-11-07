import { FileStatus } from '@/models/app/File.entity';
import { ParentType } from '@/models/enums';
import { AutoMap } from 'automapper-classes';
import { model, Schema, Document, Types } from 'mongoose';



export class IFileDb{
    @AutoMap()
    _id?: Types.ObjectId;
    @AutoMap()
    filename!: string;
    @AutoMap()
    originalName!: string;
    @AutoMap()
    mimetype!: string;
    @AutoMap()
    size!: number;
    @AutoMap()
    uploadedAt!: Date;
    @AutoMap()
    uploadedBy!: Types.ObjectId;
    @AutoMap()
    version!: number;
    @AutoMap()
    isPublic!: boolean;
    @AutoMap()
    tags?: string[];
    @AutoMap(() => String)
    status!: FileStatus;
    @AutoMap()
    url?: string;
    @AutoMap()
    parentType!: ParentType;
    @AutoMap()
    parentId!: Types.ObjectId;
    @AutoMap()
    encoding!: string;
    @AutoMap()
    lastModified!: Date;
}


const fileSchema = new Schema({
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    encoding: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    version: { type: Number, default: 1 },
    isPublic: { type: Boolean, default: false },
    tags: [{ type: String }],
    status: {
        type: String,
        enum: Object.values(FileStatus),
        default: FileStatus.PROCESSING
    },
    lastModified: { type: Date },
    parentType: { 
        type: String, 
        enum: ParentType,
        required: true 
    },
    parentId: { type: Schema.Types.ObjectId, required: true },
});

fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ tags: 1 });
fileSchema.index({ uploadedAt: -1 });

export type FileDocument = Document & IFileDb;
const File = model<FileDocument>('File', fileSchema);

export default File;