const express = require('express');
const app = express();
const userModel = require("../models/userSchema");
const productModel = require("../models/productSchema");
const cartModel = require("../models/cartSchema");

const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 
const secret = "my@Secret";

const passport = require('passport');

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());        
app.use(express.json());      

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "2004sharmaanshika@gmail.com",
    pass: "dwqy aoss kiao sutn",
  },
});

function ToCheckIsAuthenticated(req,res){
  if(req.session.isLoggedIn)
    return true;
  else
    return false;
}

function findUserName(req){
  const token = req.cookies.token;
  const decoded = jwt.verify(token, secret);
  const username = decoded.username;
  return username;
}

exports.handleHomeRoute = async function(req, res) {
  try {
    let username;
    let isLoggedIn = ToCheckIsAuthenticated(req,res);
    console.log("isLoggedIn in home =",isLoggedIn);
    if(isLoggedIn){
      username = findUserName(req);
    }
    let counter = 5;
    let products = await productModel.find({}).limit(counter);
    res.render("homePage",{products: products,isLoggedIn: isLoggedIn,username});
  } catch (error) {
    console.error("error in home:",error);
  }
}

exports.handleAboutUs = function(req,res){
  let username;
  let isLoggedIn = ToCheckIsAuthenticated(req,res);
  if(isLoggedIn){
    username = findUserName(req);
  }
  res.render("aboutUsPage",{isLoggedIn: isLoggedIn,username});
}

exports.handleSignUpGet = function(req, res) {
  res.render("signUpPage", { message: null , isLoggedIn: false });
}

exports.handleLoginGet = function(req, res) {
  let username;
  console.log("am in handleLoginGet")
  let isLoggedIn = ToCheckIsAuthenticated(req,res);
  console.log("isLoggedIn in handleLoginGet =",isLoggedIn);
  if(isLoggedIn){
    username = findUserName(req);
  }
  res.render("loginPage",{message:null , isLoggedIn : isLoggedIn,username});
}

exports.handleSignUpPost = async function (req, res) {
  const userObj = req.body; 
  const email = req.body.email;
  await sendMail(req,res,email);

  res.render("otpPage", {
    message: null,
    userObj:JSON.stringify(userObj),
    userObj:JSON.stringify(userObj),
    isLoggedIn: false,
  });
}

exports.handleVerifyOtp = async function(req, res) {
  try {
    let obj = {};
    let userObj = JSON.parse(req.body.userObj);
    let otp = req.cookies.Otp;
    let userOtp = req.body.userOtp;
    let result = await bcrypt.compare(userOtp,otp);

    if (result) {
      console.log("userPass = ", userObj.password);

      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(userObj.password, salt, function (err, hash) {
          hashPassword = hash;
          obj = {
            username: userObj.username,
            email: userObj.email,
            password: hashPassword,
            role: userObj.role,
          };
          storedInDb(obj);
        });
      });
      res.redirect("/logIn");
    } else {
      res.render("otpPage", {
        message: "OTP is not correct",
        userObj:JSON.stringify(userObj),
        userObj:JSON.stringify(userObj),
        isLoggedIn: false,
      });
    }
  } catch (err) {
    console.log("Err in verifyOTp = ", err);
  }
}

function storedInDb(obj){
  userModel.create(obj);
}

exports.handleResendOtp = async function(req,res) {
  let userObj = JSON.parse(req.body.userObj);
  let email = userObj.email;
  await sendMail(req,res,email);

  res.render("otpPage", {
    message: null,
    userObj:JSON.stringify(userObj),
    userObj:JSON.stringify(userObj),
    isLoggedIn: false,
  });
}

exports.handleResendOtp2 = async function(req,res) {
  let userObj = JSON.parse(req.body.userObj);
  let email = userObj.email;
  await sendMail(req,res,email);

  res.render("otpPage2", {
    message: 'OTP sent',
    userObj:JSON.stringify(userObj),
    userObj:JSON.stringify(userObj),
    isLoggedIn: false,
  });
}

exports.handleLoginPost = async function(req, res, next) {
  console.log("am in handleLoginPost");
  console.log("req.body = ",req.body);
  const username = req.body.username;
  try {
    const user = await userModel.findOne({username});
    if(!(user.status)){
      console.log('am in else');
      return res.send("Your account has been temporarily disabled. Please contact the admin for further assistance.");
    }
    passport.authenticate('local',function(err, user, info) {
      if (err) {
          return next(err);
      }
      if (!user) {      // If authentication fails
          return res.render('loginPage', { message: 'Invalid username or password',isLoggedIn: false });
      }
      req.logIn(user, function(err) {   // If authentication succeeds, log the user in
          if (err) {
              return next(err);
          }
          const token = jwt.sign({username:user.username,
          },secret);
          res.cookie("token",token);
          req.session.isLoggedIn = true;
          return res.redirect('/profile');
      });
  })(req, res, next); // Invoke the authenticate function

  } catch (error) {
    console.log("error",error);
  }
}

