<template>
    <div v-if="open" @click.outside="open = false" class="relative w-[30rem]">
        <button @click="toggle" :class="{ 'ring-blue-600': open }"
            class="flex w-full items-center justify-between rounded bg-white p-2 ring-1 ring-gray-300">
            <span>{{ language || placeholder }}</span>
            <i class="fas fa-chevron-down text-xl"></i>
        </button>

        <ul v-show="open" class="z-2 absolute mt-1 w-full rounded bg-gray-50 ring-1 ring-gray-300">
            <li v-for="(option, index) in options" :key="index" class="cursor-pointer select-none p-2 hover:bg-gray-200"
                @click="selectLanguage(option)">
                {{ option }}
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { ref, } from 'vue';


const props = defineProps<{
    options: string[],
    placeholder: string
}>();

const emit = defineEmits<{
    selected: [val: string]
}>()


const open = ref(false);
const language = ref('');

const toggle = () => {
    open.value = !open.value;
};

const selectLanguage = (val: string) => {
    language.value = val;
    open.value = false;
    emit('selected', val);
};
</script>
