<template>
    <div class="p-4 bg-gray-200">
        <div v-if="showEdit" class=" top-0 left-0 mt-4 ml-4">
            <div class="flex px-3 mb-6 md:mb-0">
                <InputSwitch name="edit" v-model="isEditable" class="" />
                <div class="ml-2" for="edit">Edit task</div>
            </div>
        </div>
        <Form @submit="onSubmit" :validation-schema="schema" class="flex flex-col items-center" v-slot="{ errors, values }">
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-1/2 px-3">
                        <Field name="name" v-model="currentTask.name" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <InputText id="name" v-model="currentTask.name" v-bind="field" type="text"
                                    :class="{ 'p-invalid': errorMessage }" class="md:w-full" :disabled="!isEditable" />
                                <label for="name">Task Name</label>
                            </span>
                            <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="description" v-model="currentTask.description" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <InputText id="description" v-model="currentTask.description" v-bind="field" type="text"
                                    :class="{ 'p-invalid': errorMessage }" class="md:w-full" :disabled="!isEditable" />
                                <label for="description">Task Description</label>
                            </span>
                            <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                        </Field>
                    </div>
                </div>
            </div>
            <div>
                <Button label="Save" type="submit" :disabled="loading || !isEditable" />
            </div>
        </Form>
    </div>
    <Toast />
</template>

<script setup lang="ts">
import { ref, computed, type Ref, nextTick, onMounted } from 'vue'


interface Task {
    id: string,
    name: string;
    description: string;
}

const loading = ref(false);
const isEditable = ref(true);

const schema = object({
    name: string().required("Task Name is required"),
    description: string().required("Task Description is required"),
});

const currentTask = ref(<Task>{
    id: "",
    name: "",
    description: "",
});

const props = defineProps<{
    currentTask: Task | null
}>()

const emit = defineEmits<{
    onSaveTask: [task: Task];
    onEditTask: [task: Task];
}>()

const showEdit = computed(() => {
    return props.currentTask !== null && props.currentTask.name.length > 0;
});

onMounted(() => {
    if (props.currentTask !== null && props.currentTask.name.length > 0) {
        currentTask.value = props.currentTask;
        isEditable.value = false;
    }
});

const onSubmit = () => {

    emit('onSaveTask', currentTask.value)

    emit('onEditTask', currentTask.value)
}
</script>

<style scoped></style>
