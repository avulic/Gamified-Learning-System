import { Schema, Types } from "mongoose";

import { IFile } from "../File";
import { IBaseTask } from "./BaseTask";

export interface IFileUploadTask extends IBaseTask {
    allowedFileTypes: string[];
    maxFileSize: number;
    content: IFile[];
}

