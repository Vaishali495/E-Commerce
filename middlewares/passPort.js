const localStrategy = require('passport-local').Strategy;
const userModel = require("../models/userSchema");
const bcrypt = require("bcrypt");

async function initializingPassport(passport){
    passport.use(new localStrategy(async (username,password,done) =>{
        try{
            user = await userModel.findOne({ username });

            if(!user) return done(null,false);
            let result = await verifyPassword(password,user.password)
            if(!result)
                return done(null,false)
            return done(null,user);
        }
        catch(err){
            return done(err,false);
        }
    }
    ));
    
    //serialize user info into the session
    passport.serializeUser(function(user,done){
        console.log("am in serialize user");
        if(user){
            return done(null,user.id);
        }
        return done(null,false)
    })
    
    //deserialize user info from the session
    passport.deserializeUser(async function(id,done){
        console.log("am in deserializeUser");
        try {
            let user = await userModel.findById(id);
            done(null,user);
        } catch (error) {
            return done(error,false);
        }
    })
}

async function verifyPassword(userpassword,storedPassword){
    console.log("am in verifyPassword");
    let result = await bcrypt.compare(userpassword,storedPassword);
    if(result)
        return true;
    else
        return false;
}

module.exports = {
    initializingPassport,
}