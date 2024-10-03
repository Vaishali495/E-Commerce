const express = require("express");
const app = express();
const session = require("express-session");
const cookieParser = require("cookie-parser"); 
const path = require("path");
const PORT = 4000;
 
//middlewares
app.use(express.json());                              //convert JSON response to JS object
app.use(express.urlencoded({ extended: true }));      //convert HTML form data to JS object true means handle nested object
app.use(cookieParser());                              //convert cookie to JS object    
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(express.static("./public"));                  //automatically serve static files inside public folder 
app.use(express.static("./uploads"));
app.use('/uploads', express.static('uploads'));
app.set("view engine", "ejs");                        //sets EJS as the default template engine to render views  
app.set("views", path.join(__dirname, "./views"));

// for mongoDb connection
const {connectMongoDb} = require('./models/connection.js');
connectMongoDb("mongodb://localhost:27017/ECommerce");

//for PassportJs
const passport = require("passport");
app.use(passport.initialize()); 
app.use(passport.session());
const { initializingPassport } = require("./middlewares/passPort.js");
initializingPassport(passport);

// Routes definition
const indexRoutes = require('./routes/indexRoutes.js');
const cartRoutes = require('./routes/cartRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const orderRoutes  = require('./routes/orderRoutes.js');
const sellerRoutes = require('./routes/sellerRoutes.js');
app.use('/', indexRoutes);
app.use('/cart',cartRoutes);
app.use('/admin',adminRoutes);
app.use('/order',orderRoutes);
app.use('/seller',sellerRoutes);

//handling all errors at last

app.listen(PORT, () => {
  console.log("Server is running on", PORT); 
});
