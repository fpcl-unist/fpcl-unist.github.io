(async function () {
  'use strict';
  var status = document.getElementById('status');
  try {
    if (location.protocol === 'file:') {
      status.textContent = '관리 화면은 웹 주소에서 열어야 합니다. 로컬 확인은 홈페이지 폴더에서 python3 -m http.server 8000 실행 후 http://localhost:8000/adm/ 에 접속해 주세요.';
      return;
    }
    var response = await fetch('connection.json', {cache:'no-store'});
    if (!response.ok) throw new Error('연결 설정을 읽을 수 없습니다.');
    var connection = await response.json();
    if (!connection.repo || !connection.base_url) {
      status.textContent = '초기 연결 대기 중입니다. GitHub 저장소와 로그인 인증 서비스를 연결하면 이 주소에서 관리자 로그인을 사용할 수 있습니다. 현재 온라인 저장 기능은 활성화되지 않았습니다.';
      return;
    }
    if (!/^[\w.-]+\/[\w.-]+$/.test(connection.repo) || !connection.branch ||
        new URL(connection.base_url).protocol !== 'https:') {
      throw new Error('GitHub 저장소, 브랜치, HTTPS 인증 서비스 주소를 확인해 주세요.');
    }
    if (!window.CMS || !window.JSON5) throw new Error('관리 도구를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.');
    CMS.registerCustomFormat('fpcl-js', 'js', window.FPCLAdminFormat);
    CMS.init({config:window.FPCLAdminConfig(connection)});
    document.getElementById('setup').hidden = true;
  } catch (error) {
    status.textContent = error.message;
  }
})();
