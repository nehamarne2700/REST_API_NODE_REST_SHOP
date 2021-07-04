const express = require('express');
const app =express();
const morgan=require('morgan');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');

const productRoutes= require('./api/routes/products');
const orderRoutes= require('./api/routes/orders');
const userRoutes=require('./api/routes/user');

mongoose.connect('mongodb+srv://nehamarne:nehamarne@node-rest-shop.b8uym.mongodb.net/test',{
    useNewUrlParser:true,
    useUnifiedTopology:true
});
mongoose.Promise=global.Promise;

//for log of requests
app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));
//to enable body for a request/responce
app.use(express.urlencoded({
    extended:false
}));
app.use(express.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Origin,X-Requested-with,Content-Type,Accept,Authrization');
    if(req.method ==='OPTIONS')
    {
        res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET');
        return res.status(200).json({});
    }
    next();
})

//routes for the product/order requests
app.use('/products',productRoutes);
app.use('/orders',orderRoutes);
app.use('/user',userRoutes);

//error handling for invalid requests
app.use((req,res,next)=>{
    const error=new Error('Not Found');
    error.status=404;
    next(error);
})

app.use((error,req,res,next)=>{
    res.status(error.status||500);
    res.json({
        error:{
            message:error.message
        }
    })
})

module.exports =app;