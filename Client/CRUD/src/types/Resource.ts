export interface Resource {
    id: string;
    uploadedBy: string;
    parentId: string;
    filename: string;
    originalName: string;
    encoding?: string;
    mimetype: string;
    size: number;
    url: string;
    uploadedAt: string;
    version: number;
    isPublic: boolean;
    tags: string[];
    status: 'PROCESSING' | 'READY' | 'FAILED';
    lastModified: string;
    parentType: string;

}