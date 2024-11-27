// ==================== 변수 ====================
// app.js로부터 마커 데이터 전달 받기 (지우지 말것)
const markerInfos = JSON.parse(localStorage.getItem('markerInfos'));
var midpoint = [];
// 중간 지점 마커 저장 변수
let centerMarker = null;
// 마커 저장 배열
let markers = [];

// 태그 이름 목록
const tags = ['Tag 1', 'Tag 2', 'Tag 3', 'Tag 4', 'Tag 5'];

// 태그을 추가할 컨테이너
const tagButtonsContainer = document.getElementById('tagButtons');
// 사이드바
const sidebar = document.getElementById('sidebar');

// 가중치 적용 여부 (기본값: 사용하지 않음)
let useWeights = false;


// ==================== 함수 ====================

// 신발끈 공식으로 다각형의 면적 계산
function calculatePolygonArea(coords) {
    let area = 0;
    const n = coords.length;

    for (let i = 0; i < n; i++) {
        const x1 = coords[i].lng;
        const y1 = coords[i].lat;
        const x2 = coords[(i + 1) % n].lng; // 마지막 좌표 이후 첫 번째로 순환
        const y2 = coords[(i + 1) % n].lat;

        area += x1 * y2 - x2 * y1;
    }

    return Math.abs(area) / 2; // 절댓값으로 면적 반환
}

// 신발끈 공식으로 다각형의 무게중심 계산
function calculateCentroid(coords) {
    let cx = 0, cy = 0;
    const n = coords.length;
    const area = calculatePolygonArea(coords);

    if (area === 0) {
        alert("유효하지 않은 다각형입니다.");
        return null;
    }

    for (let i = 0; i < n; i++) {
        const x1 = coords[i].lng;
        const y1 = coords[i].lat;
        const x2 = coords[(i + 1) % n].lng;
        const y2 = coords[(i + 1) % n].lat;

        const crossProduct = x1 * y2 - x2 * y1;
        cx += (x1 + x2) * crossProduct;
        cy += (y1 + y2) * crossProduct;
    }

    cx = cx / (6 * area);
    cy = cy / (6 * area);

    return { lat: cy, lng: cx };
}

// 좌표를 중심 기준으로 정렬
function sortCoordinates(coords) {
    const center = coords.reduce(
        (acc, point) => ({
            lat: acc.lat + point.lat / coords.length,
            lng: acc.lng + point.lng / coords.length,
        }),
        { lat: 0, lng: 0 }
    );

    return coords.sort((a, b) => {
        const angleA = Math.atan2(a.lat - center.lat, a.lng - center.lng);
        const angleB = Math.atan2(b.lat - center.lat, b.lng - center.lng);
        return angleA - angleB; // 반시계 방향 정렬
    });
}

