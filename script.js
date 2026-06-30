// ============================================================
// HOMESTEAD MEDIA — Main Application Script
// ============================================================

// ── Firebase ─────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyADo4bTrSIgnLwQkYXsIIbivyZSPcNHATM",
  authDomain: "audioaficionados-21ba0.firebaseapp.com",
  projectId: "audioaficionados-21ba0",
  storageBucket: "audioaficionados-21ba0.firebasestorage.app",
  messagingSenderId: "94178984100",
  appId: "1:94178984100:web:0b60930161c8c882e02631"
};

let _db = null;
function getDB() {
  if (_db) return _db;
  if (typeof firebase === 'undefined') return null;
  if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
  _db = firebase.firestore();
  return _db;
}

// ── State ─────────────────────────────────────────────────────
function emptyStationSchedule() {
  const blank = () => DAYS.map(() => ({ show: '', djs: [] }));
  return { point: blank(), two: blank() };
}

const S = {
  view: 'home',
  broadcastId: null,
  teacherMode: false,
  stationSchedule: emptyStationSchedule(),
  broadcasts: [],
  plannerStep: 0,
  plannerData: null,
  submissions: [],
  iasbEntries: [],
  iasbCategory: null,
  availabilities: [],
  lessonCourse: null,
  lessonUnit: null,
  lessonId: null,
  lessonSlide: 0,
  yearbookCoverage: [],
  customYbEvents: [],
  calendarYbEvents: [],
  ybDashView: 'event',
};

// ── Timing Helpers ────────────────────────────────────────────
function computeTimeOffset(gameTime, offsetMins) {
  if (!gameTime) return null;
  const m = gameTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const isPM = m[3].toUpperCase() === 'PM';
  if (isPM && h !== 12) h += 12;
  if (!isPM && h === 12) h = 0;
  let total = h * 60 + min - offsetMins;
  if (total < 0) total += 1440;
  const ch = Math.floor(total / 60);
  const cm = total % 60;
  const period = ch >= 12 ? 'PM' : 'AM';
  const dh = ch > 12 ? ch - 12 : ch === 0 ? 12 : ch;
  return `${dh}:${cm.toString().padStart(2, '0')} ${period}`;
}
function computeArrival(gameTime, type) {
  return computeTimeOffset(gameTime, ARRIVAL_MINS[type] ?? ARRIVAL_DEFAULT_MINS);
}
function computeDoor33(gameTime, type) {
  return computeTimeOffset(gameTime, (ARRIVAL_MINS[type] ?? ARRIVAL_DEFAULT_MINS) + DOOR_EXTRA_MINS);
}

// ── Router ────────────────────────────────────────────────────
function go(view, extra) {
  S.view = view;
  if (extra) Object.assign(S, extra);
  render();
  window.scrollTo(0, 0);
  if (view === 'dashboard') { dashboardLoadPlans(); loadYearbookCoverage(); }
  if (view === 'yearbook')  loadYearbookCoverage();
}

// ── Render ────────────────────────────────────────────────────
function render() {
  const app = document.getElementById('app');
  if (!app) return;
  switch (S.view) {
    case 'home':      app.innerHTML = renderHome();      break;
    case 'radio':     app.innerHTML = renderRadio();     break;
    case 'planner':   app.innerHTML = renderPlanner();   break;
    case 'live':      app.innerHTML = renderLive();      break;
    case 'broadcast': app.innerHTML = renderBroadcast(); break;
    case 'schedule':  app.innerHTML = renderSchedule();  break;
    case 'availability':  app.innerHTML = renderAvailabilityPage(); break;
    case 'yearbook':      app.innerHTML = renderYearbook();      break;
    case 'sports':        app.innerHTML = renderSports();        break;
    case 'indepth':       app.innerHTML = renderInDepth();       break;
    case 'iasb':          app.innerHTML = renderIASB();          break;
    case 'iasb-category': app.innerHTML = renderIASBCategory();  break;
    case 'dashboard':     app.innerHTML = renderDashboard();     break;
    case 'lessons':       app.innerHTML = renderLessons();       break;
    default:              app.innerHTML = renderHome();
  }
  attachListeners();
}

// ── Nav Bar ───────────────────────────────────────────────────
function navBar(active) {
  return `
    <nav class="top-nav">
      <span class="nav-logo" data-nav="home">Homestead Media</span>
      <div class="nav-links">
        <a class="${active === 'radio'    ? 'active' : ''}" data-nav="radio">📻 Radio</a>
        <a class="${active === 'live'     ? 'active' : ''}" data-nav="live">🎬 Live</a>
        <a class="${active === 'sports'   ? 'active' : ''}" data-nav="sports">🏟️ Sports</a>
        <a class="${active === 'yearbook' ? 'active' : ''}" data-nav="yearbook">📖 Yearbook</a>
        <a class="${active === 'indepth'  ? 'active' : ''}" data-nav="indepth">📺 In-Depth</a>
        <a class="${active === 'lessons'  ? 'active' : ''}" data-nav="lessons">📚 Lessons</a>
        ${S.teacherMode ? `<a class="${active === 'dashboard' ? 'active' : ''}" data-nav="dashboard" style="color:var(--radio)">📊 Dashboard</a>` : ''}
        <button class="teacher-btn ${S.teacherMode ? 'active' : ''}" id="teacher-toggle">
          ${S.teacherMode ? '🔓 Teacher' : '🔑'}
        </button>
      </div>
    </nav>`;
}

// ── HOME ──────────────────────────────────────────────────────
function renderHome() {
  return `
    <div class="home-page">
      <header class="home-header">
        <img src="images/logo-homestead-media.png" alt="Homestead Media" class="home-logo-img">
        <div class="home-tagline">Homestead High School — Media Arts Program</div>
      </header>
      <div class="class-grid">
        <div class="class-card radio-card" data-nav="radio">
          <div class="class-icon">📻</div>
          <div class="class-name">Radio Broadcasting</div>
          <div class="class-desc">Weekly talk shows, on-air performance, and the business of broadcasting.</div>
          <div class="class-enter">Enter →</div>
        </div>
        <div class="class-card live-card" data-nav="live">
          <div class="class-icon">🎬</div>
          <div class="class-name">Homestead Live</div>
          <div class="class-desc">Live event broadcasting — football, basketball, volleyball, and more.</div>
          <div class="class-enter">Enter →</div>
        </div>
        <div class="class-card yearbook-card" data-nav="yearbook">
          <div class="class-icon">📖</div>
          <div class="class-name">Yearbook</div>
          <div class="class-desc">Documenting the year — photography, design, and storytelling.</div>
          <div class="class-enter">Enter →</div>
        </div>
        <div class="class-card sports-card" data-nav="sports">
          <div class="class-icon">🏟️</div>
          <div class="class-name">Sports Broadcasting</div>
          <div class="class-desc">Play-by-play, color commentary, and live crew for Homestead athletics.</div>
          <div class="class-enter">Enter →</div>
        </div>
        <div class="class-card indepth-card" data-nav="indepth">
          <div class="class-icon">📺</div>
          <div class="class-name">HHS In-Depth</div>
          <div class="class-desc">TV news production — anchoring, reporting, packages, and live shots.</div>
          <div class="class-enter">Enter →</div>
        </div>
      </div>
    </div>`;
}

// ── RADIO ─────────────────────────────────────────────────────
function renderStationCard(station) {
  const slots = (S.stationSchedule[station.id] || []);
  const rows = DAYS.map((day, i) => {
    const slot = slots[i] || { show: '', djs: [] };
    const hasShow = slot.show && slot.show.trim();
    const djList = (slot.djs || []).join(', ');
    return `
      <div class="sched-row ${hasShow ? 'filled' : 'empty'}">
        <div class="sched-day">${day.slice(0,3)}</div>
        <div class="sched-info">
          <div class="sched-show">${hasShow ? esc(slot.show) : '<span class="dim">TBD</span>'}</div>
          ${djList ? `<div class="sched-djs">${esc(djList)}</div>` : ''}
        </div>
        ${S.teacherMode ? `<button class="slot-edit-btn btn-sm" data-station="${station.id}" data-day="${i}">Edit</button>` : ''}
      </div>`;
  }).join('');

  return `
    <section class="card station-card">
      <div class="station-card-header" style="border-bottom:2px solid ${station.color}">
        <div>
          <div class="station-name" style="color:${station.color}">${station.name}</div>
          <div class="station-freq">${station.freq}</div>
        </div>
      </div>
      <div class="sched-list">${rows}</div>
    </section>`;
}

function renderRadio() {
  const stationCards = STATIONS.map(renderStationCard).join('');

  return `
    ${navBar('radio')}
    <div class="class-page">
      <div class="class-header">
        <div class="radio-header-logos">
          <img src="images/logo-wcyt-point.png" alt="The Point 91FM" class="class-header-logo">
          <img src="images/logo-2point0.png" alt="WCYT 2.0" class="class-header-logo">
        </div>
        <div>
          <h1>Radio Broadcasting</h1>
          <p>Your show, your voice, your audience.</p>
        </div>
      </div>
      <div class="page-grid">
        <div class="main-col">
          <div class="station-grid">${stationCards}</div>
        </div>
        <div class="side-col">
          <section class="card action-card radio-action">
            <div class="action-icon">🎙️</div>
            <h3>DJ Panel</h3>
            <p>Set your on-air status — On Air, On Break, or End Show.</p>
            <p class="action-cred">Password: <code>Homestead911-2.0</code></p>
            <a class="btn-primary" href="https://wcyt.org/dj" target="_blank" rel="noopener">Open DJ Panel ↗</a>
          </section>
          <section class="card action-card radio-action">
            <div class="action-icon">✍️</div>
            <h3>Talk Show Planner</h3>
            <p>Plan your show's theme and on-air breaks — step by step.</p>
            <button class="btn-primary" id="start-planner">Start Planning →</button>
          </section>
          <section class="card action-card radio-action">
            <div class="action-icon">🏆</div>
            <h3>IASB Competition</h3>
            <p>Track entries, checklists, and file uploads for IASB.</p>
            <button class="btn-primary" id="open-iasb">Open IASB Hub →</button>
          </section>
          ${S.teacherMode ? `
          <section class="card action-card">
            <div class="action-icon">📋</div>
            <h3>Student Submissions</h3>
            <p>Review submitted Talk Show plans.</p>
            <button class="btn-secondary" id="view-submissions">View All</button>
          </section>` : ''}
        </div>
      </div>
    </div>`;
}

// ── TALK SHOW PLANNER ─────────────────────────────────────────
function renderPlanner() {
  const p = S.plannerData || {};
  const step = S.plannerStep;
  const stepLabels = ['Your Info', 'This Week', 'Break 1', 'Break 2', 'Break 3', 'Review'];
  const total = stepLabels.length;

  const progress = `
    <div class="planner-progress">
      ${stepLabels.map((label, i) => `
        ${i > 0 ? '<div class="progress-line"></div>' : ''}
        <div class="progress-step ${i < step ? 'done' : i === step ? 'active' : ''}">
          <div class="step-dot">${i < step ? '✓' : i + 1}</div>
          <div class="step-label">${label}</div>
        </div>`).join('')}
    </div>`;

  let content = '';
  switch (step) {
    case 0:
      content = `
        <h2>Let's Plan Your Show</h2>
        <p>Fill in your info to get started.</p>
        <div class="form-group">
          <label>Your Name</label>
          <input id="p-name" type="text" value="${esc(p.studentName || '')}" placeholder="Your name">
        </div>
        <div class="form-group">
          <label>Show Name</label>
          <input id="p-show" type="text" value="${esc(p.showName || '')}" placeholder="e.g. Morning Vibes, Sports Corner">
        </div>
        <div class="form-group">
          <label>Other DJ(s) on your show <span class="hint">(optional)</span></label>
          <input id="p-partners" type="text" value="${esc(p.partners || '')}" placeholder="Names separated by commas">
        </div>`;
      break;
    case 1:
      content = `
        <h2>Part 1 — This Week's Episode Theme</h2>
        <p>What is this specific episode about? Pick a theme that's timely, interesting, and gives your breaks a direction.</p>
        <div class="form-group">
          <label>Episode Theme</label>
          <input id="p-theme-title" type="text" value="${esc((p.theme || {}).title || '')}" placeholder="e.g. Valentine's Day, Spring Break Plans, March Madness, Senior Week">
        </div>
        <div class="form-group">
          <label>Why this theme? <span class="hint">(2–3 sentences)</span></label>
          <textarea id="p-theme-desc" rows="4" placeholder="Why did you pick this theme for this week? What's happening right now that makes it relevant to your audience?">${esc((p.theme || {}).description || '')}</textarea>
        </div>`;
      break;
    case 2: {
      const b = ((p.breaks || [])[0]) || {};
      content = `
        <h2>Break 1 — News / Relevant Tie-In</h2>
        <div class="break-purpose">Purpose: connect your theme to something happening right now in the world or at school.</div>
        <div class="form-group">
          <label>Segment Title</label>
          <input id="b1-title" type="text" value="${esc(b.title || '')}" placeholder="e.g. This Week in School News">
        </div>
        <div class="form-group">
          <label>News or Update <span class="hint">(1–2 sentences)</span></label>
          <textarea id="b1-news" rows="3" placeholder="What's happening right now that you'll mention?">${esc(b.newsUpdate || '')}</textarea>
        </div>
        <div class="form-group">
          <label>Connection to Your Theme</label>
          <input id="b1-connection" type="text" value="${esc(b.connection || '')}" placeholder="How does this news tie into your show's theme?">
        </div>
        <div class="form-group">
          <label>Transition Line into Music or Next Segment</label>
          <input id="b1-transition" type="text" value="${esc(b.transition || '')}" placeholder="e.g. Alright, that's the news — now let's get into it...">
        </div>`;
      break;
    }
    case 3: {
      const b = ((p.breaks || [])[1]) || {};
      content = `
        <h2>Break 2 — Fun Activity / Preview</h2>
        <div class="break-purpose">Purpose: engage your audience and build anticipation for your main topic.</div>
        <div class="form-group">
          <label>Segment Title</label>
          <input id="b2-title" type="text" value="${esc(b.title || '')}" placeholder="e.g. Top 5 List, This or That, Quick Poll">
        </div>
        <div class="form-group">
          <label>Activity or Hook</label>
          <textarea id="b2-activity" rows="3" placeholder="Describe the game, poll, top 5 list, or teaser you'll use.">${esc(b.activityHook || '')}</textarea>
        </div>
        <div class="form-group">
          <label>How It Connects to Your Theme</label>
          <input id="b2-connection" type="text" value="${esc(b.connection || '')}" placeholder="Why does this activity fit your show's theme?">
        </div>
        <div class="form-group">
          <label>Closing / Tease into Break 3</label>
          <input id="b2-tease" type="text" value="${esc(b.tease || '')}" placeholder="e.g. We're about to get into our main topic — but first...">
        </div>`;
      break;
    }
    case 4: {
      const b = ((p.breaks || [])[2]) || {};
      const tp = b.talkingPoints || ['', '', ''];
      content = `
        <h2>Break 3 — Main Topic of the Day</h2>
        <div class="break-purpose">Purpose: deliver the big discussion or feature that ties everything together.</div>
        <div class="form-group">
          <label>Segment Title</label>
          <input id="b3-title" type="text" value="${esc(b.title || '')}" placeholder="e.g. The Big Debate, Our Main Story">
        </div>
        <div class="form-group">
          <label>Main Talking Points</label>
          <input id="b3-tp1" type="text" value="${esc(tp[0])}" placeholder="Talking point 1" class="mt8" style="margin-bottom:8px">
          <input id="b3-tp2" type="text" value="${esc(tp[1])}" placeholder="Talking point 2" style="margin-bottom:8px">
          <input id="b3-tp3" type="text" value="${esc(tp[2])}" placeholder="Talking point 3">
        </div>
        <div class="form-group">
          <label>Format</label>
          <input id="b3-format" type="text" value="${esc(b.format || '')}" placeholder="e.g. discussion, review, debate, interview">
        </div>
        <div class="form-group">
          <label>Wrap-Up Line / Call to Action</label>
          <input id="b3-wrapup" type="text" value="${esc(b.wrapUp || '')}" placeholder="e.g. Tune in next week for... or Let us know what you think!">
        </div>`;
      break;
    }
    case 5: {
      const b1 = ((p.breaks || [])[0]) || {};
      const b2 = ((p.breaks || [])[1]) || {};
      const b3 = ((p.breaks || [])[2]) || {};
      content = `
        <h2>Review Your Show Plan</h2>
        <p>Make sure everything looks right before you submit.</p>
        <div class="review-block">
          <div class="review-section">
            <div class="review-label">Show</div>
            <div class="review-value">${esc(p.showName || '—')}</div>
          </div>
          <div class="review-section">
            <div class="review-label">DJ(s)</div>
            <div class="review-value">${esc([p.studentName, p.partners].filter(Boolean).join(', ') || '—')}</div>
          </div>
          <div class="review-section">
            <div class="review-label">Episode Theme</div>
            <div class="review-value"><strong>${esc((p.theme || {}).title || '—')}</strong><br>${esc((p.theme || {}).description || '')}</div>
          </div>
          <div class="review-section">
            <div class="review-label">Break 1 — ${esc(b1.title || 'News')}</div>
            <div class="review-value">${esc(b1.newsUpdate || '—')}<br><em>Connection: ${esc(b1.connection || '—')}</em></div>
          </div>
          <div class="review-section">
            <div class="review-label">Break 2 — ${esc(b2.title || 'Activity')}</div>
            <div class="review-value">${esc(b2.activityHook || '—')}<br><em>Connection: ${esc(b2.connection || '—')}</em></div>
          </div>
          <div class="review-section">
            <div class="review-label">Break 3 — ${esc(b3.title || 'Main Topic')}</div>
            <div class="review-value">
              ${(b3.talkingPoints || []).filter(Boolean).map((t, i) => `${i + 1}. ${esc(t)}`).join('<br>') || '—'}
              <br><em>Format: ${esc(b3.format || '—')}</em>
            </div>
          </div>
        </div>
        <div style="margin-bottom:8px"><strong>Grading Criteria</strong></div>
        <div class="criteria-grid">
          <div class="criterion">✦ <strong>Creativity</strong> — Original and interesting ideas</div>
          <div class="criterion">✦ <strong>Relevance</strong> — Fits your audience and talk show style</div>
          <div class="criterion">✦ <strong>Clarity</strong> — Ideas are easy to understand</div>
          <div class="criterion">✦ <strong>Consistency</strong> — All breaks connect to your theme</div>
        </div>`;
      break;
    }
  }

  const isFirst = step === 0;
  const isLast  = step === total - 1;

  return `
    ${navBar('radio')}
    <div class="class-page">
      <div class="planner-header">
        <button class="back-btn" data-nav="radio">← Back to Radio</button>
        <h1>Talk Show Planner</h1>
      </div>
      ${progress}
      <div class="planner-card card">
        ${content}
        <div class="planner-nav">
          ${!isFirst ? `<button class="btn-secondary" id="planner-back">← Back</button>` : '<div></div>'}
          ${!isLast
            ? `<button class="btn-primary" id="planner-next">Continue →</button>`
            : `<div class="planner-submit-row">
                <button class="btn-secondary" id="planner-print">🖨️ Print</button>
                <button class="btn-primary" id="planner-submit">Submit Plan ✓</button>
               </div>`}
        </div>
      </div>
    </div>`;
}

