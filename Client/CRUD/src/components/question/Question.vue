<template>
    <div v-for="question in modelValue">
        <div>
            <Field name="text" v-slot="{ field }">
                <label for="text" class="block text-sm font-medium text-gray-700">Question</label>
                <Textarea v-model="question.text" v-bind="field" id="text" rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </Field>
            <ErrorMessage name="text" class="text-red-500 text-xs mt-1" />
        </div>
        <div>
            <Field name="answer" v-slot="{ field }">
                <label for="answer" class="block text-sm font-medium text-gray-700">Answer</label>
                <Textarea v-model="question.correctAnswer" v-bind="field" id="answer" rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </Field>
            <ErrorMessage name="answer" class="text-red-500 text-xs mt-1" />
        </div>
        <div>
            <Field name="points" v-slot="{ field }">
                <label for="points" class="block text-sm font-medium text-gray-700">Points</label>
                <InputNumber v-model="question.points" v-bind="field" id="points" rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
            </Field>
            <ErrorMessage name="points" class="text-red-500 text-xs mt-1" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Field, ErrorMessage } from 'vee-validate';
import QuestionText from '@/types/task/question/QuestionText';
import { TaskContent } from '@/types/task/Task';

const props = defineProps<{
    modelValue: QuestionText[];
}>();

defineEmits(['update:modelValue']);
</script>