// 중간 지점 계산 함수
function calculateCenterPoint(markerInfos) {
    if (!markerInfos || markerInfos.length === 0) {
        alert("마커 데이터가 없습니다.");
        return;
    }

    // 마커가 1개일 경우 해당 마커 위치로 중간 지점 설정
    if (markerInfos.length === 1) {
        const centerLat = markerInfos[0].lat;
        const centerLng = markerInfos[0].lng;
        displayCenterPoint(centerLat, centerLng); // 지도에 표시
        return;
    }

    // 가중치를 사용하는 경우
    let totalWeight = 0;
    let weightedLatSum = 0;
    let weightedLngSum = 0;

    markerInfos.forEach(marker => {
        const weight = marker.weight || 1; // 가중치가 없으면 기본값 1
        totalWeight += weight;
        weightedLatSum += marker.lat * weight;
        weightedLngSum += marker.lng * weight;
    });

    const centerLat = weightedLatSum / totalWeight;
    const centerLng = weightedLngSum / totalWeight;
    displayCenterPoint(centerLat, centerLng); // 지도에 표시
    return;


    // 마커가 2개일 경우 단순 평균 계산
    if (markerInfos.length === 2) {
        const centerLat = (markerInfos[0].lat + markerInfos[1].lat) / 2;
        const centerLng = (markerInfos[0].lng + markerInfos[1].lng) / 2;
        displayCenterPoint(centerLat, centerLng); // 지도에 표시
        return;
    }

    // 마커가 3개 이상일 경우 다각형 무게중심 계산
    if (markerInfos.length >= 3) {
        const sortedCoords = sortCoordinates(markerInfos); // 좌표 정렬
        const centroid = calculateCentroid(sortedCoords); // 무게중심 계산

<<<<<<< HEAD
    // 2. 각 점에서 중심까지의 거리 계산
    const distances = markerInfos.map(point =>
        Math.sqrt((point.lat - center.lat) ** 2 + (point.lng - center.lng) ** 2)
    );

    // 3. 평균 거리와 표준편차 계산
    const meanDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const stdDevDistance = Math.sqrt(
        distances.reduce((sum, d) => sum + (d - meanDistance) ** 2, 0) / distances.length
    );

    // 4. 멀리 있는 위치라는 것을 판단할 임계값 설정
    const range = Math.max(...distances) - Math.min(...distances);
    const thresholdMultiplier = 1 + range / (meanDistance + 1e-6); // 동적 계산
    //const thresholdMultiplier = 0.5; //기본 임계값
    const threshold = meanDistance + thresholdMultiplier * 5 * stdDevDistance;

    // 5. 가까운 점 그룹과 멀리 있는 점 분류
    const closemarkerInfos = [];
    let farPoint = null;
    let farDistance = 0;

    markerInfos.forEach((point, index) => {
        if (distances[index] > threshold) {
            farPoint = point; // 멀리 있는 점 (하나만 있다고 가정)
            farDistance = distances[index]; // 해당 점의 거리
        } else {
            closemarkerInfos.push(point); // 가까운 점 그룹
=======
        if (centroid) {
            displayCenterPoint(centroid.lat, centroid.lng); // 지도에 표시
>>>>>>> 5cb240d (Changed Algorithm)
        }
    }
}

// 중간 지점 마커 표시
function displayCenterPoint(lat, lng) {
    if (centerMarker) {
        centerMarker.setMap(null);
    }

    const imageSrc = './images/marker.png'; // 마커 이미지 경로
    const imageSize = new kakao.maps.Size(45, 45);
    const imageOption = { offset: new kakao.maps.Point(22, 45) };
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    const centerPosition = new kakao.maps.LatLng(lat, lng);
    centerMarker = new kakao.maps.Marker({
        position: centerPosition,
        image: markerImage,
        map: window.map,
    });

    map.setCenter(centerPosition); // 지도의 중심 이동
}

// 중간 지점을 출력하는 함수
function displayCenterPoint(lat, lng) {
    // 기존 중간 지점 마커 제거
    if (centerMarker) {
        centerMarker.setMap(null);
    }

    // 마커 이미지 설정 (app.js와 동일)
    const imageSrc = './images/marker.png'; // 마커 이미지 경로
    const imageSize = new kakao.maps.Size(45, 45); // 마커 이미지 크기
    const imageOption = { offset: new kakao.maps.Point(22, 45) }; // 앵커 포인트 설정
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    // Kakao 지도에 새로운 중간 지점 마커 추가
    const centerPosition = new kakao.maps.LatLng(lat, lng);
    centerMarker = new kakao.maps.Marker({
        position: centerPosition,
        image: markerImage, // 마커 이미지 적용
        map: window.map, // Kakao 지도 객체
    });

    // 지도의 중심을 중간 지점으로 이동
    map.setCenter(centerPosition);
}

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
    });
}
// 지도에 마커 추가
function addMarker(lat, lng, index) {
    const markerPosition = new kakao.maps.LatLng(lat, lng);
    const marker = new kakao.maps.Marker({
        position: markerPosition,
        map: map,
    });
    kakao.maps.event.addListener(marker, 'click', () => {
        const checkbox = document.getElementById(`marker-${index}`);
        if (checkbox) {
            checkbox.checked = !checkbox.checked; // 체크박스 상태 반전
            if (checkbox.checked) {
                addMarker(lat, lng, index);
            } else {
                removeMarker(index);
            }
            center_point_Selected(); // 중간 지점 재계산
        }
    });

    // 마커 배열에 저장
    markers[index] = marker;
}

// 지도에서 마커 제거
function removeMarker(index) {
    if (markers[index]) {
        markers[index].setMap(null); // 지도에서 제거
        markers[index] = null; // 배열에서 제거
    }
}
function center_point_Selected() {
    // 선택된 마커만 필터링
    const selectedMarkers = [];
    markerInfos.forEach((info, index) => {
        const checkbox = document.getElementById(`marker-${index}`);
        if (checkbox && checkbox.checked) {
            selectedMarkers.push(info);
        }
    });

    // 선택된 마커가 없으면 중간 지점 제거
    if (selectedMarkers.length === 0) {
        if (centerMarker) {
            centerMarker.setMap(null);
            centerMarker = null;
        }
        alert("선택된 마커가 없습니다.");
        return;
    }

    // 선택된 마커로 중간 지점 계산
    calculateCenterPoint(selectedMarkers);
}



// ==================== 함수 호출 ====================
// Kakao 지도 초기화
var mapContainer = document.getElementById('map'), // 지도를 표시할 div
    mapOption = {
        center: new kakao.maps.LatLng(37.566680, 126.978640), // 서울 시청을 초기 중심 좌표로 설정
        level: 3 // 확대 레벨
    };

window.map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다


// 태그 동적 생성
tags.forEach((tagName) => {
    // 버튼 요소 생성
    const button = document.createElement('button');
    button.className =
        'rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    button.textContent = tagName;

    // 버튼 클릭 이벤트 추가 (필요 시)
    button.addEventListener('click', () => {
        /* 
        
        여기에 추가 하시면 돼욤
        태그 클릭시 핸들러 
        
        */
    });

    // 컨테이너에 버튼 추가
    tagButtonsContainer.appendChild(button);
});

const toggleButton = document.getElementById('toggleButton');
const toggleIcon = document.getElementById('toggleIcon');

// 버튼 클릭 이벤트 처리
toggleButton.addEventListener('click', () => {
    if (sidebar.classList.contains('hidden')) {
        // 사이드바 열기
        sidebar.classList.remove('hidden');
        toggleButton.style.left = '300px'; // 버튼 위치 조정
        toggleIcon.src = './images/sidebar_toggle_left.png'; // 아이콘 변경
    } else {
        // 사이드바 닫기
        sidebar.classList.add('hidden');
        toggleButton.style.left = '0'; // 버튼 위치 조정
        toggleIcon.src = './images/sidebar_toggle_right.png'; // 아이콘 변경
    }
});


// 페이지 로드 시 중간 지점 계산
calculateCenterPoint(markerInfos);
// 넘어온 마커들 화면에 display
displayMarkerList(markerInfos);

console.log(midpoint);
