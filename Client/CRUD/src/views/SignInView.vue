<template>
    <Form @submit="onSubmit" :validation-schema="schema" class="flex flex-col items-center" v-slot="{ errors, values }">
        <Card style="width: 25em">
            <template #title>
                <h2>Login</h2>
            </template>
            <template #content>
                <div class="flex flex-col items-center">
                    <Field name="username" v-model="user.username" v-slot="{ field, errorMessage }">
                        <span class="p-float-label ">
                            <InputText id="username" v-model="user.username" v-bind="field" type="text"
                                :class="{ 'p-invalid': errorMessage }" />
                            <label for="username">Username</label>
                        </span>
                        <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                    </Field>

                    <Field id="password" name="password" v-model="user.password" v-slot="{ field, errorMessage }">
                        <span class="p-float-label ">
                            <Password id="password" v-model="user.password" v-bind="field" :feedback="false"
                                promptLabel="Choose a password" weakLabel="Too simple" mediumLabel="Average complexity"
                                strongLabel="Complex password" ref="password" :class="{ 'p-invalid': errorMessage }" />
                            <label for="username">Password</label>
                        </span>
                        <small class="p-error" id="text-error">{{ errorMessage || '&nbsp;' }}</small>
                    </Field>
                </div>
            </template>
            <template #footer>
                <Button label="Login" type="submit" :disabled="loading"></Button>
            </template>
        </Card>
    </Form>
    <Toast />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Form, Field } from "vee-validate";
import type UserSignIn from "@/types/User/UserSignIn";
import AuthService from "@/services/AuthService";

import { object, string} from 'yup';
import { useToast } from 'primevue/usetoast';

const loading = ref(false);
const user: UserSignIn = (<UserSignIn>{ username: "", password: "" });
const message = ref("");

const router = useRouter();

const schema = object({
    username: string().required(),
    password: string().required(),
});

async function onSubmit() {
    loading.value = true;
    try {
        const response = await AuthService.signIn(user);
        console.log(response.token);
        AuthService.setToken(response.token);
        router.push('/');
    } catch (error) {
        const errorMessage = extractErrorMessage(error);
        message.value = errorMessage;
        showToast(errorMessage, 'error');
        //console.log(errorMessage)
    } finally { // This block will be executed regardless of success or error
        loading.value = false;
    }
}

const toast = useToast();

function showToast(message: string, severityType: "error" | "success" | "info" | "warn") {
    toast.add({
        severity: severityType,
        summary: severityType === 'error' ? 'Error' : 'Success', // Customize summary text if needed
        detail: message,
        life: 4000
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

<style scoped></style>@/types/User/Jwt