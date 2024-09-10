<template>
    <div class="bg-gray-100 p-6">
        <div v-if="showEdit" class="mb-4">
            <div class="flex items-center">
                <InputSwitch v-model="isEditable" class="mr-2" />
                <label for="edit" class="text-sm text-gray-600">Edit task</label>
            </div>
        </div>
        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }">

            <TabView>
                <TabPanel header="Task Details">
                    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
                        <!-- Common fields for all task types -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Field name="title" v-slot="{ field }">
                                    <span class="block relative">
                                        <InputText id="title" v-model="currentTask.title" v-bind="field"
                                            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            :class="{ 'border-red-500': errors.title }" :disabled="!isEditable" />
                                        <label for="title"
                                            class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">Task
                                            Title</label>
                                    </span>
                                    <ErrorMessage name="title" class="text-red-500 text-xs mt-1" />
                                </Field>
                            </div>

                        </div>
                        <div class="mt-6">
                            <Field name="description" v-slot="{ field }">
                                <span class="block relative">
                                    <Textarea id="description" v-model="currentTask.description" v-bind="field"
                                        class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                        :class="{ 'border-red-500': errors.description }" :disabled="!isEditable"
                                        rows="3" />
                                    <label for="description"
                                        class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">Description</label>
                                </span>
                                <ErrorMessage name="description" class="text-red-500 text-xs mt-1" />
                            </Field>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div>
                                <Field name="xpReward" v-slot="{ field }">
                                    <span class="block relative">
                                        <InputNumber id="xpReward" v-model="currentTask.xpReward" v-bind="field"
                                            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            :class="{ 'border-red-500': errors.xpReward }" :disabled="!isEditable" />
                                        <label for="xpReward"
                                            class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">XP
                                            Reward</label>
                                    </span>
                                    <ErrorMessage name="xpReward" class="text-red-500 text-xs mt-1" />
                                </Field>
                            </div>
                            <div>
                                <Field name="weight" v-slot="{ field }">
                                    <span class="block relative">
                                        <InputNumber id="weight" v-model="currentTask.weight" v-bind="field"
                                            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            :class="{ 'border-red-500': errors.weight }" :disabled="!isEditable" />
                                        <label for="weight"
                                            class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">Weight</label>
                                    </span>
                                    <ErrorMessage name="weight" class="text-red-500 text-xs mt-1" />
                                </Field>
                            </div>
                            <div>
                                <Field name="status" v-slot="{ field }">
                                    <span class="block relative">
                                        <Dropdown id="status" v-model="currentTask.status" v-bind="field"
                                            :options="Object.values(ProgressTypeEnum)"
                                            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            :class="{ 'border-red-500': errors.status }" :disabled="!isEditable" />
                                        <label for="status"
                                            class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">Status</label>
                                    </span>
                                    <ErrorMessage name="status" class="text-red-500 text-xs mt-1" />
                                </Field>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <Field name="dueDate" v-slot="{ field }">
                                    <span class="block relative">
                                        <Calendar id="dueDate" v-model="currentTask.dueDate" v-bind="field"
                                            class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                            :class="{ 'border-red-500': errors.dueDate }" :disabled="!isEditable" />
                                        <label for="dueDate"
                                            class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">Due
                                            Date</label>
                                    </span>
                                    <ErrorMessage name="dueDate" class="text-red-500 text-xs mt-1" />
                                </Field>
                            </div>
                        </div>

                    </div>
                </TabPanel>

                <TabPanel header="Content">
                    <div v-if="Array.isArray(currentTask.content)">
                        <DataTable :value="questions" tableStyle="min-width: 50rem">
                            <Column field="id" header="ID"></Column>
                            <Column field="question" header="Question"></Column>
                            <Column field="points" header="Points"></Column>
                            <Column field="correctAnswer" header="Correct Answer"></Column>
                        </DataTable>
                    </div>
                    <div v-if="currentTask.taskType" class="flex justify-start space-x-4">
                        <Field name="type" v-slot="{ field }">
                            <span class="block relative">
                                <Dropdown id="type" v-model="currentTask.taskType" v-bind="field"
                                    :options="Object.values(TaskTypeEnum)"
                                    class="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                                    :class="{ 'border-red-500': errors.type }" :disabled="!isEditable" />
                                <label for="type"
                                    class="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600">Task
                                    Type</label>
                            </span>
                            <ErrorMessage name="type" class="text-red-500 text-xs mt-1" />
                        </Field>
                    </div>

                    <div v-if="currentTask.taskType">
                        <component :is="taskTypeComponent" v-model="currentTask.content" :errors="errors"
                            :is-editable="isEditable" />
                    </div>

                    <div class="flex justify-end space-x-4">
                        <Button label="Add" type="submit"
                            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            :disabled="!isEditable" />
                        <Button label="Delete" type="button"
                            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            @click="deleteTask" :disabled="!isEditable" />
                    </div>
                </TabPanel>
            </TabView>


            <div class="flex justify-end space-x-4">
                <Button label="Save" type="submit"
                    class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    :disabled="!isEditable" />
                <Button label="Delete" type="button"
                    class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    @click="deleteTask" :disabled="!isEditable" />
            </div>
        </Form>
    </div>
    <!-- <Toast /> -->
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Form, Field, ErrorMessage, useForm, SubmissionHandler } from 'vee-validate';
import { object, string, number, date, ObjectSchema, InferType } from 'yup';
import Task, { TaskTypeEnum, TextTask, TextContent, UploadTask } from '@/types/task/Task';
import Quiz from '@/types/quiz/Quiz';
import { ProgressTypeEnum } from '@/types/Progression';
import { QuestionType, TextQuestion } from '@/types/task/question/Question';
import Question from '@/components/question/Question.vue';
import MultiChoice from '@/components/question/MultiChoice.vue';
import TrueFalse from '@/components/question/TrueFalse.vue';

