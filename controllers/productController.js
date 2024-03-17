const User = require('../model/userModel')

const Product = require('../model/productModel')

const Category = require('../model/category')

const OrderModel = require('../model/orderModel')

const Offer = require('../model/categOfferModel');


const loadAllProduct = async (req, res) => {
    try {
        const userId = req.session.user_id;
        const { search, category } = req.query;
        let query = { is_disabled: false };

        const categories = await Category.find();

        if (search) {
            query = {
                ...query,
                $or: [
                    { name: { $regex: new RegExp(search, 'i') } },
                    { description: { $regex: new RegExp(search, 'i') } },
                ],
            };
        }

        if (category) {
            query = {
                ...query,
                category: { $regex: category, $options: 'i' },
            };
        }

        const currentDate1 = new Date();
        const curDate = currentDate1 + "+00:00";
        const currentDate = new Date(curDate);
        console.log(currentDate);
        const expiredOffers = await Offer.find({ expireAt: { $lt: currentDate } });
        console.log('expiredoff-', expiredOffers);
        if (expiredOffers.length > 0) {
            // Iterate over expired offers
            console.log('helo');
            for (const expiredOffer of expiredOffers) {
                console.log('heu')
                const { category: expiredCategory } = expiredOffer;
                console.log('expiredcat-', expiredCategory);
                // Find associated products by category
                const cat = await Category.find({ categoryName: expiredCategory });
                const catIds = cat.map(category => category._id)
                const associatedProducts = await Product.find({ category_id: { $in: catIds }, is_offer: true });
                console.log('associate-', associatedProducts);
                // Update each associated product
                for (const product of associatedProducts) {
                    // Retrieve earlier price from the product
                    const earlierPrice = product.earlierPrice;
                    console.log('earlier-', earlierPrice);
                    // Update the product
                    await Product.findByIdAndUpdate(
                        product._id,
                        {
                            $set: {
                                price: earlierPrice,
                                is_offer: false
                            }
                        }
                    );
                }

                // Delete the expired offer
                await Offer.findByIdAndDelete(expiredOffer._id);
            }

            console.log('Expired offers deleted and products updated.');
        } else {
            console.log('No expired offers.');
        }


        // Fetch products based on the updated query
        const productData = await Product.find(query);
        res.render('allProduct', { product: productData, category: categories, userId });

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


const loadFilteredProducts = async (req, res) => {
    try {
        const userId = req.session.user_id
        const { category } = req.query;
        console.log('Category ID:', category);

        const selectedCategoryId = req.query.category || ''

        const categories = await Category.find();

        let query = { is_disabled: false };

        if (category) {
            query = {
                ...query,
                category_id: category // Corrected field name to category_id
            };
        }

        console.log(category)

        const filteredProductData = await Product.find(query).populate('category_id');

        const currentDate1 = new Date();
        const curDate = currentDate1 + "+00:00";
        const currentDate = new Date(curDate);
        console.log(currentDate);
        const expiredOffers = await Offer.find({ expireAt: { $lt: currentDate } });
        console.log('expiredoff-', expiredOffers);
        if (expiredOffers.length > 0) {
            // Iterate over expired offers
            console.log('helo');
            for (const expiredOffer of expiredOffers) {
                console.log('heu')
                const { category: expiredCategory } = expiredOffer;
                console.log('expiredcat-', expiredCategory);
                // Find associated products by category
                const cat = await Category.find({ categoryName: expiredCategory });
                const catIds = cat.map(category => category._id)
                const associatedProducts = await Product.find({ category_id: { $in: catIds }, is_offer: true });
                console.log('associate-', associatedProducts);
                // Update each associated product
                for (const product of associatedProducts) {
                    // Retrieve earlier price from the product
                    const earlierPrice = product.earlierPrice;
                    console.log('earlier-', earlierPrice);
                    // Update the product
                    await Product.findByIdAndUpdate(
                        product._id,
                        {
                            $set: {
                                price: earlierPrice,
                                is_offer: false
                            }
                        }
                    );
                }

                // Delete the expired offer
                await Offer.findByIdAndDelete(expiredOffer._id);
            }

            console.log('Expired offers deleted and products updated.');
        } else {
            console.log('No expired offers.');
        }


        res.render('filteredProducts', { product: filteredProductData, category: categories, userId, selectedCategoryId });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}

const loadChocolateCake = async (req, res) => {

    try {
        const userId = req.session.user_id;
        let query = { is_disabled: false };

        const categories = await Category.find({ categoryName: 'Chocolate Cake' }).lean();
        console.log

        const currentDate1 = new Date();
        const curDate = currentDate1 + "+00:00";
        const currentDate = new Date(curDate);
        console.log(currentDate);
        const expiredOffers = await Offer.find({ expireAt: { $lt: currentDate } });
        console.log('expiredoff-', expiredOffers);
        if (expiredOffers.length > 0) {
            // Iterate over expired offers
            console.log('helo');
            for (const expiredOffer of expiredOffers) {
                console.log('heu')
                const { category: expiredCategory } = expiredOffer;
                console.log('expiredcat-', expiredCategory);
                // Find associated products by category
                const cat = await Category.find({ categoryName: expiredCategory });
                const catIds = cat.map(category => category._id)
                const associatedProducts = await Product.find({ category_id: { $in: catIds }, is_offer: true });
                console.log('associate-', associatedProducts);
                // Update each associated product
                for (const product of associatedProducts) {
                    // Retrieve earlier price from the product
                    const earlierPrice = product.earlierPrice;
                    console.log('earlier-', earlierPrice);
                    // Update the product
                    await Product.findByIdAndUpdate(
                        product._id,
                        {
                            $set: {
                                price: earlierPrice,
                                is_offer: false
                            }
                        }
                    );
                }

                // Delete the expired offer
                await Offer.findByIdAndDelete(expiredOffer._id);
            }

            console.log('Expired offers deleted and products updated.');
        } else {
            console.log('No expired offers.');
        }


        // Fetch products based on the updated query
        const productData = await Product.find({ $and: [{ query }, { categories }] });
        res.render('chocolatecake', { product: productData, category: categories, userId });



    } catch (error) {
        console.log(error.message);
    }
}

const loadProductDetails = async (req, res) => {
    try {
        const userId = req.session.user_id
        const id = req.query.id

        if (!id) {
            res.redirect('/home')
            return;
        }

        const product = await Product.findById(id).populate('category_id')

        console.log('Product:', product)

        if (product) {
            res.render('productDetails', { product, userId });
        } else {
            res.redirect('/home')
        }
    } catch (error) {
        console.log(error.message)
        res.redirect('/home')
    }
}



// .........................admmin.................................


const loadProductList = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = 5; // Number of documents per page

        // Calculate the skip value
        const skip = (page - 1) * limit;

        // Query to count total active products
        const totalCount = await Product.countDocuments({ is_disabled: false });

        // Query to fetch active products with pagination
        const activeProducts = await Product.find({ is_disabled: false })
            .populate('category_id')
            .skip(skip)
            .limit(limit);

        // Render the Products view with pagination data
        res.render('Products', {
            product: activeProducts,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        });
    } catch (error) {
        console.log(error.message);
        // Handle error response
        res.status(500).send('Internal Server Error');
    }
};


// const loadProductList = async (req, res) => {

//     try {
//         const activeProducts = await Product.find({ is_disabled: false }).populate('category_id');

//         res.render('Products', { product: activeProducts });

//     } catch (error) {
//         console.log(error.message);
//     }

// }


const loadProduct = async (req, res) => {

    try {

        const categories = await fetchCategoriesFromDatabase();
        res.render('addProduct', { category: categories });

    } catch (error) {
        console.log(error.message);
    }
};

const fetchCategoriesFromDatabase = async () => {

    const category = await Category.find();
    return category;

};

const addProduct = async (req, res) => {
    try {
        const category = await Category.find()

        // Validate if quantity and price are non-negative
        const quantity = parseInt(req.body.quantity);
        const price = parseFloat(req.body.price);

        if (quantity < 0 || price < 0) {
            return res.render('addProduct', { message: 'Quantity and price must be non-negative', category });
        }

        const product = new Product({
            name: req.body.name,
            quantity: quantity,
            price: price,
            description: req.body.description,
            image: req.files ? req.files.map(file => file.filename) : [],
            category_id: req.body.category_id
        });

        const productData = await product.save();

        if (productData) {
            res.redirect('/admin/viewProduct');
        } else {
            res.render('addProduct', { message: 'Something Wrong', category });
        }

    } catch (error) {
        console.log(error.message);
        res.render('addProduct', { message: 'Error adding product', category });
    }
}


const softDeleteProduct = async (req, res) => {
    try {
        const id = req.query.id;

        if (!id) {
            return res.redirect('/admin/viewProduct');
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { $set: { is_disabled: true } },
            { new: true }
        )

        if (product) {
            return res.redirect('/admin/viewProduct');
        } else {
            return res.redirect('/admin/viewProduct');
        }
    } catch (error) {
        console.error(error.message);
        res.redirect('/admin/viewProduct');
    }
}

const editProductLoad = async (req, res) => {

    try {
        const id = req.query.id;

        if (!id) {
            // Handle the case where id is undefined
            res.redirect('/admin/viewProduct');
            return;
        }

        const productList = await Product.findById(id).populate('category_id');

        if (productList) {
            const categories = await fetchCategoriesFromDatabase();
            res.render('editProduct', { product: productList, category: categories });
        } else {
            res.redirect('/admin/viewProduct');
        }
    } catch (error) {
        console.log(error.message);
        res.redirect('/admin/viewProduct');
    }
}

// const updateProduct = async (req, res) => {
//     try {
//         const id = req.body.id;

//         const product = await Product.findById({ _id: id });

//         const images = product.image;
//         console.log('images....', images);

//         const arrImages = req.files.map(file => file.filename);
//         console.log('Received image filenames:', arrImages);

//         // Calculate available dynamically
//         const available = images.length;
//         console.log('available:', available);

//         const replaceCount = Math.min(arrImages.length, available);
//         console.log('replaceCount', replaceCount);

//         const newImages = arrImages.slice(0, replaceCount);

//         product.image = images.slice(replaceCount).concat(newImages);
//         console.log('new product.image:', product.image);

//         await product.save();

//         const updatedProduct = await Product.findByIdAndUpdate(
//             { _id: req.body.id },
//             {
//                 $set: {
//                     name: req.body.name,
//                     status: req.body.status,
//                     price: req.body.price,
//                     description: req.body.description,
//                     image: product.image,
//                     category_id: req.body.category_id !== '' ? req.body.category_id : null,
//                     earlierPrice: req.body.price,
//                 },
//             },
//             { new: true }
//         );

//         if (updatedProduct) {
//             console.log('Updated Product:', updatedProduct);
//             res.redirect('/admin/viewProduct');
//         } else {
//             console.log('Failed to update product.');
//             res.status(500).send('Failed to update product.');
//         }
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Internal Server Error');
//     }
// };

const updateProduct = async(req,res)=>{
    try{
        const id=req.body.id;
        
       
        const product = await Product.findById({_id:id});
       const images = product.image;
   

       const arrImages = req.files.map(file => file.filename);
    
        const available = 3-images.length;
     
        const newImages = arrImages.slice(0,available);

        product.image = images.concat(newImages);
        console.log(product.image)


        const updateProduct = await Product.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,price:req.body.price,description:req.body.description,image:product.image,category_id:req.body.category_id,earlierPrice:req.body.price}});
       if(updateProduct){
        res.redirect('/admin/viewProduct');
       }
        
    }   
    catch(err){
        console.log(err.message)
    }
}

