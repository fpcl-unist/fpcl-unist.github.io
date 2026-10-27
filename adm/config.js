(function () {
  'use strict';
  function papers(name, label, conference) {
    return {
      name: name, label: label, widget: 'list', collapsed: true,
      summary: '{{fields.group}} · {{fields.title}}', add_to_top: true,
      label_singular: conference ? '발표' : '논문', default: [],
      hint: '최신 항목이 위에 오도록 정렬해 주세요. 같은 연도끼리 모아 주세요.',
      fields: [
        {name:'group', label:'연도 / 구분', widget:'string', hint:'예: 2026 또는 Before UNIST'},
        {name:'authors', label:'저자', widget:'string'},
        {name:'title', label:'제목', widget:'text', hint:'필요하면 <i>, <sub>, <sup> 태그를 사용할 수 있습니다.'},
        {name:'journal', label:conference ? '학회명' : '저널명 / 게재 상태', widget:'string'},
        {name:'details', label:conference ? '장소 · 행사 날짜' : '권 · 호 · 페이지 · 연도', widget:'string', required:false},
        {name:'link', label:'DOI / 원문 링크', widget:'string', required:false,
          pattern:['^https?://[^\\s]+$|^$', 'http:// 또는 https://로 시작하는 주소를 입력해 주세요.']}
      ]
    };
  }
  function collection(name, label, file, fields) {
    return {
      name:name, label:label, format:'fpcl-js', extension:'js', editor:{preview:false},
      files:[{name:name, label:label + ' 편집', file:file, format:'fpcl-js', fields:fields}]
    };
  }
  function members(name, label, student) {
    return {
      name:name, label:label, widget:'list', collapsed:true, default:[],
      summary:'{{fields.name}} · {{fields.position}}', label_singular:'구성원',
      hint:student ? '과정을 선택하면 Student 페이지의 해당 구역에 표시됩니다. 같은 과정 안의 순서는 이 목록 순서입니다.' : '목록 순서대로 표시됩니다.',
      fields:[
        {name:'name', label:'영문 이름', widget:'string'},
        student ? {name:'position', label:'과정 / 장학생 구분', widget:'select', options:[
          'Ph.D. Student', 'Combined M.S./Ph.D. Student', 'M.S. Student', 'M.S. Student (LG전자 일반장학생)'
        ]} : {name:'position', label:'직책', widget:'string'},
        {name:'email', label:'이메일', widget:'string'},
        {name:'period', label:'재학 / 재직 기간', widget:'string'},
        {name:'research', label:'연구주제', widget:'list', default:[], required:false, label_singular:'연구주제',
          field:{name:'topic', label:'연구주제', widget:'string'}},
        {name:'photo', label:'프로필 사진', widget:'image', choose_url:false}
      ]
    };
  }
  function equipment(name, label) {
    return {
      name:name, label:label, widget:'object', collapsed:true,
      fields:[
        {name:'items', label:'목록', widget:'list', default:[], label_singular:'항목', summary:'{{fields.text}}', fields:[
          {name:'text', label:'항목', widget:'string'},
          {name:'sub', label:'아래 작은 목록 (선택)', widget:'list', default:[], required:false, label_singular:'작은 항목',
            field:{name:'line', label:'작은 항목', widget:'string'}}
        ]},
        {name:'images', label:'사진', widget:'list', default:[], required:false, label_singular:'사진', summary:'{{fields.alt}}',
          hint:'1장이면 가로 전체 크기로, 여러 장이면 나란히 표시됩니다.', fields:[
          {name:'image', label:'사진', widget:'image', choose_url:false},
          {name:'alt', label:'사진 설명 (접근성)', widget:'string', required:false}
        ]}
      ]
    };
  }
  // A research page: each topic is a heading, then paragraphs and figures in the order they appear.
  function topics() {
    return [{
      name:'topics', label:'연구 주제', widget:'list', collapsed:true, default:[], label_singular:'주제', summary:'{{fields.title}}',
      hint:'페이지에 보이는 순서대로입니다. 제목, 문단, 그림 설명에는 <i>, <sub>, <sup>, <br> 태그를 쓸 수 있습니다.',
      fields:[
        {name:'title', label:'주제 제목', widget:'string'},
        {name:'id', label:'링크용 이름 (선택)', widget:'string', required:false,
          hint:'Research Overview의 항목에서 이 주제로 바로 오는 링크에 쓰입니다. 이미 값이 있으면 바꾸지 마세요.'},
        {name:'blocks', label:'내용 (위에서부터 순서대로)', widget:'list', default:[], required:false, label_singular:'내용',
          types:[
            {name:'text', label:'문단', widget:'object', summary:'{{fields.text}}', fields:[
              {name:'text', label:'문단', widget:'text'}
            ]},
            {name:'figure', label:'그림', widget:'object', summary:'{{fields.caption}}', fields:[
              {name:'images', label:'그림 파일', widget:'list', default:[], hint:'여러 개면 한 줄에 나란히 표시됩니다.',
                field:{name:'image', label:'그림 / GIF', widget:'image', choose_url:false}},
              {name:'caption', label:'그림 설명', widget:'text', required:false, hint:'예: [Figure 1] ...'}
            ]}
          ]}
      ]
    }];
  }
  var RESEARCH = [
    ['turbulent_flow', 'Turbulent flow', 'turbulent-flow'],
    ['numerical_methods', 'Numerical methods', 'numerical-methods'],
    ['fsi', 'Fluid-Structure Interaction (FSI) Problem', 'fsi'],
    ['multiphase_flow', 'Multi-phase flow', 'multiphase-flow'],
    ['cfd_application', 'CFD application', 'cfd-application']
  ];
  window.FPCLAdminConfig = function (connection) {
    return {
      load_config_file:false,
      backend:{name:'github', repo:connection.repo, branch:connection.branch,
        base_url:connection.base_url, auth_endpoint:'auth'},
      locale:'ko', publish_mode:'simple',
      media_folder:'images/uploads', public_folder:'/images/uploads',
      site_url:window.location ? window.location.origin : 'https://fpcl-unist.github.io',
      display_url:window.location ? window.location.origin : 'https://fpcl-unist.github.io',
      collections:[
        collection('highlights', 'Research Highlights · 메인 슬라이드', 'data/highlights.js', [
          {name:'highlightSettings', label:'자동 전환 설정', widget:'object', fields:[
            {name:'interval', label:'전환 간격 (밀리초)', widget:'number', value_type:'int', min:2000, max:60000, step:1000, default:5000,
              hint:'5000 = 5초, 10000 = 10초. 마우스를 올리거나 버튼을 조작하는 동안은 잠시 멈춥니다.'}
          ]},
          {name:'highlights', label:'슬라이드 목록', widget:'list', collapsed:true, default:[], label_singular:'슬라이드', summary:'{{fields.title}}',
            fields:[
              {name:'title', label:'연구 제목', widget:'text'},
              {name:'image', label:'그림 / GIF', widget:'image', choose_url:false},
              {name:'alt', label:'이미지 설명 (접근성)', widget:'string', required:false},
              {name:'authors', label:'저자', widget:'string', hint:'Jae Hwa Lee는 자동으로 굵게 표시됩니다.'},
              {name:'journal', label:'저널명', widget:'string'},
              {name:'details', label:'권 · 호 · 페이지 · 연도', widget:'string', required:false}
            ]}
        ]),
        collection('home', 'Home · 소개글과 공지', 'data/home.js', [
          {name:'about', label:'About FPCL 문단', widget:'list', default:[], label_singular:'문단',
            field:{name:'paragraph', label:'문단', widget:'text'}},
          {name:'notices', label:'Notice · 공지', widget:'list', collapsed:true, add_to_top:true, default:[], label_singular:'공지', summary:'{{fields.title}}',
            hint:'메인 페이지 Notice 칸에 위에서부터 표시됩니다. 내용 속 이메일·웹 주소는 자동으로 링크가 됩니다.',
            fields:[
              {name:'title', label:'제목', widget:'string'},
              {name:'text', label:'내용', widget:'text'}
            ]}
        ]),
        {
          name:'research', label:'Research · 연구 페이지', format:'fpcl-js', extension:'js', editor:{preview:false},
          files:RESEARCH.map(function (p) {
            return {name:p[0], label:p[1] + ' 편집', file:'data/research/' + p[2] + '.js', format:'fpcl-js', fields:topics()};
          })
        },
        collection('professor', 'People · 교수 소개', 'data/professor.js', [
          {name:'professor', label:'기본 정보', widget:'object', fields:[
            {name:'name', label:'이름', widget:'string'},
            {name:'degree', label:'학위 (이름 옆 작은 글씨)', widget:'string', required:false},
            {name:'position', label:'직위', widget:'string', required:false},
            {name:'department', label:'소속', widget:'string', required:false},
            {name:'photo', label:'사진', widget:'image', choose_url:false},
            {name:'facts', label:'연락처', widget:'list', default:[], label_singular:'연락처', summary:'{{fields.label}} · {{fields.value}}', fields:[
              {name:'label', label:'항목 이름', widget:'string', hint:'예: Office, Tel, E-mail'},
              {name:'value', label:'내용', widget:'string'}
            ]}
          ]},
          {name:'professorCv', label:'경력 구역', widget:'list', collapsed:true, default:[], label_singular:'구역', summary:'{{fields.heading}}',
            hint:'Education, Experience, Honor and Award 등 페이지에 보이는 순서대로입니다.',
            fields:[
              {name:'heading', label:'구역 제목', widget:'string'},
              {name:'items', label:'목록', widget:'list', default:[], label_singular:'항목', field:{name:'item', label:'항목', widget:'string'}}
            ]}
        ]),
        collection('members', 'People · 구성원', 'data/members.js', [
          members('students', 'Student · 학생', true),
          members('researchers', 'Researcher · 연구원', false),
          {name:'alumni', label:'Alumni · 졸업생', widget:'list', collapsed:true, default:[], add_to_top:true, label_singular:'졸업생', summary:'{{fields.name}} · {{fields.degree}}',
            fields:[
              {name:'name', label:'영문 이름', widget:'string'},
              {name:'degree', label:'학위', widget:'string'},
              {name:'period', label:'재학 기간', widget:'string'},
              {name:'now', label:'현재 소속', widget:'string', required:false}
            ]}
        ]),
        collection('publications', 'Publication · 논문', 'data/publications.js', [
          papers('journalsInternational', 'International · 국제 논문', false),
          papers('journalsDomestic', 'Domestic · 국내 논문', false)
        ]),
        collection('proceedings', 'Proceeding · 학회 발표', 'data/proceedings.js', [
          papers('proceedingsInternational', 'International · 국제 학회', true),
          papers('proceedingsDomestic', 'Domestic · 국내 학회', true)
        ]),
        collection('photos', 'Photo · 사진 게시판', 'data/photos.js', [{
          name:'photos', label:'사진 게시물', label_singular:'게시물', widget:'list',
          collapsed:true, add_to_top:true, default:[], summary:'{{fields.date}} · {{fields.title}}',
          hint:'맨 위 3개의 날짜와 제목이 홈페이지 메인에 표시됩니다.',
          fields:[
            {name:'date', label:'게시 날짜', widget:'datetime', date_format:'YYYY-MM-DD', time_format:false, format:'YYYY-MM-DD', picker_utc:true},
            {name:'title', label:'제목', widget:'string'},
            {name:'text', label:'장소 · 행사 날짜 · 설명', widget:'text', required:false},
            {name:'images', label:'사진', widget:'list', default:[],
              hint:'사진을 첨부하고 표시 순서를 바꿀 수 있습니다. 큰 사진은 가로 1600px 정도로 줄여 올려 주세요.',
              field:{name:'image', label:'사진', widget:'image', choose_url:false}}
          ]
        }]),
        collection('lectures', 'Lectures · 강의', 'data/lectures.js', [
          {name:'lectures', label:'강의 목록', widget:'list', collapsed:true, add_to_top:true, default:[], label_singular:'학기',
            summary:'{{fields.semester}} · {{fields.courses}}', hint:'최신 학기가 위에 오도록 정렬해 주세요.',
            fields:[
              {name:'semester', label:'학기', widget:'string', hint:'예: Fall 2026'},
              {name:'courses', label:'과목', widget:'string', hint:'여러 과목은 쉼표로 구분합니다. 예: Computational Fluid Dynamics (MEN413), Turbulent Flow (MEN525)'}
            ]}
        ]),
        collection('equipment', 'Equipment · 장비', 'data/equipment.js', [
          equipment('equipmentServers', 'Server and workstation'),
          equipment('equipmentSoftware', 'Commercial software'),
          equipment('equipmentWindTunnel', 'Wind tunnel facility'),
          equipment('equipmentMeasurement', 'Flow visualization and measurement')
        ]),
        collection('links', 'Link · 링크', 'data/links.js', [
          {name:'links', label:'링크 묶음', widget:'list', collapsed:true, default:[], label_singular:'묶음', summary:'{{fields.group}}',
            fields:[
              {name:'group', label:'묶음 제목', widget:'string', hint:'예: Journal, Conference'},
              {name:'items', label:'링크', widget:'list', default:[], label_singular:'링크', summary:'{{fields.title}}', fields:[
                {name:'title', label:'이름', widget:'string'},
                {name:'url', label:'주소', widget:'string',
                  pattern:['^https?://[^\\s]+$', 'http:// 또는 https://로 시작하는 주소를 입력해 주세요.']}
              ]}
            ]}
        ])
      ]
    };
  };
})();
