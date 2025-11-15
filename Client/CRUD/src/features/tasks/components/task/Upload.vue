// FileUploadTaskContent.vue
<template>
    <div class="file-upload-content space-y-4">
        <div class="form-field">
            <label class="block text-sm font-medium text-gray-700">Allowed File Types</label>
            <div class="flex flex-wrap gap-2 mt-1">
                <Chip v-for="type in modelValue.allowedFileTypes" :key="type" :label="type" removable
                    @remove="removeFileType(type)" />
                <div class="flex gap-2">
                    <InputText v-model="newFileType" placeholder="Add file type (e.g., .pdf)" class="w-40"
                        @keyup.enter="addFileType" />
                    <Button icon="pi pi-plus" @click="addFileType" class="p-button-sm" />
                </div>
            </div>
            <small v-if="modelValue.allowedFileTypes.length === 0" class="text-yellow-600">
                Please add at least one allowed file type
            </small>
        </div>

        <div class="form-field">
            <label class="block text-sm font-medium text-gray-700">Maximum File Size (MB)</label>
            <Field name="content.maxFileSize" v-slot="{ field }">
                <InputNumber v-model="modelValue.maxFileSize" v-bind="field" class="w-full" :min="1" :showButtons="true"
                    :class="{ 'p-invalid': errors?.['content.maxFileSize'] }" />
            </Field>
            <small class="text-red-500">{{ errors?.['content.maxFileSize'] }}</small>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { FileUploadTaskContent } from '@/types/task/Task';

const props = defineProps<{
    modelValue: FileUploadTaskContent;
    errors?: Record<string, string>;
}>();

const emit = defineEmits<{
    (e: 'update:modelValue', value: FileUploadTaskContent): void;
}>();

const newFileType = ref('');

function addFileType() {
    if (!newFileType.value) return;

    const fileType = newFileType.value.startsWith('.')
        ? newFileType.value.toLowerCase()
        : `.${newFileType.value.toLowerCase()}`;

    if (!props.modelValue.allowedFileTypes.includes(fileType)) {
        emit('update:modelValue', {
            ...props.modelValue,
            allowedFileTypes: [...props.modelValue.allowedFileTypes, fileType]
        });
    }

    newFileType.value = '';
}

function removeFileType(type: string) {
    emit('update:modelValue', {
        ...props.modelValue,
        allowedFileTypes: props.modelValue.allowedFileTypes.filter(t => t !== type)
    });
}
</script>
