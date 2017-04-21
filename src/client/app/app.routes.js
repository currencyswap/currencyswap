'use strict';

angular.module('currencySwapApp').config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');
        $routeProvider.when(routes.LOGIN, {
            template: '<login-form></login-form>'
        }).when(routes.FORGOT_PASSWORD_VERIFY, {
            template: '<verify-info></verify-info>'
        }).when(routes.FORGOT_PASSWORD_RESET, {
            template: '<reset-password></reset-password>'
        }).when(routes.REGISTER, {
            template: '<register></register>'
        }).when(routes.USER_LIST, {
            template: '<user-list></user-list>'
        }).when(routes.USER_DETAIL, {
            template: '<user-details></user-details>'
        }).when(routes.MYPROFILE, {
            template: '<my-profile></my-profile>'
        }).when(routes.ORDERS, {
            template: '<orders></orders>'
        }).when(routes.ORDER_CREATE, {
            template: '<order-create></order-create>'
        }).when(routes.ORDER_DETAIL, {
            template: '<order-detail></order-detail>'
        }).when(routes.ORDER_EDIT, {
            template: '<order-edit></order-edit>'
        }).when(routes.SUPPORT, {
            template: '<support></support>'
        }).when(routes.HELP, {
            template: '<help></help>'
        }).when(routes.NOTIFICATIONS, {
            template: '<notification></notification>'
        }).when(routes.INVITE, {
            template: '<invitation></invitation>'
        }).when(routes.EX_RATE, {
            template: '<rate-management></rate-management>'
        }).when(routes.ERROR_PAGE, {
            template: '<error-page></error-page>'
        }).otherwise('');
    }
]);
