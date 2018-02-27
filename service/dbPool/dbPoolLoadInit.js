"use strict";
var moduleName = __filename;
var logger = require("helper/logger").moduleName;
var localCache = require("service/cache").cache;

var poolCluster = require("helper/connectionInitialize.js").poolCluster;
//console.log(poolCluster,"poolCluster");

localCache.put("poolCluster",poolCluster);


