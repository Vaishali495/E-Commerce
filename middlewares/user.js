const express = require('express');
const app = express();

const userModel = require("../models/userSchema");

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); 
const secret = "my@Secret";

app.use(cookieParser());  
async function signUpMiddleware(req,res,next){
    try{ 
        let userObj = req.body;
        console.log("req.body =",req.body);
        let user = await userModel.findOne({username: userObj.username},{email: userObj.email})
        if(user){
            return res.render('signUpPage',({message: 'User Already Exist',isLoggedIn:false}));
        }

        let admin = await userModel.findOne({ role: 'admin' });
        if (admin && userObj.role === 'admin') {
            return res.render('signUpPage', { message: 'An admin already exists. Only one admin is allowed.',isLoggedIn:false });
        }
        next();
    }
    catch(err){
        console.log("Err in signUpMiddleware: ",err);
    }
}

function isAuthenticated(req, res, next) {
    console.log("am in isAuthenticated");
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

module.exports = {
    signUpMiddleware,
    isAuthenticated,
}