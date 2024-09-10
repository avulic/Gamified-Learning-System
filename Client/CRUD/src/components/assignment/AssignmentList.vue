<template>
    <div class="p-4">
        <div class="flex justify-between mb-4">
            <Button label="New Assignment" icon="pi pi-plus" @click="openNewAssignmentModal" class="p-button-success" />
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </span>
        </div>

        <DataTable :value="assignments" :paginator="true" :rows="10" :globalFilterFields="['title', 'description']"
            :filters="filters" responsiveLayout="scroll" dataKey="id" :rowHover="true"
            v-model:selection="selectedAssignments" :loading="loading">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="title" header="Title" :sortable="true"></Column>
            <Column field="description" header="Description" :sortable="true"></Column>
            <Column field="dueDate" header="Due Date" :sortable="true">
                <template #body="slotProps">
                    {{ new Date(slotProps.data.dueDate).toLocaleDateString() }}
                </template>
            </Column>
            <Column field="maxScore" header="Max Score" :sortable="true"></Column>
            <Column field="xpReward" header="XP Reward" :sortable="true"></Column>
            <Column header="Actions">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" @click="editAssignment(slotProps.data)"
                        class="p-button-rounded p-button-success mr-2" />
                    <Button icon="pi pi-trash" @click="confirmDeleteAssignment(slotProps.data.id)"
                        class="p-button-rounded p-button-danger" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="showModal" :style="{}" header="Assignment Details" :modal="true" class="p-fluid">
            <Details :initialAssignment="selectedAssignment" @onSaveAssignment="saveAssignment"
                @cancel="updateAssignment">
            </Details>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from 'primevue/api';
import AssignmentService from '@/services/AssignmentService';
import type Assignment from '@/types/Assignment';
import Details from '@/components/assignment/Details.vue';

const toast = useToast();
const confirm = useConfirm();

const assignments = ref<Assignment[]>([]);
const selectedAssignment = ref<Assignment | null>(null);
const selectedAssignments = ref();
const showModal = ref(false);
const loading = ref(false);

const filters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

onMounted(async () => {
    await loadAssignments();
});

async function loadAssignments() {
    loading.value = true;
    try {
        assignments.value = await AssignmentService.getAllAssignments();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load assignments', life: 3000 });
    } finally {
        loading.value = false;
    }
}

function openNewAssignmentModal() {
    selectedAssignment.value = null;
    showModal.value = true;
}

function confirmDeleteAssignment(id: string) {
    confirm.require({
        message: 'Are you sure you want to delete this assignment?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteAssignment(id),
    });
}

async function deleteAssignment(id: string) {
    try {
        await AssignmentService.deleteAssignment(id);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Assignment deleted', life: 3000 });
        await loadAssignments();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete assignment', life: 3000 });
    }
}

function editAssignment(editAssignment: Assignment) {
    console.log(editAssignment)
    selectedAssignment.value = { ...editAssignment };
    showModal.value = true;
}

async function saveAssignment(assignment: Assignment) {
    try {
        await AssignmentService.createAssignment(assignment);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Assignment created', life: 3000 });
        showModal.value = false;
        await loadAssignments();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create assignment', life: 3000 });
    }
}

async function updateAssignment(assignment: Assignment) {
    try {
        await AssignmentService.updateAssignment(assignment.id, assignment);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Assignment updated', life: 3000 });
        showModal.value = false;
        await loadAssignments();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update assignment', life: 3000 });
    }
}
</script>

<style scoped>
/* Add any additional component-specific styles here */
</style>