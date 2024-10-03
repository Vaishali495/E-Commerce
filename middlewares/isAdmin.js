const express = require('express');
const app = express();

function isAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    } else {
      res.status(403).send('Access Denied: You do not have admin rights.'); 
    }
  }

module.exports = {
    isAdmin
}