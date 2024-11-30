//한 명이 멀리 떨어져 있다면 해당 인원은 가중치를 낮춰서 중간 지점을 계산해주는 코드

// ==================== 변수 ====================
// app.js로부터 마커 데이터 전달 받기 (지우지 말것)
const markerInfos = JSON.parse(localStorage.getItem('markerInfos'));


// ==================== 함수 ====================

// 중간 지점을 계산하는 함수
function calculateWeightedCenter(markerInfos) {
    /* 
        [가중치를 수정하고 싶을 때 조절할 변수들]
        thresholdMultiplier(47번 라인) : 멀리 있는 점을 판단하는 기준을 얼마나 엄격하게 할지
        weightFar(78번 라인) : 멀리 있는 점은 가중치를 얼마로 둬서 계산할지
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

    if (farPoint == closeCenter) console.log("동일");

    displayCenterPoint(weightedCenter.lat, weightedCenter.lng);
}

// 중간 지점을 출력하는 함수
function displayCenterPoint(lat, lng) {
    // HTML 요소로 중간 지점 표시
    const infoEl = document.getElementById("centerPointInfo");
    infoEl.innerHTML = `중간 지점: 위도 ${lat}, 경도 ${lng}`;

    // 마커 이미지 설정 (app.js와 동일)
    const imageSrc = './images/marker.png'; // 마커 이미지 경로
    const imageSize = new kakao.maps.Size(45, 45); // 마커 이미지 크기
    const imageOption = { offset: new kakao.maps.Point(22, 45) }; // 앵커 포인트 설정
    const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

    // Kakao 지도에 마커 추가
    const centerPosition = new kakao.maps.LatLng(lat, lng);
    const centerMarker = new kakao.maps.Marker({
        position: centerPosition,
        image: markerImage, // 마커 이미지 적용
        map: window.map, // result.html에서 초기화된 Kakao 지도 객체
    });

    // 지도의 중심을 중간 지점으로 이동
    map.setCenter(centerPosition);
}


// ==================== 함수 호출 ====================

// 페이지 로드 시 중간 지점 계산
calculateWeightedCenter(markerInfos);

// 중간 지점 계산 버튼 이벤트 연결
document.getElementById("calculateCenterButton").addEventListener("click", () => {
    calculateWeightedCenter(markerInfos);
});
