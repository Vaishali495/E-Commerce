const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const sellerController = require('../controllers/sellerController');
const isSeller = require('../middlewares/isSeller');

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


router.get('/add-product',isSeller,sellerController.handleAddProductGet);
router.post('/add-product',uploadwithName.single('productImage'),sellerController.handleAddProductPost);

module.exports = router;