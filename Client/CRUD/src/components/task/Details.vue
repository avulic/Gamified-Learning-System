<!-- Improved Details.vue with Type Safety and Robust Handling -->
<template>
    <div class="task-details-container bg-gray-100 p-6">
        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }">
            <TabView>
                <TabPanel header="Task Details">
                    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
                        <!-- Common Task Fields -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Field name="title" v-slot="{ field }">
                                <InputText 
                                    v-model="currentTask.title" 
                                    v-bind="field"
                                    class="w-full p-3 border rounded-md"
                                    :class="{ 'border-red-500': errors.title }"
                                />
                                <ErrorMessage name="title" class="text-red-500 text-xs mt-1" />
                            </Field>
                        </div>

                        <!-- Task Type Specific Content -->
                        <component 
                            v-if="taskTypeComponent"
                            :is="taskTypeComponent" 
                            v-model="currentTask.content"
                            :task-type="currentTask.taskType"
                            :errors="errors"
                        />
                    </div>
                </TabPanel>
            </TabView>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from '@/types/enums';
import { QuestionTask, QuizTask, Task } from '@/types/task/Task';
import { ref, computed } from 'vue';
import * as Yup from 'yup';

import QuestionComponent from './Question.vue';
import QuizComponent from './Quiz.vue';
import FileUploadComponent from './Upload.vue';
import CodeComponent from './Code.vue';

// Type-safe component mapping
const taskTypeComponentMap = {
    [TaskTypeEnum.QUESTION]: QuestionComponent,
    [TaskTypeEnum.QUIZ]: QuizComponent,
    [TaskTypeEnum.FILE_UPLOAD]: FileUploadComponent,
    [TaskTypeEnum.CODE]: CodeComponent,
};

// Type guard for task type
function isTaskType<T extends Task>(
    task: Task, 
    type: TaskTypeEnum
): task is T {
    return task.taskType === type;
}

// Task creation utility
function createTask(type: TaskTypeEnum): Task {
    const baseTask = {
        id: crypto.randomUUID(),
        title: '',
        description: '',
        taskType: type,
        status: ProgressTypeEnum.NOT_STARTED,
        points: 0,
        order: 0,
        xpReward: 0,
        requiredForCompletion: false,
        dueDate: new Date(),
        assignmentId: '',
        prerequisites: []
    };

    switch (type) {
        case TaskTypeEnum.QUESTION:
            return {
                ...baseTask,
                content: {
                    id: crypto.randomUUID(),
                    question: '',
                    questionType: QuestionType.TEXT,
                    correctAnswer: ''
                }
            } as QuestionTask;
        case TaskTypeEnum.QUIZ:
            return {
                ...baseTask,
                content: {
                    questions: [],
                    timeLimit: 0,
                    passingScore: 0
                }
            } as QuizTask;
        // Add other task type creations
        default:
            throw new Error(`Unsupported task type: ${type}`);
    }
}

// Validation schema with type-safe validation
const schema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    taskType: Yup.mixed<TaskTypeEnum>()
        .oneOf(Object.values(TaskTypeEnum))
        .required('Task type is required'),
    xpReward: Yup.number()
        .required('XP reward is required')
        .min(0, 'XP reward must be non-negative'),
    status: Yup.mixed<ProgressTypeEnum>()
        .oneOf(Object.values(ProgressTypeEnum))
        .required('Status is required')
});

const props = defineProps<{
    initialTask?: Task;
    taskType?: TaskTypeEnum;
}>();

const emit = defineEmits<{
    (e: 'save', task: Task): void;
    (e: 'cancel'): void;
}>();

// Initialize task with prop or create new
const currentTask = ref<Task>(
    props.initialTask || 
    createTask(props.taskType || TaskTypeEnum.QUESTION)
);

// Computed dynamic component
const taskTypeComponent = computed(() => 
    taskTypeComponentMap[currentTask.value.taskType]
);

// Submit handler with type checking
const onSubmit = (values: any) => {
    const updatedTask: Task = {
        ...currentTask.value,
        ...values,
        updatedAt: new Date()
    };

    // Validate task type before emitting
    if (isTaskType(updatedTask, updatedTask.taskType)) {
        emit('save', updatedTask);
    } else {
        console.error('Invalid task type');
    }
};
</script>