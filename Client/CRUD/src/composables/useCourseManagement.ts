import CourseService from "@/services/CourseService"
import { Course } from "@/types"
import { ref } from "vue"

// composables/useCourseManagement.ts
export function useCourseManagement(instructorId?: string) {
    const courses = ref<Course[]>([])
    const loading = ref(true)
    const error = ref<Error | null>(null)

    async function loadCourses() {
        loading.value = true
        try {
            courses.value = instructorId 
                ? await CourseService.getCoursesByInstructor(instructorId)
                : await CourseService.getAllCourses()
        } catch (err) {
            error.value = err as Error
        } finally {
            loading.value = false
        }
    }

    return {
        courses,
        loading,
        error,
        loadCourses
    }
}