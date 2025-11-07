<template>
    <div class="p-4 bg-gray-100">
        <TabView>
            <!-- Quiz Configuration -->
            <TabPanel header="Quiz Settings">
                <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }">
                    <div class="space-y-4">
                        <!-- Basic Information -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="form-field">
                                <label for="title">Title</label>
                                <Field name="title" v-slot="{ field }">
                                    <InputText v-model="quiz.title" v-bind="field"
                                        :class="{ 'p-invalid': errors.title }" />
                                </Field>
                                <ErrorMessage name="title" class="text-red-500 text-sm" />
                            </div>

                            <div class="form-field">
                                <label for="assignmentId">Assignment</label>
                                <Field name="assignmentId" v-slot="{ field }">
                                    <Dropdown v-model="quiz.assignmentId" 
                                        :options="assignmentOptions"
                                        optionLabel="title"
                                        optionValue="id"
                                        placeholder="Select Assignment"
                                        :class="{ 'p-invalid': errors.assignmentId }" />
                                </Field>
                                <ErrorMessage name="assignmentId" class="text-red-500 text-sm" />
                            </div>
                        </div>

                        <div class="form-field">
                            <label for="description">Description</label>
                            <Field name="description" v-slot="{ field }">
                                <Textarea v-model="quiz.description" v-bind="field" rows="3"
                                    :class="{ 'p-invalid': errors.description }" />
                            </Field>
                            <ErrorMessage name="description" class="text-red-500 text-sm" />
                        </div>

                        <!-- Quiz Settings -->
                        <Panel header="Quiz Configuration" class="mt-4">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="form-field">
                                    <label for="timeLimit">Time Limit (minutes)</label>
                                    <Field name="content.timeLimit" v-slot="{ field }">
                                        <InputNumber v-model="quiz.content.timeLimit" 
                                            :min="0"
                                            placeholder="Time limit in minutes"
                                            :class="{ 'p-invalid': errors['content.timeLimit'] }" />
                                    </Field>
                                    <ErrorMessage name="content.timeLimit" class="text-red-500 text-sm" />
                                </div>

                                <div class="form-field">
                                    <label for="passingScore">Passing Score (%)</label>
                                    <Field name="content.passingScore" v-slot="{ field }">
                                        <InputNumber v-model="quiz.content.passingScore"
                                            :min="0"
                                            :max="100"
                                            placeholder="Required score"
                                            :class="{ 'p-invalid': errors['content.passingScore'] }" />
                                    </Field>
                                    <ErrorMessage name="content.passingScore" class="text-red-500 text-sm" />
                                </div>

                                <div class="form-field">
                                    <label for="maxAttempts">Max Attempts</label>
                                    <Field name="content.maxAttempts" v-slot="{ field }">
                                        <InputNumber v-model="quiz.content.maxAttempts"
                                            :min="1"
                                            placeholder="Maximum attempts"
                                            :class="{ 'p-invalid': errors['content.maxAttempts'] }" />
                                    </Field>
                                    <ErrorMessage name="content.maxAttempts" class="text-red-500 text-sm" />
                                </div>
                            </div>
                        </Panel>

                        <!-- Task Settings -->
                        <Panel header="Task Settings" class="mt-4">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="form-field">
                                    <label for="points">Points</label>
                                    <Field name="points" v-slot="{ field }">
                                        <InputNumber v-model="quiz.points"
                                            :min="0"
                                            placeholder="Total points"
                                            :class="{ 'p-invalid': errors.points }" />
                                    </Field>
                                    <ErrorMessage name="points" class="text-red-500 text-sm" />
                                </div>

                                <div class="form-field">
                                    <label for="xpReward">XP Reward</label>
                                    <Field name="xpReward" v-slot="{ field }">
                                        <InputNumber v-model="quiz.xpReward"
                                            :min="0"
                                            placeholder="XP reward"
                                            :class="{ 'p-invalid': errors.xpReward }" />
                                    </Field>
                                    <ErrorMessage name="xpReward" class="text-red-500 text-sm" />
                                </div>

                                <div class="form-field">
                                    <label for="order">Display Order</label>
                                    <Field name="order" v-slot="{ field }">
                                        <InputNumber v-model="quiz.order"
                                            :min="0"
                                            placeholder="Display order"
                                            :class="{ 'p-invalid': errors.order }" />
                                    </Field>
                                    <ErrorMessage name="order" class="text-red-500 text-sm" />
                                </div>
                            </div>

                            <div class="flex items-center gap-4 mt-4">
                                <div class="form-field">
                                    <Checkbox v-model="quiz.requiredForCompletion" 
                                        :binary="true"
                                        inputId="requiredForCompletion" />
                                    <label for="requiredForCompletion" class="ml-2">Required for completion</label>
                                </div>

                                <div class="form-field">
                                    <label for="dueDate">Due Date</label>
                                    <Calendar v-model="quiz.dueDate" 
                                        showTime 
                                        :showIcon="true"
                                        dateFormat="dd/mm/yy" />
                                </div>
                            </div>
                        </Panel>
                    </div>
                </Form>
            </TabPanel>

            <!-- Questions Management -->
            <TabPanel header="Questions">
                <div class="mb-4 flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Quiz Questions</h3>
                    <SplitButton label="Add Question" 
                        icon="pi pi-plus" 
                        :model="questionTypeOptions"
                        class="p-button-success" />
                </div>

                <DataTable :value="quiz.content.questions"
                    v-model:selection="selectedQuestion"
                    :reorderableRows="true"
                    @rowReorder="onQuestionReorder"
                    dataKey="id"
                    class="mb-4">
                    <Column rowReorder />
                    <Column field="question" header="Question">
                        <template #body="{ data }">
                            <div class="line-clamp-2">{{ data.question }}</div>
                        </template>
                    </Column>
                    <Column field="questionType" header="Type">
                        <template #body="{ data }">
                            {{ getQuestionTypeLabel(data.questionType) }}
                        </template>
                    </Column>
                    <Column header="Actions" style="width: 8rem">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" 
                                    @click="editQuestion(data)"
                                    class="p-button-outlined p-button-success p-button-sm" />
                                <Button icon="pi pi-trash" 
                                    @click="deleteQuestion(data)"
                                    class="p-button-outlined p-button-danger p-button-sm" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </TabPanel>
        </TabView>

        <!-- Question Editor Dialog -->
        <Dialog v-model:visible="showQuestionDialog" 
            :style="{ width: '70vw' }" 
            :header="questionDialogTitle"
            :modal="true">
            <QuestionDetails v-if="currentQuestion"
                :question="currentQuestion"
                @save="saveQuestion"
                @cancel="closeQuestionDialog" />
        </Dialog>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-2 mt-4">
            <Button label="Cancel" 
                icon="pi pi-times" 
                @click="cancel"
                class="p-button-outlined" />
            <Button label="Save" 
                icon="pi pi-check" 
                @click="save"
                :disabled="!isValid"
                class="p-button-primary" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import type { Assignment } from '@/types/Assignment';
