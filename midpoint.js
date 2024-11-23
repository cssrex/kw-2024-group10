// ==================== 변수 ====================
// app.js로부터 마커 데이터 전달 받기 (지우지 말것)
const markerInfos = JSON.parse(localStorage.getItem('markerInfos'));
var midpoint = [];
// 중간 지점 마커 저장 변수
let centerMarker = null;
// 마커 저장 배열
let markers = [];
// ==================== 함수 ====================

// 중간 지점을 계산하는 함수
function calculateCenterPoint(markerInfos) {
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
        markerListDiv.innerHTML = "마커 데이터가 없습니다.";
        return;
    }

    // 기존 리스트 초기화
    markerListDiv.innerHTML = "<h3>마커 리스트</h3>";

    // 체크박스 리스트 생성
    markerInfos.forEach((info, index) => {
        const markerItem = document.createElement("div");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = `marker-${index}`;
        checkbox.value = index;
        checkbox.checked = true;
        const label = document.createElement("label");
        label.htmlFor = `marker-${index}`;
        label.innerText = `마커 ${index + 1}: ${info.addr === undefined ? "주소들어갈 공간" : info.addr}`;

        markerItem.appendChild(checkbox);
        markerItem.appendChild(label);
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

// 페이지 로드 시 중간 지점 계산
calculateCenterPoint(markerInfos);
// 넘어온 마커들 화면에 display
displayMarkerList(markerInfos);

console.log(midpoint);

