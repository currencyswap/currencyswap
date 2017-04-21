'use-strict';

angular.module('cookieManager', ['ngCookies'])
    .factory('CookieService', ['$cookies', function ($cookies) {
        return {
            setUpCookies: function (token) {
                var options = {
                    expires: new Date(Date.now() + parseInt(appConfig.cookieExpried))
                };

                var obj = getInfoFormToken(token);

                if ( !obj.avatarUrl ) {
                    obj.avatarUrl = global.DEF_AVATAR_URL + obj.username;
                }

                $cookies.put(global.TOKEN, token, options);
                $cookies.put(global.CURRENT_USER, JSON.stringify({
                    username: obj.username,
                    fullName: obj.fullName,
                    avatarUrl : obj.avatarUrl
                }), options);
            },
            cleanUpCookies: function () {
                $cookies.remove(global.TOKEN);
                $cookies.remove(global.CURRENT_USER);
            },
            getToken: function () {
                return $cookies.get(global.TOKEN);
            },
            getCurrentUser: function () {
                var userString = $cookies.get(global.CURRENT_USER);
                var json = {};
                try {json = JSON.parse(userString);}catch(e){}
                return json;
            },
            getUserEmail: function () {
                return $cookies.get(global.USER_EMAIL);
            },
            setUserEmail: function (userEmail) {
                var resetPwdCodeExpired = {
                    expires: new Date(Date.now() + 1)
                };

                $cookies.put(global.USER_EMAIL, userEmail, resetPwdCodeExpired);
            }
        }
    }]);
