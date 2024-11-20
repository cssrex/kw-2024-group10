// 주소 선택 우선순위 도로명 주소 -> 지번 주소 -> 근처 가장 가까운 주소 -> 주소 없음

var mapContainer = document.getElementById('map'), // 지도를 표시할 div  
    mapOption = {
        center: new kakao.maps.LatLng(37.619623, 127.059799), // 지도의 중심좌표
        level: 3 // 지도의 확대 레벨
    };

var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

// html 요소 참조
var markerListEl = document.getElementById("markerList");

// kakao Geocoder 객체 생성
var geocoder = new kakao.maps.services.Geocoder();

// 마커 정보를 저장할 배열
var markerInfos = [];

// 이미지 마커의 옵션을 설정
var imageSrc = './images/marker.png'; // 마커 이미지의 경로
var imageSize = new kakao.maps.Size(45, 45); // 마커 이미지의 크기
var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

// 지도를 클릭했을때 클릭한 위치에 마커를 추가하도록 지도에 클릭이벤트를 등록합니다
kakao.maps.event.addListener(map, 'click', function (mouseEvent) {
    // 클릭한 위치의 도로명 주소를 가져옵니다
    var coord = mouseEvent.latLng;
    // 좌표 기준으로 도로명 주소 먼저 요청
    geocoder.coord2Address(coord.getLng(), coord.getLat(), function (result, status) {
        if (status === kakao.maps.services.Status.OK) {
            var roadAddress = result[0].road_address ? result[0].road_address.address_name : null;
            var jibunAddress = result[0].address ? result[0].address.address_name : null;

            // 도로명 주소 또는 지번 주소가 없으면 주변 장소 검색
            if (!roadAddress && !jibunAddress) {
                searchNearbyPlaces(coord); // 근처 장소 검색 함수 호출
            } else {
                addMarker(coord, roadAddress || jibunAddress || "주소 정보 없음");
            }
        } else {
            searchNearbyPlaces(coord); // 도로명 주소 요청 실패 시 근처 장소 검색
        }
    });
});

// 근처 장소 검색 함수
function searchNearbyPlaces(coord) {
    ps.categorySearch('FD6', function (data, status) {
        if (status === kakao.maps.services.Status.OK && data.length > 0) {
            // 가장 가까운 장소의 도로명 주소 또는 지번 주소 가져오기
            var place = data[0];
            var address = place.road_address_name || place.address_name || "주소 정보 없음";

            // 마커 추가
            addMarker(new kakao.maps.LatLng(place.y, place.x), address);
        } else {
            alert("주변 장소를 찾을 수 없습니다.");
        }
    }, {
        location: coord, // 클릭한 좌표를 기준으로 검색
        radius: 50 // 검색 반경 (단위: 미터)
    });
}

// 지도에 표시된 마커 객체를 가지고 있을 배열입니다
var markers = [];
// 검색 기능 관련
var ps = new kakao.maps.services.Places();

// 마커를 생성하고 지도위에 표시하는 함수입니다
function addMarker(position, roadAddress) {
    if (markerInfos.length >= 10) {
        alert("최대 10개의 마커만 추가할 수 있습니다.");
        return;
    }

    // 마커를 생성합니다
    var marker = new kakao.maps.Marker({
        position: position,
        image: markerImage
    });

    // 마커가 지도 위에 표시되도록 설정합니다
    marker.setMap(map);

    // 배열에 마커 정보 추가
    markerInfos.push({
        marker: marker,
        roadAddress: roadAddress
    });

    // 생성된 마커 클릭 시 마커를 제거
    kakao.maps.event.addListener(marker, 'click', function () {
        marker.setMap(null); // 마커를 지도에서 제거합
        // 배열에서 마커 제거
        markerInfos = markerInfos.filter(info => info.marker !== marker);
        updateMarkerList();
    });

    // 리스트 업데이트
    updateMarkerList();
}

updateMarkerList();

// 마커 리스트를 업데이트하는 함수
function updateMarkerList() {
    markerListEl.innerHTML = ""; // 리스트 초기화

    if (markerInfos.length === 0) {
        // 빈 리스트에 예외 메시지 출력
        var emptyMessage = document.createElement("li");
        emptyMessage.textContent = "클릭한 위치에 마커가 표시됩니다!";
        markerListEl.appendChild(emptyMessage);
        return;
    }

    markerInfos.forEach((info, index) => {
        var li = document.createElement("li");
        li.textContent = `${index + 1}. ${info.roadAddress}`;
        markerListEl.appendChild(li);
    });
}

