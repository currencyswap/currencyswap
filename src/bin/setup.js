'use strict';

var path = require('path');
var nodeUtil = require('util');
var async = require('async');
var exec = require('child_process').exec;

var users = require('./data/users');
var groupsWithPermissions = require('./data/permissions');
var currencyData = require('./data/currency');
var statusData = require('./data/status-type');
var ordersData = require('./data/orders');

var app = require(path.resolve(__dirname, '../server/server'));
var ds = app.datasources.CSwapDB;

var userService = require('../server/services/user-service');
var exchangeRateService = require('../server/services/exchange-rate-service');
var permissionService = require('../server/services/permission-service');
var groupService = require('../server/services/group-service');

var persGroups = require('../server/security/permissions-groups');

var appConfig = require('../server/libs/app-config');

var exchangeObjs = require('./data/exchanges');
var orderBankInfo = require('./data/order-bank-info').orderBankInfo;
var bankInfo = require('./data/bank-info').bankInfo;

var mapDataModels = [
    {'model': 'Currency', 'values': currencyData.currencies},
    {'model': 'StatusType', 'values': statusData.statuses},
    {'model': 'Order', 'values': ordersData.orders},
    {'model': 'OrderActivity', 'values': ordersData.orderActis},
    {'model': 'Message', 'values': ordersData.messages},
    {'model' : 'OrderBankInfo', 'values': orderBankInfo},
    {'model' : 'BankInfo', 'values': bankInfo},
];

function _insertData(arrayData, modelType, next) {
    console.log('_insertData', modelType);
    if (arrayData && arrayData.length > 0) {
      ds.models[modelType].create(arrayData, function(err, result) {
        console.log('create', modelType, err, result);
        next(err);
      });
    } else {
      next();
    }
  };

function cleanUpCache(callback) {
    let redis = appConfig.getRedis();
    let host = redis.host ? nodeUtil.format('-h %s', redis.host) : '';
    let port = redis.port ? nodeUtil.format('-p %s', redis.port) : '';
    let db = redis.db ? nodeUtil.format('-n %s', redis.db) : '';
    let pass = redis.pass ? nodeUtil.format('-a %s', redis.pass) : '';
    let prefix = redis.prefix ? nodeUtil.format('%s', redis.prefix) : '';

    let cmdSearch = nodeUtil.format('redis-cli --scan --pattern \'%s*\' %s %s %s %s', prefix, host, port, pass, db);
    let cmdDel = nodeUtil.format('xargs redis-cli %s %s %s %s DEL', host, port, pass, db);
    let cmd = cmdSearch + ' | ' + cmdDel;

    let isWin = /^win/.test(process.platform);

    if (!isWin) {
        exec(cmd, function (error, stdout, stderr) {
            if (error) {
                console.error('ERR: %s', stderr);
            } else {
                console.log('Clean Up Cache done.');
            }
            callback(error);
        });
    } else {
        callback(null);
    }
}

function setupPermissions(callback) {

    let permissions = [];

    for (let key in persGroups.Permissions) {

        console.log('[%s] : %s', key, persGroups.Permissions[key]);

        permissions.push({
            name: persGroups.Permissions[key],
            key: key
        });
    }

    permissionService.createPermissions(permissions, callback);
}

function setupGroups(callback) {
    let groups = [];

    for (let key in persGroups.Groups) {

        groups.push({
            name: persGroups.Groups[key]
        });
    }

    groupService.createGroups(groups, callback);
}

function convertObjectsToMaps(objs) {

    let map = new Map();
    objs.forEach(function (obj) {
        map.set(obj.name, obj.id);
    });

    return map;
}

function setupGroupsWithPermissions(permissions, groups, callback) {

    let permissionMaps = convertObjectsToMaps(permissions);
    let groupMaps = convertObjectsToMaps(groups);
    let grpPerPairs = [];

    groupsWithPermissions.groups.forEach(function (group) {

        let groupName = persGroups.getGroup(group.name);
        let groupId = groupMaps.get(groupName);

        if (!groupId) return;

        group.permissions.forEach(function (per) {
            let perName = persGroups.getPermission(per);
            let perId = permissionMaps.get(perName);

            if (!perId) return;

            grpPerPairs.push({
                permissionId: perId,
                groupId: groupId
            });

        });

    });

    groupService.setupGroupPermission(grpPerPairs, function (err) {
        callback(err);
    });

}

function getGroup(groupKey, groupMaps) {
    let groupName = persGroups.getGroup(groupKey);

    if (!groupName) return null;

    let groupId = groupMaps.get(groupName);

    if (!groupId) return null;

    return {
        id: groupId,
        name: groupName
    };
};

var otherInSeries = function(done) {
   async.eachSeries(mapDataModels, function iterator(data, next) {
     _insertData(data.values, data.model, next);
   }, done);
 };
var migrate = function () {
    ds.automigrate(function (err) {
        if (err) {
            console.error('ERROR : %s', err.message);
            process.exit(0);
        }

        async.waterfall([
            function (next) {
                setupPermissions(function (err, permissions) {
                    next(err, permissions);
                });
            },
            function (permissions, next) {
                setupGroups(function (err, groups) {
                    next(err, permissions, groups);
                });
            },
            function (permissions, groups, next) {
                setupGroupsWithPermissions(permissions, groups, function (err) {
                    next(err, groups);
                });
            },
            function (groups, next) {
                let groupMaps = convertObjectsToMaps(groups);
                let userObjs = [];
                for (let key in users) {
                    let user = users[key];
                    let groupObjs = [];

                    for (let key in user.groups) {
                        let grp = getGroup(user.groups[key], groupMaps);
                        if (grp) groupObjs.push(grp);
                    }
                    user.groups = groupObjs;
                    console.log('USER %s', JSON.stringify(user));
                    userObjs.push(user);
                }
                next(null, userObjs);
            },
            function (userObjs, next) {
                userService.createUsers(userObjs, function (err, users) {
                    next(err, users);
                });
            },
            function ( users, next) {
                cleanUpCache(next);
            },
            function (next) {
              console.log('create first exchange record');

                exchangeRateService.createMultiExchange(exchangeObjs.exchanges, function (err, exchangeRecords) {
                  if (err) {
                      return next (err);
                  } else {
                      return next (null);
                  }
              })
            },
            otherInSeries
        ],
        function (err) {
            if (err) {
                console.error('ERROR : %s', err);
            }
            process.exit(0);
        });

    });
};

if(ds.connected) {
    migrate();
} else {
    ds.once('connected', function() {
        migrate();
    });
}