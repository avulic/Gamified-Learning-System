<template>
    <div class="detailed-progress">
        <div v-for="(moduleProgress, mIndex) in courseProgress.moduleProgresses" :key="mIndex" class="mb-4">
            <h4 class="text-md font-medium mb-2">Module: {{ getModuleTitle(moduleProgress.moduleId) }}</h4>
            <p>Completed: {{ moduleProgress.completed ? 'Yes' : 'No' }}</p>
            <p>XP Earned: {{ moduleProgress.xpEarned }}</p>

            <div class="ml-4">
                <h5 class="font-medium mb-1">Lessons:</h5>
                <ul class="list-disc list-inside">
                    <li v-for="(lesson, lIndex) in moduleProgress.lessonProgress" :key="lIndex">
                        {{ getLessonTitle(lesson.lessonId) }} -
                        {{ lesson.completed ? 'Completed' : 'Not Completed' }}
                        (XP: {{ lesson.xpEarned }})
                    </li>
                </ul>
            </div>

            <div class="ml-4 mt-2">
                <h5 class="font-medium mb-1">Assignments:</h5>
                <ul class="list-disc list-inside">
                    <li v-for="(assignment, aIndex) in moduleProgress.assignmentProgress" :key="aIndex">
                        {{ getAssignmentTitle(assignment.assignmentId) }} -
                        {{ assignment.completed ? 'Completed' : 'Not Completed' }}
                        (XP: {{ assignment.xpEarned }})
                        <ul class="list-circle list-inside ml-4">
                            <li v-for="(task, tIndex) in assignment.taskProgress" :key="tIndex">
                                {{ getTaskTitle(task.taskId) }} - {{ task.status }}
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { CourseProgress, CourseProgress, ModuleProgress } from '@/types/Progression';
import { computed } from 'vue';

const props = defineProps<{
    courseProgress: CourseProgress;
}>();

const getModuleTitle = (moduleId: string) => props.courseProgress.modules[moduleId]?.title || 'Unknown Module';
const getLessonTitle = (lessonId: string) => props.courseProgress.lessons[lessonId]?.title || 'Unknown Lesson';
const getAssignmentTitle = (assignmentId: string) => props.courseProgress.assignments[assignmentId]?.title || 'Unknown Assignment';
const getTaskTitle = (taskId: string) => props.courseProgress.tasks[taskId]?.title || 'Unknown Task';



// Create map objects for easy lookup
const coursesMap = computed(() => {
    return courseProgress.value.reduce((acc, course) => {
        acc[course.id] = { title: course.title };
        return acc;
    }, {} as { [id: string]: { title: string } });
});

const modulesMap = computed(() => {
    return props.courseProgress.moduleProgresses.reduce((acc, module: ModuleProgress) => {
        acc[module.moduleId] = { completed: module.completed, xpEarned: module.xpEarned };
        return acc;
    }, {} as { [id: string]: { completed: boolean, xpEarned: number, } });
});

const lessonsMap = computed(() => {
    return lessons.value.reduce((acc, lesson) => {
        acc[lesson.id] = { title: lesson.title };
        return acc;
    }, {} as { [id: string]: { title: string } });
});

const assignmentsMap = computed(() => {
    return assignments.value.reduce((acc, assignment) => {
        acc[assignment.id] = { title: assignment.title };
        return acc;
    }, {} as { [id: string]: { title: string } });
});

const tasksMap = computed(() => {
    return tasks.value.reduce((acc, task) => {
        acc[task.id] = { title: task.title };
        return acc;
    }, {} as { [id: string]: { title: string, xpEarned: string, completed: string } });
});

</script>

<style scoped>
.detailed-progress {
    @apply bg-white shadow-md rounded-lg p-4 mt-2;
}
</style>