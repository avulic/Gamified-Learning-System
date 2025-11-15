<template>
    <div :key="$route.fullPath">
        <Button label="Back to Courses" icon="pi pi-arrow-left" @click="$router.push('/courses')"
            class="mb-4 p-button-text" />
        <div v-if="loading" class="flex justify-center items-center h-64">
            <ProgressSpinner />
        </div>
        <div v-else class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div class="mb-8">
                <h1 class="text-3xl font-bold text-gray-900">{{ course.title }}</h1>
                <p class="mt-2 text-gray-600">{{ course.description }}</p>
            </div>
            <template v-if="isEditable">
                <div class="mb-6 flex gap-2">
                    <Button label="Add Module" icon="pi pi-plus" @click="openModuleDialog" class="p-button-raised" />
                    <Button label="Save Course" icon="pi pi-save" @click="saveCourse"
                        class="p-button-raised p-button-success" />
                </div>
            </template>
            <ModuleList :modules="course.modules" @add-lesson="openLessonDialog" @delete-module="confirmDeleteModule"
                @add-assignment="openAssignmentDialog" @delete-lesson="confirmDeleteLesson"
                @update-assignment="handleUpdateAssignment" :isEditable="isEditable" />

            <template v-if="isEditable">
                <ModuleDialog v-model:visible="dialogs.module" :new-module="forms.module" @add="handleAddModule" />
                <LessonDialog v-model:visible="dialogs.lesson" :new-lesson="forms.lesson" @add="handleAddLesson" />
                <Dialog v-model:visible="dialogs.assignment" modal header="Assignment Details"
                    :style="{ width: '80vw' }" :closable="true" :closeOnEscape="true">
                    <AssignmentDetails :assignmentProp="null" :isEditable="true" @add="handleAddAssignment" />
                </Dialog>

                <MaterialDialog v-model:visible="dialogs.material" :new-material="forms.material"
                    @add="handleAddMaterial" />
            </template>
            <Toast />
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import type { Course, Lesson, Assignment, Resource } from '@/types';

import ModuleList from '@/features/modules/components/ModuleList.vue';
import ModuleDialog from '@/features/courses/components/dialogs/ModuleDialog.vue';
import LessonDialog from '@/features/courses/components/dialogs/LessonDialog.vue';
import MaterialDialog from '@/features/courses/components/dialogs/MaterialDialog.vue';

import { ProgressTypeEnum } from '@/types/Progression';
import CourseService from '@/services/CourseService';
import ModuleService from '@/services/ModuleService';
import LessonService from '@/services/LessonService';

import AssignmentDetails from '@/features/assignments/components/Details.vue'
import { ParentType } from '@/types/enums';
import { Module } from '@/types/Module';

import { useRoleAccess } from '@/composables/useRoleAccess';
import { onBeforeRouteLeave } from 'vue-router';

const confirm = useConfirm();
const toast = useToast();


const props = defineProps<{
    courseId: string | undefined | null;
}>();

const emit = defineEmits<{
    (e: 'update:course', course: Course): void;
    (e: 'save:course', course: Course): void;
}>();

const loading = ref(true);

const course = ref<Course>(getEmptyCourse());
const isEditable = computed(() => {
    return useRoleAccess().isProfessor.value;
});

function getEmptyCourse(): Course {
    return {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        modules: [],
        instructors: [],
        prerequisites: [],
        categories: [],
        isPublished: false,
        version: 1,
        lastUpdated: new Date(),
        enrolledStudentCount: 0,
        xpReward: 0,
        materials: [],
        assignments: [],
        enrollmentCode: ''
    };
}

onMounted(async () => {
    if (!props.courseId) {
        showError('Course not found');
        loading.value = false;  // Add this line
        return;
    }

    course.value = await CourseService.getCourseDetailsById(props.courseId) as Course;
    loading.value = false;
});




// Dialog state management
const dialogs = ref({
    module: false,
    lesson: false,
    assignment: false,
    material: false
});

// Form state management
const forms = ref({
    module: getEmptyModule(),
    lesson: getEmptyLesson(),
    assignment: getEmptyAssignment(ParentType.COURSE),
    material: getEmptyMaterial()
});

// Computed properties


function getEmptyModule(): Module {
    return {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        order: course.value.modules?.length || 0,
        courseId: course.value.id,
        lessons: [],
        learningObjectives: [],
        estimatedDuration: 60,
        difficulty: 1,
        publishedAt: new Date(),
        xpReward: 0,
        badgeReward: '',
        prerequisites: [],
        assignments: [],
        fileIds: []
    };
}

