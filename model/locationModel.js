const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    district:{
        type:String,
        unique:true,
        required:true
    },
    pincode:{
        type:[String],
        required:true
   }
})

module.exports = mongoose.model("Location",locationSchema);