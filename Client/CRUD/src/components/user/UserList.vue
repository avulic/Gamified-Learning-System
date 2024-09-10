<template>
    <div class="p-4">
        <div class="flex justify-between mb-4">
            <Button label="New User" icon="pi pi-plus" @click="openNewUserModal" class="p-button-succes" />
            <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
            </span>
        </div>

        <DataTable :value="users" :paginator="true" :rows="10" :globalFilterFields="['name', 'username', 'email']"
            :filters="filters" responsiveLayout="scroll" dataKey="id" :rowHover="true" v-model:selection="selectedUsers"
            :loading="loading">
            <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
            <Column field="name" header="Name" :sortable="true"></Column>
            <Column field="lastName" header="Last Name" :sortable="true"></Column>
            <Column field="username" header="Username" :sortable="true"></Column>
            <Column field="email" header="Email" :sortable="true"></Column>
            <Column field="roles" header="Roles">
                <template #body="slotProps">
                    <Chip v-for="role in slotProps.data.roles" :key="role" :label="role" class="mr-2" />
                </template>
            </Column>
            <Column header="Actions">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" @click="editUser(slotProps.data)"
                        class="p-button-rounded p-button-success mr-2" />
                    <Button icon="pi pi-trash" @click="confirmDeleteUser()" class="p-button-rounded p-button-danger" />
                </template>
            </Column>
        </DataTable>

        <Dialog v-model:visible="showModal" :style="{}" header="User Details" :modal="true" class="p-fluid">
            <Details :currentUser="null" @onSaveUser="confirm1()" @onDeleteUser="confirmDeleteUser()"></Details>
        </Dialog>

        <ConfirmDialog></ConfirmDialog>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from 'primevue/api';
import { Form, ErrorMessage } from 'vee-validate';
import * as yup from 'yup';
import UserService from '@/services/UserService';
import type UserDetails from '@/types/User/UserDetails';
import Details from '@/components/user/Details.vue';
import { RoleEnum, isValidRole } from '@/types/Role';



const toast = useToast();
let confirm = useConfirm();



const users = ref<UserDetails[]>([]);
const user = ref<UserDetails>({
    id: '',
    name: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    roles: [""],
});
const selectedUsers = ref();
const showModal = ref(false);
const loading = ref(false);

const filters = reactive({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const availableRoles = Object.values(RoleEnum).map(role => ({ name: role }));

const schema = yup.object({
    name: yup.string().required('Name is required'),
    lastName: yup.string().required('Last name is required'),
    username: yup.string().required('Username is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    roles: yup.array().of(
        yup.string().test({
            name: 'is-valid-role',
            message: 'Invalid role',
            test: (value) => value !== undefined && isValidRole(value),
        })
    ).min(1, 'At least one role is required'),
});

onMounted(async () => {
    await loadUsers();
});

async function loadUsers() {
    loading.value = true;
    try {
        users.value = await UserService.getAllUsers() as any;
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users', life: 3000 });
    } finally {
        loading.value = false;
    }
}

function openNewUserModal() {
    user.value = { id: '', name: '', lastName: '', username: '', email: '', password: '', roles: [""] };
    showModal.value = true;
}




const confirm1 = () => {
    confirm.require({
        message: 'Are you sure you want to proceed?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        rejectLabel: 'Cancel',
        acceptLabel: 'Save',
        accept: () => {
            toast.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted', life: 3000 });
            saveUser();
        },
        reject: () => {
            toast.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
        }
    });
};

function confirmDeleteUser() {
    if (confirm) {
        confirm.require({
            message: 'Are you sure you want to delete this user?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteUser(user.value.id),
        });
    } else {
        // Fallback if confirmation service is not available
        if (window.confirm('Are you sure you want to delete this user?')) {
            deleteUser(user.value.id);
        }
    }
}

async function deleteUser(id: string) {
    try {
        await UserService.deleteUser(id);
        toast.add({ severity: 'success', summary: 'Success', detail: 'User deleted', life: 3000 });
        await loadUsers();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete user', life: 3000 });
    }
}

function editUser(editUser: UserDetails) {
    user.value = { ...editUser, password: '' }; // Clear password when editing
    showModal.value = true;
}

async function saveUser() {
    try {
        if (user.value.id) {
            await UserService.updateUser(user.value.id, user.value);
            toast.add({ severity: 'success', summary: 'Success', detail: 'User updated', life: 3000 });
        } else {
            await UserService.createUser(user.value);
            toast.add({ severity: 'success', summary: 'Success', detail: 'User created', life: 3000 });
        }
        showModal.value = false;
        await loadUsers();
    } catch (error) {
        toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save user', life: 3000 });
    }
}

</script>

<style scoped>
/* Add any additional component-specific styles here */
</style>