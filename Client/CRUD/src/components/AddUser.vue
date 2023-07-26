<template>
    <div class="submit-form">
        <div v-if="!submitted">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" class="form-control" id="name" required v-model="user.name" name="name" />
            </div>

            <div class="form-group">
                <label for="username">Username</label>
                <input class="form-control" id="username" required v-model="user.username" name="username" />
            </div>

            <div class="form-group">
                <label for="role">Role</label>
                <input class="form-control" id="role" required v-model="user.role" name="role" />
            </div>

            <button @click="saveUser" class="btn btn-success">Submit</button>
        </div>

        <div v-else>
            <h4>You submitted successfully!</h4>
            <button class="btn btn-success" @click="newUser">Add</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineComponent } from "vue";
import UserDataService from "../services/UserDataService";
import type User from "@/types/User";
import type ResponseData from "@/types/ResponseData";


var user = <User>{
    id: null,
    name: "",
    username: "",
    role: ""
};
var submitted = false;



function saveUser() {
    let data = {
        title: user.name,
        username: user.username,
    };

    UserDataService.create(data)
        .then((response: ResponseData) => {
            user.id = response.data.id;
            console.log(response.data);
            submitted = true;
        })
        .catch((e: Error) => {
            console.log(e);
        });
}

function newUser() {
    submitted = false;
    user = <User>{};
}


</script>

<style>
.submit-form {
    max-width: 300px;
    margin: auto;
}
</style>@/types/User../services/UserDataService