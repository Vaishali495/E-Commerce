const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { signUpMiddleware, isAuthenticated } = require("../middlewares/user.js");

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Uploads folder created!');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
    }
});

const uploadwithName = multer({
    storage: storage,
    limits: {
        fileSize:2*1024*1024 //2MB size limit
}});     


const indexController = require('../controllers/indexController.js');

router.get("/", indexController.handleHomeRoute);
router.get("/aboutUs",isAuthenticated,indexController.handleAboutUs);

router.get("/signUp", indexController.handleSignUpGet);
router.post("/signUp", signUpMiddleware, indexController.handleSignUpPost);

router.get("/logIn", indexController.handleLoginGet);
router.post("/logIn", indexController.handleLoginPost);

router.post("/verifyOtp", indexController.handleVerifyOtp);
router.post("/resendOtp", indexController.handleResendOtp);
router.post("/resendOtp2", indexController.handleResendOtp2);

router.get("/profile", isAuthenticated, indexController.handleProfileGet);
router.post("/profile-btn",uploadwithName.single('userImage'),indexController.handleProfileBtn);

router.get("/logOut", indexController.handlelogOut);

router.get("/ShowMoreProducts", indexController.handleShowMoreProducts);

router.get("/productDetails/:id",indexController.handleGetDetails);
router.get('/forgotPas',indexController.handleForgotPas);

router.post('/reset-password',indexController.handleResetPas);

router.post('/update-password',indexController.handleUpdatePas);
router.post('/verifyOtp2',indexController.handleVerifyOtp2);
router.get('/change-password',indexController.handleChangePasswordGet);
router.post('/verify-password',indexController.handleVerifyPassword);
router.post('/set-new-pass',indexController.handleSetNewPass);

module.exports = router;