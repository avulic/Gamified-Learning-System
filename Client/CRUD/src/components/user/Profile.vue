<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">User Profile</h1>
        <TabView>
            <TabPanel header="Profile Info">
                <div v-if="isLoading" class="flex justify-center items-center p-4">
                    Loading...
                </div>
                <form v-else @submit="onSubmit">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="field">
                            <label class="block text-sm font-medium text-gray-700">Username</label>
                            <InputText v-model="username" class="w-full" :class="{ 'p-invalid': errors.username }"
                                aria-describedby="username-help" />
                            <small id="username-help" class="p-error">{{ errors.username }}</small>
                        </div>

                        <div class="field">
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <InputText v-model="email" class="w-full" :class="{ 'p-invalid': errors.email }"
                                aria-describedby="email-help" />
                            <small id="email-help" class="p-error">{{ errors.email }}</small>
                        </div>

                        <div class="field">
                            <label class="block text-sm font-medium text-gray-700">First Name</label>
                            <InputText v-model="name" class="w-full" :class="{ 'p-invalid': errors.name }"
                                aria-describedby="name-help" />
                            <small id="name-help" class="p-error">{{ errors.name }}</small>
                        </div>

                        <div class="field">
                            <label class="block text-sm font-medium text-gray-700">Last Name</label>
                            <InputText v-model="lastName" class="w-full" :class="{ 'p-invalid': errors.lastName }"
                                aria-describedby="lastName-help" />
                            <small id="lastName-help" class="p-error">{{ errors.lastName }}</small>
                        </div>
                    </div>

                    <!-- Rest of your existing template content -->
                    <div class="mt-6">
                        <Button type="submit" label="Save Changes" />
                        <!-- <Button type="button" label="Reset" @click="resetForm" class="p-button-secondary ml-2" /> -->
                    </div>
                </form>
            </TabPanel>

            <TabPanel header="Course Progress">
                <div>

                    <div class="mt-6">
                        <h2 class="text-xl font-semibold mb-2">Enrolled Courses</h2>
                        <DataTable :value="enrolledCourses" dataKey="id" :expandedRows="expandedRows"
                            class="p-datatable-sm">
                            <Column :expander="true" headerStyle="width: 3rem" />
                            <Column field="title" header="Course Title" />
                            <Column field="overallProgress" header="Progress">
                                <template #body="slotProps">
                                    <ProgressBar :value="slotProps.data.overallProgress" :showValue="false" />
                                    <span class="ml-2">{{ slotProps.data.overallProgress }}%</span>
                                </template>
                            </Column>
                            <template #expansion="slotProps">
                                <CourseProgressComponent :courseProgress="slotProps.data" />
                            </template>
                        </DataTable>
                    </div>



                    <div class="mt-6">
                        <h2 class="text-xl font-semibold mb-2">Recent Submissions</h2>
                        <DataTable :value="recentSubmissions" class="p-datatable-sm">
                            <Column field="assignmentTitle" header="Assignment" />
                            <Column field="submittedAt" header="Submitted At" />
                            <Column field="status" header="Status">
                                <template #body="slotProps">
                                    <Tag :severity="getStatusSeverity(slotProps.data.status)"
                                        :value="slotProps.data.status" />
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </div>
            </TabPanel>


            <TabPanel header="Gamification Info">
                <div v-if="isLoading" class="flex justify-center items-center p-4">
                    Loading...
                </div>
                <form v-else @submit="onSubmit">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="field">
                            <label class="block text-sm font-medium text-gray-700">Username</label>
                            <InputText v-model="username" class="w-full" :class="{ 'p-invalid': errors.username }"
                                aria-describedby="username-help" />
                            <small id="username-help" class="p-error">{{ errors.username }}</small>
                        </div>

                        <div class="field">
                            <label class="block text-sm font-medium text-gray-700">Email</label>
                            <InputText v-model="email" class="w-full" :class="{ 'p-invalid': errors.email }"
                                aria-describedby="email-help" />
                            <small id="email-help" class="p-error">{{ errors.email }}</small>
                        </div>

                        <div class="field">
                            <label class="block text-sm font-medium text-gray-700">First Name</label>
                            <InputText v-model="name" class="w-full" :class="{ 'p-invalid': errors.name }"
                                aria-describedby="name-help" />
                            <small id="name-help" class="p-error">{{ errors.name }}</small>
                        </div>

                        <div class="field">
                            <label class="block text-sm font-medium text-gray-700">Last Name</label>
                            <InputText v-model="lastName" class="w-full" :class="{ 'p-invalid': errors.lastName }"
                                aria-describedby="lastName-help" />
                            <small id="lastName-help" class="p-error">{{ errors.lastName }}</small>
                        </div>
                    </div>

                    <!-- Rest of your existing template content -->
                    <div class="mt-6">
                        <Button type="submit" label="Save Changes" />
                        <!-- <Button type="button" label="Reset" @click="resetForm" class="p-button-secondary ml-2" /> -->
                    </div>
                </form>
            </TabPanel>
        </TabView>



    </div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Form, Field, useForm, SubmissionHandler } from 'vee-validate';
