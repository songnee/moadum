// 모아둠 (MOADUM) 메인 애플리케이션 스크립트

class MoadumApp {
  constructor() {
    this.storage = window.moadumStorage;
    this.currentView = "home";
    this.currentBoardId = "job";
    this.currentSubcategory = "전체";
    this.currentTagFilter = "전체";
    this.selectedScheduleId = "sch_3"; // 기본 선택: 11월 3일 현대카드 지원 마감
    this.selectedScheduleDate = "2024-11-03";
    this.calendarViewMode = "week"; // 'week' | 'month' | 'list'
    this.quickSaveTags = [];
    this.currentUploadedImageDataUrl = null;

    // 날짜 기준: 2024년 10월 말 ~ 11월 초 주간 (최종 시안 캘린더 기준)
    this.calendarCurrentDate = new Date("2024-10-31T10:00:00");
  }

  init() {
    this.applyTheme(this.storage.data.currentUser.theme || "light");
    this.updateUserHeader();
    this.updateStorageWidgets();
    this.updateInboxBadge();
    this.renderNotifications();
    this.navigate("home");

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener("click", (e) => {
      if (!e.target.closest("#notif-bell-btn") && !e.target.closest("#notif-dropdown")) {
        document.getElementById("notif-dropdown")?.classList.remove("active");
      }
      if (!e.target.closest(".user-profile-btn") && !e.target.closest("#profile-dropdown")) {
        document.getElementById("profile-dropdown")?.classList.remove("active");
      }
    });

    this.refreshIcons();
  }

  refreshIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  showToast(message) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<i data-lucide="check-circle" style="width:16px;height:16px;color:#4ADE80;"></i><span>${message}</span>`;
    container.appendChild(toast);
    this.refreshIcons();
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // =========================================================================
  // 라우팅 & 네비게이션
  // =========================================================================
  navigate(viewName, param = null) {
    this.currentView = viewName;

    // 모든 뷰 숨김
    document.querySelectorAll(".page-view").forEach((el) => (el.style.display = "none"));

    // 사이드바 active 갱신
    document.querySelectorAll(".nav-item").forEach((btn) => btn.classList.remove("active"));

    if (viewName === "home") {
      document.getElementById("view-home").style.display = "block";
      document.querySelector('[data-nav="home"]')?.classList.add("active");
      this.renderHome();
    } else if (viewName === "board") {
      this.currentBoardId = param || "job";
      this.currentSubcategory = "전체";
      this.currentTagFilter = "전체";
      document.getElementById("view-board").style.display = "block";
      document.querySelector(`[data-nav="board-${this.currentBoardId}"]`)?.classList.add("active");
      this.renderBoard();
    } else if (viewName === "inbox") {
      document.getElementById("view-inbox").style.display = "block";
      document.querySelector('[data-nav="inbox"]')?.classList.add("active");
      this.renderInbox();
    } else if (viewName === "schedule") {
      document.getElementById("view-schedule").style.display = "block";
      document.querySelector('[data-nav="schedule"]')?.classList.add("active");
      this.renderSchedule();
    } else if (viewName === "favorites") {
      this.currentBoardId = "favorites";
      this.currentSubcategory = "전체";
      this.currentTagFilter = "전체";
      document.getElementById("view-board").style.display = "block";
      document.querySelector('[data-nav="favorites"]')?.classList.add("active");
      this.renderFavoritesBoard();
    } else if (viewName === "search") {
      document.getElementById("view-search").style.display = "block";
    } else if (viewName === "settings") {
      document.getElementById("view-settings").style.display = "block";
      this.loadSettingsView();
    } else if (viewName === "pricing") {
      document.getElementById("view-pricing").style.display = "block";
      this.updatePricingView();
    } else if (viewName === "login") {
      document.getElementById("view-login").style.display = "block";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    this.refreshIcons();
  }

  updateUserHeader() {
    const user = this.storage.data.currentUser;
    const nameEls = ["header-user-name", "welcome-user-name", "dropdown-user-name"];
    nameEls.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = user.name;
    });

    const planEl = document.getElementById("dropdown-user-plan");
    if (planEl) {
      planEl.textContent = user.plan === "pro" ? "프로 플랜 (50GB)" : "무료 플랜 (500MB)";
    }

    if (user.avatar) {
      const avatarEl = document.getElementById("header-avatar-img");
      if (avatarEl) avatarEl.src = user.avatar;
    }
  }

  updateStorageWidgets() {
    const user = this.storage.data.currentUser;
    const sidebarText = document.getElementById("sidebar-storage-text");
    const sidebarBar = document.getElementById("sidebar-storage-bar");

    const used = user.usedStorageMB;
    const total = user.totalStorageMB;
    const percent = Math.min(100, Math.round((used / total) * 100));

    if (sidebarText) sidebarText.textContent = `${used}MB / ${total >= 1024 ? total / 1024 + "GB" : total + "MB"}`;
    if (sidebarBar) {
      sidebarBar.style.width = `${percent}%`;
      if (percent > 85) {
        sidebarBar.classList.add("warning");
      } else {
        sidebarBar.classList.remove("warning");
      }
    }
  }

  updateInboxBadge() {
    const inboxItems = this.storage.data.items.filter((item) => !item.boardId || item.boardId === "inbox");
    const badge = document.getElementById("sidebar-inbox-badge");
    const homeInboxStat = document.getElementById("home-stat-inbox");
    const inboxHeader = document.getElementById("inbox-count-header");

    if (badge) badge.textContent = inboxItems.length;
    if (homeInboxStat) homeInboxStat.textContent = `${inboxItems.length}건`;
    if (inboxHeader) inboxHeader.textContent = `자료 ${inboxItems.length}건`;
  }

  // =========================================================================
  // 1. 홈 화면 (Home)
  // =========================================================================
  renderHome() {
    const data = this.storage.data;
    const items = data.items.filter((i) => i.boardId && i.boardId !== "inbox");
    const schedules = data.schedules;
    const inboxItems = data.items.filter((i) => !i.boardId || i.boardId === "inbox");

    // 통계 갱신
    document.getElementById("home-stat-total").textContent = `${items.length}건`;
    document.getElementById("home-stat-week").textContent = `11건`;
    document.getElementById("home-stat-schedules").textContent = `${schedules.length}건`;
    document.getElementById("home-stat-inbox").textContent = `${inboxItems.length}건`;

    // 보드별 카운트 배지
    ["job", "blog", "posts", "memes"].forEach((bId) => {
      const cnt = data.items.filter((i) => i.boardId === bId).length;
      const el = document.getElementById(`board-count-${bId}`);
      if (el) el.textContent = `${cnt}건`;
    });

    // 최근 저장한 자료 (최종 시안 100% 일치 3개 카드: 이력서 경험 정리 노트, 블로그 글 아이디어 모음, 오늘도 할 수 있다 짤)
    const recentGrid = document.getElementById("home-recent-cards-grid");
    if (recentGrid) {
      // item_7, item_8, item_9 우선 또는 최신순 상위 3개
      const recentCandidates = [
        data.items.find((i) => i.id === "item_7"),
        data.items.find((i) => i.id === "item_8"),
        data.items.find((i) => i.id === "item_9")
      ].filter(Boolean);

      const displayItems = recentCandidates.length === 3 ? recentCandidates : items.slice(0, 3);
      recentGrid.innerHTML = displayItems.map((item) => this.generateCardHTML(item)).join("");
    }

    // 다가오는 일정 위젯 (최종 시안 100% 동일: 10.31 카카오뱅크 1차 면접, 11.03 현대카드 지원 마감)
    const upcomingList = document.getElementById("home-upcoming-list");
    if (upcomingList) {
      upcomingList.innerHTML = `
        <div class="schedule-item-card" onclick="moadumApp.selectScheduleAndGo('sch_1')">
          <div class="date-pill-badge purple">
            <div>10.31</div>
            <div>(목)</div>
          </div>
          <div class="schedule-item-info">
            <div class="schedule-item-title">카카오뱅크 1차 면접</div>
            <div class="schedule-item-meta">오전 10:00 · 카카오뱅크 본사</div>
          </div>
        </div>

