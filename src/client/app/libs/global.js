'use strict';

var global = {
    TOKEN : 'token-api',
    CURRENT_USER : 'currentUser',
    DELIMITER: ':',
    MENUBAR : 'Menu-Bar',
    TOOLSBAR : 'Tools-Bar',
    NONE : '',
    DEF_AVATAR: 'assets/images/photos/profile.png',
    DEF_AVATAR_URL: '/config/media/',
    USER_EMAIL: 'userEmail',
    TIME_OUT: 1,
    NUMBER_PAGING: 24
};

var permissions = {
    VIEW_OWN_ORDERS: 'VIEW_OWN_ORDERS',
    MAINTAIN_OWN_ORDERS: 'MAINTAIN_OWN_ORDERS',
    VIEW_ALL_ORDERS: 'VIEW_ALL_ORDERS',
    EDIT_PROFILE: 'EDIT_PROFILE',
    USER_MANAGEMENT: 'USER_MANAGEMENT',
    VIEW_OWN_NOTIFICATIONS: 'VIEW_OWN_NOTIFICATIONS',
    VIEW_OWN_PERMISSION: 'VIEW_OWN_PERMISSION'
};

var httpHeader = {
    AUTHORIZARION : 'Authorization',
    CONTENT_TYPE: 'Content-Type'    
};

var httpMethods = {
    POST : 'POST',
    GET : 'GET',
    PUT: 'PUT',
    PATCH : 'PATCH',
    DELETE : 'DELETE'
};

var contentTypes = {
    JSON: 'application/json',
    JSONP : 'application/javascript',
    FORM_URL_ENCODED: 'application/x-www-form-urlencoded'
};

var autheticateType = {
    BASIC : 'Basic ',
    BEARER : 'Bearer '
};
