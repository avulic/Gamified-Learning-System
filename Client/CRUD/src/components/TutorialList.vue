<template>
    <div class="list row">
        <div class="col-md-8">
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Search by title" v-model="title" />
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary" type="button" @click="searchTitle">
                        Search
                    </button>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <h4>Tutorials List</h4>
            <ul class="list-group">
                <li class="list-group-item" :class="{ active: index == currentIndex }"
                    v-for="(tutorial, index) in tutorials" :key="index" @click="setActiveTutorial(tutorial, index)">
                    {{ tutorial.title }}
                </li>
            </ul>

            <button class="m-3 btn btn-sm btn-danger" @click="removeAllTutorials">
                Remove All
            </button>
        </div>
        <div class="col-md-6">
            <div v-if="currentTutorial.id">
                <h4>Tutorial</h4>
                <div>
                    <label><strong>Title:</strong></label> {{ currentTutorial.title }}
                </div>
                <div>
                    <label><strong>Description:</strong></label>
                    {{ currentTutorial.description }}
                </div>
                <div>
                    <label><strong>Status:</strong></label>
                    {{ currentTutorial.published ? "Published" : "Pending" }}
                </div>

                <router-link :to="'/tutorials/' + currentTutorial.id" class="badge badge-warning">Edit</router-link>
            </div>
            <div v-else>
                <br />
                <p>Please click on a Tutorial...</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import TutorialDataService from "@/services/TutorialDataService";
import type Tutorial from "@/types/Tutorial";
import type ResponseData from "@/types/ResponseData";

var tutorials = ref<Tutorial[]>([])
var currentTutorial = <Tutorial>{}
var currentIndex = -1
var title = ""


function retrieveTutorials() {
    TutorialDataService.getAll()
        .then((response: ResponseData) => {
            tutorials = response.data;
            console.log(response.data);
        })
        .catch((e: Error) => {
            console.log(e);
        });
}

function refreshList() {
    retrieveTutorials();
    currentTutorial = <Tutorial>{};
    currentIndex = -1;
}

function setActiveTutorial(tutorial: Tutorial, index = -1) {
    currentTutorial = tutorial;
    currentIndex = index;
}

function removeAllTutorials() {
    TutorialDataService.deleteAll()
        .then((response: ResponseData) => {
            console.log(response.data);
            refreshList();
        })
        .catch((e: Error) => {
            console.log(e);
        });
}

function searchTitle() {
    TutorialDataService.findByTitle(title)
        .then((response: ResponseData) => {
            tutorials = response.data;
            setActiveTutorial({} as Tutorial);
            console.log(response.data);
        })
        .catch((e: Error) => {
            console.log(e);
        });
}

onMounted(() => {
    retrieveTutorials();
})

</script>

<style>
.list {
    text-align: left;
    max-width: 750px;
    margin: auto;
}
</style>