const deleteImage = async(req,res)=>{
    try{
  
        const productId = req.query.pro;
        console.log('productId:',productId)
        const imgIndex = req.query.image;
        console.log('imgIndex:',imgIndex)
        const product = await Product.findById({_id:productId});
        console.log('product :',product )

    if (product) {
      // Remove the image at the specified index
      product.image.splice(imgIndex, 1);
      await product.save();
    }  
    res.redirect(`/admin/editProduct?id=${productId}`);
 
        //console.log(idToRemove,productId)
        /*const product = await Product.updateOne(
            { _id: productId },
            { $pull: { images: idToRemove } }
          );*/
        
    }
    catch(err){
        console.log(err.message)
    }
}

// const deleteImage = async (req, res) => {
//     try {
//         const productId = req.query.pro;
//         const imgIndex = req.query.image;

//         const product = await Product.findById({ _id: productId });

//         if (product) {
//             const deletedImageFilename = product.image.splice(imgIndex, 1)[0];
//             await product.save();

//             // Send a success response
//             res.json({ success: true, deletedImageFilename });
//         } else {
//             // Send a failure response if the product is not found
//             res.status(404).json({ success: false, message: 'Product not found' });
//         }
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };




module.exports = {
    loadProductDetails,
    loadFilteredProducts,
    loadAllProduct,
    loadChocolateCake,

    // admin
    loadProductList,
    loadProduct,
    addProduct,
    editProductLoad,
    updateProduct,
    softDeleteProduct,
    deleteImage
}

