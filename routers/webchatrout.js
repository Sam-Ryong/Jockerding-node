const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const path = require('path');
const cookieSession = require("cookie-session");
const db = require("../Login/app/models/index");
const User = db.user;

router.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
  })
);

router.get('/chat',async (req,res) => {
    jwt.verify(req.session.token, "bezkoder-secret-key", async (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!",
            });
        }
        else{

            req.userId = decoded.id;
            const user = await User.findById(req.userId);
            const code = user.code;
            console.log(code);
            res.sendFile(path.resolve(__dirname, "../public/index_wow.html"));
        }
    
});
});

module.exports = router;