// ── HOMESTEAD LIVE ────────────────────────────────────────────
function renderLive() {
  const now = new Date();
  const upcoming = (S.broadcasts || [])
    .filter(b => new Date(b.date + 'T00:00:00') >= now)
    .sort((a, b) => a.date.localeCompare(b.date));

  const next = upcoming[0] || null;

  const crewGrid = (roles) => LIVE_ROLES.map(role => `
    <div class="broadcast-crew-role">
      <span class="bcr-label">${role}</span>
      <span class="bcr-name${roles[role] ? '' : ' empty'}">${esc(roles[role] || 'TBD')}</span>
    </div>`).join('');

  const countdownBlock = next ? (() => {
    const et = EVENT_TYPES[next.type] || EVENT_TYPES.other;
    const days = Math.ceil((new Date(next.date + 'T00:00:00') - now) / 86400000);
    return `
      <section class="card next-broadcast-card">
        <div class="next-label">Next Broadcast</div>
        <div class="next-event-type" style="color:${et.color}">${et.label}</div>
        <div class="next-event-name">${esc(next.title)}</div>
        <div class="next-date">${fmtDate(next.date, true)}</div>
        ${next.gameTime ? `
        <div class="next-times">
          <span class="next-door33">Door 33 ${computeDoor33(next.gameTime, next.type)}</span>
          <span style="color:var(--border)">·</span>
          <span class="next-arrival">${ARRIVAL_LABEL[next.type] ?? ARRIVAL_DEFAULT_LABEL} ${computeArrival(next.gameTime, next.type)}</span>
          <span style="color:var(--border)">·</span>
          <span class="next-gametime">Game ${esc(next.gameTime)}</span>
        </div>` : ''}
        <div class="countdown">${days <= 0 ? 'TODAY' : days === 1 ? '1 day away' : days + ' days away'}</div>
        <button class="btn-primary" data-broadcast="${next.id}" style="background:var(--live);color:#000">
          View Broadcast Prep →
        </button>
        <div class="next-crew-grid">
          ${crewGrid(next.roles || {})}
        </div>
      </section>`;
  })() : `
    <section class="card" style="text-align:center;padding:32px">
      <p class="dim" style="margin-bottom:16px">No upcoming broadcasts scheduled.</p>
      ${S.teacherMode ? '<button class="btn-primary" id="add-broadcast">+ Add Broadcast</button>' : ''}
    </section>`;

  const broadcastItems = upcoming.slice(0, 5).map(b => {
    const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
    return `
      <div class="broadcast-item" data-broadcast="${b.id}">
        <div class="broadcast-item-header">
          <div class="broadcast-type-dot" style="background:${et.color}"></div>
          <div class="broadcast-info">
            <div class="broadcast-title">${esc(b.title)}</div>
            <div class="broadcast-date">${fmtDate(b.date)}${b.gameTime ? ' · Game ' + esc(b.gameTime) : ''}</div>
            ${b.gameTime ? `<div class="broadcast-crewcall">Door 33 ${computeDoor33(b.gameTime, b.type)} · ${ARRIVAL_LABEL[b.type] ?? ARRIVAL_DEFAULT_LABEL} ${computeArrival(b.gameTime, b.type)}</div>` : ''}
          </div>
          <div class="broadcast-tag" style="color:${et.color}">${et.label}</div>
        </div>
        <div class="broadcast-crew">
          ${crewGrid(b.roles || {})}
        </div>
      </div>`;
  }).join('') || '<p class="dim">None scheduled yet.</p>';

  return `
    ${navBar('live')}
    <div class="class-page">
      <div class="class-header">
        <img src="images/logo-homestead-live.png" alt="Homestead Live" class="class-header-logo">
        <div>
          <h1>Homestead Live</h1>
          <p>Broadcasting Homestead sports and events live.</p>
        </div>
      </div>
      <div class="page-grid">
        <div class="main-col">
          ${countdownBlock}
          <section class="card">
            <div class="card-header">
              <h2>Next 5 Broadcasts</h2>
              ${S.teacherMode ? `<button class="btn-primary" id="add-broadcast">+ Add</button>` : ''}
            </div>
            <div class="broadcast-list">${broadcastItems}</div>
            ${upcoming.length > 0 ? `<div style="text-align:center;margin-top:14px"><button class="btn-secondary" data-nav="schedule">View All ${upcoming.length} Broadcasts →</button></div>` : ''}
          </section>
        </div>
        <div class="side-col">
          ${!S.teacherMode ? `
          <section class="card action-card live-action">
            <div class="action-icon">📋</div>
            <h3>Broadcast Sign-Up</h3>
            <p>Tell your teacher which positions you're interested in for upcoming broadcasts.</p>
            <button class="btn-primary" data-nav="availability">Sign Up →</button>
          </section>` : ''}
          <section class="card">
            <h2>Crew Roles</h2>
            <div class="roles-list">
              ${LIVE_ROLES.map(r => `<div class="role-chip">${r}</div>`).join('')}
            </div>
          </section>
        </div>
      </div>
    </div>`;
}

// ── AVAILABILITY CARD (broadcast detail sidebar) ──────────────
function renderAvailabilityCard(b) {
  if (!S.teacherMode) return renderStudentSignupCard(b);

  const avails     = (S.availabilities || []).filter(a => a.broadcastId === b.id);
  const withEmails = avails.filter(a => a.email);
  const arrivalTime = computeArrival(b.gameTime, b.type);
  const door33Time  = computeDoor33(b.gameTime, b.type);
  const arrivalLbl  = ARRIVAL_LABEL[b.type] ?? ARRIVAL_DEFAULT_LABEL;

  const reminderMailto = (() => {
    if (!withEmails.length) return null;
    const subject = `Tomorrow — ${b.title}`;
    const body = [
      `Hi,`,
      ``,
      `Reminder: you are signed up to crew the following broadcast TOMORROW.`,
      ``,
      `Event:        ${b.title}`,
      `Date:         ${fmtDate(b.date, true)}`,
      door33Time  ? `DOOR 33:      ${door33Time}  ← Arrive here first` : null,
      arrivalTime ? `${arrivalLbl.toUpperCase().padEnd(13)} ${arrivalTime}  ← Be set up by this time` : null,
      b.gameTime  ? `Game Time:    ${b.gameTime}` : null,
      b.notes && b.notes !== 'TBD — time to be announced' ? `Location:     ${b.notes}` : null,
      ``,
      `See you there!`,
      `— Homestead Live`,
    ].filter(l => l !== null).join('\n');
    const emails = withEmails.map(a => a.email).join(',');
    return `mailto:${emails}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  })();

  const rows = avails.length
    ? avails.map(a => {
        const interests = a.interestedRoles || [];
        const assignedRole = Object.entries(b.roles || {}).find(([, n]) => n === a.studentName)?.[0];
        return `
          <div class="avail-student-card">
            <div class="avail-student-top">
              <div>
                <span class="avail-student-name">${esc(a.studentName)}</span>
                ${a.email ? `<div class="avail-student-email">${esc(a.email)}</div>` : '<div class="avail-no-email">No email</div>'}
              </div>
              <button class="avail-del-btn" data-avail-id="${a.id}" title="Remove from list">✕</button>
            </div>
            ${interests.length
              ? `<div class="avail-interests">${interests.map(r => `<span class="avail-interest-chip">${esc(r)}</span>`).join('')}</div>`
              : `<div class="avail-no-pref">No position preference</div>`}
            <select class="avail-assign-sel" data-name="${esc(a.studentName)}">
              <option value="">Assign to role…</option>
              ${LIVE_ROLES.map(r => `<option value="${r}"${assignedRole === r ? ' selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>`;
      }).join('')
    : `<p class="dim" style="font-size:0.85rem;padding:4px 0">No students signed up for this broadcast yet.</p>`;

  return `
    <section class="card">
      <div class="card-header" style="margin-bottom:${reminderMailto ? '10px' : '12px'}">
        <h2>Available Students</h2>
        <span class="avail-count-badge">${avails.length}</span>
      </div>
      ${reminderMailto ? `
      <a href="${reminderMailto}" class="reminder-btn">
        📧 Send Reminder Emails <span class="reminder-count">${withEmails.length} / ${avails.length}</span>
      </a>` : avails.length && !withEmails.length ? `
      <p style="font-size:0.78rem;color:var(--dim);margin-bottom:12px">No email addresses on file — students can add one on the Sign-Up page.</p>` : ''}
      <div class="avail-student-list">${rows}</div>
    </section>`;
}

// ── Student side of broadcast detail ──────────────────────────
function renderStudentSignupCard(b) {
  const avails = (S.availabilities || []).filter(a => a.broadcastId === b.id);
  const myName = localStorage.getItem('hm_student_name') || '';
  const myEntry = avails.find(a => a.studentName.toLowerCase() === myName.toLowerCase());
  const myRoles = myEntry?.interestedRoles || [];

  return `
    <section class="card">
      <h2>Your Sign-Up</h2>
      ${myEntry
        ? `<div class="avail-signed-badge" style="margin-bottom:10px">✓ You're marked available</div>
           ${myRoles.length
             ? `<div class="avail-my-roles">${myRoles.map(r => `<span class="avail-my-role-chip">${esc(r)}</span>`).join('')}</div>`
             : `<p style="font-size:0.82rem;color:var(--dim);margin-bottom:10px">No position preference set.</p>`}`
        : `<p style="font-size:0.85rem;color:var(--dim);margin-bottom:10px;line-height:1.5">You haven't signed up for this broadcast yet.</p>`}
      <button class="btn-secondary" data-nav="availability" style="width:100%;margin-top:4px">
        ${myEntry ? 'Update My Sign-Up →' : 'Sign Up for Broadcasts →'}
      </button>
    </section>`;
}

// ── BROADCAST DETAIL ──────────────────────────────────────────
function renderBroadcast() {
  const b = (S.broadcasts || []).find(x => x.id === S.broadcastId);
  if (!b) return `${navBar('live')}<div class="class-page"><button class="back-btn" data-nav="live">← Back</button><p>Broadcast not found.</p></div>`;

  const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
  const roles = b.roles || {};
  const defaultChecklist = [
    'Test all cameras 30 min before air',
    'Confirm graphics are loaded and approved',
    'Run full audio check',
    'All crew in position 15 min before air',
    'Director and TD walkthrough complete'
  ];
  const checklist = b.checklist || defaultChecklist;

  const arrivalTime = computeArrival(b.gameTime, b.type);
  const door33Time  = computeDoor33(b.gameTime, b.type);
  const arrivalLbl  = ARRIVAL_LABEL[b.type] ?? ARRIVAL_DEFAULT_LABEL;

  return `
    ${navBar('live')}
    <div class="class-page">
      <button class="back-btn" data-nav="live">← Back to Homestead Live</button>
      <div class="broadcast-detail-header">
        <div class="broadcast-type-badge" style="background:${et.color}">${et.label}</div>
        <h1>${esc(b.title)}</h1>
        <div class="broadcast-detail-date">${fmtDate(b.date, true)}</div>
        ${arrivalTime ? `
        <div class="crew-call-banner">
          <div class="crew-call-block">
            <div class="crew-call-time-val door33-val">${door33Time}</div>
            <div class="crew-call-time-label">Door 33</div>
          </div>
          <div class="crew-call-divider"></div>
          <div class="crew-call-block">
            <div class="crew-call-time-val arrival-val">${arrivalTime}</div>
            <div class="crew-call-time-label">${arrivalLbl}</div>
          </div>
          <div class="crew-call-divider"></div>
          <div class="crew-call-block">
            <div class="crew-call-time-val">${esc(b.gameTime)}</div>
            <div class="crew-call-time-label">Game Time</div>
          </div>
          <div class="crew-call-rule">
            Enter through <strong>Door 33</strong> at ${door33Time} · Be in ${arrivalLbl} by ${arrivalTime}
          </div>
        </div>` : ''}
      </div>
      <div class="page-grid">
        <div class="main-col">
          <section class="card">
            <div class="card-header">
              <h2>Crew Assignments</h2>
              ${S.teacherMode ? `<button class="btn-primary" id="save-roles">Save Roles</button>` : ''}
            </div>
            <div class="role-grid">
              ${LIVE_ROLES.map(role => `
                <div class="role-row">
                  <div class="role-name">${role}</div>
                  ${S.teacherMode
                    ? `<input class="role-input" type="text" data-role="${role}" value="${esc(roles[role] || '')}" placeholder="Student name">`
                    : `<div class="role-assigned ${roles[role] ? '' : 'empty'}">${esc(roles[role] || 'TBD')}</div>`}
                </div>`).join('')}
            </div>
          </section>
        </div>
        <div class="side-col">
          ${renderAvailabilityCard(b)}
          <section class="card">
            <h2>Pre-Show Checklist</h2>
            <div class="checklist">
              ${checklist.map((item, i) => `
                <label class="checklist-item">
                  <input type="checkbox" class="check-item" data-idx="${i}" ${((b.checks || {})[i]) ? 'checked' : ''}>
                  <span>${esc(item)}</span>
                </label>`).join('')}
            </div>
          </section>
          <section class="card">
            <div class="card-header" style="margin-bottom:${b.notes || S.teacherMode ? '12px' : '0'}">
              <h2>Notes</h2>
              ${S.teacherMode ? `<button class="btn-secondary" id="save-notes">Save</button>` : ''}
            </div>
            ${S.teacherMode
              ? `<textarea id="broadcast-notes" rows="4" style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:8px;color:var(--text);padding:10px;font-family:inherit;font-size:0.875rem;resize:vertical;outline:none" placeholder="Special instructions, location notes, etc.">${esc(b.notes || '')}</textarea>`
              : b.notes ? `<p style="font-size:0.875rem;line-height:1.6;color:var(--dim)">${esc(b.notes)}</p>` : '<p class="dim" style="font-size:0.875rem">No notes yet.</p>'}
          </section>
        </div>
      </div>
    </div>`;
}

// ── FULL SCHEDULE ────────────────────────────────────────────
function renderSchedule() {
  const all = (S.broadcasts || []).slice().sort((a, b) => a.date.localeCompare(b.date));
  const now = new Date();

  const rows = all.map(b => {
    const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
    const past = new Date(b.date + 'T00:00:00') < now;
    const assigned = Object.values(b.roles || {}).filter(v => v).length;
    return `
      <div class="sched-row${past ? ' sched-past' : ''}">
        <div class="sched-badge" style="background:${et.color}">${et.label}</div>
        <div class="sched-info">
          <div class="sched-title">${esc(b.title)}</div>
          <div class="sched-meta">${fmtDate(b.date, true)}${b.notes ? ' · ' + esc(b.notes) : ''}</div>
          ${b.gameTime ? `<div class="sched-times">
            <span class="sched-door33">Door 33 ${computeDoor33(b.gameTime, b.type)}</span>
            <span class="sched-sep">·</span>
            <span class="sched-arrival">${ARRIVAL_LABEL[b.type] ?? ARRIVAL_DEFAULT_LABEL} ${computeArrival(b.gameTime, b.type)}</span>
            <span class="sched-sep">·</span>
            <span class="sched-gametime">Game ${esc(b.gameTime)}</span>
          </div>` : ''}
          <div class="sched-crew-count">${assigned} / ${LIVE_ROLES.length} crew assigned</div>
        </div>
        ${S.teacherMode ? `
          <div class="sched-actions">
            <button class="btn-secondary sched-edit" data-id="${b.id}">Edit</button>
          </div>` : ''}
      </div>`;
  }).join('') || '<p class="dim" style="padding:20px">No broadcasts scheduled.</p>';

  return `
    ${navBar('live')}
    <div class="class-page">
      <button class="back-btn" data-nav="live">← Back to Homestead Live</button>
      <div class="card-header" style="margin-bottom:20px">
        <h1>Full Schedule</h1>
        ${S.teacherMode ? '<button class="btn-primary" id="add-broadcast">+ Add Broadcast</button>' : ''}
      </div>
      <section class="card" style="padding:0;overflow:hidden">
        <div class="sched-list">${rows}</div>
      </section>
    </div>`;
}

function showEditBroadcastModal(id) {
  const b = (S.broadcasts || []).find(x => x.id === id);
  if (!b) return;
  const roles = b.roles || {};
  const m = modal(`
    <h2>Edit Broadcast</h2>
    <div class="form-group">
      <label>Event Name</label>
      <input id="m-title" type="text" value="${esc(b.title)}">
    </div>
    <div class="form-group">
      <label>Date</label>
      <input id="m-date" type="date" value="${b.date}">
    </div>
    <div class="form-group">
      <label>Type</label>
      <select id="m-type">
        ${Object.entries(EVENT_TYPES).map(([k, v]) =>
          `<option value="${k}"${b.type === k ? ' selected' : ''}>${v.label}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Game Time <span class="hint">(e.g. 7:30 PM)</span></label>
      <input id="m-gametime" type="text" value="${esc(b.gameTime || '')}" placeholder="7:30 PM">
    </div>
    <div class="form-group">
      <label>Notes</label>
      <input id="m-notes" type="text" value="${esc(b.notes || '')}" placeholder="Location, etc.">
    </div>
    <div class="form-group">
      <label>Crew</label>
      <div class="edit-crew-grid">
        ${LIVE_ROLES.map(role => `
          <div class="edit-crew-row">
            <span class="edit-crew-label">${role}</span>
            <input class="role-input" type="text" data-role="${role}" value="${esc(roles[role] || '')}" placeholder="Student name">
          </div>`).join('')}
      </div>
    </div>`, 'Delete');

  m.querySelector('#modal-save').addEventListener('click', async () => {
    const title    = val('m-title');
    const date     = val('m-date');
    const type     = val('m-type');
    const gameTime = val('m-gametime');
    const notes    = val('m-notes');
    if (!title || !date) { showToast('Title and date are required.'); return; }
    const newRoles = {};
    m.querySelectorAll('.role-input').forEach(el => { newRoles[el.dataset.role] = el.value.trim(); });
    Object.assign(b, { title, date, type, gameTime, notes, roles: newRoles });
    const db = getDB();
    if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).update({ title, date, type, gameTime, notes, roles: newRoles }).catch(() => {}); }
    m.remove(); render(); showToast('Saved!');
  });

  m.querySelector('#modal-extra').addEventListener('click', async () => {
    if (!confirm(`Delete "${b.title}"?`)) return;
    const db = getDB();
    if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).delete().catch(() => {}); }
    S.broadcasts = S.broadcasts.filter(x => x.id !== b.id);
    m.remove(); render(); showToast('Deleted.');
  });
}

