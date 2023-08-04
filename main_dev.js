// 모듈 선언
const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const https = require("https");
const chatrouter = require('./routers/webchatrout.js');
const configureSocket = require('./handler/socketHandler.js');

//환경 선언
const options = {
  key: fs.readFileSync("config/private.key"),
  cert: fs.readFileSync("config/certificate.crt"),
  ca : fs.readFileSync("config/ca_bundle.crt")
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


// 미들웨어 설정과 정적 파일 서비스
app.use(express.static(path.join(__dirname, 'public')));
app.use(redirectToHttps);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));



//Route 정보
app.use('/',chatrouter);


app.listen(2000, () => {
  console.log('Server is running on http://localhost:2000');
});

server.listen(3000, () => {
  console.log(`HTTPS server started on port 3000`);
});