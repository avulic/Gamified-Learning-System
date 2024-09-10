import { model, Schema, Document, Types } from 'mongoose';

export interface IFileDb extends Document {
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    url: string;
    version: number,
    uploadedBy: Types.ObjectId;
    uploadedAt: Date;
  }

const fileSchema = new Schema({
    filename: { type: String, required: true },
    originalname: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    version: {type: Number, required: true},
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    uploadedAt: { type: Date, default: Date.now }
});

const File = model<IFileDb>('File', fileSchema);

export default File;