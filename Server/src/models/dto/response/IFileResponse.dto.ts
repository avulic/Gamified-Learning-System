

export class IFileResponseDto  {
    id!: string;
    filename!: string;
    size!: number;
    mimetype!: string;
    uploadDate!: Date;
    status!: 'processing' | 'completed' | 'failed';
    isPublic!: boolean;
    tags?: string[];
    url?: string;
}
