const express = require('express');
const socketIO = require('socket.io');
const app = express();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const bodyParser = require('body-parser');
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
app.use(express.static(path.join(__dirname, 'public')));
const server = https.createServer(options, app);
const io = socketIO(server);
var rooms = {};


io.on('connection', socket => {
  console.log('새로운 사용자가 연결되었습니다.');

  socket.on('join room', (room) => {
    // 이미 방이 존재하는 경우
    if (rooms[room] && rooms[room].length === 2) {
      socket.emit('room full');
      return;
    }

    // 방에 참여
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = [];
    }
    rooms[room].push(socket.id);
    console.log(rooms);

    // 클라이언트에 방 정보 전송
    socket.emit('room joined', room);

    // 다른 클라이언트에게 새로운 사용자 정보 전송
    socket.to(room).emit('user joined', socket.id);

    console.log(socket.id + '님이 방 ' + room + '에 참여했습니다.');
  });


  // 클라이언트가 offer를 보내면 다른 사용자에게 전달
  socket.on('connect_ai', async (imageData) => {
    base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    try {
      const response = await axios.post('http://localhost:5000/predict', {
        base64Data: base64Data,
      });
      socket.emit('msg',response.data.msg_helmet);
      socket.emit('graph',response.data.graph);
      socket.emit('connected_ai');
      
    }
      catch (error) {
        console.log("err");
      }
    
  });

  socket.on('msg', (msg, room) => {
    socket.to(room).emit('op_msg', msg); // 모든 클라이언트에게 메시지 전송
  });
  socket.on('graph', (graph, room) => {
    socket.to(room).emit('op_graph', graph); // 모든 클라이언트에게 메시지 전송
  });
  socket.on('offer', (offer, room) => {
    socket.to(room).emit('offer', offer);
  });

  // 클라이언트가 answer를 보내면 다른 사용자에게 전달
  socket.on('answer', (answer, room) => {
    socket.to(room).emit('answer', answer);
  });

  // 클라이언트가 ICE candidate를 보내면 다른 사용자에게 전달
  socket.on('ice-candidate', (candidate, room) => {
    socket.to(room).emit('ice-candidate', candidate);
  });

  // 사용자가 연결을 끊었을 때 처리
  socket.on('disconnect', () => {
    console.log(socket.id + '사용자가 연결을 끊었습니다.');
    for (const room in rooms) {
      const index = rooms[room].indexOf(socket.id);
      if (index !== -1) {
        // 방에서 사용자 제거
        rooms[room].splice(index, 1);

        // 모든 클라이언트에게 사용자가 방을 나갔음을 알림
        io.to(room).emit('user left', socket.id);
        
        // 방이 빈 상태이면 방 삭제
        if (rooms[room].length === 0) {
          delete rooms[room];
        }

        break;
      }
    }
    console.log(rooms);
  });
});


app.use(redirectToHttps);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));


app.get('/',(req,res) => {
  res.sendFile(__dirname + "/public/index_wow.html");
})

app.get('/textfile', (req, res) => {
  fs.readFile('uploads/captured-image.txt', 'utf8', (err, data) => { //이 부분을 DB에서 가져오는 것으로 변경해야해요
      if (err) {
          res.status(500).send('error!');
      } else {
          res.send(data);
      }
  });
});

// flask가 이미지를 받을 수 있게 열어놓기
app.get('/image', async(req,res) => { 
  fs.readFile('uploads/captured-image.jpg', (err, data) =>{
    if (err) {
      res.status(500).send('error!');
      console.log("ok");
  } else {
      res.send(data);
  }
  });
})

// flask가 이미지 분석한 것을 언제 보낼지 모르니 듣고있다가 받으면 바로 작성하기
app.post('/image', async(req,res) =>{
  fs.writeFile(`uploads/captured-image.txt`,req.body.msg_helmet, async (err) => {
    if (err) {
      console.error('Failed to save the image:', err);
      return res.status(500).send('Failed to save the image.');
    }

    else {
      res.send('Received msg_helmet from Python server: ' + req.body.msg_helmet);
    }
  })
});


// 웹캠 캡쳐 한 것을 파일시스템에 저장하기
app.post('/upload', async (req, res) => {
  // 요청 본문에서 이미지 데이터 URL 추출
  const imageDataUrl = req.body.image;

  // Base64 디코딩하여 이미지 데이터 추출
  const base64Data = imageDataUrl.replace(/^data:image\/png;base64,/, '');
  const currentDate = new Date();

  try {
    const response = await axios.post('http://localhost:5000/predict', {
      base64Data: base64Data,
    });

    const msg_helmet = response.data.msg_helmet;

    // console.log('Received msg_helmet from Python server:', msg_helmet);
    res.send(response.data)

    }
   catch (error) {
    res.status(500).send('Error while sending request to Python server');
  }
  });






app.listen(80, () => {
  console.log('Server is running on http://localhost:80');
});


server.listen(443, () => {
  console.log(`HTTPS server started on port 443`);
});