<!-- TaskEditor.vue -->
<template>
    <Form @submit="handleSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
        <!-- Common Fields from BaseTask -->
        <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700">Title</label>
                        <Field name="title" v-slot="{ field }">
                            <InputText v-model="currentTask.title" v-bind="field" class="w-full"
                                :class="{ 'p-invalid': errors.title }" />
                        </Field>
                        <small class="text-red-500">{{ errors.title }}</small>
                    </div>

                    <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <Field name="description" v-slot="{ field }">
                            <Textarea v-model="currentTask.description" v-bind="field" rows="3" class="w-full"
                                :class="{ 'p-invalid': errors.description }" />
                        </Field>
                        <small class="text-red-500">{{ errors.description }}</small>
                    </div>

                    <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700">Points</label>
                        <Field name="points" v-slot="{ field }">
                            <InputNumber v-model="currentTask.points" v-bind="field" class="w-full" :min="0"
                                :showButtons="true" />
                        </Field>
                        <small class="text-red-500">{{ errors.points }}</small>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700">XP Reward</label>
                        <Field name="xpReward" v-slot="{ field }">
                            <InputNumber v-model="currentTask.xpReward" v-bind="field" class="w-full" :min="0"
                                :showButtons="true" />
                        </Field>
                        <small class="text-red-500">{{ errors.xpReward }}</small>
                    </div>

                    <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700">Due Date</label>
                        <Field name="dueDate" v-slot="{ field }">
                            <Calendar v-model="currentTask.dueDate" v-bind="field" class="w-full" showTime
                                :minDate="new Date()" dateFormat="dd/mm/yy" />
                        </Field>
                        <small class="text-red-500">{{ errors.dueDate }}</small>
                    </div>

                    <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700">Status</label>
                        <Field name="status" v-slot="{ field }">
                            <Dropdown v-model="currentTask.status" :options="Object.values(ProgressTypeEnum)"
                                class="w-full" :class="{ 'p-invalid': errors.status }" />
                        </Field>
                        <small class="text-red-500">{{ errors.status }}</small>
                    </div>

                    <div class="form-field">
                        <label class="block text-sm font-medium text-gray-700">Max Attempts</label>
                        <Field name="maxAttempts" v-slot="{ field }">
                            <InputNumber v-model="currentTask.maxAttempts" v-bind="field" class="w-full" :min="1"
                                :showButtons="true" />
                        </Field>
                        <small class="text-red-500">{{ errors.maxAttempts }}</small>
                    </div>

                    <div class="flex items-center gap-2 mt-2">
                        <Field name="requiredForCompletion" type="checkbox" v-slot="{ field }">
                            <Checkbox v-model="currentTask.requiredForCompletion" v-bind="field" :binary="true" />
                        </Field>
                        <label class="text-sm text-gray-700">Required for completion</label>
                    </div>
                </div>
            </div>

            <!-- Task Type Specific Content -->
            <div>
                <template v-if="isQuestionTask">
                    <QuestionTaskComponent 
                        v-model="(currentTask as QuestionTask).content"
                        @update:modelValue="updateQuestionContent" />
                </template>
                <template v-else-if="isQuizTask">
                    <QuizTaskComponent 
                        v-model="(currentTask as QuizTask).content"
                        @update:modelValue="(content: QuizTaskContent) => updateTaskContent(content)" />
                </template>
                <template v-else-if="isFileUploadTask">
                    <FileUploadTaskComponent 
                        v-model="(currentTask as FileUploadTask).content" 

                        @update:modelValue="content => updateTaskContent(content)" />
                </template>
                <template v-else-if="isCodeTask">
                    <CodeTaskComponent 
                        v-model="(currentTask as CodeTask).content"
                        @update:modelValue="content => updateTaskContent(content)" />
                </template>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-2">
                <Button type="button" label="Cancel" class="p-button-text" @click="$emit('cancel')"
                    :disabled="isSubmitting" />
                <Button type="submit" label="Save" :loading="isSubmitting" />
            </div>
        </div>
    </Form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Form, Field } from 'vee-validate';
