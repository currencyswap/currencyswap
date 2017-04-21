'use strict';
/**
 * @author Viet Nghiem
 */
angular.module('notification').factory('NotiService', ['ConnectorService', function (ConnectorService) {
    return $.extend({}, ConnectorService, {
        getMessages: function(limit, lastId) {
            return this.get(apiRoutes.API_SUPPORTS, {'limit': limit, 'lastId': lastId});
        },
        getQuickMessages: function() {
            return this.get(apiRoutes.API_SUPPORTS, {'limit': 5, 'isUnreadCount': true});
        },
        markRead: function(messageId) {
            return this.post(apiRoutes.API_SUPPORTS_MARKREAD, {'messageId': messageId});
        }
   });
}]);

