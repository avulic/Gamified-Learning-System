<template>
    <main class="p-4 max-w-6xl mx-auto">
        <h1 class="text-2xl font-bold mb-6">User Profile</h1>

        <TabView :activeIndex="0">
            <TabPanel header="User Details">
                <UserDetails />
            </TabPanel>
            <TabPanel header="Course Progress">
                <CourseProgress :courseProgress="mockCourseProgress" />
            </TabPanel>
        </TabView>
    </main>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import UserDetails from '@/features/profile/components/UserDetails.vue';
import CourseProgress from '@/features/profile/components/CourseProgress.vue';
import { CourseProgress as CourseProgressType, ModuleProgress, LessonProgress, AssignmentProgress, TaskProgress } from '@/types/Progression';
import { TaskStatus } from '@/types/enums';

// Mock data using correct types
const mockCourseProgress = ref<CourseProgressType>({
    courseId: 'c1',
    moduleProgresses: [
        {
            moduleId: 'm1',
            lessonProgress: [
                { lessonId: 'l1', completed: true, xpEarned: 50 },
                { lessonId: 'l2', completed: true, xpEarned: 50 },
                { lessonId: 'l3', completed: false, xpEarned: 0 }
            ],
            assignmentProgress: [
                {
                    assignmentId: 'a1',
                    taskProgress: [
                        { taskId: 't1', status: TaskStatus.COMPLETED, xpEarned: 20, userId: 'user1', attempts: 1, timeSpent: 300 },
                        { taskId: 't2', status: TaskStatus.COMPLETED, xpEarned: 30, userId: 'user1', attempts: 1, timeSpent: 420 }
                    ],
                    completed: true,
                    xpEarned: 50
                }
            ],
            completed: true,
            xpEarned: 150
        },
        {
            moduleId: 'm2',
            lessonProgress: [
                { lessonId: 'l4', completed: true, xpEarned: 40 },
                { lessonId: 'l5', completed: false, xpEarned: 0 }
            ],
            assignmentProgress: [
                {
                    assignmentId: 'a2',
                    taskProgress: [
                        { taskId: 't3', status: TaskStatus.IN_PROGRESS, xpEarned: 40, userId: 'user1', attempts: 2, timeSpent: 600 }
                    ],
                    completed: false,
                    xpEarned: 40
                }
            ],
            completed: false,
            xpEarned: 80
        }
    ],
    overallProgress: 65,
    completed: false
});
</script>

<style scoped>
:deep(.p-accordion-header-link) {
    background-color: #f9fafb !important;
    border: 1px solid #e5e7eb !important;
    color: #1f2937 !important;
}

:deep(.p-accordion-content) {
    border: 1px solid #e5e7eb !important;
    border-top: 0 !important;
}
</style>