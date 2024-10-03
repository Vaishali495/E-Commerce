const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const {isAuthenticated } = require("../middlewares/user.js");

router.get('/fillTheDetails',isAuthenticated,orderController.handleFillTheDetails);
router.post('/submit-order',orderController.handleSubmitOrder);
router.get('/viewOrders',isAuthenticated,orderController.handleViewOrders);

module.exports = router;