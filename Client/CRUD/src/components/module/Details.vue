<template>
    <div class="p-4 bg-gray-200">
        <Form @submit="onSubmit" :validation-schema="schema" class="flex flex-col items-center" v-slot="{ errors }">
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
                <!-- Course Title -->
                <div class="mb-4">
                    <Field name="title" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <InputText id="title" v-bind="field" type="text" class="md:w-full"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="title">Course Title</label>
                        </span>
                        <small class="p-error">{{ errorMessage }}</small>
                    </Field>
                </div>
                <!-- Course Description -->
                <div class="mb-4">
                    <Field name="description" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <InputText id="description" v-bind="field" type="text" class="md:w-full"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="description">Course Description</label>
                        </span>
                        <small class="p-error">{{ errorMessage }}</small>
                    </Field>
                </div>
                <!-- Course Instructors -->
                <div class="mb-4">
                    <Field name="instructors" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <MultiSelect id="instructors" v-bind="field" :options="instructorOptions" class="md:w-full"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="instructors">Instructors</label>
                        </span>
                        <small class="p-error">{{ errorMessage }}</small>
                    </Field>
                </div>
                <!-- Enrolled Students -->
                <div class="mb-4">
                    <Field name="enrolledStudents" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <MultiSelect id="enrolledStudents" v-bind="field" :options="studentOptions"
                                class="md:w-full" :class="{ 'p-invalid': errorMessage }" />
                            <label for="enrolledStudents">Enrolled Students</label>
                        </span>
                        <small class="p-error">{{ errorMessage }}</small>
                    </Field>
                </div>
                <!-- Course Start Date -->
                <div class="mb-4">
                    <Field name="startDate" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <Calendar id="startDate" v-bind="field" dateFormat="mm/dd/yy" class="md:w-full"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="startDate">Start Date</label>
                        </span>
                        <small class="p-error">{{ errorMessage }}</small>
                    </Field>
                </div>
                <!-- Course End Date -->
                <div class="mb-4">
                    <Field name="endDate" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <Calendar id="endDate" v-bind="field" dateFormat="mm/dd/yy" class="md:w-full"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="endDate">End Date</label>
                        </span>
                        <small class="p-error">{{ errorMessage }}</small>
                    </Field>
                </div>
                <!-- Is Published -->
                <div class="mb-4">
                    <Field name="isPublished" v-slot="{ field }">
                        <Checkbox id="isPublished" v-bind="field" binary class="md:w-full" />
                        <label for="isPublished" class="ml-2">Is Published</label>
                    </Field>
                </div>
                <!-- Course Categories -->
                <div class="mb-4">
                    <Field name="categories" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <MultiSelect id="categories" v-bind="field" :options="categoryOptions" class="md:w-full"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="categories">Categories</label>
                        </span>
                        <small class="p-error">{{ errorMessage }}</small>
                    </Field>
                </div>
                <!-- Submit Button -->
                <div class="flex items-center justify-between">
                    <Button label="Submit" type="submit" class="p-button-primary" />
                </div>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useForm, Field, Form } from 'vee-validate';
import * as yup from 'yup';

import type { Module } from '@/types/Module';
import type { ContentItem } from '@/types/ContentItem';
import type UnlockConditions from '@/types/UnlockConditions';
import { object } from 'yup';

const currentModule = ref<Module>({
    id: '',
    title: '',
    description: '',
    order: 1,
    courseId: '',
    status: 'draft',
    contentItems: [{} as ContentItem],
    prerequisites: [""], // IDs of modules that must be completed first
    unlockConditions: [{} as UnlockConditions],
    xpReward: 1,
    badgeReward: '', // ID of badge awarded for completing the module
    learningObjectives: [""],
    estimatedDuration: 1,// in minutes
    difficulty: 'beginner',
    tags: [""],
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
});

const instructorOptions = ref([
    { label: 'Instructor 1', value: 'instructor1' },
    { label: 'Instructor 2', value: 'instructor2' }
]);

const studentOptions = ref([
    { label: 'Student 1', value: 'student1' },
    { label: 'Student 2', value: 'student2' }
]);

const categoryOptions = ref([
    { label: 'Category 1', value: 'category1' },
    { label: 'Category 2', value: 'category2' }
]);

const schema = yup.object({
    title: yup.string().required('Course title is required'),
    description: yup.string().required('Course description is required'),
    instructors: yup.array().of(yup.string()).required('At least one instructor is required'),
    enrolledStudents: yup.array().of(yup.string()),
    startDate: yup.date().required('Start date is required'),
    endDate: yup.date().required('End date is required'),
    isPublished: yup.boolean(),
    categories: yup.array().of(yup.string()),
});


const loading = ref(false);
const isEditable = ref(true);



const props = defineProps<{
    currentModule: Module | null
}>()

const emit = defineEmits<{
    onSaveModule: [user: Module];
    onEditModule: [user: Module];
    onDeleteModule: [user: string];
}>()

const showEdit = computed(() => {
    return props.currentModule !== null;
});

onMounted(() => {
    // if (props.currentUsModule !== null && props.currentUser.name.length > 0) {
    //     currentUser.value = props.currentUser;
    //     selectedOptions.value = props.currentUser.roles.map(role => {
    //         return roleOptions.value.find(option => option.name === role)?.name
    //     });

    //     isEditable.value = false;
    // }
});



const onSubmit = () => {
    // currentUser.value.roles = selectedOptions.value.map((roleName: string) => {
    //     const roleOption = roleOptions.value.find(option => option.name === roleName);
    //     return roleOption ? { name: roleOption.name } : null;
    // });


    if (!props.currentModule) {
        emit('onSaveModule', currentModule.value)
        clearForm();
    }
    emit('onEditModule', currentModule.value)
}

function deleteModule() {
    emit('onDeleteModule', currentModule.value.id)
    console.log(currentModule.value.id)
}

function clearForm() {

}

</script>

<style scoped>
/* Add any additional scoped CSS here */
</style>