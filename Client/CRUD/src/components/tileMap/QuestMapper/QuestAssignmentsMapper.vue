<template>
    <div class="quest-editor">
        <div class="save-button-container">
            <button class="save-button" :disabled="isSaving" @click="handleSave">
                {{ isSaving ? 'Saving...' : 'Save Quest' }}
            </button>
        </div>

        <LeftSidebar :tasks="availableTasks" :sprites="availableSprites" :spritesOnMap="spritesOnMap"
            :rewards="availableRewards" @add-task="addTaskFromTemplate" @add-sprite="addSpriteFromTemplate"
            @add-reward="addRewardToSelectedNode" />

        <div class="flow-container">
            <VueFlow :nodes="nodes" :edges="edges" :default-zoom="1.5" :min-zoom="0.2" :max-zoom="4"
                @connect="onConnect" @nodeDragStop="onNodeDragStop">

                <template #node-taskNode="props">
                    <TaskNode v-bind="props" />
                </template>

                <template #node-spriteNode="props">
                    <SpriteNode v-bind="props" />
                </template>

                <Background :gap="40" :size="1" />
                <Controls />
            </VueFlow>
        </div>

        <RightSidebar :selected-node="selectedNode" :available-tasks="availableTasks" @update-node="updateNodeData" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { VueFlow, useVueFlow, MarkerType, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'


import TaskNode from './TaskNode.vue'
import SpriteNode from './SpriteNode.vue'
import LeftSidebar from './LeftSidebar.vue'
import RightSidebar from './RightSidebar.vue'
import AssignmentService from '@/services/AssignmentService'
import TaskService from '@/services/TaskService'
import * as PIXI from 'pixi.js'
import { Assignment } from '@/types/Assignment'
import { PlacedSprite } from '../sprite'
import { TaskTypeEnum, ProgressTypeEnum } from '@/types/enums'
import { Task } from '@/types/task/Task'

const instance = useVueFlow()
const { addNodes, fitView, onNodeClick, findNode } = useVueFlow()


export interface Reward {
    id: string;
    imageUrl: string;
    name: string;
    description: string;
    category: string;
    value: number;
}

export interface TaskPrerequisite {
    nodeId?: string;
    taskId: string;
    title?: string;
    required?: boolean;
}


export interface TaskNodeData {
    id: string;
    title: string;
    description: string;
    type: TaskTypeEnum;
    status: ProgressTypeEnum;
    conditions: string[];
    rewards: Reward[];
    xpReward: number;
    prerequisites: TaskPrerequisite[];
    requiredForCompletion: boolean;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    type: string;
    data: {
        type: 'prerequisite' | 'sprite',
    };
    animated?: boolean;
    style?: {};
    markerEnd: string;
}




export interface DialogueOption {
    text: string;
    nextNode?: string;
}

export interface DialogueResponse {
    text: string;
    responses: DialogueOption[];
}


export interface SpriteNodeData {
    url: string;
    label: string;
    dialogues: DialogueResponse[];
}

export interface SpriteNode {
    type: 'spriteNode';
    id: string;
    position: {
        x: number;
        y: number;
    };
    data: SpriteNodeData;
}

export interface TaskNode {
    type: 'taskNode';
    id: string;
    position: {
        x: number;
        y: number;
    };
    data: TaskNodeData;
}

export type Node = SpriteNode | TaskNode;


// Add new interfaces for save data
interface QuestSaveData {
    id: string;
    nodes: {
        tasks: TaskNode[];
        sprites: SpriteNode[];
    };
    edges: Edge[];
    spritePositions: Map<string, { x: number; y: number; }>;
}


// Add emits for save events
const emit = defineEmits(['save-success', 'save-error', 'save-quest'])

const props = defineProps<{
    sprites: Map<string, PIXI.Texture> | undefined;
    spritesLoaded: Map<string, PlacedSprite> | undefined;
}>()

// State
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const selectedNode = ref<Node | null>(null)
const availableTasks = ref<TaskNodeData[]>([])
const availableSprites = ref<{
    id: string,
    url: string,
    category: string,
    label: string,
    dialogue: string
}[]>([])


const spritesOnMap = ref<{
    id: string,
    url: string,
    category: string,
    label: string,
    dialogue: string,
    tasks?: TaskNodeData[]
}[]>([])

const taskNodes = computed(() => {
    return nodes.value.filter((node: Node) => node.type === 'taskNode')
})



const app = new PIXI.Application();

const textureToDataURL = async (sprite: PIXI.Texture): Promise<string> => {
    const renderer = PIXI.autoDetectRenderer(
        {
            width: 800,
            height: 600
        }
    );
    const image = await app.renderer.extract.base64(sprite);
    return image;
}


// Methods
const convertTaskToNodeData = (task: Task): TaskNodeData => {
    return {
        id: task.id || "",
        title: task.title,
        description: task.description,
        type: task.taskType || TaskTypeEnum.QUESTION,
        status: task.status || ProgressTypeEnum.NOT_STARTED,
        xpReward: task.xpReward,
        conditions: ["condition"],
        rewards: [{}] as Reward[],
        prerequisites: !task.prerequisites ? [{} as unknown as TaskPrerequisite] : task.prerequisites.map(p => ({ nodeId: "", taskId: p })),
        requiredForCompletion: task.requiredForCompletion || false
    }
}

const addTaskFromTemplate = (task: any) => {
    const position = getNextPosition()
    const newNode: TaskNode = {
        id: `task-${Date.now()}`,
        type: 'taskNode',
        position,
        data: convertTaskToNodeData(task)
    }
    nodes.value.push(newNode)
}

const addSpriteFromTemplate = (sprite: any) => {
    const position = getNextPosition()
    const newNode: SpriteNode = {
        id: sprite.id ? sprite.id : `sprite-${Date.now()}`,
        type: 'spriteNode',
        position,
        data: {
            url: sprite.url,
            label: sprite.label,
            dialogues: []
        }
    }
    nodes.value.push(newNode)
}

// Update the onConnect handler to maintain proper connections
const onConnect = (params: any) => {
    const sourceNode = findNode(params.source)
    const targetNode = findNode(params.target)

    if (sourceNode?.type === 'spriteNode' && targetNode?.type === 'taskNode') {
        // Remove any existing sprite-to-task connections for this sprite
        edges.value = edges.value.filter(edge =>
            !(edge.source === sourceNode.id && edge.data.type === 'sprite')
        )

        // Add new sprite-to-task connection
        const newEdge: Edge = {
            id: `edge-${Date.now()}`,
            source: params.source,
            target: params.target,
            type: 'default',
            data: {
                type: 'sprite'
            },
            animated: false,
            style: undefined,
            markerEnd: ''
        }
        edges.value.push(newEdge)
    } else if (sourceNode?.type === 'taskNode' && targetNode?.type === 'taskNode') {
        // Handle task-to-task (prerequisite) connections
        if (!hasCircularDependency(sourceNode.id, targetNode.id)) {
            const newEdge: Edge = {
                id: `edge-${Date.now()}`,
                source: params.source,
                target: params.target,
                data: {
                    type: 'prerequisite'
                },
                animated: true,
                style: { stroke: '#ff6b6b' },
                type: 'smoothstep',
                markerEnd: MarkerType.ArrowClosed
            }

            // Update prerequisites in target task
            const targetTask = targetNode.data as TaskNodeData
            const sourceTask = sourceNode.data as TaskNodeData

            if (!targetTask.prerequisites) {
                targetTask.prerequisites = []
            }

            const newPrerequisite: TaskPrerequisite = {
                nodeId: sourceNode.id,
                taskId: sourceTask.id,
                title: sourceTask.title,
                required: false
            }

            updateNodeData(targetNode.id, {
                ...targetTask,
                prerequisites: [...targetTask.prerequisites, newPrerequisite]
            })

            edges.value.push(newEdge)
        }
    }
}

const hasCircularDependency = (sourceId: string, targetId: string, visited = new Set<string>()): boolean => {
    if (sourceId === targetId) return true
    if (visited.has(targetId)) return false

    visited.add(targetId)
    const node = findNode(targetId)
    if (!node || node.type !== 'taskNode') return false

    const taskData = node.data as TaskNodeData
    return taskData.prerequisites?.some((prereq: TaskPrerequisite) =>
        hasCircularDependency(sourceId, prereq.taskId, new Set(visited))
    ) || false
}

const updateNodeData = (nodeId: string, newData: any) => {
    const nodeIndex = nodes.value.findIndex(node => node.id === nodeId)
    if (nodeIndex !== -1) {
        // Important: Create a new array reference to trigger reactivity
        nodes.value = nodes.value.map((node, index) => {
            if (index === nodeIndex) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        ...newData,
                        // Preserve existing dialogues if not provided in newData
                        dialogues: newData.dialogues ?? (node as SpriteNode).data.dialogues ?? []
                    }
                }
            }
            return node
        })
    }
}

