function createVideoItem(video_id) {
  // XMLHttpRequest 객체 생성
  let xhr = new XMLHttpRequest();

  // API 요청 설정
  let apiUrl = `http://oreumi.appspot.com/video/getVideoInfo?video_id=${video_id}`;
  xhr.open("GET", apiUrl, true);

  // 응답 처리 설정
  xhr.onreadystatechange = function () {
    if (xhr.readyState === xhr.DONE && xhr.status === 200) {
      // 가져온 응답 처리
      let response = JSON.parse(xhr.responseText);

      // 데이터 있는지 확인
      if (response && response.video_id !== undefined) {
        let image_link = response.image_link;
        let upload_date = response.upload_date;
        let video_channel = response.video_channel;
        let video_detail = response.video_detail;
        let video_id = response.video_id;
        let video_link = response.video_link;
        let video_tag = response.video_tag;
        let video_title = response.video_title;
        let views = response.views;

        // html에 요소 넣기
        let videoContainer = document.createElement("div");

        let videoTitle = document.createElement("h2");
        videoTitle.textContent = video_title;
        videoContainer.appendChild(videoTitle);

        let videoImage = document.createElement("img");
        videoImage.src = image_link;
        videoContainer.appendChild(videoImage); //

        let videoChannel = document.createElement("p");
        videoChannel.textContent = video_channel;
        videoContainer.appendChild(videoChannel);

        let videoViews = document.createElement("p");
        videoViews.textContent = "조회수" + views + "회";
        videoContainer.appendChild(videoViews);

        // FEED에 넣기
        let feed = document.getElementById("feed");
        feed.appendChild(videoContainer);

        // 다음 video_id로 재귀 호출
        createVideoItem(video_id + 1);
      }
    }
  };

  // 요청 전송
  xhr.send();
}

// id = 0부터 아이템 불러오기
createVideoItem(0);
