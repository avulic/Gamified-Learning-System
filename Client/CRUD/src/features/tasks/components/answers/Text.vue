<!-- TextAnswer.vue -->
<template>
    <div class="form-field">
        <label class="block text-sm font-medium text-gray-700">Correct Answer</label>
        <Field name="correctAnswer" v-slot="{ field }">
            <Textarea 
                v-model="localQuestion.correctAnswer"
                v-bind="field"
                rows="3"
                class="w-full" />
        </Field>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Field } from 'vee-validate';
import type { TextQuestion } from '@/types/task/Question';

const props = defineProps<{
    modelValue: TextQuestion;
}>();

const emit = defineEmits<{
    'update:modelValue': [question: TextQuestion];
}>();

const localQuestion = ref<TextQuestion>(props.modelValue);

watch(localQuestion, (newValue) => {
    emit('update:modelValue', newValue);
}, { deep: true });

watch(() => props.modelValue, (newValue) => {
    localQuestion.value = newValue;
}, { deep: true });
</script>

<style scoped>
.form-field {
    @apply space-y-1;
}
</style>