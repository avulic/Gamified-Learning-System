<template>
    <div class="p-4 bg-gray-200">
        <div v-if="showEdit" class="top-0 left-0 mt-4 ml-4">
            <div class="flex px-3 mb-6 md:mb-0">
                <InputSwitch v-model="isEditable" />
                <label for="edit" class="ml-2">Edit assignment</label>
            </div>
        </div>
        <TabView>
            <TabPanel header="Assignment Details">
                <Form @submit="onSubmit" :validation-schema="assignmentSchema" v-slot="{ errors }">
                    <div class="p-fluid">
                        <div class="p-field">
                            <label for="title">Title</label>
                            <Field name="title" v-model="assignment.title" v-slot="{ field }">
                                <InputText id="title" v-model="assignment.title" v-bind="field"
                                    :class="{ 'p-invalid': errors.title }" />
                            </Field>
                            <ErrorMessage name="title" class="text-red-600" />
                        </div>
                        <div class="p-field">
                            <label for="description">Description</label>
                            <Field name="description" v-model="assignment.description" v-slot="{ field }">
                                <Textarea id="description" v-model="assignment.description" v-bind="field" rows="3"
                                    :class="{ 'p-invalid': errors.description }" />
                            </Field>
                            <ErrorMessage name="description" class="text-red-600" />
                        </div>
                        <div class="p-field">
                            <label for="dueDate">Due Date</label>
                            <Field name="dueDate" v-model="assignment.description" v-slot="{ field }">
                                <Calendar id="dueDate" v-model="assignment.dueDate" v-bind="field"
                                    :class="{ 'p-invalid': errors.dueDate }" />
                            </Field>
                            <ErrorMessage name="dueDate" class="text-red-600" />
                        </div>
                        <div class="p-field">
                            <label for="maxScore">Max Score</label>
                            <Field name="maxScore" v-model="assignment.description" v-slot="{ field }">
                                <InputNumber id="maxScore" v-model="assignment.maxScore" v-bind="field"
                                    :class="{ 'p-invalid': errors.maxScore }" />
                            </Field>
                            <ErrorMessage name="maxScore" class="text-red-600" />
                        </div>
                        <div class="p-field">
                            <label for="xpReward">XP Reward</label>
                            <Field name="xpReward" v-model="assignment.description" v-slot="{ field }">
                                <InputNumber id="xpReward" v-model="assignment.xpReward" v-bind="field"
                                    :class="{ 'p-invalid': errors.xpReward }" />
                            </Field>
                            <ErrorMessage name="xpReward" class="text-red-600" />
                        </div>
                    </div>
                </Form>
            </TabPanel>
            <TabPanel header="Tasks">
                <DataTable :value="assignment.tasks" @rowReorder="onTaskReorder" v-model:selection="selectedTask">
                    <Column rowReorder />
                    <Column field="title" header="Title" />
                    <Column field="type" header="Type" />
                    <Column field="xpReward" header="XP Reward" />
                    <Column field="weight" header="Weight" />
                    <Column body="actionTemplate">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2"
                                @click="editTask(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger"
                                @click="deleteTask(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
                <SplitButton label="Add Task" icon="pi pi-plus" :model="addTaskItems" @click="addDefaultTask" />
            </TabPanel>
        </TabView>

        <Dialog v-model:visible="taskDialogVisible" :style="{ width: '60vw' }" modal header="Task Details">
            <TaskDetails :task="currentTasks" :saveTask="saveTask"></TaskDetails>
        </Dialog>

        <div>
            <Button label="Save Assignment" icon="pi pi-check" @click="saveAssignment" :disabled="!isAssignmentValid" />
            <Button label="Cancel" icon="pi pi-times" @click="closeDialog" class="p-button-secondary" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Form, Field, ErrorMessage, FieldArray } from 'vee-validate';
import * as yup from 'yup';
import type Assignment from '@/types/Assignment';
import Task, { TextTask, UploadTask, TextContent, SubmissionSettings, TaskTypeEnum } from '@/types/task/Task';
import Quiz, { QuizContent } from '@/types/quiz/Quiz';
import { type Question, type MultiChoiceQuestion, type TextQuestion, type TrueFalseQuestion, QuestionType } from '@/types/task/question/Question';


