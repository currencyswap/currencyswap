/**
 *
 * @version 1.0
 * @author Viet Nghiem
 */
'use strict';
angular.module('common', ['ngRoute', 'cookieManager', 'permission', 'navigation', 'ui.bootstrap']).run(function($rootScope, $q, $uibModal, CookieService, SupportService){
    $rootScope.getCreator = function() {
        var def = $q.defer();
        var user = CookieService.getCurrentUser();
        if (user.username) {
            SupportService.getCreator(user.username).then(function(userInst){
                if (userInst && userInst.username) {
                    $rootScope.user = userInst;
                    $rootScope.startSocket(userInst);
                    def.resolve(userInst);
                    $.publish('/cs/user/update', [userInst]);
                } else {
                    def.reject('Error: Current User Info', userInst);
                }
            }, function(err){
                def.reject('Error: Current User Info', err);
            });
        } else {
            def.reject('No user session exists');
        }
        return def.promise;
    };
    $rootScope.startSocket = function(initData) {
        console.log('Starting Socket IO');
        var skParams = {
                host: ('//'+(location.host || location.hostname)),
                skOptions : {
                  'transports':[ 'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling' ]
                  , 'force new connection': true
                },
                cmdOptions : {
                  '/server/init': {'message': initData}
                }
              };
            $.WebSocketHandler(skParams);
            // below statement is for testing purpose only, this will be remove if on production
            $rootScope.testSocket();
    };
    $rootScope.stopSocket = function() {
        $.forceToDisconnectSK();
    };
    $rootScope.testSocket = function() {
        $.subscribe('/receive/pong', function(data) {
            console.log('/receive/pong', JSON.stringify(data));
          });
//          setInterval(function(){
//            $.publish('/send/ping', [{'message': 'Hello new time: ' + Math.round(Math.random()*1000)}]);
//          }, 2000);
    };
    $rootScope.createModel = function(templateUrl, controller, inputData, callbackOk, callbackCancel, size, inputTitle) {
        var modalForm = $uibModal.open({
            animation: true,
            templateUrl: templateUrl,
            controller: controller,
            size: size,
            resolve: {
            inputData: inputData,
            inputTitle: inputTitle
            }
          });

          modalForm.result.then(callbackOk||function(newData){
            console.log('Modal output with: ', newData);
          }, callbackCancel||function () {
            console.log('Modal dismissed at: ', new Date());
          });
          return modalForm;
    };
    $rootScope.openMessageModel = function (item) {
        $rootScope.createModel('app/components/notification/notification.detail.template.html', function ($scope, $timeout, $sce, $uibModalInstance, inputData) {
            $scope.item = inputData;
            var orderLink = '<a href="/#!{LINK}{CODE}">{CODE}</a>';
            var orderCode = $scope.item.orderCode;
            var re = new RegExp(orderCode, 'ig');

            $scope.item.exrateMsg = false;

            if (orderCode) {
                $scope.item.message2 = $scope.item.message.replace(re, orderLink.replace(/\{LINK\}/g, routes.ORDERS).replace(/\{CODE\}/g, orderCode));
            }

            var exRateObj = SupportService.parseToExRateObj(inputData.message);

            if (SupportService.isExRateObj(exRateObj)) {
                $scope.item.exrateMsg = exRateObj;
            }

            $scope.cancel = function () {
                console.log('No thing change');
                $uibModalInstance.dismiss();
            };
            $scope.closeDetail = function (e) {
                if (e.target.tagName == 'A' || e.target.tagName == 'a') {
                    $scope.cancel();
                }
            }
        }, item);
        };
    var _retreiveUser = function() {
        if (!$rootScope.user) {
            $rootScope.getCreator().then(function(resp){
                //console.log('Success: Current User Info', resp);
            }, function(e){
                console.log(e);
                //setTimeout(_retreiveUser, 2000);
            });
        };
    };
    _retreiveUser();
});
window.Messages = {
        // Error messages handled by error code
           unknown_error_code : "Unknown error, code: ",
           error_message_less200 : "The server understands and is willing to comply with the client's request",
           error_message_less300 : "The request has succeeded",
           error_message_less400 : "The requested resource resides temporarily under a different location",
           error_message_400 : "Bad Request: The request could not be understood by the server due to malformed syntax",
           error_message_401_unauthorized : "Unauthorized: The request requires user authentication",
           error_message_401_can_not_authenticate : "Could not authenticate due to incorrect User Name or Password. Please try again.",
           error_message_403 : "Your have no permission to access the specific resource",
           error_message_404 :  "Could not find anything matching the specific request",
           error_message_408 : "The request gets timed out",
           error_message_417 : "Expected failure",
           error_message_500 : "The server encountered an unexpected condition which prevented it from fulfilling the request",
           error_message_501 : "The server does not support the functionality required to fulfill the request",
           error_message_502 : "The server, while acting as a gateway or proxy, received an invalid response from the upstream server",
           error_message_503 : "The server is currently unable to handle the request due to a temporary overloading or maintenance of the server",
           error_message_504 : "The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server",
           error_message_505 : "The server does not support, or refuses to support",
           server_error      : "Error in server. Please try again later.",
           the_request_gets_timeout : "The request gets timed out",
           please_check_connection : "Your connection experienced an error. Please ensure that you are connected and try again.",
   };
