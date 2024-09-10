<template>
    <div class="p-4 bg-gray-100">
        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors }">
            <div class="space-y-4">
                <div>
                    <label for="type" class="block text-sm font-medium text-gray-700">Question Type</label>
                    <Field name="type" v-slot="{ field }">
                        <Dropdown v-model="currentQuestion.type" :options="questionTypes" optionLabel="label"
                            optionValue="value"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </Field>
                    <ErrorMessage name="type" class="text-red-500 text-xs mt-1" />
                </div>

                <component :is="questionComponentType" v-model="currentQuestion.content" :errors="errors" />

                <div>
                    <label for="points" class="block text-sm font-medium text-gray-700">Points</label>
                    <Field name="points" v-slot="{ field }">
                        <InputNumber v-model="currentQuestion.content.points" v-bind="field" id="points"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    </Field>
                    <ErrorMessage name="points" class="text-red-500 text-xs mt-1" />
                </div>

                <div class="flex justify-end space-x-2">
                    <Button type="button" label="Cancel" class="p-button-secondary" @click="$emit('cancel')" />
                    <Button type="submit" label="Save" class="p-button-primary" />
                </div>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Form, Field, ErrorMessage } from 'vee-validate';
import { object, string, number } from 'yup';
import QuestionBase, { QuestionType, } from '@/types/task/question/Question';
import QuestionText from '@/types/task/question/QuestionText';
import TrueFalse from '@/components/question/TrueFalse.vue';
import MultiChoice from '@/components/question/MultiChoice.vue';
import Question from './Question.vue';

const props = defineProps<{
    question: QuestionBase | null;
}>();

const emit = defineEmits<{
    save: [question: QuestionBase];
    cancel: [];
}>();

const currentQuestion = ref<QuestionBase>(props.question || {
    id: '',
    taskId: '',
    type: QuestionType.Text,
    content: {} as QuestionText
});

const questionTypes = [
    { label: 'Text', value: QuestionType.Text },
    { label: 'True/False', value: QuestionType.TRUE_FALSE },
    { label: 'Multiple Choice', value: QuestionType.MultiChoice }
];

const questionComponentType = computed(() => {
    switch (currentQuestion.value.type) {
        case QuestionType.Text:
            return Question;
        case QuestionType.TRUE_FALSE:
            return TrueFalse;
        case QuestionType.MultiChoice:
            return MultiChoice;
        default:
            return Question;
    }
});

const schema = object({
    type: string().required('Question type is required'),
    points: number().required('Points are required').positive('Points must be positive')
});

const onSubmit = () => {
    emit('save', currentQuestion.value);
};
</script>