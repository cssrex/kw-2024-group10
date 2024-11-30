// https://cssrex.github.io/kw-2024-group10/
// 위 주소로 들어갔을 때 자동으로 서버가 열리도록 만들어주는 코드

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();

app.use(cors()); // 모든 도메인에서 요청을 받을 수 있게 설정
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 경로 표시 요청 처리
app.get('/directions', async (req, res) => {
  try {
    const { origin, destination } = req.query;
    console.log('Received query parameters:', req.query);

    if (!origin || !destination) {
      res.status(400).json({ error: 'Missing origin or destination' });
      return;
    }

    // Kakao Mobility API 요청 URL 생성
    const apiUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}&priority=RECOMMEND&road_type=1&format=json`;

    // Kakao Mobility API 호출
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

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
