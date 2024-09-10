// src/models/Course.ts

export interface Course {
    id: string;
    title: string;
    description: string;

    instructors: {id:string;name:string}[];
    enrolledStudents: {id:string;name:string}[];
    modules?: string[];

    startDate: Date;
    endDate: Date;
    isPublished: boolean;
    tags?: string[];
    categories?: string[];
    xpReward?: number;
    createdAt: Date;
    updatedAt: Date;
  }

  export default Course;