import * as yup from 'yup';
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from '@/types/enums';
import { 
    BaseTask,
    Task, 
    QuestionTask, 
    QuizTask,
    FileUploadTask,
    CodeTask,
    FileUploadTaskContent,
    CodeTaskContent,
    QuizTaskContent,
    CodeTestCase 
} from '@/types/task/Task';
import { Question, BaseQuestion, MultiChoiceQuestion, TrueFalseQuestion, TextQuestion } from '@/types/task/Question';

// Components
import QuestionTaskComponent from '@/components/question/QuestionBase.vue';
import QuizTaskComponent from '@/components/task/QuizTask.vue';
import FileUploadTaskComponent from '@/components/task/Upload.vue';
import CodeTaskComponent from '@/components/task/Code.vue';

const props = defineProps<{
    task?: Task | null;
    taskType: TaskTypeEnum | null;
}>();

const emit = defineEmits<{
    (e: 'save', task: Task): void;
    (e: 'cancel'): void;
}>();

// Type guards
const isQuestionTask = computed(() => currentTask.value.taskType === TaskTypeEnum.QUESTION);
const isQuizTask = computed(() => currentTask.value.taskType === TaskTypeEnum.QUIZ);
const isFileUploadTask = computed(() => currentTask.value.taskType === TaskTypeEnum.FILE_UPLOAD);
const isCodeTask = computed(() => currentTask.value.taskType === TaskTypeEnum.CODE);

function createEmptyTask(taskType: TaskTypeEnum | null): Task {
    const baseTask: BaseTask = {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        taskType: taskType ? taskType : TaskTypeEnum.QUESTION,
        status: ProgressTypeEnum.NOT_STARTED,
        points: 0,
        order: 0,
        xpReward: 0,
        requiredForCompletion: false,
        dueDate: new Date(),
        assignmentId: '',
        prerequisites: [],
        maxAttempts: 1
    };

    switch (taskType) {
        case TaskTypeEnum.QUESTION: {
            const task = new QuestionTask();
            Object.assign(task, baseTask);
            task.content = {
                id: crypto.randomUUID(),
                question: '',
                questionType: QuestionType.TEXT,
                correctAnswer: ''
            };
            return task;
        }

        case TaskTypeEnum.QUIZ: {
            const task = new QuizTask();
            Object.assign(task, baseTask);
            task.content = {
                questions: [],
                timeLimit: 30,
                passingScore: 70,
                maxAttempts: 1
            };
            return task;
        }

        case TaskTypeEnum.FILE_UPLOAD: {
            const task = new FileUploadTask();
            Object.assign(task, baseTask);
            task.content = {
                allowedFileTypes: [],
                maxFileSize: 5
            };
            return task;
        }

        case TaskTypeEnum.CODE: {
            const task = new CodeTask();
            Object.assign(task, baseTask);
            task.content = {
                language: 'javascript',
                initialCode: '',
                testCases: []
            };
            return task;
        }

        default:
            throw new Error(`Unsupported task type: ${taskType}`);
    }
}

// Initialize current task using the class-based approach
const currentTask = ref<Task>(props.task || createEmptyTask(props.taskType));

// Validation schema
const schema = yup.object({
    title: yup.string()
        .required('Title is required')
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be less than 100 characters'),
    description: yup.string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters'),
    points: yup.number()
        .required('Points are required')
        .min(0, 'Points must be non-negative'),
    xpReward: yup.number()
        .required('XP reward is required')
        .min(0, 'XP reward must be non-negative'),
    dueDate: yup.date()
        .required('Due date is required')
        .min(new Date(), 'Due date must be in the future'),
    status: yup.string()
        .required('Status is required')
        .oneOf(Object.values(ProgressTypeEnum), 'Invalid status'),
    maxAttempts: yup.number()
        .min(1, 'Must allow at least one attempt'),
    requiredForCompletion: yup.boolean(),
    content: yup.object().required('Content is required')
});


// Handle updates from specific task type components
function updateQuestionContent(question: Question) {
    if (isQuestionTask.value) {
        (currentTask.value as QuestionTask).content = question;
    }
}

function updateTaskContent<T>(content: T) {
    if (currentTask.value) {
        (currentTask.value as any).content = content;
    }
}

async function handleSubmit(values: any) {
    const updatedTask = Object.assign(
        createEmptyTask(currentTask.value.taskType), 
        currentTask.value,
        values
    );

    emit('save', updatedTask);
}
</script>

<style scoped>
.form-field {
    @apply space-y-1;
}
</style>