const getNextPosition = () => {
    return {
        x: 300 + (nodes.value.length * 150) % 600,
        y: 100 + Math.floor(nodes.value.length / 4) * 150
    }
}



const loadExistingTasks = () => {
    spritesOnMap.value.forEach(sprite => {
        if (!sprite.tasks?.length) return;

        // Create sprite node first
        const spritePosition = getNextPosition()
        const spriteNode: SpriteNode = {
            id: sprite.id,
            type: 'spriteNode',
            position: spritePosition,
            data: {
                url: sprite.url,
                label: sprite.label,
                dialogues: []
            }
        }
        nodes.value.push(spriteNode)

        // Find the starting task (task with no prerequisites)
        const startingTask = sprite.tasks.find(task =>
            !task.prerequisites || task.prerequisites.length === 0
        )

        if (!startingTask) return;

        // Create starting task node
        const startingTaskNode: TaskNode = {
            id: startingTask.id,
            type: 'taskNode',
            position: getNextPosition(),
            data: startingTask
        }
        nodes.value.push(startingTaskNode)

        // Connect sprite to starting task
        const spriteToStartingTaskEdge: Edge = {
            id: `edge-sprite-${sprite.id}-${startingTask.id}`,
            source: sprite.id,
            target: startingTask.id,
            type: 'default',
            data: {
                type: 'sprite'
            },
            animated: false,
            style: undefined,
            markerEnd: ''
        }
        edges.value.push(spriteToStartingTaskEdge)

        // Create remaining task nodes and establish prerequisite connections
        const remainingTasks = sprite.tasks.filter(task => task.id !== startingTask.id)
        const processedTasks = new Set([startingTask.id])

        // Helper function to recursively process tasks
        const processTask = (parentTask: TaskNodeData) => {
            const childTasks = remainingTasks.filter(task =>
                task.prerequisites?.some(prereq => prereq.taskId === parentTask.id)
            )

            childTasks.forEach(task => {
                if (processedTasks.has(task.id)) return;

                // Create task node
                const taskNode: TaskNode = {
                    id: task.id,
                    type: 'taskNode',
                    position: getNextPosition(),
                    data: task
                }
                nodes.value.push(taskNode)

                // Create prerequisite connection
                const prerequisiteEdge: Edge = {
                    id: `edge-prereq-${parentTask.id}-${task.id}`,
                    source: parentTask.id,
                    target: task.id,
                    data: {
                        type: 'prerequisite'
                    },
                    animated: true,
                    style: { stroke: '#ff6b6b' },
                    type: 'smoothstep',
                    markerEnd: MarkerType.ArrowClosed
                }
                edges.value.push(prerequisiteEdge)

                processedTasks.add(task.id)
                processTask(task) // Process next level of tasks
            })
        }

        // Start processing from the starting task
        processTask(startingTask)
    })
}



