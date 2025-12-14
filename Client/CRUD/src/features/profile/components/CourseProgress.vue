<template>
    <div class="p-4">
        <h3 class="text-xl font-bold mb-4">Course Progress</h3>
        <div v-for="module in courseProgress.moduleProgresses" :key="module.moduleId" class="mb-6">
            <Accordion>
                <AccordionTab :header="'Module ' + module.moduleId">
                    <Card>
                        <template #title>
                            <div class="flex justify-between items-center">
                                <span class="txt-lg font-medium">Module {{ module.moduleId }}</span>
                                <Tag :severity="module.completed ? 'success' : 'warning'"
                                    :value="module.completed ? 'Completed' : 'In Progress'" />
                            </div>
                        </template>
                        <template #content>
                            <p class="mb-2">XP Earned: <span class="font-semibold">{{ module.xpEarned }}</span></p>

                            <Accordion>
                                <AccordionTab header="Lessons">
                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                        <div v-for="lesson in module.lessonProgress" :key="lesson.lessonId"
                                            class="p-2 border rounded">
                                            <div class="flex justify-between items-center">
                                                <span class="text-sm font-medium">Lesson {{ lesson.lessonId }}</span>
                                                <Tag :severity="lesson.completed ? 'success' : 'info'"
                                                    :value="lesson.completed ? 'Completed' : 'Not Started'" />
                                            </div>
                                            <p class="text-sm mt-1">XP: {{ lesson.xpEarned }}</p>
                                        </div>
                                    </div>
                                </AccordionTab>
                            </Accordion>

                            <Accordion>
                                <AccordionTab header="Assignments">
                                    <div v-for="assignment in module.assignmentProgress" :key="assignment.assignmentId"
                                        class="mb-3 p-3 border rounded">
                                        <div class="flex justify-between items-center mb-2">
                                            <span class="font-medium">Assignment {{ assignment.assignmentId }}</span>
                                            <Tag :severity="assignment.completed ? 'success' : 'warning'"
                                                :value="assignment.completed ? 'Completed' : 'In Progress'" />
                                        </div>
                                        <p class="text-sm mb-2">XP Earned: <span class="font-semibold">{{
                                            assignment.xpEarned
                                                }}</span>
                                        </p>

                                        <h6 class="text-sm font-medium mb-1">Tasks</h6>
                                        <div class="space-y-2">
                                            <div v-for="task in assignment.taskProgress" :key="task.taskId"
                                                class="p-2 bg-gray-100 rounded flex justify-between items-center">
                                                <div>
                                                    <span class="text-sm font-medium">Task {{ task.taskId }}</span>
                                                    <p class="text-xs">XP: {{ task.xpEarned }} | Attempts: {{
                                                        task.attempts }}
                                                    </p>
                                                </div>
                                                <div class="flex flex-col items-end">
                                                    <Tag :severity="getStatusSeverity(task.status)"
                                                        :value="task.status" />
                                                    <span class="text-xs mt-1">{{ formatTimeSpent(task.timeSpent)
                                                        }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTab>
                            </Accordion>

                            <div class="mt-6">
                                <h2 class="text-xl font-semibold mb-2">Totla Progress</h2>
                                <Card>
                                    <template #content>
                                        <div class="flex items-center mb-4">
                                            <ProgressBar :value="overallProgress" class="flex-grow mr-4" />
                                            <span class="text-lg font-semibold">{{ overallProgress }}%</span>
                                        </div>
                                        <div>
                                            <p class="mb-2">Total XP: {{ userProgress.totalXpEarned }}</p>
                                            <p>Current Level: {{ userProgress.level }}</p>
                                        </div>
                                    </template>
                                </Card>
                            </div>
                        </template>
                    </Card>
                </AccordionTab>
            </Accordion>
        </div>
    </div>
</template>

<script setup lang="ts">
import { TaskStatus } from '@/types/enums';
import { CourseProgress, UserProgress } from '@/types/Progression';
import { computed, ref } from 'vue';

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
        case TaskStatus.FAILED:
            return 'danger';
        default:
            return 'info';
    }
};

const overallProgress = computed(() => {
    const totalCourses = 10;
    const completedCourses = 5;
    return Math.round((completedCourses / totalCourses) * 100);
});


const userProgress = ref<UserProgress>({
    userId: '1',
    courseProgresses: [
        {
            courseId: 'c1',
            moduleProgresses: [
                {
                    moduleId: 'm1',
                    lessonProgress: [
                        { lessonId: 'l1', completed: true, xpEarned: 50 },
                        { lessonId: 'l2', completed: false, xpEarned: 0 }
                    ],
                    assignmentProgress: [
                        {
                            assignmentId: 'a1',
                            taskProgress: [
                                { taskId: 't1', status: TaskStatus.COMPLETED, xpEarned: 30, userId: '1', attempts: 1, timeSpent: 600 }
                            ],
                            completed: true,
                            xpEarned: 100
                        }
                    ],
                    completed: false,
                    xpEarned: 150
                }
            ],
            overallProgress: 75,
            completed: false
        }
    ],
    totalXpEarned: 250,
    level: 2
});
</script>