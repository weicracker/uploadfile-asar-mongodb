var express = require('express');
var app = express();
var formidable = require('formidable');
var util = require('util');
var fs = require("fs");
var request = require("request");
var path = require("path");
var asarExFile = "E:\\stations\\upasar\\asar\\";
app.listen(3000);

console.log('服务启动成功！')

app.post('/asp/application/1.0/upload/:appID/:version', function (req, res) {
    var token = req.headers.xaspsession;
    var appID = req.params.appID;
    var version = req.params.version;
    1//创建表单上传
    var form = new formidable.IncomingForm({
        uploadDir: "E:\\stations\\upasar\\asar\\"
    });
    form.encoding = 'utf-8';
    //设置存储路径
    // form.uploadDir = 'asar/';
    form.keepExtensions = true;
    form.parse(req, function (err, fields, files) {
        //asar包改名
        var localPath = files.file.path;
        var clientFileName = form.uploadDir+files.file.name;
        fs.rename(localPath,clientFileName,function(err){
            console.log(err)
        })
        res.writeHead(200, {
            'content-type': 'text/plain'
        });

        res.write(appID + 'received upload:\n\n' + version);
        res.end(util.inspect({
            fields: fields,
            files: files
        }));
        2//解压asar包
        var filepathext = path.join(asarExFile,"ext",files.file.name);
        var filenoexe = path.extname(files.file.name);
        var filesaveext = filepathext.replace(filenoexe,"");
        console.log(filesaveext)
        fs.mkdir(asarExFile+files.file.name+"\\",function(err){
            console.log(err);
        })
        require("child_process").exec("asar e "+clientFileName+" "+filesaveext,function(e,sto,ste){
            console.log(e)
        })

        3//上传asar包

         var formData = {
                file: fs.createReadStream(clientFileName),
            }
        request.post({
            url: 'http://10.0.32.106:8080/asp/application/1.0/upload?applicationID=' + appID + '&version='+version,
            formData: formData,
            headers: {
                XASPSESSION: token
            }
        }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('Upload successful!  Server responded with:', body);
        });
    });


});