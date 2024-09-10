import { IBaseEntity } from "./BaseEntity";
import { IModule } from "./Module";

export interface ILesson extends IBaseEntity {
    title: string;
    content: string;
    order: number;
    moduleId: string;
}