const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types;

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true
    },
    userName:{
        type:String,
        required:true,
        trim: true,
        unique: true
    },
    email:{
        type:String,
        required:true,
        trim: true,
        lowercase: true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },

    Photo:{
        type:String
    },

    followers:[{
        type:ObjectId,
        ref:"USER"
    }],
    
    following:[{
        type:ObjectId,
        ref:"USER"
    }],

    resetToken: {
        type: String
    },
    expireToken: {
        type: Date
    }

}, { timestamps: true })

module.exports = mongoose.models.USER || mongoose.model("USER", userSchema);
