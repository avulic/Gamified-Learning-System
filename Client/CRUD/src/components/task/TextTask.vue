<template>
    <div>
        <h2>{{ task.title }}</h2>
        <p>{{ task.description }}</p>
        <p>Estimated read time: {{ task.estimatedReadTime }} minutes</p>
        <div v-for="content in task.content" :key="content.id">
            <!-- Render text content and questions -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { TextTask } from '@/types/task/Task';

const props = defineProps<{
    task: TextTask;
}>();
</script>