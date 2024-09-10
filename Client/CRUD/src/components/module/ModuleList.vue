<template>
    <div class="px-4">
        <div class="mb-4">
            <Button label="New course" icon="pi pi-plus" @click="openNewModuleModal" class="p-button-success" />
        </div>

        <DataTable :value="modules" paginator :rows="10" class="p-datatable-gridlines" :filters="filters"
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
            <Column field="order" header="Order" sortable :showFilterMenu="false" filterMatchMode="equals">
                <template #filter="{ filterModel, filterCallback }">
                    <InputNumber v-model="filterModel.value" @input="filterCallback()" class="p-column-filter"
                        placeholder="Search by order" />
                </template>
            </Column>
            <Column field="courseId" header="Course" :showFilterMenu="false" filterMatchMode="equals">
                <template #body="slotProps">
                    {{ getCourseTitle(slotProps.data.courseId) }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" :options="courseOptions" optionLabel="title" optionValue="id"
                        @change="filterCallback()" class="p-column-filter" placeholder="Select a course" />
                </template>
            </Column>
            <Column header="Actions" :filterable="false">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" class="p-button-rounded p-button-success mr-2"
                        @click="editModule(slotProps.data)" />
                    <Button icon="pi pi-trash" class="p-button-rounded p-button-danger"
                        @click="confirmDeleteModule(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="showModal" :style="{ width: 'auto' }" :header="modalTitle" :modal="true"
            class="p-fluid">
            <Details :currentModule="selectedModule" @onSaveModule="saveModule" @onDeleteModule="deleteModule">
            </Details>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Details from '@/components/module/Details.vue';
import type Module from '@/types/Module';
import type Course from '@/types/Course';
import ModuleService from '@/services/ModuleService';
import CourseService from '@/services/CourseService';

const toast = useToast();
const confirm = useConfirm();

const modules = ref<Module[]>([]);
const courses = ref<Course[]>([]);
const showModal = ref(false);
const selectedModule = ref<Module | null>(null);

const modalTitle = computed(() => selectedModule.value ? 'Edit Module' : 'New Module');

const filters = reactive({
    global: { value: null, matchMode: 'contains' },
    title: { value: null, matchMode: 'contains' },
    description: { value: null, matchMode: 'contains' },
    order: { value: null, matchMode: 'equals' },
    courseId: { value: null, matchMode: 'equals' },
});

const courseOptions = computed(() => {
    return courses.value.map(course => ({ title: course.title, id: course.id }));
});

onMounted(async () => {
    try {
        modules.value = await ModuleService.getAllModules();
        courses.value = await CourseService.getAllCourses();
    } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data', life: 3000 });
    }
});

const getCourseTitle = (courseId: string) => {
    const course = courses.value.find(c => c.id === courseId);
    return course ? course.title : 'Unknown Course';
};

const openNewModuleModal = () => {
    selectedModule.value = null;
    showModal.value = true;
};

const editModule = (module: Module) => {
    selectedModule.value = { ...module };
    showModal.value = true;
};

const closeModal = () => {
    showModal.value = false;
    selectedModule.value = null;
};

const saveModule = async (module: Module) => {
    try {
        if (module.id) {
            await ModuleService.updateModule(module.id, module);
            const index = modules.value.findIndex(m => m.id === module.id);
            if (index !== -1) {
                modules.value[index] = module;
            }
            toast.add({ severity: 'success', summary: 'Success', detail: 'Module updated', life: 3000 });
        } else {
            const newModule = await ModuleService.createModule(module);
            modules.value.push(newModule);
            toast.add({ severity: 'success', summary: 'Success', detail: 'Module created', life: 3000 });
        }
        closeModal();
    } catch (error) {
        console.error('Failed to save module:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save module', life: 3000 });
    }
};

const deleteModule = async (moduleId: string) => {
    try {
        await ModuleService.deleteModule(moduleId);
        modules.value = modules.value.filter(module => module.id !== moduleId);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Module deleted', life: 3000 });
    } catch (error) {
        console.error('Failed to delete module:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete module', life: 3000 });
    }
};

const confirmDeleteModule = (moduleId: string) => {
    confirm.require({
        message: 'Are you sure you want to delete this module?',
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteModule(moduleId),
        reject: () => {
            toast.add({ severity: 'info', summary: 'Cancelled', detail: 'Module deletion cancelled', life: 3000 });
        }
    });
};
</script>