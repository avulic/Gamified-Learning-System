<template>
    <div class="p-4 bg-gray-100">
        <TabView>
            <!-- Assignment Details Tab -->
            <TabPanel header="Assignment Details">
                <Form @submit="onSubmit" :validation-schema="assignmentSchema" v-slot="{ errors }">
                    <div class="space-y-4">
                        <!-- Basic Assignment Fields -->
                        <div class="grid grid-cols-1 gap-4">
                            <div class="form-field">
                                <label for="title">Title</label>
                                <Field name="title" v-slot="{ field }">
                                    <InputText id="title" v-model="assignment.title" :disabled="!isEditable"
                                        v-bind="field" :class="{ 'p-invalid': errors.title }" />
                                </Field>
                                <ErrorMessage name="title" class="text-red-500" />
                            </div>

                            <div class="form-field">
                                <label for="description">Description</label>
                                <Field name="description" v-slot="{ field }">
                                    <Textarea id="description" v-model="assignment.description" :disabled="!isEditable"
                                        rows="3" v-bind="field" :class="{ 'p-invalid': errors.description }" />
                                </Field>
                                <ErrorMessage name="description" class="text-red-500" />
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="form-field">
                                    <label for="points">Points</label>
                                    <Field name="points" v-slot="{ field }">
                                        <InputNumber id="points" v-model="assignment.points" :disabled="!isEditable"
                                            v-bind="field" :min="0" :class="{ 'p-invalid': errors.points }" />
                                    </Field>
                                    <ErrorMessage name="points" class="text-red-500" />
                                </div>

                                <div class="form-field">
                                    <label for="passingScore">Passing Score (%)</label>
                                    <Field name="passingScore" v-slot="{ field }">
                                        <InputNumber id="passingScore" v-model="assignment.passingScore" :disabled="!isEditable"
                                            v-bind="field" :min="0" :max="100" :class="{ 'p-invalid': errors.passingScore }" />
                                    </Field>
                                    <ErrorMessage name="passingScore" class="text-red-500" />
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div class="form-field">
                                    <label for="maxAttempts">Max Attempts</label>
                                    <Field name="maxAttempts" v-slot="{ field }">
                                        <InputNumber id="maxAttempts" v-model="assignment.maxAttempts" :disabled="!isEditable"
                                            v-bind="field" :min="1" :class="{ 'p-invalid': errors.maxAttempts }" />
                                    </Field>
                                    <ErrorMessage name="maxAttempts" class="text-red-500" />
                                </div>

                                <div class="form-field">
                                    <label for="timeLimit">Time Limit (minutes)</label>
                                    <Field name="timeLimit" v-slot="{ field }">
                                        <InputNumber id="timeLimit" v-model="assignment.timeLimit" :disabled="!isEditable"
                                            v-bind="field" :min="0" :class="{ 'p-invalid': errors.timeLimit }" />
                                    </Field>
                                    <ErrorMessage name="timeLimit" class="text-red-500" />
                                </div>
                            </div>

                            <div class="form-field">
                                <label for="parentType">Parent Type</label>
                                <Dropdown id="parentType" v-model="assignment.parentType" :options="parentTypeOptions"
                                    :disabled="!isEditable" optionLabel="label" optionValue="value" />
                            </div>

                            <Panel header="Submission Window" :toggleable="true">
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="form-field">
                                        <label>Start Date</label>
                                        <Calendar v-model="assignment.submissionWindow.start" :disabled="!isEditable" 
                                            showTime hourFormat="24" />
                                    </div>
                                    <div class="form-field">
                                        <label>End Date</label>
                                        <Calendar v-model="assignment.submissionWindow.end" :disabled="!isEditable"
                                            showTime hourFormat="24" />
                                    </div>
                                    <div class="col-span-2">
                                        <div class="flex items-center gap-4">
                                            <div class="flex items-center gap-2">
                                                <Checkbox v-model="assignment.submissionWindow.allowLateSubmissions" 
                                                    :binary="true" :disabled="!isEditable" />
                                                <label>Allow Late Submissions</label>
                                            </div>
                                            <div v-if="assignment.submissionWindow.allowLateSubmissions" class="flex items-center gap-2">
                                                <label>Late Penalty (%)</label>
                                                <InputNumber v-model="assignment.submissionWindow.lateSubmissionPenalty" 
                                                    :disabled="!isEditable" :min="0" :max="100" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </div>

                        <!-- Rubric Section -->
                        <Panel header="Rubric" :toggleable="true">
                            <div class="space-y-2">
                                <div v-for="(criterion, index) in rubricCriteria" :key="index"
                                    class="flex gap-2 items-center">
                                    <InputText v-model="criterion.criterion" placeholder="Criterion description"
                                        :disabled="!isEditable" class="flex-grow" />
                                    <InputNumber v-model="criterion.points" placeholder="Points" :disabled="!isEditable"
                                        :min="0" />
                                    <Button icon="pi pi-trash" @click="removeCriterion(index)" :disabled="!isEditable"
                                        class="p-button-danger p-button-outlined" />
                                </div>
                                <Button label="Add Criterion" icon="pi pi-plus" @click="addCriterion"
                                    :disabled="!isEditable" class="p-button-outlined" />
                            </div>
                        </Panel>

                        <!-- Peer Review Settings -->
                        <Panel header="Peer Review Settings" :toggleable="true">
                            <div class="space-y-4">
                                <div class="flex items-center gap-2">
                                    <Checkbox v-model="peerReviewEnabled" :binary="true" :disabled="!isEditable" />
                                    <label>Enable Peer Review</label>
                                </div>

                                <div v-if="peerReviewEnabled" class="space-y-2">
                                    <div class="form-field">
                                        <label>Reviews Per Student</label>
                                        <InputNumber v-model="reviewsPerStudent" :disabled="!isEditable" :min="0" />
                                    </div>
                                    <div class="form-field">
                                        <label>Review Due Date</label>
                                        <Calendar v-model="reviewDueDate" :disabled="!isEditable" showTime hourFormat="24" />
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    </div>
                </Form>
            </TabPanel>

            <!-- Tasks Tab -->
            <TabPanel header="Tasks">
                <div class="space-y-4">
                    <TaskManager :assignment-id="assignment.id as string" :tasks="assignment.tasks" :isEditable="isEditable" @update:tasks="updateTasks"
                        @editTask="editTask" @deleteTask="deleteTask" @addTask="addTask" />
                </div>
            </TabPanel>
        </TabView>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-4">
            <Button label="Cancel" icon="pi pi-times" @click="cancel" class="p-button-outlined" />
            <Button label="Save" icon="pi pi-check" @click="save" :disabled="!isValid" class="p-button-primary" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import TaskManager from '@/components/task/TaskManager.vue';
