// src/components/progress/AchievementPopup.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Achievement } from './UserProgress';


const props = defineProps<{
    achievement: Achievement;
    autoHide?: boolean;
}>();

const isVisible = ref(true);

onMounted(() => {
    if (props.autoHide) {
        setTimeout(() => {
            isVisible.value = false;
        }, 5000);
    }
});
</script>

<template>
    <Transition name="fade">
        <div v-if="isVisible" class="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <div class="flex items-center">
                <img :src="achievement.icon" class="w-12 h-12 mr-4" />
                <div>
                    <h3 class="font-bold text-lg">{{ achievement.title }}</h3>
                    <p class="text-gray-600">{{ achievement.description }}</p>
                </div>
            </div>
        </div>
    </Transition>
</template>