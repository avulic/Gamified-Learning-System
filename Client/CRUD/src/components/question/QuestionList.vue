<template>
    <div class="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div class="flex justify-between mb-4">
            <Button label="New Question" icon="pi pi-plus" @click="showModal = true" class="p-button-success" />
            <InputText v-model="searchTerm" placeholder="Search questions" class="p-inputtext-sm" />
        </div>

        <DataTable :value="filteredQuestions" :paginator="true" :rows="10"
            paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            :rowsPerPageOptions="[10, 20, 50]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} questions" responsiveLayout="scroll">
            <Column field="text" header="Question" :sortable="true">
                <template #body="slotProps">
                    <div class="truncate max-w-md">{{ slotProps.data.text }}</div>
                </template>
            </Column>
            <Column field="type" header="Type" :sortable="true" />
            <Column field="points" header="Points" :sortable="true" />
            <Column header="Actions">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" @click="editQuestion(slotProps.data)"
                        class="p-button-rounded p-button-success mr-2" />
                    <Button icon="pi pi-trash" @click="deleteQuestion(slotProps.data.id)"
                        class="p-button-rounded p-button-danger" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="showModal" :style="{ width: '50vw' }" header="Question Details" :modal="true">
            <QuestionDetails :question="selectedQuestion" @save="saveQuestion" @cancel="closeModal" />
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import QuestionDetails from './QuestionDetails.vue';
import type Question from '@/types/task/question/Question';
import QuestionService from '@/services/QuestionService';

const toast = useToast();
const questions = ref<Question[]>([]);
const searchTerm = ref('');
const showModal = ref(false);
const selectedQuestion = ref<Question | null>(null);

const filteredQuestions = computed(() => {
    if (!searchTerm.value) return questions.value;
    return questions.value.filter(q =>
        q.text.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        q.type.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
});

async function loadQuestions() {
    try {
        questions.value = await QuestionService.getAllQuestions();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load questions', life: 3000 });
    }
}

function editQuestion(question: Question) {
    selectedQuestion.value = { ...question };
    showModal.value = true;
}

async function saveQuestion(question: Question) {
    try {
        if (question.id) {
            await QuestionService.updateQuestion(question.id, question);
            toast.add({ severity: 'success', summary: 'Success', detail: 'Question updated', life: 3000 });
        } else {
            await QuestionService.createQuestion(question);
            toast.add({ severity: 'success', summary: 'Success', detail: 'Question created', life: 3000 });
        }
        await loadQuestions();
        closeModal();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save question', life: 3000 });
    }
}

async function deleteQuestion(id: string) {
    try {
        await QuestionService.deleteQuestion(id);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Question deleted', life: 3000 });
        await loadQuestions();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete question', life: 3000 });
    }
}

function closeModal() {
    showModal.value = false;
    selectedQuestion.value = null;
}

loadQuestions();
</script>