import { Assignment, Task } from '@/types';
import { ParentType, ProgressTypeEnum, TaskTypeEnum } from '@/types/enums';
import { BaseTask } from '@/types/task/Task';

// Props and Emits
const props = defineProps<{
    assignmentProp: Assignment | null;
    isEditable?: boolean;
}>();

const emit = defineEmits<{
    save: [assignment: Assignment];
    cancel: [];
    update: [assignment: Assignment];
}>();

// State
const assignment = ref<Assignment>(createEmptyAssignment());
const isEditable = ref(props.isEditable ?? true);
const currentTask = ref<Task | null>(null);

// Computed
const rubricCriteria = computed({
    get: () => assignment.value.rubric?.criteria ?? [],
    set: (criteria) => {
        if (!assignment.value.rubric) {
            assignment.value.rubric = { criteria: [] };
        }
        assignment.value.rubric.criteria = criteria;
    }
});

const peerReviewEnabled = computed({
    get: () => assignment.value.peerReviewSettings?.enabled ?? false,
    set: (value) => {
        if (!assignment.value.peerReviewSettings) {
            assignment.value.peerReviewSettings = {
                enabled: false,
                reviewsPerStudent: 0,
                dueDate: new Date()
            };
        }
        assignment.value.peerReviewSettings.enabled = value;
    }
});

