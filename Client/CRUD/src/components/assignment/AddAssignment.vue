<template>
    <div>
        <button @click="showModal = true"
            class="group relative h-12 w-48 overflow-hidden rounded-2xl bg-green-500 text-lg font-bold text-white">
            New Assignment
            <div
                class="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30">
            </div>
        </button>
    </div>

    <Modal v-if="showModal" @closeModal="closeModal">
        <div class="flex justify-between mt-4">
            <!-- Replace 'Details' with 'AssignmentDetails' -->
            <AssignmentDetails :currentAssignment="newAssignment" @onSaveAssignment="saveNewAssignment"></AssignmentDetails>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AssignmentService from "@/services/AssignmentService";
import type Assignment from "@/types/Assignment";

import Modal from '@/components/common/Modal.vue';
import AssignmentDetails from '@/components/Assignment/Details.vue';
import { useToast } from 'primevue/usetoast';
const toast = useToast();

const emit = defineEmits<{
    addedNew: [Assignment: Assignment];
}>()

const showModal = ref(false);
var isImportSelected = ref(true);
var isNewAssignmentSelected = ref(false);

var newAssignment: Assignment = {
    id: "",
    name: "",
    description: ""
};
var submitted = false;


const closeModal = () => {
    showModal.value = false;
    isImportSelected.value = true;
    isNewAssignmentSelected.value = false;
}


async function saveNewAssignment(assignment: Assignment) {
    const response = await AssignmentService.createAssignment(assignment);
    submitted = true;
    showToast("Assignment added successfully!", "success");
    emit("addedNew", response);
}

function showToast(message: string, severityType: "error" | "success" | "info" | "warn") {
    toast.add({
        severity: severityType,
        summary: severityType === "error" ? "Error" : "Success",
        detail: message,
        life: 10000,
    });
}
</script> @/services/AssignmentService@/types/assignment@/types/Role