const mongoose = require('mongoose');

const Product = require('../model/productModel');
const Cart = require('../model/cartModel');
const Coupon = require('../model/couponModel');
const User = require('../model/userModel');

const calculateTotalPrice = (products) => {
  return products.reduce((total, product) => {
    const productPrice = product.product ? product.product.price : 0;
    return total + product.quantity * productPrice;
  }, 0);
};

const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  const discountFactor = 1 - discountPercentage / 100;
  return originalPrice * discountFactor;
};

const applyCouponToCart = async (userId, couponCode, cartData) => {
  try {
    const userCart = await Cart.findOne({ userId }).populate('products.product');

    if (!userCart) {
      return { success: false, message: 'Cart not found for the user' };
    }

    const appliedCoupon = await Coupon.findOne({ code: couponCode });

    if (!appliedCoupon) {
      return { success: false, message: 'Coupon not found' };
    }

    for (const cartProduct of userCart.products) {
      const product = cartProduct.product;
      const discountedPrice = calculateDiscountedPrice(product.price, appliedCoupon.discount);
      cartProduct.price = discountedPrice; // Update the price in the cart directly
    }

    // Recalculate the total price based on updated product prices
    userCart.totalPrice = calculateTotalPrice(userCart.products);

    await userCart.save();

    // Return the updated cart and total price
    return { success: true, updatedCart: userCart, updatedTotalPrice: userCart.totalPrice };
  } catch (error) {
    console.error('Error applying coupon to the cart:', error);
    return { success: false, message: 'Failed to apply coupon to the cart' };
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!req.session.user_id) {
      return res.redirect('/login');
    }

    let cart = await Cart.findOne({ userId: req.session.user_id });

    if (!cart) {
      cart = new Cart({ userId: req.session.user_id, products: [] });
    }

    const existingProduct = cart.products.find(p => p.product.equals(product._id));

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      const productPrice = product.price; // Fetch product price from the database
      cart.products.push({
        product: product._id,
        quantity: 1,
      });
    }

    // Update the total price after adjusting the quantity
    cart.totalPrice = calculateTotalPrice(cart.products);

    const totalPrice = cart.totalPrice;
    console.log('Total Price:', totalPrice);

    await cart.save();

    res.redirect('/cart');
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



const loadCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const cartData = await Cart.findOne({ userId }).populate('products.product');
    const coupon = await Coupon.findOne();

    let totalCartPrice;

    // Check if cartData is not null or undefined before accessing its properties
    if (cartData && cartData.products) {
      // Calculate the total price with or without a coupon
      if (req.session.appliedCouponCode) {
        const result = await applyCouponToCart(userId, req.session.appliedCouponCode, cartData);
        if (result.success) {
          totalCartPrice = result.updatedTotalPrice;
        } else {
          console.error('Failed to apply coupon:', result.message);
          totalCartPrice = calculateTotalPrice(cartData.products);
        }
      } else {
        totalCartPrice = calculateTotalPrice(cartData.products);
      }
    } else {
      // Handle the case where cartData is null or undefined
      console.error('Cart data not found for user:', userId);
      totalCartPrice = 0; // Set a default value or handle it as appropriate for your use case
    }

    res.render('cart', {
      cartData,
      coupon,
      userId,
      appliedCouponCode: req.session.appliedCouponCode || null,
      totalCartPrice,
    });
  } catch (error) {
    console.error('Error loading cart:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const removeProductFromCart = async (userId, productId) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { products: { product: productId } } },
      { new: true }
    );

    if (cart) {
      cart.totalPrice = calculateTotalPrice(cart.products);
      await cart.save();

      return { success: true };
    } else {
      return { success: false, message: 'Cart not found' };
    }
  } catch (error) {
    console.error('Error removing product from cart:', error.message);
    return { success: false, message: 'Internal Server Error' };
  }
};