// ── SPORTS BROADCASTING ───────────────────────────────────────
function renderSports() {
  return `
    ${navBar('sports')}
    <div class="class-page">
      <div class="class-header">
        <img src="images/logo-sports-broadcasting.jpg" alt="Sports Broadcasting" class="class-header-logo">
        <div>
          <h1>Sports Broadcasting</h1>
          <p>Play-by-play, color commentary, and live crew for Homestead athletics.</p>
        </div>
      </div>
      <div class="page-grid">
        <div class="main-col">
          <section class="card coming-soon-card">
            <div class="coming-soon-icon">🚧</div>
            <h2>Coming Soon</h2>
            <p>Sports Broadcasting content is being built out. Game schedules, crew assignments, and lessons will appear here.</p>
          </section>
        </div>
        <div class="side-col">
          <section class="card action-card" style="--ac:var(--sports)">
            <div class="action-icon">📅</div>
            <h3>Broadcast Schedule</h3>
            <p>View upcoming games and who's crewing each broadcast.</p>
            <button class="btn-primary" style="background:var(--sports);color:#000" data-nav="schedule">View Schedule →</button>
          </section>
          <section class="card action-card" style="--ac:var(--sports)">
            <div class="action-icon">✋</div>
            <h3>Sign Up for a Broadcast</h3>
            <p>Add your name to an upcoming game crew.</p>
            <button class="btn-primary" style="background:var(--sports);color:#000" data-nav="availability">Sign Up →</button>
          </section>
          <section class="card action-card" style="--ac:var(--sports)">
            <div class="action-icon">📚</div>
            <h3>Sports Lessons</h3>
            <p>Play-by-play technique, color commentary, and broadcast prep.</p>
            <button class="btn-primary" style="background:var(--sports);color:#000" data-lesson-course="sports">Go to Lessons →</button>
          </section>
        </div>
      </div>
    </div>`;
}

// ── HHS IN-DEPTH ──────────────────────────────────────────────
function renderInDepth() {
  return `
    ${navBar('indepth')}
    <div class="class-page">
      <div class="class-header">
        <img src="images/logo-hhs-indepth.png" alt="HHS In-Depth" class="class-header-logo">
        <div>
          <h1>HHS In-Depth</h1>
          <p>TV news production — anchoring, reporting, packages, and live shots.</p>
        </div>
      </div>
      <div class="page-grid">
        <div class="main-col">
          <section class="card">
            <h2 class="cal-section-title">📅 Coverage Calendar</h2>
            <p class="cal-section-sub">Upcoming events that need to be covered by the In-Depth team.</p>
            <div class="cal-embed-wrap">
              <iframe src="https://calendar.google.com/calendar/embed?src=2b9bdfdee65f7330d8d5d2fd1d4877c1b709289fa0b0747427f57fd62516bed5%40group.calendar.google.com&ctz=America%2FIndiana%2FIndianapolis&bgcolor=%23111111&color=%230F9D58&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0" frameborder="0" scrolling="no" class="cal-embed"></iframe>
            </div>
          </section>
        </div>
        <div class="side-col">
          <section class="card action-card">
            <div class="action-icon">🏆</div>
            <h3>IASB Competition</h3>
            <p>Track your competition entries and checklists for IASB.</p>
            <button class="btn-primary" style="background:var(--indepth)" data-nav="iasb">Open IASB Hub →</button>
          </section>
          <section class="card action-card">
            <div class="action-icon">📚</div>
            <h3>In-Depth Lessons</h3>
            <p>Anchoring, reporting, script writing, and package production.</p>
            <button class="btn-primary" style="background:var(--indepth)" data-lesson-course="indepth">Go to Lessons →</button>
          </section>
        </div>
      </div>
    </div>`;
}

// ── YEARBOOK ──────────────────────────────────────────────────
function allYbEvents() {
  const custom = (S.customYbEvents || []).map(e => ({ ...e, icon: YB_ICONS[e.type] || '📅' }));
  const base = [...YEARBOOK_EVENTS, ...custom];
  const covered = new Set(base.map(e => e.type + '|' + e.date));
  const fromCal = (S.calendarYbEvents || []).filter(e => !covered.has(e.type + '|' + e.date));
  return [...base, ...fromCal];
}

function filterYbEvents() {
  const type  = document.getElementById('yb-type')?.value;
  const group = document.getElementById('yb-event-group');
  const sel   = document.getElementById('yb-event');
  if (!group || !sel) return;
  if (!type) { group.style.display = 'none'; return; }
  const now = new Date();
  const events = allYbEvents().filter(e => e.type === type && new Date(e.date + 'T23:59:00') >= now)
    .sort((a, b) => a.date.localeCompare(b.date));
  sel.innerHTML = events.length
    ? '<option value="">— Select an event —</option>' + events.map(e => `<option value="${e.id}">${e.icon} ${e.title} — ${fmtDate(e.date, false)}</option>`).join('')
    : '<option value="">No upcoming events of this type</option>';
  group.style.display = '';
}

function renderYearbook() {
  const myName  = localStorage.getItem('hm_yb_name')  || '';
  const myEmail = localStorage.getItem('hm_yb_email') || '';
  const now     = new Date();

  const allCoverage = S.yearbookCoverage || [];

  const mySignups = allCoverage.filter(
    s => s.studentName.toLowerCase() === myName.toLowerCase()
  );

  // Build type options — only show types that have at least one upcoming event
  const upcomingByType = {};
  allYbEvents().forEach(e => {
    if (new Date(e.date + 'T23:59:00') >= now) {
      if (!upcomingByType[e.type]) upcomingByType[e.type] = [];
      upcomingByType[e.type].push(e);
    }
  });
  const typeOrder = ['football','basketball_boys','basketball_girls','volleyball','soccer_boys','soccer_girls','golf_boys','golf_girls','baseball','softball','cross_country','swimming','tennis_boys','tennis_girls','track','wrestling','gymnastics','lacrosse_boys','lacrosse_girls','bowling_boys','bowling_girls','dance_team','cheer','showchoir','arts','fine_arts','dance','school','academic','nhs','club','graduation','other'];
  const typeLabels = { football:'🏈 Football', basketball_boys:'🏀 Boys Basketball', basketball_girls:'🏀 Girls Basketball', volleyball:'🏐 Volleyball', soccer_boys:'⚽ Boys Soccer', soccer_girls:'⚽ Girls Soccer', golf_boys:'⛳ Boys Golf', golf_girls:'⛳ Girls Golf', baseball:'⚾ Baseball', softball:'🥎 Softball', cross_country:'🏃 Cross Country', swimming:'🏊 Swimming', tennis_boys:'🎾 Boys Tennis', tennis_girls:'🎾 Girls Tennis', track:'🏃 Track & Field', wrestling:'🤼 Wrestling', gymnastics:'🤸 Gymnastics', lacrosse_boys:'🥍 Boys Lacrosse', lacrosse_girls:'🥍 Girls Lacrosse', bowling_boys:'🎳 Boys Bowling', bowling_girls:'🎳 Girls Bowling', dance_team:'💃 Dance Team', cheer:'📣 Cheer / Pom', showchoir:'🎤 Show Choir', arts:'🎭 Performing Arts', fine_arts:'🎨 Fine Arts', dance:'🪩 Dance', school:'🏫 School Event', academic:'🏆 Academic', nhs:'🎓 NHS / Honor Society', club:'🏅 Club / Org', graduation:'🎓 Graduation', other:'📸 Other' };
  const typeOptions = typeOrder.filter(t => upcomingByType[t])
    .map(t => `<option value="${t}">${typeLabels[t]} (${upcomingByType[t].length})</option>`).join('');

  const mySignupRows = mySignups.length
    ? mySignups.map(s => `
        <div class="yb-my-signup">
          <span class="yb-my-event">${esc(s.eventTitle)}</span>
          <span class="yb-my-role yb-role-${s.role}">${roleLabel(s.role)}</span>
          <button class="yb-unsign-btn" data-yb-unsign="${esc(s.id)}">✕</button>
        </div>`).join('')
    : `<p class="dim" style="font-size:0.85rem">You haven't signed up for any events yet.</p>`;

  return `
    ${navBar('yearbook')}
    <div class="class-page">
      <div class="class-header">
        <div class="class-header-icon">📖</div>
        <div>
          <h1>Yearbook</h1>
          <p>Documenting the story of Homestead.</p>
        </div>
      </div>
      <div class="page-grid">
        <div class="main-col">

<section class="card">
            <h2 class="cal-section-title">📅 Coverage Calendar</h2>
            <p class="cal-section-sub">Upcoming events that need to be photographed or covered for Yearbook.</p>
            <div class="cal-embed-wrap">
              <iframe src="https://calendar.google.com/calendar/embed?src=2b9bdfdee65f7330d8d5d2fd1d4877c1b709289fa0b0747427f57fd62516bed5%40group.calendar.google.com&ctz=America%2FIndiana%2FIndianapolis&bgcolor=%23111111&color=%230F9D58&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=0" frameborder="0" scrolling="no" class="cal-embed"></iframe>
            </div>
          </section>

          <section class="card" id="yb-signup-card">
            <h2 class="cal-section-title">✏️ Sign Up to Cover an Event</h2>
            <p class="cal-section-sub">Pick an event, choose your role, and submit. Your teacher will confirm assignments.</p>

            <div class="yb-name-row">
              <div class="form-group">
                <label>Your Name</label>
                <input id="yb-name" type="text" placeholder="First and last name" value="${esc(myName)}">
              </div>
              <div class="form-group">
                <label>Your Email</label>
                <input id="yb-email" type="email" placeholder="student@email.com" value="${esc(myEmail)}">
              </div>
            </div>

            <div class="form-group">
              <label>Sport / Event Type</label>
              <select id="yb-type" onchange="filterYbEvents()">
                <option value="">— Select a type —</option>
                ${typeOptions}
              </select>
            </div>

            <div class="form-group" id="yb-event-group" style="display:none">
              <label>Event</label>
              <select id="yb-event">
                <option value="">— Select an event —</option>
              </select>
            </div>

            <div class="form-group">
              <label>Role</label>
              <div class="yb-role-picker">
                <button class="yb-role-btn" data-role="photographer">📷 Photographer</button>
              </div>
              <input type="hidden" id="yb-role" value="">
            </div>

            <button class="btn-primary" id="yb-submit-btn" style="margin-top:8px">Submit Sign-Up →</button>
          </section>

          ${myName ? `
          <section class="card">
            <h2 class="cal-section-title">My Sign-Ups</h2>
            <div id="yb-my-signups">${mySignupRows}</div>
          </section>` : ''}

          <section class="card">
            <h2 class="cal-section-title">📋 Event Coverage</h2>
            <p class="cal-section-sub">Students signed up to cover upcoming events.</p>
            ${(() => {
              const byEvent = {};
              allCoverage.forEach(s => {
                const key = s.eventId || (s.eventDate + s.eventTitle);
                if (!byEvent[key]) byEvent[key] = { title: s.eventTitle, date: s.eventDate, signups: [] };
                byEvent[key].signups.push(s);
              });
              const rows = Object.values(byEvent)
                .filter(ev => new Date(ev.date + 'T23:59:00') >= now)
                .sort((a,b) => a.date.localeCompare(b.date));
              if (!rows.length) return `<p class="dim" style="font-size:0.875rem">No sign-ups yet — be the first!</p>`;
              return rows.map(ev => `
                <div class="yb-cov-event">
                  <div class="yb-cov-header">
                    <span class="yb-cov-title">${esc(ev.title)}</span>
                    <span class="yb-cov-date dim">${fmtDate(ev.date, false)}</span>
                  </div>
                  <div class="yb-cov-tags">
                    ${ev.signups.map(s => `
                      <span class="yb-cov-tag yb-role-${s.role}">
                        ${esc(s.studentName)} · ${roleLabel(s.role)}
                      </span>`).join('')}
                  </div>
                </div>`).join('');
            })()}
          </section>

        </div>
        <div class="side-col">

          <section class="card action-card">
            <div class="action-icon">📒</div>
            <h3>Walsworth Yearbooks</h3>
            <p>Log in to build pages, submit layouts, and manage your section.</p>
            <a class="btn-primary" href="https://login.walsworthyearbooks.com/login" target="_blank" rel="noopener">Open Walsworth ↗</a>
          </section>

          <section class="card">
            <h3 style="font-size:1rem;font-weight:700;margin-bottom:4px">📷 Shot List Tips</h3>
            <p style="font-size:0.8rem;color:var(--dim);margin-bottom:14px">Click a category to expand. Every event needs a wide, medium, and close-up shot.</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              ${[
                { label:'🏈 Field Sports', sub:'Football · Soccer · Lacrosse · Baseball · Softball', tips:[
                  'Shoot from end zone or corner — you need depth, not flat sideline width',
                  'Watch the ball, not the player — anticipate the play before it happens',
                  'Burst mode on every action sequence; the winning frame is rarely the first',
                  'Pre-game tells a story: warm-ups, team huddles, coin toss, tunnel entrances',
                  'Bench and coaches react as strongly as the field — don\'t ignore them',
                  'Post-game handshake line, quiet locker walk, or celebration are all yearbookworthy',
                  'Include the student section — crowd energy makes sports photos feel alive',
                ]},
                { label:'🏀 Court & Indoor Sports', sub:'Basketball · Volleyball · Wrestling · Gymnastics · Bowling', tips:[
                  'Position at baseline corner — you get action AND scoreboard in one frame',
                  'Shoot at the peak: ball at the rim, spike at the net, pin on the mat',
                  'Get low for wrestling and gymnastics — shooting up makes athletes look powerful',
                  'Bench huddles and timeout circles are genuine emotional moments',
                  'Include the scoreboard in wide shots to give photos context',
                  'Bowling: look for the release and follow-through, plus reaction after a strike',
                ]},
                { label:'🏃 Cross Country, Track & Swimming', sub:'Cross Country · Track · Swimming & Diving', tips:[
                  'Cross Country: start line chaos, runners isolated in nature, finish line emotion — shoot all three',
                  'Track: capture starting blocks tension, mid-race pack, and the lean at the finish',
                  'Relay handoffs are dramatic and rarely captured — position yourself there',
                  'Swimming: the dive start is a signature shot; lean over the lane or shoot through glass',
                  'The moment right after finishing is when emotion peaks — be ready',
                ]},
                { label:'🎾 Tennis & Golf', sub:'Boys/Girls Tennis · Boys/Girls Golf', tips:[
                  'Tennis: catch the serve at the top of the toss, not the follow-through swing',
                  'Between-point moments show character — use them to tell the personality story',
                  'Doubles: look for non-verbal communication and coordination between partners',
                  'Golf: the follow-through is cleaner and easier to catch than the swing itself',
                  'Golf courses have natural backgrounds — use the landscape, not just the player',
                  'Putting green focus shots and walking the fairway give variety',
                ]},
                { label:'🎭 Arts & Performance', sub:'Show Choir · Fine Arts · Dance Team · Cheer · Dance Events', tips:[
                  'Start with a wide establishing shot of the full group on stage — give context first',
                  'Work in to faces during the most emotional or intense moments',
                  'Shoot the director watching from the house — it\'s a perspective students forget',
                  'Backstage before the show: nerves, costumes, group warmups — all yearbook content',
                  'Audience reactions (parents, teachers) tell the story from another angle',
                  'Cheer and dance: catch the peak of the stunt, not the build or the landing',
                  'Post-show curtain call, cast hugging, teacher congratulating — don\'t pack up early',
                ]},
                { label:'🏫 Campus & Daily Life', sub:'Clubs · Academics · NHS · School Life · Candids', tips:[
                  'Genuine unposed moments are worth more than any posed group photo',
                  'Lab work, hands-on projects, art studios, shop class — learning in action',
                  'Lunchroom social energy: friend groups, conversations, the full-room wide shot',
                  'Hallway between classes: lockers, social moments, the daily rhythm of school',
                  'Club meetings — catch the discussion and debate, not just the group shot at the end',
                  'Spirit week, hallway decorations, homecoming posters — school culture is visual',
                  'NHS: induction candle ceremony, pin moments, community service in action',
                  'Ask before entering a classroom — most teachers will say yes if you\'re quick',
                ]},
                { label:'🎓 Special Events', sub:'Graduation · Prom · Homecoming · Dances', tips:[
                  'Graduation cap toss: set burst mode, shoot from slightly below, catch all caps mid-air',
                  'Diploma handshake: shoot from the audience side so you see both faces clearly',
                  'Family reunions after ceremony — organic, emotional, never posed, always genuine',
                  'Prom grand march: position at the entrance so you catch the reveal moment',
                  'Inside the dance: a few crowd-on-the-floor wides, DJ booth, and decoration details',
                  'Corsages, honor cords, class rings, diplomas — details complete the story',
                  'The quiet wind-down after the event is over is almost always overlooked',
                ]},
                { label:'📐 Universal Rules', sub:'Applies to every single event you shoot', tips:[
                  'Every event needs three shots: wide (context), medium (story), close-up (emotion)',
                  'The before and after are as important as the event itself — arrive early, leave late',
                  'Candid beats posed for authentic yearbook content every time',
                  'Ask yourself: will someone who wasn\'t there understand this story from just this photo?',
                  'Shoot more than you think you need — you can always delete, never re-create',
                  'Light matters: find good window light inside, avoid harsh overhead gymnasium lights',
                  'Get names as you shoot — a great photo with no caption is half a story',
                ]},
              ].map(cat => `
                <details class="shot-cat">
                  <summary class="shot-cat-summary">
                    <span class="shot-cat-label">${cat.label}</span>
                    <span class="shot-cat-sub">${cat.sub}</span>
                  </summary>
                  <ul class="shot-cat-list">${cat.tips.map(t => `<li>${t}</li>`).join('')}</ul>
                </details>`).join('')}
            </div>
          </section>

        </div>
      </div>
    </div>`;
}

