module.exports = (code) => { return `<!DOCTYPE html>
<html>

<head>
    <title>화상채팅</title>
    <link rel="stylesheet" href="styles.css">

</head>

<body>
    <div class="gamepage">
        <div class="gamestart">Don't Yell</div>
        <div class="container">
            <div class="content" hidden></div>
            <div class="left-pane">
                <div id="table-div">
                            <div class = "anger" id="key3">Anger</div>
                            <div class = "stick" id="key3Value"></div>
                </div>
                <div id="roomnum" hidden>${code}</div>
                <video id="webcamStream" autoplay muted></video>
                <canvas id="captureCanvas" width="644" height="548" style="display: none;"></canvas>
                <div id="status">준비 중...</div>

            </div>

            <div class="center-pane">
                <div class="center-title">Analysis</div>
                <div class="ratio">
                    <h5>화를 내는 정도</h5>
                    <div id="rage_ratio"></div>
                </div>
                <div class="ratio">
                    <h5>슬픔을 느끼는 정도</h5>
                    <div id="sad_ratio"></div>
                </div>

            </div>

            <div class="right-pane">
                <div id="table-div">
                <div class = "anger" id="op_key3">Anger</div>
                <div class = "stick" id="op_key3Value"></div>
                </div>
                <video id="remoteVideo" autoplay></video>
            </div>

        </div>
    </div>
    <!-- script.js 파일 로드 -->
    <script src="https://cdn.socket.io/4.2.0/socket.io.min.js"></script>
    <script src="ai-connection.js"></script>
</body>

</html>`}