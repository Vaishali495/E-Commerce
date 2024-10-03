const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            productName: String,
            quantity:{
                type:Number,
                default: 1,
            },
            productPrice: Number,
        }
    ],
    totalAmount: Number,
    totalItems: Number,
    orderDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'Placed'
    },
    orderDetails: {
        username: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        instructions: {
            type: String,
        },
        payment: {
            type: String,
            default: 'cod'
        }
    }
});

const orderModel = mongoose.model('order',orderSchema);
module.exports = orderModel;