const express = require("express");
const cors = require("cors");
const cookieSession = require("cookie-session");
const authJwt = require("./app/middlewares/authJwt");
const dbConfig = require("./app/config/db.config");
const mypage = require("./mypage.js");
const link = require("./link.js");
const app = express();
const https = require("https");
const controller = require("./app/controllers/auth.controller");
app.use(express.static(__dirname));
const fs = require("fs");
const options = {
  key: fs.readFileSync("config/private.key"),
  cert: fs.readFileSync("config/certificate.crt"),
  ca : fs.readFileSync("config/ca_bundle.crt", 'utf8')
};

const redirectToHttps = (req, res, next) => {
  if (req.secure) {
    next();
  } else {
    res.redirect('https://' + req.headers.host + req.url);
  }
};
const server = https.createServer(options, app);
app.use(cors());
/* for Angular Client (withCredentials) */
// app.use(
//   cors({
//     credentials: true,
//     origin: ["http://localhost:8081"],
//   })
// );

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "bezkoder-session",
    keys: ["COOKIE_SECRET"], // should use as secret environment variable
    httpOnly: true,
  })
);

app.use(authJwt.verifyToken);

async function updateUser(userId, updatedData) {
  try {
    // 유저 정보 업데이트
    const result = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    if (!result) {
      console.log("User not found.");
    } else {
      console.log("User updated successfully:", result);
    }
  } catch (error) {
    console.error("Error updating user:", error);
  }
}

const db = require("./app/models");
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

// simple route
// app.get("/", (req, res) => {
//   res.json({ message: "Welcome to bezkoder application." });
// });

app.get("/", (req, res) => {
  if (req.userId) {
    // // 인증된 사용자인 경우
    // User.findById(req.userId).exec((err, user) => {
    //   //req.userId로 db에서 찾은다음
    //   if (err) {
    //     res.status(500).send({ message: err });
    //     return; //그게 에러가 발생하면 그만 두고
    //   }
    //   if (user.linked === "False") {
    //     return res.send(
    //       "링크 페이지로 이동해야한다. html파일을 다르게 보여주면되나..? 아니면 link로 리다이렉션?"
    //     );
    //   }
    //   if (user.linked === "true") {
    //     // 인증되지 않은 사용자인 경우
    //     return res.send(
    //       "마이페이지로 리다이렉션하면된다 js마이페이지 동적으로 html 템플릿 생성하기..?"
    //     );
    //   }
    // });
    res.redirect("/mypage");
  } else {
    // 인증되지 않은 사용자인 경우
    res.redirect("/signin");
    //signin으로 리다이렉션하기
  }
});
// isLinked = (req, res) => {
//
//     return res.send(
//       "linked===true라는 뜻이므로 다시 마이페이지 리다이렉션 하면 되어있다는 뜻이므로 homepage html을 쏜다.."
//     );
//     // return res.sendFile("../mypage.html"); 대신 js 마이페이지 리다이렉션 하고 동적으로 html 템플릿 생성하기?
//   });

app.use("/mypage", mypage);

app.use("/link", link);
// 마이페이지와 같은 원리로 use하게끔.

app.use("/api/auth/link", async (req, res) => {
  req.user = await User.findById(req.userId);
  const partner = await User.findOne({ code: req.body.oppo_code });
  //     //req.userId로 db에서 찾은다음
  console.log(req.userId);
  // User.findOne({
  //   code: req.body.oppo_code,
  // }).exec((err, partner) => {
  //   if (err) {
  //     res.status(500).send({ message: err });
  //     return;
  //   }

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

app.get("/signup", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.get("/signin", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/error", (req, res) => {
  res.sendFile(__dirname + "/error.html");
});

// routes
require("./app/routes/auth.routes")(app);

// // set port, listen for requests
// const PORT = process.env.PORT || 8080;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}.`);
// });

server.listen(443, () => {
  console.log(`HTTPS server started on port 443`);
});
