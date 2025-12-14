<template>
    <div class="container mx-auto p-4">
        <Toast />
        <ConfirmDialog />

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex justify-between items-center mb-4">

                <Dropdown v-if="isAdmin" v-model="selectedTable" :options="availableTables" optionLabel="label"
                    optionValue="value" placeholder="Select Management View" class="w-64" />
            </div>

            <!-- User Management -->
            <UserList v-if="showUserList" />

            <!-- Course Management -->
            <CourseList v-if="showCourseList" :instructor-id="isProfessor ? currentUser?.id : undefined" />

            <!-- Module Management -->
            <ModuleList v-if="showModuleList" :modules="[]" :is-editable="false" />

            <!-- Assignment Management -->
            <AssignmentList v-if="showAssignmentList" :assignments="[]" :is-editable="false" />

            <!-- Course Management -->
            <!-- <CourseProfesor v-if="details" :course="course" :isEditable="isProfessor" /> -->
        </div>
    </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import UserList from '@/features/profile/components/UserList.vue'
import CourseList from '@/features/courses/components/CourseList.vue'
import ModuleList from '@/features/modules/components/ModuleList.vue'
import AssignmentList from '@/features/assignments/components/AssignmentList.vue'
import { useRoleAccess } from '@/composables/useRoleAccess'
import CourseService from '@/services/CourseService'
import CourseProfesor from '@/components/course/CourseDetailsProfesor.vue'
import { Course } from '@/types/Course'

const {
    currentUser,
    isAdmin,
    isProfessor,
    canAccessAllCourses,
    canAccessAllUsers,
    canAccessAllModules,
    canManageAssignments
} = useRoleAccess()


const selectedTable = ref('courses')
const professorCourseIds = ref<string[]>([])
const professorResourceIds = ref<string[]>([])

const details = ref(false)
const course = ref<Course | null>(null)



const availableTables = computed(() => {
    const tables = []

    if (canAccessAllUsers.value) {
        tables.push({ label: 'User Management', value: 'users' })
    }
    tables.push({ label: 'Course Management', value: 'courses' })
    if (canAccessAllModules.value || isProfessor.value) {
        tables.push({ label: 'Module Management', value: 'modules' })
    }
    if (canManageAssignments.value) {
        tables.push({ label: 'Assignment Management', value: 'assignments' })
    }

    return tables
})

const showUserList = computed(() =>
    selectedTable.value === 'users' && canAccessAllUsers.value
)

const showCourseList = computed(() =>
    selectedTable.value === 'courses'
)

const showModuleList = computed(() =>
    selectedTable.value === 'modules' &&
    (canAccessAllModules.value || isProfessor.value)
)

const showAssignmentList = computed(() =>
    selectedTable.value === 'assignments' && canManageAssignments.value
)

onMounted(async () => {
    if (isProfessor.value && currentUser.value?.id) {
        try {
            //const courses = await CourseService.getCoursesByInstructor(currentUser.value.id)
            //professorCourseIds.value = courses.map(course => course.id)
            //professorResourceIds.value = [...professorCourseIds.value]

            //course.value = courses[0]
            details.value = true
        } catch (error) {
            console.error('Failed to fetch professor courses:', error)
        }
    }
    if (isAdmin.value && currentUser.value?.id) {
        try {
            //const courses = await CourseService.getCoursesByInstructor(currentUser.value.id)
            //professorCourseIds.value = courses.map(course => course.id)
            //professorResourceIds.value = [...professorCourseIds.value]

            //course.value = courses[0]
            details.value = true
        } catch (error) {
            console.error('Failed to fetch professor courses:', error)
        }
    }
})
</script>