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

exports.handleCartPage = async function (req, res) {
  console.log("am in handleCartPage");
  const detailedProducts = [];
  let totalItems = 0;
  let totalPrice = 0;
  let username = findUserName(req);
  try {
    const user = await userModel.findOne({ username });
    let userId = user._id;

    const cart = await cartModel.findOne({ userId });
    if(!cart){
      return res.render("cartPage", { products: detailedProducts, isLoggedIn: true,username});
    }
    let productsInCart = cart.products;

    for (const product of productsInCart) {
      const prodData = await productModel.findOne({ _id: product.productId });
      detailedProducts.push({
        productDetails: prodData,
        quantity: product.quantity,
      });
    }

    console.log("detailedProducts =",detailedProducts);
    for(const product of detailedProducts) {
      totalItems += product.quantity;
      totalPrice += product.productDetails.productPrice*product.quantity;
    }

    res.render("cartPage", { products: detailedProducts, isLoggedIn: true,username,totalPrice,totalItems });
  } catch (error) {
    console.error("error :", error);
  }
};

exports.handleAddToCart = async function (req, res) {
  if (!req.session.isLoggedIn)
    return res.status(403).json({ message: "You are unauthorized" });
  const username = findUserName(req);
  try {
    const user = await userModel.findOne({ username });
    let userId = user._id;
    const productId = req.body.productId;
    const product = await productModel.findOne({ _id: productId });
    const stock = product.stock;

    //check if user already Exist
    let cart = await cartModel.findOne({ userId: user._id });

    //if not exist create a new one
    if (!cart) {
      cart = await cartModel.create({
        userId: user._id,
        products: [{ productId: product._id, quantity: 1 }],
      });
    } else {
      //check if product already exist
      let productInCart = cart.products.find((p) =>
        p.productId.equals(productId)
      );

      if (productInCart) {
        if(productInCart.quantity>=stock){
          return res.json({success:false});
        }
        productInCart.quantity += 1;
        await cartModel.findOneAndUpdate(
          { userId, "products.productId": productInCart.productId },
          { $set: { "products.$.quantity": productInCart.quantity } } //Used $ to target the correct array element when updating products.quantity.
        );
      } else {
        cart.products.push({ productId, quantity: 1 });
        await cartModel.findOneAndUpdate(
          { userId },
          { $push: { products: { productId, quantity: 1 } } }
        );
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error("error :", error);
  }
};

exports.handleRemoveFromCart = async function (req, res) {
  console.log("am in handleRemoveFromCart")
  let totalItems = 0;
  let totalPrice = 0;
  const productId = req.body.productId;
  const username = findUserName(req);
  try {
    const user = await userModel.findOne({ username });
    let userId = user._id;
    
    await cartModel.updateOne(
      { userId }, 
      { $pull: { products: { productId: productId } } }
    ); //$pull is used to remove the product from the product array

    const upadatedCart = await cartModel.findOne({ userId });

    for(const product of upadatedCart.products){
      const prodData = await productModel.findOne({ _id: product.productId });
      totalItems += product.quantity;
      totalPrice += prodData.productPrice * product.quantity; 
    }

    res.json({ success: true ,totalItems,totalPrice});
  } catch (error) {
    console.error("error :", error);
  }
};

exports.handleDecreaseQuantity = async function(req,res){
  console.log("am in handleDecreaseQuantity");
  let totalPrice = 0;
  let totalItems = 0;
  let productId = req.body.productId;
  let username = findUserName(req);
  try {
    const user = await userModel.findOne({ username });
    let userId = user._id;

    let cart = await cartModel.findOne({ userId })
    
    let productInCart = cart.products.find((p) =>
      p.productId.equals(productId)
    );
    
    let quantity = productInCart.quantity
    if(quantity > 1){
      quantity -= 1;
    }
  
    await cartModel.updateOne(
      { userId,"products.productId": productId }, 
      { $set: { "products.$.quantity": quantity } }
    );

    const upadatedCart = await cartModel.findOne({ userId });

    for(const product of upadatedCart.products){
      const prodData = await productModel.findOne({ _id: product.productId });
      totalItems += product.quantity;
      totalPrice += prodData.productPrice * product.quantity; 
    }

    res.json({ success: true , quantity, totalPrice,totalItems});
  } catch (error) {
    console.error("error :", error);
  }
}

exports.handleIncreaseQuantity = async function(req,res){
  console.log("Am in handleIncreaseQuantity");
  let totalPrice = 0;
  let totalItems = 0;
  const productId = req.body.productId;
  let username = findUserName(req);
  try {
    const user = await userModel.findOne({ username });
    let userId = user._id;

    let cart = await cartModel.findOne({ userId})
    
    let productInCart = cart.products.find((p) =>
      p.productId.equals(productId)
    );

    let quantity = productInCart.quantity;
    const prodData = await productModel.findOne({ _id: productId });
    const stock = prodData.stock;

    if(stock <= quantity){
      return res.json({success:false});
    }
    
    quantity += 1;
    await cartModel.updateOne(
      { userId,"products.productId": productId }, 
      { $set: { "products.$.quantity": quantity } }
    );

    const upadatedCart = await cartModel.findOne({ userId });

    for(const product of upadatedCart.products){
      const prodData = await productModel.findOne({ _id: product.productId });
      totalItems += product.quantity;
      totalPrice += prodData.productPrice * product.quantity; 
    }

    res.json({ success: true , quantity, totalPrice,totalItems});
  } catch (error) {
    console.error("error :", error);
  }
}

