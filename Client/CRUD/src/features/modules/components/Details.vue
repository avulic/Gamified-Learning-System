<template>
    <div class="p-4 bg-gray-100">
        <Form @submit="onSubmit" :validation-schema="schema" class="flex flex-col" v-slot="{ errors }">
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <!-- Basic Information -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-field">
                        <Field name="title" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <InputText id="title" v-bind="field" :disabled="!isEditable" 
                                    class="w-full" :class="{ 'p-invalid': errorMessage }" />
                                <label for="title">Module Title</label>
                            </span>
                            <small class="text-red-500">{{ errorMessage }}</small>
                        </Field>
                    </div>

                    <div class="form-field">
                        <Field name="order" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <InputNumber id="order" v-model="module.order" :disabled="!isEditable"
                                    class="w-full" :min="1" />
                                <label for="order">Order</label>
                            </span>
                            <small class="text-red-500">{{ errorMessage }}</small>
                        </Field>
                    </div>
                </div>

                <div class="form-field mt-4">
                    <Field name="description" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <Textarea id="description" v-model="module.description" :disabled="!isEditable"
                                rows="3" class="w-full" :class="{ 'p-invalid': errorMessage }" />
                            <label for="description">Description</label>
                        </span>
                        <small class="text-red-500">{{ errorMessage }}</small>
                    </Field>
                </div>

                <!-- Learning Objectives -->
                <Panel header="Learning Objectives" class="mt-4" :toggleable="true">
                    <div class="space-y-2">
                        <div v-for="(objective, index) in module.learningObjectives" :key="index"
                            class="flex gap-2 items-center">
                            <InputText v-model="module.learningObjectives[index]" :disabled="!isEditable"
                                class="flex-grow" placeholder="Enter learning objective" />
                            <Button icon="pi pi-trash" @click="removeLearningObjective(index)" 
                                :disabled="!isEditable" class="p-button-danger p-button-outlined" />
                        </div>
                        <Button label="Add Objective" icon="pi pi-plus" @click="addLearningObjective"
                            :disabled="!isEditable" class="p-button-outlined" />
                    </div>
                </Panel>

                <!-- Module Settings -->
                <Panel header="Module Settings" class="mt-4" :toggleable="true">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-field">
                            <label>Estimated Duration (minutes)</label>
                            <InputNumber v-model="module.estimatedDuration" :disabled="!isEditable"
                                class="w-full" :min="1" />
                        </div>

                        <div class="form-field">
                            <label>Difficulty Level</label>
                            <InputNumber v-model="module.difficulty" :disabled="!isEditable"
                                class="w-full" :min="1" :max="5" />
                        </div>

                        <div class="form-field">
                            <label>XP Reward</label>
                            <InputNumber v-model="module.xpReward" :disabled="!isEditable"
                                class="w-full" :min="0" />
                        </div>

                        <div class="form-field">
                            <label>Badge Reward</label>
                            <InputText v-model="module.badgeReward" :disabled="!isEditable"
                                class="w-full" placeholder="Enter badge ID" />
                        </div>

                        <div class="form-field">
                            <label>Published Date</label>
                            <Calendar v-model="module.publishedAt" :disabled="!isEditable"
                                class="w-full" showTime hourFormat="24" />
                        </div>
                    </div>
                </Panel>

                <!-- Prerequisites -->
                <Panel header="Prerequisites" class="mt-4" :toggleable="true">
                    <div class="space-y-2">
                        <MultiSelect v-model="selectedPrerequisites" :options="availableModules"
                            :disabled="!isEditable" optionLabel="title" optionValue="id"
                            placeholder="Select prerequisite modules" class="w-full" />
                    </div>
                </Panel>

                <!-- Lessons List -->
                <Panel header="Lessons" class="mt-4" :toggleable="true">
                    <DataTable :value="module.lessons" :paginator="true" :rows="5"
                        v-model:selection="selectedLessons" dataKey="id"
                        :rowHover="true" filterDisplay="menu" :loading="loading"
                        class="p-datatable-sm">
                        <Column field="title" header="Title" sortable></Column>
                        <Column field="description" header="Description"></Column>
                        <Column field="estimatedDuration" header="Duration" sortable>
                            <template #body="slotProps">
                                {{ slotProps.data.estimatedDuration }} minutes
                            </template>
                        </Column>
                        <Column field="order" header="Order" sortable></Column>
                        <Column v-if="isEditable" :exportable="false" style="min-width:8rem">
                            <template #body="slotProps">
                                <div class="flex gap-2 justify-end">
                                    <Button icon="pi pi-pencil" @click="editLesson(slotProps.data)"
                                        class="p-button-rounded p-button-success mr-2" />
                                    <Button icon="pi pi-trash" @click="deleteLesson(slotProps.data)"
                                        class="p-button-rounded p-button-danger" />
                                </div>
                            </template>
                        </Column>
                    </DataTable>
                    <div class="flex justify-end mt-2">
                        <Button label="Add Lesson" icon="pi pi-plus" @click="addLesson"
                            :disabled="!isEditable" class="p-button-outlined" />
                    </div>
                </Panel>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-2 mt-4">
                    <Button label="Cancel" icon="pi pi-times" @click="cancel"
                        class="p-button-outlined" />
                    <Button label="Save" icon="pi pi-check" type="submit"
                        :disabled="!isEditable" class="p-button-primary" />
                </div>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useForm, Field, Form } from 'vee-validate';
