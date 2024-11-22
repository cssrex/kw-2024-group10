// ==================== 변수 ====================
// app.js로부터 마커 데이터 전달 받기 (지우지 말것)
const markerInfos = JSON.parse(localStorage.getItem('markerInfos'));

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

    // 결과 출력
    displayCenterPoint(centerLat, centerLng);
}

// 중간 지점을 출력하는 함수
function displayCenterPoint(lat, lng) {
    // HTML 요소로 중간 지점 표시
    const infoEl = document.getElementById("centerPointInfo");
    infoEl.innerHTML = `중간 지점: 위도 ${lat}, 경도 ${lng}`;

    // Kakao 지도에 마커 추가
    const centerPosition = new kakao.maps.LatLng(lat, lng);
    const centerMarker = new kakao.maps.Marker({
        position: centerPosition,
        map: window.map, // result.html에서 초기화된 Kakao 지도 객체
    });

    // 지도의 중심을 중간 지점으로 이동
    map.setCenter(centerPosition);
}

// ==================== 함수 호출 ====================

// 페이지 로드 시 중간 지점 계산
calculateCenterPoint(markerInfos);

// 중간 지점 계산 버튼 이벤트 연결
document.getElementById("calculateCenterButton").addEventListener("click", () => {
    calculateCenterPoint(markerInfos);
});
