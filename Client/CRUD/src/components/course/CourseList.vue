<template>
    <div class="px-4">
        <Toolbar class="mb-4">
            <template #start>
                <Button label="New" icon="pi pi-plus" severity="success" class="mr-2" @click="openNew" />
                <!-- <Button label="Delete" icon="pi pi-trash" severity="danger" @click="confirmDeleteSelected"
                    :disabled="!selectedProducts || !selectedProducts.length" /> -->
            </template>

            <template #end>
                <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" chooseLabel="Import"
                    class="mr-2 inline-block" />
                <Button label="Export" icon="pi pi-upload" severity="help" @click="" />
            </template>
        </Toolbar>

        <DataTable :value="courses" dataKey="id" :paginator="true" :rows="10" :filters="filters" :loading="loading"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            :rowsPerPageOptions="[5, 10, 25]"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
            <template #header>
                <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                    <h4 class="m-0">Manage Courses</h4>
                    <IconField iconPosition="left">
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="filters['global'].value" placeholder="Search..." />
                    </IconField>
                </div>
            </template>

            <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
            <Column field="title" header="title" sortable style="min-width:16rem"></Column>
            <Column field="description" header="description" sortable style="min-width:8rem"></Column>
            <Column field="instructors" header="instructors" sortable style="min-width:12rem">
                <template #body="slotProps">
                    {{ instructorsTemplate(slotProps) }}
                </template>
                <template #filter="{ filterModel }">
                    <Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy"
                        mask="99/99/9999" />
                </template>
            </Column>
            <Column field="startDate" header="Start" sortable filterField="date" dataType="date"
                style="min-width: 10rem">
                <template #body="{ data }">
                    {{ data.startDate }}
                </template>
                <template #filter="{ filterModel }">
                    <Calendar v-model="filterModel.value" dateFormat="mm/dd/yy" placeholder="mm/dd/yyyy"
                        mask="99/99/9999" />
                </template>
            </Column>
            <Column :exportable="false" style="min-width:8rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="editProduct(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger"
                        @click="confirmDeleteCourse(slotProps.data)" />
                </template>
            </Column>
        </DataTable>
    </div>


    <Dialog v-model:visible="showModal" :style="{ width: 'auto' }" header="Course Details" :modal="true" class="p-fluid">
        <!-- <Details :editable-course="selectedCourse" @onSaveCourse="saveCourse" @onDeleteCourse="deleteCourse"
            @onEditCourse="saveCourse">
        </Details> -->
        <Details :course="selectedCourse" @onSaveCourse="saveCourse" @onDeleteCourse="deleteCourse"
            @onEditCourse="saveCourse" :isEditable="true">
        </Details>
    </Dialog>




</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import type { Course } from '@/types/Course';
import CourseService from '@/services/CourseService';
//import Details from '@/components/course/Details.vue'
import Details from '@/components/course/CourseDetailsProfesor.vue'
import { FilterMatchMode } from 'primevue/api';
import { useRoleAccess } from '@/composables/useRoleAccess'
import { useCourseManagement } from '@/composables/useCourseManagement';

const toast = useToast();
const confirm = useConfirm();

const props = defineProps<{
    instructorId?: string
}>()

const { isProfessor, currentUser } = useRoleAccess()
const { courses, loading, error, loadCourses } = useCourseManagement(props.instructorId)


const showModal = ref(false);
const selectedCourse = ref<Course | null>(null);

var isImportSelected = ref(true);
var isNewCourseSelected = ref(false);


const modalTitle = computed(() => selectedCourse.value ? 'Edit Course' : 'New Course');


const filters = ref({
    'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
});


onMounted(async () => {
    await loadCourses();
});

const openNew = () => {
    selectedCourse.value = {} as Course;

    //submitted.value = false;
    showModal.value = true;
};

const hideDialog = () => {
    showModal.value = false;
    //submitted.value = false;
};

const formatDate = (value: Date) => {
    return value.toLocaleDateString('en-Eu', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const instructorsTemplate = (slotProps: { data: Course }) => {
    return slotProps.data.instructors.map(instructor => instructor.name).join(', ');
};

const dateTemplate = (slotProps: { data: Course, field: keyof Course }) => {
    const date = slotProps.data[slotProps.field] as Date;
    return date ? new Date(date).toLocaleDateString() : '';
};

const publishedTemplate = (slotProps: { data: Course }) => {
    return slotProps.data.isPublished ? 'Yes' : 'No';
};

const editProduct = async (prod: Course) => {
    try {
        loading.value = true;
        
        const courseSelectedDetails = await CourseService.getCourseDetailsById(prod.id);
        selectedCourse.value = courseSelectedDetails

        showModal.value = true;
    } catch (error) {
        console.error('Error fetching course details:', error);
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load course details', life: 3000 });
    } finally {
        loading.value = false;
    }
};

const closeModal = () => {
    showModal.value = false;
}



const saveCourse = async (course: Course) => {
    try {
        if (course.id) {

            await CourseService.updateCourse(course.id, course);

        } else {
            const newCourse = await CourseService.createCourse(course);
            courses.value.push(newCourse);
        }
        closeModal();
    } catch (error) {
        console.error('Failed to save course:', error);
        // Handle error (e.g., show error message to user)
    }
};

const deleteCourse = async (courseId: string) => {
    try {
        await CourseService.deleteCourse(courseId);
        courses.value = courses.value.filter(course => course.id !== courseId);
    } catch (error) {
        console.error('Failed to delete course:', error);
        // Handle error (e.g., show error message to user)
    }
};

const confirmDeleteCourse = (courseId: string) => {
    confirm.require({
        message: 'Are you sure you want to delete this module?',
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteCourse(courseId),
        reject: () => {
            toast.add({ severity: 'info', summary: 'Cancelled', detail: 'Module deletion cancelled', life: 3000 });
        }
    });
};
</script>