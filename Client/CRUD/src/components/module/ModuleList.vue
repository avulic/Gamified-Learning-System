<template>
    <div class="px-4">
        <div class="flex justify-between items-center mb-4">
            <Button label="New Module" icon="pi pi-plus" @click="openNewModuleModal" 
                class="p-button-success" />
            
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Search..." />
            </span>
        </div>

        <DataTable :value="modules" 
            v-model:filters="filters"
            paginator 
            :rows="10" 
            :rowsPerPageOptions="[5,10,20]"
            filterDisplay="menu"
            :loading="loading"
            dataKey="id"
            :globalFilterFields="['title', 'description']"
            class="p-datatable-gridlines">
            
            <Column field="title" header="Title" sortable style="min-width: 12rem">
                <template #body="{ data }">
                    <div class="flex align-items-center gap-2">
                        <span>{{ data.title }}</span>
                    </div>
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" 
                        @input="filterCallback()" 
                        class="p-inputtext-sm w-full"
                        placeholder="Search by title" />
                </template>
            </Column>

            <Column field="description" header="Description" sortable style="min-width: 16rem">
                <template #body="{ data }">
                    <div class="line-clamp-2">{{ data.description }}</div>
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <InputText v-model="filterModel.value" 
                        @input="filterCallback()" 
                        class="p-inputtext-sm w-full"
                        placeholder="Search by description" />
                </template>
            </Column>

            <Column field="order" header="Order" sortable style="min-width: 8rem">
                <template #filter="{ filterModel, filterCallback }">
                    <InputNumber v-model="filterModel.value" 
                        @input="filterCallback()" 
                        class="p-inputtext-sm w-full"
                        placeholder="Order" />
                </template>
            </Column>

            <Column field="courseId" header="Course" style="min-width: 12rem">
                <template #body="{ data }">
                    {{ getCourseTitle(data.courseId) }}
                </template>
                <template #filter="{ filterModel, filterCallback }">
                    <Dropdown v-model="filterModel.value" 
                        :options="courseOptions" 
                        optionLabel="title"
                        optionValue="id"
                        class="p-inputtext-sm w-full"
                        @change="filterCallback()" 
                        placeholder="Select Course">
                        <template #value="slotProps">
                            {{ slotProps.value ? getCourseTitle(slotProps.value) : 'Select Course' }}
                        </template>
                        <template #option="slotProps">
                            {{ slotProps.option.title }}
                        </template>
                    </Dropdown>
                </template>
            </Column>

            <Column field="estimatedDuration" header="Duration" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    {{ data.estimatedDuration }} min
                </template>
            </Column>

            <Column field="difficulty" header="Difficulty" sortable style="min-width: 8rem">
                <template #body="{ data }">
                    <Rating :modelValue="data.difficulty" :readonly="true" :cancel="false" />
                </template>
            </Column>

            <Column header="Actions" :exportable="false" style="min-width: 12rem">
                <template #body="{ data }">
                    <div class="flex gap-2 justify-center">
                        <Button icon="pi pi-pencil" 
                            @click="editModule(data)"
                            class="p-button-rounded p-button-success p-button-sm" 
                            tooltip="Edit" />
                        <Button icon="pi pi-trash" 
                            @click="confirmDeleteModule(data.id)"
                            class="p-button-rounded p-button-danger p-button-sm" 
                            tooltip="Delete" />
                        <Button icon="pi pi-list" 
                            @click="viewLessons(data)"
                            class="p-button-rounded p-button-info p-button-sm" 
                            tooltip="View Lessons" />
                    </div>
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="showModal" 
            :style="{ width: '80vw' }" 
            :header="modalTitle" 
            :modal="true"
            :closable="false"
            class="p-fluid">
            <Details 
                :currentModule="selectedModule"
                :availableModules="modules"
                @save="saveModule"
                @cancel="closeModal"
                @editLesson="handleEditLesson"
                @deleteLesson="handleDeleteLesson" />
        </Dialog>

        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from 'primevue/api';
import Details from './Details.vue';
import type { Module } from '@/types/Module';
import type { Course } from '@/types/Course';
import type { Lesson } from '@/types/Lesson';
import ModuleService from '@/services/ModuleService';
import CourseService from '@/services/CourseService';

// Props & Emits
const emit = defineEmits<{
    editLesson: [module: Module, lesson: Lesson];
    deleteLesson: [moduleId: string, lessonId: string];
}>();

// Services would be imported and used here
// const ModuleService = ...
// const CourseService = ...

// State
const modules = ref<Module[]>([]);
const courses = ref<Course[]>([]);
const showModal = ref(false);
const selectedModule = ref<Module | null>(null);
const loading = ref(false);

// Computed
const modalTitle = computed(() => selectedModule.value ? 'Edit Module' : 'New Module');

const courseOptions = computed(() => {
    return courses.value.map(course => ({
        title: course.title,
        id: course.id
    }));
});

// Filters
const filters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    description: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order: { value: null, matchMode: FilterMatchMode.EQUALS },
    courseId: { value: null, matchMode: FilterMatchMode.EQUALS },
    difficulty: { value: null, matchMode: FilterMatchMode.EQUALS }
});

// Toast & Confirm Dialog
const toast = useToast();
const confirm = useConfirm();

// Methods
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

const viewLessons = (module: Module) => {
    // Implement lesson viewing logic or navigation
    console.log('View lessons for module:', module.id);
};

const saveModule = async (module: Module) => {
    try {
        loading.value = true;
        if (module.id) {
            await ModuleService.updateModule(module.id, module);
            const index = modules.value.findIndex(m => m.id === module.id);
            if (index !== -1) {
                modules.value[index] = module;
            }
            toast.add({ severity: 'success', summary: 'Success', detail: 'Module updated' });
        } else {
            const newModule = await ModuleService.createModule(module);
            modules.value.push(newModule);
            toast.add({ severity: 'success', summary: 'Success', detail: 'Module created' });
        }
        closeModal();
    } catch (error) {
        console.error('Failed to save module:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save module' });
    } finally {
        loading.value = false;
    }
};

const deleteModule = async (moduleId: string) => {
    try {
        loading.value = true;
        await ModuleService.deleteModule(moduleId);
        modules.value = modules.value.filter(module => module.id !== moduleId);
        toast.add({ severity: 'success', summary: 'Success', detail: 'Module deleted' });
    } catch (error) {
        console.error('Failed to delete module:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete module' });
    } finally {
        loading.value = false;
    }
};

const confirmDeleteModule = (moduleId: string) => {
    confirm.require({
        message: 'Are you sure you want to delete this module?',
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteModule(moduleId),
        reject: () => {
            toast.add({ severity: 'info', summary: 'Cancelled', detail: 'Deletion cancelled' });
        }
    });
};

const handleEditLesson = (lesson: Lesson) => {
    if (selectedModule.value) {
        emit('editLesson', selectedModule.value, lesson);
    }
};

const handleDeleteLesson = (lessonId: string) => {
    if (selectedModule.value) {
        emit('deleteLesson', selectedModule.value.id!, lessonId);
    }
};

// Lifecycle
onMounted(async () => {
    try {
        loading.value = true;
        const [moduleData, courseData] = await Promise.all([
            ModuleService.getAllModules(),
            CourseService.getAllCourses()
        ]);
        modules.value = moduleData;
        courses.value = courseData;
    } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch data' });
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
:deep(.p-rating .p-rating-item.p-rating-item-active .p-rating-icon) {
    color: var(--primary-color);
}

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