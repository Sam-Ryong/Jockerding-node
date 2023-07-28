//nodejs+express 앱은 미들웨어의 향연
//미들웨어란? 요청이 들어와서 응답으로 나가기 전까지 거치는 모든 중간의 함수
//함수는 모듈로 치환될 수 있고, 다른 파일에서 이 모듈을 불러다가 연결한다면 미들웨어로서의 역할을 하게되는 것

//middleware여기다 쓰려다가 그냥 routes api 폴더에 있는 파일들에다가 다 써버림..연결 복잡해서
//근데 확장성을 고려한다면 middleware가 있는게 깔끔한게 맞다는걸 이제와서 깨닫는중..
//middleware와 router의 차이와 각각의 필요성을 잘 몰랐어서 발생한 일 같다. 구조도를 그리니까 조금 그 분업이 보이는 것 같았다.
const express = require("express");
const cookieParser = require("cookie-parser");
const router = express.Router();
// const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const maxAge = 100 * 24 * 60 * 60;
const app = express();

router.use(cookieParser()); //쿠키파서 미들웨어를 사용함니다

const errorGenerator = (message, statusCode = 500) => {
  // error 를 핸들링 하는 함수
  const error = new Error(message); // error 객체를 생성
  error.statusCode = statusCode;
  throw error; // error 를 핸들링 하는 하는 미들웨어로 에러를 던진다.
};

module.exports = async (req, res, next) => {
  try {
    const { email, password } = await req.body;
    ///post 메소드로 들어온 요청의 데이터(body)에서 email, password을 destructuring 한다
    // console.log(req.body);
    console.log(email);

    // console.log(password);
    if (!email || !password) errorGenerator("Invalid inputs", 400); //input으로 들어오지 않은 경우에 잘못된 인풋이라는 에러를 던진다

    const user = await User.findOne({ email });
    console.log(user); //email로 조회한다.

    if (!user) errorGenerator("User not found", 404);
    // res.send(<script>alert("User not found, 404")</script>)

    const passwordCheck = await bcrypt.compare(password, user.password);
    if (!passwordCheck) errorGenerator("Wrong password", 404);

    // const token = createToken(user._id); //user 도큐먼트(객체)의 고유한 id로 토큰을 만든다

    //res.cookie("cookieId", token, maxAge); //100일 후 만료
    // // res.status(201).json({ message: "WOW", token }); //token을 response로 넘겨준다
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// module.exports = function (req, res, next) {
//   //Get token from header, header에서 x-auth-token은 token의 key값
//   // const token = req.header("x-auth-token");
//   const token = req.cookies.jwt;

//   if (!token) {
//     return res.status(401).json({ msg: "No token, authorization denied" });
//   }

//   try {
//     //jwt 검증
//     //token 해독, token을 만들 때 설정한 secret key값 : jwtsecret
//     const decoded = jwt.verify(token, "jwtSecret");
//     //인증된 사용자의 정보를 반환하거나 개인 페이지를 제공하는 등의 작업 수행
//     console.log(decoded.user);
//     //req에 해독한 user정보 생성
//     req.user = decoded.user;
//     next();
//   } catch (error) {
//     res.status(401).json({ msg: "Token is not valid" });
//   }
// };