onMounted(async () => {
    fitView()

    await app.init();

    try {
        const assignments = await AssignmentService.getAssignmentById("67c623d593b42c36efb8e315")
        const tasks = await TaskService.getTasksByAssignment("67c623d593b42c36efb8e315")
        // assignments.forEach((assignment: Assignment) => {
        //     assignment.tasks.forEach((task: Task) => {
        //         const taskData = convertTaskToNodeData(task)
        //         availableTasks.value.push(taskData)
        //     })
        // })

        tasks.forEach((task: Task) => {
            const taskData = convertTaskToNodeData(task)
            availableTasks.value.push(taskData)
        })
        
        if (props.sprites === undefined) {
            return;
        }
        var i = 0;
        const sprites = await Promise.all(
            Array.from(props.sprites.keys()).map(async key => {
                if (props.sprites === undefined) {
                    console.error('Sprites not loaded')
                    return null;
                }
                const texture = props.sprites.get(key)

                if (texture === undefined){
                    console.error('Texture not found')
                    return null;
                }
                const dataUrl = await textureToDataURL(texture)
                return {
                    id: `sprite-lib-${key}`, // Changed from incrementing number to string with prefix
                    url: dataUrl,
                    category: 'NPCs',
                    label: key,
                    dialogue: 'Welcome to my shop!'
                }
            })
        ).then(results => results.filter(item => item !== null));

        availableSprites.value = sprites;


        if (!props.spritesLoaded) {
            return
        }
        var i = 0;
        const spritesMap = await Promise.all(
            Array.from(props.spritesLoaded.keys()).map(async key => {
                const placedSprite: PlacedSprite = props.spritesLoaded?.get(key)!
                const dataUrl = await textureToDataURL(placedSprite.texture.texture)
                return {
                    id: placedSprite.id, // This should already be a string ID
                    url: dataUrl,
                    category: 'NPCs',
                    label: placedSprite.sprite.id,
                    dialogue: 'Welcome to my shop!',
                    tasks: placedSprite.questData?.tasks.map(t => t.taskData)
                }
            })
        );

        spritesOnMap.value = spritesMap

        // Load existing tasks and connections
        loadExistingTasks()

        // Add sprite nodes for sprites on map
        spritesMap.forEach(s => {
            if (!nodes.value.some(node => node.id === s.id)) {
                addSpriteFromTemplate(s)
            }
        })

    } catch (error) {
        console.error('Error loading assignments:', error)
    }
})

