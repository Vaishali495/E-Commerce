const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController.js');
const {isAuthenticated } = require("../middlewares/user.js");

router.get("/cartPage", isAuthenticated, cartController.handleCartPage);
router.post("/addToCart", cartController.handleAddToCart);
router.post("/removeFromCart", cartController.handleRemoveFromCart);
router.post("/decreaseQuantity",cartController.handleDecreaseQuantity);
router.post('/increaseQuantity',cartController.handleIncreaseQuantity);

module.exports = router;