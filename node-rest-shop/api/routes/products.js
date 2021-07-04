const express =require('express');
const router=express.Router();
const mongoose=require('mongoose');
const multer=require('multer');
const checkAuth=require('../middleware/check-auth');

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./uploads/');
    },
    filename:function(req,file,cb){
        cb(null,Date.now() + file.originalname);
    }
});

const fileFilter =(req,file,cb)=>{
    //reject a file
    if(file.mimetype==='image/jpeg'||file.mimetype==='image/png'||file.mimetype==='image/jpg')
    {
        cb(null,true);
    }else{
    cb(null,false);
    }
    
};

const upload=multer({
    storage:storage,
    limits:{
    fileSize:1024 * 1024 *5
    },
    fileFilter:fileFilter
});

const Product=require('..//models/product');

router.get('/',(req,res,next)=>{
    Product.find().select('name price _id productImage').exec().then(docs=>{
        const responce={
            count:docs.length,
            products:docs.map(doc=>{
                return{
                    name:doc.name,
                    price:doc.price,
                    productImage:doc.productImage,
                    _id:doc._id,
                    request:{
                        type:'GET',
                        url:'http://localhost:3000/products/'+doc._id
                    }
                }
            })
        };
        res.status(200).json(responce)
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});

router.post('/',checkAuth,upload.single('productImage'),(req,res,next)=>{
    const product=new Product({
        _id:new mongoose.Types.ObjectId(),
        name:req.body.name,
        price:req.body.price,
        productImage:req.file.path
    });
    product.save().then(result=>{
        console.log(result);
        res.status(201).json({
            message:'Created product successfully',
            createdProduct:{
                name:result.name,
                price:result.price,
                productImage:result.productImage,
                _id:result._id,
                request:{
                    type:'GET',
                    url:'http://localhost:3000/products/'+result._id
                }
            }
        });
    })
    .catch(err=>{
        console.log(err);
        res.status(500).json({
            error:err
        });

    });
    
    //next();
});

router.get('/:productID',(req,res,next)=>{
    const id=req.params.productID;
    Product.findById(id).select('name price _id productImage').exec().then(doc=>{
        console.log("from database",doc);
        if (doc){
            res.status(200).json({
                product:doc,
                request:{
                    type:'GET',
                    url:'http://localhost:3000/products'
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
    //next();
});

router.patch('/:productID',checkAuth,(req,res,next)=>{
    const id=req.params.productID;
    const updateOps={};
    for (const ops of req.body){
        updateOps[ops.propName]=ops.value;
    }
    Product.update({_id:id},{$set:updateOps}).exec().then(result=>{
        console.log(result);
        res.status(200).json({
            message:'Product updated',
            request:{
                type:'GET',
                url:'http://localhost:3000/products/'+id
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

router.delete('/:productID',checkAuth,(req,res,next)=>{
    const id=req.params.productID;
    Product.remove({_id:id}).exec().then(result=>{
        res.status(200).json({
            message:'Product Deleted',
            request:{
                type:'POST',
                url:'http://localhost:3000/products',
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