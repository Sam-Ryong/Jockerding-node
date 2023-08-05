const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const path = require("path");

verifyToken = async (req, res, next) => {
  let token = await req.session.token;

  if (!token) {
    // return res.sendFile(path.join(__dirname + "../../..", "home.html"));
    // return res.redirect("/signin");
    // res.send(
    //   `<script>alert('No token provided');
    //   </script>`
    // );
    next();
  } else {
    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        next();
      }
      req.userId = decoded.id;
      next();
    });
  }
};

const authJwt = {
  verifyToken,
};
module.exports = authJwt;
