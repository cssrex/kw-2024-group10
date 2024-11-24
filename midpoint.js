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

// ==================== 함수 ====================

// 중간 지점을 계산하는 함수
function calculateCenterPoint(markerInfos) {
    /*
    if (!markerInfos || markerInfos.length === 0) {
        alert("마커 데이터가 없습니다.");
        return;
    }

    // 모든 마커의 위도와 경도를 더하여 평균을 구함
    let totalLat = 0;
    let totalLng = 0;

    markerInfos.forEach((info) => {
        totalLat += info.lat;
        totalLng += info.lng;
    });

    const centerLat = totalLat / markerInfos.length;
    const centerLng = totalLng / markerInfos.length;
    midpoint[0] = centerLat;
    midpoint[1] = centerLng;
    // 결과 출력
    displayCenterPoint(centerLat, centerLng);
    */


    /* 
        [가중치를 수정하고 싶을 때 조절할 변수들]
        thresholdMultiplier(82번 라인) : 멀리 있는 점을 판단하는 기준을 얼마나 엄격하게 할지
        weightFar(112번 라인) : 멀리 있는 점은 가중치를 얼마로 둬서 계산할지
    */

    if (!markerInfos || markerInfos.length === 0) {
        alert("마커 데이터가 없습니다.");
        return;
    }

    // 1. 중심점(평균) 계산
    const n = markerInfos.length;
    const center = markerInfos.reduce(
        (acc, point) => ({
            lat: acc.lat + point.lat / n,
            lng: acc.lng + point.lng / n,
        }),
        { lat: 0, lng: 0 }
    );

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
    // const range = Math.max(...distances) - Math.min(...distances);
    // const thresholdMultiplier = 1 + range / (meanDistance + 1e-6); // 동적 계산
    const thresholdMultiplier = 0.5; //기본 임계값
    const threshold = meanDistance + thresholdMultiplier * stdDevDistance;

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
        }
    });

    // 6. 가까운 점들의 중심 계산
    const closeCenter = closemarkerInfos.reduce(
        (acc, point) => ({
            lat: acc.lat + point.lat / closemarkerInfos.length,
            lng: acc.lng + point.lng / closemarkerInfos.length,
        }),
        { lat: 0, lng: 0 }
    );
    
    // 7. 가중치 계산
    let weightFar = 0.01; // 기본 가중치
    if (farPoint) {
        // 거리에 반비례하는 가중치 설정 (멀수록 가중치 감소)
        const maxDistance = Math.max(...distances); // 가장 큰 거리
        weightFar = 0.3 / (1 + farDistance / maxDistance); // 거리 비율에 따른 가중치
    }

    // 8. 가중치를 적용하여 중간 좌표 계산
    const weightedCenter = farPoint
        ? {
                lat:
                    (closeCenter.lat + weightFar * farPoint.lat) /
                    (1 + weightFar),
                lng:
                    (closeCenter.lng + weightFar * farPoint.lng) /
                    (1 + weightFar),
            }
        : closeCenter; // 멀리 있는 점이 없으면 가까운 점 중심 반환
    
    if(farPoint==closeCenter) console.log("동일");

    displayCenterPoint(weightedCenter.lat, weightedCenter.lng);
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

        textContainer.appendChild(label);
        textContainer.appendChild(description);

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