function roleLabel(role) {
  return { photographer: '📷 Photographer' }[role] || role;
}

async function loadYearbookCoverage() {
  // Show cached data instantly, then refresh from Firestore in background
  try {
    const cached = JSON.parse(localStorage.getItem('hm_yb_coverage') || 'null');
    if (cached) { S.yearbookCoverage = cached; render(); }
  } catch(e) {}

  const db = getDB();
  if (!db) return;
  try {
    const snap = await db.collection('hm_yearbook_coverage').orderBy('submittedAt', 'desc').get();
    trackUsage('reads', snap.size);
    const fresh = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    S.yearbookCoverage = fresh;
    localStorage.setItem('hm_yb_coverage', JSON.stringify(fresh));
    if (S.view === 'yearbook' || S.view === 'dashboard') render();
  } catch(e) { console.error('yearbook coverage load failed', e); }
}

function inferYbType(title) {
  const t = title.toLowerCase();
  if (t.includes('football'))                              return 'football';
  if (t.includes('basketball') && t.includes('boys'))     return 'basketball_boys';
  if (t.includes('basketball') && t.includes('girls'))    return 'basketball_girls';
  if (t.includes('basketball'))                           return 'basketball_boys';
  if (t.includes('soccer') && t.includes('boys'))         return 'soccer_boys';
  if (t.includes('soccer') && t.includes('girls'))        return 'soccer_girls';
  if (t.includes('volleyball'))                           return 'volleyball';
  if (t.includes('golf') && t.includes('boys'))           return 'golf_boys';
  if (t.includes('golf') && t.includes('girls'))          return 'golf_girls';
  if (t.includes('baseball'))                             return 'baseball';
  if (t.includes('softball'))                             return 'softball';
  if (t.includes('cross country'))                        return 'cross_country';
  if (t.includes('swim') || t.includes('diving'))         return 'swimming';
  if (t.includes('tennis') && t.includes('boys'))         return 'tennis_boys';
  if (t.includes('tennis') && t.includes('girls'))        return 'tennis_girls';
  if (t.includes('track'))                                return 'track';
  if (t.includes('wrestling'))                            return 'wrestling';
  if (t.includes('gymnastics'))                           return 'gymnastics';
  if (t.includes('lacrosse') && t.includes('boys'))       return 'lacrosse_boys';
  if (t.includes('lacrosse') && t.includes('girls'))      return 'lacrosse_girls';
  if (t.includes('bowling') && t.includes('boys'))        return 'bowling_boys';
  if (t.includes('bowling') && t.includes('girls'))       return 'bowling_girls';
  if (t.includes('cheer'))                                return 'cheer';
  if (t.includes('dance'))                                return 'dance_team';
  return 'other';
}

async function loadCalendarYbEvents() {
  const db = getDB();
  const TTL = 24 * 60 * 60 * 1000; // 24 hours

  // Try Firestore shared cache first — all students benefit from one fetch
  if (db) {
    try {
      const doc = await db.collection('hm_config').doc('cal_cache').get();
      trackUsage('reads', 1);
      if (doc.exists) {
        const { ts, events } = doc.data();
        if (Date.now() - ts < TTL && events) {
          S.calendarYbEvents = events; return;
        }
      }
    } catch(e) {}
  }

  // Cache is missing or stale — fetch from Apps Script and update Firestore
  if (!SYNC_SCRIPT_URL) return;
  try {
    const resp   = await fetch(`${SYNC_SCRIPT_URL}?action=getEvents`);
    const result = await resp.json();
    if (result.success) {
      const events = result.events.map(ev => {
        const type = inferYbType(ev.title);
        return { ...ev, type, icon: YB_ICONS[type] || '📅' };
      });
      S.calendarYbEvents = events;
      if (db) {
        trackUsage('writes');
        db.collection('hm_config').doc('cal_cache').set({ ts: Date.now(), events }).catch(() => {});
      }
    }
  } catch(e) {}
}

