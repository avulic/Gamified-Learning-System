<!-- TaskList.vue -->
<template>
    <div class="task-list p-4 bg-gray-50 rounded-lg">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">Tasks</h3>
            <SplitButton label="Add Task" 
                :model="taskTypeMenuItems"
                @click="handleAddTask(TaskTypeEnum.QUESTION)"
                class="p-button-sm" />
        </div>

        <DataTable :value="tasks"
            v-model:selection="selectedTask"
            dataKey="id"
            :reorderableRows="true"
            @rowReorder="handleTaskReorder"
            class="p-datatable-sm"
            stripedRows>
            
            <Column rowReorder :frozen="true" style="width: 3rem" />
            
            <Column field="title" header="Title">
                <template #body="{ data }">
                    <div class="flex flex-col gap-1">
                        <span class="font-medium">{{ data.title }}</span>
                        <Tag :value="getTaskTypeLabel(data.taskType)"
                            :severity="getTaskTypeSeverity(data.taskType)" />
                    </div>
                </template>
            </Column>

            <Column field="points" header="Points" style="width: 100px">
                <template #body="{ data }">
                    <span class="font-medium">{{ data.points }}</span>
                </template>
            </Column>

            <Column field="status" header="Status" style="width: 120px">
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
                </template>
            </Column>

            <Column style="width: 8rem">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <Button icon="pi pi-pencil" 
                            @click="editTask(data)"
                            class="p-button-text p-button-sm" />
                        <Button icon="pi pi-trash" 
                            @click="confirmDeleteTask(data)"
                            class="p-button-text p-button-danger p-button-sm" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <!-- Task Editor Dialog -->
        <Dialog v-model:visible="showTaskDialog" 
            :header="taskDialogTitle"
            :style="{ width: '70vw' }"
            modal>
            <TaskEditor v-if="showTaskDialog"
                :task="selectedTask"
                :task-type="selectedTask?.taskType || newTaskType"
                @save="handleTaskSave"
                @cancel="closeTaskDialog" />
        </Dialog>

        <!-- Confirmation Dialog -->
        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { TaskTypeEnum, ProgressTypeEnum } from '@/types/enums';
import type { Task } from '@/types/task/Task';
import TaskEditor from './TaskEditor.vue';

const props = defineProps<{
    tasks: Task[];
    assignmentId?: string;
}>();

const emit = defineEmits<{
    (e: 'task-updated', task: Task): void;
    (e: 'task-deleted', taskId: string, assignmentId: string): void;
}>();

// State
const selectedTask = ref<Task | null>(null);
const newTaskType = ref<TaskTypeEnum | null>(null);
const showTaskDialog = ref(false);

// Services
const confirm = useConfirm();
const toast = useToast();

// Menu items for task types
const taskTypeMenuItems = [
    {
        label: 'Question Task',
        icon: 'pi pi-question',
        command: () => handleAddTask(TaskTypeEnum.QUESTION)
    },
    {
        label: 'Quiz Task',
        icon: 'pi pi-list',
        command: () => handleAddTask(TaskTypeEnum.QUIZ)
    },
    {
        label: 'File Upload Task',
        icon: 'pi pi-upload',
        command: () => handleAddTask(TaskTypeEnum.FILE_UPLOAD)
    },
    {
        label: 'Code Task',
        icon: 'pi pi-code',
        command: () => handleAddTask(TaskTypeEnum.CODE)
    }
];

// Computed
const taskDialogTitle = computed(() => 
    selectedTask.value ? 'Edit Task' : 'Create Task'
);

// Methods
function getTaskTypeLabel(type: TaskTypeEnum): string {
    return {
        [TaskTypeEnum.QUESTION]: 'Question',
        [TaskTypeEnum.QUIZ]: 'Quiz',
        [TaskTypeEnum.FILE_UPLOAD]: 'File Upload',
        [TaskTypeEnum.CODE]: 'Code'
    }[type] || type;
}

function getTaskTypeSeverity(type: TaskTypeEnum): string {
    return {
        [TaskTypeEnum.QUESTION]: 'info',
        [TaskTypeEnum.QUIZ]: 'warning',
        [TaskTypeEnum.FILE_UPLOAD]: 'success',
        [TaskTypeEnum.CODE]: 'danger'
    }[type] || 'info';
}

function getStatusSeverity(status: ProgressTypeEnum): string {
    return {
        [ProgressTypeEnum.NOT_STARTED]: 'secondary',
        [ProgressTypeEnum.IN_PROGRESS]: 'info',
        [ProgressTypeEnum.COMPLETED]: 'success',
        [ProgressTypeEnum.FAILED]: 'danger',
        [ProgressTypeEnum.OVERDUE]: 'warning'
    }[status] || 'secondary';
}

function handleAddTask(type: TaskTypeEnum) {
    selectedTask.value = null;
    newTaskType.value = type;
    showTaskDialog.value = true;
}

function editTask(task: Task) {
    selectedTask.value = { ...task };
    showTaskDialog.value = true;
}

function closeTaskDialog() {
    showTaskDialog.value = false;
    selectedTask.value = null;
    newTaskType.value = null;
}

function handleTaskSave(task: Task) {
    const updatedTask = {
        ...task,
        assignmentId: props.assignmentId
    };
    //emit('task-updated', updatedTask);
    closeTaskDialog();
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: `Task ${task.id ? 'updated' : 'created'} successfully`,
        life: 3000
    });
}

function confirmDeleteTask(task: Task) {
    confirm.require({
        message: 'Are you sure you want to delete this task?',
        header: 'Confirm Delete',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            emit('task-deleted', task.id!, props.assignmentId as string);
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Task deleted successfully',
                life: 3000
            });
        }
    });
}

function handleTaskReorder(event: { value: Task[] }) {
    const reorderedTasks = event.value.map((task, index) => ({
        ...task,
        order: index
    }));
    // Emit reordered tasks to parent
    reorderedTasks.forEach(task => emit('task-updated', task));
}

</script>

<style scoped>
.p-datatable-scrollable-body {
    overflow-y: auto !important;
}
</style>