import { type Question, type BaseQuestion, MultiChoiceQuestion, TrueFalseQuestion, TextQuestion } from '@/types/task/Question';
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from '@/types/enums';
import QuestionDetails from '../question/QuestionDetails.vue';
import { QuizTask } from '@/types/task/Task';

// Props & Emits
const props = defineProps<{
    quiz: QuizTask | null;
    assignments: Assignment[];
}>();

const emit = defineEmits<{
    save: [quiz: QuizTask];
    cancel: [];
}>();

// State
const quiz = ref<QuizTask>(props.quiz || createEmptyQuiz());
const showQuestionDialog = ref(false);
const currentQuestion = ref<Question | null>(null);
const selectedQuestion = ref<Question | null>(null);

// Computed
const isValid = computed(() => {
    return quiz.value.title &&
        quiz.value.description &&
        quiz.value.content.questions.length > 0 &&
        quiz.value.assignmentId;
});

const questionDialogTitle = computed(() => {
    return currentQuestion.value?.id ? 'Edit Question' : 'New Question';
});

const assignmentOptions = computed(() => {
    return props.assignments.map(assignment => ({
        title: assignment.title,
        id: assignment.id
    }));
});

const questionTypeOptions = [
    {
        label: 'Multiple Choice',
        icon: 'pi pi-list',
        command: () => addQuestion(QuestionType.MULTI_CHOICE)
    },
    {
        label: 'True/False',
        icon: 'pi pi-check-square',
        command: () => addQuestion(QuestionType.TRUE_FALSE)
    },
    {
        label: 'Text Answer',
        icon: 'pi pi-align-left',
        command: () => addQuestion(QuestionType.TEXT)
    }
];

