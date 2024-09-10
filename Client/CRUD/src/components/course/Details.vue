<template>
    <div class="p-4 bg-gray-200">
        <div v-if="showEdit" class=" top-0 left-0 mt-4 ml-4">
            <div class="flex px-3 mb-6 md:mb-0">
                <InputSwitch name="edit" v-model="isEditing" class="" />
                <div class="ml-2" for="edit">Edit user</div>
            </div>
        </div>
        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, values }">
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-1/2 px-3">
                        <Field name="title" v-model="editableCourse.title" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <label for="title">Course Title</label>
                                <InputText id="title" v-model="editableCourse.title" v-bind="field" type="text"
                                    :class="{ 'p-invalid': errorMessage }" class="md:w-full" :disabled="!isEditing" />
                            </span>
                            <ErrorMessage name="title" class="text-red-600 text-xs italic" />
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="description" v-model="editableCourse.description" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <label for="description">Description</label>

                                <Textarea id="description" v-model="editableCourse.description" v-bind="field"
                                    :class="{ 'p-invalid': errorMessage }" class="md:w-full" :disabled="!isEditing" />
                            </span>
                            <ErrorMessage name="description" class="text-red-600 text-xs italic" />
                        </Field>
                    </div>
                </div>
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-full px-3">
                        <Field name="instructors" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <MultiSelect v-model="editableCourse.instructors" display="chip"
                                    :options="instructorOptions" optionLabel="name" valueLabel="id"
                                    placeholder="Select Cities" :maxSelectedLabels="3" class="w-full md:w-20rem"
                                    :disabled="!isEditing" />
                                <label for="instructors">Instructors</label>
                            </span>
                            <ErrorMessage name="instructors" class="text-red-600 text-xs italic" />
                        </Field>
                    </div>
                </div>
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-1/2 px-3">
                        <Field name="startDate" v-model="editableCourse.startDate" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <label for="startDate">Start Date</label>

                                <Calendar id="startDate" v-model="editableCourse.startDate" v-bind="field"
                                    :class="{ 'p-invalid': errorMessage }" :disabled="!isEditing" />
                            </span>
                            <ErrorMessage name="startDate" class="text-red-600 text-xs italic" />
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="endDate" v-model="editableCourse.endDate" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <label for="endDate">End Date</label>

                                <Calendar id="endDate" v-model="editableCourse.endDate" v-bind="field"
                                    :class="{ 'p-invalid': errorMessage }" :disabled="!isEditing" />
                            </span>
                            <ErrorMessage name="endDate" class="text-red-600 text-xs italic" />
                        </Field>
                    </div>
                </div>
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-1/2 px-3">
                        <Field name="tags" v-model="editableCourse.tags" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <label for="tags">Tags</label>

                                <Chips id="tags" v-model="editableCourse.tags" :class="{ 'p-invalid': errorMessage }"
                                    :disabled="!isEditing" />
                            </span>
                            <ErrorMessage name="tags" class="text-red-600 text-xs italic" />
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="category" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <label for="category">Categories</label>
                                <MultiSelect v-model="editableCourse.categories" :options="categoryOptions"
                                    optionLabel="name" optionValue="id" :showClear="true" :filter="true"
                                    placeholder="Select Categories" :maxSelectedLabels="3" class="w-full md:w-20rem"
                                    :disabled="!isEditing" @change="handleCategoryChange" />
                                <label for="category">Instructors</label>
                            </span>
                            <ErrorMessage name="category" class="text-red-600 text-xs italic" />
                        </Field>
                    </div>
                </div>
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-1/2 px-3">
                        <Field name="xpReward" v-model="editableCourse.xpReward" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <label for="xpReward">XP Reward</label>
                                <InputNumber id="xpReward" v-model="editableCourse.xpReward"
                                    :class="{ 'p-invalid': errorMessage }" :disabled="!isEditing" />
                            </span>
                            <ErrorMessage name="xpReward" class="text-red-600 text-xs italic" />
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="isPublished" v-model="editableCourse.isPublished" type="checkbox"
                            v-slot="{ field }">
                            <div class="flex items-center">
                                <Checkbox id="isPublished" v-model="editableCourse.isPublished" v-bind="field" binary
                                    :disabled="!isEditing" />
                                <label for="isPublished" class="ml-2">Is Published</label>
                            </div>
                        </Field>
                    </div>
                </div>
            </div>
            <div>
                <Button label="Save" type="submit" :disabled="!isEditing" />
                <Button label="Delete" type="button" @click="deleteCourse" class="p-button-danger"
                    :disabled="!isEditing" />
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue';
import { useForm, Field, Form, SubmissionHandler, ErrorMessage } from 'vee-validate';
import { array, boolean, date, number, object, string } from "yup";

