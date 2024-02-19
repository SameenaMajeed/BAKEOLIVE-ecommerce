
const mongoose = require('mongoose');

const walletHistorySchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    totalPrice:{
        type:Number,
        default:0
    },
 
});

module.exports = mongoose.model('WalletHistory', walletHistorySchema);