async function loadCustomYbEvents() {
  const db = getDB();
  if (!db) return;
  try {
    const snap = await db.collection('hm_yearbook_events').orderBy('date').get();
    trackUsage('reads', snap.size);
    S.customYbEvents = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch(e) {}
}

async function saveYbEvent() {
  const title = val('yb-new-title');
  const date  = val('yb-new-date');
  const time  = val('yb-new-time');
  const type  = val('yb-new-type');
  if (!title || !date) { showToast('Title and date are required.'); return; }

  const btn = document.getElementById('yb-save-event-btn');
  if (btn) btn.textContent = 'Saving…';

  let calEventId = '';
  if (SYNC_SCRIPT_URL) {
    try {
      const url = `${SYNC_SCRIPT_URL}?action=addEvent&title=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time || '12:00 PM')}`;
      const resp = await fetch(url);
      const result = await resp.json();
      if (result.success) calEventId = result.calEventId || '';
    } catch(e) {}
  }

  const db = getDB();
  const doc = { title, date, time, type, calEventId, createdAt: new Date().toISOString() };
  if (db) {
    try {
      trackUsage('writes');
      const ref = await db.collection('hm_yearbook_events').add(doc);
      doc.id = ref.id;
    } catch(e) {}
  }
  if (!doc.id) doc.id = Date.now().toString();
  S.customYbEvents.push(doc);
  showToast(calEventId ? 'Event saved and added to calendar!' : 'Event saved. (Calendar sync unavailable — check Apps Script URL.)');
  render();
}

async function deleteYbEvent(id) {
  const ev = (S.customYbEvents || []).find(e => e.id === id);
  if (!ev || !confirm(`Delete "${ev.title}"?`)) return;

  if (ev.calEventId && SYNC_SCRIPT_URL) {
    try {
      await fetch(`${SYNC_SCRIPT_URL}?action=deleteEvent&calEventId=${encodeURIComponent(ev.calEventId)}`);
    } catch(e) {}
  }

  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_yearbook_events').doc(id).delete().catch(() => {}); }
  S.customYbEvents = S.customYbEvents.filter(e => e.id !== id);
  showToast('Event deleted.');
  render();
}

async function submitYearbookSignup() {
  const name    = (document.getElementById('yb-name')?.value || '').trim();
  const email   = (document.getElementById('yb-email')?.value || '').trim();
  const eventId = document.getElementById('yb-event')?.value;
  const role    = document.getElementById('yb-role')?.value;

  if (!name)    { showToast('Please enter your name.');    return; }
  if (!email)   { showToast('Please enter your email.');   return; }
  if (!eventId) { showToast('Please select an event.');    return; }
  if (!role)    { showToast('Please choose a role.');      return; }

  const event = allYbEvents().find(e => e.id === eventId);
  if (!event) return;

  const already = (S.yearbookCoverage || []).find(
    s => s.eventId === eventId && s.studentName.toLowerCase() === name.toLowerCase()
  );
  if (already) { showToast('You are already signed up for that event.'); return; }

  const db = getDB();
  if (!db) { showToast('Database unavailable.'); return; }

  localStorage.setItem('hm_yb_name',  name);
  localStorage.setItem('hm_yb_email', email);
  localStorage.removeItem('hm_yb_coverage');

  try {
    trackUsage('writes');
    await db.collection('hm_yearbook_coverage').add({
      studentName: name, email, eventId, eventTitle: event.title,
      eventDate: event.date, role, submittedAt: Date.now(),
    });
    showToast('Signed up! Your teacher will confirm your assignment.');
    await loadYearbookCoverage();
  } catch(e) { showToast('Could not save — try again.'); }
}

async function unsignYearbook(docId) {
  if (!confirm('Remove your sign-up for this event?')) return;
  const db = getDB();
  if (!db) return;
  try {
    trackUsage('writes');
    await db.collection('hm_yearbook_coverage').doc(docId).delete();
    localStorage.removeItem('hm_yb_coverage');
    showToast('Sign-up removed.');
    await loadYearbookCoverage();
  } catch(e) { showToast('Could not remove — try again.'); }
}

// ── BROADCAST SIGN-UP (Student) ───────────────────────────────
function renderAvailabilityPage() {
  const myName  = localStorage.getItem('hm_student_name') || '';
  const myEmail = localStorage.getItem('hm_student_email') || '';
  const canSignUp = !!(myName && myEmail);
  const now = new Date();
  const upcoming = (S.broadcasts || [])
    .filter(b => new Date(b.date + 'T00:00:00') >= now)
    .sort((a, b) => a.date.localeCompare(b.date));

  const broadcastCards = upcoming.map(b => {
    const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
    const myEntry = (S.availabilities || []).find(
      a => a.broadcastId === b.id && a.studentName.toLowerCase() === myName.toLowerCase()
    );
    const isAvailable = !!myEntry;
    const myRoles = myEntry?.interestedRoles || [];
    const totalSignedUp = (S.availabilities || []).filter(a => a.broadcastId === b.id).length;

    return `
      <div class="avail-bc-card card">
        <div class="avail-bc-meta">
          <span class="avail-bc-type-badge" style="background:${et.color}">${et.label}</span>
          <span class="avail-bc-date">${fmtDate(b.date, false)}</span>
          ${totalSignedUp > 0 ? `<span class="avail-bc-signups">${totalSignedUp} signed up</span>` : ''}
        </div>
        <div class="avail-bc-title">${esc(b.title)}</div>
        ${b.notes ? `<div class="avail-bc-notes">${esc(b.notes)}</div>` : ''}
        ${b.gameTime ? `
        <div class="avail-bc-times">
          <span class="avail-door33-chip">🚪 Door 33 ${computeDoor33(b.gameTime, b.type)}</span>
          <span class="avail-arrival-chip">${ARRIVAL_LABEL[b.type] ?? ARRIVAL_DEFAULT_LABEL} ${computeArrival(b.gameTime, b.type)}</span>
          <span class="avail-gametime-chip">Game ${esc(b.gameTime)}</span>
        </div>` : ''}

        <label class="avail-available-toggle ${!canSignUp ? 'avail-disabled' : ''}">
          <input type="checkbox" class="avail-broadcast-cb"
            data-bid="${b.id}"
            ${isAvailable ? 'checked' : ''}
            ${!canSignUp ? 'disabled' : ''}>
          <span class="avail-toggle-label">I'm available for this broadcast</span>
        </label>

        ${isAvailable ? `
          <div class="avail-roles-section">
            <div class="avail-roles-label">Interested positions <span class="hint" style="font-weight:400;color:var(--dim)">(optional)</span></div>
            <div class="avail-roles-grid">
              ${LIVE_ROLES.map(role => `
                <label class="avail-role-label">
                  <input type="checkbox" class="avail-role-cb"
                    data-bid="${b.id}" data-role="${role}"
                    ${myRoles.includes(role) ? 'checked' : ''}>
                  <span>${role}</span>
                </label>`).join('')}
            </div>
          </div>` : ''}
      </div>`;
  }).join('') || `<p class="dim" style="padding:24px 0">No upcoming broadcasts scheduled.</p>`;

  return `
    ${navBar('live')}
    <div class="class-page">
      <button class="back-btn" data-nav="live">← Back to Homestead Live</button>
      <div class="avail-page-header">
        <h1>Broadcast Sign-Up</h1>
        <p>Check the positions you're interested in for each upcoming broadcast. Your teacher will use this to assign the crew.</p>
      </div>
      <div class="avail-name-card card">
        <div class="avail-name-fields">
          <div class="avail-name-field">
            <label class="avail-name-label">Your Name <span class="avail-required">required</span></label>
            <div class="avail-name-row">
              <input id="avail-page-name" type="text" class="avail-name-input ${!myName ? 'avail-input-empty' : ''}"
                placeholder="First and last name" value="${esc(myName)}">
              ${myName
                ? `<span class="avail-name-saved">✓ Saved</span>`
                : `<span class="avail-hint-warn">← Enter to unlock sign-ups</span>`}
            </div>
          </div>
          <div class="avail-name-field">
            <label class="avail-name-label">Email Address <span class="avail-required">required</span></label>
            <div class="avail-name-row">
              <input id="avail-page-email" type="email" class="avail-name-input ${!myEmail ? 'avail-input-empty' : ''}"
                placeholder="your@email.com" value="${esc(myEmail)}">
              ${myEmail
                ? `<span class="avail-name-saved">✓ Saved</span>`
                : `<span class="avail-hint-warn">← Enter to unlock sign-ups</span>`}
            </div>
          </div>
          ${!canSignUp ? `<p class="avail-unlock-msg">Enter your name and email above to sign up for broadcasts.</p>` : ''}
        </div>
      </div>
      <div class="avail-broadcasts">${broadcastCards}</div>
    </div>`;
}

// ── Planner Logic ─────────────────────────────────────────────
function savePlannerStep() {
  const p = S.plannerData || {};
  switch (S.plannerStep) {
    case 0:
      p.studentName = val('p-name');
      p.showName    = val('p-show');
      p.partners    = val('p-partners');
      break;
    case 1:
      p.theme = { title: val('p-theme-title'), description: val('p-theme-desc') };
      break;
    case 2:
      if (!p.breaks) p.breaks = [{}, {}, {}];
      p.breaks[0] = { title: val('b1-title'), newsUpdate: val('b1-news'), connection: val('b1-connection'), transition: val('b1-transition') };
      break;
    case 3:
      if (!p.breaks) p.breaks = [{}, {}, {}];
      p.breaks[1] = { title: val('b2-title'), activityHook: val('b2-activity'), connection: val('b2-connection'), tease: val('b2-tease') };
      break;
    case 4:
      if (!p.breaks) p.breaks = [{}, {}, {}];
      p.breaks[2] = { title: val('b3-title'), talkingPoints: [val('b3-tp1'), val('b3-tp2'), val('b3-tp3')], format: val('b3-format'), wrapUp: val('b3-wrapup') };
      break;
  }
  S.plannerData = p;
  S.plannerStep++;
  render();
}

async function submitPlan() {
  const p = S.plannerData || {};
  if (!p.studentName) { showToast('Please enter your name first.'); return; }
  const submission = { ...p, submittedAt: new Date().toISOString() };
  const db = getDB();
  if (db) {
    try { trackUsage('writes'); await db.collection('hm_radio_plans').add(submission); }
    catch(e) {}
  }
  localStorage.setItem('hm_plan_' + p.studentName, JSON.stringify(submission));

  const mailtoLink = buildPlanMailto(p);
  const m = modal(`
    <div style="text-align:center;padding:8px 0 4px">
      <div style="font-size:2.5rem;margin-bottom:12px">✓</div>
      <h2 style="margin-bottom:8px">Plan Submitted!</h2>
      <p style="color:var(--dim);font-size:0.875rem;line-height:1.6;margin-bottom:24px">
        Your talk show plan for <strong>${esc(p.showName || 'your show')}</strong> has been turned in.
        Send yourself a copy so you have it ready on show day.
      </p>
      <a href="${mailtoLink}"
         style="display:inline-block;text-decoration:none;padding:10px 20px;background:var(--radio);color:#000;border-radius:8px;font-weight:600;font-size:0.875rem">
        📧 Email yourself a copy
      </a>
    </div>`, null, false);

  const doneBtn = m.querySelector('#modal-cancel');
  doneBtn.textContent = 'Done';
  doneBtn.addEventListener('click', () => {
    m.remove();
    S.plannerData = null;
    S.plannerStep = 0;
    go('radio');
  });
}

function buildPlanMailto(p) {
  const b1   = ((p.breaks || [])[0]) || {};
  const b2   = ((p.breaks || [])[1]) || {};
  const b3   = ((p.breaks || [])[2]) || {};
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const subject = `Talk Show Plan — ${p.showName || 'My Show'} — ${date}`;

  const lines = [
    'TALK SHOW PLAN',
    '==============',
    `Student:  ${p.studentName || ''}`,
    `Show:     ${p.showName || ''}`,
    p.partners ? `Partners: ${p.partners}` : null,
    `Date:     ${date}`,
    '',
    `EPISODE THEME: ${(p.theme || {}).title || ''}`,
    (p.theme || {}).description || '',
    '',
    `-- BREAK 1: ${b1.title || 'News / Relevant Tie-In'} --`,
    `News/Update:  ${b1.newsUpdate || ''}`,
    `Connection:   ${b1.connection || ''}`,
    `Transition:   ${b1.transition || ''}`,
    '',
    `-- BREAK 2: ${b2.title || 'Fun Activity / Preview'} --`,
    `Activity:     ${b2.activityHook || ''}`,
    `Connection:   ${b2.connection || ''}`,
    `Tease:        ${b2.tease || ''}`,
    '',
    `-- BREAK 3: ${b3.title || 'Main Topic'} --`,
    `Point 1:  ${(b3.talkingPoints || [])[0] || ''}`,
    `Point 2:  ${(b3.talkingPoints || [])[1] || ''}`,
    `Point 3:  ${(b3.talkingPoints || [])[2] || ''}`,
    `Format:   ${b3.format || ''}`,
    `Wrap-up:  ${b3.wrapUp || ''}`,
  ].filter(l => l !== null).join('\n');

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`;
}

// ── Teacher: Station Schedule ──────────────────────────────────
function showEditStationSlot(stationId, dayIdx) {
  const station = STATIONS.find(s => s.id === stationId);
  const slot = (S.stationSchedule[stationId] || [])[dayIdx] || { show: '', djs: [] };
  const dayName = DAYS[dayIdx];
  const hasContent = slot.show && slot.show.trim();
  const m = modal(`
    <h2>${station ? station.name + ' — ' : ''}${dayName}</h2>
    <div class="form-group">
      <label>Show Name</label>
      <input id="m-show" type="text" value="${esc(slot.show || '')}" placeholder="e.g. Morning Vibes">
    </div>
    <div class="form-group">
      <label>DJ(s) <span class="hint">(comma separated)</span></label>
      <input id="m-djs" type="text" value="${esc((slot.djs || []).join(', '))}" placeholder="Alex, Jordan">
    </div>`, hasContent ? 'Clear' : null);

  const save = async (show, djs) => {
    if (!S.stationSchedule[stationId]) S.stationSchedule[stationId] = DAYS.map(() => ({ show: '', djs: [] }));
    S.stationSchedule[stationId][dayIdx] = { show, djs };
    const db = getDB();
    if (db) { trackUsage('writes'); await db.collection('hm_radio').doc('station_schedule').set(S.stationSchedule).catch(() => {}); }
    m.remove(); render();
  };

  m.querySelector('#modal-save').addEventListener('click', () =>
    save(val('m-show'), val('m-djs').split(',').map(s => s.trim()).filter(Boolean)));

  const clearBtn = m.querySelector('#modal-extra');
  if (clearBtn) clearBtn.addEventListener('click', () => save('', []));
}

// ── Teacher: Broadcasts ───────────────────────────────────────
function showAddBroadcastModal() {
  const m = modal(`
    <h2>Add Broadcast</h2>
    <div class="form-group">
      <label>Event Name</label>
      <input id="m-title" type="text" placeholder="e.g. Varsity Football vs. East High">
    </div>
    <div class="form-group">
      <label>Date</label>
      <input id="m-date" type="date">
    </div>
    <div class="form-group">
      <label>Game Time <span class="hint">(e.g. 7:30 PM)</span></label>
      <input id="m-gametime" type="text" placeholder="7:30 PM">
    </div>
    <div class="form-group">
      <label>Type</label>
      <select id="m-type">
        ${Object.entries(EVENT_TYPES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
      </select>
    </div>`);
  m.querySelector('#modal-save').addEventListener('click', async () => {
    const title    = val('m-title');
    const date     = val('m-date');
    const type     = val('m-type');
    const gameTime = val('m-gametime');
    if (!title || !date) { showToast('Please fill in all fields.'); return; }
    const db = getDB();
    const doc = { title, date, type, gameTime, roles: {}, checks: {} };
    if (db) {
      try { trackUsage('writes'); const ref = await db.collection('hm_broadcasts').add(doc); doc.id = ref.id; } catch(e) {}
    }
    if (!doc.id) doc.id = Date.now().toString();
    S.broadcasts.push(doc);
    m.remove(); render();
  });
}

async function saveRoleAssignments() {
  const b = (S.broadcasts || []).find(x => x.id === S.broadcastId);
  if (!b) return;
  const roles = {};
  document.querySelectorAll('.role-input').forEach(el => { roles[el.dataset.role] = el.value.trim(); });
  b.roles = roles;
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).update({ roles }).catch(() => {}); }
  showToast('Roles saved!');
  render();
}

async function saveBroadcastNotes() {
  const b = (S.broadcasts || []).find(x => x.id === S.broadcastId);
  if (!b) return;
  b.notes = val('broadcast-notes');
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).update({ notes: b.notes }).catch(() => {}); }
  showToast('Notes saved!');
  render();
}

async function saveChecklist() {
  const b = (S.broadcasts || []).find(x => x.id === S.broadcastId);
  if (!b) return;
  const checks = {};
  document.querySelectorAll('.check-item').forEach((cb, i) => { checks[i] = cb.checked; });
  b.checks = checks;
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_broadcasts').doc(b.id).update({ checks }).catch(() => {}); }
}

// ── Availability ──────────────────────────────────────────────
async function toggleBroadcastAvailability(broadcastId, available) {
  const myName  = localStorage.getItem('hm_student_name') || '';
  const myEmail = localStorage.getItem('hm_student_email') || '';
  if (!myName || !myEmail) { showToast('Enter your name and email first.'); return; }

  const existing = (S.availabilities || []).find(
    a => a.broadcastId === broadcastId && a.studentName.toLowerCase() === myName.toLowerCase()
  );

  if (available && !existing) {
    const myEmail = localStorage.getItem('hm_student_email') || '';
    const entry = { broadcastId, studentName: myName, email: myEmail, interestedRoles: [], submittedAt: new Date().toISOString() };
    const db = getDB();
    if (db) {
      try {
        trackUsage('writes');
        const ref = await db.collection('hm_availability').add(entry);
        S.availabilities.push({ id: ref.id, ...entry });
      } catch(e) { showToast('Could not save. Try again.'); return; }
    } else {
      S.availabilities.push({ id: Date.now().toString(), ...entry });
    }
  } else if (!available && existing) {
    S.availabilities = S.availabilities.filter(a => a.id !== existing.id);
    const db = getDB();
    if (db) { trackUsage('writes'); await db.collection('hm_availability').doc(existing.id).delete().catch(() => {}); }
  }
  render();
}

async function toggleAvailabilityRole(broadcastId, role, checked) {
  const myName  = localStorage.getItem('hm_student_name') || '';
  const myEmail = localStorage.getItem('hm_student_email') || '';
  if (!myName || !myEmail) { showToast('Enter your name and email first.'); return; }

  const existing = (S.availabilities || []).find(
    a => a.broadcastId === broadcastId && a.studentName.toLowerCase() === myName.toLowerCase()
  );
  const db = getDB();

  if (existing) {
    const roles = existing.interestedRoles || [];
    existing.interestedRoles = checked
      ? [...new Set([...roles, role])]
      : roles.filter(r => r !== role);
    if (db) { trackUsage('writes'); await db.collection('hm_availability').doc(existing.id)
      .update({ interestedRoles: existing.interestedRoles }).catch(() => {}); }
  } else {
    const myEmail = localStorage.getItem('hm_student_email') || '';
    const entry = { broadcastId, studentName: myName, email: myEmail, interestedRoles: checked ? [role] : [], submittedAt: new Date().toISOString() };
    if (db) {
      try {
        trackUsage('writes');
        const ref = await db.collection('hm_availability').add(entry);
        S.availabilities.push({ id: ref.id, ...entry });
      } catch(e) { showToast('Could not save. Try again.'); }
    } else {
      S.availabilities.push({ id: Date.now().toString(), ...entry });
    }
  }
}

async function removeAvailability(availId) {
  S.availabilities = (S.availabilities || []).filter(a => a.id !== availId);
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_availability').doc(availId).delete().catch(() => {}); }
  render();
}

// ── Teacher: Submissions ──────────────────────────────────────
async function showSubmissions() {
  const db = getDB();
  let subs = [];
  if (db) {
    try {
      const snap = await db.collection('hm_radio_plans').get();
      trackUsage('reads', snap.size);
      snap.forEach(doc => subs.push({ id: doc.id, ...doc.data() }));
    } catch(e) {}
  }
  if (!subs.length) { showToast('No submissions yet.'); return; }

  const m = modal(`
    <h2>Student Submissions (${subs.length})</h2>
    <div class="submission-list">
      ${subs.map(s => `
        <div class="submission-item" data-sub-id="${s.id}">
          <div class="submission-student">${esc(s.studentName || 'Unknown')}</div>
          <div class="submission-show">${esc(s.showName || '—')}</div>
          <div class="submission-date">${s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}</div>
        </div>`).join('')}
    </div>`, null, false);

  m.querySelectorAll('.submission-item').forEach(el => {
    el.addEventListener('click', () => {
      const sub = subs.find(s => s.id === el.dataset.subId);
      if (!sub) return;
      showSubmissionDetail(sub, m);
    });
  });
}

function showSubmissionDetail(sub, parentModal) {
  if (parentModal) parentModal.remove();
  const b1 = ((sub.breaks || [])[0]) || {};
  const b2 = ((sub.breaks || [])[1]) || {};
  const b3 = ((sub.breaks || [])[2]) || {};
  const m = modal(`
    <h2>${esc(sub.studentName)} — ${esc(sub.showName || 'Untitled')}</h2>
    <div class="submission-detail">
      <div class="submission-field">
        <div class="submission-field-label">Theme</div>
        <div class="submission-field-value"><strong>${esc((sub.theme || {}).title || '—')}</strong><br>${esc((sub.theme || {}).description || '')}</div>
      </div>
      <div class="submission-field">
        <div class="submission-field-label">Break 1 — ${esc(b1.title || 'News')}</div>
        <div class="submission-field-value">${esc(b1.newsUpdate || '—')}<br><em>Connection: ${esc(b1.connection || '—')}</em></div>
      </div>
      <div class="submission-field">
        <div class="submission-field-label">Break 2 — ${esc(b2.title || 'Activity')}</div>
        <div class="submission-field-value">${esc(b2.activityHook || '—')}<br><em>Connection: ${esc(b2.connection || '—')}</em></div>
      </div>
      <div class="submission-field">
        <div class="submission-field-label">Break 3 — ${esc(b3.title || 'Main Topic')}</div>
        <div class="submission-field-value">
          ${(b3.talkingPoints || []).filter(Boolean).map((t, i) => `${i + 1}. ${esc(t)}`).join('<br>') || '—'}<br>
          <em>Format: ${esc(b3.format || '—')}</em>
        </div>
      </div>
    </div>`);
}

// ── Firebase Usage Tracking ───────────────────────────────────
function getUsage() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const u = JSON.parse(localStorage.getItem('hm_usage') || '{}');
    if (u.date !== today) return { date: today, reads: 0, writes: 0 };
    return u;
  } catch(e) { return { date: today, reads: 0, writes: 0 }; }
}
function trackUsage(type, n = 1) {
  const u = getUsage();
  u[type] = (u[type] || 0) + n;
  try { localStorage.setItem('hm_usage', JSON.stringify(u)); } catch(e) {}
}

// ── Helpers ───────────────────────────────────────────────────
function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function fmtDate(dateStr, long) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return long
      ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
      : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } catch(e) { return dateStr; }
}

function modal(bodyHtml, extraBtnLabel, showSave = true) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      ${bodyHtml}
      <div class="modal-actions">
        <button class="btn-secondary" id="modal-cancel">Cancel</button>
        ${extraBtnLabel ? `<button class="btn-danger" id="modal-extra">${extraBtnLabel}</button>` : ''}
        ${showSave ? `<button class="btn-primary" id="modal-save">Save</button>` : ''}
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#modal-cancel').addEventListener('click', () => overlay.remove());
  return overlay;
}

function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

// ── Event Listeners ───────────────────────────────────────────
function attachListeners() {
  document.querySelectorAll('[data-nav]').forEach(el =>
    el.addEventListener('click', () => {
      if (el.dataset.nav === 'lessons') {
        S.lessonCourse = null; S.lessonUnit = null; S.lessonId = null;
      }
      go(el.dataset.nav);
    }));

  document.querySelectorAll('[data-broadcast]').forEach(el =>
    el.addEventListener('click', () => go('broadcast', { broadcastId: el.dataset.broadcast })));

  document.querySelectorAll('.sched-edit').forEach(el =>
    el.addEventListener('click', (e) => { e.stopPropagation(); showEditBroadcastModal(el.dataset.id); }));

  const tt = document.getElementById('teacher-toggle');
  if (tt) tt.addEventListener('click', () => {
    if (S.teacherMode) {
      S.teacherMode = false;
      if (S.view === 'dashboard') go('home');
      else render();
    } else {
      const pin = prompt('Enter teacher PIN:');
      if (pin === null) return;
      if (pin === TEACHER_PIN) { S.teacherMode = true; render(); }
      else showToast('Incorrect PIN.');
    }
  });

  const sp = document.getElementById('start-planner');
  if (sp) sp.addEventListener('click', () => { S.plannerData = S.plannerData || {}; S.plannerStep = 0; go('planner'); });

  const pn = document.getElementById('planner-next');
  if (pn) pn.addEventListener('click', savePlannerStep);

  const pb = document.getElementById('planner-back');
  if (pb) pb.addEventListener('click', () => { S.plannerStep--; render(); });

  const ps = document.getElementById('planner-submit');
  if (ps) ps.addEventListener('click', submitPlan);

  const pp = document.getElementById('planner-print');
  if (pp) pp.addEventListener('click', () => window.print());

  const ab = document.getElementById('add-broadcast');
  if (ab) ab.addEventListener('click', showAddBroadcastModal);

  const sr = document.getElementById('save-roles');
  if (sr) sr.addEventListener('click', saveRoleAssignments);

  const sn = document.getElementById('save-notes');
  if (sn) sn.addEventListener('click', saveBroadcastNotes);

  const vs = document.getElementById('view-submissions');
  if (vs) vs.addEventListener('click', showSubmissions);

  document.querySelectorAll('.slot-edit-btn').forEach(btn =>
    btn.addEventListener('click', () => showEditStationSlot(btn.dataset.station, parseInt(btn.dataset.day))));

  document.querySelectorAll('.check-item').forEach(cb =>
    cb.addEventListener('change', saveChecklist));

  const oi = document.getElementById('open-iasb');
  if (oi) oi.addEventListener('click', () => go('iasb'));

  document.querySelectorAll('[data-iasb-cat]').forEach(el =>
    el.addEventListener('click', () => {
      S.iasbCategory = el.dataset.iasbCat;
      go('iasb-category');
    }));

  const ri = document.getElementById('register-iasb-entry');
  if (ri && !ri.disabled) ri.addEventListener('click', () => {
    const cat = IASB_CATEGORIES.find(c => c.code === S.iasbCategory);
    if (cat) showRegisterIASBModal(cat);
  });

  document.querySelectorAll('.iasb-entry-check').forEach(cb =>
    cb.addEventListener('change', () =>
      updateIASBCheckItem(cb.dataset.entryId, parseInt(cb.dataset.idx), cb.checked)));

  document.querySelectorAll('.iasb-mark-submitted').forEach(btn =>
    btn.addEventListener('click', () => markIASBSubmitted(btn.dataset.entryId, true)));

  document.querySelectorAll('.iasb-unmark-submitted').forEach(btn =>
    btn.addEventListener('click', () => markIASBSubmitted(btn.dataset.entryId, false)));

  document.querySelectorAll('.iasb-delete-entry').forEach(btn =>
    btn.addEventListener('click', () => {
      if (confirm('Delete this entry? This cannot be undone.')) deleteIASBEntry(btn.dataset.entryId);
    }));

  document.querySelectorAll('.avail-broadcast-cb').forEach(cb =>
    cb.addEventListener('change', () => toggleBroadcastAvailability(cb.dataset.bid, cb.checked)));

  document.querySelectorAll('.avail-role-cb').forEach(cb =>
    cb.addEventListener('change', () => toggleAvailabilityRole(cb.dataset.bid, cb.dataset.role, cb.checked)));

  document.querySelectorAll('.avail-assign-sel').forEach(sel =>
    sel.addEventListener('change', () => {
      if (!sel.value) return;
      const input = document.querySelector(`.role-input[data-role="${sel.value}"]`);
      if (input) input.value = sel.dataset.name;
      showToast(`${sel.dataset.name} → ${sel.value}`);
      sel.value = '';
    }));

  document.querySelectorAll('.avail-del-btn').forEach(btn =>
    btn.addEventListener('click', () => removeAvailability(btn.dataset.availId)));

  const apn = document.getElementById('avail-page-name');
  if (apn) {
    apn.addEventListener('blur', () => {
      const n = apn.value.trim();
      if (n) { localStorage.setItem('hm_student_name', n); render(); }
    });
    apn.addEventListener('keydown', e => { if (e.key === 'Enter') apn.blur(); });
  }

  const ape = document.getElementById('avail-page-email');
  if (ape) {
    ape.addEventListener('blur', () => {
      const e = ape.value.trim();
      if (e) {
        localStorage.setItem('hm_student_email', e);
        // Update all existing availability entries for this student
        const myName = localStorage.getItem('hm_student_name') || '';
        if (myName) {
          (S.availabilities || [])
            .filter(a => a.studentName.toLowerCase() === myName.toLowerCase() && a.email !== e)
            .forEach(a => {
              a.email = e;
              db.collection('hm_availability').doc(a.id).update({ email: e }).catch(() => {});
            });
        }
        render();
      }
    });
    ape.addEventListener('keydown', e => { if (e.key === 'Enter') ape.blur(); });
  }

  const dbRefresh = document.getElementById('db-refresh-plans');
  if (dbRefresh) dbRefresh.addEventListener('click', dashboardLoadPlans);

  const syncBtn = document.getElementById('sync-cal-btn');
  if (syncBtn) syncBtn.addEventListener('click', () => {
    const status = document.getElementById('sync-cal-status');
    syncBtn.disabled = true;
    syncBtn.textContent = 'Syncing…';
    if (status) status.textContent = '';
    fetch(SYNC_SCRIPT_URL, { mode: 'no-cors' })
      .then(() => {
        syncBtn.textContent = '↻ Sync Athletics Calendar Now';
        syncBtn.disabled = false;
        if (status) status.textContent = 'Sync triggered — check the HHS Media Events calendar in a minute.';
      })
      .catch(() => {
        syncBtn.textContent = '↻ Sync Athletics Calendar Now';
        syncBtn.disabled = false;
        if (status) status.textContent = 'Could not reach sync script — check the URL in data.js.';
      });
  });

  document.querySelectorAll('.db-view-btn').forEach(btn =>
    btn.addEventListener('click', () => {
      S.iasbCategory = btn.dataset.iasbCat;
      go('iasb-category');
    }));

  document.querySelectorAll('.db-plan-detail').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = (S.submissions || []).find(s => s.id === btn.dataset.subId);
      if (sub) showSubmissionDetail(sub, null);
    });
  });

  // Yearbook role picker
  document.querySelectorAll('.yb-role-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.yb-role-btn').forEach(b => b.classList.remove('yb-role-active'));
      btn.classList.add('yb-role-active');
      const ri = document.getElementById('yb-role');
      if (ri) ri.value = btn.dataset.role;
    });
  });

  const ybSubmit = document.getElementById('yb-submit-btn');
  if (ybSubmit) ybSubmit.addEventListener('click', submitYearbookSignup);

  document.querySelectorAll('[data-yb-unsign]').forEach(btn =>
    btn.addEventListener('click', () => unsignYearbook(btn.dataset.ybUnsign)));

  // Yearbook dashboard
  const ybDash = document.getElementById('yb-dash-refresh');
  if (ybDash) ybDash.addEventListener('click', loadYearbookCoverage);

  document.querySelectorAll('[data-yb-view]').forEach(btn =>
    btn.addEventListener('click', () => { S.ybDashView = btn.dataset.ybView; render(); }));

  const ybAddBtn = document.getElementById('yb-add-event-btn');
  if (ybAddBtn) ybAddBtn.addEventListener('click', () => {
    const form = document.getElementById('yb-event-form');
    if (form) form.style.display = form.style.display === 'none' ? '' : 'none';
  });

  const ybCancelBtn = document.getElementById('yb-cancel-event-btn');
  if (ybCancelBtn) ybCancelBtn.addEventListener('click', () => {
    const form = document.getElementById('yb-event-form');
    if (form) form.style.display = 'none';
  });

  const ybSaveBtn = document.getElementById('yb-save-event-btn');
  if (ybSaveBtn) ybSaveBtn.addEventListener('click', saveYbEvent);

  document.querySelectorAll('.yb-delete-event-btn').forEach(btn =>
    btn.addEventListener('click', () => deleteYbEvent(btn.dataset.ybEventId)));

  document.querySelectorAll('[data-lesson-course]').forEach(el =>
    el.addEventListener('click', () => {
      S.lessonCourse = el.dataset.lessonCourse;
      S.lessonUnit   = el.dataset.lessonUnit  || null;
      S.lessonId     = el.dataset.lessonId    || null;
      S.lessonSlide  = 0;
      go('lessons');
    }));

  document.querySelectorAll('[data-lesson-back]').forEach(el =>
    el.addEventListener('click', () => {
      const dest = el.dataset.lessonBack;
      if (dest === 'hub')    { S.lessonCourse = null; S.lessonUnit = null; S.lessonId = null; }
      if (dest === 'course') { S.lessonUnit = null; S.lessonId = null; }
      S.lessonSlide = 0;
      go('lessons');
    }));

  document.querySelectorAll('[data-lesson-slide]').forEach(el =>
    el.addEventListener('click', () => {
      const dir = el.dataset.lessonSlide;
      const course = LESSONS[S.lessonCourse];
      if (!course) return;
      const unit = course.units.find(u => u.id === S.lessonUnit);
      if (!unit) return;
      const lesson = unit.lessons.find(l => l.id === S.lessonId);
      if (!lesson) return;
      const total = (lesson.sections || []).length + 2;
      if (dir === 'next' && S.lessonSlide < total - 1) S.lessonSlide++;
      if (dir === 'prev' && S.lessonSlide > 0) S.lessonSlide--;
      go('lessons');
    }));
}

// ── LESSONS ───────────────────────────────────────────────────
const LESSON_ICONS = {
  welcome: '🎙️', stations: '📡', fcc: '📜', expectations: '📋',
  'ap-intro': '🎤', 'front-load': '⏩', 'first-break': '🎛️',
  'radio-pairs': '👥',
  'show-structure': '🎭',
  'destructive-editing': '✂️',
  'audition-basics': '🎚️', 'stutter': '🔊', 'double-track': '🔁',
  'remix-stretch': '🎵', 'reverb': '🌊', 'spectral-display': '🌈',
};

function renderLessons() {
  if (S.lessonId) return renderLessonPage();
  if (S.lessonCourse) return renderLessonCourse();
  return renderLessonsHub();
}

function renderLessonsHub() {
  const cards = Object.entries(LESSONS).map(([key, course]) => {
    const totalLessons = course.units.reduce((sum, u) => sum + u.lessons.length, 0);
    const locked = totalLessons === 0;
    return `
      <div class="class-card lesson-hub-card ${locked ? 'lesson-locked' : ''}"
           ${locked ? '' : `data-lesson-course="${key}"`}
           style="${locked ? '' : `--course-color:${course.color};border-color:${course.color}22`}">
        <div class="lesson-hub-icon" style="${locked ? '' : `background:${course.color}18`}">${course.icon}</div>
        <div class="class-name" style="color:${locked ? 'var(--dim)' : course.color}">${course.name}</div>
        ${totalLessons > 0
          ? `<div class="lesson-hub-meta">${course.units.length} unit${course.units.length !== 1 ? 's' : ''} &nbsp;·&nbsp; ${totalLessons} lesson${totalLessons !== 1 ? 's' : ''}</div>`
          : `<div class="lesson-hub-meta">Coming soon</div>`}
        <div class="class-enter">${locked ? 'Coming Soon' : 'Open →'}</div>
      </div>`;
  }).join('');

  return `
    ${navBar('lessons')}
    <div class="class-page">
      <div class="class-header">
        <div class="class-header-icon">📚</div>
        <div>
          <h1>Lessons</h1>
          <p>Pick a class to see units and lessons.</p>
        </div>
      </div>
      <div class="class-grid">${cards}</div>
    </div>`;
}

function renderLessonCourse() {
  const course = LESSONS[S.lessonCourse];
  if (!course) return renderLessonsHub();

  const units = course.units.map((unit, ui) => {
    const items = unit.lessons.map((l, li) => {
      const icon = LESSON_ICONS[l.id] || course.icon;
      return `
        <div class="lesson-item"
             data-lesson-course="${S.lessonCourse}"
             data-lesson-unit="${unit.id}"
             data-lesson-id="${l.id}">
          <div class="lesson-item-icon">${icon}</div>
          <div class="lesson-item-body">
            <div class="lesson-item-num">Lesson ${ui * 10 + li + 1}</div>
            <div class="lesson-item-title">${l.title}</div>
            <div class="lesson-item-summary">${l.summary}</div>
          </div>
          <div class="lesson-item-right">
            <span class="lesson-duration-chip">${l.duration}</span>
            <span class="lesson-item-arrow">→</span>
          </div>
        </div>`;
    }).join('');
    return `
      <div class="lesson-unit-block">
        <div class="lesson-unit-header" style="border-left:4px solid ${course.color};color:${course.color}">
          ${unit.title}
        </div>
        <div class="lesson-items-list">${items}</div>
      </div>`;
  }).join('');

  return `
    ${navBar('lessons')}
    <div class="class-page">
      <button class="back-btn" data-lesson-back="hub">← All Lessons</button>
      <div class="lesson-course-header" style="--clr:${course.color}">
        <div class="lesson-course-header-icon">${course.icon}</div>
        <div>
          <h1 style="color:${course.color}">${course.name}</h1>
          <p>${course.units.length} unit${course.units.length !== 1 ? 's' : ''} · ${course.units.reduce((s, u) => s + u.lessons.length, 0)} lessons</p>
        </div>
      </div>
      <div class="lesson-units-list">${units}</div>
    </div>`;
}

function renderLessonSection(sec, courseColor) {
  let inner = '';

  switch (sec.type) {

    case 'intro':
      inner = `
        <div class="lesson-intro-block">
          <div class="lesson-intro-icon">💡</div>
          <p class="lesson-intro-para">${sec.content}</p>
        </div>`;
      break;

    case 'callout': {
      const isWarn = sec.warning;
      const icon   = isWarn ? '⚠️' : '✅';
      const cls    = isWarn ? 'lesson-callout-warn' : 'lesson-callout-tip';
      const body   = sec.content
        ? `<p class="lesson-callout-text">${sec.content}</p>`
        : `<ul class="lesson-callout-list">${(sec.items || []).map(i => `<li>${i}</li>`).join('')}</ul>`;
      inner = `
        <div class="lesson-callout ${cls}">
          <div class="lesson-callout-head">
            <span class="lesson-callout-icon">${icon}</span>
            <span class="lesson-callout-label">${sec.label}</span>
          </div>
          ${body}
        </div>`;
      break;
    }

    case 'keyterms':
      inner = `
        <div class="lesson-block">
          ${sec.title ? `
            <div class="lesson-block-head">
              <span class="lesson-block-icon">📖</span>
              <h3 class="lesson-block-title">${sec.title}</h3>
            </div>` : ''}
          <div class="lesson-keyterms">
            ${(sec.terms || []).map(t => `
              <div class="keyterm-row">
                <div class="keyterm-key">${t.term}</div>
                <div class="keyterm-val">${t.def}</div>
              </div>`).join('')}
          </div>
        </div>`;
      break;

    case 'list':
      inner = `
        <div class="lesson-block">
          ${sec.title ? `
            <div class="lesson-block-head">
              <span class="lesson-block-icon">📋</span>
              <h3 class="lesson-block-title">${sec.title}</h3>
            </div>` : ''}
          <ul class="lesson-list">
            ${(sec.items || []).map(i => `<li>${i}</li>`).join('')}
          </ul>
        </div>`;
      break;

    case 'text':
      inner = `
        <div class="lesson-block">
          ${sec.title ? `
            <div class="lesson-block-head">
              <span class="lesson-block-icon">📝</span>
              <h3 class="lesson-block-title">${sec.title}</h3>
            </div>` : ''}
          <p class="lesson-text-para">${sec.content}</p>
        </div>`;
      break;

    case 'gallery':
      inner = `
        <div class="lesson-block">
          ${sec.label ? `<div class="lesson-block-head"><span class="lesson-block-icon">🖼️</span><h3 class="lesson-block-title">${sec.label}</h3></div>` : ''}
          <div class="lesson-gallery">
            ${(sec.images || []).map(img => `
              <div class="lesson-gallery-item">
                <img src="${img.src}" alt="${img.alt || ''}" loading="lazy">
                ${img.alt ? `<p class="lesson-gallery-cap">${img.alt}</p>` : ''}
              </div>`).join('')}
          </div>
        </div>`;
      break;

    case 'video': {
      const vid = sec.youtube.replace(/.*(?:youtu\.be\/|v=)([^&?]+).*/, '$1');
      inner = `
        <div class="lesson-block">
          ${sec.label ? `<div class="lesson-block-head"><span class="lesson-block-icon">📺</span><h3 class="lesson-block-title">${sec.label}</h3></div>` : ''}
          <div class="lesson-video-wrap">
            <iframe src="https://www.youtube.com/embed/${vid}" allowfullscreen title="${sec.label || 'Video'}"></iframe>
          </div>
          ${sec.note ? `<p class="lesson-video-note">${sec.note}</p>` : ''}
        </div>`;
      break;
    }

    case 'audio':
      inner = `
        <div class="lesson-block">
          ${sec.label ? `<div class="lesson-block-head"><span class="lesson-block-icon">🎧</span><h3 class="lesson-block-title">${sec.label}</h3></div>` : ''}
          ${sec.context ? `<p class="lesson-audio-context">${sec.context}</p>` : ''}
          <div class="lesson-audio-wrap">
            <audio controls preload="metadata">
              <source src="${sec.src}" type="audio/mpeg">
            </audio>
          </div>
          ${sec.note ? `<p class="lesson-video-note">${sec.note}</p>` : ''}
          ${sec.tip ? `<div class="lesson-audio-tip">${sec.tip}</div>` : ''}
        </div>`;
      break;

    default: return '';
  }

  if (!inner) return '';

  if (sec.sideImg) {
    return `
      <div class="ls-panel">
        <div class="ls-panel-content">${inner}</div>
        <div class="ls-side-img">
          <img src="${sec.sideImg}" alt="${sec.sideImgAlt || ''}" loading="lazy">
          ${sec.sideImgCap ? `<p class="ls-side-img-cap">${sec.sideImgCap}</p>` : ''}
        </div>
      </div>`;
  }

  return inner;
}

function renderLessonSlide(slide, lesson, lessonNum, icon, course, next) {
  if (slide.type === '_title') {
    return `
      <div class="ls-slide ls-title-slide">
        <div class="ls-title-icon">${icon}</div>
        <div class="ls-title-eyebrow">Lesson ${lessonNum} &nbsp;·&nbsp; ${lesson.duration}</div>
        <h1 class="ls-title-h1">${lesson.title}</h1>
        <p class="ls-title-summary">${lesson.summary}</p>
        <div class="ls-start-hint">Press → to begin</div>
      </div>`;
  }

  if (slide.type === '_end') {
    if (next) {
      return `
        <div class="ls-slide ls-end-slide">
          <div class="ls-end-icon">✅</div>
          <h2 class="ls-end-h2">Lesson Complete!</h2>
          <p class="ls-end-sub">Up next in ${course.name}:</p>
          <div class="lesson-next-card ls-end-next-card"
               data-lesson-course="${S.lessonCourse}"
               data-lesson-unit="${next.unitId}"
               data-lesson-id="${next.id}">
            <span class="lesson-next-icon">${LESSON_ICONS[next.id] || course.icon}</span>
            <div>
              <div class="lesson-next-title">${next.title}</div>
              <div class="lesson-next-meta">${next.duration}</div>
            </div>
            <span class="lesson-next-arrow">→</span>
          </div>
        </div>`;
    }
    return `
      <div class="ls-slide ls-end-slide">
        <div class="ls-end-icon">🎉</div>
        <h2 class="ls-end-h2">Unit Complete!</h2>
        <p class="ls-end-sub">You've finished all lessons in this unit.</p>
        <button class="btn-secondary ls-end-back" data-lesson-back="course">← Back to ${course.name}</button>
      </div>`;
  }

  return `
    <div class="ls-slide ls-section-slide">
      <div class="ls-section-inner">
        ${renderLessonSection(slide, course.color)}
      </div>
    </div>`;
}

function renderLessonPage() {
  const course = LESSONS[S.lessonCourse];
  if (!course) return renderLessonsHub();
  const unit = course.units.find(u => u.id === S.lessonUnit);
  if (!unit) return renderLessonCourse();
  const lesson = unit.lessons.find(l => l.id === S.lessonId);
  if (!lesson) return renderLessonCourse();

  const allLessons = course.units.flatMap(u => u.lessons.map(l => ({ ...l, unitId: u.id })));
  const lessonIdx = allLessons.findIndex(l => l.id === S.lessonId && l.unitId === S.lessonUnit);
  const next = allLessons[lessonIdx + 1] || null;
  const lessonNum = lessonIdx + 1;
  const icon = LESSON_ICONS[lesson.id] || course.icon;

  const slides = [{ type: '_title' }, ...(lesson.sections || []), { type: '_end' }];
  const total  = slides.length;
  const idx    = Math.max(0, Math.min(S.lessonSlide || 0, total - 1));
  const pct    = Math.round(((idx + 1) / total) * 100);

  return `
    <div class="ls-show" style="--clr:${course.color}">
      <div class="ls-slide-area">
        ${renderLessonSlide(slides[idx], lesson, lessonNum, icon, course, next)}
      </div>
      <div class="ls-controls">
        <div class="ls-ctrl-left">
          <button class="ls-back-btn" data-lesson-back="course">← ${course.name}</button>
        </div>
        <div class="ls-ctrl-center">
          <div class="ls-nav">
            <button class="ls-nav-btn" data-lesson-slide="prev" ${idx === 0 ? 'disabled' : ''}>&#8592;</button>
            <div class="ls-counter">${idx + 1} <span class="ls-counter-of">/ ${total}</span></div>
            <button class="ls-nav-btn" data-lesson-slide="next" ${idx === total - 1 ? 'disabled' : ''}>&#8594;</button>
          </div>
          <div class="ls-progress-wrap"><div class="ls-progress-fill" style="width:${pct}%"></div></div>
          <div class="ls-lesson-label">${icon} ${lesson.title}</div>
        </div>
        <div class="ls-ctrl-right">
          <span class="ls-lesson-num">L${lessonNum}</span>
        </div>
      </div>
    </div>`;
}

// ── Firebase Load ─────────────────────────────────────────────
async function loadFromFirebase() {
  const db = getDB();
  if (!db) return;
  try {
    const [schedSnap, bcastSnap, iasbSnap, availSnap] = await Promise.all([
      db.collection('hm_radio').doc('station_schedule').get(),
      db.collection('hm_broadcasts').get(),
      db.collection('hm_iasb_entries').get(),
      db.collection('hm_availability').get()
    ]);
    trackUsage('reads', 1 + bcastSnap.size + iasbSnap.size + availSnap.size);
    if (schedSnap.exists) {
      const data = schedSnap.data() || {};
      const blank = () => DAYS.map(() => ({ show: '', djs: [] }));
      S.stationSchedule = {
        point: data.point || blank(),
        two:   data.two   || blank(),
      };
    }
    const broadcasts = [];
    bcastSnap.forEach(doc => broadcasts.push({ id: doc.id, ...doc.data() }));
    // One-time migration: fix old generic 'basketball' type
    const toMigrate = broadcasts.filter(b => b.type === 'basketball');
    if (toMigrate.length) {
      trackUsage('writes', toMigrate.length);
      await Promise.all(toMigrate.map(b => {
        const newType = b.id.startsWith('gb') ? 'basketball_girls' : 'basketball_boys';
        b.type = newType;
        return db.collection('hm_broadcasts').doc(b.id).update({ type: newType }).catch(() => {});
      }));
    }
    const ALL_SEED_GAMES = [...BASKETBALL_HOME_GAMES, ...FOOTBALL_HOME_GAMES, ...GIRLS_BASKETBALL_HOME_GAMES, ...SPECIAL_EVENTS];

    // Patch existing records missing gameTime (one-time migration)
    const needsGameTime = broadcasts.filter(b => {
      const seed = ALL_SEED_GAMES.find(g => g.id === b.id);
      return seed && seed.gameTime !== undefined && b.gameTime === undefined;
    });
    if (needsGameTime.length) {
      trackUsage('writes', needsGameTime.length);
      await Promise.all(needsGameTime.map(b => {
        const seed = ALL_SEED_GAMES.find(g => g.id === b.id);
        b.gameTime = seed.gameTime;
        b.notes    = seed.notes;
        return db.collection('hm_broadcasts').doc(b.id).update({ gameTime: seed.gameTime, notes: seed.notes }).catch(() => {});
      }));
    }

    if (broadcasts.length === 0 && ALL_SEED_GAMES.length) {
      trackUsage('writes', ALL_SEED_GAMES.length);
      await Promise.all(ALL_SEED_GAMES.map(g =>
        db.collection('hm_broadcasts').doc(g.id).set(g).catch(() => {})
      ));
      S.broadcasts = ALL_SEED_GAMES.map(g => ({ ...g }));
    } else {
      const existingIds = new Set(broadcasts.map(b => b.id));
      const missing = ALL_SEED_GAMES.filter(g => !existingIds.has(g.id));
      if (missing.length) {
        trackUsage('writes', missing.length);
        await Promise.all(missing.map(g =>
          db.collection('hm_broadcasts').doc(g.id).set(g).catch(() => {})
        ));
        S.broadcasts = [...broadcasts, ...missing];
      } else {
        S.broadcasts = broadcasts;
      }
    }
    const iasbEntries = [];
    iasbSnap.forEach(doc => iasbEntries.push({ id: doc.id, ...doc.data() }));
    S.iasbEntries = iasbEntries;
    const availabilities = [];
    availSnap.forEach(doc => availabilities.push({ id: doc.id, ...doc.data() }));
    S.availabilities = availabilities;
  } catch(e) {}
}

// ── Init ──────────────────────────────────────────────────────
async function init() {
  await Promise.all([loadFromFirebase(), loadCustomYbEvents(), loadYearbookCoverage(), loadCalendarYbEvents()]);
  render();
  document.addEventListener('keydown', e => {
    if (!S.lessonId) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const course = LESSONS[S.lessonCourse];
      const unit = course && course.units.find(u => u.id === S.lessonUnit);
      const lesson = unit && unit.lessons.find(l => l.id === S.lessonId);
      if (!lesson) return;
      const total = (lesson.sections || []).length + 2;
      if (S.lessonSlide < total - 1) { S.lessonSlide++; go('lessons'); }
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (S.lessonSlide > 0) { S.lessonSlide--; go('lessons'); }
    }
  });
}

document.addEventListener('DOMContentLoaded', init);

// ── IASB Hub ──────────────────────────────────────────────────
function renderIASB() {
  const entries = S.iasbEntries || [];
  const submitted = entries.filter(e => e.submittedToPortal).length;
  const days = iasbDeadlineDays();

  const divisions = ['Radio', 'News', 'Emerging Media'];
  const byDivision = {};
  IASB_CATEGORIES.forEach(cat => {
    if (!byDivision[cat.division]) byDivision[cat.division] = [];
    byDivision[cat.division].push(cat);
  });

  const catGrids = divisions.filter(d => byDivision[d]).map(div => {
    const cats = byDivision[div];
    return `
      <div class="iasb-division-label">${div} Division</div>
      <div class="iasb-cat-grid">
        ${cats.map(cat => {
          const catCount = entries.filter(e => e.code === cat.code).length;
          const full = catCount >= cat.perSchool;
          return `
            <div class="iasb-cat-card${full ? ' at-limit' : ''}" data-iasb-cat="${cat.code}" style="border-top-color:${cat.color}">
              <div class="iasb-cat-top">
                <span class="iasb-code" style="color:${cat.color}">${cat.code}</span>
                ${cat.tag ? `<span class="iasb-tag${cat.tag === 'LIVE Finals' ? ' live-tag' : ''}">${cat.tag}</span>` : ''}
              </div>
              <div class="iasb-cat-name">${cat.name}</div>
              <div class="iasb-cat-meta"><span>${cat.length}</span><span>${cat.fileFormat}</span></div>
              <div class="iasb-entry-count${full ? ' full' : ''}">${catCount} / ${cat.perSchool} ${catCount === 1 ? 'entry' : 'entries'}</div>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');

  const dropboxGrid = IASB_CATEGORIES.map(c => {
    const url = IASB_DRIVE_FOLDERS[c.code] || '#';
    return `<a href="${url}" target="_blank" class="iasb-dropbox-link" style="border-left:3px solid ${c.color}">
      <span class="iasb-dropbox-code">${c.code}</span>
      <span class="iasb-dropbox-name">${c.name}</span>
      <span class="iasb-dropbox-arrow">→</span>
    </a>`;
  }).join('');

  return `
    ${navBar('radio')}
    <div class="class-page">
      <button class="back-btn" data-nav="radio">← Back to Radio</button>
      <div class="iasb-page-header">
        <h1>IASB Competition</h1>
        <div class="iasb-season">${IASB_SEASON} Season</div>
      </div>

      <div class="iasb-banner">
        <div class="iasb-banner-deadline">
          📅 Submissions due <strong>${fmtDate(IASB_DEADLINE, false)}</strong>
          ${days > 0 ? `— <strong>${days} days away</strong>` : days === 0 ? '— <strong>TODAY</strong>' : '— <strong>Deadline passed</strong>'}
        </div>
        <div class="iasb-banner-stats">
          <span>${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} registered</span>
          <span class="iasb-stat-sep">·</span>
          <span>${submitted} submitted to portal</span>
        </div>
      </div>

      <div class="iasb-categories-section">${catGrids}</div>

      <section class="card iasb-form-card">
        <div class="card-header">
          <h2>Audio Broadcasting Dropbox 2027</h2>
          <a href="${IASB_DROPBOX_URL}" target="_blank" class="btn-sm" style="background:var(--amber);color:#000">Open in Drive →</a>
        </div>
        <p style="margin:0 0 16px;color:var(--dim);font-size:0.875rem">Click your category below to open its upload folder. Name your file: <code>YourName - EntryTitle.mp3</code></p>
        <div class="iasb-dropbox-grid">${dropboxGrid}</div>
      </section>
    </div>`;
}

function renderIASBCategory() {
  const cat = IASB_CATEGORIES.find(c => c.code === S.iasbCategory);
  if (!cat) return `${navBar('radio')}<div class="class-page"><button class="back-btn" data-nav="iasb">← Back</button><p>Category not found.</p></div>`;

  const entries = (S.iasbEntries || []).filter(e => e.code === cat.code);
  const atLimit = entries.length >= cat.perSchool;

  const entryCards = entries.length
    ? entries.map(entry => renderIASBEntryCard(cat, entry)).join('')
    : `<p class="dim" style="text-align:center;padding:24px 0">No entries registered yet for this category.</p>`;

  const catDriveUrl = IASB_DRIVE_FOLDERS[cat.code];
  const formBtn = catDriveUrl
    ? `<a href="${catDriveUrl}" target="_blank" style="display:block;text-align:center;background:${cat.color};color:#000;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:700;font-size:0.875rem;margin-bottom:12px">
        📂 Open ${cat.code} Drive Folder →
       </a>
       <p style="font-size:0.78rem;color:var(--dim);line-height:1.6;margin:0">Name your file:<br>
         <code style="background:var(--surface2);padding:2px 6px;border-radius:4px;font-size:0.75rem">YourName - Title${cat.fileFormat.split('+')[0].trim()}</code>
       </p>`
    : `<p class="dim" style="font-size:0.8rem;line-height:1.5">Drive folder not linked.</p>`;

  return `
    ${navBar('radio')}
    <div class="class-page">
      <button class="back-btn" data-nav="iasb">← Back to IASB Hub</button>

      <div class="iasb-cat-header">
        <span class="iasb-code-lg" style="color:${cat.color}">${cat.code}</span>
        <div class="iasb-cat-header-info">
          <h1>${cat.name}</h1>
          <div class="iasb-cat-header-tags">
            <span class="iasb-division-chip" style="color:${cat.color};border-color:${cat.color}40">${cat.division}</span>
            ${cat.tag ? `<span class="iasb-tag${cat.tag === 'LIVE Finals' ? ' live-tag' : ''}">${cat.tag}</span>` : ''}
            ${cat.solo ? '<span class="iasb-tag">Solo entry</span>' : ''}
            <span class="iasb-tag">${cat.perSchool} per school</span>
          </div>
        </div>
      </div>

      <div class="page-grid">
        <div class="main-col">
          <section class="card">
            <h2 style="margin-bottom:16px">Requirements</h2>
            <div class="iasb-specs">
              <div class="iasb-spec-row"><span class="spec-label">Format</span><span>${cat.format}</span></div>
              <div class="iasb-spec-row"><span class="spec-label">Length</span><span>${cat.length}</span></div>
              <div class="iasb-spec-row"><span class="spec-label">File</span><span>${cat.fileFormat}</span></div>
            </div>
            <p class="iasb-cat-desc">${cat.description}</p>
            <div class="iasb-criteria-header">Judged On</div>
            <div class="iasb-criteria-chips">
              ${cat.criteria.map(c => `<span class="iasb-criterion-chip" style="border-color:${cat.color}30;color:${cat.color}">${c}</span>`).join('')}
            </div>
          </section>

          <section class="card">
            <div class="card-header">
              <h2>Registered Entries <span class="iasb-entry-ratio">${entries.length} / ${cat.perSchool}</span></h2>
              <button class="btn-primary" id="register-iasb-entry"
                ${atLimit ? 'disabled' : ''}
                style="background:${atLimit ? 'var(--surface2)' : cat.color};color:${atLimit ? 'var(--dim)' : '#000'}">
                ${atLimit ? 'School limit reached' : '+ Register Entry'}
              </button>
            </div>
            <div class="iasb-entries-list">${entryCards}</div>
          </section>
        </div>

        <div class="side-col">
          <section class="card">
            <h2 style="margin-bottom:4px">Submission Checklist</h2>
            <p style="font-size:0.78rem;color:var(--dim);margin-bottom:14px">Applies to every entry in this category.</p>
            <div class="iasb-base-checklist">
              ${cat.checklist.map((item, i) => `
                <div class="iasb-base-check-item">
                  <span class="check-num">${i + 1}</span>
                  <span>${item}</span>
                </div>`).join('')}
            </div>
          </section>
          <section class="card">
            <h2 style="margin-bottom:12px">Submit Files</h2>
            ${formBtn}
          </section>
        </div>
      </div>
    </div>`;
}

function renderIASBEntryCard(cat, entry) {
  const checks = entry.checklist || {};
  const done = cat.checklist.filter((_, i) => checks[i]).length;
  const pct  = cat.checklist.length ? Math.round(done / cat.checklist.length * 100) : 0;

  return `
    <div class="iasb-entry-card" data-entry-id="${esc(entry.id)}">
      <div class="iasb-entry-header">
        <div class="iasb-entry-names">${esc(entry.studentName)}${entry.partnerNames ? ` · ${esc(entry.partnerNames)}` : ''}</div>
        <div class="iasb-progress-wrap">
          <div class="iasb-entry-progress-bar"><div class="iasb-progress-fill" style="width:${pct}%;background:${cat.color}"></div></div>
          <span class="iasb-entry-progress-text">${done}/${cat.checklist.length}</span>
        </div>
        ${entry.submittedToPortal ? '<span class="iasb-submitted-badge">✓ Submitted</span>' : ''}
      </div>
      <div class="iasb-entry-title">${esc(entry.entryTitle || 'Untitled')}</div>
      <div class="iasb-entry-checklist">
        ${cat.checklist.map((item, i) => S.teacherMode ? `
          <label class="iasb-check-item">
            <input type="checkbox" class="iasb-entry-check"
              data-entry-id="${esc(entry.id)}" data-idx="${i}"
              ${checks[i] ? 'checked' : ''}>
            <span class="${checks[i] ? 'iasb-check-done' : ''}">${item}</span>
          </label>` : `
          <div class="iasb-check-static ${checks[i] ? 'done' : ''}">
            <span class="iasb-check-icon">${checks[i] ? '✓' : '○'}</span>
            <span>${item}</span>
          </div>`).join('')}
      </div>
      ${entry.notes ? `<div class="iasb-entry-notes">${esc(entry.notes)}</div>` : ''}
      ${S.teacherMode ? `
        <div class="iasb-teacher-controls">
          ${!entry.submittedToPortal
            ? `<button class="btn-primary iasb-mark-submitted" data-entry-id="${esc(entry.id)}" style="background:var(--success);color:#000;font-size:0.8rem">✓ Mark Submitted to IASB</button>`
            : `<button class="btn-secondary iasb-unmark-submitted" data-entry-id="${esc(entry.id)}" style="font-size:0.8rem">Unmark Submitted</button>`}
          <button class="btn-danger iasb-delete-entry" data-entry-id="${esc(entry.id)}" style="font-size:0.8rem">Delete</button>
        </div>` : ''}
    </div>`;
}

function iasbDeadlineDays() {
  const d = new Date(IASB_DEADLINE + 'T00:00:00');
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.ceil((d - now) / 86400000);
}

// ── IASB Firebase ─────────────────────────────────────────────
async function saveIASBEntry(data) {
  const db = getDB();
  const entry = { ...data, createdAt: new Date().toISOString() };
  if (db) {
    try {
      trackUsage('writes');
      const ref = await db.collection('hm_iasb_entries').add(entry);
      S.iasbEntries.push({ id: ref.id, ...entry });
      showToast('Entry registered!');
    } catch(e) { showToast('Could not save. Try again.'); return; }
  } else {
    S.iasbEntries.push({ id: Date.now().toString(), ...entry });
  }
  render();
}

async function updateIASBCheckItem(entryId, idx, checked) {
  const entry = S.iasbEntries.find(e => e.id === entryId);
  if (!entry) return;
  if (!entry.checklist) entry.checklist = {};
  entry.checklist[idx] = checked;
  const db = getDB();
  if (db) {
    trackUsage('writes');
    const update = {};
    update[`checklist.${idx}`] = checked;
    await db.collection('hm_iasb_entries').doc(entryId).update(update).catch(() => {});
  }
  const cat = IASB_CATEGORIES.find(c => c.code === entry.code);
  if (cat) {
    const card = document.querySelector(`.iasb-entry-card[data-entry-id="${entryId}"]`);
    if (card) {
      const done = cat.checklist.filter((_, i) => (entry.checklist || {})[i]).length;
      const pct  = cat.checklist.length ? Math.round(done / cat.checklist.length * 100) : 0;
      const fill = card.querySelector('.iasb-progress-fill');
      const text = card.querySelector('.iasb-entry-progress-text');
      if (fill) fill.style.width = pct + '%';
      if (text) text.textContent = `${done}/${cat.checklist.length}`;
    }
  }
}

async function markIASBSubmitted(entryId, submitted) {
  const entry = S.iasbEntries.find(e => e.id === entryId);
  if (!entry) return;
  entry.submittedToPortal = submitted;
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_iasb_entries').doc(entryId).update({ submittedToPortal: submitted }).catch(() => {}); }
  showToast(submitted ? 'Marked as submitted!' : 'Submission mark removed.');
  render();
}

async function deleteIASBEntry(entryId) {
  S.iasbEntries = S.iasbEntries.filter(e => e.id !== entryId);
  const db = getDB();
  if (db) { trackUsage('writes'); await db.collection('hm_iasb_entries').doc(entryId).delete().catch(() => {}); }
  render();
}

// ── Teacher Dashboard ─────────────────────────────────────────
function renderDashboard() {
  if (!S.teacherMode) return `${navBar('dashboard')}<div class="class-page"><p class="dim">Teacher mode required.</p></div>`;

  const entries  = S.iasbEntries || [];
  const plans    = S.submissions || [];
  const submitted = entries.filter(e => e.submittedToPortal).length;

  // IASB section — group by category in IASB_CATEGORIES order
  const iasbSection = IASB_CATEGORIES.map(cat => {
    const catEntries = entries.filter(e => e.code === cat.code);
    if (!catEntries.length) return `
      <div class="db-cat-row empty">
        <span class="db-cat-code" style="color:${cat.color}">${cat.code}</span>
        <span class="db-cat-name dim">${cat.name}</span>
        <span class="dim" style="font-size:0.78rem">No entries</span>
      </div>`;

    return `
      <div class="db-cat-block">
        <div class="db-cat-label">
          <span class="db-cat-code" style="color:${cat.color}">${cat.code}</span>
          <span class="db-cat-name">${cat.name}</span>
          <span class="db-cat-count">${catEntries.length} / ${cat.perSchool}</span>
        </div>
        ${catEntries.map(entry => {
          const checks = entry.checklist || {};
          const done   = cat.checklist.filter((_, i) => checks[i]).length;
          const pct    = cat.checklist.length ? Math.round(done / cat.checklist.length * 100) : 0;
          return `
            <div class="db-entry-row">
              <div class="db-entry-main">
                <div class="db-entry-student">${esc(entry.studentName)}${entry.partnerNames ? ` · ${esc(entry.partnerNames)}` : ''}</div>
                <div class="db-entry-title">${esc(entry.entryTitle || 'Untitled')}</div>
                ${entry.notes ? `<div class="db-entry-notes">${esc(entry.notes)}</div>` : ''}
              </div>
              <div class="db-entry-meta">
                <div class="db-progress-wrap">
                  <div class="db-progress-bar"><div class="db-progress-fill" style="width:${pct}%;background:${cat.color}"></div></div>
                  <span class="db-progress-text">${done}/${cat.checklist.length}</span>
                </div>
                ${entry.submittedToPortal
                  ? `<span class="db-submitted-badge">✓ Submitted</span>
                     <button class="btn-secondary db-btn iasb-unmark-submitted" data-entry-id="${esc(entry.id)}" style="font-size:0.75rem">Unmark</button>`
                  : `<button class="btn-primary db-btn iasb-mark-submitted" data-entry-id="${esc(entry.id)}" style="background:var(--success);color:#000;font-size:0.75rem">Mark Submitted</button>`}
                <button class="btn-danger db-btn iasb-delete-entry" data-entry-id="${esc(entry.id)}" style="font-size:0.75rem">Delete</button>
                <button class="btn-secondary db-btn db-view-btn" data-iasb-cat="${cat.code}" style="font-size:0.75rem">View →</button>
              </div>
            </div>`;
        }).join('')}
      </div>`;
  }).join('');

  // Talk Show plans section
  const plansSection = plans.length
    ? plans.map(s => `
        <div class="db-plan-row">
          <div class="db-plan-main">
            <div class="db-entry-student">${esc(s.studentName || 'Unknown')}</div>
            <div class="db-entry-title">${esc(s.showName || 'Untitled Show')}</div>
            <div class="db-entry-notes">Partners: ${esc(s.partners || '—')} · Theme: ${esc((s.theme || {}).title || '—')}</div>
          </div>
          <div class="db-entry-meta">
            <span class="dim" style="font-size:0.75rem">${s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : ''}</span>
            <button class="btn-secondary db-btn db-plan-detail" data-sub-id="${esc(s.id)}" style="font-size:0.75rem">View Plan →</button>
          </div>
        </div>`).join('')
    : `<p class="dim" style="padding:16px 0;font-size:0.875rem">No plans submitted yet.</p>`;

  const usage = getUsage();
  const READ_LIMIT = 50000, WRITE_LIMIT = 20000;
  const readPct  = Math.min(100, Math.round(usage.reads  / READ_LIMIT  * 100));
  const writePct = Math.min(100, Math.round(usage.writes / WRITE_LIMIT * 100));
  const barColor = pct => pct >= 80 ? 'var(--error)' : pct >= 50 ? '#f59e0b' : 'var(--success)';

  return `
    ${navBar('dashboard')}
    <div class="class-page">
      <div class="db-header">
        <h1>Teacher Dashboard</h1>
        <div class="db-stats">
          <div class="db-stat"><span class="db-stat-num">${entries.length}</span><span>IASB entries</span></div>
          <div class="db-stat"><span class="db-stat-num" style="color:var(--success)">${submitted}</span><span>submitted to portal</span></div>
          <div class="db-stat"><span class="db-stat-num" style="color:var(--radio)">${plans.length}</span><span>talk show plans</span></div>
        </div>
      </div>

      <section class="card db-section" style="padding:16px 20px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <h3 style="margin:0;font-size:0.95rem">Firebase Usage <span style="font-weight:400;font-size:0.78rem;color:var(--dim)">— today, this browser</span></h3>
          <a href="https://console.firebase.google.com/project/audioaficionados-21ba0/firestore" target="_blank" style="font-size:0.78rem;color:var(--accent);text-decoration:none">Full usage ↗</a>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px">
              <span>Reads</span>
              <span style="color:${barColor(readPct)}">${usage.reads.toLocaleString()} / ${READ_LIMIT.toLocaleString()} <span class="dim">(${readPct}%)</span></span>
            </div>
            <div style="background:var(--surface2);border-radius:4px;height:8px;overflow:hidden">
              <div style="width:${readPct}%;height:100%;background:${barColor(readPct)};border-radius:4px;transition:width 0.3s"></div>
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px">
              <span>Writes</span>
              <span style="color:${barColor(writePct)}">${usage.writes.toLocaleString()} / ${WRITE_LIMIT.toLocaleString()} <span class="dim">(${writePct}%)</span></span>
            </div>
            <div style="background:var(--surface2);border-radius:4px;height:8px;overflow:hidden">
              <div style="width:${writePct}%;height:100%;background:${barColor(writePct)};border-radius:4px;transition:width 0.3s"></div>
            </div>
          </div>
        </div>
        ${readPct >= 80 || writePct >= 80 ? `<p style="margin:10px 0 0;font-size:0.8rem;color:var(--error)">⚠️ Approaching daily limit — consider upgrading to Firebase Blaze plan.</p>` : ''}
      </section>

      <section class="card db-section">
        <div class="card-header">
          <h2>IASB Competition Entries</h2>
          <button class="btn-secondary" data-nav="iasb" style="font-size:0.8rem">Open IASB Hub</button>
        </div>
        <div class="db-iasb-list">${iasbSection}</div>
      </section>

      <section class="card db-section">
        <div class="card-header">
          <h2>Talk Show Plans</h2>
          <button class="btn-secondary" id="db-refresh-plans" style="font-size:0.8rem">Refresh</button>
        </div>
        <div class="db-plans-list" id="db-plans-list">${plansSection}</div>
      </section>

      <section class="card db-section">
        <div class="card-header">
          <h2>📅 Athletics Calendar Sync</h2>
        </div>
        <p style="font-size:0.875rem;color:var(--dim);margin-bottom:14px;line-height:1.6">
          Syncs all varsity events from the HHS athletics source calendar into the HHS Media Events calendar for the current school year. Runs automatically every August 1 — use this button for a manual re-sync anytime.
        </p>
        ${SYNC_SCRIPT_URL
          ? `<button class="btn-primary" id="sync-cal-btn" style="background:var(--success);color:#000">↻ Sync Athletics Calendar Now</button>
             <span id="sync-cal-status" style="font-size:0.8rem;color:var(--dim);margin-left:12px"></span>`
          : `<div style="font-size:0.85rem;color:var(--dim);background:var(--surface2);border-radius:8px;padding:12px 14px;line-height:1.7">
               <strong style="color:var(--text)">One-time setup required:</strong><br>
               1. Open <code>Code.gs</code> from the project folder and paste it into <a href="https://script.google.com" target="_blank" style="color:var(--radio)">script.google.com</a><br>
               2. Deploy → Web app · Execute as: <em>Me</em> · Access: <em>Anyone with the link</em><br>
               3. Run <code>createAnnualTrigger()</code> once from the editor<br>
               4. Paste the web app URL into <code>data.js</code> → <code>SYNC_SCRIPT_URL</code>
             </div>`}
      </section>

      <section class="card db-section">
        <div class="card-header">
          <h2>📖 Yearbook Event Manager</h2>
          <button class="btn-primary" id="yb-add-event-btn" style="font-size:0.8rem">+ Add Event</button>
        </div>
        <div id="yb-event-form" style="display:none;padding:14px 0 18px;border-bottom:1px solid var(--border);margin-bottom:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px">
            <div class="form-group" style="margin:0">
              <label>Title</label>
              <input id="yb-new-title" type="text" placeholder="e.g. Homecoming Dance">
            </div>
            <div class="form-group" style="margin:0">
              <label>Date</label>
              <input id="yb-new-date" type="date">
            </div>
            <div class="form-group" style="margin:0">
              <label>Time <span class="hint">(optional)</span></label>
              <input id="yb-new-time" type="text" placeholder="7:00 PM">
            </div>
            <div class="form-group" style="margin:0">
              <label>Type</label>
              <select id="yb-new-type">
                ${Object.entries(EVENT_TYPES).map(([k, v]) => `<option value="${k}">${YB_ICONS[k] || '📅'} ${v.label}</option>`).join('')}
              </select>
            </div>
          </div>
          <button class="btn-primary" id="yb-save-event-btn">Save &amp; Add to Calendar</button>
          <button class="btn-secondary" id="yb-cancel-event-btn" style="margin-left:8px">Cancel</button>
        </div>
        ${(() => {
          const custom = S.customYbEvents || [];
          if (!custom.length) return `<p class="dim" style="font-size:0.875rem">No custom events added yet. Sports home games are managed in Homestead Live.</p>`;
          return custom.slice().sort((a,b) => a.date.localeCompare(b.date)).map(ev => `
            <div class="yb-db-event">
              <div class="yb-db-event-title">
                ${YB_ICONS[ev.type] || '📅'} ${esc(ev.title)}
                <span class="dim" style="font-weight:400;font-size:0.8rem;margin-left:6px">${fmtDate(ev.date, false)}${ev.time ? ' · ' + esc(ev.time) : ''}</span>
                <span style="background:var(--surface2);color:var(--dim);font-size:0.72rem;padding:2px 7px;border-radius:10px;margin-left:6px">${EVENT_TYPES[ev.type]?.label || ev.type}</span>
                ${ev.calEventId ? '<span style="font-size:0.72rem;color:var(--success);margin-left:4px">✓ calendar</span>' : ''}
              </div>
              <div style="margin-top:6px">
                <button class="btn-danger db-btn yb-delete-event-btn" data-yb-event-id="${esc(ev.id)}" style="font-size:0.75rem">Delete</button>
              </div>
            </div>`).join('');
        })()}
      </section>

      <section class="card db-section">
        <div class="card-header" style="flex-wrap:wrap;gap:8px">
          <h2>📖 Yearbook Coverage Sign-Ups</h2>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
            <button class="btn-secondary${S.ybDashView==='event'?' yb-view-active':''}" data-yb-view="event" style="font-size:0.75rem">By Event</button>
            <button class="btn-secondary${S.ybDashView==='student'?' yb-view-active':''}" data-yb-view="student" style="font-size:0.75rem">By Student</button>
            <button class="btn-secondary${S.ybDashView==='role'?' yb-view-active':''}" data-yb-view="role" style="font-size:0.75rem">By Role</button>
            <button class="btn-secondary" id="yb-dash-refresh" style="font-size:0.75rem">↻ Refresh</button>
          </div>
        </div>
        ${(() => {
          const coverage = S.yearbookCoverage || [];
          if (!coverage.length) return `<p class="dim" style="padding:16px 0;font-size:0.875rem">No sign-ups yet.</p>`;
          const badge = n => `<span style="background:var(--surface2);color:var(--dim);font-size:0.72rem;padding:2px 7px;border-radius:10px;margin-left:6px">${n}</span>`;

          if (S.ybDashView === 'student') {
            const byStudent = {};
            coverage.forEach(s => {
              const key = s.studentName.toLowerCase();
              if (!byStudent[key]) byStudent[key] = { name: s.studentName, email: s.email, events: [] };
              byStudent[key].events.push(s);
            });
            return Object.values(byStudent)
              .sort((a,b) => b.events.length - a.events.length || a.name.localeCompare(b.name))
              .map(st => `
                <div class="yb-db-event">
                  <div class="yb-db-event-title">
                    ${esc(st.name)}
                    <span class="dim" style="font-weight:400;font-size:0.78rem;margin-left:6px">${esc(st.email)}</span>
                    ${badge(st.events.length + ' event' + (st.events.length !== 1 ? 's' : ''))}
                  </div>
                  <div class="yb-db-signups">
                    ${st.events.slice().sort((a,b) => a.eventDate.localeCompare(b.eventDate)).map(ev => `
                      <div class="yb-db-row">
                        <span class="yb-db-name" style="font-weight:400">${esc(ev.eventTitle)}</span>
                        <span class="dim" style="font-size:0.75rem">${fmtDate(ev.eventDate, false)}</span>
                        <span class="yb-my-role yb-role-${ev.role}">${roleLabel(ev.role)}</span>
                      </div>`).join('')}
                  </div>
                </div>`).join('');
          }

          if (S.ybDashView === 'role') {
            const groups = { photographer: [] };
            coverage.forEach(s => { if (groups[s.role]) groups[s.role].push(s); });
            const labels = { photographer: '📷 Photographers' };
            return Object.entries(groups).filter(([,arr]) => arr.length).map(([role, entries]) => `
              <div class="yb-db-event">
                <div class="yb-db-event-title">
                  ${labels[role]}
                  ${badge(entries.length)}
                </div>
                <div class="yb-db-signups">
                  ${entries.slice().sort((a,b) => a.eventDate.localeCompare(b.eventDate)).map(e => `
                    <div class="yb-db-row">
                      <span class="yb-db-name">${esc(e.studentName)}</span>
                      <span class="dim" style="font-weight:400;font-size:0.8rem;flex:1">${esc(e.eventTitle)}</span>
                      <span class="dim" style="font-size:0.75rem">${fmtDate(e.eventDate, false)}</span>
                    </div>`).join('')}
                </div>
              </div>`).join('');
          }

          // Default: By Event
          const byEvent = {};
          coverage.forEach(s => {
            if (!byEvent[s.eventId]) byEvent[s.eventId] = { title: s.eventTitle, date: s.eventDate, signups: [] };
            byEvent[s.eventId].signups.push(s);
          });
          return Object.values(byEvent).sort((a,b) => a.date.localeCompare(b.date)).map(ev => `
            <div class="yb-db-event">
              <div class="yb-db-event-title">
                ${esc(ev.title)}
                <span class="dim" style="font-weight:400;font-size:0.8rem;margin-left:4px">${fmtDate(ev.date, false)}</span>
                ${badge(ev.signups.length)}
              </div>
              <div class="yb-db-signups">
                ${ev.signups.map(s => `
                  <div class="yb-db-row">
                    <span class="yb-db-name">${esc(s.studentName)}</span>
                    <span class="yb-my-role yb-role-${s.role}">${roleLabel(s.role)}</span>
                    <span class="dim" style="font-size:0.75rem">${s.email}</span>
                  </div>`).join('')}
              </div>
            </div>`).join('');
        })()}
      </section>
    </div>`;
}

async function dashboardLoadPlans() {
  const db = getDB();
  if (!db) return;
  try {
    const snap = await db.collection('hm_radio_plans').get();
    const subs = [];
    snap.forEach(doc => subs.push({ id: doc.id, ...doc.data() }));
    S.submissions = subs;
    render();
  } catch(e) { showToast('Could not load plans.'); }
}

// ── IASB Register Modal ───────────────────────────────────────
function showRegisterIASBModal(cat) {
  const m = modal(`
    <h2>Register Entry — ${cat.code} ${cat.name}</h2>
    <div class="form-group">
      <label>Your Name <span style="color:var(--danger)">*</span></label>
      <input id="iasb-student-name" type="text" placeholder="First and last name">
    </div>
    ${!cat.solo ? `
    <div class="form-group">
      <label>Partner Name(s) <span class="hint">(optional — comma separated)</span></label>
      <input id="iasb-partner-names" type="text" placeholder="Other DJs or collaborators">
    </div>` : ''}
    <div class="form-group">
      <label>Entry Title <span style="color:var(--danger)">*</span></label>
      <input id="iasb-entry-title" type="text" placeholder="What is this entry called?">
    </div>
    <div class="form-group">
      <label>Notes <span class="hint">(optional)</span></label>
      <textarea id="iasb-entry-notes" rows="2" placeholder="Anything to note about this entry"></textarea>
    </div>`);

  m.querySelector('#modal-save').addEventListener('click', () => {
    const name  = val('iasb-student-name');
    const title = val('iasb-entry-title');
    if (!name || !title) { showToast('Please enter your name and an entry title.'); return; }
    const data = {
      code: cat.code,
      season: IASB_SEASON,
      studentName: name,
      partnerNames: val('iasb-partner-names'),
      entryTitle: title,
      notes: val('iasb-entry-notes'),
      checklist: {},
      submittedToPortal: false,
    };
    m.remove();
    saveIASBEntry(data);
  });
}
