var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require("body-parser");
var multer = require('multer');
var path = require('path');
var app = express();

var Schema = mongoose.Schema;
//建模
var userSchema = new Schema({
    id:String,
    username:String,
    password:String,
    age:Number,
    time:Date
})
var user = mongoose.model('User',userSchema,'user');

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use(bodyParser())
app.use(express.static(path.join(__dirname, 'public')));
//指定静态资源位置
app.listen(3000);

var dburl = 'mongodb://localhost/bjsasc';
var db = mongoose.connect(dburl);

db.connection.on('error',function(error){
    console.log("connect fail!")
})

db.connection.once('open',function(res){
    console.log("mongodb connect successful!")
})

//请求添加数据
app.post('/mongodb/add',function(req,res){
    db = mongoose.connect(dburl);
    var data = req.body;
    console.log(req.body)
    user.create(data,function(error){
        if(error){
            console.log("add data fail!")
        }else{
            res.send({result:"add data successful!"});
             mongoose.disconnect();//db.close();
        }
    })
})

//GET请求查询数据
app.get('/mongodb/query',function(req,res){
    console.log("all")
    db = mongoose.connect(dburl);
    user.find({},function(error,result){
        if(error){
            console.log("query data fail");
        }else{
            res.send(result);
             mongoose.disconnect();//db.close();
        }
    })
})

//GET请求查询数据单条数据
app.get('/mongodb/querybyId/:name',function(req,res){
    db = mongoose.connect(dburl);
    var data ={username:req.query.username} ;
    user.find(data,function(error,result){
        if(error){
            console.log("query data fail!");
        }else{
            res.send(result);
            mongoose.disconnect();//db.close();
        }
    })
})

//GET删除条件数据信息
app.get('/mongodb/delete/:name',function(req,res){
    db = mongoose.connect(dburl);
    var data ={username:req.query.username} ;
    user.remove(data,function(error,result){
        if(error){
            console.log("delete data fail!")
        }else{
            res.send({result:"delete data successful"});
            mongoose.disconnect();
        }
    })
})


