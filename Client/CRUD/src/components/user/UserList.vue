<template>
    <div class="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <div class="flex justify-between">
            <div>
                <button @click="showModal = true"
                    class="group relative h-12 w-48 overflow-hidden rounded-2xl bg-green-500 text-lg font-bold text-white">
                    New
                    <div
                        class="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30">
                    </div>
                </button>
            </div>

            <input v-model="searchTerm" type="text" placeholder="Search"
                class="py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300" />
        </div>

        <Modal v-if="showModal" @closeModal="closeModal">
            <div v-if="!isNewUserSelected" class="flex flex-col items-center justify-center">
                <DragDrop />

                <span class="mb-2 block text-base font-medium text-[#6B7280]">
                    Or
                </span>

                <button @click="openNewUserDetails"
                    class="group relative h-12 w-48 overflow-hidden rounded-2xl bg-green-500 text-lg font-bold text-white">
                    Add one user
                    <div
                        class="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30">
                    </div>
                </button>
            </div>

            <div v-else class="flex justify-between mt-4">
                <Details :currentUser="null" @onSaveUser="saveUser"></Details>
            </div>
        </Modal>

        <div v-if="filteredUsers"
            class="min-w-screen min-h-screen bg-gray-100 items-center bg-gray-100 font-sans overflow-hidden">
            <div class="w-full">
                <div class="bg-white shadow-md rounded my-6 overflow-x-scroll">
                    <table class="min-w-max w-full table-auto">
                        <thead>
                            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th class="py-3 px-6 text-left">Name</th>
                                <th class="py-3 px-6 text-left">Username</th>
                                <th class="py-3 px-6 text-center">Role</th>
                                <th class="py-3 px-6 text-center">Status</th>
                                <th class="py-3 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="text-gray-600 text-sm font-light">
                            <template v-for="(user, i) in filteredUsers" :key="user.id">
                                <tr @click="toggleDropdown(i)" class="border-b border-gray-200 hover:bg-gray-100">
                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                        <div class="flex items-center">
                                            <div class="mr-2">
                                                <!-- User image -->
                                            </div>
                                            <span class="font-medium">{{ user.name }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-6 text-left">
                                        <div class="flex items-center">
                                            <div class="mr-2">
                                                <img class="w-6 h-6 rounded-full"
                                                    src="https://randomuser.me/api/portraits/men/1.jpg" />
                                            </div>
                                            <span class="max-w-md">{{ user.username }}</span>
                                        </div>
                                    </td>
                                    <td class="py-3 px-6 text-center">
                                        <span v-for="role in user.roles" class="max-w-md">{{ role.name }}</span>
                                    </td>
                                    <td class="py-3 px-6 text-center">
                                        <span
                                            class="bg-purple-200 text-purple-600 py-1 px-3 rounded-full text-xs">Active</span>
                                    </td>
                                    <td class="py-3 px-6 text-center">
                                        <div class="flex item-center justify-center">
                                            <div @click.stop="toggleDropdown(i)"
                                                class="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </div>
                                            <div @click="deleteUser(user.id)"
                                                class="w-4 mr-2 transform hover:text-purple-500 hover:scale-110">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                                    stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </div>
                                        </div>
                                    </td>
                                </tr>

                                <tr v-if="currentIndex === i" :key="currentIndex"
                                    class="border-b border-gray-200 hover:bg-gray-100" role="presentation">
                                    <td :colspan="Object.keys(filteredUsers[0]).length + 1">
                                        <Details :currentUser="currentUser" @onSaveUser="saveUser" @onEditUser="editUser">
                                        </Details>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Ref, nextTick, onBeforeMount } from 'vue'
import UserService from '@/services/UserService'
import type User from '@/types/User/User'
import type UserDetails from '@/types/User/UserDetails'
import AuthService from '@/services/AuthService';

import Details from '@/components/user/Details.vue'
import Modal from '@/components/common/Modal.vue';
import AddUser from '@/components/user/AddUser.vue';
import DragDrop from '@/components/common/DragDrop.vue'

import { useToast } from 'primevue/usetoast';
import { useRouter } from "vue-router";


let users = ref([]) as Ref<UserDetails[]>
var currentUser = ref(<UserDetails>{
    id: "",
    name: "",
    lastName: "",
    username: "",
    password: "",
    roles: [{}],
    email: ""
});

var title = ref('')
var currentIndex = ref(-1)
const searchTerm = ref('')
const showModal = ref(false);

var isImportSelected = ref(true);
var isNewUserSelected = ref(false);

const loading = ref(false);
const toast = useToast();

// Function to retrieve users from the API
async function retrieveUsers() {
    await UserService.getAllUsers()
        .then((response: any) => {
            users.value = response
            console.log(response.values)
        })
        .catch((e: Error) => {
            console.log(e)
        })
}

async function refreshList() {
    await retrieveUsers()
    currentIndex.value = -1
}


async function saveUser(user: UserDetails) {
    loading.value = true;
    try {
        await UserService.createUser(user);
        showToast("Import successful!", "success");
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        showToast(errorMessage, "error");
    }
    loading.value = false;
}

async function editUser(user: UserDetails) {
    loading.value = true;
    try {
        await UserService.updateUser(currentUser.value.id, user);
        showToast("Edit successful!", "success");
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        showToast(errorMessage, "error");
    }
    loading.value = false;
}

function deleteUser(id: string) {
    UserService.deleteUser(id)
        .then((response: UserDetails | null) => {
            refreshList()
            console.log(response)
        })
        .catch((e: Error) => {
            console.log('Erro on delete ' + e)
        })
}


function showToast(message: string, severityType: "error" | "success" | "info" | "warn") {
    toast.add({
        severity: severityType,
        summary: severityType === "error" ? "Error" : "Success",
        detail: message,
        life: 10000,
    });
}

function extractErrorMessage(error: any): string {
    if (typeof error === "string") {
        return error;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (error instanceof Object && "response" in error) {
        const responseData = error.response.data;
        if (responseData && responseData.message) {
            return responseData.message;
        }
    }
    return "An error occurred";
}


const filteredUsers = computed(() => {
    const term = searchTerm.value.toLowerCase().trim()
    if (!term) return users.value

    return users.value.filter(
        (user) =>
            user.name.toLowerCase().includes(term) ||
            user.username.toLowerCase().includes(term)
    )
})

function toggleDropdown(index: number) {
    currentIndex.value = currentIndex.value === index ? -1 : index;
    setActiveUser(index);
}

function setActiveUser(index: number) {
    currentUser.value = users.value[index]
}

// Function to open the file input when "Upload CSV" button is clicked
const openFileInput = () => {
    isImportSelected.value = true;
    const fileInput = ref<HTMLInputElement | null>(null);
    if (fileInput.value) {
        fileInput.value.click();
    }
};

// Function to handle file change when a CSV file is selected
const onFileChange = (event: Event) => {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
        // Handle the uploaded file here (e.g., read and process the CSV data)
        console.log('Uploaded file:', inputElement.files[0].name);
    }
};

const openNewUserDetails = () => {
    isImportSelected.value = false;
    isNewUserSelected.value = true;
};

const closeModal = () => {
    showModal.value = false;
    isImportSelected.value = true;
    isNewUserSelected.value = false;
}

onMounted(() => {
    retrieveUsers()
})
</script>
@/services/UserService@/services/UserService
@/types/User/User@/types/User/UserDetails