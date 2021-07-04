const express =require('express');
const mongoose=require('mongoose');
const router=express.Router();

const Order=require('../models/order');
const Product=require('../models/product');
const checkAuth=require('../middleware/check-auth');

router.get('/',checkAuth,(req,res,next)=>{
    Order.find()
    .select('product quantity _id')
    .populate('product','name')
    .exec()
    .then(docs=>{
        res.status(200).json({
            count:docs.length,
            orders:docs.map(doc=>{
                return {
                    _id:doc._id,
                    product:doc.product,
                    quantity:doc.quantity,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/orders/'+doc._id
                    }
                }
            })
        });
    })
    .catch(err=>{
        res.status(500).json({
            error:err
        });
    });
});

router.post('/',checkAuth,(req,res,next)=>{
    Product.findById(req.body.productId)
    .then(product=>{
        if(!product){
            return res.status(404).json({
                message:'Product not found'
            });
        }
        const order=new Order({
            _id:new mongoose.Types.ObjectId(),
            product:req.body.productId,
            quantity:req.body.quantity
        });
        return order
        .save();
    })
    .then(result=>{
            console.log(result);
            res.status(201).json( {
                message:'Order Placed',
                createdOrder:{
                    _id:result._id,
                    product:result.product,
                    quantity:result.quantity
                },
                request:{
                    type:'POST',
                    url:'http://localhost:3000/orders/'+result._id
                }
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json({
                error:err
            });
        });
    
});

router.get('/:orderID',checkAuth,(req,res,next)=>{
    const id=req.params.orderID;
    Order.findById(id).select('product quantity _id')
    .populate('product').exec().then(doc=>{
        console.log("from database",doc);
        if (doc){
            res.status(200).json({
                order:doc,
                request:{
                    type:'GET',
                    url:'http://localhost:3000/orders'
                }
            })
        } else{
            res.status(404).json({message:'No Valid entry found for provided ID'})
        }
    }).catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    });
});

router.delete('/:orderID',checkAuth,(req,res,next)=>{
    const id=req.params.orderID;
    Order.remove({_id:id}).exec().then(result=>{
        res.status(200).json({
            message:'Order Deleted',
            request:{
                type:'POST',
                url:'http://localhost:3000/orders',
                body:{name:'String',price:'Number'}
            }
        })
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        })
    })
});

module.exports=router;