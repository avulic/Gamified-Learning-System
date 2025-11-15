<template>
    <div class="px-4">
        <div class="flex justify-between items-center mb-4">
            <Button label="New Quiz" icon="pi pi-plus" @click="openNewQuizModal" class="p-button-success" />

            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Search..." />
            </span>
        </div>

        <DataTable :value="quizzes" v-model:filters="filters" paginator :rows="10" :rowsPerPageOptions="[5, 10, 20]"
            filterDisplay="menu" :loading="loading" dataKey="id" :globalFilterFields="['title', 'description']"
            class="p-datatable-gridlines">

            <Column field="title" header="Title" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <div class="flex align-items-center gap-2">
                        <span>{{ data.title }}</span>
                    </div>
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" class="p-inputtext-sm w-full"
                        placeholder="Search by title" />
                </template>
            </Column>

            <Column field="description" header="Description" sortable style="min-width: 16rem">
                <template #body="{ data }">
                    <div class="line-clamp-2">{{ data.description }}</div>
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" class="p-inputtext-sm w-full"
                        placeholder="Search by description" />
                </template>
            </Column>

            <Column field="assignmentId" header="Assignment" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ getAssignmentTitle(data.assignmentId) }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" :options="assignmentOptions" optionLabel="title"
                        optionValue="id" class="p-inputtext-sm w-full" @change="filterCallback()"
                        placeholder="Select Assignment">
                        <template #value="slotProps">
                            {{ slotProps.value ? getAssignmentTitle(slotProps.value) : 'Select Assignment' }}
                        </template>
                    </Dropdown>
                </template>
            </Column>

            <Column field="content.questions" header="Questions" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    {{ (data.content?.questions?.length || 0) }} questions
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputNumber v-model="filterModel.value" @input="filterCallback()" class="p-inputtext-sm w-full"
                        placeholder="Min questions" />
                </template>
            </Column>

            <Column field="content.timeLimit" header="Time Limit" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    {{ data.content?.timeLimit || 'No limit' }} min
                </template>
            </Column>

            <Column field="points" header="Points" sortable style="min-width: 8rem">
                <template #filter="{ filterModel, filterCallback }">
                    <InputNumber v-model="filterModel.value" @input="filterCallback()" class="p-inputtext-sm w-full"
                        placeholder="Min points" />
                </template>
            </Column>

            <Column header="Actions" :exportable="false" style="min-width: 12rem">
                <template #body="{ data }">
                    <div class="flex gap-2 justify-center">
                        <Button icon="pi pi-pencil" @click="editQuiz(data)"
                            class="p-button-rounded p-button-success p-button-sm" tooltip="Edit" />
                        <Button icon="pi pi-trash" @click="" class="p-button-rounded p-button-danger p-button-sm"
                            tooltip="Delete" />
                        <Button icon="pi pi-eye" @click="previewQuiz(data)"
                            class="p-button-rounded p-button-info p-button-sm" tooltip="Preview" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="showModal" :style="{ width: '90vw' }" :header="modalTitle" :modal="true"
            :closable="false" class="p-fluid">
            <QuizDetails :quiz="selectedQuiz" :assignments="assignments" @save="" @cancel="closeModal" />
        </Dialog>

        <Dialog v-model:visible="previewModal" :style="{ width: '80vw' }" header="Quiz Preview" :modal="true">
            <QuizPreview v-if="selectedQuiz" :quiz="selectedQuiz" />
        </Dialog>

        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from 'primevue/api';
import type { Assignment } from '@/types/Assignment';
import { TaskTypeEnum, ProgressTypeEnum } from '@/types/enums';
import { QuizTask } from '@/types/task/Task';
//import QuizService from '@/services/QuizService';
import AssignmentService from '@/services/AssignmentService';

// State
const quizzes = ref<QuizTask[]>([]);
const assignments = ref<Assignment[]>([]);
const showModal = ref(false);
const previewModal = ref(false);
const selectedQuiz = ref<QuizTask | null>(null);
const loading = ref(false);

// Services would be imported and used here
// const QuizService = ...
// const AssignmentService = ...

