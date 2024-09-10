<template>
    <div class="p-4">
        <h1 class="text-2xl font-bold mb-4">User Profile</h1>
        <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700">Username</label>
                    <Field name="username" v-slot="{ field }">
                        <InputText v-bind="field" class="w-full" :class="{ 'p-invalid': errors.username }" />
                    </Field>
                    <small class="p-error">{{ errors.username }}</small>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Email</label>
                    <Field name="email" v-slot="{ field }">
                        <InputText v-bind="field" class="w-full" :class="{ 'p-invalid': errors.email }" />
                    </Field>
                    <small class="p-error">{{ errors.email }}</small>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">First Name</label>
                    <Field name="name" v-slot="{ field }">
                        <InputText v-bind="field" class="w-full" :class="{ 'p-invalid': errors.name }" />
                    </Field>
                    <small class="p-error">{{ errors.name }}</small>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700">Last Name</label>
                    <Field name="lastName" v-slot="{ field }">
                        <InputText v-bind="field" class="w-full" :class="{ 'p-invalid': errors.lastName }" />
                    </Field>
                    <small class="p-error">{{ errors.lastName }}</small>
                </div>
            </div>

            <div class="mt-6">
                <h2 class="text-xl font-semibold mb-2">Enrolled Courses</h2>
                <DataTable :value="enrolledCourses" dataKey="id" :expandedRows="expandedRows" class="p-datatable-sm">
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
                <h2 class="text-xl font-semibold mb-2">Overall Progress</h2>
                <Card>
                    <template #content>
                        <div class="flex items-center mb-4">
                            <ProgressBar :value="overallProgress" class="flex-grow mr-4" />
                            <span class="text-lg font-semibold">{{ overallProgress }}%</span>
                        </div>
                        <div>
                            <p class="mb-2">Total XP: {{ userProgress.totalXpEarned }}</p>
                            <p>Current Level: {{ userProgress.level }}</p>
                        </div>
                    </template>
                </Card>
            </div>

            <div class="mt-6">
                <h2 class="text-xl font-semibold mb-2">Recent Submissions</h2>
                <DataTable :value="recentSubmissions" class="p-datatable-sm">
                    <Column field="assignmentTitle" header="Assignment" />
                    <Column field="submittedAt" header="Submitted At" />
                    <Column field="status" header="Status">
                        <template #body="slotProps">
                            <Tag :severity="getStatusSeverity(slotProps.data.status)" :value="slotProps.data.status" />
                        </template>
                    </Column>
                </DataTable>
            </div>

            <div class="mt-6">
                <Button type="submit" label="Save Changes" :loading="isSubmitting" />
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Form, Field } from 'vee-validate';
import { object, string } from 'yup';
import UserDetails from '@/types/User/UserDetails';
import Module from '@/types/Module';
import { Lesson } from '@/types/Lesson';
import Assignment from '@/types/Assignment';
import Task from '@/types/task/Task';
import { UserProgress, CourseProgress, TaskStatus } from '@/types/Progression';
import { Course } from '@/types/Course';
import { Submission } from '@/types/Submission';
import { RoleEnum } from '@/types/Role';

import DetailedProgress from './DetailedProgress.vue';
import { default as CourseProgressComponent } from '@/components/user/CourseProgress.vue';

const userDetails = ref<UserDetails>({
    id: '1',
    username: 'johndoe',
    password: 'hashed_password',
    name: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    roles: [RoleEnum.Student]
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

const schema = object({
    username: string().required('Username is required'),
    email: string().email('Invalid email').required('Email is required'),
    name: string().required('First name is required'),
    lastName: string().required('Last name is required'),
});

const overallProgress = computed(() => {
    const totalCourses = userProgress.value.courseProgresses.length;
    const completedCourses = userProgress.value.courseProgresses.filter(course => course.completed).length;
    return Math.round((completedCourses / totalCourses) * 100);
});

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

const onSubmit = async (values: UserDetails) => {
    console.log(values);
};
</script>
