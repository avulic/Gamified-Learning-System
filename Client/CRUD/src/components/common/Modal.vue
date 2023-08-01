<template>
    <div class="fixed inset-0 flex flex-col items-center justify-center z-50">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black opacity-60"></div>

        <!-- Modal content -->
        <div class="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <slot></slot>
            <div class="flex justify-between w-full">
                <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md justify-self-start"
                    @click="closeModal">Close</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';


const emit = defineEmits<{
    closeModal: []
}>()

const closeModal = () => emit('closeModal');


</script>

<style scoped>
/* Adjust the backdrop and modal content z-index as needed */
.fixed {
    z-index: 9999;
}

.bg-black {
    z-index: -10;
}

.fixed.z-20 {
    z-index: 20;
}
</style>
