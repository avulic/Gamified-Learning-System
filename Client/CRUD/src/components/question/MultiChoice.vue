<template>
    <div>
        <Field name="text" v-slot="{ field }">
            <label for="text" class="block text-sm font-medium text-gray-700">Question Text</label>
            <InputText v-model="modelValue.question" v-bind="field" id="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
        </Field>
        <ErrorMessage name="text" class="text-red-500 text-xs mt-1" />

        <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">Options</label>
            <div v-for="(option, index) in modelValue.options" :key="index" class="flex items-center space-x-2 mt-2">
                <InputText v-model="option.text"
                    class="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                <Checkbox v-model="option.isCorrect" :binary="true" />
                <Button icon="pi pi-trash" @click="removeOption(index)" class="p-button-danger p-button-sm" />
            </div>
            <Button label="Add Option" icon="pi pi-plus" @click="addOption" class="mt-2 p-button-sm" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Field, ErrorMessage } from 'vee-validate';
import MultiChoice from '@/types/task/question/MultiChoise';

const props = defineProps<{
    modelValue: MultiChoice;
}>();

const emit = defineEmits(['update:modelValue']);

const addOption = () => {
    props.modelValue.options.push({ id: Date.now().toString(), text: '', isCorrect: false });
    emit('update:modelValue', props.modelValue);
};

const removeOption = (index: number) => {
    props.modelValue.options.splice(index, 1);
    emit('update:modelValue', props.modelValue);
};
</script>