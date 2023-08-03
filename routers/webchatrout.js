const express = require('express');
const jwt = require("jsonwebtoken");
const router = express.Router();
const path = require('path');
const cookieSession = require("cookie-session");
const db = require("../Login/app/models/index.js");
const dbConfig = require("../Login/app/config/db.config");
const template = require("../public/template.js");
const User = db.user;
const axios = require("axios");

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

router.post('/upload', async (req, res) => {
  // 요청 본문에서 이미지 데이터 URL 추출
  const imageDataUrl = req.body.image;

  // Base64 디코딩하여 이미지 데이터 추출
  const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');

  try {
    const response = await axios.post('http://localhost:5000/predict', {
      base64Data: base64Data,
    });
    res.send(response.data.graph);

    }
   catch (error) {
    res.status(500).send('Error while sending request to Python server');
  }
  });

module.exports = router;