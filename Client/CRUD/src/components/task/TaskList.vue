<template>
    <div class="px-4">
        <div class="mb-4">
            <Button label="New Task" icon="pi pi-plus" @click="openNewTaskModal" class="p-button-success" />
        </div>

        <DataTable :value="tasks" paginator :rows="10" class="p-datatable-gridlines" :filters="filters"
            filterDisplay="row" :loading="loading" v-model:selection="selectedTasks" dataKey="id" :rowHover="true"
            removableSort>
            <Column selectionMode="multiple" headerStyle="width: 3rem" />
            <Column field="title" header="Title" sortable :showFilterMenu="false" filterMatchMode="contains">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" class="p-column-filter"
                        placeholder="Search by title" />
                </template>
            </Column>
            <Column field="type" header="Type" sortable :showFilterMenu="false" filterMatchMode="equals">
                <template #body="slotProps">
                    {{ slotProps.data.type }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" :options="Object.values(TaskTypeEnum)"
                        @change="filterCallback()" class="p-column-filter" placeholder="Select a type" />
                </template>
            </Column>
            <Column field="status" header="Status" sortable :showFilterMenu="false" filterMatchMode="equals">
                <template #body="slotProps">
                    <!-- <Tag :value="slotProps.data.status" :severity="getStatusSeverity(slotProps.data.status)" /> -->
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" :options="Object.values(ProgressTypeEnum)"
                        @change="filterCallback()" class="p-column-filter" placeholder="Select a status" />
                </template>
            </Column>
            <Column field="xpReward" header="XP Reward" sortable>
                <template #body="slotProps">
                    {{ slotProps.data.xpReward }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputNumber v-model="filterModel.value" @input="filterCallback()" class="p-column-filter"
                        placeholder="Min XP" />
                </template>
            </Column>
            <Column field="dueDate" header="Due Date" sortable>
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.dueDate) }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Calendar v-model="filterModel.value" @date-select="filterCallback()" class="p-column-filter"
                        placeholder="Select date" />
                </template>
            </Column>
            <Column header="Actions" :exportable="false" style="min-width:8rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                        @click="editTask(slotProps.data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-warning"
                        @click="confirmDeleteTask(slotProps.data)" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="taskDialog" :style="{ width: 'auto' }" header="Task Details" :modal="true"
            class="p-fluid">
            <Details :task="selectedTask" @onSaveTask="saveTask" @onDeleteTask="deleteTask" />
        </Dialog>

        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';

import Details from './Details.vue';
import Task, { TaskTypeEnum } from '@/types/task/Task';
import TaskService from '@/services/TaskService';

import { ProgressTypeEnum } from '@/types/Progression';

const confirm = useConfirm();
const toast = useToast();
const tasks = ref<Task[]>([]);
const selectedTasks = ref<Task[]>([]);
const taskDialog = ref(false);
const selectedTask = ref<Task | null>(null);
const loading = ref(true);

const filters = reactive({
    'global': { value: null, matchMode: 'contains' },
    'title': { value: null, matchMode: 'contains' },
    'type': { value: null, matchMode: 'equals' },
    'status': { value: null, matchMode: 'equals' },
    'xpReward': { value: null, matchMode: 'gte' },
    'dueDate': { value: null, matchMode: 'dateIs' }
});

onMounted(async () => {
    try {
        tasks.value = await TaskService.getAllTasks();
    } catch (error) {
        console.error('Failed to fetch tasks:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch tasks', life: 3000 });
    } finally {
        loading.value = false;
    }
});

const formatDate = (value: Date | undefined) => {
    return value ? new Date(value).toLocaleDateString() : '';
};

// const getStatusSeverity = (status: ProgressTypeEnum) => {
//     switch (status) {
//         case ProgressTypeEnum.Quiz:
//             return 'info';
//         case ProgressTypeEnum.MultiChoice:
//             return 'warning';
//         case ProgressTypeEnum.Question:
//             return 'success';
//         case ProgressTypeEnum.Overdue:
//             return 'danger';
//         default:
//             return null;
//     }
// };

const openNewTaskModal = () => {
    selectedTask.value = null;
    taskDialog.value = true;
};

const editTask = (task: Task) => {
    selectedTask.value = { ...task };
    taskDialog.value = true;
};

const saveTask = async (task: Task) => {
    try {
        if (task.id) {
            await TaskService.updateTask(task.id, task);
            const index = tasks.value.findIndex(t => t.id === task.id);
            if (index !== -1) {
                tasks.value[index] = task;
            }
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Task Updated', life: 3000 });
        } else {
            const newTask = await TaskService.createTask(task);
            tasks.value.push(newTask);
            toast.add({ severity: 'success', summary: 'Successful', detail: 'Task Created', life: 3000 });
        }
        taskDialog.value = false;
    } catch (error) {
        console.error('Failed to save task:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save task', life: 3000 });
    }
};

const confirmDeleteTask = (task: Task) => {
    confirm.require({
        message: 'Are you sure you want to delete this task?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteTask(task.id)
    });
};

const deleteTask = async (taskId: string) => {
    try {
        await TaskService.deleteTask(taskId);
        tasks.value = tasks.value.filter(t => t.id !== taskId);
        toast.add({ severity: 'success', summary: 'Successful', detail: 'Task Deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete task:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete task', life: 3000 });
    }
};
</script>