// const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//     userId: {
//         type: String,
//         required: true,
//     },
//     products: [
//         {
//             product: {
//                 type: mongoose.Schema.Types.ObjectId,
//                 ref: 'Product', // Reference the 'Product' model
//                 required: true,
//             },
//             price: {
//                 type: Number,
//                 required: true,
//             },
//             quantity: {
//                 type: Number,
//                 required: true,
//             },
//             is_cancelled:{
//                 type:Boolean,
//                 default:false,
            
//             },
//             status: {
//                 type: String,
//                 default: 'Pending',
//             },

//         },
//     ],
//     name: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//     },
//     address: {
//         address: {
//             type: String,
//             required: true,
//         },
//         state: {
//             type: String,
//             required: true,
//         },
//         city: {
//             type: String,
//             required: true,
//         },
//         pincode: {
//             type: String,
//             required: true,
//         },
//     },
//     totalPrice: {
//         type: Number,
//         default: 0,
//     },
//     paymentMethod: {
//         type: String,
//         required: true,
//     },
//     orderPlacedAt: {
//         type: Date,
//         default: Date.now,
//     },
//     walletAmount: {
//         type: Number,
//         default: 0,
//     },
//     walletHistory: [
//         {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'WalletTransaction',
//         },
//     ],
// });

// module.exports = mongoose.model('Order', orderSchema);


const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Reference the 'Product' model
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
        },
    ],
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        address: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
    paymentMethod: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    orderPlacedAt: {
        type: Date,
        default: Date.now,
    },
    walletAmount: {
        type: Number,
        default: 0,
    },
    is_cancelled:{
        type:Boolean,
        default:false,
    
    },
    walletHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'WalletTransaction',
        },
    ],
});

module.exports = mongoose.model('Order', orderSchema);
