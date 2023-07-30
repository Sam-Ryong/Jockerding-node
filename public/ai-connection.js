const webcamStream = document.getElementById('webcamStream');
const remoteVideo = document.getElementById('remoteVideo');
const captureCanvas = document.getElementById('captureCanvas');
const captureContext = captureCanvas.getContext('2d');
const contentDiv = document.getElementById('content');
const op_contentDiv = document.getElementById('op_content');
const outputDiv = document.getElementById('output');
const statusDiv = document.getElementById('status');

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {url: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com'}
  ]
};
const socket = io();
let currentRoom = null;

    // 웹캠 스트림 표시를 위한 미디어 장치 요청
    navigator.mediaDevices.getUserMedia({video: true, audio: true})
      .then((stream) => {
        webcamStream.srcObject = stream;
        const roomId = prompt('방 번호를 입력하세요 (1 또는 2):');
        socket.emit('join room', roomId);

        // 비동기 함수로 만들어서 await 사용
        async function captureAndUpload() {
          captureContext.drawImage(webcamStream, 0, 0, captureCanvas.width, captureCanvas.height);
          const imageData = captureCanvas.toDataURL('image/png');
          
          // 서버로 업로드
          try {
            const response = await fetch('/upload', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ image: imageData })
            });
            const content = await response.json();
            contentDiv.innerHTML = content.msg_helmet; // 내용을 div에 업데이트
            if (currentRoom){
            socket.emit('msg',content.msg_helmet, currentRoom)
            }
            const jsonData = content.graph;
        
            // 표에 데이터 채우기
            document.getElementById("key1Value").innerText = "*".repeat(parseInt(jsonData["Surprise"]));
            document.getElementById("key2Value").innerText = "*".repeat(parseInt(jsonData["Neutral"]));
            document.getElementById("key3Value").innerText = "*".repeat(parseInt(jsonData["Anger"]));
            document.getElementById("key4Value").innerText = "*".repeat(parseInt(jsonData["Happy"]));
            document.getElementById("key5Value").innerText = "*".repeat(parseInt(jsonData["Sad"]));
            if (currentRoom){
              socket.emit('graph', jsonData, currentRoom);
            }
            
          } catch (error) {
            console.error('Error uploading image:');
          }

          // 0.1초 후에 다음 업로드를 실행 (재귀적 호출)
           setTimeout(captureAndUpload, 100); 
        }

        var peerConnection = new RTCPeerConnection(configuration);

        socket.on('msg', msg => {
          op_contentDiv.innerHTML = msg;
        })
        socket.on('graph', graph => {
          document.getElementById("op_key1Value").innerText = "*".repeat(parseInt(graph["Surprise"]));
          document.getElementById("op_key2Value").innerText = "*".repeat(parseInt(graph["Neutral"]));
          document.getElementById("op_key3Value").innerText = "*".repeat(parseInt(graph["Anger"]));
          document.getElementById("op_key4Value").innerText = "*".repeat(parseInt(graph["Happy"]));
          document.getElementById("op_key5Value").innerText = "*".repeat(parseInt(graph["Sad"]));
        })
        socket.on('room joined', (room) => {
          currentRoom = room;
        });
        socket.on('room full', () => {
          alert('방이 가득 찼습니다. 다른 방에 접속해주세요.');
        });
        socket.on('user joined', (userId) => {
          alert(userId + '님이 방에 참여했습니다.');
        });
        socket.on('user left', (userId) => {
          alert(userId + '님이 방을 나갔습니다.');
        });
    
    
        // offer 보내기
        peerConnection.addStream(stream);
        peerConnection.createOffer()
          .then(offer => peerConnection.setLocalDescription(offer))
          .then(() => {
            socket.emit('offer', peerConnection.localDescription, currentRoom);
          });
        // offer 받기
        socket.on('offer', offer => {
          peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
          peerConnection.createAnswer()
            .then(answer => peerConnection.setLocalDescription(answer))
            .then(() => {
              socket.emit('answer', peerConnection.localDescription, currentRoom);
            });
        });

        // answer 받기
        socket.on('answer', answer => {
          peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        // ICE candidate 받기
        socket.on('ice-candidate', candidate => {
          peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });

        // ICE candidate 보내기
        peerConnection.onicecandidate = event => {
          if (event.candidate) {
            socket.emit('ice-candidate', event.candidate, currentRoom);
          }
        };

        // 원격 비디오 스트림 받기
        peerConnection.ontrack = event => {
          const track = event.track;
          if (track.kind === 'video') {
            remoteVideo.srcObject = event.streams[0];
            startButton.removeAttribute('disabled');
          }
        };

        peerConnection.oniceconnectionstatechange = () => {
          if (peerConnection.iceConnectionState === 'disconnected' || peerConnection.iceConnectionState === 'closed') {
            remoteVideo.srcObject = null;
            startButton.setAttribute('disabled', true);
          }
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
        
        captureAndUpload();
        
        
      })
      .catch((error) => {
        console.error('Error accessing webcam:', error);
      });
      
