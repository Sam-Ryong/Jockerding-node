const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const randomstring = require("randomstring");
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const randomString = randomstring.generate(5);
  console.log(randomString);

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
      res.send(`<script>alert("res.status(500) err);window.location.href='/signin';
      </script>`);
      return;
    } else {
      res.send(`<script>alert('만나서 반가워용 X-D 이제 로그인하러 고고');
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
      return res.redirect("/error");
    }

    if (!user) {
      // return res.redirect("/error");
      return res.send(`<script>alert('이메일 땡! 다시 츄라이츄라이 ヽ(°〇°)ﾉ');
      window.location.href='/signin';
      </script>`);
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.send(`<script>alert('비밀번호 땡! 다시 츄라이츄라이 ヽ(°〇°)ﾉ');
      window.location.href='/signin';
      </script>`);
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
    res.redirect("/mypage");
  });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    // return res.status(200).send({ message: "You've been signed out!" });
    // return res.redirect("/signin");
    return res.send(`<script>alert('기분은 좀 풀렸길 <( ^.^ )>');
      window.location.href='/signin';
      </script>`);
  } catch (err) {
    this.next(err);
  }
};