// const User = require('../model/userModel')

// const Product = require('../model/productModel')

// const Category = require('../model/category')

// const OrderModel = require('../model/orderModel')

// const Offer = require('../model/categOfferModel');


// const loadAllProduct = async (req, res) => {
//     try {
//         const userId = req.session.user_id;
//         const { search, category } = req.query;
//         let query = { is_disabled: false };

//         const categories = await Category.find();

//         if (search) {
//             query = {
//                 ...query,
//                 $or: [
//                     { name: { $regex: new RegExp(search, 'i') } },
//                     { description: { $regex: new RegExp(search, 'i') } },
//                 ],
//             };
//         }

//         if (category) {
//             query = {
//                 ...query,
//                 category: { $regex: category, $options: 'i' },
//             };
//         }

//         const currentDate1 = new Date();
//         const curDate = currentDate1 + "+00:00";
//         const currentDate = new Date(curDate);
//         console.log(currentDate);
//         const expiredOffers = await Offer.find({ expireAt: { $lt: currentDate } });
//         console.log('expiredoff-', expiredOffers);
//         if (expiredOffers.length > 0) {
//             // Iterate over expired offers
//             console.log('helo');
//             for (const expiredOffer of expiredOffers) {
//                 console.log('heu')
//                 const { category: expiredCategory } = expiredOffer;
//                 console.log('expiredcat-', expiredCategory);
//                 // Find associated products by category
//                 const cat = await Category.find({ categoryName: expiredCategory });
//                 const catIds = cat.map(category => category._id)
//                 const associatedProducts = await Product.find({ category_id: { $in: catIds }, is_offer: true });
//                 console.log('associate-', associatedProducts);
//                 // Update each associated product
//                 for (const product of associatedProducts) {
//                     // Retrieve earlier price from the product
//                     const earlierPrice = product.earlierPrice;
//                     console.log('earlier-', earlierPrice);
//                     // Update the product
//                     await Product.findByIdAndUpdate(
//                         product._id,
//                         {
//                             $set: {
//                                 price: earlierPrice,
//                                 is_offer: false
//                             }
//                         }
//                     );
//                 }

