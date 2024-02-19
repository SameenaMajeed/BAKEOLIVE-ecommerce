const Razorpay = require('razorpay');
const Order = require('../model/orderModel');
const Product = require('../model/productModel');
const Cart = require('../model/cartModel');
const User = require('../model/userModel')
const Wallet = require('../model/walletHistoryModel')


// Instantiate Razorpay
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.user_id;

        const cart = await Cart.findOne({ userId }).populate('products.product');

        const user = await User.findById(userId).exec();
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const cartData = {
            products: cart.products,
            totalPrice: cart.totalPrice
        };

        res.render('checkOut', { userId, cartData, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const placeOrder = async (req, res) => {
    try {
        const userId = req.session.user_id;
        if (!userId) {
            res.redirect('/home');
            return;
        }

        const { payment, name, city, email, address, pincode, state } = req.body;
        console.log('req.body of cod :', req.body)

        let totalPrice = 0;
        let totalQuantity = 0;

        const cartData = await Cart.find({ userId }).populate('products.product');
        if (cartData.length > 0) {
            totalPrice = cartData[0].totalPrice;
        } else {
            res.redirect('/allProduct');
            return;
        }


        const productsArray = cartData[0].products.map(product => ({
            product: product.product._id,
            price: product.price,
            quantity: product.quantity,
        }));

        const productIds = Array.isArray(req.body.productId)
            ? req.body.productId
            : [req.body.productId];

        console.log('productIds:', productIds)


        if (payment === 'COD') {

            const cartData = await Cart.findOne({ userId }).populate('products.product').lean();

            if (!cartData) {
                throw new Error('Cart not found');
            }

            const totalPrice = cartData.totalPrice;

            const productsArray = cartData.products.map(product => ({
                product: product.product._id,
                price: product.price,
                quantity: product.quantity,
            }));

            const totalQuantity = productsArray.reduce((sum, product) => sum + product.quantity, 0);

            const orderData = new Order({
                userId: userId,
                products: productsArray,
                name: name,
                email: req.body.email, // Assuming you have email in the form
                address: {
                    address: req.body.address,
                    city: city,
                    pincode: req.body.pincode, // Assuming you have pincode in the form
                    state: req.body.state, // Assuming you have state in the form
                },
                paymentMethod: 'COD',
                quantity: totalQuantity,
                totalPrice: totalPrice,
            });

            const validationResult = orderData.validateSync(); // Validate the orderData

            if (validationResult) {
                // Handle validation errors
                const errors = Object.values(validationResult.errors).map(err => err.message);
                return res.status(400).json({ error: errors });
            }

            const savedOrder = await orderData.save();

            if (!savedOrder) {
                throw new Error('Failed to save COD order');
            }

            if (savedOrder) {
                //res.render('user/orderplaced',{title:'Orderstatus',style:'style.css',user:true,log});   
                const response = {
                    message: 'Order Placed (COD)',
                    payment: 'COD',
                };
                console.log('response of server', response)
                res.status(200).json(response);
                const product = req.body.productId;
                console.log('product:', product)
                const updated = await Cart.updateOne(
                    {
                        userId: userId,
                        'products.product': { $in: Array.isArray(product) ? product : [product] }
                    },
                    {
                        $pull: {
                            products: {
                                product: { $in: Array.isArray(product) ? product : [product] }
                            }
                        }
                    }
                );
                console.log('updated :', updated)
                const user = await User.findById(req.session.user_id);
                console.log('user:', user)
                const count = await Wallet.find({ userId: req.session.user_id }).count();
                console.log('count:', count)
                if (user.refferedCode && user.is_reffered === false) {
                    if (count === 0) {
                        const wallet = new Wallet({
                            userId: req.session.user_id,
                            totalPrice: 50
                        });
                        console.log('wallet:', wallet)
                        const res = await wallet.save();
                        console.log('res :', res)

                        await User.findByIdAndUpdate(req.session.user_id, { is_reffered: true });
                    }

                }

                const referdUser = await User.findOne({ referalCode: user.refferedCode });
                console.log('referdUser :', referdUser)
                if (referdUser && user.is_reffered === false) {

                    const user1 = await User.findOne({ referalCode: user.refferedCode });

                    console.log('user1 :', user1)

                    const count1 = await Wallet.find({ userId: user1._id })
                    console.log('count1  :', count1)


                    if (count1.length === 0) {

                        const wallet = new Wallet({
                            userId: referdUser._id,
                            totalPrice: 100
                        });
                        const res = await wallet.save();

                    } else if (count1.length > 0) {

                        const wallet1 = await Wallet.findOne({ userId: referdUser._id });
                        if (wallet1) {

                            await Wallet.findOneAndUpdate({ userId: referdUser._id }, { $inc: { totalPrice: 100 } }, { new: true });

                        } else {

                            const wallet = new Wallet({
                                userId: referdUser._id,
                                totalPrice: 100
                            });
                            console.log('wallet:', wallet)
                            const res = await wallet.save();
                            console.log('res:', res)
                        }
                    }


                }

            }

        }

        else if (req.body.payment === "WALLET") {

            const id = req.session.user_id

            const wallet = await Wallet.findOne({ userId: id });
            // const walletTotal = wallet.find(total=>total)
            const cartTotal = cartData.find(total => total)
            console.log(wallet.totalPrice);
            console.log(cartTotal.totalPrice);
            console.log('wal-', wallet.totalPrice);
            console.log('Cart Total Price:', cartTotal.totalPrice);
            console.log('Wallet Total Price:', wallet.totalPrice);
            if (cartTotal.totalPrice <= wallet.totalPrice) {

                const updatedTotal = wallet.totalPrice - cartTotal.totalPrice;
                console.log(updatedTotal);

                const order_Data = new Order({
                    userId: userId,
                    products: productsArray,
                    name: name,
                    email: req.body.email, // Assuming you have email in the form
                    address: {
                        address: req.body.address,
                        city: city,
                        pincode: req.body.pincode, // Assuming you have pincode in the form
                        state: req.body.state, // Assuming you have state in the form
                    },
                    paymentMethod: req.body.payment,
                    quantity: totalQuantity,
                    totalPrice: totalPrice,
                });

                const orderData = await order_Data.save();
                const wallet1 = await Wallet.findOneAndUpdate({ userId: id }, { $set: { totalPrice: updatedTotal } }, { new: true });

                console.log('wallet1:',wallet1)
                const response = {
                    message: 'Order Placed',
                    payment: req.body.payment
                }
                res.status(200).json(response)
                const productId = req.body.productId
                const updated = await Cart.updateOne({
                    userId: id, 'products.product': { $in: Array.isArray(productId) ? productId : [productId] }
                },
                    {
                        $pull: { products: { product: { $in: Array.isArray(productId) ? productId : [productId] } } },
                    });

            } else {

                const response = { errorMessages: 'Insufficient balance.Choose another option' };
                return res.status(400).json(response)
            }
        }
        else {
            const amount = totalPrice * 100;
            const options = {
                amount: amount,
                currency: "INR",
                receipt: generateOrderId(),
            };

            const orderPromise = new Promise((resolve, reject) => {
                razorpayInstance.orders.create(options, (err, order) => {
                    if (err) {
                        console.error('Error creating Razorpay order:', err);
                        reject(err);
                    } else {
                        resolve(order);
                    }
                });
            });

            const order = await orderPromise;

            if (!order) {
                console.error('Razorpay order is undefined.');
                res.status(500).json({ error: 'Failed to create Razorpay order' });
                return;
            }

            // Clear cart after placing the order
            //   await Cart.deleteOne({ userId });

            const response = {
                method: "UPI",
                success: true,
                amount: amount,
                key_id: RAZORPAY_KEY_ID,
                name: req.session.user_id,
                order: order,
            };

            console.log('Server Response:', response);
            console.log(order);
            res.status(200).json({ response });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

function generateOrderId() {
    const timestamp = Date.now().toString(); // Get current timestamp
    const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string

    // Concatenate timestamp and random string to create the order ID
    const orderId = `${timestamp}-${randomString}`;

    return orderId;
}


const razorpayVerify = async (req, res) => {
    try {
        console.log('req.body:', req.body);
        console.log('req.body.proName', req.body.proName);
        console.log(req.body.productId)

        const log = req.session.user_id;
        const id = req.session.user_id;

        const cartData = await Cart.findOne({ userId: id }).populate('products.product').lean();
        console.log('cartData : ', cartData)
        if (!cartData) {
            throw new Error('Cart not found');
        }

        const { quantity, price, proName } = req.body;
        console.log('quantity', quantity)
        console.log('price', price)

        const quantityArray = Array.isArray(req.body.quantity) ? req.body.quantity.map(Number) : [Number(req.body.quantity)];
        const priceArray = Array.isArray(req.body.price) ? req.body.price.map(Number) : [Number(req.body.price)];
        const nameArray = Array.isArray(req.body.name) ? req.body.name : [req.body.name];

        console.log('quantityArray:', quantityArray);
        console.log('priceArray:', priceArray);

        if (quantityArray.some(isNaN) || priceArray.some(isNaN)) {
            throw new Error('Invalid quantity or price values');
        }

        const productsArray = quantityArray.map((quantity, index) => ({
            product: cartData.products[index].product._id,
            quantity: parseInt(quantity),
            price: parseFloat(priceArray[index]),
            // name: nameArray[index],
        }));
        console.log('productsArray :', productsArray)

        const orderData = new Order({
            userId: id,
            products: productsArray,
            name: req.body.name,
            email: req.body.email,
            address: {
                address: req.body.address,
                city: req.body.city,
                pincode: req.body.pincode,
                state: req.body.state,
            },
            paymentMethod: req.body.payment,
            quantity: cartData.products.reduce((sum, product) => sum + product.quantity, 0),
            totalPrice: cartData.totalPrice,
        });
        console.log('orderData :', orderData)


        const savedOrder = await orderData.save();

        if (!savedOrder) {
            throw new Error('Failed to save order');
        }

        const response = {
            success: true,
            message: 'Order Placed',
            error: 'Order failed',
            payment: req.body.payment,
        };

        res.status(200).json(response);

        const updatedCart = await Cart.updateOne({
            userId: id,
        }, {
            $pull: {
                products: { product: { $in: cartData.products.map(p => p.product) } }
            },
        });

        const user = await User.findById(req.session.user_id);
        const count = await Wallet.find({ userId: req.session.user_id }).count();
        if (user.refferedCode && user.is_reffered === false) {

            if (count === 0) {
                const wallet = new Wallet({
                    userId: req.session.user_id,
                    totalPrice: 50
                });
                const res = await wallet.save();

                await User.findByIdAndUpdate(req.session.user_id, { is_reffered: true });
            }

        }

        const referdUser = await User.findOne({ referalCode: user.refferedCode });
        if (referdUser && user.is_reffered === false) {
            const user1 = await User.findOne({ referalCode: user.refferedCode });

            const count1 = await Wallet.find({ userId: user1._id })

            console.log('count=', count1.length)
            if (count1.length === 0) {

                const wallet = new Wallet({
                    userId: referdUser._id,
                    totalPrice: 100
                });
                const res = await wallet.save();

            } else if (count1.length > 0) {

                const wallet1 = await Wallet.findOne({ userId: referdUser._id });
                if (wallet1) {

                    await Wallet.findOneAndUpdate({ userId: referdUser._id }, { $inc: { totalPrice: 100 } }, { new: true });

                } else {

                    const wallet = new Wallet({
                        userId: referdUser._id,
                        totalPrice: 100
                    });
                    const res = await wallet.save();

                }
            }


        }
    } catch (err) {
        console.error(err.message);
        const response = {
            error: err.message,
        };
        res.status(400).json(response);
    }
};

const orderPlaceLoad = async (req, res) => {
    try {
        const log = req.session.user_id;
        const orderDetails = await Order.findOne({ userId: log }).populate('products.product').populate('address').sort({ _id: -1 }).limit(1).lean();

        res.render('order-confirmation', { orderDetails, userId: log });
        await Cart.deleteOne({ userId: log });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// const changeStatus = async (req, res) => {
//     try {
//         const user = req.session.user_id;
//         const id = req.body.orderId;

//         console.log(id)

//         const order = await Order.findByIdAndUpdate(id, { $set: { status: 'Cancelled', is_cancelled: true } });

//         const orderData = await Order.findById(id);
//         for (const orderItem of orderData.product) {
//             const productId = orderItem.productId;
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
//                 message: `Status changed`,
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

//     }
//     catch (err) {
//         console.log(err.message);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// }



module.exports = {
    loadCheckout,
    placeOrder,
    orderPlaceLoad,
    razorpayVerify,
    // changeStatus
};
