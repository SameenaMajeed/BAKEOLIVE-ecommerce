
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});

// const mongoose = require("mongoose");

// let uri = 'mongodb+srv://sameenamajeed611:sameena@bakeolive.xb7xasz.mongodb.net/?retryWrites=true&w=majority;'

// const connectDB = mongoose
//   .connect(uri)
//   .then(() => {
//     console.log("connected");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

const mongoose = require('mongoose')
mongoose.connect('mongodb+srv://sameenamajeed611:sameena@bakeolive.xb7xasz.mongodb.net/BAKEOlIVE')

const {errorHandler,notFound}=require('./middleware/errorHandler');

const express = require('express')
const app = express()

app.use((req,res,next)=>{
    res.header('Cache-Control','no-cache,private,no-Store,must-revalidate,max-scale=0,post-check=0,pre-check=0');
    next();
  });

// for user routes
const userRoute = require('./routes/userRoute')
app.use('/',userRoute)

// for admin routes
const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

//error handlermiddleware
app.use(notFound);
app.use(errorHandler);


app.get('*',(req,res)=>{
    res.status(404).render('404')
})

const port = process.env.PORT;
app.listen(port || 8000,()=>{
    console.log(`Server listening to port ${port}`);
})

// app.listen(3000,()=>console.log('Server Running...'))