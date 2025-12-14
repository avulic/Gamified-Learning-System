import AuthService from '@/services/AuthService';
import { RoleEnum } from '@/types/enums';
import { createRouter, createWebHistory } from 'vue-router';


const router = createRouter({
    history: createWebHistory((import.meta as any).env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue')
        },
        {
            path: '/about',
            name: 'about',
            component: () => import('@/views/AboutView.vue'),
            meta: { authorize: [RoleEnum.ADMIN] }
        },
        {
            path: '/courses',
            name: 'courses',
            component: () => import('@/features/courses/views/CourseView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/courses/:courseId',
            name: 'courses/detail',
            component: () => import('@/features/courses/views/CourseDetailsView.vue'),
            props: true
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            //component: () => import('@/features/dashboard/views/ProfessorDashboardView.vue'),
            component: () => import('@/features/dashboard/views/DashboardView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/questMapper',
            name: 'questMapper',
            component: () => import('@/features/tileMap/views/QuestMapperView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/profile',
            name: 'profile',
            component: () => import('@/features/profile/ProfileView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/signin',
            name: 'signin',
            component: () => import('@/features/auth/views/SignInView.vue')
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('@/features/auth/views/SignUpView.vue')
        },
        {
            path: '/error',
            name: 'error',
            component: () => import('@/views/ErrorView.vue')
        },
    ]
});

// Enhanced router guard with proper type narrowing
router.beforeEach(async (to, from, next) => {
    try {
        const authorize = to.meta.authorize as RoleEnum[] | undefined;
        if (!authorize || authorize.length === 0) {
            return next();
        }

        const userLoggedIn = AuthService.isAuthenticated();
        if (!userLoggedIn) {
            return next({ name: 'signin', query: { returnUrl: to.path } });
        }

        const userHasPermission = AuthService.currentUserHasPermission(authorize);
        if (!userHasPermission) {
            return next({ name: 'error' });
        }

        next();
    } catch (err) {
        console.error('Router guard error:', err);
        next({ name: 'error' });
    }
});


export default router;
