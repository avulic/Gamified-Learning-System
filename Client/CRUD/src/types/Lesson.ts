import { Assignment } from "./Assignment";
import { Resource } from "./Resource";

export interface Lesson {
    id?: string,
    title: string,
    description: string,
    type: 'lesson';
    moduleId: string;
    content: string; // HTML content or rich text
    estimatedDuration: number;
    order: number;
    assignments?: Assignment[];
    files?: Resource[];
}