<template>
    <div class="p-4">
        <h3 class="text-xl font-bold mb-4">Course Progress</h3>
        <div v-for="module in courseProgress.moduleProgresses" :key="module.moduleId" class="mb-6">
            <Card>
                <template #title>
                    <div class="flex justify-between items-center">
                        <span class="text-lg font-medium">Module {{ module.moduleId }}</span>
                        <Tag :severity="module.completed ? 'success' : 'warning'"
                            :value="module.completed ? 'Completed' : 'In Progress'" />
                    </div>
                </template>
                <template #content>
                    <p class="mb-2">XP Earned: <span class="font-semibold">{{ module.xpEarned }}</span></p>

                    <h5 class="font-medium mb-2">Lessons</h5>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        <div v-for="lesson in module.lessonProgress" :key="lesson.lessonId" class="p-2 border rounded">
                            <div class="flex justify-between items-center">
                                <span class="text-sm font-medium">Lesson {{ lesson.lessonId }}</span>
                                <Tag :severity="lesson.completed ? 'success' : 'info'"
                                    :value="lesson.completed ? 'Completed' : 'Not Started'" />
                            </div>
                            <p class="text-sm mt-1">XP: {{ lesson.xpEarned }}</p>
                        </div>
                    </div>

                    <h5 class="font-medium mb-2">Assignments</h5>
                    <div v-for="assignment in module.assignmentProgress" :key="assignment.assignmentId"
                        class="mb-3 p-3 border rounded">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-medium">Assignment {{ assignment.assignmentId }}</span>
                            <Tag :severity="assignment.completed ? 'success' : 'warning'"
                                :value="assignment.completed ? 'Completed' : 'In Progress'" />
                        </div>
                        <p class="text-sm mb-2">XP Earned: <span class="font-semibold">{{ assignment.xpEarned }}</span>
                        </p>

                        <h6 class="text-sm font-medium mb-1">Tasks</h6>
                        <div class="space-y-2">
                            <div v-for="task in assignment.taskProgress" :key="task.taskId"
                                class="p-2 bg-gray-100 rounded flex justify-between items-center">
                                <div>
                                    <span class="text-sm font-medium">Task {{ task.taskId }}</span>
                                    <p class="text-xs">XP: {{ task.xpEarned }} | Attempts: {{ task.attempts }}</p>
                                </div>
                                <div class="flex flex-col items-end">
                                    <Tag :severity="getStatusSeverity(task.status)" :value="task.status" />
                                    <span class="text-xs mt-1">{{ formatTimeSpent(task.timeSpent) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CourseProgress, TaskStatus } from '@/types/Progression';

const props = defineProps<{
    courseProgress: CourseProgress;
}>();

const formatTimeSpent = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
};

const getStatusSeverity = (status: TaskStatus): 'success' | 'info' | 'warning' | 'danger' => {
    switch (status) {
        case TaskStatus.COMPLETED:
            return 'success';
        case TaskStatus.IN_PROGRESS:
            return 'warning';
        case TaskStatus.NOT_STARTED:
            return 'info';
        case TaskStatus.OVERDUE:
            return 'danger';
        default:
            return 'info';
    }
};
</script>