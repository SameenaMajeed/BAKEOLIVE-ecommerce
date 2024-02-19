const mongoose = require('mongoose');
const Offers = require('../model/categOfferModel');
const Product = require('../model/productModel');
const Category = require('../model/category');

const offerLoad = async (req, res) => {
    try {
        const offers = await Offers.find().lean();
        offers.forEach(offer => {
            const expiryDate = new Date(offer.expireAt);
            const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true,
                timeZone: 'UTC'
            });
            offer.expiry = formattedExpiry;
        });
        res.render('viewOffers', { offers });
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Internal Server Error');
    }
};

const fetchCategoriesFromDatabase = async () => {

    const category = await Category.find();
    return category;

};

const addOffersLoad = async (req, res) => {
    try {
        const categories = await fetchCategoriesFromDatabase();

        res.render('addOffers', { category: categories });
    }
    catch (err) {
        console.log(err.message);
    }
}

const addOffers = async (req, res) => {
    try {
        const { category, discount, expiry } = req.body;

        const expiryWithOffset = expiry + "+00:00";
        // console.log(expiryWithOffset)
        const expiryDate = new Date(expiryWithOffset);
        console.log(category)
        console.log(discount)
        console.log(expiry)
        console.log(expiryDate)

        //console.log(expiryDate.toISOString())
        const offer = new Offers({
            category: category,
            discount: discount,
            expireAt: expiryDate,
            is_offer: true
        });
        const savedOffers = await offer.save();
        if (savedOffers) {
            const products = await Product.find().populate('category_id');
            console.log('products', products)
            const offer = await Offers.findOne({ is_offer: true });
            console.log('offer', offer)
            const proResult = products.filter(pro => pro.category_id.categoryName.toLowerCase() === offer.category.toLowerCase())
            console.log(proResult)

            const discount = offer.discount;

            const updatedProducts = await Promise.all(
                proResult.map(async (product) => {
                    const earlierPrice = product.price
                    const discountedPrice = product.price * (1 - discount / 100);

                    // Update the product with the discounted price
                    await Product.findByIdAndUpdate(product._id, { $set: { price: discountedPrice, is_offer: true ,earlierPrice} });

                    return { ...product, discountedPrice };
                })
            );

            console.log('updatedProducts:', updatedProducts)
            if (updatedProducts) {
                await Offers.findOneAndUpdate({ is_offer: true }, { $set: { is_offer: false } });
            }

            console.log(`${updatedProducts.length} products updated with individual discounts.`);


            res.redirect('/admin/offers');
        }

    }
    catch (err) {
        console.log(err.message);
    }
}






module.exports = {
    offerLoad,
    addOffersLoad,
    addOffers
};

// const ProductOffer = require('../model/productOfferModel');
// const CategoryOffer = require('../model/categOfferModel');
// const ReferralOffer = require('../model/refferalOfferModel');

// // Product Offer functions

// const createProductOffer = async (req, res) => {
//     try {
//         const { product, discount, expireAt, is_offer } = req.body;
//         const productOffer = new ProductOffer({ product, discount, expireAt, is_offer });
//         await productOffer.save();
//         res.json({ message: 'Product offer created successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// const updateProductOffer = async (req, res) => {
//     try {
//         const { discount, expireAt, is_offer } = req.body;
//         await ProductOffer.findByIdAndUpdate(req.params.offerId, { discount, expireAt, is_offer });
//         res.json({ message: 'Product offer updated successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// const deleteProductOffer = async (req, res) => {
//     try {
//         await ProductOffer.findByIdAndDelete(req.params.offerId);
//         res.json({ message: 'Product offer deleted successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// // Category Offer functions

// const createCategoryOffer = async (req, res) => {
//     try {
//         const { category, discount, expireAt, is_offer } = req.body;
//         const categoryOffer = new CategoryOffer({ category, discount, expireAt, is_offer });
//         await categoryOffer.save();
//         res.json({ message: 'Category offer created successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// const updateCategoryOffer = async (req, res) => {
//     try {
//         const { discount, expireAt, is_offer } = req.body;
//         await CategoryOffer.findByIdAndUpdate(req.params.offerId, { discount, expireAt, is_offer });
//         res.json({ message: 'Category offer updated successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// const deleteCategoryOffer = async (req, res) => {
//     try {
//         await CategoryOffer.findByIdAndDelete(req.params.offerId);
//         res.json({ message: 'Category offer deleted successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// // Referral Offer functions

// const createReferralOffer = async (req, res) => {
//     try {
//         const { referralCode, discount, expireAt, is_offer } = req.body;
//         const referralOffer = new ReferralOffer({ referralCode, discount, expireAt, is_offer });
//         await referralOffer.save();
//         res.json({ message: 'Referral offer created successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// const updateReferralOffer = async (req, res) => {
//     try {
//         const { discount, expireAt, is_offer } = req.body;
//         await ReferralOffer.findByIdAndUpdate(req.params.offerId, { discount, expireAt, is_offer });
//         res.json({ message: 'Referral offer updated successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// const deleteReferralOffer = async (req, res) => {
//     try {
//         await ReferralOffer.findByIdAndDelete(req.params.offerId);
//         res.json({ message: 'Referral offer deleted successfully' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };


// module.exports = {
//     createProductOffer,
//     updateProductOffer,
//     deleteProductOffer,
//     createCategoryOffer,
//     updateCategoryOffer,
//     deleteCategoryOffer,
//     createReferralOffer,
//     updateReferralOffer,
//     deleteReferralOffer
// };