//                 // Delete the expired offer
//                 await Offer.findByIdAndDelete(expiredOffer._id);
//             }

//             console.log('Expired offers deleted and products updated.');
//         } else {
//             console.log('No expired offers.');
//         }


//         // Fetch products based on the updated query
//         const productData = await Product.find(query);
//         console.log('productData',productData)
//         res.render('allProduct', { product: productData, category: categories, userId });

//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }


// const loadFilteredProducts = async (req, res) => {
//     try {
//         const userId = req.session.user_id
//         const { category } = req.query;
//         console.log('Category ID:', category);

//         const selectedCategoryId = req.query.category || ''

//         const categories = await Category.find();

//         let query = { is_disabled: false };

//         if (category) {
//             query = {
//                 ...query,
//                 category_id: category // Corrected field name to category_id
//             };
//         }

//         console.log(category)

//         const filteredProductData = await Product.find(query).populate('category_id');

//         const currentDate1 = new Date();
//         const curDate = currentDate1 + "+00:00";
//         const currentDate = new Date(curDate);
//         console.log(currentDate);
//         const expiredOffers = await Offer.find({ expireAt: { $lt: currentDate } });
//         console.log('expiredoff-', expiredOffers);
//         if (expiredOffers.length > 0) {
//             // Iterate over expired offers
//             console.log('helo');
//             for (const expiredOffer of expiredOffers) {
//                 console.log('heu')
//                 const { category: expiredCategory } = expiredOffer;
//                 console.log('expiredcat-', expiredCategory);
//                 // Find associated products by category
//                 const cat = await Category.find({ categoryName: expiredCategory });
//                 const catIds = cat.map(category => category._id)
//                 const associatedProducts = await Product.find({ category_id: { $in: catIds }, is_offer: true });
//                 console.log('associate-', associatedProducts);
//                 // Update each associated product
//                 for (const product of associatedProducts) {
//                     // Retrieve earlier price from the product
//                     const earlierPrice = product.earlierPrice;
//                     console.log('earlier-', earlierPrice);
//                     // Update the product
//                     await Product.findByIdAndUpdate(
//                         product._id,
//                         {
//                             $set: {
//                                 price: earlierPrice,
//                                 is_offer: false
//                             }
//                         }
//                     );
//                 }