import type Course from '@/types/Course';
import type UserDetails from '@/types/User/UserDetails';
import CourseService from '@/services/CourseService';
import UserService from '@/services/UserService';

import { RoleEnum } from '@/types/Role'
import User from '@/types/User/User';
const props = defineProps<{
    editableCourse: Course | null;
}>();


const emit = defineEmits<{
    onSaveCourse: [editableCourse: Course];
    onEditCourse: [editableCourse: Course];
    onDeleteCourse: [courseId: string];
}>();

const showEdit = ref(false);
const isEditing = ref(false);
const instructorOptions = ref<{ id: string; name: string }[]>([]);

const editableCourse = ref<Course>({
    id: "",
    title: "",
    description: "",
    instructors: [],
    enrolledStudents: [],
    modules: [],
    startDate: new Date(),
    endDate: new Date(),
    isPublished: false,
    tags: [],
    categories: [],
    xpReward: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
});

const categoryOptions = ref([
    { id: '1', name: 'Category 1' },
    { id: '2', name: 'Category 2' },
]);

const handleCategoryChange = (event: { value: string[] | null }) => {
    if (event.value === null || event.value.length === 0) {
        editableCourse.value.categories = [];
    } else {
        editableCourse.value.categories = event.value;
    }
};

const handleInstructorChange = (event: any, handleChange: (value: any) => void) => {
    // Extract the array of instructor IDs from the event
    const selectedInstructors = Array.isArray(event.value) ? event.value : [];

    // Update the form field
    handleChange(selectedInstructors);

    // Update the editableCourse ref
    editableCourse.value.instructors = selectedInstructors;
};

const schema = object({
    title: string().required('Course title is required'),
    description: string().required('Course description is required'),
    instructors: array().of(string()).min(1, 'At least one instructor is required'),
    category: array().of(string()),
    xpReward: number().positive('XP Reward must be positive').required('XP Reward is required'),
    isPublished: boolean(),
});

onMounted(async () => {
    try {
        const instructors = await UserService.getUsersByRoles([RoleEnum.Professor]);
        instructorOptions.value = instructors.map(instructor => ({
            id: instructor.id, name: `${instructor.name}`
        }));
    } catch (error) {
        console.error('Failed to fetch instructors:', error);
    }
});


watchEffect(() => {
    if (props.editableCourse) {
        editableCourse.value = { ...props.editableCourse, categories: props.editableCourse.categories || [], instructors: props.editableCourse.instructors || [], };

        showEdit.value = true;
        isEditing.value = false;
    } else {
        editableCourse.value = {
            id: "",
            title: "",
            description: "",
            instructors: [],
            enrolledStudents: [],
            modules: [],
            startDate: new Date(),
            endDate: new Date(),
            isPublished: false,
            tags: [],
            categories: [],
            xpReward: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        showEdit.value = false;
        isEditing.value = true;
    }
});

function onSubmit() {
    if (props.editableCourse) {
        emit('onEditCourse', editableCourse.value);
        clearForm();
    }
    emit('onSaveCourse', editableCourse.value);

};

const deleteCourse = () => {
    if (props.editableCourse) {
        emit('onDeleteCourse', props.editableCourse.id);
    }
};

function clearForm() {

}
</script>