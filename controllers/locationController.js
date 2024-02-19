const Location = require('../model/locationModel');

const  loadLocation = async(req,res)=>{
    try{
        const location = await Location.find().lean();
        res.render('location',{location});
    }
    catch(err){
        console.log(err.message);
    }
}

const addLocationLoad = async(req,res)=>{
    try{
        res.render('add-location');
    }
    catch(err){
        console.log(err.message);
    }
}

// const addLocation = async(req,res)=>{
//     try{
//       const {district,pincode}=req.body;
       
//       const pincodeArray = pincode.split(',').map(code=>code.trim());
//         console.log(pincodeArray);

//         const isValidPincodes = pincodeArray.every(code => isValidPincode(code));

//         if (!isValidPincodes) {
//             return res.render('add-location', { message: "Invalid pincode format. Each pincode should be 6 digits.", exist: true })
//         }

//       const newLocation = new Location({
//         district:district,
//         pincode:pincodeArray
//       });
//       const location = await newLocation.save();

//       if(location){
//         res.redirect('/admin/location');
//       }
//     }


//     catch(err){
//         console.log(err.message);
//     }
// }

const addLocation = async (req, res) => {
    try {
        const { district, pincode } = req.body;

        const existingLocation = await Location.findOne({ district });
        if (existingLocation) {
            return res.render('add-location', { message: "Location with this district already exists.", exist: true });
        }

        const pincodeArray = pincode.split(',').map(code => code.trim());
        console.log(pincodeArray);

        const isValidPincodes = pincodeArray.every(code => isValidPincode(code));

        if (!isValidPincodes) {
            return res.render('add-location', { message: "Invalid pincode format. Each pincode should be 6 digits.", exist: true })
        }

        const newLocation = new Location({
            district: district,
            pincode: pincodeArray
        });
        const location = await newLocation.save();

        if (location) {
            res.redirect('/admin/location');
        }
    } catch (err) {
        console.log(err.message);
    }
}


function isValidPincode(pincode) {
    
    return /^\d{6}$/.test(pincode);
}

const editLocationLoad = async(req,res)=>{
    try{
        console.log('helo')
        const {id} = req.query;
        console.log(id)
        const location = await Location.findById(id).lean();
        console.log(location)
        res.render('edit-location',{location});
    }
    catch(err){
        console.log(err.message);
    }
}

// const editLocation = async(req,res)=>{
//     try{
//         const {district,pincode,id}=req.body;
//         const location = await Location.findById(id);

//         const pincodeArray = pincode.split(',').map(code=>code.trim());
//         console.log(pincodeArray);

//         const isValidPincodes = pincodeArray.every(code => isValidPincode(code));

//         if (!isValidPincodes) {
//             return res.redirect('/admin/edit-location');
//         }

//         location.district = district || location.district
//         location.pincode = pincodeArray || location.pincode;

//         const location1 = await location.save();
        
//         if(location1){
           
//             res.redirect('/admin/location');
//           }

//     }
//     catch(err){
//         console.log(err.message);
//     }
// }

const editLocation = async (req, res) => {
    try {
        const { district, pincode, id } = req.body;
        const location = await Location.findById(id);

        const pincodeArray = pincode.split(',').map(code => code.trim());
        console.log(pincodeArray);

        const isValidPincodes = pincodeArray.every(code => isValidPincode(code));

        if (!isValidPincodes) {
            return res.render('edit-location', { location, message: "Invalid pincode format. Each pincode should be 6 digits." });
        }

        // Check if the edited district conflicts with another existing location
        const existingLocation = await Location.findOne({ district, _id: { $ne: id } });
        if (existingLocation) {
            return res.render('edit-location', { location, message: "Location with this district already exists." });
        }

        location.district = district || location.district;
        location.pincode = pincodeArray || location.pincode;

        const location1 = await location.save();

        if (location1) {
            res.redirect('/admin/location');
        }
    } catch (err) {
        console.log(err.message);
    }
}


module.exports = {
    loadLocation,
    addLocationLoad,
    addLocation,
    editLocationLoad,
    editLocation
};