//                 // Delete the expired offer
//                 await Offer.findByIdAndDelete(expiredOffer._id);
//             }

//             console.log('Expired offers deleted and products updated.');
//         } else {
//             console.log('No expired offers.');
//         }


//         res.render('filteredProducts', { product: filteredProductData, category: categories, userId, selectedCategoryId });
//     } catch (error) {
//         console.log(error.message);
//         res.status(500).send('Internal Server Error');
//     }
// }

// const loadChocolateCake = async (req, res) => {

//     try {
//         const userId = req.session.user_id;
//         let query = { is_disabled: false };

//         const categories = await Category.find({ categoryName: 'Chocolate Cake' }).lean();
//         console.log

//         const currentDate1 = new Date();
//         const curDate = currentDate1 + "+00:00";
//         const currentDate = new Date(curDate);
//         console.log(currentDate);
//         const expiredOffers = await Offer.find({ expireAt: { $lt: currentDate } });
//         console.log('expiredoff-', expiredOffers);
//         if (expiredOffers.length > 0) {
//             // Iterate over expired offers
//             console.log('helo');
//             for (const expiredOffer of expiredOffers) {
//                 console.log('heu')
//                 const { category: expiredCategory } = expiredOffer;
//                 console.log('expiredcat-', expiredCategory);
//                 // Find associated products by category
//                 const cat = await Category.find({ categoryName: expiredCategory });
//                 const catIds = cat.map(category => category._id)
//                 const associatedProducts = await Product.find({ category_id: { $in: catIds }, is_offer: true });
//                 console.log('associate-', associatedProducts);
//                 // Update each associated product
//                 for (const product of associatedProducts) {
//                     // Retrieve earlier price from the product
//                     const earlierPrice = product.earlierPrice;
//                     console.log('earlier-', earlierPrice);
//                     // Update the product
//                     await Product.findByIdAndUpdate(
//                         product._id,
//                         {
//                             $set: {
//                                 price: earlierPrice,
//                                 is_offer: false
//                             }
//                         }
//                     );
//                 }

//                 // Delete the expired offer
//                 await Offer.findByIdAndDelete(expiredOffer._id);
//             }

//             console.log('Expired offers deleted and products updated.');
//         } else {
//             console.log('No expired offers.');
//         }


//         // Fetch products based on the updated query
//         const productData = await Product.find({ $and: [{ query }, { categories }] });
//         res.render('chocolatecake', { product: productData, category: categories, userId });



//     } catch (error) {
//         console.log(error.message);
//     }
// }

// const loadProductDetails = async (req, res) => {
//     try {
//         const userId = req.session.user_id
//         const id = req.query.id

//         if (!id) {
//             res.redirect('/home')
//             return;
//         }

//         const product = await Product.findById(id).populate('category_id')

//         console.log('Product:', product)

