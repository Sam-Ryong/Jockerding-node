const webcamStream = document.getElementById('webcamStream');
const remoteVideo = document.getElementById('remoteVideo');
const captureCanvas = document.getElementById('captureCanvas');
const captureContext = captureCanvas.getContext('2d');
const contentDiv = document.getElementById('content');
const op_contentDiv = document.getElementById('op_content');
const outputDiv = document.getElementById('output');
const statusDiv = document.getElementById('status');
const roomnum = document.getElementById('roomnum');
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com'}
  ]
};
const socket = io();
let currentRoom = null;
let rage_ratio = 0;
let sad_ratio = 0;
let ready = 0;

    // 웹캠 스트림 표시를 위한 미디어 장치 요청
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then(async (stream) => {
        webcamStream.srcObject = stream;
        socket.emit('join room', roomnum.innerText);

        var peerConnection = new RTCPeerConnection(configuration);

        socket.on('connected_ai', () => {

            captureContext.drawImage(webcamStream, 0, 0, captureCanvas.width, captureCanvas.height);
            imageData = captureCanvas.toDataURL('image/png');
            setTimeout(() => {
                socket.emit('connect_ai', imageData);
              }, 1000); // 1000밀리초 = 1초
      
        })

        socket.on('graph', graph => {
            document.getElementById("key3Value").innerText = "■".repeat(parseInt(graph["Anger"])/2);
            document.getElementById("key3").innerText = `Anger(${parseInt(graph["Anger"])}%)`;
          sad_ratio = sad_ratio + parseInt(graph["Sad"]);
          rage_ratio = rage_ratio + parseInt(graph["Anger"]);
          
          if (sad_ratio > 0)
          {
            document.getElementById("sad_ratio").innerText = `당신이 상대방보다 ${sad_ratio} 만큼 더 슬픔을 느낍니다.`; 
          }
          else 
          {
            document.getElementById("sad_ratio").innerText = `상대방이 당신보다 ${sad_ratio * (-1)} 만큼 더 슬픔을 느낍니다.`;
          }
          if (rage_ratio > 0)
          {
            document.getElementById("rage_ratio").innerText = `당신이 상대방보다 ${rage_ratio} 만큼 더 화를 표출했습니다.`; 
          }
          else 
          {
            document.getElementById("rage_ratio").innerText = `상대방이 당신보다 ${rage_ratio * (-1)} 만큼 더 화를 표출했습니다.`;
          }
          socket.emit('graph', graph, currentRoom);
        })

        // socket.on('msg', msg => {
        //   contentDiv.innerHTML = msg;
        //   socket.emit('msg',msg, currentRoom);
        // })
        // socket.on('op_msg', op_msg => {
        //   op_contentDiv.innerHTML = op_msg;
        // })

        socket.on('op_graph', op_graph => {
            document.getElementById("op_key3Value").innerText = "■".repeat(parseInt(op_graph["Anger"])/2);
            document.getElementById("op_key3").innerText = `Anger(${parseInt(op_graph["Anger"])}%)`;
          sad_ratio = sad_ratio - parseInt(op_graph["Sad"]);
          rage_ratio = rage_ratio - parseInt(op_graph["Anger"]);
          if (sad_ratio > 0)
          {
            document.getElementById("sad_ratio").innerText = `당신이 상대방보다 ${sad_ratio} 만큼 더 슬픔을 느낍니다.`; 
          }
          else 
          {
            document.getElementById("sad_ratio").innerText = `상대방이 당신보다 ${sad_ratio * (-1)} 만큼 더 슬픔을 느낍니다.`;
          }
          if (rage_ratio > 0)
          {
            document.getElementById("rage_ratio").innerText = `당신이 상대방보다 ${rage_ratio} 만큼 더 화를 표출했습니다.`; 
          }
          else 
          {
            document.getElementById("rage_ratio").innerText = `상대방이 당신보다 ${rage_ratio * (-1)} 만큼 더 화를 표출했습니다.`;
          }
        })
        socket.on('room joined', (room) => {
          currentRoom = room;
        });
        socket.on('room full', () => {
          alert('방이 가득 찼습니다. 다른 방에 접속해주세요.');
        });
        socket.on('user joined', (userId) => {
          alert('상대방이 접속했습니다.');
        });
        socket.on('user left', (userId) => {
          alert('상대방이 종료했습니다.');
        });
    
    
        // offer 보내기
        peerConnection.addStream(stream);
        peerConnection.createOffer()
          .then(offer => peerConnection.setLocalDescription(offer))
          .then(() => {
            setTimeout(() => {
                socket.emit('offer', peerConnection.localDescription, currentRoom);
              }, 1000); // 1000밀리초 = 1초
            // socket.emit('offer', peerConnection.localDescription, currentRoom);
          });
        // offer 받기
        socket.on('offer', offer => {
          peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
          peerConnection.createAnswer()
            .then(answer => peerConnection.setLocalDescription(answer))
            .then(() => {
                setTimeout(() => {
                    socket.emit('answer', peerConnection.localDescription, currentRoom);
                  }, 1000);
                // socket.emit('answer', peerConnection.localDescription, currentRoom);
            });
        });

        // answer 받기
        socket.on('answer', (answer) => {
          peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        // ICE candidate 받기
        socket.on('ice-candidate', async (candidate) => {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          captureContext.drawImage(webcamStream, 0, 0, captureCanvas.width, captureCanvas.height);
          imageData = captureCanvas.toDataURL('image/png');
          socket.emit('connect_ai', imageData);
        });

        // ICE candidate 보내기
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            setTimeout( () => {
                socket.emit('ice-candidate', event.candidate, currentRoom);
              }, 1000);
          }
        };

        // 원격 비디오 스트림 받기
        peerConnection.ontrack = (event) => {
          const track = event.track;
          if (track.kind === 'video') {
            remoteVideo.srcObject = event.streams[0];
          }
          remoteVideo.srcObject = event.streams[0];
        };


        // 연결 상태 이벤트 처리
        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'connected') {
            statusDiv.innerHTML = '음성 채팅 중...';
          } else if (peerConnection.iceConnectionState === 'disconnected') {
            statusDiv.innerHTML = '연결이 끊어졌습니다. 다시 연결 중';
            remoteVideo.srcObject = null;
          } else if (peerConnection.iceConnectionState === 'closed') {
            statusDiv.innerHTML = '연결이 종료되었습니다.';
            remoteVideo.srcObject = null;
          }
        };
      })
      .catch((error) => {
        console.error('Error accessing webcam:', error);
      });
