const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');
const https = require("https");
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

const app = express();
const server = https.createServer(options, app);
const io = socketIO(server);
app.use(redirectToHttps);

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'public')));

// 소켓 연결
io.on('connection', socket => {
  console.log('새로운 사용자가 연결되었습니다.');

  // 클라이언트가 offer를 보내면 다른 사용자에게 전달
  socket.on('offer', offer => {
    socket.broadcast.emit('offer', offer);
  });

  // 클라이언트가 answer를 보내면 다른 사용자에게 전달
  socket.on('answer', answer => {
    socket.broadcast.emit('answer', answer);
  });

  // 클라이언트가 ICE candidate를 보내면 다른 사용자에게 전달
  socket.on('ice-candidate', candidate => {
    socket.broadcast.emit('ice-candidate', candidate);
  });

  // 사용자가 연결을 끊었을 때 처리
  socket.on('disconnect', () => {
    console.log('사용자가 연결을 끊었습니다.');
  });
});


app.listen(80, () => {
  console.log(`서버가 포트 80에서 실행 중입니다.`);
});

server.listen(443, () => {
  console.log(`서버가 포트 ${443}에서 실행 중입니다.`);
});


// https.createServer(options, app).listen(443, () => {
//   console.log(`HTTPS server started on port 443`);
// });