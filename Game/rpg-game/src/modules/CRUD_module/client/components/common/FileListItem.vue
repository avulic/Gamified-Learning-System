<template>
    <li class="text-sm p-1">
        {{ file.name }}
        <button class="ml-2 px-2 py-1 bg-red-500 text-white rounded" type="button" @click="remove" title="Remove file">
            remove
        </button>
    </li>
</template>

<script setup lang="ts">
import { } from 'vue';

const props = defineProps<{ file: File }>();

const emit = defineEmits<{
    remove: []
}>()

const remove = () => {
    emit('remove');
};

</script>
