// 처음 화면 로드 시 전체 비디오 리스트 가져오기

getVideoList().then(createVideoItem);

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

//채널 캐시정보 담을 객체 선언
let channelCache = {};

// 채널 정보
async function getChannelInfo(channelName) {
  // 캐시에 채널 정보가 있는지 확인
  if (channelCache[channelName]) {
    return channelCache[channelName];
  }

  let url = `http://oreumi.appspot.com/channel/getChannelInfo`;

  let response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ video_channel: channelName }),
  });

  let channelData = await response.json();

  // 캐시에 채널 정보 저장
  channelCache[channelName] = channelData;

  return channelData;
}

// 피드 비디오 리스트 로드
async function createVideoItem(videoList) {
  let feed = document.getElementById("feed");
  let feedItems = "";

  let videoInfoPromises = videoList.map((video) =>
    getVideoInfo(video.video_id)
  );
  let videoInfoList = await Promise.all(videoInfoPromises);

  for (let i = 0; i < videoList.length; i++) {
    let videoId = videoList[i].video_id;
    let videoInfo = videoInfoList[i];
    let channelInfo = await getChannelInfo(videoList[i].video_channel);

    let channelURL = `./channel.html?channelName=${videoList[i].video_channel}"`;
    let videoURL = `./video.html?id=${videoId}"`;

    feedItems += `
        <div class="feed__item">
            <a href="https://www.youtube.com/watch?v=JXl4QgYUi9c&t=1s">
                <div class="feed__item__thumbnail">
                    <img src='${videoInfo.image_link}'>
                    <div class="feed__item__timebar">01:26</div>    
                </div>
            </a>
            <div class="feed__item__info">
                <div class=""><img class="feed__item__info__avatar" src='${channelInfo.channel_profile}'> </div>
                <div class="feed__text__box">
                    <h3 class="feed__item__info__title">
                        <a href='${videoURL}'> ${videoInfo.video_title}</a>
                    </h3>
                    <a href="${channelURL}">${videoInfo.video_channel}</a>
                    <p>${videoInfo.views}.${videoInfo.upload_date}</p>
                </div>
            </div>
        </div>
    `;
  }

  // 화면에 추가
  feed.innerHTML = feedItems;
}

let searchButton = document.getElementById("search__button");
let searchBox = document.getElementById("search__box");

// 검색 버튼 클릭 시 필터링 실행
searchButton.addEventListener("click", function () {
  let searchKeyword = searchBox.value;
  getVideoList().then((videoList) => {
    let filteredVideoList = videoList.filter((video) =>
      video.video_title.toLowerCase().includes(searchKeyword.toLowerCase())
    );
    createVideoItem(filteredVideoList);
  });
});

searchBox.addEventListener("keypress", function (event) {
  // 엔터 키의 키 코드 = 13
  if (event.keyCode === 13) {
    let searchKeyword = searchBox.value;
    getVideoList().then((videoList) => {
      let filteredVideoList = videoList.filter((video) =>
        video.video_title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      createVideoItem(filteredVideoList);
    });
  }
});
