import { BaseContent } from "./BaseContent";

export interface Lesson extends BaseContent {
    type: 'lesson';
    moduleId: string;
    content: string; // HTML content or rich text
    estimatedDuration: number;
}