// Event handlers
onNodeClick(({ node }) => {
    if (!node) return
    selectedNode.value = node as Node
})

const onNodeDragStop = (e: any) => {
    const node = e.node
    const nodeIndex = nodes.value.findIndex(el => el.id === node.id)
    if (nodeIndex !== -1) {
        nodes.value[nodeIndex] = {
            ...nodes.value[nodeIndex],
            position: node.position
        }
    }
}

// Clean up connections when prerequisites are removed
const cleanupPrerequisiteConnections = (nodeId: string, removedPrereqId: string) => {
    edges.value = edges.value.filter(edge =>
        !(edge.source === removedPrereqId && edge.target === nodeId && edge.type === 'prerequisite')
    )
}

// Watch for prerequisite changes
watch(
    () => selectedNode.value?.type === 'taskNode' ? selectedNode.value?.data?.prerequisites : undefined,
    (newPrereqs, oldPrereqs) => {
        if (!selectedNode.value || !oldPrereqs) return;

        const removedPrereqs = oldPrereqs.filter(oldPrereq =>
            !newPrereqs?.some(newPrereq => newPrereq.taskId === oldPrereq.taskId)
        );

        removedPrereqs.forEach(removedPrereq => {
            cleanupPrerequisiteConnections(selectedNode.value!.id, removedPrereq.taskId);
        });
    },
    { deep: true }
);




const availableRewards = ref<Reward[]>([
    {
        id: 'gold',
        imageUrl: '/assets/chest.png',
        name: 'Gold',
        description: 'Currency used throughout the game',
        category: 'Currency',
        value: 100
    },
    // Add more rewards as needed
]);

const addRewardToSelectedNode = (reward: Reward) => {
    if (!selectedNode.value) return;

    const nodeData = selectedNode.value.data;
    const currentRewards = (nodeData as TaskNodeData).rewards || [];

    updateNodeData(selectedNode.value.id, {
        ...nodeData,
        rewards: [...currentRewards, reward]
    });
}




// Validation helper function
const validateQuestConnections = (questData: QuestSaveData): string | null => {
    // Check if all tasks have at least one connection
    const unconnectedTasks = questData.nodes.tasks.filter(task => {
        const connections = questData.edges.filter(edge =>
            edge.source === task.id || edge.target === task.id
        )
        return connections.length === 0
    })

    if (unconnectedTasks.length > 0) {
        return `Found unconnected tasks: ${unconnectedTasks.map(t => t.data.title).join(', ')}`
    }

    // Check for cycles in task prerequisites
    const hasCycle = checkForPrerequisiteCycles(questData.nodes.tasks, questData.edges)
    if (hasCycle) {
        return 'Circular dependencies detected in task prerequisites'
    }

    return null
}

// Cycle detection helper
const checkForPrerequisiteCycles = (tasks: TaskNode[], edges: Edge[], visited = new Set<string>(), currentPath = new Set<string>()): boolean => {
    for (const task of tasks) {
        if (hasCycleDFS(task.id, edges, visited, currentPath)) {
            return true
        }
    }
    return false
}

