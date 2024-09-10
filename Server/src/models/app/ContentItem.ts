import { ItemType } from "../enums";




export interface IContentItem {
    id: string;
    title: string;
    type: ItemType,
    content: string;
    module: string;
    order: number;
}



