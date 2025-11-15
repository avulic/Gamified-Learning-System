<!-- TrueFalseAnswer.vue -->
<template>
    <div class="answer-selection">
        <label class="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
        <div class="flex gap-4">
            <div class="flex items-center gap-2">
                <RadioButton v-model="localQuestion.correctAnswer" :value="true" inputId="answerTrue"
                    @change="handleChange" />
                <label for="answerTrue" class="text-sm">True</label>
            </div>
            <div class="flex items-center gap-2">
                <RadioButton v-model="localQuestion.correctAnswer" :value="false" inputId="answerFalse"
                    @change="handleChange" />
                <label for="answerFalse" class="text-sm">False</label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TrueFalseQuestion } from '@/types/task/Question';

const props = defineProps<{
    modelValue: TrueFalseQuestion;
}>();

const emit = defineEmits<{
    'update:modelValue': [question: TrueFalseQuestion];
}>();

const localQuestion = ref<TrueFalseQuestion>(props.modelValue);

function handleChange() {
    emit('update:modelValue', localQuestion.value);
}

watch(() => props.modelValue, (newValue) => {
    localQuestion.value = newValue;
}, { deep: true });
</script>