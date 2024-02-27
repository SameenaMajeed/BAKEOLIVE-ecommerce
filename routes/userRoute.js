const express = require('express') 
const user_route = express()

const session =require('express-session')

const config = require('../config/config')

const cookieParser = require('cookie-parser');
user_route.use(cookieParser());

const path = require('path')

user_route.use(session({
    secret:config.sessionSecret,
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:600000}
}))

const multer = require('multer');
const upload = multer();

const auth = require('../middleware/auth')

user_route.use('/public',express.static('public'))

user_route.set('view engine','ejs')
user_route.set('views','./views/users')

const bodyParser = require('body-parser')
user_route.use(bodyParser.json())
user_route.use(bodyParser.urlencoded({extended:true}))

const userController = require('../controllers/userController') 

user_route.get('/signup',auth.isLogout,userController.loadRegister)

user_route.post('/signup',userController.insertUser)


user_route.get('/verifyMail/:id',userController.verifyMail)
user_route.post('/verifyMail',userController.verifyOtp)

user_route.get('/resendOtp/:id',userController.resendOtp)


user_route.get('/',auth.isLogout,userController.loginLoad)
user_route.get('/login',auth.isLogout,userController.loginLoad)

user_route.post('/login',userController.verifyLogin)

user_route.get('/home',auth.isLogin,userController.loadHome)

user_route.get('/logout',auth.isLogin,userController.userLogout)

user_route.get('/forget',auth.isLogout,userController.forgetLoad)

user_route.post('/forget',userController.forgetVerify)


user_route.get('/changePassword',userController.changePasswordLoad)

user_route.post('/changePassword',userController.resetPassword)

// .......................product......................................

const productController = require('../controllers/productController')

user_route.get('/allProduct',auth.isLogin,productController.loadAllProduct)

user_route.get('/filteredProducts', auth.isLogin, productController.loadFilteredProducts);

// user_route.get('/allChocolateCake', auth.isLogin,productController.loadChocolateCake)

user_route.get('/viewProductDetails',auth.isLogin,productController.loadProductDetails)


// ......................profile......................................

user_route.get('/profile',userController.profileLoad)

user_route.get('/edit-user',auth.isLogin,userController.editUserLoad)

user_route.post('/updateUserDetails',userController.updateUser)

user_route.post('/change-password' , userController.changePassword)

// user_route.post('/verifyOtpBeforePasswordChange',userController.verifyOtpPassword)

user_route.post('/addaddress', userController.addAddressProfile)

user_route.get('/editAddress', userController.editAddressLoad)

user_route.post('/updateAddress', userController.updateAddress)

user_route.get('/deleteAddress', userController.deleteAddress);

// ........................cart.....................................

const cartController = require('../controllers/cartContoller')

user_route.get('/add-to-cart/:productId', cartController.addToCart)

user_route.get('/cart', auth.isLogin, cartController.loadCart)

user_route.post('/updateQuantity', cartController.updateQuantity)

user_route.post('/deleteItem/:productId', cartController.deleteItem)

// .........................Proceed to checkout........................

const checkoutController = require('../controllers/checkoutController');

user_route.get('/checkout', auth.isLogin, checkoutController.loadCheckout);

user_route.post('/place-order', auth.isLogin, checkoutController.placeOrder)

user_route.get('/order-placed',auth.isLogin,checkoutController.orderPlaceLoad);

user_route.post('/verifyRazorPay',auth.isLogin,upload.none(),checkoutController.razorpayVerify)

// .........................order..............................................


const orderController = require('../controllers/orderController')

user_route.post('/cancel-order/:orderId', auth.isLogin, orderController.cancelOrder);

// user_route.post('/cancel-product/:orderId/:productId', orderController.CancelProduct)

// user_route.get('/order-placed-time/:orderId',orderController.cancelTime)

// .....................Wishlist.................................................

const wishlistController = require('../controllers/wishlistController')

user_route.get('/add-to-wishlist/:productId', auth.isLogin, wishlistController.addToWishlist)

user_route.get('/wishlist', auth.isLogin, wishlistController.viewWishlist)

user_route.get('/remove-from-wishlist/:productId', auth.isLogin, wishlistController.removeFromWishlist)

// ......................coupons.......................................................

const couponController = require('../controllers/couponController');

// user_route.post('/apply-coupon', auth.isLogin, couponController.applyCoupon);

user_route.post('/verifyCoupon',auth.isLogin,couponController.verifyCoupon);

// ..................wallet..........................................................


const walletController = require('../controllers/walletHistoryController')

user_route.get('/wallet', auth.isLogin , walletController.loadWallet);

// user_route.get('/wallet/:userId', auth.isLogin, walletController.getWalletBalance);

// user_route.get('/wallet/history/:userId', auth.isLogin, walletController.getWalletHistory);

// ..................invoice................................................................

const invoiceController = require('../controllers/invoiceController')

user_route.get('/invoice',auth.isLogin,invoiceController.createInvoice);



module.exports = user_route

