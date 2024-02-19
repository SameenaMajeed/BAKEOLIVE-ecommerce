const Order = require('../model/orderModel');
const Wallet = require('../model/walletHistoryModel');

const loadWallet = async (req, res) => {
    try {
        const log = req.session.user_id;
        const orderData = await Order.find({ userId: log });
        console.log('orderData:', orderData);

        // Filter cancelled orders and non-COD payment method
        const filteredData = orderData.filter(order => order.is_cancelled===true && order.paymentMethod !== 'COD');

        // Filter credit (WALLET) orders
        const creditData = orderData.filter(order => order.paymentMethod === 'WALLET');

        console.log('filteredData:', filteredData);
        console.log('creditData', creditData);

        // Sum up the cancelled order amounts
        const cancelledAmount = filteredData.reduce((total, order) => total + order.totalPrice, 0);

        // Get the current wallet data
        const wallet = await Wallet.findOne({ userId: log });

        // If wallet exists, update the total amount
        if (wallet) {
            await Wallet.findOneAndUpdate({ userId: log }, { $set: { totalPrice: cancelledAmount } });
        } else {
            // If wallet does not exist, create a new wallet entry
            const newWallet = new Wallet({
                userId: log,
                totalPrice: cancelledAmount,
            });
            await newWallet.save();
        }

        console.log('wallet rs:', wallet);

        const data = filteredData.map(order => order.toObject());
        console.log('data:', data);
        const data1 = creditData.map(order => order.toObject());
        console.log('data1:', data1);
        res.render('wallet', { log, data, wallet, data1, orderData });

    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    loadWallet
};
