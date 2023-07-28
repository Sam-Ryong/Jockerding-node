const webcamStream = document.getElementById('webcamStream');
const remoteVideo = document.getElementById('remoteVideo');
const captureCanvas = document.getElementById('captureCanvas');
const captureContext = captureCanvas.getContext('2d');
const contentDiv = document.getElementById('content');
const startBtn = document.getElementById('startBtn');
const outputDiv = document.getElementById('output');
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};


    // 웹캠 스트림 표시를 위한 미디어 장치 요청
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        webcamStream.srcObject = stream;
        captureAndUpload();
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
            const content = await response.text();
            contentDiv.innerHTML = content; // 내용을 div에 업데이트
          } catch (error) {
            console.error('Error uploading image:', error);
          }

          // 0.1초 후에 다음 업로드를 실행 (재귀적 호출)
           setTimeout(captureAndUpload, 100); 
        }

        const socket = io();

        // offer 보내기
        const peerConnection = new RTCPeerConnection(configuration);
        peerConnection.addStream(stream);
        peerConnection.createOffer()
          .then(offer => peerConnection.setLocalDescription(offer))
          .then(() => {
            socket.emit('offer', peerConnection.localDescription);
          });

        // offer 받기
        socket.on('offer', offer => {
          peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          peerConnection.createAnswer()
            .then(answer => peerConnection.setLocalDescription(answer))
            .then(() => {
              socket.emit('answer', peerConnection.localDescription);
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
            socket.emit('ice-candidate', event.candidate);
          }
        };

        // 원격 비디오 스트림 받기
        peerConnection.onaddstream = event => {
          remoteVideo.srcObject = event.stream;
        };

        // 처음 한 번은 바로 실행
        
      })
      .catch((error) => {
        console.error('Error accessing webcam:', error);
      });



    // 웹 브라우저가 Web Speech API를 지원하는지 확인
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();

      // 인식이 시작되었을 때 실행되는 이벤트 핸들러
      recognition.onstart = () => {
        outputDiv.innerHTML = '말을 하세요...';
      };

      // 인식이 종료되었을 때 실행되는 이벤트 핸들러
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        outputDiv.innerHTML = '인식된 텍스트: ' + transcript;

        // 서버로 인식된 텍스트를 보내기 위해 Fetch API 사용
        fetch('/send_data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: transcript })
        })
          .then(response => response.json())
          .then(data => {
            console.log('서버 응답:', data);
          })
          .catch(error => {
            console.error('오류 발생:', error);
          });
      };

      // 마이크 시작 버튼 클릭 시 실행되는 이벤트 핸들러
      startBtn.addEventListener('click', () => {
        recognition.start();
      });
    } else {
      // Web Speech API를 지원하지 않는 경우에 대한 처리
      outputDiv.innerHTML = '죄송합니다. 웹 브라우저가 Web Speech API를 지원하지 않습니다.';
    }
