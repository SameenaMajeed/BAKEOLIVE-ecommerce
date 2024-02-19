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
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: { status: 'Cancelled', is_cancelled: true },
                $inc: { walletAmount: canceledAmount },
            },
            { new: true }
        );

        const orderData = await Order.findById(orderId);

        // Use WalletHistory model instead of Wallet
        const count = await WalletHistory.countDocuments({ userId: user });
        console.log('count', count);

        if (orderData && orderData.is_cancelled === true) {
            const totalAmount = orderData.totalPrice;
            console.log('total', totalAmount);

            if (count === 0) {
                const wallet = new WalletHistory({
                    userId: user,
                    totalPrice: totalAmount,
                });
                await wallet.save();
            } else if (count > 0) {
                const wallet1 = await WalletHistory.findOne({ userId: user });
                if (wallet1) {
                    await WalletHistory.findOneAndUpdate(
                        { userId: user },
                        { $inc: { totalPrice: totalAmount } },
                        { new: true }
                    );
                } else {
                    const wallet = new WalletHistory({
                        userId: user,
                        totalPrice: totalAmount,
                    });
                    await wallet.save();
                }
            }
        }

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

//         const order = await Order.findById(orderId);

//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }

//         const currentTime = new Date();
//         const orderPlacedTime = order.orderPlacedAt;
//         const timeDifferenceInHours = (currentTime - orderPlacedTime) / (1000 * 60 * 60);

//         if (timeDifferenceInHours > 4) {
//             return res.status(400).json({ message: 'Cannot cancel order after 4 hours' });
//         }

//         const canceledAmount = order.totalPrice;
//         const updatedOrder = await Order.findByIdAndUpdate(orderId, {
//             $set: { status: 'Cancelled' },
//             $inc: { walletAmount: canceledAmount },
//         }, { new: true });

//         const orderData = await Order.findById(id);
//         for (const orderItem of orderData.products) {
//             const productId = orderItem.product;
//             const orderQuantity = orderItem.quantity;

//             const product = await Product.findById(productId);

//             if (product) {
//                 product.quantity += orderQuantity;
//                 product.status = 'Available';
//                 product.is_cancelled = false;
//                 await product.save();
//             } else {
//                 console.error(`Product with ID ${productId} not found in the Product collection.`);
//             }
//         }

//         if (order) {
//             const response = {
//                 message: `Order cancelled successfully`,
//                 error: 'Status not changed'
//             }
//             res.status(200).json(response);




//             if (req.body.paymentMethod !== 'COD') {
//                 const count = await Wallet.countDocuments({});
//                 console.log('count', count);


//                 if (orderData && orderData.is_cancelled === true) {
//                     const totalAmount = orderData.totalPrice;
//                     console.log('total', totalAmount)

//                     if (count === 0) {

//                         const wallet = new Wallet({
//                             userId: user,
//                             totalPrice: totalAmount
//                         });
//                         const res = await wallet.save();

//                     } else if (count > 0) {

//                         const wallet1 = await Wallet.findOne({ userId: user });
//                         if (wallet1) {

//                             await Wallet.findOneAndUpdate({ userId: user }, { $inc: { totalPrice: totalAmount } }, { new: true });

//                         } else {

//                             const wallet = new Wallet({
//                                 userId: user,
//                                 totalPrice: totalAmount
//                             });
//                             const res = await wallet.save();

//                         }
//                     }

//                 } else {
//                     console.log('tefd')
//                 }
//             }


//         }

//         // await WalletHistory.create({
//         //     userId: updatedOrder.userId,
//         //     amount: canceledAmount,
//         //     type: 'credit',
//         //     description: 'Order cancellation refund',
//         // });

//         // res.status(200).json({ message: 'Order cancelled successfully', order: updatedOrder });
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// const changeStatus = async(req,res)=>{
//     try{

