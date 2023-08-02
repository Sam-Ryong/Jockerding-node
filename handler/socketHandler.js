const socketIO = require('socket.io');
const axios = require('axios');

function configureSocket(server) {

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
        socket.on('connect_ai', async (room, imageData) => {
          base64Data = imageData.replace(/^data:image\/png;base64,/, '');
          try {
            const response = await axios.post('http://localhost:5000/predict', {
              base64Data: base64Data,
            });
            socket.emit('msg',response.data.msg_helmet);
            socket.emit('graph',response.data.graph);
            if (rooms[room] && rooms[room].length === 2) {
              socket.emit('connected_ai');
              return;
            }
            else {
              return;
            }
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
      
};

module.exports = configureSocket;