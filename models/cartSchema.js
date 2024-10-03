const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
    userId: {
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
      quantity: {
        type: Number,
        default: 1,
      },
    }
  ]
});

const cartModel = mongoose.model('cart',cartSchema);
module.exports = cartModel;