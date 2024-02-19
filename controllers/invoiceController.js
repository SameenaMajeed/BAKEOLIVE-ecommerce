

const easyinvoice = require('easyinvoice');
const fs = require('fs');
const Order = require('../model/orderModel');
const User = require('../model/userModel'); // Assuming your User model file is named 'userModel'

const createInvoice = async(req, res) => {
    try {
        const orderId = req.query.id;
        console.log(orderId);
        const orderData = await Order.findById(orderId).populate('products.product');
        const order = orderData.toObject();
        const user = await User.findById(order.userId); // Assuming the 'userId' field exists in your Order model

        if (!order) {
            console.error('Order not found');
            return res.status(404).send('Order not found');
        }

        const shortenedOrderId = orderId.toString().substring(0, 6);

        const address = order.address;
        const adrs = address.address;
        const zip = address.pincode;
        const city = address.city;
        const state = address.state;
        const country = address.country;

        const invoiceData = {
            "images": {
                "background": "https://public.easyinvoice.cloud/pdf/sample-background.pdf"
            },
            "sender": {
                "company": "BakeO'Live",
                "address": "Sample Street 123",
                "zip": "1234 AB",
                "city": "Sampletown",
                "country": "Samplecountry"
            },
            "client": {
                "company": user.name, // Assuming 'name' is a field in your User model
                "address": adrs,
                "zip": zip,
                "city": city,
                "country": country
            },
            "information": {
                "number": `INV-${shortenedOrderId}`,
                "date": order.createdAt,
            },
            "products": order.products.map(product => ({
                "quantity": product.quantity,
                "description": product.product.name, // Assuming 'name' is a field in your Product model
                "tax-rate": 0,
                "price": product.price,
            })),
            "bottom-notice": "Thank you for your purchase",
            "settings": {
                "currency": "INR",
                "tax-notation": "GST"
            },
        };

        const result = await easyinvoice.createInvoice(invoiceData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
        res.send(Buffer.from(result.pdf, 'base64'));

        console.log(`Invoice created for order ${orderId}.`);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { createInvoice };
