<template>
    <div class="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <!-- Replace 'New' with 'New Assignment' -->
        <div class="flex justify-between">
            <AddAssignment @addedNew="refreshList"></AddAssignment>
            <input v-model="searchTerm" type="text" placeholder="Search"
                class="py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300" />
        </div>

        <div v-if="filteredAssignments"
            class="min-w-screen min-h-screen bg-gray-100 items-center bg-gray-100 font-sans overflow-hidden">
            <div class="w-full">
                <div class="bg-white shadow-md rounded my-6 overflow-x-scroll">
                    <table class="min-w-max w-full table-auto">
                        <thead>
                            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th class="py-3 px-6 text-left">Name</th>
                                <th class="py-3 px-6 text-left">Description</th>
                                <!-- Add or update table headers as needed for Assignment list -->
                            </tr>
                        </thead>
                        <tbody class="text-gray-600 text-sm font-light">
                            <template v-for="(Assignment, i) in filteredAssignments" :key="Assignment.id">
                                <tr @click="toggleDropdown(i)" class="border-b border-gray-200 hover:bg-gray-100">
                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                        <span class="font-medium">{{ Assignment.name }}</span>
                                    </td>
                                    <td class="py-3 px-6 text-left">
                                        <span>{{ Assignment.description }}</span>
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
                                            <div @click="deleteAssignment(Assignment.id)"
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
                                    <td :colspan="Object.keys(filteredAssignments[0]).length + 1">
                                        <!-- Replace 'Details' with 'AssignmentDetails' -->
                                        <AssignmentDetails :currentAssignment="currentAssignment" @onSaveAssignment="saveAssignment"
                                            @onEditAssignment="editAssignment">
                                        </AssignmentDetails>
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

import { ref, computed, onMounted, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast';


import AssignmentService from '@/services/AssignmentService'
import type Assignment from '@/types/Assignment'

import AssignmentDetails from '@/components/Assignment/Details.vue'
import AddAssignment from '@/components/Assignment/AddAssignment.vue';

const toast = useToast();

let Assignments = ref([]) as Ref<Assignment[]>
var currentAssignment = ref<Assignment>({
    id: "",
    name: "",
    description: ""
});

const searchTerm = ref('')

const loading = ref(false);
var title = ref('')
var currentIndex = ref(-1)




// Function to retrieve Assignments from the API
async function retrieveAssignments() {
    await AssignmentService.getAllAssignments()
        .then((response: Assignment[]) => {
            Assignments.value = response
        })
        .catch((e: Error) => {
            console.log(e)
        })
}

async function refreshList() {
    await retrieveAssignments()
    currentIndex.value = -1
}

async function saveAssignment(Assignment: Assignment) {
    loading.value = true;
    try {
        await AssignmentService.createAssignment(Assignment);
        showToast("Assignment created successfully!", "success");
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        showToast(errorMessage, "error");
    }
    loading.value = false;
}

async function editAssignment(Assignment: Assignment) {
    loading.value = true;
    try {
        await AssignmentService.updateAssignment(currentAssignment.value.id, Assignment);
        showToast("Assignment updated successfully!", "success");
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        showToast(errorMessage, "error");
    }
    loading.value = false;
}

function deleteAssignment(id: string) {
    AssignmentService.deleteAssignment(id)
        .then(() => {
            refreshList()
        })
        .catch((e: Error) => {
            console.log('Error on delete: ' + e)
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
    // Your error handling logic here
    return "An error occurred";
}

const filteredAssignments = computed(() => {
    const term = searchTerm.value.toLowerCase().trim()
    if (!term) return Assignments.value

    return Assignments.value.filter(
        (Assignment) =>
            Assignment.name.toLowerCase().includes(term) ||
            Assignment.description.toLowerCase().includes(term)
    )
})

function toggleDropdown(index: number) {
    currentIndex.value = currentIndex.value === index ? -1 : index;
    setActiveAssignment(index);
}

function setActiveAssignment(index: number) {
    currentAssignment.value = Assignments.value[index]
}



onMounted(() => {
    retrieveAssignments()
})


</script>

<style scoped></style>
@/services/AssignmentService@/types/assignment@/types/Role