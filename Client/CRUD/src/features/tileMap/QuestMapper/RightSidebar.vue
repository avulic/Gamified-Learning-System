<script setup lang="ts">
import { computed, ref } from 'vue'
import { DialogueResponse, Reward, TaskNodeData, TaskPrerequisite } from './QuestAssignmentsMapper.vue';


const props = defineProps<{
    selectedNode: any;
    availableTasks?: TaskNodeData[];
}>()

const emit = defineEmits(['update-node'])

// Computed properties for node data
const nodeData = computed(() => props.selectedNode?.data || null)
const nodeId = computed(() => props.selectedNode?.id)
const nodeDialogues = computed<DialogueResponse[]>({
    get: () => nodeData.value?.dialogues || [],
    set: (newDialogues) => {
        if (!nodeData.value || !nodeId.value) return
        emit('update-node', nodeId.value, {
            ...nodeData.value,
            dialogues: newDialogues
        })
    }
})

// Computed for node type checking
const nodeType = computed(() => {
    if (!props.selectedNode) return null
    return props.selectedNode.type === 'spriteNode' ? 'NPC' : 'Task'
})

const isTaskNode = computed(() => props.selectedNode?.type === 'taskNode')
const isSpriteNode = computed(() => props.selectedNode?.type === 'spriteNode')

// Helper function to emit node updates
const updateNodeData = (updates: any) => {
    if (!nodeId.value || !nodeData.value) return

    // Create a completely new object for the update
    const updatedData = {
        ...nodeData.value,
        ...updates,
        // Ensure dialogues is always an array
        dialogues: updates.dialogues || nodeData.value.dialogues || []
    }

    emit('update-node', nodeId.value, updatedData)
}



// Task-specific functions
const prerequisites = computed(() => nodeData.value?.prerequisites || [])

const addPrerequisite = () => {
    if (!isTaskNode.value) return
    const newPrerequisites = [
        ...prerequisites.value,
        { taskId: '', title: '', required: false }
    ]
    updateNodeData({ prerequisites: newPrerequisites })
}

const removePrerequisite = (index: number) => {
    if (!isTaskNode.value) return
    const newPrerequisites = prerequisites.value.filter((_, i) => i !== index)
    updateNodeData({ prerequisites: newPrerequisites })
}


const updatePrerequisite = (index: number, updatedPrereq: Partial<TaskPrerequisite>) => {
    if (!isTaskNode.value || !nodeData.value?.prerequisites) return

    const newPrerequisites = nodeData.value.prerequisites.map((prereq, i) => {
        if (i === index) {
            return {
                ...prereq,
                ...updatedPrereq,
                // Ensure title is updated if taskId changes
                title: updatedPrereq.taskId ?
                    props.availableTasks?.find(t => t.id === updatedPrereq.taskId)?.title || prereq.title :
                    prereq.title
            }
        }
        return prereq
    })

    updateNodeData({
        prerequisites: newPrerequisites
    })
}






const toggleRequired = () => {
    if (!isTaskNode.value) return
    updateNodeData({
        requiredForCompletion: !nodeData.value.requiredForCompletion
    })
}


const selectedNode = computed(() => props.selectedNode)

// Dialogue management functions
const addDialogue = () => {
    if (!isSpriteNode.value || !nodeData.value) return

    const currentDialogues = nodeData.value.dialogues || []
    const newDialogue: DialogueResponse = {
        text: '',
        responses: [{
            text: '',
            nextNode: ''
        }]
    }

    const dialogues = [...currentDialogues, newDialogue]

    emit('update-node', nodeId.value, {
        ...nodeData.value,
        dialogues
    })
}


const removeDialogue = (index: number) => {
    if (!isSpriteNode.value) return
    const dialogues = nodeDialogues.value.filter((_, i) => i !== index)
    updateNodeData({ dialogues })
}

