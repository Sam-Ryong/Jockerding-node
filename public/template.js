module.exports = (code) => { return `<!DOCTYPE html>
<html>

<head>
    <title>화상채팅</title>
    <link rel="stylesheet" href="styles.css">

</head>

<body>
<div id="roomnum" hidden>${code}</div>
    <div class="gamepage">
        <div class="gamestart">Don't Yell</div>
        <div class="container">
            <div class="content" hidden></div>
            <div class="left-pane">
                <div class = "anger" id="key3">Anger</div>
                <div class = "stick" id="key3Value"></div>
                <video id="webcamStream" autoplay muted></video>
                <canvas id="captureCanvas" width="644" height="548" style="display: none;"></canvas>
                <div id="status">준비 중...</div>

            </div>

            <div class="center-pane">
                <div class="center-title">Analysis</div>
                <div class="ratio">
                    <div id="rage_ratio"></div>
                    <div id="vsa">More Angry</div>

                </div>
                <br>
                <br>
                <div class="ratio">
                    <div id="sad_ratio"></div>
                    <div id="vss">More Sad</div>

                </div>

            </div>

            <div class="right-pane">
                <div class = "anger" id="op_key3">Anger</div>
                <div class = "stick" id="op_key3Value"></div>
                <video id="remoteVideo" autoplay></video>
            </div>

        </div>
    </div>
    <!-- script.js 파일 로드 -->
    <script src="https://cdn.socket.io/4.2.0/socket.io.min.js"></script>
    <script src="ai-connection.js"></script>
</body>

</html>`}