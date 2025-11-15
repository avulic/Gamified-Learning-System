<template>

    <Accordion class="mb-4">
        <AccordionTab v-if="lessons" v-for="lesson in lessons" :key="lesson.id">
            <template #header>
                <div class="flex justify-between items-center w-full">
                    <span class="font-bold">{{ lesson.title }}</span>
                    <div class="flex items-center gap-2">
                        <Badge :value="lesson.assignments?.length || 0" severity="info" />
                        <!-- <Button v-if="lesson.id" icon="pi pi-trash"
                            class="p-button-danger p-button-outlined p-button-sm"
                            @click.stop.prevent="$emit('delete-lesson', module.id as string, lesson.id)" /> -->
                    </div>
                </div>
            </template>


            <div class="p-4">
                <div class="flex justify-between items-center mb-4">
                    <p class="text-gray-600">{{ lesson.description }}</p>
                    <Button v-if="lesson.id && isEditable" icon="pi pi-plus" label="Add Assignment"
                        @click="$emit('add-assignment', lesson.id)" class="p-button-outlined p-button-sm" />
                </div>

                <TabView>
                    <TabPanel header="Assignments">
                        <AssignmentList :assignments="lesson.assignments" v-if="lesson.assignments"
                            @update-assignment="(updatedAssignment) => $emit('update-assignment', lesson.id!, updatedAssignment)"
                            :isEditable="isEditable" />
                    </TabPanel>

                    <TabPanel header="Materials">
                        <MaterialList :materials="lesson.files" :lessonId="lesson.id"
                            @delete-material="(materialId) => $emit('delete-material', lesson.id!, materialId)"
                            :isEditable="isEditable" />

                    </TabPanel>
                </TabView>
            </div>
        </AccordionTab>
    </Accordion>



</template>

<script lang="ts" setup>
import type { Assignment, Lesson } from '@/types';
import AssignmentList from '@/features/assignments/components/AssignmentList.vue';
import MaterialList from '@/features/materials/components/MaterialList.vue';
import { onMounted, watch } from 'vue';

const props = defineProps<{
    lessons: Lesson[];
    assignment?: Assignment[];
    isEditable: boolean;
}>();


defineEmits<{
    (e: 'delete-lesson', lessonId: string): void;
    (e: 'add-assignment', lessonId: string): void;
    (e: 'delete-material', lessonId: string, materialId: string): void;
    (e: 'update-assignment', lessonId: string, assignment: Assignment): void;
}>();

onMounted(() => {
    console.log('lessons loaded: ' + props.lessons.forEach(lesson => lesson.files!.length));
});


</script>