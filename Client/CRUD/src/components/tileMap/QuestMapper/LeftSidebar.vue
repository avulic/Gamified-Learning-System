// LeftSidebar.vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Reward } from './QuestAssignmentsMapper.vue';
import { TaskNodeData } from './QuestAssignmentsMapper.vue';

const props = defineProps<{
    tasks: any[],
    sprites: {
        id: string,
        url: string,
        category: string,
        label: string,
        dialogue: string
    }[],
    spritesOnMap: {
        id: string,
        url: string,
        category: string,
        label: string,
        dialogue: string,
        tasks?: TaskNodeData[]
    }[],
    rewards: Reward[] // New prop
}>()

const emit = defineEmits(['add-task', 'add-sprite', 'add-reward'])
const selectedCategory = ref('All Categories')

const categories = ['All Categories', 'NPCs', 'Enemies', 'Merchants']


const spriteImages = computed<Map<string, string>>(() => {
    // Using a Map with string keys instead of an array with numeric indices
    const imageMap = new Map<string, string>();
    
    props.sprites.forEach(sprite => {
        if (sprite.id !== null && sprite.id !== undefined) {
            imageMap.set(sprite.id, sprite.url);
        }else {
            imageMap.set(sprite.id, 'localhost:8080/assets/maps/assets/female');
        }
    });
    
    return imageMap;
})

</script>

<template>
    <div class="left-sidebar">

        <div class="section">
            <h3>Tasks</h3>
            <div class="tasks-container">
                <div v-for="task in tasks" :key="task.id" class="task-template" @click="emit('add-task', task)">
                    <span>{{ task.title }}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Sprites on map</h3>

            <div class="sprites-grid">
                <div v-for="sprite in spritesOnMap" :key="sprite.id" class="sprite-template"
                    @click="emit('add-sprite', sprite)">
                    <div class="sprite-icon">
                        <img v-if="spriteImages.get(sprite.id)" :src="spriteImages.get(sprite.id)" />
                    </div>
                    <span>{{ sprite.label }}</span>
                </div>
            </div>
        </div>

        <div class="sidebar-header">
            <h2>Library</h2>
        </div>

        <div class="section">
            <h3>Sprites in inventory</h3>
            <div class="category-selector">
                <select v-model="selectedCategory">
                    <option v-for="category in categories" :key="category" :value="category">
                        {{ category }}
                    </option>
                </select>
            </div>
            <div class="sprites-grid">
                <div v-for="sprite in sprites" :key="sprite.id" class="sprite-template"
                    @click="emit('add-sprite', sprite)">
                    <div class="sprite-icon">
                        <img v-if="spriteImages.get(sprite.id)" :src="spriteImages.get(sprite.id)" />
                    </div>
                    <span>{{ sprite.label }}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h3>Rewards in inventory</h3>
            <div class="category-selector">
                <select v-model="selectedCategory">
                    <option v-for="category in categories" :key="category" :value="category">
                        {{ category }}
                    </option>
                </select>
            </div>
            <div class="sprites-grid">
                <div v-for="reward in rewards.filter(r =>
                    selectedCategory === 'All Categories' || r.category === selectedCategory)" :key="reward.id"
                    class="reward-template" @click="emit('add-reward', reward)" v-tooltip="reward.description">
                    <div class="reward-icon">
                        <img :src="reward.imageUrl" :alt="reward.name" />
                    </div>
                    <span>{{ reward.name }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.left-sidebar {
    width: 280px;
    height: 100%;
    background: #ffffff;
    border-right: 1px solid #e0e0e0;
    padding: 20px;
    overflow-y: scroll;
}

.sidebar-header h2 {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 20px;
}

.section {
    margin-bottom: 30px;
}

.section h3 {
    font-size: 14px;
    color: #666;
    margin-bottom: 10px;
}

.tasks-container {
    background: #f8f9fa;
    border-radius: 4px;
    padding: 5px;
}

.task-template {
    background: white;
    border: 1px solid #4CAF50;
    border-radius: 4px;
    padding: 5px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.task-template:hover {
    background: #f0f8f0;
}

.category-selector {
    margin-bottom: 10px;
}

.category-selector select {
    width: 100%;
    padding: 8px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: white;
}

.sprites-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.sprite-template {
    background: white;
    border: 1px solid #2196F3;
    border-radius: 4px;
    padding: 10px;
    cursor: pointer;
    text-align: center;
    transition: background-color 0.2s;
}

.sprite-template:hover {
    background: #f0f7ff;
}

.sprite-icon {
    width: 50px;
    height: 50px;
    background: #f0f0f0;
    border-radius: 50%;
    margin: 0 auto 10px;
}

.reward-template {
    background: white;
    border: 1px solid #FFC107;
    border-radius: 4px;
    padding: 10px;
    cursor: pointer;
    text-align: center;
    transition: background-color 0.2s;
}

.reward-template:hover {
    background: #fff8e1;
}

.reward-icon {
    width: 40px;
    height: 40px;
    background: #f0f0f0;
    border-radius: 50%;
    margin: 0 auto 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

.reward-icon img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>