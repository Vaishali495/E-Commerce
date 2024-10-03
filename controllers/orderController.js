const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const cartModel = require("../models/cartSchema");
const orderModel = require("../models/orderSchema");

const jwt = require("jsonwebtoken");
const secret = "my@Secret";

function findUserName(req){
  const token = req.cookies.token;
  const decoded = jwt.verify(token, secret);
  const username = decoded.username;
  return username;
}

exports.handleFillTheDetails = async function(req,res){
    let totalPrice = 0;
    let totalItems = 0;
    let username = findUserName(req);
    try {
      const detailedProduct = [];
      const user = await userModel.findOne({ username });
      const userId = user._id;
      const cart = await cartModel.findOne({ userId });
      const productsInCart = cart.products;
      
      for(product of productsInCart){
        const prodData = await productModel.findOne({_id:product.productId});
        detailedProduct.push({
          prodName:prodData.productName,
          quantity:product.quantity,
          prodPrice: prodData.productPrice*product.quantity,
        });
      }
      console.log("detailedProduct =",detailedProduct);
  
      for(const product of detailedProduct) {
        totalItems += product.quantity;
        totalPrice += product.prodPrice;
      }
      res.render("detailsPage",{user,detailedProduct,totalItems,totalPrice});
    } catch (error) {
      console.error("error :",error);
    }
  }
  
  exports.handleSubmitOrder = async function(req,res){
    console.log("am in handleSubmitOrder");
    console.log("req.body =",req.body);
    let totalAmount = 0;
    let totalItems = 0;
    let orderProducts = [];
    let username = findUserName(req);
    try{
      const user = await userModel.findOne({username});
      const userId = user._id;
      const userCart = await cartModel.findOne({userId});
      const productsInCart = userCart.products;

      for(product of productsInCart){
        const prodData = await productModel.findById({_id:product.productId})
        // check the stock
        if (prodData.stock < product.quantity) {
          return res.render("orderFailedPage", {
              message: `Not enough stock for ${prodData.productName}. Only ${prodData.stock} left.`
          });
        }
        // Reduce the stock
        prodData.stock -= product.quantity;
        await prodData.save();

        totalAmount += prodData.productPrice*product.quantity;
        totalItems += product.quantity;
        orderProducts.push({
          productId: product.productId,
          productName: prodData.productName,
          quantity: product.quantity,
          productPrice:prodData.productPrice*product.quantity,
        })
      }
      console.log("orderProducts =",orderProducts);

      let order = await orderModel.create({
        userId,
        products:orderProducts,
        totalAmount,
        totalItems,
        orderDetails:{
          username:req.body.username,
          phone:req.body.phone,
          address:req.body.address,
          instructions:req.body.instructions,
          payment:req.body.payment,
        }
      })

      await cartModel.findOneAndDelete({userId});
      res.render("orderPlacedPage", { orderId: order._id });
      }catch(error){
      console.log("error :",error);
    }
  }
  
  exports.handleViewOrders = async function(req,res){
    try{
      let username = findUserName(req);
      const user = await userModel.findOne({ username });
      let userId = user._id;
      const orders = await orderModel.find({userId});
      
      res.render('viewOrderPage',{isLoggedIn: true,username,orders});
    }catch(error){
      console.error("error :",error);
    }
  }
  /*let productDetail = [];
      for(let order of orders){
        for(let product of order.products){
          let productId = product.productId
          let prodData = await productModel.findOne({_id:productId});
          productDetail.push({
            data: prodData,
            quantity: product.quantity,
          })
        }
      } */