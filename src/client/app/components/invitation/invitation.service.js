'use strict';

angular.module('invitation').factory('InvitationService', ['$http', '$q', 'ConnectorService', 'CookieService','GLOBAL_CONSTANT',function ($http, $q, ConnectorService, CookieService, GLOBAL_CONSTANT) {
    var inviter = CookieService.getCurrentUser().username;
    return $.extend({}, ConnectorService, {
        invite: function (submittedEmail) {
            return this.post(apiRoutes.API_INVITE, {regEmail: submittedEmail, inviter: inviter});
        }
    })
}]);