import { object, string } from 'yup';
import UserDetails from '@/types/User/UserDetails';

import DetailedProgress from './DetailedProgress.vue';
import { default as CourseProgressComponent } from '@/components/user/CourseProgress.vue';
import { RoleEnum, TaskStatus } from '@/types/enums';
import { UserProgress } from '@/types/Progression';
import UserService from '@/services/UserService';
import AuthService from '@/services/AuthService';
import router from '@/router';
import * as yup from 'yup';


// Validation schema
const validationSchema = yup.object({
    username: yup.string().required('Username is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    name: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
});

// Loading state
const isLoading = ref(true);
const error = ref<string | null>(null);



// Form initial values
// const initialValues = ref<FormValues>({
//     username: '',
//     email: '',
//     name: '',
//     lastName: '',
//     preferences: {
//         notifications: false,
//         theme: 'light',
//         language: 'en'
//     }
// });



// Initialize form using useForm with defineField
const { defineField, handleSubmit, resetForm, errors } = useForm({
    validationSchema
});

// Define form fields
const [username] = defineField('username');
const [email] = defineField('email');
const [name] = defineField('name');
const [lastName] = defineField('lastName');

// Initialize form with user data
const initializeForm = async () => {
    try {
        isLoading.value = true;
        error.value = null;

        const currentUser = await AuthService.getCurentUserValues();

        if (!currentUser?.data) {
            router.push({ name: 'signin' });
            return;
        }

        const userData = currentUser.data;
        console.log(userData)
        // Set values directly to the defineField variables
        username.value = userData.username;
        email.value = userData.email;
        name.value = userData.name;
        lastName.value = userData.lastName;

    } catch (err) {
        error.value = 'Failed to load user profile';
        console.error('Error loading user profile:', err);
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    initializeForm();
});

const onSubmit = handleSubmit((values) => {
    try {
        console.log('Form values:', values);
        // TODO: Implement form submission
        // await UserService.updateProfile(values);
    } catch (error) {
        console.error('Error submitting form:', error);
        throw error;
    }
});





const userProgress = ref<UserProgress>({
    userId: '1',
    courseProgresses: [
        {
            courseId: 'c1',
            moduleProgresses: [
                {
                    moduleId: 'm1',
                    lessonProgress: [
                        { lessonId: 'l1', completed: true, xpEarned: 50 },
                        { lessonId: 'l2', completed: false, xpEarned: 0 }
                    ],
                    assignmentProgress: [
                        {
                            assignmentId: 'a1',
                            taskProgress: [
                                { taskId: 't1', status: TaskStatus.COMPLETED, xpEarned: 30, userId: '1', attempts: 1, timeSpent: 600 }
                            ],
                            completed: true,
                            xpEarned: 100
                        }
                    ],
                    completed: false,
                    xpEarned: 150
                }
            ],
            overallProgress: 75,
            completed: false
        }
    ],
    totalXpEarned: 250,
    level: 2
});

const enrolledCourses = computed(() =>
    userProgress.value.courseProgresses.map(cp => ({
        ...cp,
        title: `Course ${cp.courseId}`
    }))
);

const expandedRows = ref({});




const recentSubmissions = computed(() => {
    return userProgress.value.courseProgresses.flatMap(cp =>
        cp.moduleProgresses.flatMap(mp =>
            mp.assignmentProgress.filter(ap => ap.taskProgress.some(tp => tp.status === TaskStatus.COMPLETED))
                .map(ap => ({
                    assignmentTitle: `Assignment ${ap.assignmentId}`,
                    submittedAt: new Date().toLocaleString(),
                    status: 'Submitted'
                }))
        )
    ).slice(0, 5);
});

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'Submitted': return 'success';
        case 'In Progress': return 'warning';
        default: return 'info';
    }
};


</script>