        <div class="schedule-item-card" onclick="moadumApp.selectScheduleAndGo('sch_3')">
          <div class="date-pill-badge red">
            <div>11.03</div>
            <div>(일)</div>
          </div>
          <div class="schedule-item-info">
            <div class="schedule-item-title">현대카드 지원 마감</div>
            <div class="schedule-item-meta">오후 11:59 · 온라인 제출</div>
          </div>
        </div>
      `;
    }

    this.refreshIcons();
  }

  selectScheduleAndGo(schId) {
    this.selectedScheduleId = schId;
    const sch = this.storage.data.schedules.find((s) => s.id === schId);
    if (sch) this.selectedScheduleDate = sch.date;
    this.navigate("schedule");
  }

  // =========================================================================
  // 2. 보드 화면 (Board)
  // =========================================================================
  renderBoard() {
    const board = this.storage.data.boards.find((b) => b.id === this.currentBoardId);
    if (!board) return;

    document.getElementById("board-view-title").textContent = board.name;
    document.getElementById("board-view-desc").textContent = board.description;

    // 소제목 탭 렌더링
    const subtabsBar = document.getElementById("board-subtabs-bar");
    let subtabsHTML = `<button class="subtab-btn ${this.currentSubcategory === "전체" ? "active" : ""}" onclick="moadumApp.selectSubcategory('전체')">전체</button>`;
    board.subcategories.forEach((sub) => {
      subtabsHTML += `<button class="subtab-btn ${this.currentSubcategory === sub ? "active" : ""}" onclick="moadumApp.selectSubcategory('${sub}')">${sub}</button>`;
    });
    subtabsHTML += `
      <button class="add-subcat-btn" onclick="moadumApp.promptAddSubcategory()">
        <i data-lucide="plus" style="width:14px;height:14px;"></i>
        <span>소제목 추가</span>
      </button>
    `;
    subtabsBar.innerHTML = subtabsHTML;

    // 태그 칩 목록 렌더링
    this.renderBoardTagChips();

    // 카드 그리드 렌더링
    this.renderCurrentBoardCards();
  }

  renderFavoritesBoard() {
    document.getElementById("board-view-title").textContent = "즐겨찾기";
    document.getElementById("board-view-desc").textContent = "자주 찾아보고 중요하게 표시해둔 즐겨찾기 자료입니다.";

    document.getElementById("board-subtabs-bar").innerHTML = `
      <button class="subtab-btn active">전체 즐겨찾기</button>
    `;
    this.renderBoardTagChips();
    this.renderCurrentBoardCards();
  }

  selectSubcategory(subcat) {
    this.currentSubcategory = subcat;
    document.querySelectorAll(".subtab-btn").forEach((btn) => {
      if (btn.textContent.trim() === subcat) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    this.renderCurrentBoardCards();
  }

  promptAddSubcategory() {
    const name = prompt("새로 추가할 세부 분류(소제목) 이름을 입력하세요:");
    if (!name || !name.trim()) return;
    const board = this.storage.data.boards.find((b) => b.id === this.currentBoardId);
    if (board && !board.subcategories.includes(name.trim())) {
      board.subcategories.push(name.trim());
      this.storage.save();
      this.renderBoard();
      this.showToast(`'${name.trim()}' 세부 분류가 추가되었습니다.`);
    }
  }

  renderBoardTagChips() {
    const boardItems = this.currentBoardId === "favorites"
      ? this.storage.data.items.filter((i) => i.isFavorite)
      : this.storage.data.items.filter((i) => i.boardId === this.currentBoardId);

    const tagSet = new Set();
    boardItems.forEach((item) => {
      if (item.tags) item.tags.forEach((t) => tagSet.add(t));
    });

    const tags = ["전체", ...Array.from(tagSet)];
    // 최종 시안 취준 보드 주요 태그 유지: 데이터기획, 마케팅, 서비스기획, 금융
    if (this.currentBoardId === "job") {
      ["데이터기획", "마케팅", "서비스기획", "금융"].forEach((t) => {
        if (!tags.includes(t)) tags.push(t);
      });
    }

    const wrap = document.getElementById("board-tag-chips-wrap");
    wrap.innerHTML = tags
      .map(
        (t) => `
        <button class="tag-filter-chip ${this.currentTagFilter === t ? "active" : ""}" onclick="moadumApp.selectTagFilter('${t}')">
          #${t}
        </button>
      `
      )
      .join("");
  }

  selectTagFilter(tag) {
    this.currentTagFilter = tag;
    this.renderBoardTagChips();
    this.renderCurrentBoardCards();
  }

  renderCurrentBoardCards() {
    const searchVal = document.getElementById("board-filter-search")?.value.trim().toLowerCase() || "";
    const typeVal = document.getElementById("board-filter-type")?.value || "all";
    const sortVal = document.getElementById("board-filter-sort")?.value || "newest";

    let items = this.currentBoardId === "favorites"
      ? this.storage.data.items.filter((i) => i.isFavorite)
      : this.storage.data.items.filter((i) => i.boardId === this.currentBoardId);

    // 소제목 필터
    if (this.currentSubcategory !== "전체") {
      items = items.filter((i) => i.subcategory === this.currentSubcategory);
    }

    // 태그 필터
    if (this.currentTagFilter !== "전체") {
      items = items.filter((i) => i.tags && i.tags.includes(this.currentTagFilter));
    }

    // 유형 필터
    if (typeVal !== "all") {
      items = items.filter((i) => i.type === typeVal);
    }

    // 검색어 필터
    if (searchVal) {
      items = items.filter(
        (i) =>
          (i.title && i.title.toLowerCase().includes(searchVal)) ||
          (i.summary && i.summary.toLowerCase().includes(searchVal)) ||
          (i.content && i.content.toLowerCase().includes(searchVal)) ||
          (i.tags && i.tags.some((t) => t.toLowerCase().includes(searchVal)))
      );
    }

    // 정렬
    items.sort((a, b) => {
      if (sortVal === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortVal === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortVal === "title") return a.title.localeCompare(b.title);
      return 0;
    });

    const grid = document.getElementById("board-cards-grid");
    const empty = document.getElementById("board-empty-state");

    if (items.length === 0) {
      grid.innerHTML = "";
      empty.style.display = "block";
    } else {
      empty.style.display = "none";
      grid.innerHTML = items.map((item) => this.generateCardHTML(item)).join("");
    }

    this.refreshIcons();
  }

  // =========================================================================
  // 카드 HTML 생성기 (최종 시안 100% 동일 디자인)
  // =========================================================================
  generateCardHTML(item) {
    const isFav = item.isFavorite;
    const typeLabelMap = { memo: "메모", image: "이미지", link: "링크", schedule: "일정" };
    const typeIconMap = { memo: "file-text", image: "image", link: "link", schedule: "calendar" };

    const typeLabel = typeLabelMap[item.type] || "메모";
    const typeIcon = typeIconMap[item.type] || "file-text";

    // 날짜 포맷 (예: 10월 28일)
    const dateObj = new Date(item.createdAt);
    const dateStr = !isNaN(dateObj) ? `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일` : item.createdAt;

    // 썸네일 표시 여부 (이미지 타입이거나 링크 썸네일이 있는 경우)
    let thumbHTML = "";
    if (item.image) {
      thumbHTML = `
        <div class="card-thumb-wrap">
          <img src="${item.image}" alt="${item.title}" class="card-thumb-img" onerror="this.onerror=null;this.parentElement.style.display='none';">
        </div>
      `;
    }

    // 태그 칩
    const tagsHTML = (item.tags || [])
      .slice(0, 3)
      .map((t) => `<span class="tag-badge">#${t}</span>`)
      .join("");
    const moreTagsCount = (item.tags || []).length > 3 ? `<span class="tag-badge">+${item.tags.length - 3}</span>` : "";