// Validation Schema
const schema = yup.object({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    assignmentId: yup.string().required('Assignment is required'),
    'content.timeLimit': yup.number().min(0, 'Time limit must be positive'),
    'content.passingScore': yup.number().min(0, 'Passing score must be positive').max(100, 'Maximum score is 100'),
    'content.maxAttempts': yup.number().min(1, 'At least one attempt required'),
    points: yup.number().min(0, 'Points must be positive'),
    xpReward: yup.number().min(0, 'XP reward must be positive'),
    order: yup.number().min(0, 'Order must be positive')
});

// Methods
function createEmptyQuiz(): QuizTask {
    return {
        id: '',
        title: '',
        description: '',
        taskType: TaskTypeEnum.QUIZ,
        status: ProgressTypeEnum.NOT_STARTED,
        points: 0,
        order: 0,
        xpReward: 0,
        requiredForCompletion: true,
        dueDate: new Date(),
        assignmentId: '',
        content: {
            questions: [],
            timeLimit: 30,
            passingScore: 70,
            maxAttempts: 1
        }
    };
}

function getQuestionTypeLabel(type: QuestionType): string {
    const labels: Record<QuestionType, string> = {
        [QuestionType.MULTI_CHOICE]: 'Multiple Choice',
        [QuestionType.TRUE_FALSE]: 'True/False',
        [QuestionType.TEXT]: 'Text Answer'
    };
    return labels[type] || 'Unknown';
}

function addQuestion(type: QuestionType) {
    const baseQuestion: BaseQuestion = {
        id: crypto.randomUUID(),
        question: '',
        questionType: type,
    };
    var newQuestion: Question;

    switch (type) {
        case QuestionType.MULTI_CHOICE:
            newQuestion = {
                ...baseQuestion,
                options:[
                {
                    text: 'Option 1',
                    isCorrect: true
                },
                {
                    text: 'Option 2',
                    isCorrect: false
                }
            ]} as MultiChoiceQuestion;
            break;
        case QuestionType.TRUE_FALSE:
        newQuestion = {
                ...baseQuestion,
                correctAnswer: false
            } as TrueFalseQuestion;
            break;
        case QuestionType.TEXT:
        newQuestion = {
                ...baseQuestion,
                correctAnswer: ''
            } as TextQuestion;
            break;
        default:
            throw new Error(`Unsupported question type: ${type}`);
    }
    currentQuestion.value = newQuestion;
    showQuestionDialog.value = true;
}

function editQuestion(question: Question) {
    currentQuestion.value = { ...question };
    showQuestionDialog.value = true;
}

function deleteQuestion(question: Question) {
    quiz.value.content.questions = quiz.value.content.questions.filter(
        q => q.id !== question.id
    );
}

function saveQuestion(question: Question) {
    const index = quiz.value.content.questions.findIndex(q => q.id === question.id);
    if (index === -1) {
        quiz.value.content.questions.push(question);
    } else {
        quiz.value.content.questions[index] = question;
    }
    closeQuestionDialog();
}

function closeQuestionDialog() {
    showQuestionDialog.value = false;
    currentQuestion.value = null;
}

function onQuestionReorder(event: { value: Question[] }) {
    quiz.value.content.questions = event.value;
}

function save() {
    if (isValid.value) {
        emit('save', quiz.value);
    }
}

function cancel() {
    emit('cancel');
}


const onSubmit = () => {

}

// Watch for prop changes
watch(() => props.quiz, (newQuiz) => {
    if (newQuiz) {
        quiz.value = { ...newQuiz };
    }
}, { deep: true });
</script>

<style scoped>
.form-field {
    @apply space-y-1;
}

:deep(.p-inputtext),
:deep(.p-dropdown),
:deep(.p-calendar),
:deep(.p-inputnumber) {
    @apply w-full;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>