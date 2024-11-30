const express = require('express');
const fetch = require('node-fetch'); // Kakao API 호출을 위한 fetch
const app = express();
const PORT = 8080;

// 정적 파일 서비스 설정
app.use(express.static('public'));

// 루트 경로 요청 처리
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/drawpath.html');
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

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
