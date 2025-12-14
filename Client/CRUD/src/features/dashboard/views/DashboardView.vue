<template>
    <div class="min-h-screen flex bg-gray-50">

        <!-- Sidebar -->
        <aside class="w-64 bg-white shadow-sm border-r border-gray-200 px-6 py-6">
            <h2 class="text-xl font-bold mb-6">LMS Panel</h2>

            <SidebarItem label="📘 Courses" value="courses" :active="selectedView === 'courses'"
                @click="setView('courses')" />
            <SidebarItem v-if="canAccessAllUsers" label="👥 Users" value="users" :active="selectedView === 'users'"
                @click="setView('users')" />
            <SidebarItem label="📚 Modules" value="modules" :active="selectedView === 'modules'"
                @click="setView('modules')" />
            <SidebarItem v-if="canManageAssignments" label="📝 Assignments" value="assignments"
                :active="selectedView === 'assignments'" @click="setView('assignments')" />

            <div class="border-t border-gray-200 mt-6 pt-4">
                <SidebarItem label="⚙️ Settings" />
                <SidebarItem label="❓ Help" />
            </div>
        </aside>

        <!-- Main Area -->
        <div class="flex-1 flex flex-col">

            <!-- Top Bar -->
            <header class="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h1 class="text-xl font-bold capitalize">{{ selectedView }}</h1>
                </div>
            </header>

            <!-- Content Wrapper -->
            <main class="p-6">

                <!-- LIST MODE -->
                <div v-if="!detailMode">
                    <UserList v-if="selectedView === 'users'" @openDetails="openDetails" />
                    <CourseList v-if="selectedView === 'courses'" @openDetails="openDetails"
                        :instructor-id="instructorId" />
                    <ModuleList v-if="selectedView === 'modules'" :modules="[]" :is-editable="false"
                        @openDetails="openDetails" />
                    <AssignmentList v-if="selectedView === 'assignments'" :assignments="[]" :is-editable="false"
                        @openDetails="openDetails" />
                </div>

                <!-- DETAILS MODE -->
                <div v-else>
                    <Button icon="pi pi-arrow-left" label="Back" class="mb-4 p-button-text" @click="closeDetails" />

                    <component :is="activeDetailComponent" :item="detailData" :isEditable="true" @close="closeDetails"
                        @saved="reloadList" />
                </div>

            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, defineComponent, h } from "vue";

import UserList from "@/features/profile/components/UserList.vue";
import CourseList from "@/features/courses/components/CourseList.vue";
import ModuleList from "@/features/modules/components/ModuleList.vue";
import AssignmentList from "@/features/assignments/components/AssignmentList.vue";

import CourseDetails from "@/features/courses/components/Details.vue";

import { useRoleAccess } from "@/composables/useRoleAccess";

const { canAccessAllUsers, canManageAssignments, isProfessor, currentUser } = useRoleAccess();

const selectedView = ref<"courses" | "users" | "modules" | "assignments">("courses");

const detailMode = ref(false);
const activeDetailComponent = ref();
const detailData = ref(null);

const instructorId = computed(() => (isProfessor.value ? currentUser.value?.id : undefined));

function setView(view: any) {
    selectedView.value = view;
    detailMode.value = false;
}


function openDetails(item: any) {
    detailMode.value = true;

    if (selectedView.value === "courses") {

        activeDetailComponent.value = CourseDetails;
        detailData.value = item.id;
    }
}

function closeDetails() {
    detailMode.value = false;
}

function reloadList() {
    closeDetails();
}



const SidebarItem = defineComponent({
    name: "SidebarItem",
    props: {
        label: String,
        value: String,
        active: Boolean
    },
    emits: ["click"],
    setup(props, { emit }) {
        return () =>
            h(
                "div",
                {
                    class:
                        "px-3 py-2 rounded cursor-pointer text-sm mb-1 " +
                        (props.active
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700 hover:bg-gray-100"),
                    onClick: () => emit("click", props.value)
                },
                props.label
            );
    }
});
</script>