const updateDialogue = (index: number, text: string) => {
    if (!isSpriteNode.value) return
    const dialogues = nodeDialogues.value.map((d, i) =>
        i === index ? { ...d, text } : d
    )
    updateNodeData({ dialogues })
}





// Response management functions
const addResponse = (dialogueIndex: number) => {
    if (!isSpriteNode.value) return

    const dialogues = nodeDialogues.value.map((dialogue, i) =>
        i === dialogueIndex
            ? {
                ...dialogue,
                responses: [
                    ...(dialogue.responses || []),
                    { text: '', nextNode: '' }
                ]
            }
            : dialogue
    )

    updateNodeData({ dialogues })
}
const removeResponse = (dialogueIndex: number, responseIndex: number) => {
    if (!isSpriteNode.value) return
    const dialogues = nodeDialogues.value.map((dialogue, i) =>
        i === dialogueIndex
            ? {
                ...dialogue,
                responses: dialogue.responses.filter((_, j) => j !== responseIndex)
            }
            : dialogue
    )
    updateNodeData({ dialogues })
}

const updateResponse = (dialogueIndex: number, responseIndex: number, text: string) => {
    if (!isSpriteNode.value) return

    const dialogues = nodeDialogues.value.map((dialogue, i) =>
        i === dialogueIndex
            ? {
                ...dialogue,
                responses: dialogue.responses.map((response, j) =>
                    j === responseIndex ? { ...response, text } : response
                )
            }
            : dialogue
    )

    updateNodeData({ dialogues })
}



// Add methods for reward management:
const removeReward = (rewardId: string) => {
    if (!nodeData.value?.rewards) return;

    const updatedRewards = nodeData.value.rewards.filter(r => r.id !== rewardId);
    updateNodeData({ rewards: updatedRewards });
}

const addReward = (reward: Reward) => {
    if (!nodeData.value) return;

    const currentRewards = nodeData.value.rewards || [];
    const updatedRewards = [...currentRewards, reward];
    updateNodeData({ rewards: updatedRewards });
}
</script>

