//not found

const notFound = (req,res,next)=>{
    const error = new Error(`Not Found : ${req.originalUrl}`);
    res.status(404).render('404',{title:'404'});
   return next(error);
}

//Error handler

const errorHandler=(err,req,res,next)=>{
   // const statuscode=res.statuscode == 200 ? 500 : res.statuscode;
   const statusCode = res.statusCode || 500;
   //console.log(statusCode)
    /*res.status(statusCode).json({
        message: err?.message,
        stack:err?.stack,
    });*/
    res.status(statusCode)
}

module.exports={errorHandler,notFound};