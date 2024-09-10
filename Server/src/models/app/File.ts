import { IBaseEntity } from "./BaseEntity";

export interface IFile extends IBaseEntity {
	filename: string;
	originalname: string;
	mimetype: string;
	size: number;
	path: string;
	version: number;
	uploadedBy: string;
	uploadedAt: Date;
}
