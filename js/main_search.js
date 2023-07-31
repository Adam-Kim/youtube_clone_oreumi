function createVideoItem(video_id, searchKeyword = "") {
  
  // XMLHttpRequest 객체 생성
  let xhr = new XMLHttpRequest();

  // API 요청 설정
  let apiUrl = `http://oreumi.appspot.com/video/getVideoInfo?video_id=${video_id}`;
  xhr.open("GET", apiUrl, true);

  // 응답 처리 설정
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      
      // 가져온 응답 처리
      let response = JSON.parse(xhr.responseText);
      
      // 데이터 있는지 확인
      if (response !== undefined) {
        let image_link = response.image_link;
        let upload_date = response.upload_date;
        let video_channel = response.video_channel;
        let video_detail = response.video_detail;
        let video_id = response.video_id;
        let video_link = response.video_link;
        let video_tag = response.video_tag;
        let video_title = response.video_title;
        let views = response.views;

        // 검색어가 있을 경우, 검색어와 영상 제목을 비교하여 일치하지 않으면 함수 종료
        if (
          searchKeyword &&
          video_title.toLowerCase().indexOf(searchKeyword) === -1
          ) {
            createVideoItem(video_id + 1, searchKeyword);
            return;
          }
          
        //재귀호출
        createVideoItem(video_id + 1, searchKeyword);
          

        /*검색어와 영상 제목이 일치하거나 검색어가 없으면 화면에 영상 추가*/

        // 채널 데이터를 가져오기 위해 POST 요청
        let channelApiUrl = "http://oreumi.appspot.com/channel/getChannelInfo";
        let channelXhr = new XMLHttpRequest();
        channelXhr.open("POST", channelApiUrl, true);
        channelXhr.setRequestHeader("Content-Type", "application/json");

        // post 요청에 JSON 데이터 넣기
        let postData = JSON.stringify({
          video_channel: response.video_channel,
        });
        channelXhr.onreadystatechange = function () {
          if (
            channelXhr.readyState === XMLHttpRequest.DONE &&
            channelXhr.status === 200
          ) {
            let channelResponse = JSON.parse(channelXhr.responseText);

            // 채널 데이터를 받아와서 처리하는 로직 추가
            if (channelResponse) {

              
              let channel_profile = channelResponse.channel_profile;

              // html에 요소 넣기
              // 컨테이너 생성
              let videoContainer = document.createElement("div");
              videoContainer.classList.add("feed__item");

              // 컨테이너 전체 감싸는 링크태그
              let link = document.createElement("a");
              link.href = video_link;

              // 썸네일
              let thumbnailDiv = document.createElement("div");
              thumbnailDiv.classList.add("feed__item__thumbnail");

              let thumbnailImage = document.createElement("img");
              thumbnailImage.src = image_link;
              thumbnailDiv.appendChild(thumbnailImage);

              // 재생시간
              let timeBar = document.createElement("div");
              timeBar.classList.add("feed__item__timebar");
              timeBar.textContent = "01:26"; //영상시간으로 바꿔야함
              thumbnailDiv.appendChild(timeBar);

              link.appendChild(thumbnailDiv);
              videoContainer.appendChild(link);

              // 영상 정보
              let infoDiv = document.createElement("div");
              infoDiv.classList.add("feed__item__info");

              let channelImgDiv = document.createElement("div");
              let textDiv = document.createElement("div");
              infoDiv.appendChild(channelImgDiv);
              infoDiv.appendChild(textDiv);

              // 채널프로필
              let channelProfile = document.createElement("img");
              channelImgDiv.appendChild(channelProfile);
              channelProfile.classList.add("feed__item__info__avatar");
              channelProfile.src = channel_profile;

              // 영상제목
              let videoTitleLink = document.createElement("a");
              videoTitleLink.href = video_link;
              let videoTitle = document.createElement("h3");
              videoTitle.classList.add("feed__item__info__title");
              videoTitle.textContent = video_title;
              videoTitleLink.appendChild(videoTitle);
              textDiv.appendChild(videoTitleLink);

              //채널명
              let channelLink = document.createElement("a");
              channelLink.href = `./channel?video_channel=${video_channel}`;
              channelLink.textContent = video_channel;
              textDiv.appendChild(channelLink);

              // 조회수
              let viewsInfo = document.createElement("p");
              viewsInfo.textContent = views + " Views · " + upload_date;
              textDiv.appendChild(viewsInfo);

              videoContainer.appendChild(infoDiv);

              // FEED에 컨테이너 추가
              let feed = document.getElementById("feed");
              feed.appendChild(videoContainer);

              // 재귀호출
              
            }
          }
        };
        // 채널 데이터 요청 전송
        channelXhr.send(postData);
      }
    }
  };

  // 요청 전송
  xhr.send();
}
// 페이지 접속시 모든 영상 로드
createVideoItem(0);

// 검색
function searchVideo(searchKeyword) {
  // FEED를 초기화해서 기존 영상들을 모두 지우기
  let feed = document.getElementById("feed");
  feed.innerHTML = "";

  // id = 0부터 아이템 불러오기
  createVideoItem(0, searchKeyword.toLowerCase());
}

// 버튼 클릭 시 searchVideo 함수 호출
let searchButton = document.getElementById("search__button");
let searchBox = document.getElementById("search__box");

searchButton.addEventListener("click", function () {
  let searchKeyword = searchBox.value;
  searchVideo(searchKeyword);
});

// 엔터 키를 눌렀을 때 searchVideo 함수 호출
searchBox.addEventListener("keypress", function (event) {
  // 엔터 키의 키 코드는 13입니다.
  if (event.keyCode === 13) {
    let searchKeyword = searchBox.value;
    searchVideo(searchKeyword);
  }
});
