<!-- ModuleContent.vue -->
<template>


    <Accordion class="mb-4">
        <AccordionTab v-for="module in props.modules" :key="module.id">
            <template #header>
                <div class="flex justify-between items-center w-full">
                    <span class="font-bold">{{ module.title }}</span>
                    <Badge :value="module.lessons?.length || 0" severity="info" />
                </div>
            </template>


            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <p class="text-gray-600">{{ module.description }}</p>
                    <div class="flex gap-2" v-if="isEditable">
                        <Button v-if="module.id" icon="pi pi-plus" label="Add Lesson"
                            @click="$emit('add-lesson', module.id)" class="p-button-outlined" />
                        <Button v-if="module.id" icon="pi pi-trash" @click="$emit('delete-module', module.id)"
                            class="p-button-danger p-button-outlined" />
                    </div>
                </div>

                <LessonList v-if="module.lessons" :lessons="module.lessons"
                    @add-assignment="(lessonId) => $emit('add-assignment', module.id as string, lessonId)"
                    @update-assignment="(lessonId, assignment) => $emit('update-assignment', lessonId, assignment)"
                    @delete-lesson="(lessonId) => $emit('delete-lesson', module.id as string, lessonId)"
                    :isEditable="isEditable" />


                <TabView>
                    <TabPanel header="Assignments">
                        <AssignmentList :assignments="module.assignments" v-if="module.assignments"
                            v-memo="[module.assignments.length]"
                            @update-assignment="(updatedAssignment) => $emit('update-assignment', module.id!, updatedAssignment)"
                            :isEditable="isEditable" />
                    </TabPanel>

                    <TabPanel header="Materials">
                        <MaterialList :materials="module.fileIds" :lessonId="undefined"
                            @delete-material="(materialId) => $emit('delete-material', module.id!, materialId)"
                            :isEditable="isEditable" />


                    </TabPanel>
                </TabView>
            </div>
        </AccordionTab>
    </Accordion>


</template>

<script lang="ts" setup>
import type { Assignment, Module } from '@/types';
import LessonList from './LessonsList.vue';
import { onMounted, watch } from 'vue';
import AssignmentList from './AssignmentList.vue';
import MaterialList from './MaterialList.vue';

const props = defineProps<{
    modules: Module[];
    isEditable: boolean;
}>();

onMounted(() => {
    console.log('modules loaded: ' + props.modules.length);
});
watch(
    () => props.modules,
    (newModules) => {
        console.log('Modules updated:', newModules.length);
        // Optional: debug the actual content
        // console.log('Modules:', newModules);
    },
    { deep: true } // if modules is array of objects, deep watch helps
);
defineEmits<{
    (e: 'add-lesson', moduleId: string): void;
    (e: 'delete-lesson', moduleId: string, lessonId: string): void;
    (e: 'delete-module', moduleId: string): void;
    (e: 'add-assignment', moduleId: string, lessonId: string): void;
    (e: 'update-assignment', lessonId: string, assignment: Assignment): void;
    (e: 'delete-material', lessonId: string, materialId: string): void;
}>();
</script>