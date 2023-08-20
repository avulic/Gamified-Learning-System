<template>
    <div v-if="!submitted" class="p-4 bg-gray-200">
        <div class="flex items-center">
            <div class="mr-2">
                <img class="w-6 h-6 rounded-full" />
            </div>
            <span class="font-medium"></span>
        </div>

        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
            <div class="-mx-3 md:flex mb-6">
                <div class="md:w-1/2 px-3 mb-6 md:mb-0">
                    <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                        for="grid-first-name">
                        First Name
                    </label>
                    <input
                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-red rounded py-3 px-4 mb-3"
                        id="grid-first-name" type="text" placeholder="">
                    <p class="text-red text-xs italic">Please fill out this field.</p>
                </div>
                <div class="md:w-1/2 px-3">
                    <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                        for="grid-last-name">
                        Last Name
                    </label>
                    <input
                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4"
                        id="grid-last-name" type="text" placeholder="">
                </div>
            </div>
            <div class="-mx-3 md:flex mb-6">
                <div class="md:w-full px-3">
                    <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
                        for="grid-password">
                        Password
                    </label>
                    <input
                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4 mb-3"
                        id="grid-password" type="password" placeholder="******************">
                    <p class="text-grey-dark text-xs italic">Make it as long and as
                        crazy as you'd like</p>
                </div>
            </div>
            <div class="-mx-3 md:flex mb-2">
                <div class="md:w-1/2 px-3 mb-6 md:mb-0">
                    <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" for="grid-city">
                        City
                    </label>
                    <input
                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4"
                        id="grid-city" type="text" placeholder="">
                </div>
                <div class="md:w-1/2 px-3">
                    <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" for="grid-state">
                        Role
                    </label>
                    <div class="relative">
                        <select
                            class="block appearance-none w-full bg-grey-lighter border border-grey-lighter text-grey-darker py-3 px-4 pr-8 rounded"
                            id="grid-state">
                            <option>Student</option>
                            <option>Profesor</option>
                        </select>


                    </div>
                </div>
                <div class="md:w-1/2 px-3">
                    <label class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2" for="grid-zip">
                        Zip
                    </label>
                    <input
                        class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-3 px-4"
                        id="grid-zip" type="text" placeholder="">
                </div>
            </div>
            <div class="flex justify-between">
                <button @click="newUser" class="mt-4 px-4 py-2 bg-green-500 text-white rounded">Save</button>
                <button @click="$emit('toggleDropdown', -1)"
                    class="mt-4 px-4 py-2 bg-red-500 text-white rounded">Close</button>
            </div>
        </div>
    </div>

    <div v-else>
        <h4>You submitted successfully!</h4>
    </div>
</template>

<script setup lang="ts">
import { defineComponent } from "vue";
import UserService from "@/services/UserService";
import type UserSignUp from "@/types/User/UserSignUp";
import type ResponseData from "@/types/ResponseData";

import DropDown from "../common/DropDown.vue";


var user: UserSignUp = {
    name: "",
    username: "",
    roles: "",
    email: "",
    password: "",
    lastName: ""
};
var submitted = false;

const options = <string[]>["Ante", "Mate"]

function saveUser() {
    UserService.createUser(user)
        .then((response: any) => {
            console.log(response);
            submitted = true;
        })
        .catch((e: Error) => {
            console.log(e);
        });
}

function newUser() {
    submitted = false;
    saveUser();
}


</script>

@/types/User/User