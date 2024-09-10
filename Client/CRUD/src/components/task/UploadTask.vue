// UploadTaskDetails.vue
<template>
    <div>
        <h2>{{ task.title }}</h2>
        <p>{{ task.description }}</p>
        <p>Allowed file types: {{ task.content.allowedFileTypes.join(', ') }}</p>
        <p>Max file size: {{ task.content.maxFileSize }} MB</p>
        <!-- Add file upload component here -->
    </div>
</template>

<script setup lang="ts">
import { UploadTask } from '@/types/task/Task';

const props = defineProps<{
    task: UploadTask;
}>();
</script>