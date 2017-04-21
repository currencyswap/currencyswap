'use strict';

var routes = {
    ROOT: '',
    HOME: '/',
    ORDERS: '/orders/',
    ORDER_CREATE: '/orders/create',
    ORDER_DETAIL: '/orders/:orderCode',
    ORDER_EDIT: '/orders/edit/:orderCode',
    USERS: '/users/(:id)',
    USER_LIST: '/users/',
    USER_DETAIL: '/users/:id',
    MYPROFILE: '/profile',
    SUPPORT: '/support',
    HELP: '/help',
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    NOTIFICATIONS: '/notifications',
    FORGOT_PASSWORD_VERIFY: '/forgotpassword/verify',
    FORGOT_PASSWORD_RESET: '/forgotpassword/reset/',
    ERROR_PAGE: '/error',
    API_ORDERS_TOTAL: '/orders/total',
    INVITE: '/invitation',
    EX_RATE: '/exrate'
};

var navigation = [
    {
        route: routes.LOGIN,
        name: 'Login',
        requiredPermissions: [],
        id: 'login'
    },
    {
        route: routes.REGISTER,
        name: 'Register',
        requiredPermissions: [],
        id: 'register'
    },
    {
        route: routes.ORDER_DETAIL,
        name: 'Order Detail',
        requiredPermissions: [permissions.MAINTAIN_OWN_ORDERS],
        icon : 'fa fa-plus',
        id: 'order-detail'
    },
    {
        route: routes.ORDER_EDIT,
        name: 'Order Edit',
        requiredPermissions: [permissions.MAINTAIN_OWN_ORDERS],
        icon : 'fa fa-plus',
        id: 'order-edit'
    },
    {
        route: routes.ORDERS,
        name: 'Orders',
        requiredPermissions: [permissions.VIEW_OWN_ORDERS],
        position: global.MENUBAR,
        icon : 'fa fa-th-list',
        id: 'menubar-orders'
    },
    {
        route: routes.USERS,
        name: 'Users',
        requiredPermissions: [permissions.USER_MANAGEMENT],
        position: global.MENUBAR,
        icon : 'fa fa-users',
        id: 'menubar-users'
    },
    {
        route: routes.ORDER_CREATE,
        name: 'Create Order',
        requiredPermissions: [permissions.MAINTAIN_OWN_ORDERS],
        position: global.TOOLSBAR,
        icon : 'fa fa-plus',
        id: 'toolbar-create-order'
    },
    {
        route: routes.EX_RATE,
        name: 'Rate management',
        requiredPermissions: [permissions.USER_MANAGEMENT],
        position: global.TOOLSBAR,
        icon : 'fa fa-dollar',
        id: 'toolbar-rate-mamangement'
    },
    {
        route: routes.SUPPORT,
        name: 'Support',
        requiredPermissions: [permissions.VIEW_OWN_ORDERS, permissions.USER_MANAGEMENT],
        position: global.TOOLSBAR,
        icon : 'fa fa-support',
        id: 'toolbar-support'
    },
    {
        route: routes.HELP,
        name: 'Help',
        requiredPermissions: [permissions.EDIT_PROFILE],
        position: global.TOOLSBAR,
        icon : 'fa fa-question-circle',
        id: 'toolbar-help'
    },
    {
        route: routes.INVITE,
        name: 'Invite',
        requiredPermissions: [permissions.VIEW_OWN_ORDERS, permissions.USER_MANAGEMENT],
        position: global.TOOLSBAR,
        icon : 'fa fa-user-plus',
        id: 'toolbar-invite'
    },
    {
        route: routes.NOTIFICATIONS,
        name: 'Notification',
        requiredPermissions: [permissions.EDIT_PROFILE],
        position: global.TOOLSBAR,
        icon : 'glyphicon glyphicon-envelope',
        id: 'toolbar-noti'
    },
    {
        route: routes.MYPROFILE,
        name: 'Profile',
        requiredPermissions: [permissions.EDIT_PROFILE],
        position: global.TOOLSBAR,
        icon : 'fa fa-user',
        id: 'toolbar-profile'
    },
    {
        route: routes.LOGOUT,
        name: 'Logout',
        requiredPermissions: [permissions.EDIT_PROFILE],
        position: global.TOOLSBAR,
        icon : 'fa fa-sign-out',
        id: 'toolbar-signout'
    }
    
];
