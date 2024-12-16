// ==================== 변수 정의 ====================
// app.js로부터 마커 데이터 전달 받기
const markerInfos = JSON.parse(localStorage.getItem('markerInfos'));

// midpoint.js로부터 최종 목적지 전달받기
const midpoint = JSON.parse(localStorage.getItem('midpoint'));
console.log("Marker Infos:", markerInfos);
console.log("Midpoint:", midpoint);
// Kakao Map 초기화
const mapContainer = document.getElementById('map');
const mapOption = {
    center: new kakao.maps.LatLng(37.5666103, 126.9783881),
    level: 5, // 지도 레벨
};
const map = new kakao.maps.Map(mapContainer, mapOption);

// 목적지 좌표 불러오기
const destinationPoint = {
    lat: midpoint[0],
    lng: midpoint[1]
};

let markers = [];
let newColor = '#FF0000'; // 경로의 초기 색상 (빨간색)

const sidebarListDiv = document.getElementById('sidebarList');
const toggleButton = document.getElementById('toggleButton');
const toggleIcon = document.getElementById('toggleIcon');
const sidebar = document.getElementById('sidebar');

let polylines = {};
// 고정된 10가지 색상 배열
const routeColors = [
    '#FF0000', // 빨강
    '#00FF00', // 초록
    '#0000FF', // 파랑
    '#FFFF00', // 노랑
    '#FF00FF', // 마젠타
    '#00FFFF', // 시안
    '#800000', // 밤색
    '#808000', // 올리브
    '#008080', // 청록
    '#800080'  // 보라
];

// ==================== 함수 정의 ====================
// 지도에 마커 추가
function addMarker(lat, lng, index) {
    const markerPosition = new kakao.maps.LatLng(lat, lng);

    const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map,
    });

    // CustomOverlay 생성 (마커 위에 번호 표시)
    const content = `
        <div style="
            display: inline-block;
            padding: 5px 10px;
            font-size: 14px;
            font-weight: bold;
            color: #fff;
            background-color: #82B7FF;
            text-shadow: -1px -1px 0 black, 1px -1px 0 black, -1px 1px 0 black, 1px 1px 0 black;
            border-radius: 5px;
            border: 0.3px solid black;
            text-align: center;
            box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.5);">
            Marker ${index + 1}
        </div>
    `;

    const overlay = new kakao.maps.CustomOverlay({
        content: content,
        position: markerPosition,
        yAnchor: -0.3, // 마커의 아래쪽에 표시되도록 설정
        xAnchor: 0.5,
    });

    // CustomOverlay를 지도에 표시
    overlay.setMap(map);

    // 마커 배열에 저장
    markers[index] = { marker, overlay };
}

