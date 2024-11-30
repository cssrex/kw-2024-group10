// https://cssrex.github.io/kw-2024-group10/
// 위 주소로 들어갔을 때 자동으로 서버가 열리도록 만들어주는 코드

const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// 웹 페이지 파일을 제공
app.use(express.static(path.join(__dirname, 'public')));

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 경로 요청 처리
app.get('/directions', async (req, res) => {
    try {
      const { origin, destination } = req.query;
  
      console.log('Received query parameters:', req.query);
      if (!origin || !destination) {
        res.status(400).json({ error: 'Missing origin or destination' });
        return;
      }
  
      const apiUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}&priority=RECOMMEND&road_type=1&format=json`;
  
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: 'KakaoAK 1b60c2a21577696ea25e7753cb5786fe',
        },
      });
  
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Kakao API Error Response:', errorResponse);
        res.status(response.status).json(errorResponse);
        return;
      }
  
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Internal Server Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

// client-side JavaScript (웹 페이지에서 실행)
window.addEventListener('load', function () {
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