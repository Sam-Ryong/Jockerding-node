module.exports = (code) => { return `<!DOCTYPE html>
<html>

<head>
    <title>화상채팅</title>
    <link rel="stylesheet" href="styles.css">
</head>

<body>
    <h1>화상채팅</h1>
    <div class="container">
        <div class="content" hidden></div>
        <div class="left-pane">
            <div id="table-div">
                <table>
                    <tr>
                        <td>분노</td>
                        <td id="key3Value"></td>
                    </tr>
                </table>
            </div>
            <div id = "roomnum" hidden>${code}</div>
            <video id="webcamStream" autoplay muted></video>
            <canvas id="captureCanvas" width="644" height="548" style="display: none;"></canvas>
            <div id="status">준비 중...</div>
            <div id="rage_ratio"></div>
            <div id="sad_ratio"></div>
            <div class="graph-container">
                <canvas id="rageSadChart"></canvas>
            </div>
        </div>
        <div class="center-pane">

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
            <video id="remoteVideo" width="644" height="548" autoplay></video>
        </div>

    </div>
    <!-- script.js 파일 로드 -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.socket.io/4.2.0/socket.io.min.js"></script>
    <script src="ai-connection.js"></script>
</body>

</html>`}