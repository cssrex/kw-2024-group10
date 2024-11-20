const express = require('express');
const { request } = require('http');
const path = require('path');

const app = express();
const PORT = 8080;

app.use(express.static(__dirname));

// 서버 실행
app.listen(PORT, () => {
    console.log("Server is running at http://localhost:8080");
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});