import * as yup from 'yup';
import { Module } from '@/types/Module';
import { Lesson } from '@/types/Lesson';
import type { UnlockConditions } from '@/types/UnlockConditions';

const props = defineProps<{
    currentModule: Module | null;
    availableModules?: Module[];
}>();

const emit = defineEmits<{
    save: [module: Module];
    cancel: [];
    editLesson: [lesson: Lesson];
    deleteLesson: [lessonId: string];
}>();

// State
const module = ref<Module>({
    id: '',
    title: '',
    description: '',
    order: 1,
    courseId: '',
    lessons: [],
    learningObjectives: [],
    estimatedDuration: 60,
    difficulty: 1,
    publishedAt: new Date(),
    xpReward: 0,
    badgeReward: '',
    prerequisites: [],
    assignments: [],
    files: []
});

const loading = ref(false);
const isEditable = ref(true);
const selectedLessons = ref<Lesson[]>([]);
const selectedPrerequisites = ref<string[]>([]);

// Validation schema
const schema = yup.object({
    title: yup.string().required('Module title is required'),
    description: yup.string().required('Module description is required'),
    order: yup.number().required('Order is required').min(1),
    estimatedDuration: yup.number().required('Duration is required').min(1),
    difficulty: yup.number().required('Difficulty is required').min(1).max(5),
    learningObjectives: yup.array().of(yup.string()).min(1, 'At least one learning objective is required')
});

// Methods
function addLearningObjective() {
    module.value.learningObjectives.push('');
}

function removeLearningObjective(index: number) {
    module.value.learningObjectives.splice(index, 1);
}

function addLesson() {
    const newLesson: Lesson = {
        title: '',
        description: '',
        type: 'lesson',
        moduleId: module.value.id || '',
        content: '',
        estimatedDuration: 30,
        order: module.value.lessons.length + 1
    };
    emit('editLesson', newLesson);
}

function editLesson(lesson: Lesson) {
    emit('editLesson', lesson);
}

function deleteLesson(lesson: Lesson) {
    if (lesson.id) {
        emit('deleteLesson', lesson.id);
    }
}

function cancel() {
    emit('cancel');
}

async function onSubmit() {
    try {
        // Update prerequisites based on selection
        module.value.prerequisites = selectedPrerequisites.value.map(id => 
            props.availableModules?.find(m => m.id === id)
        ).filter((m): m is Module => m !== undefined);

        emit('save', module.value);
    } catch (error) {
        console.error('Error saving module:', error);
    }
}

// Initialize data when currentModule changes
watch(() => props.currentModule, (newModule) => {
    if (newModule) {
        module.value = { ...newModule };
        selectedPrerequisites.value = newModule.prerequisites.map(m => m.id).filter((id): id is string => id !== undefined);
        isEditable.value = false;
    }
}, { immediate: true });
</script>

<style scoped>
.form-field {
    @apply space-y-1;
}

.form-field label {
    @apply block text-sm font-medium text-gray-700;
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber) {
    @apply w-full;
}

:deep(.p-panel) {
    @apply mb-4;
}

:deep(.p-datatable) {
    @apply rounded-lg overflow-hidden;
}

:deep(.p-float-label) {
    @apply w-full;
}
</style>