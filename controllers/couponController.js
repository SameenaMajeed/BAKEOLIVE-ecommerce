
const Coupon = require('../model/couponModel');
const User = require('../model/userModel');
const Cart = require('../model/cartModel');

// const calculateTotalPrice = (products) => {
//   return products.reduce((total, product) => total + product.quantity * product.price, 0);
// };


// const verifyCoupon = async (req, res) => {
//   try {
//     const id = req.session.user_id;
//     const { coupon, total } = req.body;
//     console.log('Received request to verify coupon:', req.body);

//     console.log('Coupon to find:', coupon);
//     const validCoupon = await Coupon.findOne({ code: coupon });
//     console.log('Found Coupon:', validCoupon);

//     if (!validCoupon) {
//       return res.status(400).json({ message: 'Invalid Coupon' });
//     }

//     if (validCoupon.purchase_amt > parseFloat(total)) {
//       return res.status(400).json({ message: `Minimum purchase amount is ${validCoupon.purchase_amt}` });
//     }

//     if (validCoupon.usedBy.includes(id)) {
//       return res.status(400).json({ message: 'Coupon already used' });
//     }

//     const currentDate = new Date();
//     const expiryDate = new Date(validCoupon.expiry);

//     if (currentDate > expiryDate) {
//       return res.status(400).json({ message: 'Coupon has expired' });
//     }

//     const user = await User.findOne({ _id: id });
//     const cart = await Cart.findOne({ userId: user._id }).populate('products.product');
//     const totalPrice = calculateTotalPrice(cart.products);

//     if (isNaN(totalPrice)) {
//       return res.status(500).json({ error: 'Invalid total price in the cart' });
//     }

//     const discountAmount = (totalPrice * validCoupon.discount) / 100;
//     const totalAfterDiscount = (totalPrice - discountAmount).toFixed(2);
//     console.log('totalAfterDiscount',totalAfterDiscount)

//     await Cart.findOneAndUpdate({ userId: user._id }, { $set: { totalPrice: totalAfterDiscount } }, { new: true });

//     validCoupon.usedBy.push(id);
//     await validCoupon.save();

//     console.log('Coupon verified successfully');

//     return res.status(200).json({ message: 'Coupon verified' });
//   } catch (err) {
//     console.error('Error in verifyCoupon:', err.message);
//     return res.status(500).json({ error: 'Internal Server Error' });
//   }
// };



const calculateTotalPrice = (products) => {
  return products.reduce((total, product) => total + product.quantity * product.price, 0);
};
const verifyCoupon = async (req, res) => {
  try {
    const id = req.session.user_id;
    const { coupon, total } = req.body;
    console.log('Received request to verify coupon:', req.body);

    console.log('Coupon to find:', coupon);
    const validCoupon = await Coupon.findOne({ code: coupon });
    console.log('Found Coupon:', validCoupon);

    if (!validCoupon) {
      return res.status(400).json({ message: 'Invalid Coupon' });
    }

    if (validCoupon.minimumPurchase > parseFloat(total)) {
      return res.status(400).json({ message: `Minimum purchase amount is ${validCoupon.minimumPurchase}` });
    }

    if (validCoupon.usedBy.includes(id)) {
      return res.status(400).json({ message: 'Coupon already used' });
    }

    const currentDate = new Date();
    const expiryDate = new Date(validCoupon.expiry);

    if (currentDate > expiryDate) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    const user = await User.findOne({ _id: id });
    const cart = await Cart.findOne({ userId: user._id }).populate('products.product');
    const totalPrice = calculateTotalPrice(cart.products);

    if (isNaN(totalPrice)) {
      return res.status(500).json({ error: 'Invalid total price in the cart' });
    }

    let discountAmount = 0;

    if (validCoupon.discountType === 'flat') {
      // Apply flat discount
      discountAmount = validCoupon.discount;
    } else if (validCoupon.discountType === 'percentage') {
      // Apply percentage discount
      discountAmount = (totalPrice * validCoupon.discount) / 100;
    }

    const totalAfterDiscount = (totalPrice - discountAmount).toFixed(2);
    console.log('totalAfterDiscount', totalAfterDiscount);

    await Cart.findOneAndUpdate({ userId: user._id }, { $set: { totalPrice: totalAfterDiscount } }, { new: true });

    validCoupon.usedBy.push(id);
    await validCoupon.save();

    console.log('Coupon verified successfully');

    // Include discount amount and new total amount in the response
    return res.status(200).json({ message: 'Coupon verified', discountAmount, totalAfterDiscount });
  } catch (err) {
    console.error('Error in verifyCoupon:', err.message);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};


// const verifyCoupon = async (req, res) => {
//   try {
//     const id = req.session.user_id;
//     const { coupon, total } = req.body;
//     console.log('Received request to verify coupon:', req.body);

//     console.log('Coupon to find:', coupon);
//     const validCoupon = await Coupon.findOne({ code: coupon });
//     console.log('Found Coupon:', validCoupon);

//     if (!validCoupon) {
//       return res.status(400).json({ message: 'Invalid Coupon' });
//     }

//     if (validCoupon.minimumPurchase > parseFloat(total)) {
//       return res.status(400).json({ message: `Minimum purchase amount is ${validCoupon.minimumPurchase}` });
//     }

//     if (validCoupon.usedBy.includes(id)) {
//       return res.status(400).json({ message: 'Coupon already used' });
//     }

//     const currentDate = new Date();
//     const expiryDate = new Date(validCoupon.expiry);

//     if (currentDate > expiryDate) {
//       return res.status(400).json({ message: 'Coupon has expired' });
//     }

//     const user = await User.findOne({ _id: id });
//     const cart = await Cart.findOne({ userId: user._id }).populate('products.product');
//     const totalPrice = calculateTotalPrice(cart.products);

//     if (isNaN(totalPrice)) {
//       return res.status(500).json({ error: 'Invalid total price in the cart' });
//     }

//     let discountAmount = 0;

//     if (validCoupon.discountType === 'flat') {
//       // Apply flat discount
//       discountAmount = validCoupon.discount;
//     } else if (validCoupon.discountType === 'percentage') {
//       // Apply percentage discount
//       discountAmount = (totalPrice * validCoupon.discount) / 100;
//     }

//     const totalAfterDiscount = (totalPrice - discountAmount).toFixed(2);
//     console.log('totalAfterDiscount', totalAfterDiscount);

//     await Cart.findOneAndUpdate({ userId: user._id }, { $set: { totalPrice: totalAfterDiscount } }, { new: true });

//     validCoupon.usedBy.push(id);
//     await validCoupon.save();

//     console.log('Coupon verified successfully');

//     return res.status(200).json({ message: 'Coupon verified' });
//   } catch (err) {
//     console.error('Error in verifyCoupon:', err.message);
//     return res.status(500).json({ error: 'Internal Server Error', details: err.message });
//   }
// };





// ..............................admin.................................................


const couponLoad = async (req, res) => {
  try {
    const coupon = await Coupon.find().lean();

    const coupons = coupon.map(coupon => {
      if (coupon.expiry) {
        const expiryDate = new Date(coupon.expiry);
        const formattedExpiry = expiryDate.toLocaleString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          timeZone: 'UTC'
        });
        return {
          ...coupon,
          expiry: formattedExpiry,
        };
      }
      return coupon;
    });

    res.render('view_coupons', { coupons });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};



