const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const path = require('path');
const cookieSession = require("cookie-session");
const db = require("../Login/app/models/index.js");
const dbConfig = require("../Login/app/config/db.config");
const template = require("../public/template.js");
const User = db.user;

db.mongoose
  .connect(`mongodb+srv://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    // initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

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
            return res.send(template(code));
        }
    
});
});

module.exports = router;