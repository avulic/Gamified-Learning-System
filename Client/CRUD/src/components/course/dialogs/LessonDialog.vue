<template>
    <Dialog :visible="dialogVisible" @update:visible="updateVisible" header="Add New Lesson" :modal="true"
        class="w-full max-w-lg">
        <div class="space-y-4">
            <div class="flex flex-col">
                <label class="mb-1">Title</label>
                <InputText v-model="lessonForm.title" />
            </div>
            <div class="flex flex-col">
                <label class="mb-1">Description</label>
                <Textarea v-model="lessonForm.description" rows="3" />
            </div>
            <div class="flex flex-col">
                <label class="mb-1">Content</label>
                <Editor v-model="lessonForm.content" editorStyle="height: 200px" />
            </div>
            <div class="flex gap-4">
                <div class="flex flex-col flex-1">
                    <label class="mb-1">Estimated Duration (minutes)</label>
                    <InputNumber v-model="lessonForm.estimatedDuration" :min="0" />
                </div>
                <div class="flex flex-col flex-1">
                    <label class="mb-1">Order</label>
                    <InputNumber v-model="lessonForm.order" :min="0" />
                </div>
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" @click="handleCancel" class="p-button-text" />
            <Button label="Add Lesson" @click="handleAdd" :disabled="!isFormValid" />
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { Lesson } from '@/types/Lesson';

const props = defineProps<{
    visible: boolean;
    newLesson: Partial<Lesson>;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'add', value: Lesson): void;
}>();

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const updateVisible = (value: boolean) => {
    emit('update:visible', value);
};

const defaultLesson: Lesson = {
    title: '',
    description: '',
    type: 'lesson',
    moduleId: '',
    content: '',
    estimatedDuration: 0,
    order: 0,
    resources: [],
    assignment: []
};

const lessonForm = ref<Lesson>({ ...defaultLesson, ...props.newLesson });

const isFormValid = computed(() => {
    return (
        lessonForm.value.title &&
        lessonForm.value.description &&
        lessonForm.value.content &&
        lessonForm.value.estimatedDuration > 0
    );
});

watch(() => props.visible, (newValue) => {
    if (newValue) {
        lessonForm.value = { ...defaultLesson, ...props.newLesson };
    }
});

const handleCancel = () => {
    emit('update:visible', false);
};

const handleAdd = () => {
    emit('add', lessonForm.value);
};
</script>