// Toast & Confirm
const toast = useToast();
const confirm = useConfirm();

// Computed
const modalTitle = computed(() => selectedQuiz.value ? 'Edit Quiz' : 'New Quiz');

const assignmentOptions = computed(() => {
    return assignments.value.map(assignment => ({
        title: assignment.title,
        id: assignment.id
    }));
});

// Filters
const filters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
    assignmentId: { value: null, matchMode: FilterMatchMode.EQUALS },
    'content.questions': { value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO },
    points: { value: null, matchMode: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO }
});

// Methods
function getAssignmentTitle(assignmentId: string) {
    const assignment = assignments.value.find(a => a.id === assignmentId);
    return assignment ? assignment.title : 'Unknown Assignment';
}

function openNewQuizModal() {
    selectedQuiz.value = createEmptyQuiz();
    showModal.value = true;
}

function createEmptyQuiz(): QuizTask {
    return {
        id: '',
        title: '',
        description: '',
        taskType: TaskTypeEnum.QUIZ,
        status: ProgressTypeEnum.NOT_STARTED,
        points: 0,
        order: 0,
        xpReward: 0,
        requiredForCompletion: true,
        dueDate: new Date(),
        assignmentId: '',
        content: {
            questions: [],
            timeLimit: 30,
            passingScore: 70,
            maxAttempts: 1
        }
    };
}

function editQuiz(quiz: QuizTask) {
    selectedQuiz.value = { ...quiz };
    showModal.value = true;
}

function previewQuiz(quiz: QuizTask) {
    selectedQuiz.value = quiz;
    previewModal.value = true;
}

function closeModal() {
    showModal.value = false;
    previewModal.value = false;
    selectedQuiz.value = null;
}

// async function saveQuiz(quiz: QuizTask) {
//     try {
//         loading.value = true;
//         if (quiz.id) {
//             await QuizService.updateQuiz(quiz.id, quiz);
//             const index = quizzes.value.findIndex(q => q.id === quiz.id);
//             if (index !== -1) {
//                 quizzes.value[index] = quiz;
//             }
//             toast.add({ severity: 'success', summary: 'Success', detail: 'Quiz updated' });
//         } else {
//             const newQuiz = await QuizService.createQuiz(quiz);
//             quizzes.value.push(newQuiz);
//             toast.add({ severity: 'success', summary: 'Success', detail: 'Quiz created' });
//         }
//         closeModal();
//     } catch (error) {
//         console.error('Failed to save quiz:', error);
//         toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save quiz' });
//     } finally {
//         loading.value = false;
//     }
// }

// async function deleteQuiz(quizId: string) {
//     try {
//         loading.value = true;
//         await QuizService.deleteQuiz(quizId);
//         quizzes.value = quizzes.value.filter(quiz => quiz.id !== quizId);
//         toast.add({ severity: 'success', summary: 'Success', detail: 'Quiz deleted' });
//     } catch (error) {
//         console.error('Failed to delete quiz:', error);
//         toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete quiz' });
//     } finally {
//         loading.value = false;
//     }
// }

// function confirmDeleteQuiz(quizId: string) {
//     confirm.require({
//         message: 'Are you sure you want to delete this quiz?',
//         header: 'Confirm Deletion',
//         icon: 'pi pi-exclamation-triangle',
//         accept: () => deleteQuiz(quizId),
//         reject: () => {
//             toast.add({ severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled' });
//         }
//     });
// }

// // Lifecycle
// onMounted(async () => {
//     try {
//         loading.value = true;
//         const [quizData, assignmentData] = await Promise.all([
//             QuizService.getAllQuizzes(),
//             AssignmentService.getAllAssignments()
//         ]);
//         quizzes.value = quizData;
//         assignments.value = assignmentData;
//     } catch (error) {
//         console.error('Failed to fetch data:', error);
//         toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data' });
//     } finally {
//         loading.value = false;
//     }
// });
</script>

<style scoped>
:deep(.p-datatable .p-datatable-header) {
    background: transparent;
    border: none;
    padding: 0;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>