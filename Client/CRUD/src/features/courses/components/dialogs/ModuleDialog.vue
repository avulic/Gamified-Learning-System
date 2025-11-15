<template>
    <Dialog :visible="dialogVisible" @update:visible="updateVisible" header="Add New Module" :modal="true"
        class="w-full max-w-lg">
        <div class="space-y-4">
            <div class="flex flex-col">
                <label class="mb-1">Title</label>
                <InputText v-model="moduleForm.title" />
            </div>
            <div class="flex flex-col">
                <label class="mb-1">Description</label>
                <Textarea v-model="moduleForm.description" rows="3" />
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" @click="handleCancel" class="p-button-text" />
            <Button label="Add Module" @click="handleAdd" :disabled="!moduleForm.title" />
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Module } from '@/types';

const props = defineProps<{
    visible: boolean;
    newModule: Module;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'add', value: Module ): void;
}>();

// Create a computed property to handle the visible state
const dialogVisible = computed({
    get() {
        return props.visible;
    },
    set(value: boolean) {
        emit('update:visible', value);
    }
});

// Or use this simpler method if you prefer
const updateVisible = (value: boolean) => {
    emit('update:visible', value);
};

const moduleForm = ref({ ...props.newModule });

watch(() => props.visible, (newValue) => {
    if (newValue) {
        moduleForm.value = { ...props.newModule };
    }
});

const handleCancel = () => {
    emit('update:visible', false);
};

const handleAdd = () => {
    emit('add', moduleForm.value);
};
</script>