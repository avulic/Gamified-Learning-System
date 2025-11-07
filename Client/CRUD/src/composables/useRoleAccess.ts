import { computed } from 'vue'
import AuthService from '@/services/AuthService'
import { RoleEnum } from '@/types/enums'

export function useRoleAccess() {
    const currentUser = computed(() => AuthService.getCurentUserValues())

    const isAdmin = computed(() =>
        AuthService.currentUserHasPermission([RoleEnum.ADMIN])
    )

    const isProfessor = computed(() =>
        AuthService.currentUserHasPermission([RoleEnum.PROFESSOR])
    )

    const canAccessAllCourses = computed(() => isAdmin.value)
    const canAccessAllUsers = computed(() => isAdmin.value)
    const canAccessAllModules = computed(() => isAdmin.value)
    const canManageAssignments = computed(() => isAdmin.value || isProfessor.value)

    return {
        currentUser,
        isAdmin,
        isProfessor,
        canAccessAllCourses,
        canAccessAllUsers,
        canAccessAllModules,
        canManageAssignments
    }
}