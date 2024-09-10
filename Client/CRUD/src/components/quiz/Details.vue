<template>
    <div class="p-4 bg-gray-200">
        <div v-if="showEdit" class="absolute top-0 left-0 mt-4 ml-4">
            <div class="flex items-center px-3 mb-6">
                <InputSwitch name="edit" v-model="isEditable" />
                <label for="edit" class="ml-2">Edit quiz</label>
            </div>
        </div>
        <TabView>
            <TabPanel header="Quiz Details">
                <Form @submit="onSubmit" :validation-schema="schema" class="flex flex-col items-center"
                    v-slot="{ errors, values }">
                    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-4xl">
                        <div class="flex flex-wrap -mx-3 mb-6">
                            <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                                <Field name="title" v-model="currentQuiz.title" v-slot="{ field, errorMessage }">
                                    <span class="block relative">
                                        <label for="title">Quiz Title</label>
                                        <InputText id="title" v-model="currentQuiz.title" v-bind="field" type="text"
                                            class="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                            :disabled="!isEditable" />
                                    </span>
                                    <ErrorMessage name="title" class="text-red-600 text-xs italic" />
                                </Field>
                            </div>
                            <div class="w-full md:w-1/2 px-3">
                                <Field name="moduleId" v-model="currentQuiz.moduleId" v-slot="{ field, errorMessage }">
                                    <span class="block relative">
                                        <label for="moduleId">Module</label>
                                        <!-- <Dropdown id="moduleId" v-model="currentQuiz.moduleId" v-bind="field"
                                    :options="moduleOptions" optionLabel="title" optionValue="id"
                                    class="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                    :disabled="!isEditable" /> -->
                                    </span>
                                    <ErrorMessage name="moduleId" class="text-red-600 text-xs italic" />
                                </Field>
                            </div>
                        </div>
                        <div class="flex flex-wrap -mx-3 mb-6">
                            <div class="w-full px-3">
                                <Field name="description" v-model="currentQuiz.description"
                                    v-slot="{ field, errorMessage }">
                                    <span class="block relative">
                                        <label for="description">Description</label>
                                        <Textarea id="description" v-model="currentQuiz.description" v-bind="field"
                                            class="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                            :disabled="!isEditable" rows="3" />
                                    </span>
                                    <ErrorMessage name="description" class="text-red-600 text-xs italic" />
                                </Field>
                            </div>
                        </div>
                        <div class="flex flex-wrap -mx-3 mb-6">
                            <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                <Field name="timeLimit" v-model="currentQuiz.timeLimit"
                                    v-slot="{ field, errorMessage }">
                                    <span class=" block relative">
                                        <label for="timeLimit">Time Limit (minutes)</label>
                                        <InputNumber id="timeLimit" v-model="currentQuiz.timeLimit"
                                            :modelValue="field.value" @update:modelValue="field.onChange"
                                            class="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                            :disabled="!isEditable" />
                                    </span>
                                    <ErrorMessage name="timeLimit" class="text-red-600 text-xs italic" />
                                </Field>
                            </div>
                            <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                <Field name="passScore" v-model="currentQuiz.passScore"
                                    v-slot="{ field, errorMessage }">
                                    <span class="block relative">
                                        <label for="passScore">Passing
                                            Score</label>
                                        <InputNumber id="passScore" v-model="currentQuiz.passScore"
                                            :modelValue="field.value" @update:modelValue="field.onChange"
                                            class="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                            :disabled="!isEditable" />
                                    </span>
                                    <ErrorMessage name="passScore" class="text-red-600 text-xs italic" />
                                </Field>
                            </div>
                            <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                                <Field name="maxAttempts" v-model="currentQuiz.maxAttempts"
                                    v-slot="{ field, errorMessage }">
                                    <span class="block relative">
                                        <label for="maxAttempts">Max
                                            Attempts</label>
                                        <InputNumber id="maxAttempts" v-model="currentQuiz.maxAttempts"
                                            :modelValue="field.value" @update:modelValue="field.onChange"
                                            class="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                            :disabled="!isEditable" />
                                    </span>
                                    <ErrorMessage name="maxAttempts" class="text-red-600 text-xs italic" />
                                </Field>
                            </div>
                        </div>
                        <div class="flex flex-wrap -mx-3 mb-6">
                            <div class="w-full px-3">
                                <Field name="xpReward" v-model="currentQuiz.xpReward" v-slot="{ field, errorMessage }">
                                    <span class="block relative">
                                        <label for="xpReward">XP Reward</label>
                                        <InputNumber id="xpReward" v-model="currentQuiz.xpReward"
                                            :modelValue="field.value" @update:modelValue="field.onChange"
                                            class="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                            :disabled="!isEditable" />
                                    </span>
                                    <ErrorMessage name="xpReward" class="text-red-600 text-xs italic" />
                                </Field>
                            </div>
                        </div>

                    </div>
                    <div class="flex justify-between w-full max-w-4xl">
                        <Button label="Save" type="submit"
                            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            :disabled="loading || !isEditable" />
                        <Button label="Delete" type="button" @click="deleteQuiz"
                            class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            :disabled="loading || !isEditable" />
                    </div>
                </Form>
            </TabPanel>
            <TabPanel header="Questions">
                <DataTable :value="currentQuiz.questions" @rowReorder="ontQuestionReorder"
                    v-model:selection="selectedtQuestion">
                    <Column rowReorder />
                    <Column field="title" header="Title" />
                    <Column field="type" header="Type" />
                    <Column field="xpReward" header="XP Reward" />
                    <Column field="weight" header="Weight" />
                    <Column body="actionTemplate">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2"
                                @click="editQuestion(slotProps.data)" />
                            <Button icon="pi pi-trash" class="p-button-rounded p-button-danger"
                                @click="deleteQuestion(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>

                <div class="flex flex-wrap -mx-3 mb-6">
                    <div class="w-full px-3">
                        <FieldArray name="questions" v-slot="{ fields, push, remove }">
                            <div v-for="(question, index) in currentQuiz.questions" :key="index"
                                class="mb-4 p-4 border rounded">
                                <Field :name="`questions[${index}].text`" v-model="question.text"
                                    v-slot="{ field, errorMessage }">
                                    <span class="block relative">
                                        <label for="questions">Question Text</label>
                                        <InputText :id="`questions[${index}].text`" v-bind="field"
                                            class="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                            :disabled="!isEditable" />
                                    </span>
                                    <ErrorMessage :name="`questions[${index}].text`"
                                        class="text-red-600 text-xs italic" />
                                </Field>
                                <Field :name="`questions[${index}].type`" v-model="question.type"
                                    v-slot="{ field, errorMessage }">
                                    <span class="block relative mt-4">
                                        <label :for="`questions[${index}].type`">Question Type</label>
                                        <Dropdown :id="`questions[${index}].type`" v-bind="field"
                                            :options="questionTypes" optionLabel="label" optionValue="value"
                                            class="block w-full bg-gray-200 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                                            :disabled="!isEditable" />
                                    </span>
                                    <ErrorMessage :name="`questions[${index}].type`"
                                        class="text-red-600 text-xs italic" />
                                </Field>
                                <Button icon="pi pi-trash"
                                    class="p-2 bg-red-500 text-white rounded hover:bg-red-700 mt-2"
                                    @click="() => remove(index)" :disabled="!isEditable" />
                            </div>

                        </FieldArray>
                    </div>
                </div>
                <Button label="Add Question" icon="pi pi-plus" @click="() => push(newQuestion())"
                    class="p-2 bg-blue-500 text-white rounded hover:bg-blue-700" :disabled="!isEditable" />
            </TabPanel>
        </TabView>

        <Dialog v-model:visible="questionDialogVisible" :style="{ width: '60vw' }" modal header="Task Details">
            <QuestionDetails></QuestionDetails>

        </Dialog>

    </div>
    <Toast />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Form, Field, ErrorMessage, FieldArray } from 'vee-validate'