const hasCycleDFS = (
    nodeId: string,
    edges: Edge[],
    visited: Set<string>,
    currentPath: Set<string>
): boolean => {
    if (currentPath.has(nodeId)) {
        return true
    }
    if (visited.has(nodeId)) {
        return false
    }

    visited.add(nodeId)
    currentPath.add(nodeId)

    const outgoingEdges = edges.filter(edge => edge.source === nodeId)
    for (const edge of outgoingEdges) {
        if (hasCycleDFS(edge.target, edges, visited, currentPath)) {
            return true
        }
    }

    currentPath.delete(nodeId)
    return false
}


// Add a loading state
const isSaving = ref(false)



const handleSave = async () => {
    if (isSaving.value) return

    isSaving.value = true
    try {
        const questId = await handleSaveQuest()
        console.log('Quest saved successfully:', questId)
    } catch (error) {

    } finally {
        isSaving.value = false
    }
}

export interface QuestSpriteData {
    spriteId: string;
    tasks: Array<{
        taskId: string;
        taskData: TaskNodeData;
        prerequisites: string[];  // Array of task IDs
        dialogue?: {
            text: string;
            responses: Array<{
                text: string;
                nextTaskId?: string;
            }>;
        };
        rewards?: Reward[];
    }>;
}


const collectConnectedTasks = (spriteId: string, visited = new Set<string>()): TaskNode[] => {
    const connectedTasks: TaskNode[] = [];
    const stack: string[] = [spriteId];
    const isFirstNode = true;

    while (stack.length > 0) {
        const currentNodeId = stack.pop()!;

        if (visited.has(currentNodeId)) continue;
        visited.add(currentNodeId);

        // Get the current node
        const currentNode = nodes.value.find(n => n.id === currentNodeId);
        if (!currentNode) continue;

        // Find all edges connected to current node
        const connectedEdges = edges.value.filter(edge =>
            edge.source === currentNodeId || edge.target === currentNodeId
        );

        for (const edge of connectedEdges) {
            const nextNodeId = edge.source === currentNodeId ? edge.target : edge.source;
            const nextNode = nodes.value.find(n => n.id === nextNodeId);

            if (!nextNode || visited.has(nextNodeId)) continue;

            if (nextNode.type === 'taskNode') {
                connectedTasks.push(nextNode as TaskNode);
                stack.push(nextNodeId); // Continue traversing through this task
            }
            // If we hit another sprite, we don't traverse through it
            // This ensures each sprite only gets its directly connected tasks
        }
    }

    return connectedTasks;
};


const handleSaveQuest = () => {
    // Find all sprite nodes
    const spriteNodes = nodes.value.filter((node): node is SpriteNode =>
        node.type === 'spriteNode'
    );

    // Build the quest data for each sprite
    const questData = spriteNodes.map(spriteNode => {
        const connectedTasks = collectConnectedTasks(spriteNode.id);

        return {
            spriteId: spriteNode.id.startsWith("sprite-") ? spriteNode.data.label : spriteNode.id,
            tasks: connectedTasks.map(taskNode => ({
                taskId: taskNode.data.id,
                taskData: taskNode.data,
                prerequisites: taskNode.data.prerequisites?.map(p => p.taskId) || [],
                dialogue: spriteNode.data.dialogues?.[0] ? {
                    text: spriteNode.data.dialogues[0].text,
                    responses: spriteNode.data.dialogues[0].responses.map(r => ({
                        text: r.text,
                        nextTaskId: r.nextNode
                    }))
                } : [],
                rewards: taskNode.data.rewards?.map((reward: Reward) => ({
                    id: reward.id,
                    imageUrl: reward.imageUrl,
                    name: reward.name,
                    description: reward.description,
                    category: reward.category,
                    value: reward.value
                }))
            }))
        } as QuestSpriteData;
    }).filter(spriteData => spriteData.tasks.length > 0); // Only include sprites that have connected tasks

    // Emit the quest data
    emit('save-quest', questData);
};
</script>

<style scoped>
.quest-editor {
    width: 100%;
    height: 100%;
    display: flex;
}

.flow-container {
    flex-grow: 1;
    height: 100%;
    background: #f0f2f5;
}

:deep(.vue-flow__edge-prerequisite) {
    stroke: #ff6b6b;
    animation: dashdraw 1s linear infinite;
    stroke-dasharray: 5;
}

@keyframes dashdraw {
    from {
        stroke-dashoffset: 10;
    }
}

.save-button-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
}

.save-button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
}

.save-button:hover {
    background: #45a049;
}

.save-button:disabled {
    background: #cccccc;
    cursor: not-allowed;
}
</style>