const addCouponLoad = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.render('coupon', { coupons });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const createCoupon = async (req, res) => {
  try {
    const { code, discount, expiry, minimumPurchase, discountType } = req.body;

    if (!expiry) {
      return res.render('coupon', { message: 'Expiry date is required.' });
    }
    const expiryWithOffset = expiry + "+00:00";
    const expiryDate = new Date(expiryWithOffset);
    // const expiryDate = new Date(expiry);

    const existingCoupon = await Coupon.findOne({ code });

    if (existingCoupon) {
      return res.render('coupon', { message: 'Coupon code already exists. Please choose a different one.' });
    }

    if (minimumPurchase < 0 || discount < 0) {
      return res.render('coupon', { message: 'Minimum purchase and discount values cannot be negative.' });
    }

    const newCoupon = new Coupon({ code, discount, expiry: expiryDate, minimumPurchase, discountType });
    await newCoupon.save();
    res.redirect('/admin/coupons');
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const loadEditCoupon = async (req, res) => {
  try {
    const id = req.query.id;
    console.log('Coupon ID:', id);

    const coupon = await Coupon.findOne({ _id: id }).lean();
    const formattedExpiry = coupon.expiry ? coupon.expiry.toISOString().slice(0, 16) : null;

    res.render('edit_coupon', { coupon: { ...coupon, formattedExpiry } });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};


const editCoupons = async (req, res) => {
  try {
    const { code, discount, expiry, minimumPurchase, discountType } = req.body;
    console.log('Edit Coupon Request Body:', req.body);

    const expiryWithOffset = expiry + "+00:00";
    const expiryDate = new Date(expiryWithOffset);

    console.log('Parsed Expiry Date:', expiryDate);

    if (minimumPurchase < 0 || discount < 0) {
      return res.render('edit_coupon', { coupon: { _id: id, code, discount, expiry, minimumPurchase, discountType }, message: 'Minimum purchase and discount values cannot be negative.' });
    }
    const id = req.body.id
console.log('id',id)
    const updatedCoupon = await Coupon.findOneAndUpdate(
      { _id: id },
      { code, discount, expiry: expiryDate.toISOString(), minimumPurchase, discountType },
      { new: true }
    );
    console.log('Updated Coupon:', updatedCoupon);

    if (updatedCoupon) {
      res.redirect('/admin/coupons');
    } else {
      console.log('Update failed or coupon not found.');
      res.render('edit_coupon', { coupon: { _id: id, code, discount, expiry, minimumPurchase, discountType }, message: 'Coupon not found or update failed.' });
    }
  } catch (err) {
    console.error('Error in editCoupons:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const deleteCoupons = async (req, res) => {
  try {
    const id = req.query.id;
    const coupon = await Coupon.deleteOne({ _id: id });
    res.redirect('/admin/coupons');
  }
  catch (err) {
    console.log(err.message);
  }
}

module.exports = {

  verifyCoupon,

  couponLoad,
  createCoupon,
  addCouponLoad,
  loadEditCoupon,
  editCoupons,
  deleteCoupons
};