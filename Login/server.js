//express 불러오기
const express = require("express");
const connectDB = require("./config/db.js");
const { connect } = require("mongoose");
const bodyParser = require("body-parser");

//app 생성
const app = express();
//포트 번호 기본값 5000으로 설정
const PORT = process.env.PORT || 5000;

//get 요청시 'API running'을 response 해주기
//req의 body 정보를 읽을 수 있도록 설정을 해주어야한다.
// app.use(express.json({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//routes에 작성한 router를 연결해준다.
app.use("/api/register", require("./routes/api/register"));
//localhost:5000/api/register로 요청하게된다
//require에는 router의 디렉토리 주소를 넣어준다

app.use("/api/auth", require("./routes/api/auth"));

app.use("/api/mypage", require("./routes/api/mypage"));

// app.use('/home')

app.use("/", require("./routes/api/home"));

app.get("/", (req, res) => {
  // res.send("API RUNNING...");
  res.redirect("/api/mypage");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.get("/auth", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.get("/home", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

connectDB();

//첫번째 인자로 port 번호, 두번째 인자로 callback함수를 통해 server 구축 성공시 console log
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
