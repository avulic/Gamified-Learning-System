<template>
    <div class="p-4 bg-gray-200">
        <div v-if="defaultValues" class=" top-0 left-0 mt-4 ml-4">
            <div class="flex px-3 mb-6 md:mb-0">
                <InputSwitch name="edit" v-model="checked" class="" />
                <div class="ml-2" for="name">Edit this user</div>
            </div>
        </div>

        <Form @submit="onSubmit" :validation-schema="schema" class="flex flex-col items-center" v-slot="{ errors, values }">
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-1/2 px-3">
                        <Field name="firstName" v-model="currentUser.name" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <InputText id="username" v-model="currentUser.name" v-bind="field" type="text"
                                    :class="{ 'p-invalid': errorMessage }" class="md:w-full" />
                                <label for="username">First Name</label>
                            </span>
                            <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="firstName" v-model="currentUser.name" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <InputText id="username" v-model="currentUser.name" v-bind="field" type="text"
                                    :class="{ 'p-invalid': errorMessage }" class="md:w-full" />
                                <label for="username">First Name</label>
                            </span>
                            <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                        </Field>
                    </div>
                </div>
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-full px-3">
                        <Field name="firstName" v-model="currentUser.name" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <InputText id="username" v-model="currentUser.name" v-bind="field" type="text"
                                    :class="{ 'p-invalid': errorMessage }" class="md:w-full" />
                                <label for="username">First Name</label>
                            </span>
                            <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                        </Field>
                    </div>
                </div>
                <div class="-mx-3 md:flex mb-2">
                    <div class="md:w-1/2 px-3 mb-6 md:mb-0">
                        <Field name="firstName" v-model="currentUser.name" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <InputText id="username" v-model="currentUser.name" v-bind="field" type="text"
                                    :class="{ 'p-invalid': errorMessage }" />
                                <label for="username">First Name</label>
                            </span>
                            <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="lastName" v-model="currentUser.name" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <Dropdown v-model="selectedRole" :options="roleOptions" optionLabel="roles"
                                    placeholder="Select a City" class="w-full md:w-14rem" />
                            </span>
                            <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="firstName" v-model="currentUser.name" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <InputText id="username" v-model="currentUser.name" v-bind="field" type="text"
                                    :class="{ 'p-invalid': errorMessage }" />
                                <label for="username">First Name</label>
                            </span>
                            <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                        </Field>
                    </div>
                </div>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type Ref, nextTick, onBeforeMount } from 'vue'
import UserService from '@/services/UserService'
import type User from '@/types/User/User'
import type ResponseData from '@/types/ResponseData'
import { Form, Field } from "vee-validate";
import { object, string } from "yup";
import router from '@/router';
import AuthService from '@/services/AuthService';
import { useToast } from 'primevue/usetoast';

const loading = ref(false);
const checked = ref(false);

const schema = object({
    firstName: string().required("First Name is required"),
    lastName: string(),
    password: string(),
    city: string(),
    role: string(),
    zip: string(),
});

const currentUser: User = {
    id: "",
    name: "",
    password: "",
    role: "",
    email: "",
    username: "",
    token: null
};

const defaultValues = false;
const selectedRole = ref();



const roleOptions = ref([
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' }
]);

defineProps<{
    currentUser: User
}>()

const emit = defineEmits<{
    onSaveUser: []
    onToggleDropdown: [value: number]
}>()

async function onSubmit() {
    loading.value = true;
    try {
        const response = await AuthService.signUp(currentUser);
        if (response) {
            //currentUser.token = response;
            //AuthService.setUserToLocalStorage(response);
            router.push('/');
        }
    } catch (error) {
        console.log(error)
        const errorMessage = extractErrorMessage(error);
        //message.value = errorMessage;
        showToast(errorMessage, 'error');
    }
    loading.value = false;
}

const toast = useToast();

function showToast(message: string, severityType: "error" | "success" | "info" | "warn") {
    toast.add({
        severity: severityType,
        summary: severityType === 'error' ? 'Error' : 'Success', // Customize summary text if needed
        detail: message,
        life: 3000
    });
}

function extractErrorMessage(error: any): string {
    if (typeof error === 'string') {
        return error;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (error instanceof Object && 'response' in error) {
        const responseData = error.response.data;
        if (responseData && responseData.message) {
            return responseData.message;
        }
    }

    return 'An error occurred';
}

</script>

@/types/User/User