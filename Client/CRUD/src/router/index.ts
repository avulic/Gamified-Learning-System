import AuthService from '@/services/AuthService';
import { RoleEnum } from '@/types/enums';
import { createRouter, createWebHistory } from 'vue-router';


const router = createRouter({
    history: createWebHistory((import.meta as any).env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue')
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('../views/AboutView.vue'),
            meta: { authorize: [RoleEnum.ADMIN] }
        },
        {
            path: '/students/courses',
            name: 'students/courses',
            component: () => import('@/views/student/CourseView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/students/courses/:id',
            name: 'students/courses/detail',
            component: () => import('@/views/course/CourseDetailsProfesor.vue') // New file, see below
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('@/views/stuff/DashboardView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/questMapper',
            name: 'questMapper',
            component: () => import('@/views/stuff/profesor/QuestMapperView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('@/views/ProfileView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/signin',
            name: 'signin',
            component: () => import('@/views/auth/SignInView.vue')
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('@/views/auth/SignUpView.vue')
        },
        {
            path: '/error',
            name: 'error',
            component: () => import('../views/ErrorView.vue')
        },
    ]
});

// Enhanced router guard with proper type narrowing
router.beforeEach(async (to, from, next) => {
    const authorize = to.meta.authorize as RoleEnum[] | undefined;

    if (authorize !== undefined && authorize.length > 0) {
        try {
            const userLoggedIn = AuthService.isAuthenticated();
            if (!userLoggedIn) {
                return next({
                    name: 'signin',
                    query: { returnUrl: to.path }
                });
            }

            // Public route check
            if (authorize.length === 0) {
                return next();
            }

            // Permission verification
            const userHasPermission = AuthService.currentUserHasPermission(authorize);
            if (!userHasPermission) {
                return next({ name: 'error' });
            }

            return next();
        } catch (err) {
            console.error('Error in router guard:', err);
            return next({ name: 'error' });
        }
    }

    // Route has no authorization requirements
    next();
});

export default router;
