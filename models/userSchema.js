const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /.+@.+\..+/,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
  },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "cart",
  },
  userImage: {
    type: String,
    default: '/images/profileImg.png',
  },
  status:{
    type:Boolean,
    default: true,
  }
});

const userModel = mongoose.model('user',userSchema);
module.exports = userModel;