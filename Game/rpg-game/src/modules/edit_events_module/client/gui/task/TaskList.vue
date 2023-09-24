<template>
    <div id="tasksTable" class="px-4 py-5 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8">
        <!-- Replace 'New' with 'New Task' -->
        <div class="flex justify-between">
            <AddTask @addedNew="refreshList"></AddTask>
            <input v-model="searchTerm" type="text" placeholder="Search"
                class="py-2 px-4 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300" />
        </div>

        <div class="min-w-screen items-center font-sans">
            <div class="w-full">
                <div class="bg-white shadow-md rounded my-6 overflow-x-scroll">
                    <table class="min-w-max w-full table-auto">
                        <thead>
                            <tr class="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                                <th class="py-3 px-6 text-left">Name</th>
                                <th class="py-3 px-6 text-left">Description</th>
                                <th class="py-3 px-6 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody class="text-gray-600 text-sm font-light">
                            <template v-for="(task, i) in filteredTasks" :key="task.id">
                                <tr @click="toggleDropdown(i)" class="border-b border-gray-200 hover:bg-gray-100">
                                    <td class="py-3 px-6 text-left whitespace-nowrap">
                                        <span class="font-medium">{{ task.name }}</span>
                                    </td>
                                    <td class="py-3 px-6 text-left">
                                        <span>{{ task.description }}</span>
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
                                            <div @click="deleteTask(task.id)"
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
                                    <td :colspan="Object.keys(filteredTasks[0]).length + 1">
                                        <!-- Replace 'Details' with 'TaskDetails' -->
                                        <TaskDetails :currentTask="currentTask" @onSaveTask="saveTask"
                                            @onEditTask="editTask">
                                        </TaskDetails>
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

<script lang="ts">

import { ref, computed, onMounted, type Ref } from 'vue'
import { useToast } from 'primevue/usetoast';


import TaskService from '../../../services/TaskService'
import type Task from '../../../types/Task'

import TaskDetails from './Details.vue'
import AddTask from './AddTask.vue';



const name = "taskList";

export default {
    name,
    inject: ['rpgEngine', 'rpgGui', 'rpgGuiInteraction', 'rpgKeypress', 'rpgSound', 'rpgSocket'],
    components: {
        AddTask,
        TaskDetails
    },
    data() {
        return {
            step: 'title',
            title: 'Login',
            page: 'login',
            user: <User>{},
            tasks: <Task[]>[],
            currentTask: <Task>{},
            searchTerm: "",
            loading: false,
            title: "",
            currentIndex: -1,
        }
    },
    async mounted() {
        const toast = useToast();
        this.addNewDiv()

        await this.retrieveTasks()

    },
    unmounted() {

    },
    methods: {
        addNewDiv() {
            // Create a new div element
            const taskList = document.getElementById("tasksTable");
            const taskContainer = document.getElementById("taskContainer");
            const questContainer = document.getElementById("questContainer");

            const rpg = document.getElementById("rpg");
            const container = document.getElementById("container");

            if (taskContainer && taskList && questContainer && rpg && container) {
                container.style.flex = '1';
                taskContainer.appendChild(taskList);
                rpg.classList.add(this.width);
                //rpg.style.width = '';
                taskContainer.removeAttribute('hidden');
                questContainer.removeAttribute('hidden');
            }
        },

        async retrieveTasks() {
            await TaskService.getAllTasks()
                .then((response: Task[]) => {
                    this.tasks = response
                })
                .catch((e: Error) => {
                    console.log(e)
                })
        },

        async refreshList() {
            await this.retrieveTasks()
            this.currentIndex = -1
        },

        async saveTask(task: Task) {
            this.loading = true;
            try {
                await TaskService.createTask(task);
                this.showToast("Task created successfully!", "success");
            } catch (error) {
                const errorMessage = extractErrorMessage(error);
                this.showToast(errorMessage, "error");
            }
            this.loading = false;
        },

        async editTask(task: Task) {
            this.loading = true;
            try {
                await TaskService.updateTask(this.currentTask.id, task);
                this.showToast("Task updated successfully!", "success");
            } catch (error) {
                const errorMessage = extractErrorMessage(error);
                this.showToast(errorMessage, "error");
            }
            this.loading = false;
        },

        deleteTask(id: string) {
            TaskService.deleteTask(id)
                .then(() => {
                    this.refreshList()
                })
                .catch((e: Error) => {
                    console.log('Error on delete: ' + e)
                })
        },

        showToast(message: string, severityType: "error" | "success" | "info" | "warn") {
            toast.add({
                severity: severityType,
                summary: severityType === "error" ? "Error" : "Success",
                detail: message,
                life: 10000,
            });
        },

        extractErrorMessage(error: any): string {
            // Your error handling logic here
            return "An error occurred";
        },

        toggleDropdown(index: number) {
            this.currentIndex = this.currentIndex === index ? -1 : index;
            this.setActiveTask(index);
        },

        setActiveTask(index: number) {
            this.currentTask = this.tasks[index]
        },

    },
    computed: {
        filteredTasks() {
            var term;

            term = this.searchTerm.toLowerCase().trim()
            if (!term) return this.tasks

            return this.tasks.filter(
                (task) =>
                    task.name.toLowerCase().includes(term) ||
                    task.description.toLowerCase().includes(term)
            )
        }
    }
}




</script>

<style scoped></style>
