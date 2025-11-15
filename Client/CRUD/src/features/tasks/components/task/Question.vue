<!-- QuestionTaskContent.vue -->
<template>
    <div class="question-task-content">
        <QuestionBase 
            v-model="localContent"
            @update:modelValue="handleQuestionUpdate" />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Question } from '@/types/task/Question';
import QuestionBase from '@/components/question/QuestionBase.vue';

const props = defineProps<{
    modelValue: Question;
}>();

const emit = defineEmits<{
    'update:modelValue': [question: Question];
}>();

const localContent = ref<Question>(props.modelValue);

function handleQuestionUpdate(updatedQuestion: Question) {
    localContent.value = updatedQuestion;
    emit('update:modelValue', updatedQuestion);
}

// Watch for prop changes
watch(() => props.modelValue, (newValue) => {
    localContent.value = newValue;
}, { deep: true });
</script>