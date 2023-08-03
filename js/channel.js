// 처음 화면 로드 시 전체 비디오 리스트 가져오기
getVideoList().then(createVideoItem);

// 현재 주소에서 채널명 가져오기
let currentURL = window.location.href;
let url = new URL(currentURL);
let channelName = url.searchParams.get("channelName"); //채널명
// channelName = "oreumi";

// 비디오 리스트 정보
async function getVideoList() {
  let response = await fetch("http://oreumi.appspot.com/video/getVideoList");
  let videoListData = await response.json();
  return videoListData;
}

// 각 비디오 정보
async function getVideoInfo(videoId) {
  let url = `http://oreumi.appspot.com/video/getVideoInfo?video_id=${videoId}`;
  let response = await fetch(url);
  let videoData = await response.json();
  return videoData;
}

// 채널 정보
async function getChannelInfo() {
  let url = `http://oreumi.appspot.com/channel/getChannelInfo`;

  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ video_channel: channelName }),
  });

  let channelData = await response.json();
  return channelData;
}

// 채널 내 영상정보
async function getChannelVideo() {
  let response = await fetch(
    `http://oreumi.appspot.com/video/getChannelVideo?video_channel=${channelName}`
  );
  let videoListData = await response.json();
  return videoListData;
}

// 피드 내용 로드
async function createVideoItem(videoList) {
  let channelInfoContainer = document.getElementById(
    "channel__info__container"
  ); // 채널인포 컨테이너
  let channelBigVideoBox = document.getElementById("channel__big__video__box"); // 대표영상 컨테이너

  let channelInfoItems = ""; //채널인포
  let bigVideoItem = ""; //대표영상

  // 각 비디오들 정보 가져오기
  let videoInfoPromises = videoList.map((video) =>
    getVideoInfo(video.video_id)
  );
  let videoInfoList = await Promise.all(videoInfoPromises);

  //채널 정보 가져오기
  let channelInfo = await getChannelInfo();

  //채널정보 페이지에추가
  channelInfoItems += `
        <div id="banner" class="banner">
            <img src='${channelInfo.channel_banner}'></img>
        </div>
        <div class="channel__info__container">
        <div class="channel__info">
            <div class="channel__profile">
                <div class="channel__avatar">
                    <img src='${channelInfo.channel_profile}' alt="">
                </div>
                <div class="channel__profile__text">
                    <div>
                        <h2>${channelInfo.channel_name}</h2>
                    </div>
                    <div>구독자${convertViews(channelInfo.subscribers)}명</div>
                </div>
            </div>
            <div class="subscribes__box">
                <button class="subscribes__button">SUBSCRIBES</button>
            </div>
        </div>
    `;

  channelInfoContainer.innerHTML = channelInfoItems;

  //채널명으로 필터링
  let filteredVideoList = videoInfoList.filter(
    (videoInfo) => videoInfo.video_channel === channelName
  );

  // 최고 조회수 데이터를 반환하는 함수
  function getMostViewedVideo(filteredVideoList) {
    return filteredVideoList.reduce((highestViewedVideo, currentVideo) => {
      return highestViewedVideo.views > currentVideo.views
        ? highestViewedVideo
        : currentVideo;
    });
  }
  let poppularVideo = getMostViewedVideo(filteredVideoList); //채널 인기동영상

  // 업로드 순(최신순)으로 정렬하는 함수
  let sortedVideoList = filteredVideoList.sort((a, b) => {
    // "upload_date"를 Date 객체로 변환
    let dateA = new Date(a.upload_date);
    let dateB = new Date(b.upload_date);

    // 최신 날짜가 먼저 오도록 정렬
    return dateB - dateA;
  });

  // 대표영상정보 페이지에 추가
  let masterVideo = poppularVideo;
  let masterVideoId = masterVideo.video_id;
  let masterVideoUrl = `./video.html?id=${masterVideoId}`;

  bigVideoItem += `
                <div class="channel__big__video">
                  <video controls autoplay muted>
                    <source src='${masterVideo.video_link}' type="video/mp4" > 
                  </video>
                </div>
                <div class="big__video__info">
                    <a href="${masterVideoUrl}">
                      <h5>${masterVideo.video_title}</h5>
                    </a>
                    <p>조회수 ${convertViews(
                      masterVideo.views
                    )}회 • ${convertDate(masterVideo.upload_date)}</p>
                    <p>${masterVideo.video_detail}</p>
                </div>
    
    `;

  channelBigVideoBox.innerHTML = bigVideoItem;

  let playlistPlayButton = document.getElementById("playlist__play");
  playlistPlayButton.href = `${masterVideoUrl}`;

  // 플레이리스트 정보 페이지에 추가
  let playlistContainer = document.getElementById("playlist");
  let playlistItems = "";
  for (let i = 0; i < filteredVideoList.length; i++) {
    let videoInfo = sortedVideoList[i];
    let videoId = videoInfo.video_id;
    let videoURL = `./video.html?id=${videoId}"`;

    playlistItems += `
    <a href="${videoURL}">
      <div class="channel__small__video__box">
        <div class="video__thumbnail">
            <img src="${videoInfo.image_link}" alt="">
        </div>
        <div class="video__info">
          <a href="${videoURL}">
            <h4>${videoInfo.video_title}</h4>
          </a>
            <a href="#">
              <p>${channelName}</p>
            </a>
            <p>조회수 ${convertViews(videoInfo.views)}회 • ${convertDate(
      videoInfo.upload_date
    )}</p>
        </div>
      </div>
    </a>
      `;
  }

  playlistContainer.innerHTML = playlistItems;
}

