module.exports = [
    {
        route: '/logout',
        blueprint: 'Logout',
        meta: {
            app: 'auth',
        },
    },
    {
        route: '/login',
        blueprint: 'Login',
        meta: {
            app: 'auth',
        },
    },
    {
        route: '/forgot',
        blueprint: 'Forgot',
        meta: {
            app: 'auth',
        },
    },
    {
        route: '/reset/:token',
        blueprint: 'ResetPassword',
        meta: {
            app: 'auth',
        },
    },
];
