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
        // 각 데이터들을 콘솔에 출력
        console.log(response.video_id);
        console.log(response.image_link);
        console.log(response.upload_date);
        console.log(response.video_channel);
        console.log(response.video_detail);
        console.log(response.video_link);
        console.log(response.video_tag);
        console.log(response.video_title);
        console.log(response.views);

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
