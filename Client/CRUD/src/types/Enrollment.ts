export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    status: 'active' | 'completed' | 'dropped';
    enrolledAt: Date;
    completedAt?: Date;
  }
  