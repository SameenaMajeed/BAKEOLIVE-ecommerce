const mongoose = require('mongoose');

const Order = require('../model/orderModel');

const Wallet = require('../model/walletHistoryModel')

const Product = require('../model/productModel')

const loadOrder = async (req, res) => {
    try {
        const orders = await Order.find();
        res.render('order-list', { orders });

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { newStatus } = req.body;

        if (!newStatus) {
            return res.status(400).json({ error: 'New status is required' });
        }

        const updatedOrder = await Order.findByIdAndUpdate(orderId, { status: newStatus }, { new: true });

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder, newStatus });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// ..........user..............................


const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const user = req.session.user_id;

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const currentTime = new Date();
        const orderPlacedTime = order.orderPlacedAt; // Use the correct field for order placement time
        const timeDifferenceInHours = (currentTime - orderPlacedTime) / (1000 * 60 * 60);

        if (timeDifferenceInHours > 4) {
            return res.status(400).json({ message: 'Cannot cancel order after 4 hours' });
        }

        const canceledAmount = order.totalPrice;

        // Log to check if the canceledAmount is correct
        console.log('Canceled Amount:', canceledAmount);

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: { status: 'Cancelled', is_cancelled: true },
                $inc: { walletAmount: canceledAmount },
            },
            { new: true }
        );

        const orderData = await Order.findById(orderId);

        // Log to check orderData and user
        console.log('Order Data:', orderData);
        console.log('User:', user);

        // Update WalletHistory
        const walletData = {
            userId: user,
            totalPrice: canceledAmount,
        };

        const wallet1 = await Wallet.findOne({ userId: user });

        // Log to check wallet1
        console.log('Wallet 1:', wallet1);

        if (wallet1) {
            await Wallet.findByIdAndUpdate(wallet1._id, {
                $inc: { totalPrice: canceledAmount },
            });
        } else {
            const wallet = new Wallet(walletData);
            await wallet.save();
        }

        // Log to check the final state of wallet history
        const finalWalletState = await Wallet.findOne({ userId: user });
        console.log('Final Wallet State:', finalWalletState);

        // Handle product quantity and status updates

        if (updatedOrder) {
            const response = {
                message: 'Order cancelled successfully',
            };
            res.status(200).json(response);
        } else {
            res.status(500).json({ error: 'Error updating order' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// const CancelProduct = async (req, res) => {
//     try {
//         const orderId = req.params.orderId;
//         const productId = req.params.productId;
//         const user = req.session.user_id;

//         // Check if the order is within the cancellation time limit (4 hours)
//         const order = await Order.findById(orderId);
//         const currentTime = new Date();
//         const orderPlacedTime = order.orderPlacedAt;
//         const timeDifferenceInHours = (currentTime - orderPlacedTime) / (1000 * 60 * 60);

//         if (timeDifferenceInHours > 4) {
//             // If more than 4 hours have passed, cancellation is not allowed
//             return res.json({ success: false, error: 'Cancellation time limit exceeded' });
//         }

//         // Find the product to be canceled
//         const productToCancel = order.products.find(product => product._id.toString() === productId);

//         if (!productToCancel) {
//             return res.status(404).json({ success: false, error: 'Product not found in the order' });
//         }

//         // Perform logic to update the order (remove the canceled product)
//         const canceledAmount = productToCancel.price * productToCancel.quantity;
//         console.log('canceledAmount:',canceledAmount)

//         const updatedOrder = await Order.findByIdAndUpdate(
//             orderId,
//             {
//                 $set: {
//                     'products.$[elem].status': 'Cancelled',
//                     'products.$[elem].is_cancelled': true,
//                 },
//                 $inc: { walletAmount: canceledAmount },
//             },
//             {
//                 new: true,
//                 arrayFilters: [{ 'elem._id': productToCancel._id, 'elem.is_cancelled': { $ne: true } }],
//             }
//         );

//         console.log('updatedOrder:',updatedOrder)

//         // Update WalletHistory
//         const walletData = {
//             userId: user,
//             totalPrice: canceledAmount,
//         };

//         const wallet1 = await Wallet.findOne({ userId: user });

//         if (wallet1) {
//             await Wallet.findByIdAndUpdate(wallet1._id, {
//                 $inc: { totalPrice: canceledAmount },
//             });
//         } else {
//             const wallet = new Wallet(walletData);
//             await wallet.save();
//         }

//         // Handle product quantity and status updates

//         if (updatedOrder) {
//             const response = {
//                 message: 'Order cancelled successfully',
//             };
//             res.status(200).json(response);
//         } else {
//             res.status(500).json({ error: 'Error updating order' });
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         // Send an error response
//         res.status(500).json({ success: false, error: 'Internal Server Error' });
//     }
// };



module.exports = {
    loadOrder,
    updateOrderStatus,
    cancelOrder,
    // CancelProduct,
    // cancelTime
    // changeStatus,refund,  
};
