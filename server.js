// const express = require('express');
// const { request } = require('http');
// const path = require('path');

// const app = express();
// const PORT = 8080;

// app.use(express.static(__dirname));

// // 서버 실행
// app.listen(PORT, () => {
//     console.log("Server is running at http://localhost:8080");
// });
// app.get('/', (req, res) => {
//     res.sendFile(__dirname + '/public/index.html');
// });

// server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 웹 페이지 파일을 제공
app.use(express.static(path.join(__dirname, 'public')));

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


// client-side JavaScript (웹 페이지에서 실행)
window.addEventListener('load', function() {
    const { exec } = require('child_process');

    exec('node server.js', (err, stdout, stderr) => {
        if (err) {
            console.error(`exec error: ${err}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
    });
});