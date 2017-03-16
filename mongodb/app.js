var mongo = require("mongodb");
var express = require('express');
var bodyParser = require("body-parser");
//引入express模块
var path = require('path');
//引入path模块为了指向静态资源
var port = 27017;
//指定端口变量的值
var app = express();
//app这个Object表示express应用
var ObjectID = require("mongodb").ObjectID;
var mongoose = require("mongoose");
//引入mongoose模块
var dbs = mongoose.connect("mongodb://127.0.0.1:27017/bjsasc");
//指定mongodb连接的数据库地址,格式为mongoose(“mongodb://user:pass@localhost:port/database”)，本demo中使用的库名为player

//应用搜索app
var searchApp = require("./readLocalMicRex");
var asar = require("asar");


dbs.connection.on("error", function (error) {
  console.log("数据库连接失败：" + error);
});
dbs.connection.on("open", function () {
  console.log("——数据库连接成功！——");
});
var host = 'localhost';
var server = new mongo.Server(host, port, {
  auto_reconnect: true
});
var db = new mongo.Db('bjsasc', server, {
  salf: true
});

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())
app.use(bodyParser())
app.use(express.static(path.join(__dirname, 'public')));
//指定静态资源位置
app.set('views', './views');
//指定视图位置
app.set('view engine', 'ejs');
//指定模板引擎
app.listen(1234);
//监听80端口

/*
 * @author lx 2017-2-23
 * @method query GET
 * @param dbcol:db.collection
 * @param id:_id
 * @result JSON
 */
app.get('/storage/:dbcol/:id', function (req, res) {
    try {
      var dbcol = req.params.dbcol;
      var obj_id = ObjectID.createFromHexString(req.params.id);
      var whereStr = {
        "_id": obj_id
      };
      db.open(function (err, db) {
        db.collection(dbcol, function (err, data) {
          data.find(whereStr).toArray(function (err, result) {
            if (err) {
              res.send({
                state: "400",
                result: err
              });
            } else {
              res.send(result);
            }
            db.close();
          })
        })
      })
    } catch (error) {
      throw error;
    }
  })
  //查询集合中所有的数据对象
app.get('/storage/:dbcol', function (req, res) {
  try {
    var dbcol = req.params.dbcol;
    db.open(function (err, db) {
      db.collection(dbcol, function (err, data) {
        data.find({}).toArray(function (err, result) {
          if (err) {
            res.send({
              state: "400",
              result: err
            });
          } else {
            res.send(result);
          }
          db.close();
        })
      })
    })
  } catch (error) {
    throw error;
  }
})

/*
 * @author lx 2017-2-23
 * @method save POST
 * @param key
 */
app.post('/storage/:dbcol', function (req, res) {
  try {
    var dbcol = req.params.dbcol;
    var data = JSON.parse(req.body.data);
    db.open(function (err, db) {
      db.collection(dbcol, function (err, collection) {
        collection.insert(data, function (err, result) {
          if (err) {
            res.json({
              state: 400,
              result: err
            });
          } else {
            res.send(result.ops);
          }
          db.close();
        })
      })
    })
  } catch (error) {

  }

});

/*
 * @author lx 2017-2-23
 * @method delete GET
 * @param key
 */
app.delete('/storage/:dbcol/:id', function (req, res) {
  try {
    var dbcol = req.params.dbcol;
    var obj_id = ObjectID.createFromHexString(req.params.id);
    var whereStr = {
      "_id": obj_id
    };
    db.open(function (err, db) {
      db.collection(dbcol, function (err, collection) {
        collection.remove(whereStr, function (err, result) {
          if (err) {
            res.send({
              state: 400,
              result: err
            })
          } else {
            res.json({
              state: 200,
              result: "success"
            });
          }
          db.close();
        })
      })
    })
  } catch (error) {
    throw error;
  }

})

/*
 * @author lx 2017-2-23
 * @method update PUT
 * @param key
 */
app.put('/storage/:dbcol/:id', function (req, res) {
  try {
    var data = JSON.parse(req.body.data);
    var dbcol = req.params.dbcol;
    var obj_id = ObjectID.createFromHexString(req.params.id);
    var whereStr = {
      "_id": obj_id
    };
    var updateJson = {
      $set: data
    };
    db.open(function (err, db) {
      db.collection(dbcol, function (err, collection) {
        collection.update(whereStr, updateJson, function (err, result) {
          if (err) {
            res.json({
              state: 400,
              result: err
            });
          } else {
            res.json({
              state: 200,
              result: "success"
            });
          }
          db.close();
        })
      })
    })
  } catch (error) {
    throw error;
  }
})

//查询搜索中的app.js应用
app.get('/search/:content', function (req, res) {
  //res.send({result:"123"})
  try {
    var content = req.params.content;
    searchApp("search", '11111111').then(function (data) {
      res.send({
        result: data
      })
    },function(err){
      console.log(err)
    })
  } catch (error) {
    throw error;
  }
})

module.exports = app;