//         if (product) {
//             res.render('productDetails', { product, userId });
//         } else {
//             res.redirect('/home')
//         }
//     } catch (error) {
//         console.log(error.message)
//         res.redirect('/home')
//     }
// }



// // .........................admmin.................................

// const loadProductList = async (req, res) => {

//     try {
//         const activeProducts = await Product.find({ is_disabled: false }).populate('category_id');

//         res.render('Products', { product: activeProducts });

//     } catch (error) {
//         console.log(error.message);
//     }

// }


// const loadProduct = async (req, res) => {

//     try {

//         const categories = await fetchCategoriesFromDatabase();
//         res.render('addProduct', { category: categories });

//     } catch (error) {
//         console.log(error.message);
//     }
// };

// const fetchCategoriesFromDatabase = async () => {
//     const category = await Category.find();
//     return category;
// };

// const addProduct = async (req, res) => {
//     let category;  // Define category outside the try block
//     try {
//         category = await fetchCategoriesFromDatabase();

//         // Validate if quantity and price are non-negative
//         const quantity = parseInt(req.body.quantity);
//         const price = parseFloat(req.body.price);

//         if (quantity < 0 || price < 0) {
//             return res.render('addProduct', { message: 'Quantity and price must be non-negative', category });
//         }

//         const product = new Product({
//             name: req.body.name,
//             quantity: quantity,
//             price: price,
//             earlierPrice: req.body.earlierPrice, // Add earlierPrice field
//             description: req.body.description,
//             image: req.files ? req.files.map(file => file.filename) : [],
//             category_id: req.body.category_id
//         });

//         const productData = await product.save();

//         if (productData) {
//             res.redirect('/admin/viewProduct');
//         } else {
//             res.render('addProduct', { message: 'Something Wrong', category });
//         }

//     } catch (error) {
//         console.log(error.message);
//         res.render('addProduct', { message: 'Error adding product', category });
//     }
// };

// // const fetchCategoriesFromDatabase = async () => {

// //     const category = await Category.find();
// //     return category;

// // };

// // const addProduct = async (req, res) => {
// //     try {
// //         const category = await fetchCategoriesFromDatabase();

// //         // Validate if quantity and price are non-negative
// //         const quantity = parseInt(req.body.quantity);
// //         const price = parseFloat(req.body.price);

// //         if (quantity < 0 || price < 0) {
// //             return res.render('addProduct', { message: 'Quantity and price must be non-negative', category });
// //         }

// //         const product = new Product({
// //             name: req.body.name,
// //             quantity: quantity,
// //             price: price,
// //             description: req.body.description,
// //             image: req.files ? req.files.map(file => file.filename) : [],
// //             category_id: req.body.category_id
// //         });

// //         const productData = await product.save();

// //         if (productData) {
// //             res.redirect('/admin/viewProduct');
// //         } else {
// //             res.render('addProduct', { message: 'Something Wrong', category });
// //         }

// //     } catch (error) {
// //         console.log(error.message);
// //         res.render('addProduct', { message: 'Error adding product', category });
// //     }
// // }


// const softDeleteProduct = async (req, res) => {
//     try {
//         const id = req.query.id;

//         if (!id) {
//             return res.redirect('/admin/viewProduct');
//         }

//         const product = await Product.findByIdAndUpdate(
//             id,
//             { $set: { is_disabled: true } },
//             { new: true }
//         )

//         if (product) {
//             return res.redirect('/admin/viewProduct');
//         } else {
//             return res.redirect('/admin/viewProduct');
//         }
//     } catch (error) {
//         console.error(error.message);
//         res.redirect('/admin/viewProduct');
//     }
// }

// const editProductLoad = async (req, res) => {

//     try {
//         const id = req.query.id;

//         if (!id) {
//             // Handle the case where id is undefined
//             res.redirect('/admin/viewProduct');
//             return;
//         }

//         const productList = await Product.findById(id).populate('category_id');

//         if (productList) {
//             const categories = await fetchCategoriesFromDatabase();
//             res.render('editProduct', { product: productList, category: categories });
//         } else {
//             res.redirect('/admin/viewProduct');
//         }
//     } catch (error) {
//         console.log(error.message);
//         res.redirect('/admin/viewProduct');
//     }
// }

