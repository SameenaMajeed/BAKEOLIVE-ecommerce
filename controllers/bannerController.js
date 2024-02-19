const Banner = require('../model/bannerModel')

const bannerLoad = async(req,res)=>{
    try{
       const banner = await Banner.find().lean();
       res.render('banner',{banner})
      
    }
    catch(err){
        console.log(err.message);
    }
}

const addBannerLoad = async(req,res)=>{
    try{
    res.render('add-banner');
    }
    catch(err){
        console.log(err.message);
    }
}

const addBanner = async(req,res)=>{
    try{

     /*   const images = req.files.map(file => file.filename);
    console.log(images);*/
        // Check if a banner already exists
        console.log(req.body.image)
        const existingBanner = await Banner.findOne({postion:req.body.position});
    
        if (existingBanner) {
              res.redirect('/admin/add-banner');

        } else {
          // If no banner exists, create a new one
          const newBanner = new Banner({ 
            image: req.body.image,
            position: req.body.position.toLowerCase()
        });
         const banner = await newBanner.save();
         if(banner){
            res.redirect('/admin/banner');
           }
        }
      

    }
    catch(err){
        console.log(err.message);
    }
}

const deleteBanner = async(req,res)=>{
    try {
        const id = req.params.id;
        // Delete the banner with the specified ID
        const deletedBanner = await Banner.findByIdAndDelete(id);

        if (deletedBanner) {
            res.redirect('/admin/banner');
        } else {
            res.redirect('/admin/banner'); 
        }
    } catch (err) {
        console.log(err.message);
    }
}

module.exports = {bannerLoad,addBannerLoad,addBanner,deleteBanner};