<template>
    <!-- component -->
    <div class="flex items-center justify-center">
        <!-- Author: FormBold Team -->
        <!-- Learn More: https://formbold.com -->
        <div class="mx-auto w-full bg-white">
            <div class="mb-6 pt-4">
                <div class="p-12 bg-gray-100 border border-gray-300" @dragover="dragover" @dragleave="dragleave"
                    @drop="drop" ref="dragArea">

                    <input type="file" multiple name="fields[assetsFieldHandle][]" id="assetsFieldHandle"
                        class="w-px h-px opacity-0 overflow-hidden absolute" @change="onChange" ref="fileInput"
                        accept=".pdf,.jpg,.jpeg,.png" />
                    <label for="file">

                        <div class="flex w-full items-center justify-center text-center">
                            <label for="assetsFieldHandle" class="block cursor-pointer">
                                <div>
                                    <span class="underline font-bold">Drop files</span> in here or
                                    <span class="underline font-bold">click here</span> to upload
                                </div>
                            </label>
                        </div>
                    </label>
                </div>
                <div v-if="filelist.length" v-for="(file, index) in filelist" :key="index">
                    <div class="mb-5 rounded-md bg-[#F5F7FB] py-4 px-8">
                        <div class="flex items-center justify-between">
                            <span class="truncate pr-3 text-base font-medium text-[#07074D]">
                                {{ file.name }}
                            </span>
                            <button class="text-[#07074D]" @click="remove(index)">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                                        fill="currentColor" />
                                    <path fill-rule="evenodd" clip-rule="evenodd"
                                        d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                                        fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div v-if="false">
                        <div class="rounded-md bg-[#F5F7FB] py-4 px-8">
                            <div class="flex items-center justify-between">
                                <span class="truncate pr-3 text-base font-medium text-[#07074D]">
                                    {{ file.name }}
                                </span>
                                <button class="text-[#07074D]" @click="remove(index)">
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                                            fill="currentColor" />
                                        <path fill-rule="evenodd" clip-rule="evenodd"
                                            d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0931127 9.34821 -0.0931123 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                                            fill="currentColor" />
                                    </svg>
                                </button>
                            </div>
                            <div class="relative mt-5 h-[6px] w-full rounded-lg bg-[#E2E5EF]">
                                <div class="absolute left-0 right-0 h-full w-[75%] rounded-lg bg-[#6A64F1]"></div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import CommonService from '@/services/CommonService'
import { ref, onMounted } from 'vue'

const filelist = ref<File[]>([])

const dragArea = ref<HTMLElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)



const onChange = () => {
    if (dragArea.value) {
        dragArea.value.classList.add('bg-gray-100')
        dragArea.value.classList.remove('bg-green-300')
    }

    if (fileInput.value && fileInput.value.files) {
        filelist.value = [...filelist.value, ...fileInput.value.files]
    }
}

const remove = (index: number) => {
    filelist.value.splice(index, 1)
}

const dragover = (event: DragEvent) => {
    event.preventDefault()
    if (dragArea.value && !dragArea.value.classList.contains('bg-green-300')) {
        dragArea.value.classList.remove('bg-gray-100')
        dragArea.value.classList.add('bg-green-300')
    }
}

const dragleave = () => {
    if (dragArea.value) {
        dragArea.value.classList.add('bg-gray-100')
        dragArea.value.classList.remove('bg-green-300')
    }
}

const drop = (event: DragEvent) => {
    event.preventDefault()
    if (dragArea.value) {
        dragArea.value.classList.add('bg-gray-100')
        dragArea.value.classList.remove('bg-green-300')
    }

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        fileInput.value!.files = event.dataTransfer.files
        onChange() // Trigger the onChange event manually
    }
}

const uploadFile = (file: File) => {
    console.log("poslan file")
}


</script>

<style></style>