//         const {orderId,newStatus} = req.body;
//         if(newStatus === 'Cancelled'){
//             const order = await Order.findByIdAndUpdate({_id:orderId},{$set:{status:newStatus,is_cancelled:true}});

//             const orderData = await Order.findById(orderId);
//             for(const orderItem of orderData.product){
//                 const productId = orderItem.productId;
//                 const orderQuantity = orderItem.quantity;
    
//                 const product = await Product.findById(productId);
    
//                 if(product){
//                     product.quantity += orderQuantity;
//                     await product.save();
//                 }else{
//                     console.error(`Product with ID ${productId} not found in the Product collection.`);
//                 }
//             }
 
//             if(order){
//                 const response = {
//                     message:`Status changed `,
//                     error:'Status not changed'
//                 }
//                 res.status(200).json(response);
//             }

            
//             const totalAmount = orderData.totalPrice;
//             console.log('total',totalAmount)
           
//            if(count === 0 ){
         
//             const wallet = new Wallet({
//                 userId:user,
//                totalPrice:totalAmount
//             });
//             const res= await wallet.save();
          
//            }else if(count>0){
             
//                 const wallet1 = await Wallet.findOne({userId:user});
//                 if(wallet1){
                   
//                     await Wallet.findOneAndUpdate({userId:user},{$inc:{totalPrice:totalAmount}},{new:true});
                 
//                 }else{
                   
//                     const wallet = new Wallet({
//                         userId:user,
//                         totalPrice:totalAmount
//                     });
//                     const res= await wallet.save();
              
//                 }
//            }


//         }else{
//             const order = await Order.findByIdAndUpdate({_id:orderId},{$set:{status:newStatus}});
//             if(order){
//                 const response = {
//                     message:`Status changed `,
//                     error:'Status not changed'
//                 }
//                 res.status(201).json(response);
//             }
//         }
       
      
       
//     }
//     catch(err){
//         console.log(err.message);
//         res.status(500).json({error:'Internal server error'})
//     }
// }

// const refund = async(req,res)=>{
//     try{
//         const user = req.session.user_id;
//   const id = req.body.orderId;
//   console.log(id);
//   const order = await Order.findByIdAndUpdate(id,{$set:{is_cancelled:true}});

//   const orderData = await Order.findById(id);
//   for(const orderItem of orderData.product){
//       const productId = orderItem.productId;
//       const orderQuantity = orderItem.quantity;

//       const product = await Product.findById(productId);

//       if(product){
//           product.quantity += orderQuantity;
//           product.status = 'Available';
//           product.is_return = true;
//           await product.save();
//       }else{
//           console.error(`Product with ID ${productId} not found in the Product collection.`);
//       }
//   }

//   if(order){
//     const response = {
//         message:`Status changed`,
//         error:'Status not changed'
//     }
//     res.status(200).json(response);

//     const count =await Wallet.countDocuments({}); 
//     console.log('count',count);
 

//     if(orderData && orderData.is_return === true){
//         const totalAmount = orderData.totalPrice;
//         console.log('total',totalAmount)
       
//        if(count === 0 ){
     
//         const wallet = new Wallet({
//             userId:user,
//            totalPrice:totalAmount
//         });
//         const res= await wallet.save();
      
//        }else if(count>0){
         
//             const wallet1 = await Wallet.findOne({userId:user});
//             if(wallet1){
               
//                 await Wallet.findOneAndUpdate({userId:user},{$inc:{totalPrice:totalAmount}},{new:true});
             
//             }else{
               
//                 const wallet = new Wallet({
//                     userId:user,
//                     totalPrice:totalAmount
//                 });
//                 const res= await wallet.save();
          
//             }
//        }
      
//     }else{
//         console.log('tefd')
//     }

// }

//     }
//     catch(err){
//         console.log(err.message);
//         res.status(500).json({error:'Internal server error'});
//     }
// }


module.exports = {
    loadOrder,
    updateOrderStatus,
    cancelOrder,
    // changeStatus,refund,  
};