// // const updateProduct = async (req, res) => {
// //     try {
// //         const id = req.body.id;

// //         const product = await Product.findById({ _id: id });

// //         const images = product.image;
// //         console.log('images....', images);

// //         const arrImages = req.files.map(file => file.filename);
// //         console.log('Received image filenames:', arrImages);

// //         // Calculate available dynamically
// //         const available = images.length;
// //         console.log('available:', available);

// //         const replaceCount = Math.min(arrImages.length, available);
// //         console.log('replaceCount', replaceCount);

// //         const newImages = arrImages.slice(0, replaceCount);

// //         product.image = images.slice(replaceCount).concat(newImages);
// //         console.log('new product.image:', product.image);

// //         await product.save();

// //         const updatedProduct = await Product.findByIdAndUpdate(
// //             { _id: req.body.id },
// //             {
// //                 $set: {
// //                     name: req.body.name,
// //                     status: req.body.status,
// //                     price: req.body.price,
// //                     description: req.body.description,
// //                     image: product.image,
// //                     category_id: req.body.category_id !== '' ? req.body.category_id : null,
// //                     earlierPrice: req.body.price,
// //                 },
// //             },
// //             { new: true }
// //         );

// //         if (updatedProduct) {
// //             console.log('Updated Product:', updatedProduct);
// //             res.redirect('/admin/viewProduct');
// //         } else {
// //             console.log('Failed to update product.');
// //             res.status(500).send('Failed to update product.');
// //         }
// //     } catch (err) {
// //         console.error(err.message);
// //         res.status(500).send('Internal Server Error');
// //     }
// // };

// const updateProduct = async(req,res)=>{
//     try{
//         const id=req.body.id;
        
       
//         const product = await Product.findById({_id:id});
//        const images = product.image;
   

//        const arrImages = req.files.map(file => file.filename);
    
//         const available = 3-images.length;
     
//         const newImages = arrImages.slice(0,available);

//         product.image = images.concat(newImages);
//         console.log(product.image)


//         const updateProduct = await Product.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name,price:req.body.price,description:req.body.description,image:product.image,category_id:req.body.category_id,earlierPrice:req.body.price}});
//        if(updateProduct){
//         res.redirect('/admin/viewProduct');
//        }
        
//     }   
//     catch(err){
//         console.log(err.message)
//     }
// }
// const deleteImage = async(req,res)=>{
//     try{
  
//         const productId = req.query.pro;
//         console.log('productId:',productId)
//         const imgIndex = req.query.image;
//         console.log('imgIndex:',imgIndex)
//         const product = await Product.findById({_id:productId});
//         console.log('product :',product )

//     if (product) {
//       // Remove the image at the specified index
//       product.image.splice(imgIndex, 1);
//       await product.save();
//     }  
//     res.redirect(`/admin/editProduct?id=${productId}`);
 
//         //console.log(idToRemove,productId)
//         /*const product = await Product.updateOne(
//             { _id: productId },
//             { $pull: { images: idToRemove } }
//           );*/
        
//     }
//     catch(err){
//         console.log(err.message)
//     }
// }

// // const deleteImage = async (req, res) => {
// //     try {
// //         const productId = req.query.pro;
// //         const imgIndex = req.query.image;

// //         const product = await Product.findById({ _id: productId });

// //         if (product) {
// //             const deletedImageFilename = product.image.splice(imgIndex, 1)[0];
// //             await product.save();

// //             // Send a success response
// //             res.json({ success: true, deletedImageFilename });
// //         } else {
// //             // Send a failure response if the product is not found
// //             res.status(404).json({ success: false, message: 'Product not found' });
// //         }
// //     } catch (err) {
// //         console.error(err.message);
// //         res.status(500).json({ success: false, message: 'Internal Server Error' });
// //     }
// // };




// module.exports = {
//     loadProductDetails,
//     loadFilteredProducts,
//     loadAllProduct,
//     loadChocolateCake,

//     // admin
//     loadProductList,
//     loadProduct,
//     addProduct,
//     editProductLoad,
//     updateProduct,
//     softDeleteProduct,
//     deleteImage
// }