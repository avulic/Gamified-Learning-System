<template>

    <div class="space-y-4">
        <Accordion class="assignment-accordion">
            <AccordionTab v-for="assignment in props.assignments" :key="assignment.id">
                <template #header>
                    <div class="flex justify-between items-center w-full">
                        <div>
                            <span class="font-semibold">{{ assignment.title }}</span>
                            <span class="text-sm text-gray-500 ml-2">
                                Due: {{ formatDate(assignment.submissionWindow.end) }}
                            </span>
                        </div>
                        <Badge :value="assignment.tasks?.length || 0" severity="info" />
                    </div>
                </template>
                <div class="p-4">
                    <div class="mb-4" v-html="assignment.description"></div>
                    <div class="mt-4">
                        <div class="flex justify-between items-center mb-3">
                            <h4 class="text-lg font-semibold">Tasks</h4>
                            <Button v-if="isEditable" icon="pi pi-plus" label="Add Task"
                                @click="openTaskDialog(assignment)" class="p-button-outlined p-button-sm" />
                        </div>
                        <DataTable :value="assignment.tasks || []" class="mt-2">
                            <Column field="title" header="Title">
                                <template #body="{ data }">
                                    <div class="font-medium">{{ data.title }}</div>
                                    <div class="text-sm text-gray-500">{{ data.description }}</div>
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
                                    <Button v-if="isEditable" icon="pi pi-trash"
                                        @click="handleDeleteTask(data.id, assignment)"
                                        class="p-button-danger p-button-outlined p-button-sm" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                    <TaskDialog v-model:visible="taskDialog" :new-task="newTask" @add="handleAddTask" />
                </div>
            </AccordionTab>
        </Accordion>
    </div>

</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { Assignment } from '@/types/Assignment';
import { TaskTypeEnum, ProgressTypeEnum, QuestionType } from '@/types/enums';
import TaskDialog from './dialogs/TaskDialog.vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { QuizTask, CodeTask, Task, BaseTask, FileUploadTask, QuestionTask } from '@/types/task/Task';

const props = defineProps<{
    assignments: Assignment[];
    isEditable: boolean;
}>();

const emit = defineEmits<{
    (e: 'update-assignment', assignment: Assignment): void;
}>();


onMounted(() => {

});

const toast = useToast();
const confirm = useConfirm();

interface NewTaskForm extends Partial<BaseTask> {
    assignmentId: string;
    taskType: TaskTypeEnum;
}

const taskDialog = ref(false);
const currentAssignment = ref<Assignment | null>(null);
const newTask = ref<NewTaskForm>({
    assignmentId: '',
    title: '',
    description: '',
    points: 0,
    dueDate: undefined,
    taskType: TaskTypeEnum.QUESTION
});

const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
};

const openTaskDialog = (assignment: Assignment) => {
    currentAssignment.value = assignment;
    newTask.value = {
        assignmentId: assignment.id || '',
        title: '',
        description: '',
        points: 0,
        dueDate: undefined,
        taskType: TaskTypeEnum.QUESTION
    };
    taskDialog.value = true;
};

const createTaskByType = (baseInfo: NewTaskForm): Task => {
    const baseTask = {
        id: crypto.randomUUID(),
        title: baseInfo.title || '',
        description: baseInfo.description || '',
        points: baseInfo.points || 0,
        dueDate: baseInfo.dueDate || new Date(),
        assignmentId: baseInfo.assignmentId,
        status: ProgressTypeEnum.NOT_STARTED,
        order: 0, // Will be set later
        xpReward: baseInfo.points || 0,
        requiredForCompletion: false,
    };
    switch (baseInfo.taskType) {
        case TaskTypeEnum.FILE_UPLOAD: {
            const fileTask: FileUploadTask = {
                ...baseTask,
                taskType: TaskTypeEnum.FILE_UPLOAD,
                content: {
                    allowedFileTypes: [],
                    maxFileSize: 5000000 // 5MB default
                }
            };
            return fileTask;
        }
        case TaskTypeEnum.QUIZ: {
            const quizTask: QuizTask = {
                ...baseTask,
                taskType: TaskTypeEnum.QUIZ,
                content: {
                    questions: [],
                    timeLimit: 0,
                    passingScore: 0,
                    maxAttempts: 1
                }
            };
            return quizTask;
        }
        case TaskTypeEnum.CODE: {
            const codeTask: CodeTask = {
                ...baseTask,
                taskType: TaskTypeEnum.CODE,
                content: {
                    language: 'javascript',
                    testCases: [],
                }
            };
            return codeTask;
        }
        default: {
            const questionTask: QuestionTask = {
                ...baseTask,
                taskType: TaskTypeEnum.QUESTION,
                content: {
                    id: crypto.randomUUID(),
                    question: '',
                    questionType: QuestionType.TEXT,
                    correctAnswer: '',
                }
            };
            return questionTask;
        }
    }
};

const handleAddTask = () => {
    if (!currentAssignment.value) return;
    const task = createTaskByType(newTask.value);
    task.order = (currentAssignment.value.tasks?.length || 0);
    const updatedTasks = [...(currentAssignment.value.tasks || []), task];
    const updatedAssignment: Assignment = {
        ...currentAssignment.value,
        tasks: updatedTasks as Task[]
    };
    emit('update-assignment', updatedAssignment);
    taskDialog.value = false;
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Task added successfully',
        life: 3000
    });
};

const handleDeleteTask = (taskId: string | undefined, assignment: Assignment) => {
    if (!taskId) return;
    confirm.require({
        message: 'Are you sure you want to delete this task?',
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            const filteredTasks = (assignment.tasks || []).filter(task => task.id !== taskId);
            const updatedAssignment: Assignment = {
                ...assignment,
                tasks: filteredTasks
            };
            emit('update-assignment', updatedAssignment);
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Task deleted successfully',
                life: 3000
            });
        }
    });
};
</script>