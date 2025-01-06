let notFound=(req,res,next)=>{
    let error=new Error(`not-found-${req.originalUrl}`)
    res.status(404);
   next(error);
    
    };
let errorHandler=(err,req,res,next)=>{
res.status(res.statusCode===200?500:res.statusCode).json({m:err.message})

};
module.exports={errorHandler,notFound}