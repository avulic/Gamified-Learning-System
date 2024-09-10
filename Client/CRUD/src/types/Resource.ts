import { BaseContent } from "./BaseContent";


export interface Resource extends BaseContent {
    type: 'resource';
    resourceType: 'pdf' | 'video' | 'link' | 'other';
    url: string;
}