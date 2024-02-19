
const dotenv = require('dotenv');
dotenv.config({path:'./config.env'});

const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/BakeOLive')

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