    return `
      <div class="content-card" onclick="moadumApp.openItemDetail('${item.id}')">
        ${thumbHTML}
        <div class="card-body">
          <div class="card-top-meta">
            <span class="card-type-chip">
              <i data-lucide="${typeIcon}" class="card-type-icon"></i>
              <span>${typeLabel}</span>
            </span>
            <button class="card-menu-btn" title="더보기" onclick="event.stopPropagation(); moadumApp.openMoveBoardModal('${item.id}')">
              <i data-lucide="more-horizontal" style="width:16px;height:16px;"></i>
            </button>
          </div>

          <div class="card-title">${item.title}</div>
          <div class="card-summary">${item.summary || item.content || (item.url ? item.url : "")}</div>

          <div class="card-tags-row">
            ${tagsHTML}
            ${moreTagsCount}
          </div>

          <div class="card-footer">
            <span>${typeLabel} · ${dateStr}</span>
            <button class="star-fav-btn ${isFav ? "active" : ""}" title="즐겨찾기" onclick="event.stopPropagation(); moadumApp.toggleFavorite('${item.id}')">
              <i data-lucide="star" style="width:16px;height:16px;fill:${isFav ? "var(--star-gold)" : "none"};"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  toggleFavorite(itemId) {
    const item = this.storage.data.items.find((i) => i.id === itemId);
    if (!item) return;
    item.isFavorite = !item.isFavorite;
    this.storage.save();

    this.showToast(item.isFavorite ? "즐겨찾기에 추가되었습니다 ⭐" : "즐겨찾기에서 해제되었습니다.");
    if (this.currentView === "home") this.renderHome();
    else if (this.currentView === "board") this.renderCurrentBoardCards();
    else if (this.currentView === "favorites") this.renderFavoritesBoard();
  }

  // =========================================================================
  // 3. 임시 보관함 (Inbox)
  // =========================================================================
  renderInbox() {
    const searchVal = document.getElementById("inbox-filter-search")?.value.trim().toLowerCase() || "";
    const typeVal = document.getElementById("inbox-filter-type")?.value || "all";

    let inboxItems = this.storage.data.items.filter((i) => !i.boardId || i.boardId === "inbox");

    if (typeVal !== "all") {
      inboxItems = inboxItems.filter((i) => i.type === typeVal);
    }
    if (searchVal) {
      inboxItems = inboxItems.filter(
        (i) =>
          (i.title && i.title.toLowerCase().includes(searchVal)) ||
          (i.summary && i.summary.toLowerCase().includes(searchVal))
      );
    }

    const grid = document.getElementById("inbox-cards-grid");
    if (inboxItems.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 60px 20px;">
          <div style="font-size: 36px; margin-bottom: 12px;">🎉</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-title); margin-bottom: 4px;">임시 보관함이 비어있어요!</h3>
          <p style="font-size: 13px; color: var(--text-muted);">분류할 자료가 생기면 언제든 빠르게 저장해보세요.</p>
        </div>
      `;
    } else {
      grid.innerHTML = inboxItems
        .map((item) => {
          return `
          <div class="content-card">
            ${item.image ? `<div class="card-thumb-wrap"><img src="${item.image}" class="card-thumb-img"></div>` : ""}
            <div class="card-body">
              <div class="card-top-meta">
                <span class="card-type-chip">${item.type === "image" ? "이미지" : item.type === "link" ? "링크" : "메모"}</span>
                <span style="font-size:11px;color:var(--text-sub);">미분류</span>
              </div>
              <div class="card-title">${item.title}</div>
              <div class="card-summary">${item.summary || item.content}</div>
              <div class="card-tags-row">
                ${(item.tags || []).map((t) => `<span class="tag-badge">#${t}</span>`).join("")}
              </div>
              <div style="margin-top:auto;padding-top:12px;">
                <button class="btn-primary" style="width:100%;justify-content:center;font-size:12px;" onclick="moadumApp.openMoveBoardModal('${item.id}')">
                  <i data-lucide="folder-input" style="width:14px;height:14px;"></i>
                  <span>보드로 이동</span>
                </button>
              </div>
            </div>
          </div>
        `;
        })
        .join("");
    }
    this.updateInboxBadge();
    this.refreshIcons();
  }

  // =========================================================================
  // 4. 일정과 마감 캘린더 (Schedule View - 최종 시안 우하단 100% 동일)
  // =========================================================================
  renderSchedule() {
    // 기간 라벨 갱신
    const periodTitle = document.getElementById("cal-period-title");
    if (periodTitle) {
      const year = this.calendarCurrentDate.getFullYear();
      const month = this.calendarCurrentDate.getMonth() + 1;
      periodTitle.textContent = `${year}년 ${month}월`;
    }

    if (this.calendarViewMode === "week") {
      this.renderWeekView();
    } else if (this.calendarViewMode === "month") {
      this.renderMonthView();
    } else if (this.calendarViewMode === "list") {
      this.renderListView();
    }

    // 우측 상세 패널 렌더링
    this.renderScheduleSideDetail();
    this.refreshIcons();
  }

  setCalendarView(mode) {
    this.calendarViewMode = mode;
    ["week", "month", "list"].forEach((m) => {
      document.getElementById(`btn-view-${m}`)?.classList.toggle("active", m === mode);
      document.getElementById(`cal-${m}-view`).style.display = m === mode ? "block" : "none";
    });
    this.renderSchedule();
  }

  setCalendarToday() {
    this.calendarCurrentDate = new Date("2024-10-31T10:00:00");
    this.renderSchedule();
  }

  prevCalendarPeriod() {
    if (this.calendarViewMode === "week") {
      this.calendarCurrentDate.setDate(this.calendarCurrentDate.getDate() - 7);
    } else {
      this.calendarCurrentDate.setMonth(this.calendarCurrentDate.getMonth() - 1);
    }
    this.renderSchedule();
  }

  nextCalendarPeriod() {
    if (this.calendarViewMode === "week") {
      this.calendarCurrentDate.setDate(this.calendarCurrentDate.getDate() + 7);
    } else {
      this.calendarCurrentDate.setMonth(this.calendarCurrentDate.getMonth() + 1);
    }
    this.renderSchedule();
  }

  // 주간 타임테이블 렌더링 (월~일 7일 & 09:00 ~ 20:00)
  renderWeekView() {
    // 2024-10-28(월) ~ 2024-11-03(일)
    const weekDates = [
      { date: "2024-10-28", label: "10/28 (월)", dayOfWeek: 1 },
      { date: "2024-10-29", label: "10/29 (화)", dayOfWeek: 2 },
      { date: "2024-10-30", label: "10/30 (수)", dayOfWeek: 3 },
      { date: "2024-10-31", label: "10/31 (목)", dayOfWeek: 4, isToday: true },
      { date: "2024-11-01", label: "11/1 (금)", dayOfWeek: 5 },
      { date: "2024-11-02", label: "11/2 (토)", dayOfWeek: 6 },
      { date: "2024-11-03", label: "11/3 (일)", dayOfWeek: 0, isTarget: true }
    ];

    // 헤더 행
    const headerRow = document.getElementById("week-header-row");
    headerRow.innerHTML =
      `<div class="week-day-col-header" style="border-left:none;">시간</div>` +
      weekDates
        .map(
          (d) => `
        <div class="week-day-col-header ${d.isToday ? "today" : ""}" style="cursor:pointer;" onclick="moadumApp.selectDate('${d.date}')">
          ${d.label}
        </div>
      `
        )
        .join("");

    // 바디 행 (09:00 ~ 20:00 시간대 행)
    const hours = [
      "09:00", "10:00", "11:00", "12:00", "13:00", "14:00",
      "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];

    const bodyEl = document.getElementById("timetable-scroll-body");
    let rowsHTML = "";

    hours.forEach((timeStr) => {
      const hourInt = parseInt(timeStr.split(":")[0]);
      rowsHTML += `
        <div class="time-row" data-hour="${hourInt}">
          <div class="time-label-cell">${timeStr}</div>
          ${weekDates
            .map(
              (d) => `
            <div class="time-grid-cell" data-date="${d.date}" data-hour="${hourInt}" onclick="moadumApp.handleCellClick('${d.date}', '${timeStr}')">
              <!-- 일정 블록이 들어갈 자리 -->
            </div>
          `
            )
            .join("")}
        </div>
      `;
    });

    bodyEl.innerHTML = rowsHTML;

    // 일정 블록 배치
    // 1) 10/29(화) 14:00 ~ 16:00: 블로그 초안 (green)
    // 2) 10/31(목) 10:00 ~ 12:00: 면접 준비 (purple, 카카오뱅크 1차 면접)
    // 3) 11/03(일) 14:00 ~ 18:00: 지원 마감 (red, 현대카드)
    this.placeTimeBlock("2024-10-29", 14, 2, "sch_2", "블로그 초안", "14:00 ~ 16:00", "green");
    this.placeTimeBlock("2024-10-31", 10, 2, "sch_1", "면접 준비", "10:00 ~ 12:00<br>카카오뱅크 1차 면접", "purple");
    this.placeTimeBlock("2024-11-03", 14, 4, "sch_3", "지원 마감", "현대카드 채용", "red");
  }

  placeTimeBlock(dateStr, startHour, durationHours, scheduleId, title, subtext, colorClass) {
    const targetCell = document.querySelector(`.time-grid-cell[data-date="${dateStr}"][data-hour="${startHour}"]`);
    if (!targetCell) return;

    const blockHeight = durationHours * 48 - 6; // 48px per hour
    const block = document.createElement("div");
    block.className = `cal-time-block ${colorClass}`;
    block.style.height = `${blockHeight}px`;
    block.innerHTML = `
      <div class="block-title">${title}</div>
      <div class="block-time">${subtext}</div>
    `;
    block.onclick = (e) => {
      e.stopPropagation();
      this.selectedScheduleId = scheduleId;
      this.selectedScheduleDate = dateStr;
      this.renderScheduleSideDetail();
    };
    targetCell.appendChild(block);
  }

  handleCellClick(dateStr, timeStr) {
    this.selectedScheduleDate = dateStr;
    this.renderScheduleSideDetail();
  }

  selectDate(dateStr) {
    this.selectedScheduleDate = dateStr;
    this.renderScheduleSideDetail();
  }

  // 월간 달력 렌더링
  renderMonthView() {
    const grid = document.getElementById("month-calendar-grid");
    const schedules = this.storage.data.schedules;

    let cellsHTML = "";
    for (let day = 1; day <= 31; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const fullDate = `2024-10-${dayStr}`;
      const daySchedules = schedules.filter((s) => s.date === fullDate);

      cellsHTML += `
        <div class="month-day-cell" onclick="moadumApp.selectDate('${fullDate}')">
          <div class="month-day-num">${day}</div>
          ${daySchedules
            .map(
              (s) => `
            <div class="month-cal-badge" style="background-color:var(--${s.categoryColor === "purple" ? "primary-light" : s.categoryColor === "red" ? "accent-red-bg" : "accent-green-bg"}); color:var(--${s.categoryColor === "purple" ? "primary-text" : s.categoryColor === "red" ? "accent-red-text" : "accent-green-text"}); font-weight:600;">
              ${s.title}
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }
    grid.innerHTML = cellsHTML;
  }

  // 리스트 뷰 렌더링
  renderListView() {
    const listEl = document.getElementById("calendar-list-container");
    const schedules = this.storage.data.schedules;

    listEl.innerHTML = schedules
      .map((s) => {
        return `
        <div class="linked-item-pill" style="padding:14px;" onclick="moadumApp.selectedScheduleId='${s.id}'; moadumApp.selectedScheduleDate='${s.date}'; moadumApp.renderScheduleSideDetail();">
          <div class="linked-item-left">
            <span class="tag-badge" style="background-color:var(--${s.categoryColor === "purple" ? "primary-light" : s.categoryColor === "red" ? "accent-red-bg" : "accent-green-bg"}); color:var(--${s.categoryColor === "purple" ? "primary-text" : s.categoryColor === "red" ? "accent-red-text" : "accent-green-text"});">
              ${s.type}
            </span>
            <div>
              <div class="linked-item-title">${s.title} (${s.company || ""})</div>
              <div class="linked-item-sub">${s.date} ${s.startTime} ~ ${s.endTime}</div>
            </div>
          </div>
          <button class="btn-secondary" style="font-size:11px;padding:4px 8px;">자세히 보기</button>
        </div>
      `;
      })
      .join("");
  }

  // 일정 우측 상세 패널 (최종 시안 100% 동일)
  renderScheduleSideDetail() {
    const sidePanel = document.getElementById("schedule-side-panel");
    const schedule = this.storage.data.schedules.find((s) => s.id === this.selectedScheduleId) || this.storage.data.schedules[0];

    if (!schedule) {
      sidePanel.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">선택된 일정이 없습니다.</div>`;
      return;
    }

    // 날짜 포맷 (예: 11월 3일 (일))
    const dateObj = new Date(schedule.date);
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];
    const dateTitle = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${dayNames[dateObj.getDay()]})`;

    // 연결된 자료 목록
    const linkedIds = schedule.linkedItemIds || [];
    const linkedItems = this.storage.data.items.filter((i) => linkedIds.includes(i.id));

    sidePanel.innerHTML = `
      <div class="side-panel-date-title">${dateTitle}</div>

      <!-- 메인 일정 카드 (지원 마감 D-3) -->
      <div class="side-schedule-hero-card" style="background-color: ${schedule.categoryColor === "red" ? "var(--accent-red-bg)" : "var(--primary-light)"}; border-color: ${schedule.categoryColor === "red" ? "var(--accent-red-border)" : "var(--primary-border)"};">
        <div class="side-hero-top">
          <div class="side-hero-title" style="color: ${schedule.categoryColor === "red" ? "var(--accent-red-text)" : "var(--primary-text)"};">
            <i data-lucide="alert-circle" style="width:16px;height:16px;"></i>
            <span>${schedule.title}</span>
          </div>
          <span class="dday-badge" style="background-color: ${schedule.categoryColor === "red" ? "var(--accent-red-text)" : "var(--primary)"};">D-3</span>
        </div>

        <div class="side-hero-meta">
          <div><strong>일시:</strong> ${schedule.date} ${schedule.startTime}</div>
          <div><strong>대상:</strong> ${schedule.company || "-"}</div>
        </div>

        <div class="side-hero-memo">
          ${schedule.memo || "등록된 메모가 없습니다."}
        </div>
      </div>

      <!-- 연결된 자료 (2) 섹션 -->
      <div class="linked-items-section">
        <div class="linked-section-header">
          <span>연결된 자료 (${linkedItems.length})</span>
        </div>

        ${linkedItems
          .map(
            (item) => `
          <div class="linked-item-pill" onclick="moadumApp.openItemDetail('${item.id}')">
            <div class="linked-item-left">
              <i data-lucide="${item.type === "image" ? "image" : item.type === "link" ? "link" : "file-text"}" style="width:16px;height:16px;color:var(--primary);"></i>
              <div>
                <div class="linked-item-title">${item.title}</div>
                <div class="linked-item-sub">${item.type === "memo" ? "메모" : item.type === "link" ? "링크" : "문서"} · ${item.createdAt.slice(5, 10).replace("-", "월 ")}일</div>
              </div>
            </div>
            <button class="card-menu-btn" title="연결 해제" onclick="event.stopPropagation(); moadumApp.unlinkItemFromSchedule('${schedule.id}', '${item.id}')">
              <i data-lucide="unlink" style="width:14px;height:14px;"></i>
            </button>
          </div>
        `
          )
          .join("")}

        <!-- [+ 자료 연결] 버튼 -->
        <button class="btn-link-more-item" onclick="moadumApp.openLinkItemsModal('${schedule.id}')">
          <i data-lucide="plus" style="width:14px;height:14px;"></i>
          <span>자료 연결</span>
        </button>
      </div>
    `;

    this.refreshIcons();
  }

  unlinkItemFromSchedule(scheduleId, itemId) {
    const sch = this.storage.data.schedules.find((s) => s.id === scheduleId);
    if (!sch) return;
    sch.linkedItemIds = (sch.linkedItemIds || []).filter((id) => id !== itemId);
    this.storage.save();
    this.showToast("연결된 자료가 해제되었습니다.");
    this.renderScheduleSideDetail();
  }

  // =========================================================================
  // 5. 빠른 저장 모달 (Quick Save Modal - 최종 시안 좌하단 100% 동일)
  // =========================================================================
  openQuickSave(preselectedBoard = "job") {
    this.quickSaveTags = [];
    this.currentUploadedImageDataUrl = null;

    document.getElementById("qs-meta-title").value = "";
    document.getElementById("qs-memo-body").value = "";
    document.getElementById("qs-image-desc").value = "";
    document.getElementById("qs-link-url").value = "";
    document.getElementById("qs-link-desc").value = "";

    // 보드 셀렉트 설정
    const boardSelect = document.getElementById("qs-meta-board");
    if (boardSelect) {
      boardSelect.value = preselectedBoard;
      this.handleBoardSelectChange();
    }

    this.renderQuickSaveTags();
    this.clearImageUpload();
    this.setQuickSaveTab("memo");
    this.openModal("modal-quick-save");
  }

  setQuickSaveTab(type) {
    ["memo", "image", "link", "schedule"].forEach((t) => {
      document.getElementById(`qs-tab-${t}`)?.classList.toggle("active", t === type);
      const content = document.getElementById(`qs-content-${t}`);
      if (content) content.style.display = t === type ? "block" : "none";
    });
    this.refreshIcons();
  }

  handleBoardSelectChange() {
    const boardId = document.getElementById("qs-meta-board").value;
    const subcatSelect = document.getElementById("qs-meta-subcat");
    subcatSelect.innerHTML = "";

    if (boardId === "inbox") {
      subcatSelect.innerHTML = `<option value="">분류 없음 (임시 보관함)</option>`;
      return;
    }

    const board = this.storage.data.boards.find((b) => b.id === boardId);
    if (board && board.subcategories.length > 0) {
      board.subcategories.forEach((sub) => {
        subcatSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
      });
    } else {
      subcatSelect.innerHTML = `<option value="">일반</option>`;
    }
  }

  // =========================================================================
  // 해시태그 자동완성 추천 시스템 (사용자 요청: 블로그 스타일 파란색 박스)
  // =========================================================================
  getAllAvailableTags() {
    // 1. 사용자 첨부 이미지 및 자주 쓰이는 대표 해시태그
    const baseTags = [
      "취준생지원금", "취준생키우기공략", "취준생", "취준생일기", "취업준비", "첫글",
      "데이터기획", "면접예상질문", "면접준비", "자소서소재", "기업분석",
      "카카오뱅크", "토스", "현대카드", "블로그글감", "동기부여",
      "합격후기", "포트폴리오", "인턴십", "스터디", "SQL", "파이썬"
    ];

    // 2. DB에 저장된 실제 태그들 합치기
    const set = new Set(baseTags);
    if (this.storage && this.storage.data && this.storage.data.items) {
      this.storage.data.items.forEach(item => {
        if (item.tags) {
          item.tags.forEach(t => set.add(t));
        }
      });
    }
    return Array.from(set);
  }

  // 태그 입력창(# 또는 글자 입력 시) 추천 노출
  handleTagTextInput(event) {
    const input = event.target;
    const rawVal = input.value.trim();

    if (!rawVal) {
      document.getElementById("qs-tag-autocomplete-wrap").style.display = "none";
      return;
    }

    // '#'만 입력했거나 '#단어' 입력 시 쿼리 추출
    const query = rawVal.startsWith("#") ? rawVal.substring(1) : rawVal;
    this.renderTagSuggestions(query);
  }

  renderTagSuggestions(query = "") {
    const wrap = document.getElementById("qs-tag-autocomplete-wrap");
    const bar = document.getElementById("qs-tag-recommend-bar");
    if (!wrap || !bar) return;

    const allTags = this.getAllAvailableTags();
    const qLower = query.toLowerCase();

    // 쿼리와 일치하는 태그 필터 (빈 쿼리면 상위 인기 태그 추천)
    let filtered = allTags.filter(t => !qLower || t.toLowerCase().includes(qLower));

    // 이미 추가된 태그는 제외
    filtered = filtered.filter(t => !this.quickSaveTags.includes(t));

    // 만약 사용자가 완전히 새로운 태그를 치고 있다면, 맨 앞에 입력값 자체를 추천으로 추가
    if (query && !filtered.includes(query)) {
      filtered.unshift(query);
    }

    if (filtered.length === 0) {
      wrap.style.display = "none";
      return;
    }

    wrap.style.display = "block";
    bar.innerHTML = `
      <span class="hashtag-bar-label">
        <i data-lucide="sparkles" style="width:13px;height:13px;"></i>
        <span>추천</span>
      </span>
      ${filtered.slice(0, 10).map(tag => `
        <button type="button" class="hashtag-chip-btn" onclick="moadumApp.selectTagSuggestion('${tag}')">
          #${tag}
        </button>
      `).join("")}
    `;

    this.refreshIcons();
  }

  selectTagSuggestion(tag) {
    const cleanTag = tag.replace(/^#/, "").trim();
    if (cleanTag && !this.quickSaveTags.includes(cleanTag)) {
      this.quickSaveTags.push(cleanTag);
      this.renderQuickSaveTags();
    }

    // 입력창 초기화 및 추천 닫기
    const input = document.getElementById("qs-tag-input");
    if (input) {
      input.value = "";
      input.focus();
    }
    const wrap = document.getElementById("qs-tag-autocomplete-wrap");
    if (wrap) wrap.style.display = "none";

    this.showToast(`'#${cleanTag}' 태그가 추가되었습니다.`);
  }

  // 태그 입력 핸들러 (Enter 키로 태그 추가)
  handleTagInput(event) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const input = document.getElementById("qs-tag-input");
      const val = input.value.trim().replace(/^#/, "");
      if (val && !this.quickSaveTags.includes(val)) {
        this.quickSaveTags.push(val);
        input.value = "";
        this.renderQuickSaveTags();
      }
      document.getElementById("qs-tag-autocomplete-wrap").style.display = "none";
    } else if (event.key === "Escape") {
      document.getElementById("qs-tag-autocomplete-wrap").style.display = "none";
    }
  }

  // 메모 본문 입력 중 '#' 입력 감지 및 상단 추천 바 표시
  handleMemoBodyInput(event) {
    this.updateMemoCharCount();
    const textarea = event.target;
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;

    // 커서 바로 앞의 텍스트에서 마지막 단어 확인
    const textBeforeCursor = text.slice(0, cursorPos);
    const match = /(?:^|\s)#([^\s#]*)$/.exec(textBeforeCursor);

    const barWrap = document.getElementById("memo-hashtag-bar-wrap");
    const bar = document.getElementById("memo-hashtag-recommend-bar");

    if (match) {
      const query = match[1] || "";
      const allTags = this.getAllAvailableTags();
      const qLower = query.toLowerCase();

      let filtered = allTags.filter(t => !qLower || t.toLowerCase().includes(qLower));
      if (query && !filtered.includes(query)) {
        filtered.unshift(query);
      }

      if (filtered.length > 0) {
        barWrap.classList.add("active");
        bar.innerHTML = `
          <span class="hashtag-bar-label">
            <i data-lucide="tag" style="width:13px;height:13px;"></i>
            <span>본문 태그</span>
          </span>
          ${filtered.slice(0, 10).map(tag => `
            <button type="button" class="hashtag-chip-btn" onclick="moadumApp.selectMemoTagSuggestion('${tag}')">
              #${tag}
            </button>
          `).join("")}
        `;
        this.refreshIcons();
        return;
      }
    }

    barWrap.classList.remove("active");
  }

  // 메모 본문에서 추천 태그 클릭 시 본문 자동완성 및 태그 메타데이터 동시 등록
  selectMemoTagSuggestion(tag) {
    const cleanTag = tag.replace(/^#/, "").trim();
    const textarea = document.getElementById("qs-memo-body");
    if (!textarea) return;

    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);

    // 커서 앞의 '#단어'를 '#선택한태그 '로 치환
    const match = /(?:^|\s)#([^\s#]*)$/.exec(textBeforeCursor);
    if (match) {
      const replaceStart = textBeforeCursor.lastIndexOf("#" + match[1]);
      const newBefore = textBeforeCursor.slice(0, replaceStart) + `#${cleanTag} `;
      textarea.value = newBefore + textAfterCursor;
      textarea.selectionStart = textarea.selectionEnd = newBefore.length;
    }

    // 우측 태그 칩에도 자동으로 추가!
    if (!this.quickSaveTags.includes(cleanTag)) {
      this.quickSaveTags.push(cleanTag);
      this.renderQuickSaveTags();
    }

    document.getElementById("memo-hashtag-bar-wrap").classList.remove("active");
    textarea.focus();
    this.updateMemoCharCount();
    this.showToast(`'#${cleanTag}' 태그가 본문과 태그 목록에 추가되었습니다.`);
  }

  removeQuickTag(tag) {
    this.quickSaveTags = this.quickSaveTags.filter((t) => t !== tag);
    this.renderQuickSaveTags();
  }

  renderQuickSaveTags() {
    const container = document.getElementById("qs-tag-container");
    const input = document.getElementById("qs-tag-input");
    // 기존 칩들 제거 후 재구성
    container.querySelectorAll(".tag-entry-chip").forEach((el) => el.remove());

    this.quickSaveTags.forEach((t) => {
      const chip = document.createElement("span");
      chip.className = "tag-entry-chip";
      chip.innerHTML = `#${t} <span class="tag-delete-x" onclick="moadumApp.removeQuickTag('${t}')">×</span>`;
      container.insertBefore(chip, input);
    });
  }

  // 이미지 업로드 핸들러
  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("이미지 파일 크기는 최대 10MB까지 가능합니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.currentUploadedImageDataUrl = e.target.result;
      this.showImagePreview(this.currentUploadedImageDataUrl);
    };
    reader.readAsDataURL(file);
  }

  loadSampleOtterMeme() {
    this.currentUploadedImageDataUrl = "assets/otter_meme.png";
    this.showImagePreview(this.currentUploadedImageDataUrl);
    document.getElementById("qs-meta-title").value = "오늘도 할 수 있다 짤";
    document.getElementById("qs-image-desc").value = "오늘도 할 수 있다...! 취준 파이팅 🙏";
    this.updateImageDescCharCount();

    // 짤 보관함 & 동기부여 보드로 맞추기
    document.getElementById("qs-meta-board").value = "memes";
    this.handleBoardSelectChange();
    document.getElementById("qs-meta-subcat").value = "동기부여";

    // 태그 추가
    this.quickSaveTags = ["짤", "동기부여", "취준"];
    this.renderQuickSaveTags();
    this.showToast("샘플 수달 짤과 추천 메타데이터가 적용되었습니다!");
  }

  showImagePreview(src) {
    document.getElementById("qs-dropzone-prompt").style.display = "none";
    const previewContainer = document.getElementById("qs-image-preview-container");
    const previewImg = document.getElementById("qs-image-preview-img");
    previewImg.src = src;
    previewContainer.style.display = "block";
    this.refreshIcons();
  }

  clearImageUpload() {
    this.currentUploadedImageDataUrl = null;
    document.getElementById("qs-image-file-input").value = "";
    document.getElementById("qs-dropzone-prompt").style.display = "block";
    document.getElementById("qs-image-preview-container").style.display = "none";
  }

  updateMemoCharCount() {
    const len = document.getElementById("qs-memo-body")?.value.length || 0;
    document.getElementById("qs-memo-counter").textContent = `${len.toLocaleString()} / 2,000`;
  }

  updateImageDescCharCount() {
    const len = document.getElementById("qs-image-desc")?.value.length || 0;
    document.getElementById("qs-image-desc-counter").textContent = `${len} / 500`;
  }

  // 저장하기 실행
  saveQuickItem(forceInbox = false) {
    const title = document.getElementById("qs-meta-title")?.value.trim();
    if (!title) {
      alert("제목을 입력해주세요.");
      document.getElementById("qs-meta-title")?.focus();
      return;
    }

    const activeTab = document.querySelector(".qs-tab-btn.active")?.id.replace("qs-tab-", "") || "memo";
    const boardId = forceInbox ? null : document.getElementById("qs-meta-board").value === "inbox" ? null : document.getElementById("qs-meta-board").value;
    const subcategory = forceInbox ? null : document.getElementById("qs-meta-subcat").value || null;

    let content = "";
    let summary = "";
    let url = "";
    let image = null;

    if (activeTab === "memo") {
      content = document.getElementById("qs-memo-body").value;
      summary = content.slice(0, 150);
    } else if (activeTab === "image") {
      content = document.getElementById("qs-image-desc").value;
      summary = content.slice(0, 150);
      image = this.currentUploadedImageDataUrl || "assets/otter_thumb.png";
    } else if (activeTab === "link") {
      url = document.getElementById("qs-link-url").value;
      content = document.getElementById("qs-link-desc").value;
      summary = content || url;
    } else if (activeTab === "schedule") {
      // 일정 저장 시 schedules에도 동시 등록
      const date = document.getElementById("qs-sch-date").value;
      const start = document.getElementById("qs-sch-start").value;
      const end = document.getElementById("qs-sch-end").value;
      const place = document.getElementById("qs-sch-place").value;

      const newSch = {
        id: "sch_" + Date.now(),
        title: title,
        type: "면접 준비",
        categoryColor: "purple",
        date: date,
        startTime: start,
        endTime: end,
        company: place,
        memo: content,
        tags: [...this.quickSaveTags],
        linkedItemIds: []
      };
      this.storage.data.schedules.push(newSch);
    }

    const newItem = {
      id: "item_" + Date.now(),
      type: activeTab,
      boardId: boardId,
      subcategory: subcategory,
      title: title,
      summary: summary,
      content: content,
      url: url,
      image: image,
      tags: [...this.quickSaveTags],
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    this.storage.data.items.unshift(newItem);
    // 용량 증가 시뮬레이션
    this.storage.data.currentUser.usedStorageMB += 2;
    this.storage.save();

    this.closeModal("modal-quick-save");
    this.updateInboxBadge();
    this.updateStorageWidgets();
    this.showToast(forceInbox ? "임시 보관함에 저장되었습니다 📥" : "자료가 성공적으로 저장되었습니다 ✨");

    if (this.currentView === "home") this.renderHome();
    else if (this.currentView === "board") this.renderCurrentBoardCards();
    else if (this.currentView === "inbox") this.renderInbox();
  }

  // =========================================================================
  // 6. 보드·소제목 이동 모달
  // =========================================================================
  openMoveBoardModal(itemId) {
    document.getElementById("move-target-item-id").value = itemId;
    this.updateMoveSubcategories();
    this.openModal("modal-move-board");
  }

  updateMoveSubcategories() {
    const boardId = document.getElementById("move-select-board").value;
    const subcatSelect = document.getElementById("move-select-subcat");
    subcatSelect.innerHTML = "";
    const board = this.storage.data.boards.find((b) => b.id === boardId);
    if (board && board.subcategories.length > 0) {
      board.subcategories.forEach((sub) => {
        subcatSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
      });
    }
  }

  confirmMoveItem() {
    const itemId = document.getElementById("move-target-item-id").value;
    const boardId = document.getElementById("move-select-board").value;
    const subcategory = document.getElementById("move-select-subcat").value;

    const item = this.storage.data.items.find((i) => i.id === itemId);
    if (!item) return;

    item.boardId = boardId;
    item.subcategory = subcategory;
    this.storage.save();

    const board = this.storage.data.boards.find((b) => b.id === boardId);
    this.closeModal("modal-move-board");
    this.updateInboxBadge();
    this.showToast(`'${board ? board.name : "선택한 보드"}'(으)로 이동되었습니다.`);

    if (this.currentView === "inbox") this.renderInbox();
    else if (this.currentView === "board") this.renderCurrentBoardCards();
    else if (this.currentView === "home") this.renderHome();
  }

  // =========================================================================
  // 7. 자료 상세 보기 및 수정 모달
  // =========================================================================
  openItemDetail(itemId) {
    const item = this.storage.data.items.find((i) => i.id === itemId);
    if (!item) return;

    document.getElementById("detail-type-badge").textContent = item.type === "image" ? "이미지" : item.type === "link" ? "링크" : "메모";
    document.getElementById("detail-date-text").textContent = item.createdAt.slice(0, 10);

    const body = document.getElementById("item-detail-modal-body");
    const footer = document.getElementById("item-detail-modal-footer");

    body.innerHTML = `
      <div style="margin-bottom:16px;">
        <h2 style="font-size:20px;font-weight:800;color:var(--text-title);margin-bottom:8px;">${item.title}</h2>
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
          ${(item.tags || []).map((t) => `<span class="tag-badge">#${t}</span>`).join("")}
        </div>
      </div>

      ${item.image ? `<div style="text-align:center;margin-bottom:16px;background:#000;border-radius:12px;padding:8px;"><img src="${item.image}" style="max-height:360px;margin:0 auto;object-fit:contain;"></div>` : ""}

      ${item.url ? `
        <div style="background:var(--primary-light);border:1px solid var(--primary-border);border-radius:8px;padding:12px 14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
          <a href="${item.url}" target="_blank" style="color:var(--primary);font-size:13px;word-break:break-all;text-decoration:underline;">${item.url}</a>
          <a href="${item.url}" target="_blank" class="btn-primary" style="font-size:11px;padding:5px 10px;white-space:nowrap;">새 창 열기</a>
        </div>
      ` : ""}

      <div style="font-size:14px;line-height:1.7;color:var(--text-body);white-space:pre-wrap;background:var(--bg-app);padding:16px;border-radius:10px;border:1px solid var(--border-light);">
        ${item.content || item.summary || "등록된 본문 내용이 없습니다."}
      </div>
    `;

    footer.innerHTML = `
      <button class="btn-secondary" style="color:var(--accent-red-text);" onclick="moadumApp.deleteItem('${item.id}')">
        <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
        <span>삭제</span>
      </button>
      <button class="btn-primary" onclick="moadumApp.closeModal('modal-item-detail')">닫기</button>
    `;

    this.openModal("modal-item-detail");
    this.refreshIcons();
  }

  deleteItem(itemId) {
    if (!confirm("정말 이 자료를 삭제하시겠습니까?")) return;
    this.storage.data.items = this.storage.data.items.filter((i) => i.id !== itemId);
    this.storage.save();
    this.closeModal("modal-item-detail");
    this.showToast("자료가 삭제되었습니다.");

    if (this.currentView === "home") this.renderHome();
    else if (this.currentView === "board") this.renderCurrentBoardCards();
    else if (this.currentView === "inbox") this.renderInbox();
  }

  // =========================================================================
  // 8. 일정 추가 모달
  // =========================================================================
  openAddScheduleModal() {
    document.getElementById("add-sch-title").value = "";
    document.getElementById("add-sch-company").value = "";
    document.getElementById("add-sch-memo").value = "";
    this.openModal("modal-add-schedule");
  }

  saveSchedule() {
    const title = document.getElementById("add-sch-title").value.trim();
    if (!title) {
      alert("일정 제목을 입력해주세요.");
      return;
    }
    const type = document.getElementById("add-sch-type").value;
    const date = document.getElementById("add-sch-date").value;
    const startTime = document.getElementById("add-sch-start").value;
    const endTime = document.getElementById("add-sch-end").value;
    const company = document.getElementById("add-sch-company").value;
    const memo = document.getElementById("add-sch-memo").value;

    let categoryColor = "purple";
    if (type.includes("마감")) categoryColor = "red";
    else if (type.includes("블로그") || type.includes("초안")) categoryColor = "green";

    const newSch = {
      id: "sch_" + Date.now(),
      title: title,
      type: type,
      categoryColor: categoryColor,
      date: date,
      startTime: startTime,
      endTime: endTime,
      company: company,
      memo: memo,
      tags: [type],
      linkedItemIds: []
    };

    this.storage.data.schedules.push(newSch);
    this.storage.save();

    this.closeModal("modal-add-schedule");
    this.showToast("새 일정이 등록되었습니다 📅");
    this.selectedScheduleId = newSch.id;
    this.selectedScheduleDate = date;
    this.renderSchedule();
  }

  // =========================================================================
  // 9. 일정에 자료 연결 모달
  // =========================================================================
  openLinkItemsModal(scheduleId) {
    this.activeScheduleIdForLinking = scheduleId;
    this.renderLinkableItemsList();
    this.openModal("modal-link-items");
  }

  renderLinkableItemsList() {
    const sch = this.storage.data.schedules.find((s) => s.id === this.activeScheduleIdForLinking);
    if (!sch) return;
    const searchVal = document.getElementById("link-items-search-input")?.value.trim().toLowerCase() || "";
    const linkedIds = sch.linkedItemIds || [];

    let items = this.storage.data.items;
    if (searchVal) {
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(searchVal) ||
          (i.tags && i.tags.some((t) => t.toLowerCase().includes(searchVal)))
      );
    }

    const listEl = document.getElementById("linkable-items-list");
    listEl.innerHTML = items
      .map((item) => {
        const isChecked = linkedIds.includes(item.id);
        return `
        <label class="linked-item-pill" style="cursor:pointer;">
          <div class="linked-item-left">
            <input type="checkbox" class="link-item-checkbox" value="${item.id}" ${isChecked ? "checked" : ""} style="accent-color:var(--primary);width:16px;height:16px;">
            <div>
              <div class="linked-item-title">${item.title}</div>
              <div class="linked-item-sub">${item.type === "memo" ? "메모" : item.type === "link" ? "링크" : "이미지"} · ${(item.tags || []).join(", ")}</div>
            </div>
          </div>
        </label>
      `;
      })
      .join("");
  }

  confirmLinkItems() {
    const sch = this.storage.data.schedules.find((s) => s.id === this.activeScheduleIdForLinking);
    if (!sch) return;

    const checkboxes = document.querySelectorAll(".link-item-checkbox:checked");
    sch.linkedItemIds = Array.from(checkboxes).map((cb) => cb.value);
    this.storage.save();

    this.closeModal("modal-link-items");
    this.showToast("자료가 일정에 연결되었습니다 🔗");
    this.renderScheduleSideDetail();
  }

  // =========================================================================
  // 10. 통합 검색 & 고급 검색
  // =========================================================================
  handleGlobalSearch() {
    const keyword = document.getElementById("global-search-input").value.trim();
    if (!keyword) return;

    this.navigate("search");
    document.getElementById("search-keyword-display").textContent = `'${keyword}'`;

    const results = this.storage.data.items.filter((item) => {
      const kw = keyword.toLowerCase();
      return (
        item.title.toLowerCase().includes(kw) ||
        (item.summary && item.summary.toLowerCase().includes(kw)) ||
        (item.content && item.content.toLowerCase().includes(kw)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(kw)))
      );
    });

    document.getElementById("search-count-display").textContent = results.length;
    const grid = document.getElementById("search-cards-grid");

    if (results.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 60px 20px;">
          <div style="font-size: 36px; margin-bottom: 12px;">🔍</div>
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-title); margin-bottom: 4px;">일치하는 검색 결과가 없습니다</h3>
          <p style="font-size: 13px; color: var(--text-muted);">다른 검색어나 태그로 다시 검색해보세요.</p>
        </div>
      `;
    } else {
      grid.innerHTML = results.map((item) => this.generateCardHTML(item)).join("");
    }
    this.refreshIcons();
  }

  executeAdvancedSearch() {
    const kw = document.getElementById("adv-search-keyword").value.trim().toLowerCase();
    const favOnly = document.getElementById("adv-fav-only").checked;

    const allowedBoards = [];
    if (document.getElementById("adv-board-job").checked) allowedBoards.push("job");
    if (document.getElementById("adv-board-blog").checked) allowedBoards.push("blog");
    if (document.getElementById("adv-board-posts").checked) allowedBoards.push("posts");
    if (document.getElementById("adv-board-memes").checked) allowedBoards.push("memes");

    const allowedTypes = [];
    if (document.getElementById("adv-type-memo").checked) allowedTypes.push("memo");
    if (document.getElementById("adv-type-image").checked) allowedTypes.push("image");
    if (document.getElementById("adv-type-link").checked) allowedTypes.push("link");

    const results = this.storage.data.items.filter((item) => {
      if (favOnly && !item.isFavorite) return false;
      if (item.boardId && !allowedBoards.includes(item.boardId)) return false;
      if (!allowedTypes.includes(item.type)) return false;
      if (kw) {
        return (
          item.title.toLowerCase().includes(kw) ||
          (item.content && item.content.toLowerCase().includes(kw)) ||
          (item.tags && item.tags.some((t) => t.toLowerCase().includes(kw)))
        );
      }
      return true;
    });

    this.closeModal("modal-advanced-search");
    this.navigate("search");
    document.getElementById("search-keyword-display").textContent = kw ? `'${kw}' (고급 조건)` : `고급 필터`;
    document.getElementById("search-count-display").textContent = results.length;

    const grid = document.getElementById("search-cards-grid");
    grid.innerHTML = results.map((item) => this.generateCardHTML(item)).join("");
    this.refreshIcons();
  }

  // =========================================================================
  // 11. 알림 시스템
  // =========================================================================
  renderNotifications() {
    const list = document.getElementById("notif-dropdown-list");
    const notifications = this.storage.data.notifications;

    const unreadCount = notifications.filter((n) => !n.isRead).length;
    const dot = document.getElementById("notif-dot");
    if (dot) dot.style.display = unreadCount > 0 ? "block" : "none";

    list.innerHTML = notifications
      .map(
        (n) => `
      <div class="notif-row-item ${n.isRead ? "" : "unread"}" onclick="moadumApp.handleNotificationClick('${n.id}')">
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:700;color:var(--text-title);display:flex;align-items:center;gap:6px;">
            <span>${n.title}</span>
            ${n.dday ? `<span class="dday-badge" style="font-size:10px;padding:1px 5px;">${n.dday}</span>` : ""}
          </div>
          <div style="font-size:11.5px;color:var(--text-sub);margin-top:2px;">${n.subtitle}</div>
        </div>
      </div>
    `
      )
      .join("");
  }

  handleNotificationClick(notifId) {
    const notif = this.storage.data.notifications.find((n) => n.id === notifId);
    if (!notif) return;
    notif.isRead = true;
    this.storage.save();
    this.renderNotifications();
    this.closeAllDropdowns();

    if (notif.scheduleId) {
      this.selectedScheduleId = notif.scheduleId;
      const sch = this.storage.data.schedules.find((s) => s.id === notif.scheduleId);
      if (sch) this.selectedScheduleDate = sch.date;
      this.navigate("schedule");
    } else if (notif.route) {
      this.navigate(notif.route);
    }
  }

  markAllNotificationsRead() {
    this.storage.data.notifications.forEach((n) => (n.isRead = true));
    this.storage.save();
    this.renderNotifications();
    this.showToast("모든 알림을 읽음 처리했습니다.");
  }

  // =========================================================================
  // 12. 프로필 & 환경 설정
  // =========================================================================
  loadSettingsView() {
    const user = this.storage.data.currentUser;
    document.getElementById("settings-name-input").value = user.name;
    document.getElementById("settings-email-input").value = user.email;
    document.getElementById("settings-bio-input").value = user.bio;
    document.getElementById("settings-notif-web").checked = user.webNotifications;
    document.getElementById("settings-notif-email").checked = user.emailNotifications;
    if (user.avatar) {
      document.getElementById("settings-avatar-preview").src = user.avatar;
    }
  }

  saveProfileSettings() {
    const user = this.storage.data.currentUser;
    user.name = document.getElementById("settings-name-input").value.trim();
    user.email = document.getElementById("settings-email-input").value.trim();
    user.bio = document.getElementById("settings-bio-input").value.trim();
    user.webNotifications = document.getElementById("settings-notif-web").checked;
    user.emailNotifications = document.getElementById("settings-notif-email").checked;

    this.storage.save();
    this.updateUserHeader();
    this.showToast("프로필 설정이 저장되었습니다.");
  }

  handleAvatarChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.storage.data.currentUser.avatar = e.target.result;
      this.storage.save();
      this.updateUserHeader();
      document.getElementById("settings-avatar-preview").src = e.target.result;
      this.showToast("프로필 사진이 변경되었습니다.");
    };
    reader.readAsDataURL(file);
  }

  setTheme(theme) {
    this.applyTheme(theme);
    this.storage.data.currentUser.theme = theme;
    this.storage.save();
    this.showToast(`${theme === "dark" ? "다크" : "라이트"} 모드로 전환되었습니다.`);
  }

  applyTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }

  // =========================================================================
  // 13. 요금제 업그레이드 & 데이터 백업/복원
  // =========================================================================
  updatePricingView() {
    const user = this.storage.data.currentUser;
    const planBadge = document.getElementById("pricing-plan-badge");
    const storageDetail = document.getElementById("pricing-storage-detail");
    const bar = document.getElementById("pricing-storage-bar");
    const warn = document.getElementById("pricing-warning-text");
    const actionBtn = document.getElementById("btn-upgrade-action");

    if (user.plan === "pro") {
      planBadge.textContent = "프로 플랜 (Pro)";
      storageDetail.textContent = `${user.usedStorageMB}MB / 50GB (1% 사용)`;
      bar.style.width = "1%";
      bar.classList.remove("warning");
      warn.innerHTML = "✨ 프로 플랜의 무제한 혜택을 마음껏 이용하고 계십니다.";
      warn.style.color = "var(--accent-green-text)";
      actionBtn.innerHTML = "<span>현재 이용 중인 플랜</span>";
      actionBtn.disabled = true;
    } else {
      planBadge.textContent = "무료 플랜";
      storageDetail.textContent = `${user.usedStorageMB}MB / 500MB (97% 사용)`;
      bar.style.width = "97%";
      bar.classList.add("warning");
      warn.innerHTML = "⚠️ 저장 공간이 거의 찼습니다. 유료 플랜으로 업그레이드하고 50GB를 사용해보세요!";
      warn.style.color = "var(--accent-red-text)";
      actionBtn.innerHTML = "<span>프로 플랜으로 업그레이드</span>";
      actionBtn.disabled = false;
    }
  }

  handleUpgradePro() {
    if (confirm("월 ₩4,900 프로 플랜으로 업그레이드하시겠습니까?\n(체험 모의 결제: 50GB 저장 공간 및 유료 기능 즉시 활성화)")) {
      this.storage.data.currentUser.plan = "pro";
      this.storage.data.currentUser.totalStorageMB = 50 * 1024; // 50GB
      this.storage.save();
      this.updatePricingView();
      this.updateStorageWidgets();
      this.updateUserHeader();
      this.showToast("축하합니다! 프로 플랜으로 업그레이드되었습니다 🚀");
    }
  }

  exportBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.storage.data, null, 2));
    const downloadAnchor = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `moadum_backup_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast("자료 전체 백업 JSON 파일이 다운로드되었습니다 💾");
  }

  importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData && importedData.items && importedData.schedules) {
          this.storage.save(importedData);
          alert("백업 파일이 성공적으로 복원되었습니다. 화면을 새로고침합니다.");
          location.reload();
        } else {
          alert("올바르지 않은 모아둠 백업 파일 형식입니다.");
        }
      } catch (err) {
        alert("JSON 파일을 파싱하는 중 오류가 발생했습니다.");
      }
    };
    reader.readAsText(file);
  }

  resetDatabase() {
    if (confirm("정말 모든 데이터를 초기 샘플 데이터로 리셋하시겠습니까?")) {
      this.storage.reset();
      this.showToast("초기 샘플 데이터로 복원되었습니다.");
      this.init();
    }
  }

  loginDemo() {
    this.storage.data.currentUser.isLoggedIn = true;
    this.storage.save();
    this.showToast("소윤님 계정으로 로그인되었습니다! 환영합니다 💜");
    this.navigate("home");
  }

  logout() {
    if (confirm("로그아웃 하시겠습니까?")) {
      this.showToast("로그아웃 되었습니다.");
      this.navigate("login");
    }
  }

  // =========================================================================
  // 유틸리티
  // =========================================================================
  toggleDropdown(dropdownId) {
    const el = document.getElementById(dropdownId);
    if (!el) return;
    const isActive = el.classList.contains("active");
    this.closeAllDropdowns();
    if (!isActive) el.classList.add("active");
  }

  closeAllDropdowns() {
    document.querySelectorAll(".header-dropdown-menu").forEach((el) => el.classList.remove("active"));
  }

  openModal(modalId) {
    document.getElementById(modalId)?.classList.add("active");
  }

  closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove("active");
  }
}

// 앱 인스턴스 생성 및 시작
window.moadumApp = new MoadumApp();
window.addEventListener("DOMContentLoaded", () => {
  window.moadumApp.init();
});