// Kakao Directions API를 호출하여 소요 시간 반환
async function fetchRouteDuration(originLat, originLng, destLat, destLng) {
    const kakaoApiUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${originLng},${originLat}&destination=${destLng},${destLat}&priority=RECOMMEND&road_type=1&format=json`;

    try {
        const response = await fetch(kakaoApiUrl, {
            headers: {
                Authorization: 'KakaoAK 1b60c2a21577696ea25e7753cb5786fe',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch route data.');

        const routeData = await response.json();
        // 소요시간(초)를 분 단위로 변환 후 반환
        const duration = Math.ceil(routeData.routes[0].summary.duration / 60);
        return duration; // 소요 시간 반환
    } catch (error) {
        console.error('Error fetching route data:', error);
        return 'Unknown'; // 오류 발생 시 'Unknown' 반환
    }
}

// 마커를 지도에 표시하고, 마커와 목적지 사이의 경로 그리기를 요청
function displayMarkerList(markerInfos) {
    const sidebarListDiv = document.getElementById('sidebarList');
    sidebarListDiv.innerHTML = ''; // 사이드바 UI 초기화

    markerInfos.forEach((info, index) => {
        // 체크박스 및 목록 항목 컨테이너
        const markerItem = document.createElement("div");
        markerItem.className = "sidebar-item";

        // 체크박스 생성
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = true; // 기본 체크 상태
        checkbox.className = "checkbox mr-2";

        // 체크박스 이벤트: 체크되면 경로 추가, 체크 해제 시 경로 제거
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                drawRoute(info, index);
            } else {
                removeRoute(index);
            }
        });

        // 주소 및 소요 시간 텍스트
        const markerText = document.createElement("div");
        markerText.innerHTML = `
            <p><strong>Marker ${index + 1}: ${info.addr || "주소 없음"}</strong></p>
            <p class="text-gray-600" id="duration-${index}">소요 시간: 계산 중...</p>
        `;

        // 사이드바 항목 클릭 시 해당 마커로 이동
        markerText.addEventListener("click", () => {
            map.setCenter(new kakao.maps.LatLng(info.lat, info.lng));
        });

        // 체크박스와 텍스트를 컨테이너에 추가
        markerItem.appendChild(checkbox);
        markerItem.appendChild(markerText);
        sidebarListDiv.appendChild(markerItem);

        // 기본적으로 마커 및 경로 추가
        addMarker(info.lat, info.lng, index);
        drawRoute(info, index);

        // 소요 시간 계산 후 업데이트
        fetchRouteDuration(info.lat, info.lng, destinationPoint.lat, destinationPoint.lng)
            .then(duration => {
                document.getElementById(`duration-${index}`).innerText = `소요 시간: ${duration}분`;
            });
    });
}

// 경로 그리기 함수
function drawRoute(info, index) {
    // 기존 경로가 존재하면 먼저 제거
    removeRoute(index);

    // 마커와 오버레이 추가
    addMarker(info.lat, info.lng, index);

    const kakaoApiUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${info.lng},${info.lat}&destination=${destinationPoint.lng},${destinationPoint.lat}&priority=RECOMMEND&road_type=1&format=json`;

    fetch(kakaoApiUrl, {
        headers: {
            Authorization: 'KakaoAK 1b60c2a21577696ea25e7753cb5786fe',
        },
    })
        .then(response => response.json())
        .then(routeData => {
            const path = [];
            const firstRoute = routeData.routes[0];
            firstRoute.sections.forEach(section => {
                section.roads.forEach(road => {
                    for (let i = 0; i < road.vertexes.length; i += 2) {
                        path.push(new kakao.maps.LatLng(road.vertexes[i + 1], road.vertexes[i]));
                    }
                });
            });

            // 색상 설정
            const color = routeColors[index % routeColors.length];

            // 폴리라인 생성 및 저장
            const polyline = new kakao.maps.Polyline({
                map: map,
                path: path,
                strokeWeight: 5,
                strokeColor: color,
                strokeOpacity: 1,
                strokeStyle: 'solid'
            });

            polylines[index] = polyline; // 경로를 객체에 저장
        })
        .catch(error => console.error('Error fetching route:', error));
}

// 경로 제거 함수
function removeRoute(index) {
    if (polylines[index]) {
        polylines[index].setMap(null); // 지도에서 경로 제거
        polylines[index] = undefined; // 객체에서 명확히 제거
    }
    if (markers[index]) {
        markers[index].marker.setMap(null); // 마커 제거
        markers[index].overlay.setMap(null); // 오버레이 제거
    }
}

// 목적지를 지도에 표시
function addDestinationMarker() {

    const imageSrc = './images/marker.png'; // 마커 이미지 경로
    const imageSize = new kakao.maps.Size(45, 45);
    const imageOption = { offset: new kakao.maps.Point(22, 45) };
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    const markerPosition = new kakao.maps.LatLng(destinationPoint.lat, destinationPoint.lng);
    const marker = new kakao.maps.Marker({
        position: markerPosition,
        image: markerImage,
        map: map,
    });

    map.setCenter(markerPosition); // 지도 중심을 새로운 좌표로 이동
}

// 토글 버튼 클릭 이벤트 처리
toggleButton.addEventListener('click', () => {
    if (sidebar.classList.contains('closed')) {
        // 사이드바 열기
        sidebar.classList.remove('closed');
        toggleButton.style.left = "412px"; // 토글 버튼 위치 조정
        toggleIcon.src = './images/sidebar_toggle_right.png'; // 아이콘 변경
    } else {
        // 사이드바 닫기
        sidebar.classList.add('closed');
        toggleButton.style.left = "0"; // 토글 버튼 위치 조정
        toggleIcon.src = './images/sidebar_toggle_left.png'; // 아이콘 변경
    }
});

// ==================== 함수 실행 ====================
displayMarkerList(markerInfos);
addDestinationMarker();