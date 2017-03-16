/*
 * @Author: jiwei
 * @Date: 2017-03-13 14:50:01
 * @Last Modified by: jiwei
 * @Last Modified time: 2017-03-13 16:34:36
 */
var key;
var rejectActions = {};
var resolveActions = {};
var parasmData = null;
var fs = require("fs");
var asar = require("asar");
var readyDirPlace = "/home/bjsasc/asar/microapp";
//
// ─── APP ────────────────────────────────────────────────────────────────────────
//
global.App = function (viewObject) {
    try {
        if (key.search("search") > -1) {
            if (viewObject.onSearch) {
                var searchData = viewObject.onSearch(parasmData);
                resolveActions[key](searchData);
            } else {
                resolveActions[key](false);
            }
        } else {
            if (viewObject.onViewObject) {
                var onViewObjectData = viewObject.onViewObject(parasmData);
                resolveActions[key](onViewObjectData);
            } else {
                resolveActions[key](false);
            }
        }
    } catch (err) {
        rejectActions[key](false);
    }
}
//
// ─── GETSEARCHAPP ───────────────────────────────────────────────────────────────
//
function getSearchApp(type, parasm) {
    parasmData = parasm;
    //解压asar包
    asar.extractAll (readyDirPlace,'./test').then(function(data){
        console.log("111111111111")
    },function(err){
        console.log("2222222222222222")
    }) 
    var result = [];
    var dirContent = fs.readdirSync(readyDirPlace);
    for (var i = 0; i < dirContent.length; i++) {
        if (type === "search") {
            key = "search" + require('uuid/v1')();
        } else {
            key = require('uuid/v1')();
        }
         if (dirContent[i] != "test.asar") {
            var a = new Promise(function (res, rej) {
                resolveActions[key] = res;
                rejectActions[key] = rej;
                require(readyDirPlace +"/"+ dirContent[i] + "/app.js");
            });
            result.push(a);
         }
    }
    return Promise.all(result);
}
//
// ─── TEST ───────────────────────────────────────────────────────────────────────
//
// getSearchApp("search", '11111').then(function (res) {
//     console.log(res)
// })
module.exports = getSearchApp;