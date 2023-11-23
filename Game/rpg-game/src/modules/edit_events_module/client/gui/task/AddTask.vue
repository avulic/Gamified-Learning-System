<template>
    <div>
        <button @click="showModal = true"
            class="group relative h-12 w-48 overflow-hidden rounded-2xl bg-green-500 text-lg font-bold text-white">
            New Task
            <div
                class="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30">
            </div>
        </button>
    </div>

    <Modal v-if="showModal" @closeModal="closeModal">
        <div class="flex justify-between mt-4">
            <!-- Replace 'Details' with 'TaskDetails' -->
            <TaskDetails :currentTask="newTask" @onSaveTask="saveNewTask"></TaskDetails>
        </div>
    </Modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import TaskService from "../../../../../services/TaskService";
import type Task from "../../../types/Task";

import Modal from './Modal.vue';
import TaskDetails from './Details.vue';
import { useToast } from 'primevue/usetoast';
const toast = useToast();

const emit = defineEmits<{
    addedNew: [task: Task];
}>()

const showModal = ref(false);
var isImportSelected = ref(true);
var isNewTaskSelected = ref(false);

var newTask: Task = {
    id: "",
    name: "",
    description: ""
};
var submitted = false;


const closeModal = () => {
    showModal.value = false;
    isImportSelected.value = true;
    isNewTaskSelected.value = false;
}


async function saveNewTask(task: Task) {
    const response = await TaskService.createTask(task);
    submitted = true;
    showToast("Task added successfully!", "success");
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
</script> 