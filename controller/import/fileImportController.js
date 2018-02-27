"use strict";

var moduleName = __filename;
var app = require('express')();
var multer = require('multer');
var xlsx = require('xlsx');
var mkdirp = require('mkdirp');
var multerS3 = require('multer-s3');
var moment = require('moment');
var aws = require('aws-sdk');
var config = require("config");
var env = config.env.name;
var moment = require('moment');
var httpResponseCodes = config.httpResponse;
var response = require('controller/ResponseController.js');

/*s3 related conf*/
aws.config.region = 'us-east-1';
aws.config.update({
    accessKeyId: 'AKIAIST3CXDIVNHGNPDA',
    secretAccessKey: 'vNX/xfMnHCoStv8c6saKIAT4egjiW9AjuqJP17lu'
});
var s3 = new aws.S3();
var s3Properties = config.env.prop.sampleTest["s3"]

var FileImportService = require('service/import/filrImportService.js');
var fileImportService = new FileImportService();


var localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        var uploadDir = req.uploadContext;
        mkdirp(uploadDir, function (err) {
            if (err) {
                cb(null, uploadDir);
            } else {
                cb(null, uploadDir);
            }
        });
    },
    filename: function (req, file, cb) {
        var fileExtention = file.originalname.split('.');
        if (file.fieldname == 'logo') {
            var fileName = file.fieldname + '-' + Date.now() + '.' + fileExtention[fileExtention.length - 1];
            return cb(null, fileName);
        } else {
            var fileName = file.originalname;
            return cb(null, fileName);
        }
    }
});

var upload = multer({
    storage: localStorage
});
var s3upload = multer({
    limits: { 
        fieldSize: 25 * 1024 * 1024
    },
    storage: multerS3({
        
        s3: s3,
        bucket: s3Properties.bucket,
        metadata: function (req, file, cb) {
            var obj = {};
            if(req.body.description){
                req.body.description= req.body.description.replace(/’/g,"'");
                req.body.description= req.body.description.replace(/“/g,'"');
                req.body.description= req.body.description.replace(/”/g,'"');
            }
            obj = req.body;
            cb(null, obj);
        },
        key: function (req, file, cb) {
            var timeStamp = moment().format();
            var user = req.params.strategistId;
            var contextPath = req.uploadContext;
            if (file.fieldname == 'file' && req.fileAttributeName == 'user') {
                var fileName = file.originalname.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root +'/' + contextPath + req.fileAttributeName + '/' + timeStamp + '/' + file.originalname; // req.params.strategistId+fileExtention;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else if (file.fieldname == 'logo' && req.fileAttributeName == 'large') {
                var fileName = file.originalname.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + user + '/' + contextPath + req.fileAttributeName + '/' + timeStamp + '/' + file.originalname; // req.params.strategistId+fileExtention;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            } else if (req.params.modelId) {
                if(req.body.description){
                req.body.description.replace(/’/g,"'");
            }
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + 'model' + req.params.modelId + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            }else if( req.fileAttributeName == 'user' ) {
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + 'user' + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);                
            } else {
                var originalFileName = file.originalname; //file.fieldname + '-' + Date.now()+'.'+fileExtention[fileExtention.length-1];
                var fileName = originalFileName.split('.');
                var fileExtention = '.' + fileName[fileName.length - 1];
                var s3ObjectKey = s3Properties.root + user + '/' + contextPath + timeStamp + '/' + originalFileName;
                req.filesArray.push(s3ObjectKey)
                return cb(null, s3ObjectKey);
            }
        }
    })
});
function fileServeMiddleware(fileAttributeName,uploadContext) {
     var tempUploadFilesPath = 'temp123/uploads';
     
    return function (req, res, next) {
        req.uploadContext = tempUploadFilesPath;
        req.fileAttributeName = fileAttributeName;
        req.filesArray = [];
        req.signedUrls = [];
        req.fileServer = req.headers.host;
        next();
    }
};

app.post('/',fileServeMiddleware('user','file/'), s3upload.any(), function(req,res){
    console.log("bjhbvhbvjhdbvjhdbvjhdvbjdhvbdjhvb");
    var params = {
    Bucket: s3Properties.bucket,
    Key: req.filesArray[0],
    Expires: 36000
  };
s3.getSignedUrl('getObject', params, function(err, url){
  console.log('the url of the image is', url);
  return response(null,httpResponseCodes.SUCCESS,{'message':url},res);
})
//    
//   fileImportService.uploadFile(req, function(err,result){
//       if(err){
//           res.send(err)
//       }
//       res.send(result);
//   });
   
});

//for Document Uploads future reference for S3 credentials refere format in S3storagedetails




// not using this method but we can use in future if require ment came
app.post('/upload/document', fileServeMiddleware('document', 'documentModel/'), s3upload.array('document', 12), function (req, res) {
    
   // you can write code after uploading document using middleware you will get file or doc details in req.file 
});

module.exports = app;