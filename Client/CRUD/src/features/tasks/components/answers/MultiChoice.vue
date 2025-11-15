<!-- MultiChoiceAnswer.vue -->
<template>
    <div class="space-y-4">
        <div class="options-container">
            <label class="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
            <div v-for="(option, index) in localQuestion.options" :key="index"
                class="flex items-center gap-2 mb-2">
                <InputText 
                    v-model="option.text"
                    class="flex-grow"
                    placeholder="Enter option text"
                    @change="handleChange" />
                <div class="flex items-center gap-2">
                    <Checkbox 
                        v-model="option.isCorrect" 
                        :binary="true"
                        @change="handleChange" />
                    <label class="text-sm">Correct</label>
                </div>
                <Button 
                    icon="pi pi-trash"
                    @click="removeOption(index)"
                    class="p-button-danger p-button-outlined p-button-sm" />
            </div>

            <Button 
                label="Add Option"
                icon="pi pi-plus"
                @click="addOption"
                class="p-button-outlined p-button-sm mt-2" />
        </div>

        <div v-if="!hasCorrectOption" class="text-red-500 text-sm">
            Please select at least one correct answer
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { MultiChoiceQuestion, MultiChoiceOption } from '@/types/task/Question';

const props = defineProps<{
    modelValue: MultiChoiceQuestion;
}>();

const emit = defineEmits<{
    'update:modelValue': [question: MultiChoiceQuestion];
}>();

const localQuestion = ref<MultiChoiceQuestion>(props.modelValue);

const hasCorrectOption = computed(() => 
    localQuestion.value.options.some(option => option.isCorrect)
);

function addOption() {
    const newOption: MultiChoiceOption = {
        text: '',
        isCorrect: false
    };
    localQuestion.value.options.push(newOption);
    handleChange();
}

function removeOption(index: number) {
    localQuestion.value.options.splice(index, 1);
    handleChange();
}

function handleChange() {
    emit('update:modelValue', localQuestion.value);
}

watch(() => props.modelValue, (newValue) => {
    localQuestion.value = newValue;
}, { deep: true });
</script>