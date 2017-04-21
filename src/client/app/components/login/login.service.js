'use strict';

angular.module('loginForm').factory('LoginService', ['$http', '$q', 'OrdersService','GLOBAL_CONSTANT',function ($http, $q, OrdersService, GLOBAL_CONSTANT) {
    return {
        authenticate: function (user) {
            if (!user || !user.username || !user.password) {
                return $q.reject({
                    message: GLOBAL_CONSTANT.EMPTY_USERNAME_OR_PASSWORD
                });
            } else {
                var headers = {};
                var base64Content = encodeUserNameAndPasswordBase64(user.username, user.password);

                headers[httpHeader.CONTENT_TYPE] = contentTypes.JSON;
                headers[httpHeader.AUTHORIZARION] = autheticateType.BASIC + base64Content;

                var req = {
                    method: httpMethods.POST,
                    url: apiRoutes.API_AUTHENTICATE,
                    headers: headers,
                    data: {}
                };

                return $http(req);
            }
        },
        getTotalOrderOfUser: function(){
//        	OrdersService.getTotalOrderOfUser().then(function(resp){
//        		alert(resp);
//        		return resp;
//        	}, function(err){
//        		return 0;
//        	})
        	return OrdersService.getTotalOrderOfUser();
        }
    }
}]);
