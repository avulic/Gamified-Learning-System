<template>
    <div class="p-6 bg-gray-50 min-h-screen">
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">Courses</h1>
        </div>

        <div v-if="loading" class="flex justify-center items-center h-64">
            <ProgressSpinner />
        </div>

        <div v-if="!loading && !showCourseDetails" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="course in loadedCourses" :key="course.id" @click="navigateToCourse(course.id)"
                class="cursor-pointer">
                <Card class="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <template #header>
                        <span>{{ course.title }}</span>
                    </template>

                    <template #title>
                        <div class="font-bold text-xl mb-2 text-gray-800">{{ course.title }}</div>
                    </template>

                    <template #content>
                        <p class="text-gray-600 text-sm mb-4">{{ course.description }}</p>
                    </template>
                </Card>
            </div>
        </div>

        <!-- <Details v-if="showCourseDetails" :course="course" :isEditable="isCourseEditable" /> -->

    </div>


</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Course } from '@/types/Course';
import CourseService from '@/services/CourseService';
import AuthService from '@/services/AuthService';
import UserService from '@/services/UserService';
import { User } from '@/types';
import Details from '@/features/courses/components/CourseDetailsProfesor.vue';

const router = useRouter();
const loadedCourses = ref<Course[]>([]);
const loading = ref(true);
const isCourseEditable = ref(true);
const course = ref<Course | undefined>(undefined);
const showCourseDetails = ref(false);

const getLevelSeverity = (level: string) => {
    const levels: Record<string, string> = {
        'Beginner': 'success',
        'Intermediate': 'warning',
        'Advanced': 'danger'
    };
    return levels[level] || 'info';
};

const navigateToCourse = (courseId: string) => {
    // course.value = loadedCourses.value.find((c: Course) => c.id === courseId);
    // showCourseDetails.value = true;
    // isCourseEditable.value = AuthService.getCurentUserValues()?.data?.roles?.includes('Professor') || false;

    router.push({ name: 'courses/detail', params: { courseId: courseId } });
};

onMounted(async () => {
    try {
        const user = AuthService.getCurentUserValues() as User | null;

        if (!user) {
            router.push({ name: 'signin', query: { returnUrl: '/courses' } });
            return;
        }

        if (!user.data?.enrolledCourses?.length) {
            router.push({ name: 'courses/empty' });
            return;
        }

        const coursePromises = user.data.enrolledCourses.map(
            (course: { courseId: string; courseName: string }) =>
                CourseService.getCourseById(course.courseId)
        );

        const courses = await Promise.all(coursePromises);
        const validCourses = courses.filter((course): course is Course => course !== null);

        if (!validCourses.length) {
            throw new Error('No valid courses found');
        }

        loadedCourses.value = validCourses;
    } catch (error) {
        console.error('Failed to fetch courses:', error);
    } finally {
        loading.value = false;
    }
});
</script>