async function sendMail(req,res,email){
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random 4-digit OTP
  console.log("otp =",otp);
    const salt = await bcrypt.genSalt(10);
    const hashOtp = await bcrypt.hash(otp, salt); 
    res.cookie("Otp", hashOtp);

  const mailOptions = { 
    from: "2004sharmaanshika@gmail.com",
    to: email,
    subject: "Verify your Email",
    text: `Your OTP is: ${otp}. Please use this code to proceed and don't share it with anyone.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
    return console.log(error);
    }
    console.log('Email sent to: ',info.accepted[0]);
  });
}

exports.handleProfileGet = async function(req,res){
  let user = req.user;
  let userId = user._id;
  let products = await productModel.find({addedBy: userId});
  res.render("profilePage",{userImage:user.userImage,username: user.username,email: user.email,role: user.role,isLoggedIn:true,products: products});
}

exports.handlelogOut = function(req,res){
  res.clearCookie('token');
  res.clearCookie('connect.sid');
  req.session.isLoggedIn = false;
  res.redirect('/');
}

exports.handleGetDetails = async function(req,res){
  console.log("am in handleGetDetails");
  const productId = req.params.id;
  try {
    const product = await productModel.findById(productId);
    console.log("product =",product);
    res.json(product);
  } catch (error) {
    console.error("Error :",error)
  }
}

exports.handleShowMoreProducts = async function(req,res){
  const { skip } = req.query;
  try {
    const products = await productModel.find({})
    .skip(parseInt(skip))
    .limit(5);
    if(products.length == 0){
      res.json({success: false});
    }
    else
    res.json({success: true,products});
    } catch (error) {
      console.error("error in handleShowMoreProducts :",error);
    }
}

exports.handleForgotPas = async function(req,res){
  res.render("forgotPasPage",{message: null}); 
}

exports.handleResetPas = async function(req,res){
  console.log("req.body =",req.body);
  const email = req.body.email;
  // const role = req.body.role;
  console.log("email =",email);
  let userObj;
  try {
    userObj = await userModel.findOne({email});
    console.log("user =",userObj);
    if(!userObj){
      return res.render('forgotPasPage',{message: 'Email is not valid'});
    }
    await sendMail(req,res,email);
    res.render("otpPage2", {
      message: null,
      userObj:JSON.stringify(userObj),
      userObj:JSON.stringify(userObj),
      isLoggedIn: false,
    });
  } catch (error) {
    console.error("Error :",error);
  }
}

exports.handleVerifyOtp2 = async function (req,res) {
  console.log("am in handleVerifyOtp2");
  console.log("req.body =",req.body);
  let userObj = JSON.parse(req.body.userObj);
  let otp = req.cookies.Otp;
    let userOtp = req.body.userOtp;
    let result = await bcrypt.compare(userOtp,otp);
    console.log("result =",result);
    if(result){
      const token = jwt.sign({user:userObj,
      },secret);
      res.cookie("userToken",token);
      res.render('resetPas',{message:null});
    }
    else{
      res.render("otpPage2", {
        message: 'Otp is not Correct',
        userObj:JSON.stringify(userObj),
        userObj:JSON.stringify(userObj),
        isLoggedIn: false,
      });
    }
}

exports.handleUpdatePas = async function(req,res) {
  let newPas = req.body.newPassword;
  let confPas = req.body.confirmPassword;

  if(newPas != confPas){
    return res.render('resetPas',{message: 'Please Enter same password!'});
  }
  const token = req.cookies.userToken;
  try{
    const decoded = jwt.verify(token, secret);
    const userId = decoded.user._id;
    // const role = decoded.user.role;

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPas, salt);

    await userModel.findByIdAndUpdate(userId, { password: hashPassword });
    
    return res.render('loginPage', { message: 'Password updated successfully. Please log in.' , isLoggedIn:false});
  }
  catch(error){
    console.error("error :",error);
  }
}

exports.handleProfileBtn = async function(req,res){
  console.log("am in handleProfileBtn");
  const userImage = req.file.filename;
  console.log("userImage =",userImage);
  try {
    let username = findUserName(req);
    let updatedUser = await userModel.findOneAndUpdate({username},{userImage:userImage},{ new: true } );
    console.log("updatedUser =",updatedUser);
    res.redirect('/profile');
    //not a good approach , handle this prob. using JS
  } catch (error) {
    console.error("error :",error);
  }
}

exports.handleChangePasswordGet = async function(req,res){
  console.log("am in handleChangePasswordGet");
  try {
    res.render('changePass',{message:null});
  } catch (error) {
    console.error("error :",error);
  }
}

exports.handleVerifyPassword = async function(req,res){
  try {
    console.log("am in handleVerifyPassword");
    console.log(req.body);
    const currentPass = req.body.currentPassword;
    console.log("currentPass =",currentPass);
    let username = findUserName(req);
    const user = await userModel.findOne({username});
    let userId = user._id;
    let userPass = user.password;
    let result = await bcrypt.compare(currentPass,userPass);
    if(result){
      res.render('newpassPage',{message:null});
    }
    else{
      res.render('changePass',{message: 'Password is not correct'});
    }
  } catch (error) {
    console.error("error :",error);
  }
}

exports.handleSetNewPass = async function(req,res){
  try {
    let username = findUserName(req);
    let newPassword = req.body.newPassword;
    let confirmPassword = req.body.confirmPassword;

    if(newPassword != confirmPassword){
      res.render('newPassPage',{message:'Please Enter same password!'});
    }
    else{
      const salt = await bcrypt.genSalt(10);
      const hashPass = await bcrypt.hash(newPassword,salt);
      await userModel.findOneAndUpdate({username},{$set: {password:hashPass} });
      res.render('passUpdateSuccess');
    }
  } catch (error) {
    console.error("error :",error);
  }
}