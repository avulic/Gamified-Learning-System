<!-- QuestionBase.vue -->
<template>
    <div class="question-container space-y-6">
        <!-- Question Type Selection -->
        <div class="form-field">
            <label class="block text-sm font-medium text-gray-700">Question Type</label>
            <Dropdown v-model="localQuestion.questionType" :options="questionTypeOptions" optionLabel="label"
                optionValue="value" class="w-full" @change="handleTypeChange" />
        </div>

        <!-- Question Text -->
        <div class="form-field">
            <label class="block text-sm font-medium text-gray-700">Question Text</label>
            <Field name="question" v-slot="{ field }">
                <Textarea v-model="localQuestion.question" v-bind="field" rows="3" class="w-full" />
            </Field>
        </div>

        <!-- Type-specific Answer Component -->
        <div class="answer-section">
            <template v-if="multiChoiceQuestion">
                <MultiChoiceAnswer :model-value="multiChoiceQuestion" @update:modelValue="handleMultiChoiceUpdate" />
            </template>

            <template v-else-if="trueFalseQuestion">
                <TrueFalseAnswer :model-value="trueFalseQuestion" @update:modelValue="handleTrueFalseUpdate" />
            </template>

            <template v-else-if="textQuestion">
                <TextAnswer :model-value="textQuestion" @update:modelValue="handleTextUpdate" />
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Field } from 'vee-validate';
import { QuestionType } from '@/types/enums';
import {
    Question,
    MultiChoiceQuestion,
    TrueFalseQuestion,
    TextQuestion,
    BaseQuestion
} from '@/types/task/Question';

// Import answer type components
import MultiChoiceAnswer from '@/features/tasks/components/answers/MultiChoice.vue';
import TrueFalseAnswer from '@/features/tasks/components/answers/TrueFalse.vue';
import TextAnswer from '@/features/tasks/components/answers/Text.vue';

const props = defineProps<{
    modelValue: Question;
}>();

const emit = defineEmits<{
    'update:modelValue': [question: Question];
}>();

const questionTypeOptions = [
    { label: 'Multiple Choice', value: QuestionType.MULTI_CHOICE },
    { label: 'True/False', value: QuestionType.TRUE_FALSE },
    { label: 'Text Answer', value: QuestionType.TEXT }
];

const localQuestion = ref<Question>(structuredClone(props.modelValue));

// Type guard functions
function isMultiChoiceQuestion(question: Question): question is MultiChoiceQuestion {
    return question.questionType === QuestionType.MULTI_CHOICE;
}

function isTrueFalseQuestion(question: Question): question is TrueFalseQuestion {
    return question.questionType === QuestionType.TRUE_FALSE;
}

function isTextQuestion(question: Question): question is TextQuestion {
    return question.questionType === QuestionType.TEXT;
}

// Computed properties for typed questions
const multiChoiceQuestion = computed(() => {
    return isMultiChoiceQuestion(localQuestion.value) ? localQuestion.value : null;
});

const trueFalseQuestion = computed(() => {
    return isTrueFalseQuestion(localQuestion.value) ? localQuestion.value : null;
});

const textQuestion = computed(() => {
    return isTextQuestion(localQuestion.value) ? localQuestion.value : null;
});

function createNewQuestion(type: QuestionType): Question {
    const base: BaseQuestion = {
        id: localQuestion.value.id,
        question: localQuestion.value.question,
        questionType: type
    };

    switch (type) {
        case QuestionType.MULTI_CHOICE:
            return {
                ...base,
                options: [
                    { text: 'Option 1', isCorrect: true },
                    { text: 'Option 2', isCorrect: false }
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

        default:
            throw new Error(`Unsupported question type: ${type}`);
    }
}

function handleTypeChange() {
    const newQuestion = createNewQuestion(localQuestion.value.questionType);
    localQuestion.value = newQuestion;
    emit('update:modelValue', newQuestion);
}

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

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
    localQuestion.value = structuredClone(newValue);
}, { deep: true });
</script>

<style scoped>
.form-field {
    @apply space-y-1;
}
</style>