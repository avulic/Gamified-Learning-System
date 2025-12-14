<template>
    <div v-if="loading" class="p-4 text-center">
        <h2>Loading...</h2>
    </div>

    <div v-else class="p-4 grid gap-4 card">
        <h2 class="text-xl font-bold mb-4">Edit User</h2>

        <!-- USER BASIC DATA -->
        <div>
            <label class="font-medium">User ID</label>
            <InputText v-model="form.id" class="w-full" disabled />
        </div>

        <div>
            <label class="font-medium">Username</label>
            <InputText v-model="form.username" class="w-full" />
        </div>

        <div>
            <label class="font-medium">Email</label>
            <InputText v-model="form.email" class="w-full" />
        </div>

        <div>
            <label class="font-medium">First Name</label>
            <InputText v-model="form.name" class="w-full" />
        </div>

        <div>
            <label class="font-medium">Last Name</label>
            <InputText v-model="form.lastName" class="w-full" />
        </div>

        <div>
            <label class="font-medium">Profile Picture URL</label>
            <InputText v-model="form.profilePicture" class="w-full" />
        </div>

        <!-- PREFERENCES -->
        <h3 class="text-lg font-semibold mt-6">Preferences</h3>

        <div class="grid grid-cols-3 gap-4">
            <div>
                <label class="font-medium">Notifications</label>
                <Checkbox v-model="form.preferences.notifications" :binary="true" />
            </div>

            <div>
                <label class="font-medium">Theme</label>
                <Dropdown v-model="form.preferences.theme" :options="themeOptions" optionLabel="label"
                    optionValue="value" class="w-full" />
            </div>

            <div>
                <label class="font-medium">Language</label>
                <Dropdown v-model="form.preferences.language" :options="languageOptions" optionLabel="label"
                    optionValue="value" class="w-full" />
            </div>
        </div>

        <!-- ROLES -->
        <h3 class="text-lg font-semibold mt-6">Roles</h3>
        <div class="grid gap-2">
            <div v-for="(role, index) in form.roles" :key="role.id" class="p-3 border rounded-md flex gap-4">
                <div class="flex-1">
                    <label class="font-medium">Role Name</label>
                    <InputText v-model="form.roles[index]" class="w-full" />
                </div>
            </div>
        </div>

        <!-- ENROLLED COURSES -->
        <h3 class="text-lg font-semibold mt-6">Enrolled Courses</h3>
        <div class="grid gap-2">
            <div v-for="(course, index) in form.enrolledCourses" :key="course.courseId"
                class="p-3 border rounded-md grid grid-cols-2 gap-4">
                <div>
                    <label class="font-medium">Course ID</label>
                    <InputText v-model="form.enrolledCourses[index].courseId" class="w-full" />
                </div>

                <div>
                    <label class="font-medium">Course Name</label>
                    <InputText v-model="form.enrolledCourses[index].courseName" class="w-full" />
                </div>
            </div>
        </div>

        <!-- READ ONLY METADATA -->
        <h3 class="text-lg font-semibold mt-6">Metadata</h3>
        <div>
            <label class="font-medium">Created At</label>
            <InputText v-model="form.createdAt" class="w-full" disabled />
        </div>

        <div>
            <label class="font-medium">Updated At</label>
            <InputText v-model="form.updatedAt" class="w-full" disabled />
        </div>

        <!-- SAVE BUTTON -->
        <button @click="submit" class="p-button p-component w-full mt-6">Save</button>
    </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from "vue";

import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";

import UserService from "@/services/UserService";
import AuthService from "@/services/AuthService";
import type UserDetails from "@/types/User/UserDetails";

// ----------------------------
// STATE
// ----------------------------
const loading = ref(true);

const form = ref<UserDetails>({
    id: "",
    name: "",
    lastName: "",
    email: "",
    username: "",
    profilePicture: "",
    preferences: {
        notifications: false,
        theme: "light",
        language: "en",
    },
    roles: [],
    enrolledCourses: [],
    createdAt: "",
    updatedAt: "",
});

// ----------------------------
// DROPDOWN OPTIONS
// ----------------------------
const themeOptions = [
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
];

const languageOptions = [
    { label: "English", value: "en" },
    { label: "German", value: "de" },
    { label: "Spanish", value: "es" },
];

// ----------------------------
// LOAD USER DATA
// ----------------------------
onMounted(async () => {
    loading.value = true;

    const currentUser = AuthService.getCurrentUserValues();
    console.log("Current User:", currentUser);
    if (!currentUser) {
        alert("No logged in user found");
        loading.value = false;
        return;
    }
    const details = await UserService.getUserDataById(currentUser.id);

    if (!details) {
        alert("User not found");
        loading.value = false;
        return;
    }

    form.value = {
        ...details,
        preferences: details.preferences ?? {
            notifications: false,
            theme: "light",
            language: "en",
        }
    };

    loading.value = false;
});

// ----------------------------
// SAVE
// ----------------------------
async function submit() {
    await UserService.updateUser(form.value.id, form.value);
    alert("User updated successfully!");
}
</script>


<style scoped>
.card {
    max-width: 900px;
    margin: auto;
}
</style>
