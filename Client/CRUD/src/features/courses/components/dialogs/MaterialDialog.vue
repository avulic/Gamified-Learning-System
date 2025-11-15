<template>
    <Dialog :visible="dialogVisible" @update:visible="updateVisible" header="Add New Material" :modal="true"
        class="w-full max-w-lg">
        <div class="space-y-4">
            <div class="flex flex-col">
                <label class="mb-1">Title</label>
                <InputText v-model="materialForm.name" />
            </div>
            <div class="flex flex-col">
                <label class="mb-1">Type</label>
                <Dropdown v-model="materialForm.type" :options="['pdf', 'video', 'link']" placeholder="Select type" />
            </div>
            <div class="flex flex-col">
                <label class="mb-1">URL</label>
                <InputText v-model="materialForm.url" />
            </div>
        </div>
        <template #footer>
            <Button label="Cancel" @click="handleCancel" class="p-button-text" />
            <Button label="Add Material" @click="handleAdd"
                :disabled="!materialForm.name || !materialForm.type || !materialForm.url" />
        </template>
    </Dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { Resource } from '@/types';

const props = defineProps<{
    visible: boolean;
    newMaterial: Resource;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'add', value: Resource): void;
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

const materialForm = ref({ ...props.newMaterial });

watch(() => props.visible, (newValue) => {
    if (newValue) {
        materialForm.value = { ...props.newMaterial };
    }
});

const handleCancel = () => {
    emit('update:visible', false);
};

const handleAdd = () => {
    emit('add', materialForm.value);
};
</script>