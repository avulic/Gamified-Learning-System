<script setup lang="ts">
import UserList from '../components/user/UserList.vue';
import Profile from '../components/user/Profile.vue';
import UserDetails from '../types/User/UserDetails';
import Course from '../types/Course';
import { Submission } from '../types/Submission';
</script>

<template>
    <main>
        <Profile />
        <UserList />
    </main>
</template>