// 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
function setMarkers(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

// 검색 내용 저장할 배열
var searchMarkers = [];

// 엔터키 클릭이벤트 처리
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        searchPlaces();
    }
}

function searchPlaces() {
    var keyword = document.getElementById('keyword').value;

    if (!keyword.trim()) {
        alert('검색어를 입력해주세요!');
        return;
    }

    removeAllOverlays();

    // 검색 결과 목록 초기화
    document.getElementById('placesList').style.display = 'block'; // 목록 보이게 하기
    ps.keywordSearch(keyword, placesSearchCB);
}

function placesSearchCB(data, status, pagination) {
    // 이전에 생성된 마커를 제거
    removeSearchMarkers();

    // 검색 결과가 있으면 목록을 표시
    if (status === kakao.maps.services.Status.OK) {
        displayPlaces(data);

        // 검색된 장소에 번호 마커 추가
        for (var i = 0; i < data.length; i++) {
            displaySearchMarker(data[i], i + 1); // i + 1로 인덱스 값을 전달
        }
    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {
        alert('검색 결과가 없습니다.');
    } else if (status === kakao.maps.services.Status.ERROR) {
        alert('검색 중 오류가 발생했습니다.');
    }
}

function displayPlaces(places) {
    var listEl = document.getElementById('placesList');
    listEl.innerHTML = '';
    removeSearchMarkers();

    for (var i = 0; i < places.length; i++) {
        var itemEl = document.createElement('div');
        itemEl.className = 'placeItem';
        itemEl.innerHTML = `
                    <span class="markerbg" style="background-position: 0 -${i * 46}px;"></span>
                    <div class="info">
                        <h5>${places[i].place_name}</h5>
                        <span class="gray">${places[i].road_address_name || places[i].address_name}</span><br>
                        <span class="tel">${places[i].phone || '전화번호 없음'}</span>
                    </div>
                `;

        itemEl.onclick = (function (place) {
            return function () {
                map.setCenter(new kakao.maps.LatLng(place.y, place.x));

                removeAllOverlays();

                // CustomOverlay 내용과 스타일 지정
                var content = `
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
                        ${place.place_name}
                    </div>
                `;

                // CustomOverlay 생성
                var overlay = new kakao.maps.CustomOverlay({
                    content: content,
                    map: map,
                    position: new kakao.maps.LatLng(place.y, place.x),
                    yAnchor: -0.3, // 마커의 아래쪽에 표시되도록 설정
                    xAnchor: 0.55,
                });

                overlays.push(overlay);
            };
        })(places[i]);

        listEl.appendChild(itemEl);
    }
}

var overlays = [];

// 모든 Overlay를 제거하는 함수
function removeAllOverlays() {
    for (var i = 0; i < overlays.length; i++) {
        overlays[i].setMap(null);
    }
    overlays = [];
}

function displaySearchMarker(place, index) {
    var marker = new kakao.maps.Marker({
        map: map,
        position: new kakao.maps.LatLng(place.y, place.x),
        image: new kakao.maps.MarkerImage(
            'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png',
            new kakao.maps.Size(45, 45),
            { spriteOrigin: new kakao.maps.Point(0, (index - 1) * 46), spriteSize: new kakao.maps.Size(36, 691) } // 수정된 부분
        )
    });

    // 마커 클릭 시 마커를 일반 마커로 교체하고 검색창을 초기화합니다.
    kakao.maps.event.addListener(marker, 'click', function () {
        document.getElementById('keyword').value = ''; // 검색창 초기화

        // 도로명 주소 또는 지번 주소 확인
        var roadAddress = place.road_address_name || null;
        var jibunAddress = place.address_name || null;

        if (!roadAddress && !jibunAddress) {
            // 도로명 주소와 지번 주소 모두 없을 경우, 근처 장소 검색
            searchNearbyPlaces(new kakao.maps.LatLng(place.y, place.x));
        } else {
            // 도로명 주소 또는 지번 주소 중 하나 사용
            var displayAddress = roadAddress || jibunAddress || "주소 정보 없음";
            addMarker(marker.getPosition(), displayAddress); // 해당 위치에 일반 마커 표시
        }

        marker.setMap(null); // 번호 마커는 지도에서 제거
        document.getElementById('placesList').style.display = 'none'; // 검색 결과 목록 숨기기
        removeSearchMarkers();
        removeAllOverlays();
    });

    searchMarkers.push(marker);
}

function removeSearchMarkers() {
    for (var i = 0; i < searchMarkers.length; i++) {
        searchMarkers[i].setMap(null);
    }
    searchMarkers = [];
}