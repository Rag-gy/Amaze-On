const mongoose = require('mongoose')

const users = new mongoose.Schema({
    name:{type:String, trim:true},
    email:{type:'String', trim:true},
    password:{type:'String', trim:true},
    authToken:{type:'String', trim:true},
    image:{type:String}
}, {timestamps:true})

const User = mongoose.model('User',users)

module.exports = User