const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/pms', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
var conn = mongoose.connection;


conn.once('open', function( ){
    //we're connected
});

var userSchema = new mongoose.Schema({
username: {
    type:String,
    required: true,
    index: {
        unique: true,
    }},

email: {
    type : String,
    required: true,
    index: {
        unique: true,
    }},
password:{
    type: String,
    required: true,
},
date: {
    type: Date,
    default: Date.now
}    
});

 conn.on('error', console.error.bind(console, 'connection error:'));

 var userModel = mongoose.model('user', userSchema);
  module.exports = userModel;