import { object, string, number, array } from 'yup'
import { useToast } from 'primevue/usetoast'
import type Quiz from '@/types/quiz/Quiz'
import type Module from '@/types/Module'
import Question, { QuestionType } from '@/types/task/question/Question'

import Details from '@/components/question/Details';

const toast = useToast()
const loading = ref(false)
const isEditable = ref(true)
const questionDialogVisible = ref(false);

const schema = object({
    title: string().required('Title is required'),
    moduleId: string().required('Module is required'),
    description: string().required('Description is required'),
    timeLimit: number().positive().integer().nullable().required('Time limit is required'),
    passScore: number().required('Passing score is required').min(0).max(100),
    maxAttempts: number().required('Max attempts is required').positive().integer(),
    xpReward: number().required('XP reward is required').positive().integer(),
    questions: array().of(
        object({
            text: string().required('Question text is required'),
            type: string().oneOf(Object.values(QuestionType)).required('Question type is required'),
            // Add more validation for question options, correct answer, etc.
        })
    ).min(1, 'At least one question is required')
})

const currentQuiz = ref<Quiz>({
    id: '',
    moduleId: '',
    title: '',
    description: '',
    questions: [],
    timeLimit: 30,
    passScore: 70,
    maxAttempts: 3,
    xpReward: 100,
    createdAt: new Date(),
    updatedAt: new Date()
})

const questionTypes = [
    { label: 'Multiple Choice', value: QuestionType.MultipleChoice },
    { label: 'True/False', value: QuestionType.TrueFalse },
    { label: 'Short Answer', value: QuestionType.ShortAnswer }
]

const props = defineProps<{
    currentQuiz: Quiz | null
    modules: Module[]
}>()

const emit = defineEmits<{
    onSaveQuiz: [quiz: Quiz]
    onEditQuiz: [quiz: Quiz]
    onDeleteQuiz: [quizId: string]
}>()

const showEdit = computed(() => {
    return props.currentQuiz !== null && props.currentQuiz.title.length > 0
})

const moduleOptions = computed(() =>
    props.modules.map(module => ({ title: module.title, id: module.id }))
)

onMounted(() => {
    if (props.currentQuiz !== null && props.currentQuiz.title.length > 0) {
        currentQuiz.value = { ...props.currentQuiz }
        isEditable.value = false
    }
})

const onSubmit = () => {
    if (!props.currentQuiz) {
        emit('onSaveQuiz', currentQuiz.value)
        clearForm()
    } else {
        emit('onEditQuiz', currentQuiz.value)
    }
}

function deleteQuiz() {
    emit('onDeleteQuiz', currentQuiz.value.id)
}

function clearForm() {
    currentQuiz.value = {
        id: '',
        moduleId: '',
        title: '',
        description: '',
        questions: [],
        timeLimit: 30,
        passScore: 70,
        maxAttempts: 3,
        xpReward: 100,
        createdAt: new Date(),
        updatedAt: new Date()
    }
}

function newQuestion(): Question {
    return {
        id: '',
        type: QuestionType.MultipleChoice,
        text: '',
        options: [],
        correctAnswer: [],
        points: 1,
        quizId: currentQuiz.value.id
    }
}


const editQuestion = (task: Question) => {
    // currentTask.value = { ...task };
    questionDialogVisible.value = true;
};

const deleteQuestion = (task: Question) => {
    // assignment.value.tasks = assignment.value.tasks.filter(t => t.id !== task.id);
};

const onQuestionReorder = (event: any) => {
    // assignment.value.tasks = event.value;
};
</script>