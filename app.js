"use strict";
global.appBasePath = __dirname;
global.ghghg = "hello";

require('app-module-path').addPath(appBasePath);

var express = require('express');
var moduleName = __filename;
var morgan = require('morgan');
var bodyParser = require('body-parser');
var http = require('http');
var config = require('config');
var logger = require('helper/logger.js')(moduleName);
require("service/dbPool/dbPoolLoadInit.js");
var PORT = config.env.prop.port;
var app = express();
var server = http.Server(app);
var jwt = require('jsonwebtoken');

console.log(__filename,"__filename");
console.log(moduleName,"moduleName");
console.log(appBasePath,"global");
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

 appStart(app);

 function appStart(app){
     require('middleware')(app);
	require('controller')(app);
	
app.listen(PORT || 3001);
console.log('server is located at: ',PORT);
 }

process.on('uncaughtException', function(err){
	console.log(" FATALsdddddddddddddddddddddddddddddddddddddfgbfbfg//////////////" + err);
	console.trace("FATAL", err);
	
	var cb = function(){
		process.exit(1);		
	}
});
process.on('error', function(err){
	console.log(" FATALsdddddddddddddddddddddddddddddddddddddfgbfbfg//////////////" + err);
	console.trace("FATAL", err);
	
	var cb = function(){
		process.exit(1);		
	}
});