function getEmptyAssignment(parentType: ParentType): Assignment {
    return {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        tasks: [],
        parentType,
        createdBy: '', // Should be set from auth context
        rubric: { criteria: [] },
        peerReviewSettings: {
            enabled: false,
            reviewsPerStudent: 0,
            dueDate: new Date()
        },
        submissionWindow: {
            start: new Date(),
            end: new Date(),
            allowLateSubmissions: false,
            lateSubmissionPenalty: 10
        },
        maxAttempts: 2,
        passingScore: 100,
        points: 20,
        timeLimit: 0
    };
}

function getEmptyLesson(): Lesson {
    return {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        type: 'lesson',
        moduleId: '',
        content: '',
        estimatedDuration: 0,
        order: 0,
        assignments: [],
        files: []
    };
}

function getEmptyMaterial(): Resource {
    return {
        id: crypto.randomUUID(),
        uploadedBy: '',
        parentId: course.value.id || '',
        filename: '',
        originalName: '',
        encoding: undefined,
        mimetype: '',
        size: 0,
        url: '',
        uploadedAt: new Date().toISOString(),
        version: 1,
        isPublic: false,
        tags: [],
        status: 'READY',
        lastModified: new Date().toISOString(),
        parentType: ParentType.COURSE
    } as Resource;
}

// Dialog handlers
function openModuleDialog() {
    forms.value.module = getEmptyModule();
    dialogs.value.module = true;
}

function openLessonDialog(moduleId: string) {
    const module = course.value.modules?.find((m: Module) => m.id === moduleId);
    if (module) {
        forms.value.lesson = {
            ...getEmptyLesson(),
            moduleId,
            order: module.lessons?.length || 0
        };
        dialogs.value.lesson = true;
    }
}

function openAssignmentDialog(moduleId: string, lessonId: string) {
    dialogs.value.assignment = true;
}


async function handleUpdateAssignment(lessonId: string, updatedAssignment: Assignment) {
    showSuccess('Assignment updated');
}


async function handleAddLesson(value: Partial<Lesson>) {
    const module = course.value.modules?.find((m: Module) => m.id === value.moduleId);
    if (module) {
        const newLessonData: Lesson = {
            ...getEmptyLesson(),
            id: crypto.randomUUID(),
            title: value.title!,
            description: value.description!,
            content: value.content!,
            order: value.order!,
            moduleId: value.moduleId!
        };

        module.lessons = [...(module.lessons || []), newLessonData];
        dialogs.value.lesson = false;
        showSuccess('Lesson added');
    }
}

async function handleAddAssignment(value: Assignment) {

    dialogs.value.assignment = false;
    showSuccess('Assignment added');

}

async function handleAddMaterial(value: Resource) {
    // Implement material handling logic here
    showSuccess('Material added');
}


async function handleAddModule(value: Partial<Module>) {
    const newModuleData: Module = {
        ...getEmptyModule(),
        title: value.title!,
        description: value.description!,
        order: course.value.modules?.length || 0,
        courseId: course.value.id!,
        difficulty: value.difficulty || 1,
        xpReward: value.xpReward || 0,
        learningObjectives: value.learningObjectives || []
    };

    course.value.modules = [...(course.value.modules || []), newModuleData];
    emit('update:course', course.value);
}



function confirmDeleteModule(moduleId: string) {
    confirm.require({
        message: 'Are you sure you want to delete this module?',
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => handleDeleteModule(moduleId)
    });
}

function confirmDeleteLesson(moduleId: string, lessonId: string) {
    confirm.require({
        message: 'Are you sure you want to delete this lesson?',
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => handleDeleteLesson(moduleId, lessonId)
    });
}

async function handleDeleteModule(moduleId: string) {
    const deleted = await ModuleService.deleteModule(moduleId);
    if (deleted) {
        course.value.modules = course.value.modules?.filter((m: Module) => m.id !== moduleId) || [];
        showSuccess('Module deleted');
    }

}

async function handleDeleteLesson(moduleId: string, lessonId: string) {
    const deleted = await LessonService.deleteLesson(lessonId);
    if (deleted) {
        const module = course.value.modules?.find((m: Module) => m.id === moduleId);
        if (module) {
            module.lessons = module.lessons?.filter((l: Lesson) => l.id !== lessonId) || [];
            showSuccess('Lesson deleted');
        }
    }
}

async function saveCourse() {
    if (!validateCourse(course.value)) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        const savedCourse = await CourseService.createCourse(course.value);
        if (savedCourse) {
            showSuccess('Course saved successfully');
            emit('save:course', savedCourse);
        }
    } catch (error) {
        showError('Failed to save course');
    }
}

function validateCourse(course: Course): boolean {
    if (!course.title || !course.description) return false;
    if (!course.modules?.length) return false;

    // Add more validation as needed
    return true;
}

// Toast notifications
function showSuccess(message: string) {
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: message,
        life: 3000
    });
}

function showError(message: string) {
    toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000
    });
}
// In onBeforeRouteLeave


</script>