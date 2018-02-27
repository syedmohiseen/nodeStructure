"use strict";
var moduleName = __filename;
var cors = require('cors')
var dbConnection = require('./dbConnection.js');
var uniqueId = require("service/uniqIdGenerator").uniqueId;
var localCache = require("service/cache").cache;
var authorization = require('./authorization.js').authorization;
var JwtService = require('service/login/jwtService.js');
var jwtService = new JwtService();

module.exports = function (app) {
    var apiWithoutAuthorization = [
        new RegExp('^\/v1\/login(\/)?$', 'i')
    ];
    app.use(cors());
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    app.use(function (req, res, next) { app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
        var id = uniqueId.get();
        req.reqId = id;
        var cacheObject = {};
        localCache.put(id, cacheObject);
        res.on('finish', function () {
            localCache.del(id);
        });
        next();
    });
    
    app.use(authorization().unless({path: apiWithoutAuthorization}));
    app.use(dbConnection.firm());
};