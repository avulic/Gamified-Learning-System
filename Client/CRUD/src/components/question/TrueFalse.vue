<template>
    <div>
        <Field name="text" v-slot="{ field }">
            <label for="text" class="block text-sm font-medium text-gray-700">Question Text</label>
            <InputText v-model="modelValue.question" v-bind="field" id="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </Field>
        <ErrorMessage name="text" class="text-red-500 text-xs mt-1" />

        <Field name="correctAnswer" v-slot="{ field }">
            <label for="correctAnswer" class="block text-sm font-medium text-gray-700 mt-4">Correct Answer</label>
            <div v-for="(option, i)  in options" :key="option.id" class="mt-1">
                <RadioButton v-model="options[i]" v-bind="field" inputId="trueOption" value="True" />
                <label for="trueOption" class="ml-2">{{ options[i].text }}</label>
            </div>
        </Field>
        <ErrorMessage name="correctAnswer" class="text-red-500 text-xs mt-1" />
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { Field, ErrorMessage } from 'vee-validate';
import InputText from 'primevue/inputtext';
import TrueFalse from '@/types/task/question/TrueFalse';

const props = defineProps<{
    modelValue: TrueFalse;
}>();

const options = computed(() => {
    return props.modelValue.options;
});

const emit = defineEmits(['update:modelValue']);
</script>
