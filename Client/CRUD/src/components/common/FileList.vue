<template>
    <div>
        <ul class="mt-4" v-if="filelist.length">
            <FileListItem v-for="(file, index) in filelist" :key="index" :file="file" @remove="remove(index)" />
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FileListItem from './FileListItem.vue';

const props = defineProps<{ filelist: File[] }>();

const emit = defineEmits<{
    remove: [index: number]
}>()

const remove = (index: number) => {
    props.filelist.splice(index, 1);
};
</script>
