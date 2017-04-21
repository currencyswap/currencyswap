'use strict';
/**
 * @author Viet Nghiem
 */

var ms = require('ms');
var util = require('util');
var fs = require('fs');
var path = require('path');

var appConfig = require('./app-config');
var errors = require('./errors/errors');
var routes = require('../routes').routes;

module.exports = function Generater() {
    function _generate() {
        writeSettings();
        writeRoutes();
        writeErrCodes();
    };
    function writeFile(filename, contentString) {
        var filePath = path.join(__dirname, '../../client/assets/js/gens', filename);
        fs.writeFile(filePath, new Buffer(contentString), function(err) {
            if (err) {
                console.log('Could not generate the client configuration file:', filename);
            } else {
                console.log('Successful in writing the client configuration file:', filename);
            }
        });
    };
    function writeSettings() {
        var filename = 'setting.js';
        var miliseconds = ms(appConfig.getTokenExpired());

        var config = {
            title: appConfig.getTitle(),
            footer: appConfig.getFooter(),
            dateFormat: appConfig.getDateFormat(),
            cookieExpried: miliseconds
        };

        var jsContent = util.format('window.appConfig = %s;', JSON.stringify(config));
        writeFile(filename, jsContent);
    };
    function writeRoutes() {
        var filename = 'api-routes.js';
        var apiRoutes = {};

        for (var key in routes) {
            if (routes[key] !== routes.API && routes[key].indexOf(routes.API) == 0) {
                apiRoutes[key] = routes[key];
            }
        }

        var jsContent = util.format('window.apiRoutes = %s;', JSON.stringify(apiRoutes));
        writeFile(filename, jsContent);
    };
    function writeErrCodes() {
        var filename = 'error-codes.js';
        var errorForClients = {};

        for (var key in errors) {
            errorForClients[key] = errors[key].code;
        }

        var jsContent = util.format('window.serverErrors = %s;', JSON.stringify(errorForClients));
        writeFile(filename, jsContent);
    };
    _generate();
};