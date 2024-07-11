<template>
    <Form @submit="onSubmit" :validation-schema="schema" class="flex flex-col items-center" v-slot="{ errors }">
        <Card style="width: 25em">
            <template #title>
                <h2>Register</h2>
            </template>
            <template #content>
                <div class="flex flex-col items-center">
                    <Field name="username" v-model="user.username" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <InputText id="username" v-model="user.username" v-bind="field" type="text"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="username">Username</label>
                        </span>
                        <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                    </Field>
                    <Field name="password" v-model="user.password" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <Password id="password" v-model="user.password" v-bind="field" :feedback="false"
                                promptLabel="Choose a password" weakLabel="Too simple" mediumLabel="Average complexity"
                                strongLabel="Complex password" ref="password" :class="{ 'p-invalid': errorMessage }" />
                            <label for="password">Password</label>
                        </span>
                        <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                    </Field>
                    <Field name="name" v-model="user.name" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <InputText id="name" v-model="user.name" v-bind="field" type="text"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="name">First name</label>
                        </span>
                        <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                    </Field>
                    <Field name="lastName" v-model="user.lastName" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <InputText id="lastName" v-model="user.lastName" v-bind="field" type="text"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="lastName">Last Name</label>
                        </span>
                        <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                    </Field>
                    <Field name="email" v-model="user.email" v-slot="{ field, errorMessage }">
                        <span class="p-float-label">
                            <InputText id="email" v-model="user.email" v-bind="field" type="text"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="email">Email</label>
                        </span>
                        <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                    </Field>
                </div>
            </template>
            <template #footer>
                <Button label="Register" type="submit" :disabled="loading"></Button>
            </template>
        </Card>
    </Form>
    <Toast />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Form, Field, ErrorMessage } from "vee-validate";
import AuthService from "@/services/AuthService";
import { object, string } from "yup";
import { useToast } from "primevue/usetoast";
import type UserDetails from "@/types/User/UserDetails";
import {Role, RoleEnum} from "@/types/Role";

const loading = ref(false);
const user = <UserDetails>{
    id: "",
    name: "",
    lastName: "",
    username: "",
    password: "",
    roles: [RoleEnum.Admin],
    email: ""
};

const router = useRouter();

const schema = object({
    username: string().required("Username is required"),
    password: string().required("Password is required"),
});

const toast = useToast();

async function onSubmit() {
    loading.value = true;
    try {
        const userRespons = await AuthService.signUp(user);
        if(!userRespons){
            showToast("error", "error");
            return;
        }

        showToast("Registration successful! You can now log in.", "success");
        clearForm();

        await new Promise((resolve) => setTimeout(resolve, 2000))

        router.push({ name: "signin" }); // Redirect to login page
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        showToast(errorMessage, "error");
    }
    loading.value = false;
}

function showToast(message: string, severityType: "error" | "success" | "info" | "warn") {
    toast.add({
        severity: severityType,
        summary: severityType === "error" ? "Error" : "Success",
        detail: message,
        life: 10000,
    });
}

function extractErrorMessage(error: any): string {
    if (typeof error === "string") {
        return error;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (error instanceof Object && "response" in error) {
        const responseData = error.response.data;
        if (responseData && responseData.message) {
            return responseData.message;
        }
    }
    return "An error occurred";
}

function clearForm() {
    user.username = "";
    user.password = "";
    user.name = "";
    user.lastName = "";
    user.email = "";
}
</script>

<style scoped></style>
@/types/User/UserDetails