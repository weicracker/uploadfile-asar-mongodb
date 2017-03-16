/*
 * @Author: jiwei 
 * @Date: 2017-02-27 09:02:41 
 * @Last Modified by: jiwei
 * @Last Modified time: 2017-03-16 16:24:18
 */
//
// ─── ASPDEV FUNCTION ────────────────────────────────────────────────────────────
//
var aspdev = (function () {
    var Promise = require('promise');
    var path = require('path');
    var fs = require('fs');
    var readline = require('readline');
    var execFile = require('child_process').execFile;
    var spawn = require('child_process').spawn;
    var request = require('request');
    var cmdMark = process.argv[2];
    var pcargvThree = process.argv[3];
    var pcargvFour = process.argv[4];
    // var stexeFilePath = path.normalize(pcargvThree);
    // var stwebUrl = path.normalize(pcargvFour);
    var _this, tokenVal, rl, asarFileDir, targetDir;
    return {
        //初始化方法
        init: function () {
            _this = this;
            rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            this.switchCmdCli(cmdMark);
            // this.logInfoHandler(cmdMark, stexeFilePath, stwebUrl);
        },
        //根据命令行传递的参数：判断使用事件处理句柄
        switchCmdCli: function (cmdMark) {
            switch (cmdMark) {
                case '--help':
                    _this.helpInfo();
                    break;
                case '-h':
                    _this.helpInfo();
                    break;
                case '--mpasar':
                    _this.openAsarFile(pcargvThree, pcargvFour);
                    break;
                case '--packasar':
                    _this.packAsar(pcargvThree, pcargvFour);
                    break;
                case '--mpappid':
                    _this.openAppID(pcargvThree, pcargvFour);
                    break;
                case '--web':
                    _this.openExeFile(pcargvThree, pcargvFour);
                    break;
                case '--publish':
                    _this.publishHandler(pcargvThree, pcargvFour);
                    break;
                case '--packasar&&publish':
                    break;
                default:
                    _this.helpInfo();
            }
        },
        //将所有路径变为常规化
        getNormalizePath(oldPath) {
            var newPath = null;
            if (_this.fileFlag(oldPath)) {
                newPath = path.normalize(oldPath);
            } else {
                newPath = path.join(__dirname, oldPath)
            }
            return newPath;
        },

        //提示帮助信息并 退出进程
        helpInfo: function () {
            console.log(" --help    help \n  -h    help \n --mpasar    start asar file \n --packasar    pack asar file \n --mpappid    use appID start asar file \n --web    start bs app \n --publish    publish yourself app \n --packasar&&publish    pack and publish app")
            process.exit(1);
        },
        //打开工程门户Exe 通过Exe 打开weburl
        openExeFile: function (stexeFilePath, stwebUrl) {
            var weburl = "web_" + stwebUrl;
            _this.cpExeFileHandler(stexeFilePath, weburl);
        },
        //打开工程门户Exe 通过Exe 打开asar
        openAsarFile: function (stexeFilePath, asarDirPath) {
            var asarPath = "asar_" + asarDirPath;
            _this.cpExeFileHandler(stexeFilePath, asarPath);
        },
        //打开工程门户Exe 通过appID 打开asar
        openAppID: function (stexeFilePath, appID) {
            _this.cpExeFileHandler(stexeFilePath, appID);
        },
        //打包asar 文件
        packAsar: function (asarFileDir, packAsarPath) {
            spawn("asar pack", [asarFileDir, packAsarPath]);
        },
        //工程门户事件处理句柄
        cpExeFileHandler: function (stexeFilePath, stwebUrl) {
            try {
                execFile(stexeFilePath, [stwebUrl], function (error, stdout, stderr) {
                    if (error) {
                        throw error;
                    }
                    console.log(stdout);
                });
            } catch (e) {
                console.log(e);
            }
        },
        // 发布文件事件处理句柄
        publishHandler: function (asarFile, token) {
            tokenVal = token ? token : null;
            var asarFilePath = _this.getNormalizePath(asarFile); //"E://stations/css.asar"
            if (tokenVal) {
                _this.getAppID().then(function (res) {
                    var appID = res;
                    _this.updataFile(token, asarFilePath, appID);
                })
            } else {
                _this.loginGetToken().then(function (res) {
                    var options = {
                        url: 'http://auth2.avidm.com/user/v1/login?userCode=' + res.username + '&password=' + res.password,
                        headers: {
                            'XASPID': 'client1',
                            'XASPKey': 'secret1'
                        }
                    };
                    request(options, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var info = JSON.parse(body);
                            // console.log(info)
                            if (info.code == 200) {
                                _this.getAppID().then(function (res) {
                                    var appID = res;
                                    _this.updataFile(info.data.sessionToken, asarFilePath, appID);
                                })
                            } else {
                                console.log('err');
                            }
                        } else {
                            console.log('err');
                        }
                    });
                }).catch(function (rej) {
                    console.log(rej)
                });
            }

        },
        //获取用户Token
        getToken: function () {

        },
        // 上传文件
        updataFile: function (token, filePath, appID) {
            // console.log(token)

            var formData = {
                file: fs.createReadStream(filePath),
            }
            request.post({
                // url: 'http://10.0.32.106:8080/asp/application/1.0/upload?applicationID=' + appID + '&version=0.0.1',
                url: 'http://10.0.37.11:3000/asp/application/1.0/upload/' + appID + '/0.0.1',
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
        },
        //平台日志信息
        logInfoHandler: function (cmdMark, exeFilePath, currentURL) {
            // console.log({
            //     "cmdMark": cmdMark,
            //     "softPath": exeFilePath,
            //     "webPath": currentURL
            // });
        },
        //错误日志信息
        errInfoHandler: function (err) {
            console.log(err);
        },
        // 获取Appid
        getAppID: function () {
            return new Promise(function (resolve, reject) {
                try {
                    rl.question('appID? ', function (answer) {
                        var appID = answer; //3098cf4a-f825-11e6-86dd-fa163e046858
                        console.log(appID)
                        resolve(appID);
                        rl.close();
                    });
                } catch (e) {
                    reject(e);
                }
            })
        },
        //是否存在需要的文件？
        fileFlag: function (filePath) {
            try {
                fs.accessSync(filePath, fs.F_OK);
            } catch (e) {
                return false;
            }
            return true;
        },
        //通过命令行提示用户输入相关信息，通过信息过去token
        loginGetToken: function () {
            console.log("Would you please Login !");
            return new Promise(function (resolve, reject) {
                try {
                    rl.question('username? ', function (answer) {
                        var username = answer;
                        rl.question('password? ', function (answer) {
                            var password = answer;
                            resolve({
                                username: username,
                                password: password
                            })
                        });
                    });
                } catch (e) {
                    reject(e);
                }
            })
        }
    }
})();
aspdev.init();