// 단위 변환 함수
function convertViews(views) {
  if (views >= 10000000) {
    const converted = (views / 10000000).toFixed(1);
    return converted.endsWith(".0")
      ? converted.slice(0, -2) + "천만"
      : converted + "천만";
  } else if (views >= 1000000) {
    const converted = (views / 1000000).toFixed(1);
    return converted.endsWith(".0")
      ? converted.slice(0, -2) + "백만"
      : converted + "백만";
  } else if (views >= 10000) {
    const converted = (views / 10000).toFixed(1);
    return converted.endsWith(".0")
      ? converted.slice(0, -2) + "만"
      : converted + "만";
  } else if (views >= 1000) {
    const converted = (views / 1000).toFixed(1);
    return converted.endsWith(".0")
      ? converted.slice(0, -2) + "천"
      : converted + "천";
  } else {
    return views.toString();
  }
}

// 날짜 변환 함수
function convertDate(dateString) {
  // 파라미터로 받은 날짜를 Date 객체로 변환
  const targetDate = new Date(dateString);

  // 현재 날짜를 구하기 위해 현재 시간 기준으로 Date 객체 생성
  const currentDate = new Date();

  // 두 날짜의 시간 차이 계산 (밀리초 기준)
  const timeDifference = currentDate - targetDate;

  // 1년의 밀리초 수
  const oneYearInMilliseconds = 31536000000;

  if (timeDifference < 86400000) {
    // 하루(24시간) 기준의 밀리초 수
    return "오늘";
  } else if (timeDifference < 172800000) {
    // 이틀(48시간) 기준의 밀리초 수 (어제)
    return "어제";
  } else if (timeDifference < 604800000) {
    // 일주일(7일) 기준의 밀리초 수
    return "1주 전";
  } else if (timeDifference < oneYearInMilliseconds) {
    // 한 달 전 계산
    const currentMonth = currentDate.getMonth();
    const targetMonth = targetDate.getMonth();

    if (currentMonth === targetMonth) {
      return "1개월 전";
    } else {
      return `${currentMonth - targetMonth}개월 전`;
    }
  } else {
    return `${Math.floor(timeDifference / oneYearInMilliseconds)}년 전`;
  }
}