const props = defineProps<{
    task?: Task;
}>();

const emit = defineEmits<{
    saveTask: [task: Task];
    deleteTask: [taskId: string];
}>();

const currentTask = ref<Task>(
    {
        id: '1',
        assignmentId: '1',
        taskType: TaskTypeEnum.TEXT,
        status: ProgressTypeEnum.NOT_STARTED,
        dueDate: new Date(),
        title: 'Reading Task',
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
    } as TextTask
);

const questions = computed(() => {
    if (Array.isArray(currentTask.value.content)) {
        return currentTask.value.content.flatMap(content => content.questions);
    }
    return [];
});

const taskTypeComponent = computed(() => {
    switch (currentTask.value.taskType) {
        case TaskTypeEnum.QUESTION:
            return Question;
        case TaskTypeEnum.MULTI_CHOICE:
            return MultiChoice;
        case TaskTypeEnum.QUIZ:
            return TrueFalse;
        default:
            return null;
    }
});

const isEditable = ref(true);
const showEdit = ref(props.task !== null);



const taskTypeOptions = [
    { label: 'Question', value: TaskTypeEnum.QUESTION },
    { label: 'Multiple Choice', value: TaskTypeEnum.MULTI_CHOICE },
    { label: 'File Upload', value: TaskTypeEnum.FILE_UPLOAD },
];

// const taskTypeComponent = computed(() => {
//     switch (currentTask.value.type) {
//         case TaskTypeEnum.QUESTION:
//             return Question;
//         case TaskTypeEnum.MULTI_CHOICE:
//             return MultiChoice;
//         // case TaskTypeEnum.FILE_UPLOAD:
//         //     return FileUploadTask;
//         // case TaskTypeEnum.TEXT:
//         //     return TextSubmissionTask;
//         default:
//             return null;
//     }
// });



// const onSubmit = getSubmitFn(schema, (values: Task) => {
//     emit('saveTask', values);
// });

const schema = object({
    title: string().required('Title is required'),
    taskType: string().required('Task type is required'),
    description: string().required('Description is required'),
    xpReward: number().required('XP reward is required').min(0, 'XP reward must be non-negative'),
    weight: number().required('Weight is required').positive('Weight must be positive'),
    status: string().required('Status is required'),
    dueDate: date().nullable(),
});

const onSubmit = (values: any) => {
    const updatedTask: Task = {
        ...currentTask.value,
        ...values,
        updatedAt: new Date(),
    };

    switch (updatedTask.taskType) {
        case TaskTypeEnum.TEXT:
            emit('saveTask', updatedTask as TextTask);
            break;
        case TaskTypeEnum.FILE_UPLOAD:
            emit('saveTask', updatedTask as UploadTask);
            break;
        case TaskTypeEnum.QUIZ:
            emit('saveTask', updatedTask as Quiz);
            break;
        default:
            console.error('Unknown task type');
    }
};

function getSubmitFn<Schema extends ObjectSchema<Record<string, any>>>(
    schema: Schema,
    callback: (values: InferType<Schema>) => void
) {
    return (values: Record<string, any>) => {
        return callback(values as InferType<Schema>);
    };
}

const deleteTask = () => {
    if (currentTask.value.id) {
        emit('deleteTask', currentTask.value.id);
    }
};


// type CommonTaskFields = {
// id: string;
// assignmentId: string;
// taskType: TaskTypeEnum;
// status: ProgressTypeEnum;
// title: string;
// description: string;
// xpReward: number;
// requiredForCompletion: boolean;
// dueDate?: Date;
// };

// const commonFields = computed((): CommonTaskFields => ({
// id: currentTask.value.id,
// assignmentId: currentTask.value.assignmentId,
// taskType: currentTask.value.taskType,
// status: currentTask.value.status,
// title: currentTask.value.title,
// description: currentTask.value.description,
// xpReward: currentTask.value.xpReward,
// requiredForCompletion: currentTask.value.requiredForCompletion,
// dueDate: currentTask.value.dueDate,
// }));

// const { handleSubmit, errors } = useForm({
// validationSchema: schema,
// initialValues: commonFields,
// });

// const onSubmit = handleSubmit((values: CommonTaskFields) => {
// const updatedTask: Task = {
// ...currentTask.value,
// ...values,
// };

// switch (updatedTask.taskType) {
// case TaskTypeEnum.TEXT:
// emit('saveTask', updatedTask as TextTask);
// break;
// case TaskTypeEnum.FILE_UPLOAD:
// emit('saveTask', updatedTask as UploadTask);
// break;
// case TaskTypeEnum.QUIZ:
// emit('saveTask', updatedTask as Quiz);
// break;
// default:
// console.error('Unknown task type');
// }
// });






</script>
