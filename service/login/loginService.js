var moduleName = __filename;


var app = require('express')();
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var logger = require('helper/logger')(moduleName)
var JwtService = require('service/login/jwtService.js');
var localCache = require('service/cache').cache;
var LoginDao = require('dao/login/loginDao.js');
var config = require('config');
var message = config.messages;
var httpResponseCodes = config.httpResponse;
//var connection = require('middleware/dbConnection.js').connection;
var jwtService = new JwtService();
var loginDao = new LoginDao();
var loginService = function () {};
var secret = 'sampleApplication';
loginService.prototype.getLoginToken = function (data, cb) {
    var self = this;
    var token = data.headers['authorization'];
    self.getLoggedInUserDetails(data, function (err,status,result) {
        if (err) {
            return cb(message.internalServerError, httpResponseCodes.INTERNAL_SERVER_ERROR);
        }
        if (result) {
            jwtService.sign(token, function (err, result) {
                if (err) {
                    return cb(err);
                } else {
                    return cb(null,httpResponseCodes.SUCCESS, result);
                }
            });
        }
    })

};

loginService.prototype.getLoggedInUserDetails = function(data,cb){
    loginDao.getLoggedInUserDetails(data, function(err, resp){
        if(err){
          return cb(message.internalServerError, httpResponseCodes.INTERNAL_SERVER_ERROR);  
        }
        
        if(resp.length > 0){
          return cb(null,httpResponseCodes.SUCCESS,resp);  
        }
        else{
          return cb(message.internalServerError, httpResponseCodes.INTERNAL_SERVER_ERROR);  
        }
        
        
    });
};

loginService.prototype.getusersList = function (data, cb) {
    loginDao.getUsersList(data, function (err, resp) {
        if (err) {
            return cb(message.internalServerError, httpResponseCodes.INTERNAL_SERVER_ERROR);
        }
        return cb(null, httpResponseCodes.SUCCESS, resp);
    });

};
loginService.prototype.addUser = function (data, cb) {
    loginDao.addUser(data, function (err, status, resp) {
        if (err) {
            logger.error("error while fetching records", err)
            return cb(message.internalServerError, httpResponseCodes.INTERNAL_SERVER_ERROR);
        }
        return cb(null, httpResponseCodes.CREATED, "SuccessFully created record");
    });

};
module.exports = loginService;