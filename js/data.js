// 모아둠 (MOADUM) 초기 기본 데이터 및 저장소 관리

const DEFAULT_DATA = {
  currentUser: {
    id: "user_soyoon",
    name: "소윤님",
    email: "soyoon@moadum.com",
    avatar: "assets/avatar.png",
    bio: "데이터 기획 및 서비스 기획 취준생 👩‍💻 좋은 기록이 좋은 기회를 만든다!",
    plan: "free", // "free" | "pro"
    usedStorageMB: 487,
    totalStorageMB: 500,
    role: "데이터기획 취업준비생",
    isLoggedIn: true,
    theme: "light", // "light" | "dark"
    emailNotifications: true,
    webNotifications: true,
    marketingNotifications: false
  },

  boards: [
    {
      id: "job",
      name: "취준",
      icon: "briefcase",
      description: "취업을 위한 모든 준비 자료를 한 곳에 모아보세요.",
      subcategories: ["기업 조사", "자소서 소재", "면접 준비", "채용 일정"]
    },
    {
      id: "blog",
      name: "블로그",
      icon: "pen-tool",
      description: "생각과 지식을 정리하고 가치 있는 글로 발행하는 블로그 보드입니다.",
      subcategories: ["글감 아이디어", "초안 작성", "기술 블로그", "발행 완료"]
    },
    {
      id: "posts",
      name: "게시물",
      icon: "layers",
      description: "SNS, 아티클, 포트폴리오용 게시물 자료를 모아둔 보드입니다.",
      subcategories: ["SNS 팁", "디자인 레퍼런스", "기획 아티클"]
    },
    {
      id: "memes",
      name: "짤 보관함",
      icon: "smile",
      description: "핀터레스트처럼 모아보는 웃긴 밈 & 취준 힐링 짤 보관함입니다.",
      subcategories: ["무한도전 밈", "직장인/퇴근", "취준 공감", "동기부여"]
    }
  ],

  items: [
    {
      id: "item_1",
      type: "memo",
      boardId: "job",
      subcategory: "자소서 소재",
      title: "API 수집 자동화 경험",
      summary: "사내 데이터 수집 업무를 자동화한 경험 정리. Python으로 공공데이터 API를 수집하고 Slack으로 리포트를 전송하는 프로세스를 구축하여 주당 4시간 업무 절감.",
      content: "사내 데이터 수집 업무를 자동화한 경험 정리.\n- 사용 도구: Python, Requests, Pandas, Slack Webhook API\n- 구축 내용: 매일 아침 공공데이터 포털에서 신규 등록 데이터를 자동 크롤링/수집 후 데이터 정제, 요약 통계를 사내 슬랙 채널에 자동 알림 전송.\n- 성과: 수작업 반복 소요시간 주 4시간 단축 및 데이터 누락율 0% 달성.",
      tags: ["데이터기획", "자동화", "Python"],
      isFavorite: true,
      createdAt: "2024-10-28T14:20:00"
    },
    {
      id: "item_2",
      type: "link",
      boardId: "job",
      subcategory: "기업 조사",
      title: "카카오뱅크 직무 인터뷰",
      url: "https://careers.kakaobank.com/interview/data-planner",
      summary: "카카오뱅크 데이터기획 직무 인터뷰 (현직자 인터뷰, 주요 질문 정리 및 분석)",
      content: "카카오뱅크 데이터기획팀 인터뷰 핵심 요약:\n1. 단순 SQL 추출을 넘어 비즈니스 가설 검증과 데이터 기반 서비스 기획 역량 중시\n2. 모바일 금융 고객의 퍼널 분석 및 행동 패턴 데이터 모델링 경험 우대\n3. 다양한 부서(개발, 디자인, 리스크관리)와의 협업 커뮤니케이션 능력이 가장 큰 경쟁력",
      tags: ["카카오뱅크", "면접", "직무분석"],
      isFavorite: true,
      createdAt: "2024-10-27T11:15:00"
    },
    {
      id: "item_3",
      type: "memo",
      boardId: "job",
      subcategory: "면접 준비",
      title: "면접 예상 질문 모음",
      summary: "1. 데이터 기반 의사결정을 해본 경험은?\n2. 협업 중 갈등을 어떻게 해결했는지?\n3. 카카오뱅크에 지원한 이유는?\n4. 프로젝트 실패 경험과 교훈",
      content: "1. 데이터 기반 의사결정을 해본 경험은?\n- 답변 포인트: 문제 정의 -> 데이터 수집/가공 -> 지표 도출 -> 의사결정 반영 결과\n2. 협업 중 갈등을 어떻게 해결했는지?\n- 감정적 대립이 아닌 명확한 데이터 근거와 공통 목표(사용자 가치) 공유로 합의점 도출\n3. 카카오뱅크에 지원한 이유는?\n- 사용자 친화적인 UI/UX와 정교한 데이터 기반 금융 혁신에 기여하고 싶음",
      tags: ["면접", "질문", "준비"],
      isFavorite: true,
      createdAt: "2024-10-26T16:40:00"
    },
    {
      id: "item_4",
      type: "link",
      boardId: "job",
      subcategory: "기업 조사",
      title: "토스 기업 분석 정리",
      url: "https://toss.im/career/culture",
      summary: "토스의 주요 서비스, 최근 이슈, 조직문화 분석 정리. 사용자 중심 애자일 조직 구조와 토스증권, 토스뱅크 성장 전략 요약.",
      content: "토스(비바리퍼블리카) 심층 분석:\n- 핵심 가치: Customer Centricity, Radical Transparency\n- 최근 이슈: 해외 진출 가속화, AI 기반 금융 비서 서비스 도입, B2B 결제 사업 확장\n- 기획자 관점 분석: 슈퍼앱 전략에서의 서비스 간 크로스셀링 구조 및 전환율 최적화 분석",
      tags: ["토스", "기업분석", "핀테크"],
      isFavorite: false,
      createdAt: "2024-10-24T09:30:00"
    },
    {
      id: "item_5",
      type: "image",
      boardId: "job",
      subcategory: "면접 준비",
      title: "면접 스터디 후기",
      image: "assets/study_thumb.png",
      summary: "강남 스터디룸 모의 면접 피드백 요약 사진 및 답변 태도 체크리스트",
      content: "면접 스터디 3회차 모의면접 피드백:\n- 시선 처리가 자연스러워짐, 두괄식 답변 연습 효과 큼\n- 말끝을 흐리지 말고 확실하게 '생각합니다'로 맺기\n- 기술적 용어 사용 시 비전공자도 이해하기 쉬운 비유 추가 권장",
      tags: ["면접", "스터디"],
      isFavorite: false,
      createdAt: "2024-10-22T19:00:00"
    },
    {
      id: "item_6",
      type: "memo",
      boardId: "job",
      subcategory: "자소서 소재",
      title: "데이터 기획 직무 키워드",
      summary: "데이터 분석, 지표 설계, A/B 테스트, 퍼널 분석, SQL 최적화, 역기획서 작성 등 자주 쓰는 직무 핵심 키워드 리스트.",
      content: "자소서 및 면접용 핵심 키워드 매핑:\n- 분석: AARRR 퍼널, 코호트 분석, LTV/CAC, Retention Rate\n- 실행: A/B 테스트 가설 설정, 유의수준 검정, 데이터 대시보드 구축(Tableau, GA4)\n- 커뮤니케이션: 문제 정의서(PRD), 유저 스토리, 기능 명세서(SRS)",
      tags: ["데이터기획", "키워드", "직무"],
      isFavorite: false,
      createdAt: "2024-10-21T13:10:00"
    },
    {
      id: "item_7",
      type: "memo",
      boardId: "job",
      subcategory: "자소서 소재",
      title: "이력서 경험 정리 노트",
      summary: "대학 시절 캡스톤 프로젝트와 인턴십 경험 STAR 기법 정리. 성과 수치 중심으로 요약 정리.",
      content: "이력서 STAR 정리:\n[Situation] 학생회 투표 참여율 저조 (28%)\n[Task] 모바일 투표 시스템 및 데이터 안내 대시보드 기획\n[Action] 카카오톡 알림톡 연동 및 실시간 투표율 시각화 페이지 론칭\n[Result] 역대 최고 참여율 72% 기록",
      tags: ["이력서", "데이터기획"],
      isFavorite: true,
      createdAt: "2024-11-06T08:15:00"
    },
    {
      id: "item_8",
      type: "link",
      boardId: "blog",
      subcategory: "글감 아이디어",
      title: "블로그 글 아이디어 모음",
      image: "assets/book_thumb.png",
      url: "https://velog.io/@soyoon/ideas",
      summary: "신입 데이터 기획자가 알아야 할 5가지 실무 지표와 SQL 치트시트 아티클 기획안.",
      content: "1편: 실무에서 바로 써먹는 리텐션 코호트 분석법\n2편: 비개발자를 위한 퍼널 데이터 트래킹 세팅 가이드\n3편: 기획자의 필수 SQL 구문 10선 (윈도우 함수 위주)",
      tags: ["블로그", "글감", "기획"],
      isFavorite: false,
      createdAt: "2024-11-06T05:00:00"
    },
    {
      id: "item_9",
      type: "image",
      boardId: "memes",
      subcategory: "동기부여",
      title: "오늘도 할 수 있다 짤",
      image: "assets/otter_meme.png",
      summary: "오늘도 할 수 있다...! 취준 파이팅 🙏 지치지 말고 하루하루 꾸준히!",
      content: "오늘도 할 수 있다...! 취준 파이팅 🙏\n아무리 힘들어도 하루에 한 장, 한 줄씩 채워가면 반드시 좋은 기회가 올 거야.",
      tags: ["동기부여", "취준", "수달"],
      isFavorite: true,
      createdAt: "2024-11-05T10:00:00"
    },
    // 사용자 요청: 핀터레스트 스타일 짤 보관함 신규 밈 컬렉션
    {
      id: "item_meme_1",
      type: "image",
      boardId: "memes",
      subcategory: "직장인/퇴근",
      title: "오늘 술 한 잔 하시죠?",
      image: "assets/meme_drink.jpg",
      summary: "무한도전 야유회 박명수 & 유재석 - 은밀하게 '오늘 술 한 잔 하시죠?'",
      content: "퇴근 직전 은밀하게 건네는 맥주/소주 제안 짤. 직장인 힐링 필수템!",
      tags: ["무한도전", "박명수", "퇴근", "술한잔"],
      isFavorite: true,
      createdAt: "2024-11-06T11:40:00"
    },
    {
      id: "item_meme_2",
      type: "image",
      boardId: "memes",
      subcategory: "직장인/퇴근",
      title: "그럼 맥주나 한 잔 할래?",
      image: "assets/meme_beer.jpg",
      summary: "무한도전 박명수 & 노홍철 - 농땡이 피우며 '그럼 맥주나 한 잔 할래?'",
      content: "열심히 일하다가 잠시 농땡이 피우며 건네는 시원한 맥주 한 잔 짤.",
      tags: ["무한도전", "박명수", "노홍철", "농땡이", "맥주"],
      isFavorite: true,
      createdAt: "2024-11-06T11:35:00"
    },
    {
      id: "item_meme_3",
      type: "image",
      boardId: "memes",
      subcategory: "무한도전 밈",
      title: "온몸에 힘 빠지는 남의 행복",
      image: "assets/meme_exhausted.jpg",
      summary: "턱시도 입고 영혼 털린 박명수 명짤",
      content: "남의 행복에 온몸에 힘 빠진 현실적인 표정의 박명수 명짤.",
      tags: ["무한도전", "박명수", "현타", "직장인"],
      isFavorite: true,
      createdAt: "2024-11-06T10:00:00"
    },
    {
      id: "item_meme_4",
      type: "image",
      boardId: "memes",
      subcategory: "무한도전 밈",
      title: "저를 원하시면 가지세요!",
      image: "assets/meme_take_me.jpg",
      summary: "자신감 넘치는 노홍철 패기 짤",
      content: "면접이나 자기 PR 때 쓰고 싶은 광기의 자신감 짤.",
      tags: ["무한도전", "노홍철", "자신감", "취준생"],
      isFavorite: false,
      createdAt: "2024-11-05T18:00:00"
    },
    {
      id: "item_meme_5",
      type: "image",
      boardId: "memes",
      subcategory: "취준 공감",
      title: "나 사는 게 힘들어... 엄마...",
      image: "assets/meme_hard_life.jpg",
      summary: "패딩 입고 누워있는 아기 짤 - 나 사는 게 힘들어...",
      content: "자소서 쓰다가 지칠 때 단톡방에 올리기 딱 좋은 아기 짤.",
      tags: ["취준공감", "힘들어", "힐링"],
      isFavorite: true,
      createdAt: "2024-11-05T15:00:00"
    },
    {
      id: "item_meme_6",
      type: "image",
      boardId: "memes",
      subcategory: "무한도전 밈",
      title: "올 가을엔 사랑하세요...",
      image: "assets/meme_fall_love.jpg",
      summary: "아련한 표정의 정형돈 짤",
      content: "올 가을엔 사랑하세요... 아니 취업하세요...",
      tags: ["무한도전", "정형돈", "가을", "사랑"],
      isFavorite: false,
      createdAt: "2024-11-05T12:00:00"
    },
    {
      id: "item_meme_7",
      type: "image",
      boardId: "memes",
      subcategory: "취준 공감",
      title: "멘붕",
      image: "assets/meme_menbung.jpg",
      summary: "머리 잡고 넋 나간 박미선 짤",
      content: "코딩테스트나 서류 마감 10분 전 나의 모습.",
      tags: ["멘붕", "시험", "취준생"],
      isFavorite: false,
      createdAt: "2024-11-05T09:00:00"
    },
    {
      id: "item_10",
      type: "memo",
      boardId: "job",
      subcategory: "기업 조사",
      title: "기업 분석 메모",
      summary: "현대카드 기업 및 디지털 트랜스포메이션 방향성 분석 메모",
      content: "현대카드 분석 포인트:\n- Data Science 기반 맞춤형 PLCC 카드 전략\n- 슈퍼앱으로서의 현대카드 앱 3.0 구조\n- 도메인 특화 AI 기술 도입 현황 및 채용 직무 요구역량 매칭",
      tags: ["현대카드", "기업분석", "데이터"],
      isFavorite: true,
      createdAt: "2024-10-20T15:30:00"
    },
    {
      id: "item_11",
      type: "memo",
      boardId: "job",
      subcategory: "자소서 소재",
      title: "자소서 최종본",
      summary: "현대카드 디지털 기획 직무 지원 자소서 1~3번 최종 확정본",
      content: "현대카드 최종 자소서:\n1. 현대카드에 지원한 동기와 본인이 적합하다고 생각하는 이유 (1,000자)\n2. 가장 몰입하여 성공을 이뤄낸 프로젝트 경험 (1,000자)\n3. 데이터 분석 도구를 활용해 문제를 개선한 구체적 사례 (1,000자)",
      tags: ["현대카드", "자소서", "최종본"],
      isFavorite: true,
      createdAt: "2024-10-29T22:00:00"
    },
    // 임시 보관함 자료 3건
    {
      id: "item_inbox_1",
      type: "image",
      boardId: null, // 임시 보관함
      subcategory: null,
      title: "네카라쿠배 채용 공고 짤",
      image: "assets/otter_thumb.png",
      summary: "주요 IT 기업 채용 일정 한눈에 보는 인포그래픽 짤",
      content: "2024 하반기 네카라쿠배 채용 공고 일정 총정리 이미지 캡처",
      tags: ["채용", "취준", "일정"],
      isFavorite: false,
      createdAt: "2024-10-29T17:10:00"
    },
    {
      id: "item_inbox_2",
      type: "memo",
      boardId: null, // 임시 보관함
      subcategory: null,
      title: "카카오 자소서 1번 문항 초안",
      summary: "지원 동기 및 직무를 위해 지금까지 준비해온 노력 (초안 메모)",
      content: "카카오 데이터 기획자로서 사람들의 일상 속 금융 경험을 어떻게 바꿀 수 있을지 고민해온 시간들을 풀어낸 초안입니다.",
      tags: ["자소서", "카카오"],
      isFavorite: false,
      createdAt: "2024-10-25T14:00:00"
    },
    {
      id: "item_inbox_3",
      type: "link",
      boardId: null, // 임시 보관함
      subcategory: null,
      title: "라인 채용 홈페이지",
      url: "https://careers.line.me",
      summary: "라인 데이터 기획 수시 채용 공고 링크",
      content: "라인플러스 글로벌 메시징 및 핀테크 데이터 분석가 수시 채용 공고",
      tags: ["라인", "취준"],
      isFavorite: false,
      createdAt: "2024-10-23T11:20:00"
    }
  ],

  schedules: [
    {
      id: "sch_1",
      title: "카카오뱅크 1차 면접",
      type: "면접 준비", // '면접 준비' | '지원 마감' | '블로그 초안' | '기타'
      categoryColor: "purple", // purple, red, green
      date: `${new Date().getFullYear()}-10-31`, // 목요일
      startTime: "10:00",
      endTime: "12:00",
      company: "카카오뱅크 본사",
      memo: "10:00 ~ 12:00 판교 본사 대면 면접. 데이터 포트폴리오 및 직무 인터뷰 내용 사전 복습 필수!",
      tags: ["면접", "카카오뱅크"],
      linkedItemIds: ["item_2", "item_3"]
    },
    {
      id: "sch_2",
      title: "블로그 초안",
      type: "블로그 초안",
      categoryColor: "green",
      date: `${new Date().getFullYear()}-10-29`, // 화요일
      startTime: "14:00",
      endTime: "16:00",
      company: "블로그 글 작성",
      memo: "14:00 ~ 16:00 데이터 기획자 지표 분석 아티클 1차 초안 완성 및 이미지 정리",
      tags: ["블로그", "글작성"],
      linkedItemIds: ["item_8"]
    },
    {
      id: "sch_3",
      title: "지원 마감",
      type: "지원 마감",
      categoryColor: "red",
      date: `${new Date().getFullYear()}-11-03`, // 일요일
      startTime: "23:59",
      endTime: "23:59",
      company: "현대카드 채용",
      memo: "채용 홈페이지에서 최종 지원하기! 자소서, 포트폴리오 다시 한번 확인 ★",
      tags: ["현대카드", "지원마감"],
      linkedItemIds: ["item_10", "item_11"]
    },
    {
      id: "sch_4",
      title: "삼성전자 서류 마감",
      type: "지원 마감",
      categoryColor: "red",
      date: `${new Date().getFullYear()}-11-05`,
      startTime: "17:00",
      endTime: "17:00",
      company: "삼성전자 채용 홈페이지",
      memo: "서류 최종 제출 및 마감 1시간 전 최종 제출 완료 확인",
      tags: ["삼성전자", "서류마감"],
      linkedItemIds: []
    },
    {
      id: "sch_5",
      title: "블루베리 AI 면접",
      type: "면접 준비",
      categoryColor: "purple",
      date: `${new Date().getFullYear()}-11-04`,
      startTime: "10:00",
      endTime: "11:00",
      company: "온라인 AI 역량검사",
      memo: "화상 카메라 및 마이크 사전 점검, 차분한 환경 조성",
      tags: ["AI면접", "역량검사"],
      linkedItemIds: []
    }
  ],

  notifications: [
    {
      id: "notif_1",
      title: "블루베리 AI 면접",
      subtitle: "내일 오전 10:00",
      dday: "D-1",
      isRead: false,
      scheduleId: "sch_5",
      createdAt: "2024-11-03T09:00:00"
    },
    {
      id: "notif_2",
      title: "현대카드 지원 마감",
      subtitle: "오늘 오후 11:59 마감 예정입니다.",
      dday: "D-Day",
      isRead: false,
      scheduleId: "sch_3",
      createdAt: "2024-11-03T08:00:00"
    },
    {
      id: "notif_3",
      title: "삼성전자 서류 마감",
      subtitle: "2일 후 17:00 마감",
      dday: "D-2",
      isRead: false,
      scheduleId: "sch_4",
      createdAt: "2024-11-03T07:30:00"
    },
    {
      id: "notif_4",
      title: "새로 저장한 자료 3건",
      subtitle: "임시 보관함에 정리할 자료가 있습니다.",
      dday: null,
      isRead: false,
      route: "inbox",
      createdAt: "2024-11-02T15:00:00"
    }
  ]
};

