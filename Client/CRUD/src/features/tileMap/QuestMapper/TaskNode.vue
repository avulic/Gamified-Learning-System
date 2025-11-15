// TaskNode.vue
<script setup lang="ts">
import { Position, Handle } from '@vue-flow/core'
import type { NodeProps } from '@vue-flow/core'
import { TaskNodeData } from './QuestAssignmentsMapper.vue';


interface Props extends NodeProps {
    data: TaskNodeData;
}

const props = defineProps<Props>()
const emit = defineEmits(['update:data'])

const updateData = (newData: Partial<TaskNodeData>) => {
    emit('update:data', {
        ...props.data,
        ...newData
    })
}
</script>

<template>
    <div class="task-node" :class="{ 'required': data.requiredForCompletion }">
        <Handle type="target" :position="Position.Top" />

        <div class="task-node__content">
            <div class="task-node__header">
                <input v-model="data.title" @input="updateData({ title: ($event.target as HTMLInputElement).value })"
                    class="task-node__title" placeholder="Task name..." />
            </div>
            <div class="task-node__body">
                <textarea v-model="data.description"
                    @input="updateData({ description: ($event.target as HTMLTextAreaElement).value })"
                    class="task-node__description" placeholder="Task description..." />
            </div>
            <div v-if="data.prerequisites?.length" class="task-node__prerequisites">
                <div class="prerequisites-label">Prerequisites:</div>
                <div v-for="prereq in data.prerequisites" :key="prereq.taskId" class="prerequisite-tag"
                    :class="{ 'required': prereq.required }">
                    {{ prereq.title }}
                </div>
            </div>
        </div>

        <Handle type="source" :position="Position.Bottom" />
    </div>
</template>

<style scoped>
.task-node {
    background: white;
    border: 2px solid #4CAF50;
    border-radius: 4px;
    width: 180px;
    padding: 10px;
}

.task-node.required {
    border-color: #f44336;
}

.task-node__content {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.task-node__title {
    width: 100%;
    border: none;
    font-size: 12px;
    text-align: center;
    padding: 4px;
}

.task-node__description {
    width: 100%;
    min-height: 40px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 4px;
    font-size: 11px;
    resize: none;
}

.task-node__prerequisites {
    margin-top: 4px;
    font-size: 10px;
}

.prerequisites-label {
    color: #666;
    margin-bottom: 2px;
}

.prerequisite-tag {
    display: inline-block;
    background: #e0e0e0;
    border-radius: 4px;
    padding: 2px 6px;
    margin: 2px;
    font-size: 9px;
}

.prerequisite-tag.required {
    background: #ffcdd2;
    color: #c62828;
}

input:focus,
textarea:focus {
    outline: none;
    border-color: #4CAF50;
}
</style>