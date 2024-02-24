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



// const cancelOrder = async (req, res) => {
//     try {
//         const { orderId } = req.params;
//         const user = req.session.user_id;

//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         const currentTime = new Date();
//         const orderPlacedTime = order.orderPlacedAt; // Use the correct field for order placement time
//         const timeDifferenceInHours = (currentTime - orderPlacedTime) / (1000 * 60 * 60);

//         if (timeDifferenceInHours > 4) {
//             return res.status(400).json({ message: 'Cannot cancel order after 4 hours' });
//         }

//         const canceledAmount = order.totalPrice;
//         const updatedOrder = await Order.findByIdAndUpdate(
//             orderId,
//             {
//                 $set: { status: 'Cancelled', is_cancelled: true },
//                 $inc: { walletAmount: canceledAmount },
//             },
//             { new: true }
//         );

//         const orderData = await Order.findById(orderId);

//         // Use WalletHistory model instead of Wallet
//         const count = await WalletHistory.countDocuments({ userId: user });
//         console.log('count', count);

//         if (orderData && orderData.is_cancelled === true) {
//             const totalAmount = orderData.totalPrice;
//             console.log('total', totalAmount);

//             if (count === 0) {
//                 const wallet = new WalletHistory({
//                     userId: user,
//                     totalPrice: totalAmount,
//                 });
//                 await wallet.save();
//             } else if (count > 0) {
//                 const wallet1 = await WalletHistory.findOne({ userId: user });
//                 if (wallet1) {
//                     await WalletHistory.findOneAndUpdate(
//                         { userId: user },
//                         { $inc: { totalPrice: totalAmount } },
//                         { new: true }
//                     );
//                 } else {
//                     const wallet = new WalletHistory({
//                         userId: user,
//                         totalPrice: totalAmount,
//                     });
//                     await wallet.save();
//                 }
//             }
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
//         console.log(error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

const cancelTime = async (req, res) => {
    try {
        const { orderId } = req.params;
        console.log('req.params:',req.params)

        // Fetch the order from your database and retrieve the order placement time
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Assuming your order model has a field called 'orderPlacedAt' under 'address'
        const orderPlacedTime = order.address.orderPlacedAt;
        console.log('orderPlacedTime:',orderPlacedTime)

        res.status(200).json({ orderPlacedTime });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = {
    loadOrder,
    updateOrderStatus,
    cancelOrder,
    cancelTime
    // changeStatus,refund,  
};
