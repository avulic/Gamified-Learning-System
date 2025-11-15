// CodeTaskContent.vue
<template>
    <div class="code-task-content space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="form-field">
                <label class="block text-sm font-medium text-gray-700">Programming Language</label>
                <Field name="content.language" v-slot="{ field }">
                    <Dropdown v-model="modelValue.language" :options="programmingLanguages" class="w-full"
                        :class="{ 'p-invalid': errors?.['content.language'] }" />
                </Field>
                <small class="text-red-500">{{ errors?.['content.language'] }}</small>
            </div>
        </div>

        <div class="form-field">
            <label class="block text-sm font-medium text-gray-700">Initial Code</label>
            <Field name="content.initialCode" v-slot="{ field }">
                <Textarea v-model="modelValue.initialCode" v-bind="field" rows="5" class="w-full font-mono"
                    :class="{ 'p-invalid': errors?.['content.initialCode'] }" />
            </Field>
            <small class="text-red-500">{{ errors?.['content.initialCode'] }}</small>
        </div>

        <div class="test-cases-container">
            <div class="flex items-center justify-between mb-4">
                <label class="block text-sm font-medium text-gray-700">Test Cases</label>
                <Button label="Add Test Case" icon="pi pi-plus" @click="addTestCase" class="p-button-sm" />
            </div>

            <div v-if="modelValue.testCases.length === 0" class="text-center p-4 bg-gray-50 rounded-lg">
                <p class="text-gray-600">No test cases added yet</p>
            </div>

            <div v-else class="space-y-4">
                <div v-for="(testCase, index) in modelValue.testCases" :key="index"
                    class="test-case p-4 bg-gray-50 rounded-lg">
                    <div class="flex justify-between items-start mb-4">
                        <h4 class="text-sm font-medium">Test Case #{{ index + 1 }}</h4>
                        <div class="flex gap-2">
                            <Checkbox v-model="testCase.isHidden" :binary="true" />
                            <label class="text-sm">Hidden</label>
                            <Button icon="pi pi-trash" @click="removeTestCase(index)"
                                class="p-button-danger p-button-outlined p-button-sm" />
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="form-field">
                            <label class="block text-sm font-medium text-gray-700">Input</label>
                            <Textarea v-model="testCase.input" rows="3" class="w-full font-mono"
                                :class="{ 'p-invalid': errors?.[`content.testCases.${index}.input`] }" />
                        </div>

                        <div class="form-field">
                            <label class="block text-sm font-medium text-gray-700">Expected Output</label>
                            <Textarea v-model="testCase.expectedOutput" rows="3" class="w-full font-mono"
                                :class="{ 'p-invalid': errors?.[`content.testCases.${index}.expectedOutput`] }" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { CodeTaskContent, CodeTestCase } from '@/types/task/Task';

const props = defineProps<{
    modelValue: CodeTaskContent;
    errors?: Record<string, string>;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: CodeTaskContent): void;
}>();

const programmingLanguages = [
    'javascript',
    'python',
    'java',
    'c++',
    'c#',
    'ruby',
    'go',
    'rust',
    'php'
];

function addTestCase() {
    const newTestCase: CodeTestCase = {
        input: '',
        expectedOutput: '',
        isHidden: false
    };

    emit('update:modelValue', {
        ...props.modelValue,
        testCases: [...props.modelValue.testCases, newTestCase]
    });
}

function removeTestCase(index: number) {
    const testCases = [...props.modelValue.testCases];
    testCases.splice(index, 1);

    emit('update:modelValue', {
        ...props.modelValue,
        testCases
    });
}
</script>