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
  //채널명으로 필터링
  let filteredVideoList = videoInfoList.filter(
    (videoInfo) => videoInfo.video_channel === channelName
  );

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
                    <div>${channelInfo.subscribers} subscribers</div>
                </div>
            </div>
            <div class="subscribes__box">
                <button class="subscribes__button">SUBSCRIBES</button>
            </div>
        </div>
    `;

  channelInfoContainer.innerHTML = channelInfoItems;

  // 대표영상정보 페이지에 추가
  let masterVideo = filteredVideoList[0];
  bigVideoItem += `
                <div class="channel__big__video">
                  <video controls autoplay muted>
                    <source src='${masterVideo.video_link}' type="video/mp4" > 
                  </video>
                </div>
                <div class="big__video__info">
                    <h5>${masterVideo.video_title}</h5>
                    <p>${masterVideo.views} . ${masterVideo.upload_date}</p>
                    <p>${masterVideo.video_detail}</p>
                </div>
    
    `;

  channelBigVideoBox.innerHTML = bigVideoItem;

  // 플레이리스트 정보 페이지에 추가
  let playlistContainer = document.getElementById("playlist");
  let playlistItems = "";
  for (let i = 0; i < filteredVideoList.length; i++) {
    let videoId = filteredVideoList[i].video_id;
    let videoInfo = filteredVideoList[i];
    let videoURL = `./video?id=${videoId}"`;

    playlistItems += `
    <div class="channel__small__video__box">
      <div class="video__thumbnail">
          <img src="${filteredVideoList[i].image_link}" alt="">
      </div>
      <div class="video__info">
          <h4>${filteredVideoList[i].video_title}</h4>
          <p>${channelName}</p>
          <p>${filteredVideoList[i].views} . ${filteredVideoList[i].upload_date}</p>
      </div>
    </div>
      `;
  }

  playlistContainer.innerHTML = playlistItems;
}
