
export default interface UserDetails {
    id: string;
    username: string;
    name: string;
    lastName: string;
    email: string;
    roles: string[];
    profilePicture: string;
    preferences?: {
        notifications: boolean;
        theme: string;
        language: string;
    };
    enrolledCourses?: Array<{
        courseId: string;
        courseName: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
}