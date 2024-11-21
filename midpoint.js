// app.js로부터 마커 데이터 전달 받기 (지우지 말것)
const markerInfos = JSON.parse(localStorage.getItem('markerInfos'));

/////////////////////////////////////////////////////////////
// 데이터가 제대로 전달되는지 확인용이므로 지워도 무방
// 데이터가 존재하면 표시, 없으면 오류 메시지 출력
const coordinatesDiv = document.getElementById('coordinates');
if (markerInfos && markerInfos.length > 0) {
    coordinatesDiv.innerHTML = `<pre>${JSON.stringify(markerInfos, null, 2)}</pre>`;
} else {
    coordinatesDiv.textContent = "전달받은 데이터가 없습니다.";
}
//////////////////////////////////////////////////////////////

/*
// 중간 지점을 표시할 마커를 저장할 변수
var centerMarker = null;

// 중간 지점을 계산하는 함수
function calculateCenterPoint() {
    // 모든 마커의 위도와 경도를 더하여 평균을 구함
    var totalLat = 0;
    var totalLng = 0;
    markerInfos.forEach((info) => {
        totalLat += info.marker.getPosition().getLat();
        totalLng += info.marker.getPosition().getLng();
    });

    var centerLat = totalLat / markerInfos.length;
    var centerLng = totalLng / markerInfos.length;

    // 중간 지점 위치 생성
    var centerPosition = new kakao.maps.LatLng(centerLat, centerLng);

    // 기존 중간 지점 마커가 있으면 제거
    if (centerMarker) {
        centerMarker.setMap(null);
    }

    // 새로운 중간 지점 마커 생성
    centerMarker = new kakao.maps.Marker({
        position: centerPosition,
        map: map,
        image: new kakao.maps.MarkerImage(
            './images/marker.png', // 기존 마커 이미지 사용
            new kakao.maps.Size(45, 45)
        )
    });

    // 지도를 중간 지점으로 이동
    map.setCenter(centerPosition);

    // 중간 지점 정보 표시
    updateCenterPointInfo(centerPosition);
}

// 중간 지점 정보 표시하는 함수
function updateCenterPointInfo(centerPosition) {
    var infoEl = document.getElementById("centerPointInfo");
    infoEl.innerHTML = `중간 지점: 위도 ${centerPosition.getLat()}, 경도 ${centerPosition.getLng()}`;
}

// 중간 지점 버튼 클릭 시 계산 호출
document.getElementById("calculateCenterButton").addEventListener("click", calculateCenterPoint);
*/