window.getErrorMsg = function(isSignin, status, statusText) {
    var sta = parseInt(status); 
    var txt = statusText;
    var msg = Messages.unknown_error_code + status;
    if (sta < 100) { //return code is Unknown
            if ('timeout' == txt) {
                    msg = Messages.the_request_gets_timeout;
            } else if ('error' == txt) {
                    msg = Messages.please_check_connection;
            } else {
                    msg = txt||Messages.please_check_connection;
            }
    } else if (sta < 200) { //Informational 1xx
            msg = Messages.error_message_less200;
    } else if (sta < 300) { //Successful 2xx
            msg = Messages.error_message_less300;
    } else if (sta < 400) { //Redirection 3xx
            msg = Messages.error_message_less400;
    } else if (sta < 500) { //Client Error 4xx
            switch (sta) {
            case 400:
                    msg = Messages.error_message_400;
                    break;
            case 401:
                    if (isSignin) {
                            msg = Messages.error_message_401_can_not_authenticate;
                    } else {
                            msg = Messages.error_message_401_unauthorized;
                    }
                    break;
            case 403:
                    msg = Messages.error_message_403;
                    break;
            case 404:
                    msg = Messages.error_message_404;
                    break;
            case 408:
                    msg = Messages.error_message_408;
                    break;
            case 417:
                    msg = Messages.error_message_417;
                    break;
            }
    } else { //Server Error 5xx
            switch (sta) {
            case 500:
                    msg = Messages.error_message_500;
                    break;
            case 501:
                    msg = Messages.error_message_501;
                    break;
            case 502:
                    msg = Messages.error_message_502;
                    break;
            case 503:
                    msg = Messages.error_message_503;
                    break;
            case 504:
                    msg = Messages.error_message_504;
                    break;
            case 505:
                    msg = Messages.error_message_505;
                    break;
            }
    }
    return msg;
};
angular.module('common').factory('ConnectorService', ['$rootScope', '$q', 'CookieService', function ($rootScope, $q, CookieService) {
    var debug = window.debug||true;
    var timeout = 40000;//40 seconds for each request
    var token = null;

      var getServerErrorMsg = function(resp) {
        var e = resp.responseJSON;
        var msg = Messages.please_check_connection;
        if (e && (e.message || (e.error && e.error.message))) {
          msg = e.message||e.error.message;
        } else if (resp.status >= 0){
            window.getErrorMsg(false, resp.status, resp.statusText);
        }
        return msg;
      };
      var getServerErrorCode = function(resp) {
          var e = resp.responseJSON;
          var code = 0;
          if (e && (e.code || (e.error && e.error.code))) {
              code = e.code||e.error.code;
          }
          return code;
        };

      var _ajax = function(method, url, data, headers) {
          // update token header
          token = CookieService.getToken();

          console.log('method: ', method);
          console.log('url: ', url);
          console.log('data: ', data);
          console.log('headers: ', headers);

          return $.ajax({
            url : url,
            type : method,
            dataType : 'json',
            timeout: timeout,
            headers: headers,
            beforeSend: function(xhr) {
                xhr.setRequestHeader("Authorization", autheticateType.BEARER + token);
            },
            data: data
          }).fail(function(jqXHR, textStatus, errorThrown){
              var msg = getServerErrorMsg(jqXHR, textStatus);
              var code = getServerErrorCode(jqXHR);
              console.warn('Error Message:', jqXHR.status, code, msg);
              //console.warn('Error jqXHR:', textStatus, errorThrown, jqXHR);
              if (!window._csDismisses) {
                  window._csDismisses = {};
              }
              if (window._csDismisses[msg]) {
                  return;
              }
              window._csDismisses[msg] = true;
            if (code == 110 || code == 111) {
                alert(msg);
                $rootScope.logout();
            } else {
                alert(msg);
            }
            setTimeout(function(){
                window._csDismisses[msg] = false;
            }, 600);
          }).always(function(){
              console.log('request to url: ', url);
              if (debug) {
                  console.log('Request GET done');
              }
          }).done(function(data, textStatus, jqXHR){
              if (debug) {
                  console.log('Response', textStatus, JSON.stringify(data));
              }
          });
       };
        return {
          getErrorMsg: getServerErrorMsg,
          get: function(url, data, headers) {
            return _ajax('GET', url, data, headers);
          },
          post: function(url, data, headers) {
            return _ajax('POST', url, data, headers);
          },
          put: function(url, data, headers) {
            return _ajax('PUT', url, data, headers);
          },
          del: function(url, headers) {
            return _ajax('DELETE', url, null, headers);
          }
        };
}]);

