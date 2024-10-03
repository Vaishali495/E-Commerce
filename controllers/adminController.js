const express = require('express');
const app = express();

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 
const secret = "my@Secret";

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const cartModel = require("../models/cartSchema");

function findUserName(req){
  const token = req.cookies.token;
  const decoded = jwt.verify(token, secret);
  const username = decoded.username;
  return username;
}

exports.handleAddProductGet = function(req,res){
  let username = findUserName(req);
    res.render('addProductPage',{isLoggedIn: true,username});
  }
   
exports.handleAddProductPost = async function(req,res){
    try {
      console.log("req.body =",req.body);
      const {productName,productDescription,productPrice,productStock} = req.body;
      const productImage = req.file.filename;

      const username = findUserName(req);
      const user = await userModel.findOne({ username });
      let userId = user._id;
  
      let newProduct = await productModel.create({
      productName,
      productDescription,
      productPrice: Number(productPrice),
      productImage,
      stock:productStock,
      addedBy:userId,
    }); 
    res.redirect('/profile');
  
    } catch (error) {
      console.error("Error in handleAddProductPost: ",error);
    }
  }

exports.handleUpdateProduct = async function(req,res){
  console.log("am in handleUpdateProduct");
  const productId = req.body.productId;
  const {productName,productDescription,productPrice,stock} = req.body.updatedData;
  try {
    const updatedProduct = await productModel.findByIdAndUpdate(productId,
    {
      productName,
      productDescription,
      productPrice,
      stock,
    },
    {new: true} //return the updated product
  );
    res.json({success:true,updatedProduct});
  } catch (error) {
    console.error("error :",error);
  }
}

exports.handleDeleteProduct = async function(req,res){
  console.log("am in handleDeleteProduct");
  const productId = req.body.productId;
  try {
    const product = await productModel.findByIdAndDelete(productId);
    res.json({success:true});
  } catch (error) {
    console.error("error :",error);
  }
}

exports.handleDisableUserGet = async function(req,res){
  console.log("am in handleDisableUserGet");
  const username = findUserName(req);
  try {
    const users = await userModel.find({});
    res.render('usersDisablePage',{isLoggedIn:true,username,users});

  } catch (error) {
    console.error("error :",error);
  }
}

exports.handleToggleStatus = async function(req,res){
  console.log("am in handleToggleStatus");
  const userId = req.body.userId;
  try {
    const user = await userModel.findById(userId);
    user.status = !user.status;
    await user.save();
    res.redirect('/admin/disable-user');//not a good approach to reload the full page so,handle it using fetch request
  } catch (error) {
    console.error("error :",error);
  }
}