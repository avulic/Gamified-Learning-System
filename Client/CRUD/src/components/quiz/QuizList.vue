<template>
    <div class="px-4">
        <div class="mb-4">
            <Button label="New course" icon="pi pi-plus" @click="openNewQuizModal" class="p-button-succes"></Button>
        </div>

        <DataTable :value="quizzes" paginator :rows="10" class="p-datatable-gridlines" :filters="filters"
            filterDisplay="row">
            <Column field="title" header="Title" sortable :showFilterMenu="false" filterMatchMode="contains">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" class="p-column-filter"
                        placeholder="Search by title" />
                </template>
            </Column>
            <Column field="description" header="Description" sortable :showFilterMenu="false"
                filterMatchMode="contains">
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" @input="filterCallback()" class="p-column-filter"
                        placeholder="Search by description" />
                </template>
            </Column>
            <Column field="moduleId" header="Module" :showFilterMenu="false" filterMatchMode="equals">
                <template #body="slotProps">
                    {{ getModuleTitle(slotProps.data.moduleId) }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" :options="moduleOptions" optionLabel="title" optionValue="id"
                        @change="filterCallback()" class="p-column-filter" placeholder="Select a module" />
                </template>
            </Column>
            <Column field="questions" header="Questions" :body="questionsTemplate">
                <template #filter="{ filterModel, filterCallback }">
                    <InputNumber v-model="filterModel.value" @input="filterCallback()" class="p-column-filter"
                        placeholder="Min questions" />
                </template>
            </Column>
            <Column field="xpReward" header="XP Reward" sortable>
                <template #filter="{ filterModel, filterCallback }">
                    <InputNumber v-model="filterModel.value" @input="filterCallback()" class="p-column-filter"
                        placeholder="Min XP" />
                </template>
            </Column>
            <Column header="Actions" :body="actionsTemplate" :filterable="false" />
        </DataTable>

        <Dialog v-model:visible="showModal" :style="{ width: 'auto' }" header="User Details" :modal="true"
            class="p-fluid">
            <Details :modules="[{}]" :currentQuiz="null" @onSaveQuiz="saveQuiz" @onDeleteQuiz="saveQuiz"
                @onEditQuiz="saveQuiz">
            </Details>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>

    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';

import Details from '@/components/quiz/Details.vue';
import type Quiz from '@/types/quiz/Quiz';
import type Module from '@/types/Module';
import QuizService from '@/services/QuizService';
import ModuleService from '@/services/ModuleService';

const quizzes = ref<Quiz[]>([]);
const modules = ref<Module[]>([]);
const showModal = ref(false);
const selectedQuiz = ref<Quiz | null>(null);

const filters = reactive({
    global: { value: null, matchMode: 'contains' },
    title: { value: null, matchMode: 'contains' },
    description: { value: null, matchMode: 'contains' },
    moduleId: { value: null, matchMode: 'equals' },
    questions: { value: null, matchMode: 'gte' },
    xpReward: { value: null, matchMode: 'gte' },
});

const moduleOptions = computed(() => {
    return modules.value.map(module => ({ title: module.title, id: module.id }));
});

onMounted(async () => {
    try {
        quizzes.value = await QuizService.getAllQuizzes();
        modules.value = await ModuleService.getAllModules();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        // Handle error (e.g., show error message to user)
    }
});

const getModuleTitle = (moduleId: string) => {
    const module = modules.value.find(m => m.id === moduleId);
    return module ? module.title : 'Unknown Module';
};

const questionsTemplate = (slotProps: { data: Quiz }) => {
    return slotProps.data.questions.length.toString();
};

const actionsTemplate = (slotProps: { data: Quiz }) => {
    return `
        <div class="flex space-x-2">
            <Button label="Edit" icon="pi pi-pencil" class="p-button-rounded p-button-warning" @click="editQuiz(${JSON.stringify(slotProps.data)})" />
            <Button label="Delete" icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="deleteQuiz('${slotProps.data.id}')" />
        </div>
    `;
};

const openNewQuizModal = () => {
    selectedQuiz.value = null;
    showModal.value = true;
};

const editQuiz = (quiz: Quiz) => {
    selectedQuiz.value = { ...quiz };
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
};

const saveQuiz = async (quiz: Quiz) => {
    try {
        if (quiz.id) {
            await QuizService.updateQuiz(quiz.id, quiz);
            const index = quizzes.value.findIndex(q => q.id === quiz.id);
            if (index !== -1) {
                quizzes.value[index] = quiz;
            }
        } else {
            const newQuiz = await QuizService.createQuiz(quiz);
            quizzes.value.push(newQuiz);
        }
        closeModal();
    } catch (error) {
        console.error('Failed to save quiz:', error);
        // Handle error (e.g., show error message to user)
    }
};

const deleteQuiz = async (quizId: string) => {
    try {
        await QuizService.deleteQuiz(quizId);
        quizzes.value = quizzes.value.filter(quiz => quiz.id !== quizId);
    } catch (error) {
        console.error('Failed to delete quiz:', error);
        // Handle error (e.g., show error message to user)
    }
};
</script>@/services/QuizService