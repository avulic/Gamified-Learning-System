<!-- AssignmentList.vue -->
<template>
    <div class="p-4">
        <!-- Header with Search and Filters -->
        <div class="flex justify-between items-center mb-4">
            <div class="flex gap-2">
                <Button label="New Assignment" icon="pi pi-plus" @click="createAssignment" 
                    class="p-button-success" />
            </div>
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Search assignments..." />
            </span>
        </div>

        <!-- Assignment Table -->
        <DataTable :value="assignments" 
            v-model:expandedRows="expandedRows"
            v-model:filters="filters"
            dataKey="id"
            :rowHover="true"
            :paginator="true"
            :rows="10"
            :rowsPerPageOptions="[5,10,20]"
            :loading="loading"
            :globalFilterFields="['title', 'description', 'status']"
            class="p-datatable-sm">
            
            <Column :expander="true" headerStyle="width: 3rem" />
            
            <Column field="title" header="Title" sortable>
                <template #body="{ data }">
                    <div class="flex flex-col">
                        <span class="font-medium">{{ data.title }}</span>
                        <span class="text-sm text-gray-500">{{ data.description }}</span>
                    </div>
                </template>
            </Column>

            <Column field="dueDate" header="Due Date" sortable>
                <template #body="{ data }">
                    {{ new Date(data.dueDate).toLocaleDateString() }}
                </template>
            </Column>

            <Column field="status" header="Status" sortable>
                <template #body="{ data }">
                    <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
                </template>
            </Column>

            <Column header="Actions" :exportable="false">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <Button icon="pi pi-pencil" 
                            @click="editAssignment(data)"
                            class="p-button-rounded p-button-text" />
                        <Button icon="pi pi-trash" 
                            @click="confirmDeleteAssignment(data)"
                            class="p-button-rounded p-button-text p-button-danger" />
                    </div>
                </template>
            </Column>

            <!-- Expanded Content (Tasks) -->
            <template #expansion="{ data }">
                <TaskList 
                    :tasks="data.tasks"
                    :assignmentId="data.id"
                    @task-updated="handleTaskUpdate"
                    @task-deleted="handleTaskDelete" />
            </template>
        </DataTable>

        <!-- Assignment Dialog -->
        <Dialog v-model:visible="showAssignmentDialog" 
            :header="dialogHeader"
            :style="{ width: '70vw' }"
            modal>
            <AssignmentDetails
                v-if="showAssignmentDialog"
                :assignmentProp="selectedAssignment"
                @save="saveAssignment"
                @cancel="closeDialog" />
        </Dialog>

        <!-- Confirmation Dialog -->
        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { FilterMatchMode } from 'primevue/api';
import TaskList from '@/components/task/TaskManager.vue';
import AssignmentDetails from './Details.vue';
import { ProgressTypeEnum } from '@/types/enums';
import type { Assignment } from '@/types/Assignment';
import { Task } from '@/types/task/Task';

// State
const assignments = ref<Assignment[]>([]);
const expandedRows = ref({});
const loading = ref(false);
const showAssignmentDialog = ref(false);
const selectedAssignment = ref<Assignment | null>(null);

// Services
const confirm = useConfirm();
const toast = useToast();

// Filters
const filters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Computed
const dialogHeader = computed(() => 
    selectedAssignment.value ? 'Edit Assignment' : 'Create Assignment'
);

// Methods
function getStatusSeverity(status: ProgressTypeEnum): string {
    return {
        [ProgressTypeEnum.NOT_STARTED]: 'info',
        [ProgressTypeEnum.IN_PROGRESS]: 'warning',
        [ProgressTypeEnum.COMPLETED]: 'success',
        [ProgressTypeEnum.FAILED]: 'danger',
        [ProgressTypeEnum.OVERDUE]: 'danger'
    }[status] || 'info';
}

function createAssignment() {
    selectedAssignment.value = null;
    showAssignmentDialog.value = true;
}

function editAssignment(assignment: Assignment) {
    selectedAssignment.value = { ...assignment };
    showAssignmentDialog.value = true;
}

function closeDialog() {
    showAssignmentDialog.value = false;
    selectedAssignment.value = null;
}

async function saveAssignment(assignment: Assignment) {
    try {
        loading.value = true;
        // API call to save assignment
        if (assignment.id) {
            // Update existing
            const index = assignments.value.findIndex(a => a.id === assignment.id);
            if (index !== -1) {
                assignments.value[index] = assignment;
            }
        } else {
            // Create new
            assignments.value.push(assignment);
        }
        toast.add({ severity: 'success', summary: 'Success', detail: 'Assignment saved successfully' });
        closeDialog();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save assignment' });
    } finally {
        loading.value = false;
    }
}

function confirmDeleteAssignment(assignment: Assignment) {
    confirm.require({
        message: 'Are you sure you want to delete this assignment?',
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteAssignment(assignment),
        reject: () => {
            toast.add({ severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled' });
        }
    });
}

async function deleteAssignment(assignment: Assignment) {
    try {
        loading.value = true;
        // API call to delete assignment
        assignments.value = assignments.value.filter(a => a.id !== assignment.id);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Assignment deleted successfully' });
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete assignment' });
    } finally {
        loading.value = false;
    }
}

function handleTaskUpdate(task: Task) {
    // Update task in assignment
    const assignment = assignments.value.find(a => a.id === task.assignmentId);
    if (assignment) {
        const taskIndex = assignment.tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            assignment.tasks[taskIndex] = task;
        }
    }
}

function handleTaskDelete(taskId: string, assignmentId: string) {
    // Remove task from assignment
    const assignment = assignments.value.find(a => a.id === assignmentId);
    if (assignment) {
        assignment.tasks = assignment.tasks.filter(t => t.id !== taskId);
    }
}

// Lifecycle
onMounted(async () => {
    try {
        loading.value = true;
        // API call to fetch assignments
        // assignments.value = await AssignmentService.getAll();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load assignments' });
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.p-datatable ::v-deep(.p-datatable-header) {
    background: transparent;
    border: none;
    padding: 0;
}
</style>