import { default as TaskDetails } from '@/components/task/Details.vue';
import { ProgressTypeEnum } from '@/types/Progression';
import { SubmissionTypeEnum } from '@/types/Assignment';

const props = defineProps<{
    initialAssignment?: Assignment;
}>();


const emit = defineEmits<{
    onSaveAssignment: [assignment: Assignment],
    cancel: [assignment: void],
    updateAssignment: [assignment: Assignment]
}>()


const dialogVisible = ref(true);
const taskDialogVisible = ref(false);

const showEdit = ref(props.initialAssignment !== null);
const isEditable = ref(true);



const currentTasks = ref<Task[]>([
    {
        id: '1',
        assignmentId: '1',
        taskType: TaskTypeEnum.TEXT,
        status: ProgressTypeEnum.NOT_STARTED,
        dueDate: new Date(),
        title: 'Text Task',
        description: 'Read the following text',
        xpReward: 50,
        requiredForCompletion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        content: [{
            questions: [{
                id: 'q1',
                taskId: '1',
                question: 'Is the sky blue?',
                points: 5,
                correctAnswer: "Yes"
            } as TextQuestion],
            minWords: 1,
            maxWords: 100
        } as TextContent],
        estimatedReadTime: 300
    } as TextTask,
    {
        id: '2',
        assignmentId: '1',
        taskType: TaskTypeEnum.FILE_UPLOAD,
        status: ProgressTypeEnum.NOT_STARTED,
        title: 'File Upload Task',
        description: 'Upload your assignment',
        xpReward: 150,
        requiredForCompletion: true,
        content: {
            allowedFileTypes: ['.pdf', '.doc', '.docx'],
            maxFileSize: 10 * 1024 * 1024 // 10MB
        },
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from no
    } as UploadTask,
    {
        id: '3',
        assignmentId: '1',
        taskType: TaskTypeEnum.QUIZ,
        status: ProgressTypeEnum.NOT_STARTED,
        title: 'Quiz 1',
        description: 'First quiz',
        xpReward: 100,
        requiredForCompletion: true,
        content: {
            questions: [
                {
                    id: 'q2',
                    taskId: '1',
                    question: 'Is the sky blue?',
                    points: 5,
                    correctAnswer: "Yes"
                } as TextQuestion,
                {
                    id: 'q2',
                    taskId: '1',
                    question: 'Is the sky blue?',
                    points: 5,
                    correctAnswer: "Yes"
                } as TextQuestion,
                {
                    id: 'q2',
                    taskId: '1',
                    question: 'Is the sky blue?',
                    points: 5,
                    correctAnswer: "Yes"
                } as TextQuestion
            ]
        } as QuizContent,
        timeLimit: 600,
        passScore: 70,
        maxAttempts: 2
    } as Quiz
]);

const assignment = ref<Assignment>(props.initialAssignment ? { ...props.initialAssignment } : createEmptyAssignment());


const selectedTask = ref<Task | null>(null);
const currentTask = ref<Task | null>(null);

const dialogHeader = computed(() => currentTask.value?.id ? 'Edit Task' : 'New Task');


// const taskTypes = [
//     { name: 'Multiple Choice', value: TaskTypeEnum.MultiChoice },
//     { name: 'Question', value: TaskTypeEnum.QUESTION },
//     { name: 'Quiz', value: TaskTypeEnum.QUIZ },
//     { name: 'File Upload', value: TaskTypeEnum.FILE_UPLOAD }
// ];

const assignmentSchema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    dueDate: yup.date().required('Due date is required'),
    maxScore: yup.number().required('Max score is required').positive('Max score must be positive'),
    xpReward: yup.number().required('XP reward is required').positive('XP reward must be positive')
});

const taskSchema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    type: yup.string().required('Type is required'),
    xpReward: yup.number().required('XP reward is required').positive('XP reward must be positive'),
    weight: yup.number().required('Weight is required').positive('Weight must be positive')
});

const isAssignmentValid = computed(() => {
    return assignment.value.tasks && assignment.value.tasks.length > 0;
});

function createEmptyAssignment(): Assignment {
    return {
        id: '',
        title: '',
        description: '',
        order: 0,
        xpReward: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        moduleId: '',
        dueDate: new Date(),
        tasks: [],
        maxScore: 0,
        submissionType: SubmissionTypeEnum.FILE, // Adjust this based on your SubmissionTypeEnum
        allowedFileTypes: [],
        maxFileSize: 0
    };
}

