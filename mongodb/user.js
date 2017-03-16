var mongoose = require('mongoose');

var Schema = mongoose.Schema;
//建模
var userSchema = new Schema({
    id:String,
    username:String,
    password:String,
    age:Number,
    time:Date
})
var User = mongoose.model('User',userSchema);
 
 module.exports = User;