<!-- QuestionEditor.vue -->
<template>
    <div class="question-editor bg-white rounded-lg p-6 space-y-6">
        <!-- Question Type Selection -->
        <div class="form-field">
            <label class="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
            <Dropdown 
                v-model="localQuestion.questionType"
                :options="questionTypeOptions"
                optionLabel="label"
                optionValue="value"
                class="w-full"
                @change="handleTypeChange" />
        </div>

        <!-- Question Text -->
        <div class="form-field">
            <label class="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
            <span class="text-sm text-gray-500 mb-2 block">
                Write your question text here. Be clear and concise.
            </span>
            <Editor 
                v-model="questionText"
                editorStyle="height: 150px"
                class="w-full"
                :class="{ 'border-red-500': validationErrors.question }"
                @text-change="handleQuestionTextChange" 
                />
            <small class="text-red-500">{{ validationErrors.question }}</small>
        </div>

        <!-- Points -->
        <div class="form-field">
            <label class="block text-sm font-medium text-gray-700 mb-1">Points</label>
            <InputNumber 
                v-model="points" 
                :min="0" 
                :max="100"
                class="w-32" />
        </div>

        <!-- Question Type Specific Content -->
        <div class="answer-section border-t pt-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Answer Options</h3>
            
            <!-- Multiple Choice -->
            <template v-if="isMultiChoiceQuestion(localQuestion)">
                <MultiChoiceAnswer
                    v-model="localQuestion"
                    @update:modelValue="handleMultiChoiceUpdate" />
            </template>

            <!-- True/False -->
            <template v-else-if="isTrueFalseQuestion(localQuestion)">
                <TrueFalseAnswer
                    v-model="localQuestion"
                    @update:modelValue="handleTrueFalseUpdate" />
            </template>

            <!-- Text Answer -->
            <template v-else-if="isTextQuestion(localQuestion)">
                <TextAnswer
                    v-model="localQuestion"
                    @update:modelValue="handleTextUpdate" />
            </template>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-3 pt-4 border-t">
            <Button 
                label="Cancel" 
                class="p-button-text" 
                @click="$emit('cancel')" />
            <Button 
                label="Save" 
                @click="saveQuestion" 
                :disabled="!isValid" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { QuestionType } from '@/types/enums';
import type { 
    Question,
    MultiChoiceQuestion,
    TrueFalseQuestion,
    TextQuestion
} from '@/types/task/Question';
import MultiChoiceAnswer from '@/components/answers/MultiChoice.vue';
import TrueFalseAnswer from '@/components/answers/TrueFals.vue';
import TextAnswer from '@/components/answers/Text.vue';
import Editor from 'primevue/editor';

// Props and Emits
const props = defineProps<{
    modelValue: Question;
    showValidation?: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [question: Question];
    'save': [question: Question];
    'cancel': [];
}>();

// State
const localQuestion = ref<Question>(structuredClone(props.modelValue));
const questionText = ref(props.modelValue.question || '');
const points = ref(0);
const keywords = ref<string[]>([]);
const validationErrors = ref({
    question: '',
    correctAnswer: '',
    options: ''
});

// Options for question types
const questionTypeOptions = [
    { label: 'Multiple Choice', value: QuestionType.MULTI_CHOICE },
    { label: 'True/False', value: QuestionType.TRUE_FALSE },
    { label: 'Text Answer', value: QuestionType.TEXT }
];

// Type Guards 
function isMultiChoiceQuestion(q: Question): q is MultiChoiceQuestion {
    return q.questionType === QuestionType.MULTI_CHOICE;
}

function isTrueFalseQuestion(q: Question): q is TrueFalseQuestion {
    return q.questionType === QuestionType.TRUE_FALSE;
}

function isTextQuestion(q: Question): q is TextQuestion {
    return q.questionType === QuestionType.TEXT;
}

// Handle text editor changes
function handleQuestionTextChange() {
    localQuestion.value.question = questionText.value;
    emit('update:modelValue', localQuestion.value);
}

// Validation and computed properties
const isValid = computed(() => {
    const baseValid = questionText.value.trim().length > 0;
    
    if (isMultiChoiceQuestion(localQuestion.value)) {
        return baseValid && 
            localQuestion.value.options.length >= 2 && 
            localQuestion.value.options.some(opt => opt.isCorrect);
    }
    
    if (isTextQuestion(localQuestion.value)) {
        return baseValid && 
            localQuestion.value.correctAnswer.trim().length > 0;
    }
    
    return baseValid;
});

// Type-safe update handlers
function handleMultiChoiceUpdate(question: MultiChoiceQuestion) {
    localQuestion.value = question;
    emit('update:modelValue', question);
}

function handleTrueFalseUpdate(question: TrueFalseQuestion) {
    localQuestion.value = question;
    emit('update:modelValue', question);
}

function handleTextUpdate(question: TextQuestion) {
    localQuestion.value = question;
    emit('update:modelValue', question);
}

function createNewQuestion(type: QuestionType): Question {
    const base = {
        id: localQuestion.value.id,
        question: questionText.value,
        questionType: type
    };

    switch (type) {
        case QuestionType.MULTI_CHOICE:
            return {
                ...base,
                options: [
                    { text: '', isCorrect: false },
                    { text: '', isCorrect: false }
                ]
            } as MultiChoiceQuestion;

        case QuestionType.TRUE_FALSE:
            return {
                ...base,
                correctAnswer: false
            } as TrueFalseQuestion;

        case QuestionType.TEXT:
            return {
                ...base,
                correctAnswer: ''
            } as TextQuestion;
    }
}

function handleTypeChange() {
    const newQuestion = createNewQuestion(localQuestion.value.questionType);
    localQuestion.value = newQuestion;
    emit('update:modelValue', newQuestion);
}

function validate(): boolean {
    validationErrors.value = {
        question: '',
        correctAnswer: '',
        options: ''
    };

    if (!questionText.value.trim()) {
        validationErrors.value.question = 'Question text is required';
    }

    if (isMultiChoiceQuestion(localQuestion.value)) {
        if (!localQuestion.value.options.some(opt => opt.isCorrect)) {
            validationErrors.value.options = 'At least one correct option is required';
        }
    }

    if (isTextQuestion(localQuestion.value)) {
        if (!localQuestion.value.correctAnswer.trim()) {
            validationErrors.value.correctAnswer = 'Correct answer is required';
        }
    }

    return !Object.values(validationErrors.value).some(error => error);
}

function saveQuestion() {
    if (!validate()) return;
    emit('save', localQuestion.value);
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
    localQuestion.value = structuredClone(newValue);
    questionText.value = newValue.question;
}, { deep: true });
</script>

<style scoped>
.form-field {
    @apply space-y-1;
}

:deep(.p-editor-container) {
    @apply border border-gray-300 rounded-md overflow-hidden;
}

:deep(.p-editor-content) {
    @apply h-40;
}
</style>