const reviewsPerStudent = computed({
    get: () => assignment.value.peerReviewSettings?.reviewsPerStudent ?? 0,
    set: (value) => {
        if (assignment.value.peerReviewSettings) {
            assignment.value.peerReviewSettings.reviewsPerStudent = value;
        }
    }
});

const reviewDueDate = computed({
    get: () => assignment.value.peerReviewSettings?.dueDate ?? new Date(),
    set: (value) => {
        if (assignment.value.peerReviewSettings) {
            assignment.value.peerReviewSettings.dueDate = value;
        }
    }
});

const isValid = computed(() => {
    return assignment.value.title &&
        assignment.value.description &&
        assignment.value.points > 0 &&
        assignment.value.passingScore >= 0 &&
        assignment.value.maxAttempts > 0 &&
        assignment.value.tasks.length > 0;
});

// Constants
const parentTypeOptions = [
    { label: 'Course', value: ParentType.COURSE },
    { label: 'Lesson', value: ParentType.LESSON },
    { label: 'Module', value: ParentType.MODULE }
];

// Validation Schema
const assignmentSchema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    points: yup.number().required('Points are required').min(0, 'Points must be positive'),
    passingScore: yup.number().required('Passing score is required').min(0, 'Must be at least 0').max(100, 'Must be at most 100'),
    maxAttempts: yup.number().required('Max attempts is required').min(1, 'Must allow at least 1 attempt'),
    timeLimit: yup.number().nullable().min(0, 'Time limit must be positive')
});

// Methods
function createEmptyAssignment(): Assignment {
    return {
        id: '',
        title: '',
        description: '',
        tasks: [],
        parentType: ParentType.COURSE,
        peerReviewSettings: {
            enabled: false,
            reviewsPerStudent: 0,
            dueDate: new Date()
        },
        submissionWindow: {
            start: new Date(),
            end: new Date(),
            allowLateSubmissions: false,
            lateSubmissionPenalty: 0
        },
        maxAttempts: 1,
        passingScore: 60,
        points: 0,
        timeLimit: undefined
    };
}

function addCriterion() {
    if (!assignment.value.rubric) {
        assignment.value.rubric = { criteria: [] };
    }
    assignment.value.rubric.criteria.push({
        criterion: '',
        points: 0
    });
}

function removeCriterion(index: number) {
    if (assignment.value.rubric?.criteria) {
        assignment.value.rubric.criteria.splice(index, 1);
    }
}

function updateTasks() {
    assignment.value.tasks = assignment.value.tasks.map((task, index) => ({
        ...task,
        order: index
    }));
    emit('update', assignment.value);
}

function addTask(type: TaskTypeEnum) {
    const newTask: BaseTask = {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        taskType: type,
        status: ProgressTypeEnum.NOT_STARTED,
        points: 0,
        order: assignment.value.tasks.length,
        xpReward: 0,
        requiredForCompletion: true,
        dueDate: new Date(),
        assignmentId: assignment.value.id || ''
    };
    assignment.value.tasks.push(newTask as Task);
    updateTasks();
}

function editTask(task: Task) {
    currentTask.value = { ...task };
}

function deleteTask(task: Task) {
    assignment.value.tasks = assignment.value.tasks.filter(t => t.id !== task.id);
    updateTasks();
}

function save() {
    if (isValid.value) {
        emit('save', assignment.value);
    }
}

function onSubmit() {
    if (isValid.value) {
        emit('save', assignment.value);
    }
}

function cancel() {
    emit('cancel');
}

function validateSubmissionWindow(start: Date, end: Date): boolean {
    return start < end;
}

// Watchers
watch(() => assignment.value.submissionWindow, (newWindow) => {
    if (!validateSubmissionWindow(newWindow.start, newWindow.end)) {
        // If invalid, reset end date to be after start date
        newWindow.end = new Date(newWindow.start.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
    }
}, { deep: true });

</script>