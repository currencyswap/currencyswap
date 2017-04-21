
'use strict';

angular.module('userList').factory('UserListService', ['$http', function ($http, PermissionService) {
    return {
        fetchAllUser: function (headers, success, failled) {
            var req = {
                method: httpMethods.GET,
                url: apiRoutes.API_USERS,
                timeout : global.TIMEOUT,
                headers: headers,
                data: {}
            };
            return $http(req);
        },
        fetchUserFollowStatus: function (status, headers) {
            var req = {
                method: httpMethods.GET,
                url: apiRoutes.API_USERS,
                timeout : global.TIMEOUT,
                headers: headers,
                data: {}
            };
            return $http(req);
        },
        getUserDetail: function (userId, headers) {
            var req = {
                method: httpMethods.GET,
                url: apiRoutes.API_USERS + '/' + userId,
                headers: headers
            };
            return $http(req);
        },
        saveUserDetail: function (user, headers) {
            var req = {
                method: httpMethods.POST,
                url: apiRoutes.API_USERS + '/' + user.id,
                headers: headers,
                data: user
            };
            return $http(req);
        }
    }
}]);
