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
//     res.sendFile(__dirname + '/index.html');
// });






const express = require('express');
const https = require('https'); // Node.js 기본 HTTPS 모듈
const app = express();

app.use(express.static(__dirname)); // 정적 파일 서비스

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

// app.get('/directions', (req, res) => {
//     const { origin, destination } = req.query;

//     if (!origin || !destination) {
//         return res.status(400).json({ error: "Missing origin or destination" });
//     }

//     const kakaoApiUrl = `https://apis-navi.kakaomobility.com/v1/waypoints/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&priority=RECOMMEND`;
//     const options = {
//         method: 'GET',
//         headers: {
//             Authorization: 'KakaoAK 1b60c2a21577696ea25e7753cb5786fe'
//         }
//     };

//     // Kakao API 요청
//     https.get(kakaoApiUrl, options, (apiRes) => {
//         let data = '';

//         // 응답 데이터 받기
//         apiRes.on('data', (chunk) => {
//             data += chunk;
//         });

//         // 응답 완료 시
//         apiRes.on('end', () => {
//             if (apiRes.statusCode === 200) {
//                 res.setHeader('Content-Type', 'application/json');
//                 res.send(data); // 클라이언트로 데이터 전달
//             } else {
//                 res.status(apiRes.statusCode).json({ error: "Failed to fetch route data" });
//             }
//         });
//     }).on('error', (error) => {
//         console.error("Error fetching Kakao API:", error);
//         res.status(500).json({ error: "Internal Server Error" });
//     });
// });

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
