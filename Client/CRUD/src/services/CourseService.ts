
import type { Course } from '@/types/Course';

import { apiService } from '@/services/ApiService';

class CourseService {

    public async createCourse(course: Course): Promise<Course> {
        try {
            const response = await apiService.post<Course>('/import', course);
            return response.data;
        } catch (error) {
            // Handle createCourse specific errors if needed
            throw new Error('Failed to create Course');
        }
    }

    public async createCourses(courses: Course[]): Promise<Course[]> {
        try {
            const response = await apiService.post<Course[]>('/courses', courses);
            return response.data;
        } catch (error) {
            // Handle createCourses specific errors if needed
            throw new Error('Failed to create Courses');
        }
    }

    public async getAllCourses(): Promise<Course[]> {
        const response = await apiService.get<Course[]>('/courses');
        return response.data;
    }

    public async getCourseById(courseId: string): Promise<Course | null> {
        const response = await apiService.get<Course>(`/courses/${courseId}`);
        return response.data;
    }

    public async getCourseDetailsById(courseId: string): Promise<Course | null> {
        const response = await apiService.get<Course>(`/courses/full/${courseId}`);
        return response.data;
    }

    public async getCoursesByInstructor(instructorId: string): Promise<Course[]> {
        const response = await apiService.get<Course[]>(`/courses/instructor/${instructorId}`);
        return response.data;
    }

    public async updateCourse(courseId: string, updatedCourseData: Course): Promise<Course | null> {
        try {
            const response = await apiService.put<Course>(`/courses/${courseId}`, updatedCourseData);
            return response.data;
        } catch (err) {
            throw new Error("Server error: " + err);
        }
    }

    public async deleteCourse(courseId: string): Promise<Course | null> {
        const response = await apiService.delete<Course>(`/courses/${courseId}`);
        return response.data;
    }
}

export default new CourseService();
