<template>
    <div>
        <h2>{{ task.title }}</h2>
        <p>{{ task.description }}</p>
        <div v-for="question in task.questions" :key="question.id">
            <!-- Render quiz questions -->
        </div>
    </div>
</template>

<script setup lang="ts">
import { Quiz } from '@/types/quiz/Quiz';

const props = defineProps<{
    task: Quiz;
}>();
</script>