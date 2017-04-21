
'use strict';

angular.module('userDetails').factory('UserDetailsServive', ['$http', function ($http, PermissionService) {
    return {
        getUser: function (userId, headers) {
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
