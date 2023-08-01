// 모듈 선언
const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require("https");
const cookieSession = require("cookie-session");
const bodyParser = require('body-parser');
const authJwt = require("./app/middlewares/authJwt");
const dbConfig = require("./app/config/db.config");
const db = require("./app/models");
const User = db.user;


//라우터들
const chaenrouter = require('./routers/chaenrouter.js');
const chatrouter = require('./routers/chatrouter.js');
const mypage = require("./routers/mypage.js");
const link = require("./routers/link.js");
//

const configureSocket = require('./handler/socketHandler.js');


// 환경 선언
const options = {
  key: fs.readFileSync("config/private.key"),
  cert: fs.readFileSync("config/certificate.crt"),
};
const redirectToHttps = (req, res, next) => {
  if (req.secure) {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
};

// 변수 선언
const app = express();
const server = https.createServer(options, app);
configureSocket(server);
require("./app/routes/auth.routes")(app);

// 미들웨어 설정과 정적 파일 서비스
app.use(express.static(path.join(__dirname, 'chat_html')));
app.use(redirectToHttps);
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
  })
);
app.use(authJwt.verifyToken);

// db
db.mongoose
  .connect(`mongodb+srv://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });


//Route 정보
app.use('/chat',chatrouter);
app.use('/',chaenrouter);
app.use("/mypage", mypage);
app.use("/link", link);
app.use("/api/auth/link", async (req, res) => {
  req.user = await User.findById(req.userId);
  const partner = await User.findOne({ code: req.body.oppo_code });
  console.log(req.userId);

  if (!partner) {
    return res.status(404).send({ message: "User Not found." });
  } else {
    console.log(partner);
    //partner 찾았으면
    // const emailCheck = await(partner.email === req.user.partnerMail);
    console.log(partner.email);
    console.log(req.user.partnerMail);

    if (partner.email == req.user.partnerMail) {
      //emailCheck == true이면
      console.log(partner.email == req.user.partnerMail);
      console.log(
        partner.code + partner.username + partner.id + req.user.username
      );
      await User.findByIdAndUpdate(
        req.userId,
        {
          code: partner.code,
          linked: true,
          oppo_name: partner.username,
        },
        { new: true }
      );
      await User.findByIdAndUpdate(
        partner.id,
        {
          linked: true,
          oppo_name: req.user.username,
        },
        { new: true }
      );

      res.redirect("/mypage");
    }
  }
});



app.listen(80, () => {
  console.log('Server is running on http://localhost:80');
});


server.listen(443, () => {
  console.log(`HTTPS server started on port 443`);
});