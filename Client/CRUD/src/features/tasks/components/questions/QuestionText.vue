<template>
    <div class="space-y-4">
        <div class="form-field">
            <label for="correctAnswer" class="block text-sm font-medium text-gray-700">Correct Answer</label>
            <Field name="correctAnswer" v-slot="{ field }">
                <Textarea v-model="modelValue.correctAnswer" 
                    v-bind="field"
                    rows="3"
                    class="w-full"
                    :class="{ 'p-invalid': errors?.correctAnswer }" />
            </Field>
            <ErrorMessage name="correctAnswer" class="text-red-500 text-sm" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage } from 'vee-validate';
import type { TextQuestion } from '@/types/task/Question';

const props = defineProps<{
    modelValue: TextQuestion;
    errors?: Record<string, string>;
}>();

defineEmits<{
    'update:modelValue': [question: TextQuestion];
}>();
</script>