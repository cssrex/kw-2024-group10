// ==================== 변수 정의 ====================
// app.js로부터 마커 데이터 전달 받기
const markerInfos = JSON.parse(localStorage.getItem('markerInfos'));

// midpoint.js로부터 최종 목적지 전달받기
const midpoint = JSON.parse(localStorage.getItem('midpoint'));

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


// ==================== 함수 정의 ====================
// 지도에 마커 추가
function addMarker(lat, lng, index) {
    const markerPosition = new kakao.maps.LatLng(lat, lng);
    const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map,
    });

    // 마커 배열에 저장
    markers[index] = marker;
}

// 마커를 지도에 표시하고, 마커와 목적지 사이의 경로 그리기를 요청
function displayMarkerList(markerInfos) {
    const markerListDiv = document.getElementById("markerList");

    if (!markerInfos || markerInfos.length === 0) {
        markerListDiv.innerHTML = `<p class="text-gray-500">No markers available.</p>`;
        return;
    }

    // 기존 리스트 초기화
    markerListDiv.innerHTML = "";

    markerInfos.forEach((info, index) => {
        // 체크박스 컨테이너 생성
        const markerItem = document.createElement("div");
        markerItem.className = "flex items-start space-x-4 p-4 border border-gray-300 rounded-lg shadow-sm";

        // 체크박스 생성
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `marker-${index}`;
        checkbox.value = index;
        checkbox.checked = true; // 기본 선택
        checkbox.className = "mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring focus:ring-blue-500";

        // 텍스트 컨테이너
        const textContainer = document.createElement("div");
        textContainer.className = "flex-1";

        // 제목
        const label = document.createElement("label");
        label.htmlFor = `marker-${index}`;
        label.className = "block text-sm font-medium text-gray-800";
        label.innerText = `Marker ${index + 1}: ${info.addr || "No address available"}`;

        // 설명
        const description = document.createElement("p");
        description.className = "mt-1 text-sm text-gray-600";
        description.innerText = `Latitude: ${info.lat}, Longitude: ${info.lng}`;

        // 가중치 슬라이더 추가
        const weightSlider = document.createElement("input");
        weightSlider.type = "range";
        weightSlider.min = "1";
        weightSlider.max = "10";
        weightSlider.value = info.weight || 1; // 기본 가중치
        weightSlider.className = "mt-2 w-full";
        weightSlider.addEventListener("input", (event) => {
            info.weight = parseInt(event.target.value, 10); // 가중치 업데이트
            console.log(`Marker ${index + 1}: Weight updated to ${info.weight}`);
            center_point_Selected(); // 가중치 변경 시 중간 지점 재계산
        });

        textContainer.appendChild(label);
        textContainer.appendChild(description);
        textContainer.appendChild(weightSlider);

        // 요소 조합
        markerItem.appendChild(checkbox);
        markerItem.appendChild(textContainer);
        markerListDiv.appendChild(markerItem);

        // 체크박스 이벤트 핸들러
        checkbox.addEventListener("change", (event) => {
            if (event.target.checked) {
                addMarker(info.lat, info.lng, index);
            } else {
                removeMarker(index);
            }
            // 체크박스 변경 시 중간 지점 재계산
            center_point_Selected();
        });

        // 기본적으로 선택된 마커 추가
        addMarker(info.lat, info.lng, index);

        const kakaoApiUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${info.lng},${info.lat}&destination=${destinationPoint.lng},${destinationPoint.lat}&priority=RECOMMEND&road_type=1&format=json`;

        fetch(kakaoApiUrl, {
            headers: {
                Authorization: 'KakaoAK 1b60c2a21577696ea25e7753cb5786fe',
            },
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch route data.');
            }
            return response.json();
        })
        .then(routeData => {
            console.log('Route data received:', routeData);
            drawPath(map, routeData); // 경로를 지도에 그리는 함수 호출
        })
        .catch(error => {
            console.error('Error fetching route data:', error);
            alert('Failed to fetch route data.');
        });
    });
}

// 경로 그리기 함수
function drawPath(map, routeData) {
    if (!routeData || !routeData.routes || routeData.routes.length === 0) {
        alert('경로 탐색이 불가능한 지점이 있습니다.');
        return;
    }

    // 첫 번째 경로 데이터 가져오기
    const firstRoute = routeData.routes[0];
    const sections = firstRoute.sections;

    if (!sections || sections.length === 0) {
        alert('경로 탐색이 불가능한 지점이 있습니다.');
        return;
    }

    // Polyline을 그릴 좌표 배열 생성
    const path = [];
    sections.forEach(section => {
    if (section.roads && section.roads.length > 0) {
        section.roads.forEach(road => {
        if (road.vertexes && road.vertexes.length > 0) {
            // vertexes는 [경도, 위도, 경도, 위도, ...] 순서로 제공되므로, 이를 변환
            for (let i = 0; i < road.vertexes.length; i += 2) {
            const lng = road.vertexes[i];
            const lat = road.vertexes[i + 1];
            path.push(new kakao.maps.LatLng(lat, lng));
            }
        }
        });
    }
    });

    if (path.length === 0) return;

    // 매 실행마다 경로의 색상을 달라지게 함
    let r = parseInt(newColor.substring(1, 3), 16);
    let g = parseInt(newColor.substring(3, 5), 16);
    let b = parseInt(newColor.substring(5, 7), 16);

    // 이전 색상과 얼마나 차이나게 할지 결정
    r = (r - 20) % 256;
    g = (g + 40) % 256;
    b = (b + 60) % 256;

    newColor = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

    // 지도에 경로 그리기
    const polyline = new kakao.maps.Polyline({
        map: map,
        path: path, // 경로 데이터
        strokeWeight: 5, // 선 두께
        strokeColor: newColor, // 선 색상
        strokeOpacity: 0.8, // 선 투명도
        strokeStyle: 'solid', // 선 스타일
    });
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


// ==================== 함수 실행 ====================
displayMarkerList(markerInfos);
addDestinationMarker();
