import AuthService from '@/services/AuthService';
import { createRouter, createWebHistory } from 'vue-router';
import { RoleEnum } from '@/types/Role';

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
            meta: { authorize: [RoleEnum.Admin] }
        },
        {
            path: '/users',
            name: 'users',
            component: () => import('../views/UserView.vue'),
            meta: { authorize: [] }
        },
        {
            path: '/assignment',
            name: 'assignment',
            component: () => import('../views/AssignmentView.vue'),
        },
        {
            path: '/course',
            name: 'course',
            component: () => import('../views/CourseView.vue'),
        },
        {
            path: '/module',
            name: 'module',
            component: () => import('../views/ModuleView.vue'),
        },
        {
            path: '/quiz',
            name: 'quiz',
            component: () => import('../views/QuizView.vue'),
        },
        {
            path: '/task',
            name: 'task',
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
        {
            path: '/tile',
            name: 'tile',
            component: () => import('../views/TileView.vue')
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
    const authorize = to.meta.authorize as RoleEnum[] | undefined;
    
    if (authorize) {
        try {
            const userLoggedIn = AuthService.isAuthenticated();
            if (!userLoggedIn) {
                return next({ name: 'signin', query: { returnUrl: to.path } });
            }

            // if authorize undefine allow access
            if(authorize.length == 0)
                return next()

            const userHasPermission = AuthService.currentUserHasPermission(authorize);
            if (!userHasPermission) {
                return next({ name: 'error' });
            }

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
