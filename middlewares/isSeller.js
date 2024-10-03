const express = require('express');
const app = express();

function isSeller(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'seller') {
      return next();
    } else {
      res.status(403).send('Access Denied: You do not have seller rights.'); 
    }
  }

module.exports = isSeller;