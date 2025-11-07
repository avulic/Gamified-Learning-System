<template>
    <div class="space-y-4">
        <div class="answer-selection">
            <label class="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
            <div class="flex gap-4">
                <div class="flex items-center gap-2">
                    <RadioButton v-model="modelValue.correctAnswer" 
                        :value="true"
                        inputId="answerTrue" />
                    <label for="answerTrue" class="text-sm">True</label>
                </div>
                <div class="flex items-center gap-2">
                    <RadioButton v-model="modelValue.correctAnswer" 
                        :value="false"
                        inputId="answerFalse" />
                    <label for="answerFalse" class="text-sm">False</label>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { TrueFalseQuestion } from '@/types/task/Question';

const props = defineProps<{
    modelValue: TrueFalseQuestion;
}>();

defineEmits<{
    'update:modelValue': [question: TrueFalseQuestion];
}>();
</script>