// 스토리지 관리자
class MoadumStorage {
  constructor() {
    this.STORAGE_KEY = "moadum_database_v2"; // v2로 갱신하여 신규 짤 밈 자동 반영
    this.data = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 기본 예시 일정의 연도만 올해로 갱신하고, 사용자가 추가한 일정은 유지
        const currentYear = new Date().getFullYear();
        const defaultScheduleIds = new Set(["sch_1", "sch_2", "sch_3", "sch_4", "sch_5"]);
        if (Array.isArray(parsed.schedules)) {
          parsed.schedules.forEach((schedule) => {
            if (defaultScheduleIds.has(schedule.id) && /^2024-/.test(schedule.date || "")) {
              schedule.date = `${currentYear}${schedule.date.slice(4)}`;
            }
          });
        }
        // 새로운 짤 아이템이 누락되지 않도록 보장
        if (parsed.items && !parsed.items.some(i => i.id === "item_meme_1")) {
          parsed.items = [...DEFAULT_DATA.items];
        }
        return parsed;
      }
    } catch (e) {
      console.warn("로컬스토리지 로드 실패, 기본 데이터 사용", e);
    }
    this.save(DEFAULT_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  save(data) {
    try {
      this.data = data || this.data;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("로컬스토리지 저장 실패", e);
    }
  }

  reset() {
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    this.save(this.data);
    return this.data;
  }
}

window.moadumStorage = new MoadumStorage();