watch(() => props.initialAssignment, (newAssignment) => {
    if (newAssignment) {
        assignment.value = { ...newAssignment };
    } else {
        assignment.value = createEmptyAssignment();
    }
}, { deep: true });



const onSubmit = (() => {
    // Validation passed
});

const onTaskSubmit = (() => {
    if (currentTask.value.id) {
        const index = assignment.value.tasks.findIndex(task => task.id === currentTask.value.id);
        if (index !== -1) {
            assignment.value.tasks[index] = { ...currentTask.value };
        }
    } else {
        currentTask.value.id = Date.now().toString(); // Generate a temporary ID
        currentTask.value.assignmentId = assignment.value.id;
        assignment.value.tasks.push({ ...currentTask.value });
    }
    taskDialogVisible.value = false;
});



const onTaskReorder = (event: any) => {
    assignment.value.tasks = event.value;
};


const saveAssignment = () => {
    if (isAssignmentValid.value) {
        emit('onSaveAssignment', assignment.value);
        dialogVisible.value = false;
    }
};

const closeDialog = () => {
    emit('cancel');
    dialogVisible.value = false;
};


const editTask = (task: Task) => {
    currentTask.value = { ...task };
    taskDialogVisible.value = true;
};

const deleteTask = (task: Task) => {
    const updatedTasks = assignment.value.tasks.filter(t => t.id !== task.id);
    updateAssignment({ ...assignment.value, tasks: updatedTasks });
};


const addTaskItems = [
    {
        label: 'Text Task',
        icon: 'pi pi-file-text',
        command: () => addTask(TaskTypeEnum.TEXT)
    },
    {
        label: 'File Upload Task',
        icon: 'pi pi-upload',
        command: () => addTask(TaskTypeEnum.FILE_UPLOAD)
    },
    {
        label: 'Quiz',
        icon: 'pi pi-list',
        command: () => addTask(TaskTypeEnum.QUIZ)
    }
];

const addDefaultTask = () => addTask(TaskTypeEnum.TEXT);

const addTask = (taskType: TaskTypeEnum) => {
    const newTask = createNewTask(taskType);
    currentTask.value = newTask;
    taskDialogVisible.value = true;
};

const createNewTask = (taskType: TaskTypeEnum): Task => {
    const baseTask = {
        id: Date.now().toString(),
        assignmentId: assignment.value.id,
        taskType: taskType,
        status: ProgressTypeEnum.NOT_STARTED,
        title: `New ${taskType} Task`,
        description: '',
        xpReward: 0,
        requiredForCompletion: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    };

    switch (taskType) {
        case TaskTypeEnum.TEXT:
            return {
                ...baseTask,
                content: [{
                    questions: [],
                    minWords: 1,
                    maxWords: 100
                } as TextContent],
                estimatedReadTime: 0
            } as TextTask;
        case TaskTypeEnum.FILE_UPLOAD:
            return {
                ...baseTask,
                content: {
                    allowedFileTypes: ['.pdf', '.doc', '.docx'],
                    maxFileSize: 10 * 1024 * 1024 // 10MB
                }
            } as UploadTask;
        case TaskTypeEnum.QUIZ:
            return {
                ...baseTask,
                content: {
                    questions: []
                } as QuizContent,
                timeLimit: 600,
                passScore: 70,
                maxAttempts: 2
            } as Quiz;
        default:
            throw new Error(`Unsupported task type: ${taskType}`);
    }
};

const saveTask = (task: Task) => {
    const taskIndex = assignment.value.tasks.findIndex(t => t.id === task.id);
    const updatedTasks = [...assignment.value.tasks];
    if (taskIndex !== -1) {
        updatedTasks[taskIndex] = task;
    } else {
        updatedTasks.push(task);
    }
    updateAssignment({ ...assignment.value, tasks: updatedTasks });
    closeTaskDialog();
};

const closeTaskDialog = () => {
    currentTask.value = null;
    taskDialogVisible.value = false;
};

const updateAssignment = (newAssignment: Assignment) => {
    assignment.value = newAssignment;
    emit('updateAssignment', newAssignment);
};
</script>

<style scoped>
/* Add any component-specific styles here */
</style>