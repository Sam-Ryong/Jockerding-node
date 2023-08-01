const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const randomstring = require("randomstring");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // 10자 길이의 랜덤 문자열 생성
  const randomString = randomstring.generate(5);
  console.log(randomString); // 예시 출력: "n2Lg8Gd1iW"

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    partnerMail: req.body.partnerMail,
    code: randomString,
    linked: false,
    oppo_name: "",
  });

  user.save((err, user) => {
    if (err) {
      // res.status(500).send({ message: err });
      res.send(`<script>alert("res.status(500) err);</script>`);
      return;
    } else {
      res.send(`<script>alert('회원가입 성공');
      window.location.href='/signin';
      </script>`);
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({ message: "Invalid Password!" });
    }

    //첫번째 데이터로 페이로드 인자를 입력한다. 여기서는 userid를 저장했다
    const token = jwt.sign({ id: user.id }, config.secret, {
      algorithm: "HS256",
      allowInsecureKeySizes: true,
      expiresIn: 86400, // 24 hours
      //이거 수정해야할듯..? 몇일로 설정할지..
    });

    req.session.token = token;
    console.log(req.session.token);
    // res.redirect("/mypage");
  });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};
