<script setup lang="ts">
import { defineProps } from 'vue';
import { ProgressData, useProgress } from './UserProgress';


const props = defineProps<{
    progressData: ProgressData;
}>();

const { percentage, isLoading } = useProgress(props.progressData);
</script>

<template>
    <div class="w-full">
        <div class="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div class="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
                :style="{ width: `${percentage}%` }">
            </div>
        </div>
        <div class="mt-2 text-sm text-gray-600">
            {{ percentage }}% Complete
        </div>
    </div>
</template>
