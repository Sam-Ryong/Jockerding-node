module.exports = (code) => { return `<!DOCTYPE html>
<html>

<head>
    <title>화상채팅</title>
    <link rel="stylesheet" href="styles.css">
</head>

<body>
    <h1>화상채팅</h1>
    <div id="roomnum" hidden>${code}</div>
    <div class="container">
        <div class="left-pane">
            <div id="table-div">
                <table>
                    <tr>
                        <td>분노</td>
                        <td id="key3Value"></td>
                    </tr>
                </table>
            </div>

            <video id="webcamStream" autoplay muted height="360"></video>
            <div class="video-info">Webcam</div>
        </div>
        <div class="center-pane">
            <div class="graph-container">
                <canvas id="rageSadChart"></canvas>
            </div>
            <div id="rage_ratio"></div>
            <div id="sad_ratio"></div>
        </div>
        <div class="right-pane">
            <div id="table-div">
                <table>
                    <tr>
                        <td>분노</td>
                        <td id="op_key3Value"></td>
                    </tr>
                </table>
            </div>
            <video id="remoteVideo" autoplay height="360"></video>
            <div class="video-info">Remote Video</div>
        </div>
    </div>
    <!-- script.js 파일 로드 -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js/dist/chart.min.js"></script>
    <script src="https://cdn.socket.io/4.2.0/socket.io.min.js"></script>
    <script src="ai-connection.js"></script>
</body>

</html>`}