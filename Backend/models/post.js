const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title:{
        type:String,
        
    },
    body:{
        type:String,
        required:true
    },
    photo:{
        type:String,
        required:true
    },
    likes:[{ type:mongoose.Schema.Types.ObjectId,
        ref:"USER"
    }],
    
    comments:[{
        comment:{type:String},
        postedBy:{type:mongoose.Schema.Types.ObjectId, ref:"USER"}
    }],

    postedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"USER"
    }

}, { timestamps: true });

module.exports = mongoose.models.POST || mongoose.model("POST", postSchema);
