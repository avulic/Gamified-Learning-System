<template>
    <Dialog :visible="dialogVisible" @update:visible="updateVisible" header="Add New Assignment" :modal="true"
        class="w-full max-w-3xl">
        <div class="space-y-6">
            <!-- Assignment Section -->
            <div class="space-y-4">
                <h3 class="text-lg font-semibold">Assignment Details</h3>
                <div class="flex flex-col">
                    <label class="mb-1">Title</label>
                    <InputText v-model="assignmentForm.title" />
                </div>
                <div class="flex flex-col">
                    <label class="mb-1">Description</label>
                    <Editor v-model="assignmentForm.description" editorStyle="height: 200px" />
                </div>
                <div class="flex gap-4">
                    <div class="flex flex-col flex-1">
                        <label class="mb-1">Points</label>
                        <InputNumber v-model="assignmentForm.points" :min="0" />
                    </div>
                    <div class="flex flex-col flex-1">
                        <label class="mb-1">Passing Score (%)</label>
                        <InputNumber v-model="assignmentForm.passingScore" :min="0" :max="100" />
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="flex flex-col flex-1">
                        <label class="mb-1">Start Date</label>
                        <Calendar v-model="assignmentForm.submissionWindow.start" showTime />
                    </div>
                    <div class="flex flex-col flex-1">
                        <label class="mb-1">Due Date</label>
                        <Calendar v-model="assignmentForm.submissionWindow.end" showTime />
                    </div>
                </div>
                <div class="flex gap-4">
                    <div class="flex flex-col flex-1">
                        <label class="mb-1">Maximum Attempts</label>
                        <InputNumber v-model="assignmentForm.maxAttempts" :min="1" />
                    </div>
                    <div class="flex flex-col flex-1">
                        <label class="mb-1">Time Limit (minutes)</label>
                        <InputNumber v-model="assignmentForm.timeLimit" :min="0" />
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <Checkbox v-model="assignmentForm.submissionWindow.allowLateSubmissions" binary />
                    <label>Allow Late Submissions</label>
                </div>
                <div v-if="assignmentForm.submissionWindow.allowLateSubmissions" class="flex flex-col">
                    <label class="mb-1">Late Submission Penalty (%)</label>
                    <InputNumber v-model="assignmentForm.submissionWindow.lateSubmissionPenalty" :min="0" :max="100" />
                </div>
            </div>

            <!-- Tasks Section -->
            <div class="space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Tasks</h3>
                    <Button icon="pi pi-plus" label="Add Task" @click="openTaskDialog"
                        class="p-button-outlined p-button-sm" />
                </div>

                <DataTable :value="tasks" class="mt-2">
                    <Column field="title" header="Title">
                        <template #body="{ data }">
                            <div class="font-medium">{{ data.title }}</div>
                            <div class="text-sm text-gray-500">{{ data.description }}</div>
                        </template>
                    </Column>
                    <Column field="taskType" header="Type" style="width: 120px">
                        <template #body="{ data }">
                            {{ data.taskType }}
                        </template>
                    </Column>
                    <Column field="points" header="Points" style="width: 100px">
                        <template #body="{ data }">
                            <Badge :value="data.points" severity="success" />
                        </template>
                    </Column>
                    <Column field="dueDate" header="Due Date" style="width: 150px">
                        <template #body="{ data }">
                            {{ formatDate(data.dueDate) }}
                        </template>
                    </Column>
                    <Column style="width: 100px">
                        <template #body="{ data }">
                            <Button icon="pi pi-trash" @click="handleDeleteTask(data.id)"
                                class="p-button-danger p-button-outlined p-button-sm" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" @click="handleCancel" class="p-button-text" />
            <Button label="Create Assignment" @click="handleAdd" :disabled="!isFormValid" />
        </template>

        <TaskDialog 
            v-model:visible="taskDialog" 
            :newTask="newTask"
            @add="handleAddTask" 
        />
    </Dialog>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { Assignment } from '@/types/Assignment';
import { Task } from '@/types/task/Task';
import { ParentType } from '@/types/enums';
import TaskDialog from './TaskDialog.vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps<{
    visible: boolean;
    newAssignment: Partial<Assignment>;
}>();

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void;
    (e: 'add', assignment: Assignment): void;
}>();

const toast = useToast();
const confirm = useConfirm();

const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
});

const assignmentForm = ref<Assignment>({
    title: '',
    description: '',
    tasks: [],
    parentType: ParentType.COURSE,
    submissionWindow: {
        start: new Date(),
        end: new Date(),
        allowLateSubmissions: false,
        lateSubmissionPenalty: 0
    },
    maxAttempts: 1,
    passingScore: 60,
    points: 0,
    timeLimit: 0,
    ...props.newAssignment
});

const tasks = ref<Task[]>([]);
const taskDialog = ref(false);
const newTask = ref({
    assignmentId: '',
    title: '',
    description: '',
    points: 0,
    dueDate: undefined
});

const updateVisible = (value: boolean) => {
    emit('update:visible', value);
};

const isFormValid = computed(() => {
    return (
        assignmentForm.value.title &&
        assignmentForm.value.description &&
        assignmentForm.value.submissionWindow.start &&
        assignmentForm.value.submissionWindow.end &&
        assignmentForm.value.points > 0 &&
        assignmentForm.value.passingScore > 0 &&
        assignmentForm.value.maxAttempts > 0
    );
});

watch(() => props.visible, (newValue) => {
    if (newValue) {
        assignmentForm.value = {
            title: '',
            description: '',
            tasks: [],
            parentType: ParentType.COURSE,
            submissionWindow: {
                start: new Date(),
                end: new Date(),
                allowLateSubmissions: false,
                lateSubmissionPenalty: 0
            },
            maxAttempts: 1,
            passingScore: 60,
            points: 0,
            timeLimit: 0,
            ...props.newAssignment
        };
        tasks.value = [];
    }
});

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
};

const openTaskDialog = () => {
    newTask.value = {
        assignmentId: assignmentForm.value.id || '',
        title: '',
        description: '',
        points: 0,
        dueDate: undefined
    };
    taskDialog.value = true;
};

const handleAddTask = (task: Task) => {
    tasks.value.push(task);
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Task added successfully',
        life: 3000
    });
};

const handleDeleteTask = (taskId: string | undefined) => {
    if (!taskId) return;
    
    confirm.require({
        message: 'Are you sure you want to delete this task?',
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            tasks.value = tasks.value.filter(task => task.id !== taskId);
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Task deleted successfully',
                life: 3000
            });
        }
    });
};

const handleCancel = () => {
    emit('update:visible', false);
};

const handleAdd = () => {
    const assignment: Assignment = {
        ...assignmentForm.value,
        tasks: tasks.value
    };
    emit('add', assignment);
    emit('update:visible', false);
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Assignment created successfully',
        life: 3000
    });
};
</script>