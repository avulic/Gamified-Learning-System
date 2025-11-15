<template>
    <div class="quiz-task-content space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-field">
                <label class="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
                <Field name="content.timeLimit" v-slot="{ field }">
                    <InputNumber v-model="modelValue.timeLimit" v-bind="field" class="w-full" :min="1"
                        :showButtons="true" :class="{ 'p-invalid': errors?.['content.timeLimit'] }" />
                </Field>
                <small class="text-red-500">{{ errors?.['content.timeLimit'] }}</small>
            </div>

            <div class="form-field">
                <label class="block text-sm font-medium text-gray-700">Passing Score (%)</label>
                <Field name="content.passingScore" v-slot="{ field }">
                    <InputNumber v-model="modelValue.passingScore" v-bind="field" class="w-full" :min="0" :max="100"
                        :showButtons="true" :class="{ 'p-invalid': errors?.['content.passingScore'] }" />
                </Field>
                <small class="text-red-500">{{ errors?.['content.passingScore'] }}</small>
            </div>
        </div>

        <div class="questions-container">
            <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-medium text-gray-700">Questions</label>
                <Button label="Add Question" icon="pi pi-plus" @click="showQuestionDialog = true" class="p-button-sm" />
            </div>

            <div v-if="modelValue.questions.length === 0" class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-gray-600">No questions added yet</p>
            </div>

            <div v-else class="space-y-4">
                <DataTable :value="modelValue.questions" dataKey="id" :reorderableRows="true"
                    @rowReorder="handleQuestionReorder">
                    <Column rowReorder :frozen="true" style="width: 3rem" />
                    <Column field="question" header="Question">
                        <template #body="{ data }">
                            <div class="flex flex-col gap-1">
                                <span>{{ data.question }}</span>
                                <Tag :value="getQuestionTypeLabel(data.questionType)" />
                            </div>
                        </template>
                    </Column>
                    <Column style="width: 8rem">
                        <template #body="{ data }">
                            <div class="flex gap-2">
                                <Button icon="pi pi-pencil" @click="editQuestion(data)"
                                    class="p-button-text p-button-sm" />
                                <Button icon="pi pi-trash" @click="removeQuestion(data.id)"
                                    class="p-button-text p-button-danger p-button-sm" />
                            </div>
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <!-- Question Dialog -->
        <Dialog v-model:visible="showQuestionDialog" 
    :header="editingQuestion ? 'Edit Question' : 'Add Question'"
    :style="{ width: '50vw' }" 
    modal>
    <QuestionEditor 
        v-model="currentQuestion"
        @save="saveQuestion"
        @cancel="closeQuestionDialog" />
</Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { QuestionType } from '@/types/enums';
import type { QuizTaskContent } from '@/types/task/Task';
import QuestionEditor from '@/components/question/QuestionEditor.vue';
import { Question } from '@/types/task/Question';
import { MultiChoiceQuestion } from '@/types/task/Question';

const props = defineProps<{
    modelValue: QuizTaskContent;
    errors?: Record<string, string>;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: QuizTaskContent): void;
}>();

const showQuestionDialog = ref(false);
const editingQuestion = ref<Question | null>(null);


const currentQuestion = ref<Question>({
    id: undefined,
    question: '',
    questionType: QuestionType.MULTI_CHOICE,
    options: []  // Default as MultiChoiceQuestion
} as MultiChoiceQuestion);  // Start with a default question type


function getQuestionTypeLabel(type: QuestionType): string {
    return {
        [QuestionType.TEXT]: 'Text Answer',
        [QuestionType.TRUE_FALSE]: 'True/False',
        [QuestionType.MULTI_CHOICE]: 'Multiple Choice'
    }[type] || type;
}

function editQuestion(question: Question) {
    editingQuestion.value = question;
    currentQuestion.value = structuredClone(question);  // Use structuredClone for deep copy
    showQuestionDialog.value = true;
}

function initNewQuestion() {
    currentQuestion.value = {
        id: undefined,
        question: '',
        questionType: QuestionType.MULTI_CHOICE,
        options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
        ]
    } as MultiChoiceQuestion;
    showQuestionDialog.value = true;
}

function handleQuestionReorder(event: { value: Question[] }) {
    emit('update:modelValue', {
        ...props.modelValue,
        questions: event.value
    });
}

function removeQuestion(id: string) {
    emit('update:modelValue', {
        ...props.modelValue,
        questions: props.modelValue.questions.filter(q => q.id !== id)
    });
}

function saveQuestion(question: Question) {
    const questions = [...props.modelValue.questions];

    if (editingQuestion.value) {
        const index = questions.findIndex(q => q.id === editingQuestion.value?.id);
        if (index >= 0) {
            questions[index] = question;
        }
    } else {
        questions.push({
            ...question,
            id: crypto.randomUUID()
        });
    }

    emit('update:modelValue', {
        ...props.modelValue,
        questions
    });

    closeQuestionDialog();
}

function closeQuestionDialog() {
    showQuestionDialog.value = false;
    editingQuestion.value = null;
}
</script>
