// SpriteNode.vue
<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps>()
const emit = defineEmits(['update:data'])

const updateData = (newData: any) => {
    emit('update:data', {
        ...props.data,
        ...newData
    })
}
</script>

<template>
    <div class="sprite-node">
        <Handle type="target" :position="Position.Top" />

        <div class="sprite-node__content">
            <div class="sprite-node__circle">
                <img :src="props.data.url" />
                <span class="sprite-node__title">{{ props.data.label }}</span>
            </div>

            <div class="sprite-node__dialogue-preview" v-if="data.dialogues">
                <div class="dialogue-bubble" v-for="(dialogue, index) in data.dialogues" :key="index">
                    {{ dialogue.text }}
                </div>
            </div>
        </div>

        <Handle type="source" :position="Position.Bottom" />
    </div>
</template>

<style scoped>
.sprite-node {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.sprite-node__circle {
    width: 100px;
    height: 100px;
    background: white;
    border: 2px solid #2196F3;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
}

.sprite-node__title {
    width: 100%;
    border: none;
    text-align: center;
    font-size: 12px;
    background: transparent;
}

.sprite-node__dialogue-preview {
    position: absolute;
    width: 160px;
    top: 120px;
}

.dialogue-bubble {
    background: #E3F2FD;
    border: 1px solid #2196F3;
    border-radius: 4px;
    padding: 8px;
    font-size: 10px;
    position: relative;
}

.dialogue-bubble::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #2196F3;
}

.dialogue-bubble::after {
    content: '';
    position: absolute;
    top: -7px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #E3F2FD;
}

input:focus {
    outline: none;
}
</style>