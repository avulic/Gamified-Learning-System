export interface Group {
    id: string;
    name: string;
    description: string;
    courseId: string;
    memberIds: string[];
    createdAt: Date;
    updatedAt: Date;
  }