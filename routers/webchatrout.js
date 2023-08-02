const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const path = require('path');
const cookieSession = require("cookie-session");

router.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
  })
);

router.get('/chat',(req,res) => {
        jwt.verify(req.session.token, "bezkoder-secret-key", (err, decoded) => {
                if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }
      req.userId = decoded.id;
    console.log(req.userId);
    console.log(req.session.token);
    res.sendFile(path.resolve(__dirname, "../public/index_wow.html"));
});
});

module.exports = router;