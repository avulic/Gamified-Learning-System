import mongoose, { Schema } from "mongoose";
import { ICourse } from "./Course";
import { IUser } from "./User";


// ResourceLibrary
export interface IResourceLibrary extends Document {
    name: string;
    description: string;
    fileUrl: string;
    uploadedBy: IUser[];
    relatedCourses: ICourse[];
}

const ResourceLibrarySchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relatedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
});

export const ResourceLibrary = mongoose.model<IResourceLibrary>('ResourceLibrary', ResourceLibrarySchema);