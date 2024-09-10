import ApiService from '@/services/ApiService';
import type { Course } from '@/types/Course'; // Ensure to import the correct Course type

import { get, post, put } from '@/services/ApiService';

class CourseService {
    public async createCourse(course: Course): Promise<Course> {
        try {
            const response = await post<Course>('/courses', course);
            return response.data;
        } catch (error) {
            // Handle createCourse specific errors if needed
            throw new Error('Failed to create Course');
        }
    }

    public async createCourses(courses: Course[]): Promise<Course[]> {
        try {
            const response = await post<Course[]>('/courses', courses);
            return response.data;
        } catch (error) {
            // Handle createCourses specific errors if needed
            throw new Error('Failed to create Courses');
        }
    }

    public async getAllCourses(): Promise<Course[]> {
        const response = await get<Course[]>('/courses');
        return response.data;
    }

    public async getCourseById(courseId: string): Promise<Course | null> {
        const response = await get<Course>(`/courses/${courseId}`);
        return response.data;
    }

    public async updateCourse(courseId: string, updatedCourseData: Course): Promise<Course | null> {
        try {
            const response = await put<Course>(`/courses/${courseId}`, updatedCourseData);
            return response.data;
        } catch (err) {
            throw new Error("Server error: " + err);
        }
    }

    public async deleteCourse(courseId: string): Promise<Course | null> {
        const response = await ApiService.delete<Course>(`/courses/${courseId}`);
        return response.data;
    }
}

export default new CourseService();
