<template>
    <div class="p-4 bg-gray-200">
        <div v-if="showEdit" class=" top-0 left-0 mt-4 ml-4">
            <div class="flex px-3 mb-6 md:mb-0">
                <InputSwitch name="edit" v-model="isEditable" class="" />
                <div class="ml-2" for="edit">Edit user</div>
            </div>
        </div>
        <Form @submit="onSubmit" :validation-schema="schema" class="flex flex-col items-center"
            v-slot="{ errors, values }">
            <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-1/2 px-3">
                        <Field name="name" v-model="currentUser.name" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <label for="name">First Name</label>
                                <InputText id="name" v-model="currentUser.name" v-bind="field" type="text"
                                    class="md:w-full" :disabled="!isEditable" />
                            </span>
                            <ErrorMessage name="name" class="text-red-600" />
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="lastName" v-model="currentUser.lastName" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <label for="lastName">Last Name</label>
                                <InputText id="lastName" v-model="currentUser.lastName" v-bind="field" type="text"
                                    class="md:w-full" :disabled="!isEditable" />
                            </span>
                            <ErrorMessage name="lastName" class="text-red-600" />
                        </Field>
                    </div>
                </div>
                <div class="-mx-3 md:flex mb-6">
                    <div class="md:w-full px-3">
                        <Field name="username" v-model="currentUser.username" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <label for="username">User Name</label>
                                <InputText id="username" v-model="currentUser.username" v-bind="field" type="text"
                                    class="md:w-full" :disabled="!isEditable" />
                            </span>
                            <ErrorMessage name="username" class="text-red-600" />
                        </Field>
                    </div>
                </div>
                <div class="-mx-3 md:flex mb-2">
                    <div class="md:w-1/2 px-3 mb-6 md:mb-0">
                        <Field name="password" v-model="currentUser.password" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <label for="password">Password</label>
                                <Password id="password" v-model="currentUser.password" v-bind="field" :feedback="false"
                                    promptLabel="Choose a password" weakLabel="Too simple"
                                    mediumLabel="Average complexity" strongLabel="Complex password" ref="password"
                                    :disabled="!isEditable" />
                            </span>
                            <ErrorMessage name="password" class="text-red-600" />
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="roles" v-model="currentUser.roles" v-slot="{ field, errorMessage }">
                            <span class="p-float-label">
                                <label for="dropdown">Select a Roles</label>
                                <MultiSelect v-model="selectedOptions" v-bind="field" display="chip"
                                    :options="roleOptions" optionLabel="name" optionValue="name"
                                    placeholder="Select roles" :maxSelectedLabels="3" class="w-full md:w-20rem"
                                    :disabled="!isEditable" />
                            </span>
                            <ErrorMessage name="roles" class="text-red-600" />
                        </Field>
                    </div>
                    <div class="md:w-1/2 px-3">
                        <Field name="email" v-model="currentUser.email" v-slot="{ field, errorMessage }">
                            <span class="p-float-label ">
                                <label for="email">Email</label>
                                <InputText id="email" v-model="currentUser.email" v-bind="field" type="text"
                                    :disabled="!isEditable" />
                            </span>
                            <ErrorMessage name="email" class="text-red-600" />
                        </Field>
                    </div>
                </div>
            </div>
            <div>
                <Button label="Save" type="submit" :disabled="loading || !isEditable" />
                <Button class="text-white bg-red-700" label="Delete" type="button" @click="deleteUser"
                    :disabled="loading || !isEditable" />
            </div>
        </Form>
    </div>
    <Toast />
</template>

<script setup lang="ts">
import { ref, computed, type Ref, nextTick, onMounted } from 'vue'
import UserService from '@/services/UserService'
import type UserDetails from '@/types/User/UserDetails'
import { Form, Field, ErrorMessage } from "vee-validate";
import { object, string } from "yup";
import AuthService from '@/services/AuthService';
import { useToast } from 'primevue/usetoast';
import { useRouter } from "vue-router";
import { RoleEnum } from '@/types/Role';

const loading = ref(false);
const isEditable = ref(true);

const schema = object({
    name: string().required("name is required"),
    username: string().required("Username is required"),
    password: string().required("Password is required"),
});

const currentUser = ref(<UserDetails>{
    id: "",
    name: "",
    lastName: "",
    username: "",
    password: "",
    roles: [{}],
    email: ""
});

const selectedOptions = ref();
const roleOptions = ref([
    { name: RoleEnum.Student },
    { name: RoleEnum.Professor },
    { name: RoleEnum.Admin },
    { name: RoleEnum.User }
]);

const props = defineProps<{
    currentUser: UserDetails | null
}>()

const emit = defineEmits<{
    onSaveUser: [user: UserDetails];
    onEditUser: [user: UserDetails];
    onDeleteUser: [user: string];
}>()

const showEdit = computed(() => {
    return props.currentUser !== null && props.currentUser.name.length > 0;
});

onMounted(() => {
    if (props.currentUser !== null && props.currentUser.name.length > 0) {
        currentUser.value = props.currentUser;
        selectedOptions.value = props.currentUser.roles.map(role => {
            return roleOptions.value.find(option => option.name === role)?.name
        });

        isEditable.value = false;
    }
});



const onSubmit = () => {
    // currentUser.value.roles = selectedOptions.value.map((roleName: string) => {
    //     const roleOption = roleOptions.value.find(option => option.name === roleName);
    //     return roleOption ? { name: roleOption.name } : null;
    // });


    if (!props.currentUser) {
        emit('onSaveUser', currentUser.value)
        clearForm();
    }
    emit('onEditUser', currentUser.value)
}

function deleteUser() {
    emit('onDeleteUser', currentUser.value.id)
    console.log(currentUser.value.id)
}

function clearForm() {
    currentUser.value.username = "";
    currentUser.value.password = "";
    currentUser.value.name = "";
    currentUser.value.lastName = "";
    currentUser.value.email = "";
}


</script>
<style scoped></style>
@/types/User/User@/types/User/UserDetails