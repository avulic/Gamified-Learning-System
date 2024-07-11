import AuthService from '@/services/AuthService';
import { createRouter, createWebHistory } from 'vue-router';
import { RoleEnum } from '@/types/Role';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
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
            meta: { authorize: [] }
        },
        {
            path: '/users',
            name: 'users',
            component: () => import('../views/UserView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/tasks',
            name: 'tasks',
            component: () => import('../views/TaskView.vue'),
        },
        {
            path: '/signin',
            name: 'signin',
            component: () => import('../views/SignInView.vue')
        },
        {
            path: '/signup',
            name: 'signup',
            component: () => import('../views/SignUpView.vue')
        },
        // otherwise redirect to home
        {
            path: '/error',
            name: 'error',
            component: () => import('../views/ErrorView.vue')
        },
    ]
});

router.beforeEach(async (to, from, next) => {
    const authorize = to.meta.authorize as string[];
    
    if (authorize) {
        try {
            const userLoggedIn = AuthService.userLogedIn();
            if (!userLoggedIn) {
                return next({ name: 'signin', query: { returnUrl: to.path } });
            }
            const userHasPermission = AuthService.currentUserHasPermission(authorize);
            if (!userHasPermission) {
                return next({ name: 'error' });
            }

            // If user has permission, continue to the requested route
            return next();
        } catch (err) {
            console.error('Error in router.beforeEach:', err);
            // Redirect to error page (you should define this route)
            return next({ name: 'error' });
        }
    }

    // For public routes, just proceed
    next();
});

export default router;
