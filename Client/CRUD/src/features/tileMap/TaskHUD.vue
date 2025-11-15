<!-- TaskList.vue -->
<template>
    <div class="task-list-overlay">
        <Card class="task-card">
            <template #title>
                Assignment Tasks
            </template>
            <template #content>
                <div v-for="task in tasks" :key="task.taskId" class="task-item">
                    <div class="task-header">
                        <h3>{{ task.title }}</h3>
                        <Dropdown v-model="task.spriteId" :options="spriteOptions" optionLabel="name" optionValue="id"
                            placeholder="Select Sprite" @change="handleSpriteChange(task.taskId, $event)" />
                    </div>
                    <p>{{ task.description }}</p>
                </div>
            </template>
        </Card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { PlacedSprite } from './sprite';

interface Task {
    taskId: string;
    title: string;
    description: string;
    spriteId?: string;
}

interface Props {
    assignmentId: string;
    placedSprites: Set<PlacedSprite>;
}

const props = defineProps<Props>();
const tasks = ref<Task[]>([]);

const spriteOptions = computed(() => {
    return Array.from(props.placedSprites).map(sprite => ({
        id: sprite.id,
        name: `Sprite ${sprite.id}`
    }));
});

const emit = defineEmits(['spriteAssigned']);

const handleSpriteChange = (taskId: string, spriteId: string) => {
    emit('spriteAssigned', { taskId, spriteId });
};

onMounted(async () => {
    try {
        // Fetch tasks for the assignment
        const response = await fetch(`/api/assignments/${props.assignmentId}/tasks`);
        tasks.value = await response.json();
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
});
</script>

<style scoped>
.task-list-overlay {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    width: 300px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.task-card {
    padding: 0;
}

.task-item {
    padding: 10px;
    border-bottom: 1px solid #eee;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.task-item:last-child {
    border-bottom: none;
}
</style>