const deleteItem = async (req, res) => {
  try {
    const productId = req.params.productId;

    const result = await removeProductFromCart(req.session.user_id, productId);
    if (result.success) {
      res.json({ success: true, message: 'Item deleted successfully' });
    } else {
      res.json({ success: false, message: 'Failed to delete item' });
    }
  } catch (error) {
    console.error('Error deleting item:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const updateQuantity = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.body.productId;
    const newQuantity = req.body.newQuantity;

    const result = await updateProductQuantity(userId, productId, newQuantity);

    console.log('Update Quantity route called');
    console.log(req.body);

    if (result.success) {
      res.json({ success: true, updatedTotal: result.updatedTotal });
    } else {
      res.json({ success: false, message: 'Failed to update quantity' });
    }
  } catch (error) {
    console.error('Error updating quantity:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const updateProductQuantity = async (userId, productId, newQuantity) => {
  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return { success: false, message: 'Cart not found' };
    }

    const updatedCart = await Cart.findOneAndUpdate(
      {
        userId,
        'products.product': new mongoose.Types.ObjectId(productId),
      },
      {
        $set: { 'products.$.quantity': newQuantity },
      },
      {
        new: true,
      }
    );

    if (updatedCart) {
      const updatedTotal = updatedCart.totalPrice;
      return { success: true, updatedTotal };
    } else {
      return { success: false, message: 'Product not found in the cart' };
    }
  } catch (error) {
    console.error('Error updating product quantity:', error.message);
    return { success: false, message: 'Internal Server Error' };
  }
};


module.exports = {
  addToCart,
  loadCart,
  updateQuantity,
  deleteItem,
};



// const Product = require('../model/productModel');
// const Cart = require('../model/cartModel');
// const Coupon = require('../model/couponModel');
// const User = require('../model/userModel');

// const calculateTotalPrice = (products) => {
//   return products.reduce((total, product) => total + product.quantity * product.price, 0);
// };

// const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
//   const discountFactor = 1 - discountPercentage / 100;
//   return originalPrice * discountFactor;
// };

// const applyCouponToCart = async (userId, couponCode, cartData) => {
//   try {
//     const userCart = await Cart.findOne({ userId }).populate('products.product');

//     if (!userCart) {
//       return { success: false, message: 'Cart not found for the user' };
//     }

//     const appliedCoupon = await Coupon.findOne({ code: couponCode });

//     if (!appliedCoupon) {
//       return { success: false, message: 'Coupon not found' };
//     }

//     userCart.products.forEach((cartProduct) => {
//       const discountedPrice = calculateDiscountedPrice(cartProduct.product.price, appliedCoupon.discount);
//       cartProduct.price = discountedPrice; // Update the price in the cart directly
//     });

//     userCart.totalPrice = calculateTotalPrice(userCart.products);

//     await userCart.save();

//     // Calculate the updated total price
//     const updatedTotalPrice = calculateTotalPrice(userCart.products);

//     // Return the updated cart and total price
//     return { success: true, updatedCart: userCart, updatedTotalPrice };
//   } catch (error) {
//     console.error('Error applying coupon to the cart:', error);
//     return { success: false, message: 'Failed to apply coupon to the cart' };
//   }
// };

// const addToCart = async (req, res) => {
//   try {
//     const productId = req.params.productId;
//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     if (!req.session.user_id) {
//       return res.redirect('/login');
//     }

//     let cart = await Cart.findOne({ userId: req.session.user_id });

//     if (!cart) {
//       cart = new Cart({ userId: req.session.user_id, products: [] });
//     }

//     const existingProduct = cart.products.find(p => p.product.equals(product._id));

//     if (existingProduct) {
//       existingProduct.quantity += 1;
//     } else {
//       cart.products.push({
//         product: product._id,
//         price: product.price,
//         quantity: 1,
//       });
//     }

//     cart.totalPrice = calculateTotalPrice(cart.products);

//     await cart.save();

//     res.redirect('/cart');
//   } catch (error) {
//     console.error('Error adding to cart:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// const loadCart = async (req, res) => {
//   try {
//     const userId = req.session.user_id;
//     const cartData = await Cart.findOne({ userId }).populate('products.product');
//     const coupon = await Coupon.findOne();

//     // Add the applied coupon information to the response
//     const appliedCouponCode = req.session.appliedCouponCode || null;

//     if (appliedCouponCode) {
//       const result = await applyCouponToCart(userId, appliedCouponCode, cartData);
//       if (result.success) {
//         res.render('cart', {
//           cartData: result.updatedCart,
//           coupon,
//           userId,
//           appliedCouponCode,
//           updatedTotalPrice: result.updatedTotalPrice,
//         });
//       } else {
//         res.json({ success: false, message: 'Failed to apply coupon', cartData });
//       }
//     } else {
//       res.render('cart', { cartData, coupon, userId, appliedCouponCode: null });
//     }
//   } catch (error) {
//     console.error('Error loading cart:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// const removeProductFromCart = async (userId, productId) => {
//   try {
//     const cart = await Cart.findOneAndUpdate(
//       { userId },
//       { $pull: { products: { product: productId } } },
//       { new: true }
//     );

//     if (cart) {
//       cart.totalPrice = calculateTotalPrice(cart.products);
//       await cart.save();

//       return { success: true };
//     } else {
//       return { success: false, message: 'Cart not found' };
//     }
//   } catch (error) {
//     console.error('Error removing product from cart:', error.message);
//     return { success: false, message: 'Internal Server Error' };
//   }
// };

// const deleteItem = async (req, res) => {
//   try {
//     const productId = req.params.productId;

//     const result = await removeProductFromCart(req.session.user_id, productId);
//     if (result.success) {
//       res.json({ success: true, message: 'Item deleted successfully' });
//     } else {
//       res.json({ success: false, message: 'Failed to delete item' });
//     }
//   } catch (error) {
//     console.error('Error deleting item:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };


// const updateQuantity = async (req, res) => {
//   try {
//     const userId = req.session.user_id;
//     const productId = req.body.productId;
//     const newQuantity = req.body.newQuantity;

//     const result = await updateProductQuantity(userId, productId, newQuantity);

//     console.log('Update Quantity route called');
//     console.log(req.body);

//     if (result.success) {
//       res.json({ success: true, updatedCart: result.updatedCart });
//     } else {
//       res.json({ success: false, message: 'Failed to update quantity' });
//     }
//   } catch (error) {
//     console.error('Error updating quantity:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

// const updateProductQuantity = async (userId, productId, newQuantity) => {
//   try {
//     const cart = await Cart.findOneAndUpdate(
//       { userId, 'products.product': productId },
//       { $set: { 'products.$.quantity': newQuantity } },
//       { new: true }
//     );

//     if (cart) {
//       cart.totalPrice = calculateTotalPrice(cart.products);
//       await cart.save();
//       const unitPrice = cart.products.find(item => item.product == productId).price;
//       return { success: true, updatedCart: cart, unitPrice };
//     } else {
//       return { success: false, message: 'Product not found in the cart' };
//     }
//   } catch (error) {
//     console.error('Error updating product quantity:', error.message);
//     return { success: false, message: 'Internal Server Error' };
//   }
// };


// module.exports = {
//   addToCart,
//   loadCart,
//   updateQuantity,
//   deleteItem,
// };
