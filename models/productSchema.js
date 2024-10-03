const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productName: {
      type: String,
      trim: true,
    },
    productImage: {
      type: String,
      trim: true,
    },
    productDescription: {
      type: String,
      trim: true,
    },
    productPrice: {
      type: Number,
    },
    stock: { type: Number, default: 1 },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
  }
});

const productModel = mongoose.model('product',productSchema);
module.exports = productModel;