<template>
    <div class="w-[300px] h-full bg-white border-l border-gray-200 p-5 overflow-y-scroll">
        <div class="mb-5">
            <h2 class="text-lg font-bold">Properties</h2>
        </div>

        <template v-if="nodeData">
            <!-- Common Properties -->
            <div class="mb-5">
                <h3 class="text-sm text-gray-600 mb-2">Node Type</h3>
                <div class="bg-gray-50 border border-gray-200 rounded p-2">
                    {{ nodeType }} - {{ nodeData.label }}
                </div>
            </div>

            <!-- Task-specific Properties -->
            <template v-if="isTaskNode">
                <!-- Required for Completion Toggle -->
                <div class="mb-5">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" :checked="nodeData.requiredForCompletion" @change="toggleRequired"
                            class="form-checkbox h-4 w-4 text-blue-600">
                        <span class="text-sm text-gray-700">Required for Completion</span>
                    </label>
                </div>

                <!-- Prerequisites Section -->
                <div class="mb-5">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-sm text-gray-600">Prerequisites</h3>
                        <button class="w-7 h-7 bg-green-500 text-white rounded" @click="addPrerequisite">+</button>
                    </div>

                    <div class="border border-gray-200 rounded p-4">
                        <div v-for="(prereq, index) in (selectedNode.data.prerequisites || [])" :key="index"
                            class="mb-4 last:mb-0">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-gray-600">Prerequisite {{ index + 1 }}</span>
                                <button class="w-5 h-5 bg-red-500 text-white rounded text-sm"
                                    @click="removePrerequisite(index)">×</button>
                            </div>

                            <div class="space-y-2">
                                <select v-if="availableTasks?.length" v-model="prereq.taskId" @change="updatePrerequisite(index, {
                                    taskId: ($event.target as HTMLSelectElement).value,
                                    title: availableTasks.find(t => t.id === ($event.target as HTMLSelectElement).value)?.title || ''
                                })" class="w-full p-2 border border-gray-200 rounded text-sm">
                                    <option value="">Select a task...</option>
                                    <option v-for="task in availableTasks" :key="task.id" :value="task.id"
                                        :disabled="task.id === selectedNode.id" :selected="task.id === prereq.taskId">
                                        {{ task.title }}
                                    </option>
                                </select>

                                <label class="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" :checked="prereq.required"
                                        @change="updatePrerequisite(index, { required: !prereq.required })"
                                        class="form-checkbox h-4 w-4 text-blue-600" />
                                    <span class="text-sm text-gray-700">Required</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Existing Conditions Section -->
                <div class="mb-5">
                    <h3 class="text-sm text-gray-600 mb-2">Conditions</h3>
                    <div class="bg-gray-50 border border-gray-200 rounded p-2 min-h-[80px]">
                        <div v-if="selectedNode.data.conditions" class="flex flex-col gap-2">
                            <div v-for="(condition, index) in selectedNode.data.conditions" :key="index"
                                class="bg-white border border-gray-200 rounded p-2 text-xs">
                                {{ condition }}
                            </div>
                        </div>
                        <div v-else class="text-gray-400 text-xs text-center py-5">
                            No conditions set
                        </div>
                    </div>
                </div>

                <!-- Existing Rewards Section -->
                <div class="mb-5">
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-sm text-gray-600">Rewards</h3>
                        <!-- <button class="w-7 h-7 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                            @click="addReward(reward)">
                            +
                        </button> -->
                    </div>

                    <div class="grid grid-cols-3 gap-2 border border-gray-200 rounded p-2">
                        <div v-for="reward in nodeData.rewards" :key="reward.id" class="relative group"
                            v-tooltip="reward.description">
                            <div class="reward-preview">
                                <img :src="reward.imageUrl" :alt="reward.name" class="w-full h-full object-contain" />
                            </div>
                            <button @click="removeReward(reward.id)"
                                class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                ×
                            </button>
                        </div>
                    </div>
                </div>
            </template>

            <!-- Sprite-specific Properties -->
            <template v-if="isSpriteNode">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-sm text-gray-600">Dialogues</h3>
                    <button type="button"
                        class="w-7 h-7 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
                        @click="addDialogue">
                        +
                    </button>
                </div>

                <div class="border border-gray-200 rounded p-4">
                    <div v-for="(dialogue, dIndex) in (nodeData?.dialogues || [])" :key="dIndex" class="mb-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs text-gray-600">Dialogue {{ dIndex + 1 }}</span>
                            <button class="w-5 h-5 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                @click.prevent="removeDialogue(dIndex)">
                                ×
                            </button>
                        </div>

                        <textarea v-model="dialogue.text"
                            @input="updateDialogue(dIndex, ($event.target as HTMLTextAreaElement).value)"
                            placeholder="Enter dialogue..."
                            class="w-full min-h-[60px] p-2 border border-gray-200 rounded mb-2 resize-y"></textarea>

                        <div class="bg-gray-50 rounded p-2">
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-gray-600">Responses</span>
                                <button class="px-2 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                                    @click.prevent="addResponse(dIndex)">
                                    +
                                </button>
                            </div>

                            <div v-for="(response, rIndex) in dialogue.responses" :key="rIndex" class="mb-2">
                                <div class="flex items-center gap-1 bg-blue-50 border border-blue-500 rounded p-1">
                                    <span class="text-gray-600">→</span>
                                    <input v-model="response.text"
                                        @input="updateResponse(dIndex, rIndex, ($event.target as HTMLInputElement).value)"
                                        placeholder="Add response..." class="flex-1 bg-transparent border-none p-1" />
                                    <button class="w-5 h-5 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                                        @click.prevent="removeResponse(dIndex, rIndex)">
                                        ×
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </template>

        </template>
    </div>
</template>

<style scoped>
.reward-preview {
    width: 40px;
    height: 40px;
    background: white;
    border: 1px solid #FFC107;
    border-radius: 4px;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>