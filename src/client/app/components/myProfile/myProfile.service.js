/**
 * Created by thapnd on 11/30/2016.
 */
'use strict';

angular.module('myProfile').factory('MyProfileService',  ['$http', function ($http, PermissionService) {
    return {
        getUserInfo:function (headers) {
            var req = {
                method: httpMethods.GET,
                url: apiRoutes.API_MY_PROFILE,
                headers: headers
            };
            return $http(req);
        },

        saveUserInfo:function (updatingUser,headers) {
            var req = {
                method: httpMethods.PUT,
                url: apiRoutes.API_MY_PROFILE,
                headers: headers,
                data: updatingUser
            };
            return $http(req);
        },
        uploadFiles: function(file, errFiles) {
            if (file) {
                file.upload = Upload.upload({
                    method: 'POST',
                    url: '/api/profile',
                    data: {
                        file: file
                    },
                    headers: headers
                });
            }
            return file.upload;
        }
    }
}]);