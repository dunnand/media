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
};

// ── Crew Call Helper ─────────────────────────────────────────
function computeCrewCall(gameTime, type) {
  if (!gameTime) return null;
  const m = gameTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1]);
  const min = parseInt(m[2]);
  const isPM = m[3].toUpperCase() === 'PM';
  if (isPM && h !== 12) h += 12;
  if (!isPM && h === 12) h = 0;
  const offset = CREW_CALL_MINS[type] ?? CREW_CALL_DEFAULT_MINS;
  let total = h * 60 + min - offset;
  if (total < 0) total += 1440;
  const ch = Math.floor(total / 60);
  const cm = total % 60;
  const period = ch >= 12 ? 'PM' : 'AM';
  const dh = ch > 12 ? ch - 12 : ch === 0 ? 12 : ch;
  return `${dh}:${cm.toString().padStart(2, '0')} ${period}`;
}

// ── Router ────────────────────────────────────────────────────
function go(view, extra) {
  S.view = view;
  if (extra) Object.assign(S, extra);
  render();
  window.scrollTo(0, 0);
  if (view === 'dashboard') dashboardLoadPlans();
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
    case 'iasb':          app.innerHTML = renderIASB();          break;
    case 'iasb-category': app.innerHTML = renderIASBCategory();  break;
    case 'dashboard':     app.innerHTML = renderDashboard();     break;
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
        <a class="${active === 'yearbook'   ? 'active' : ''}" data-nav="yearbook">📖 Yearbook</a>
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
        <div class="home-logo">Homestead Media</div>
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

  const resources = RADIO_RESOURCES.map(r => `
    <div class="resource-card">
      <div class="resource-title">${r.title}</div>
      <div class="resource-body">${r.body}</div>
    </div>`).join('');

  return `
    ${navBar('radio')}
    <div class="class-page">
      <div class="class-header">
        <div class="class-header-icon">📻</div>
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
          <section class="card">
            <h2>Resources</h2>
            ${resources}
          </section>
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
          <span class="next-gametime">Game ${esc(next.gameTime)}</span>
          <span style="color:var(--border)">·</span>
          <span class="next-crewcall">Crew call ${computeCrewCall(next.gameTime, next.type)}</span>
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
            <div class="broadcast-date">${fmtDate(b.date)}${b.gameTime ? ' · ' + esc(b.gameTime) : ''}</div>
            ${b.gameTime ? `<div class="broadcast-crewcall">Crew call ${computeCrewCall(b.gameTime, b.type)}</div>` : ''}
          </div>
          <div class="broadcast-tag" style="color:${et.color}">${et.label}</div>
        </div>
        <div class="broadcast-crew">
          ${crewGrid(b.roles || {})}
        </div>
      </div>`;
  }).join('') || '<p class="dim">None scheduled yet.</p>';

  const resources = LIVE_RESOURCES.map(r => `
    <div class="resource-card">
      <div class="resource-title">${r.title}</div>
      <div class="resource-body">${r.body}</div>
    </div>`).join('');

  return `
    ${navBar('live')}
    <div class="class-page">
      <div class="class-header">
        <div class="class-header-icon">🎬</div>
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
          <section class="card">
            <h2>Resources</h2>
            ${resources}
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
  const crewCall  = computeCrewCall(b.gameTime, b.type);

  const reminderMailto = (() => {
    if (!withEmails.length) return null;
    const isBasketball = b.type === 'basketball_boys' || b.type === 'basketball_girls';
    const offsetMins   = CREW_CALL_MINS[b.type] ?? CREW_CALL_DEFAULT_MINS;
    const subject = `Tomorrow — ${b.title}`;
    const body = [
      `Hi,`,
      ``,
      `Reminder: you are signed up to crew the following broadcast TOMORROW.`,
      ``,
      `Event:     ${b.title}`,
      `Date:      ${fmtDate(b.date, true)}`,
      b.gameTime ? `Game Time: ${b.gameTime}` : null,
      crewCall   ? `Crew Call: ${crewCall}  ← BE HERE` : null,
      b.notes && b.notes !== 'TBD — time to be announced' ? `Location:  ${b.notes}` : null,
      ``,
      crewCall ? `Arrive at ${crewCall}. Eat in the classroom first (${offsetMins} min before ${isBasketball ? 'tip-off' : 'kickoff'}), then setup.` : null,
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

  const crewCall = computeCrewCall(b.gameTime, b.type);
  const isBasketball = b.type === 'basketball_boys' || b.type === 'basketball_girls';
  const offsetMins = CREW_CALL_MINS[b.type] ?? CREW_CALL_DEFAULT_MINS;

  return `
    ${navBar('live')}
    <div class="class-page">
      <button class="back-btn" data-nav="live">← Back to Homestead Live</button>
      <div class="broadcast-detail-header">
        <div class="broadcast-type-badge" style="background:${et.color}">${et.label}</div>
        <h1>${esc(b.title)}</h1>
        <div class="broadcast-detail-date">${fmtDate(b.date, true)}</div>
        ${crewCall ? `
        <div class="crew-call-banner">
          <div class="crew-call-block">
            <div class="crew-call-time-val">${crewCall}</div>
            <div class="crew-call-time-label">Crew Call</div>
          </div>
          <div class="crew-call-divider"></div>
          <div class="crew-call-block">
            <div class="crew-call-time-val">${esc(b.gameTime)}</div>
            <div class="crew-call-time-label">Game Time</div>
          </div>
          <div class="crew-call-rule">
            ${offsetMins} min early — eat in classroom, then setup
            ${isBasketball ? '<span class="crew-call-tag">Basketball</span>' : ''}
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
            <span class="sched-gametime">Game ${esc(b.gameTime)}</span>
            <span class="sched-sep">·</span>
            <span class="sched-crewcall">Crew call ${computeCrewCall(b.gameTime, b.type)}</span>
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
      <label>Notes</label>
      <input id="m-notes" type="text" value="${esc(b.notes || '')}" placeholder="Time, location, etc.">
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
    const title = val('m-title');
    const date  = val('m-date');
    const type  = val('m-type');
    const notes = val('m-notes');
    if (!title || !date) { showToast('Title and date are required.'); return; }
    const newRoles = {};
    m.querySelectorAll('.role-input').forEach(el => { newRoles[el.dataset.role] = el.value.trim(); });
    Object.assign(b, { title, date, type, notes, roles: newRoles });
    const db = getDB();
    if (db) await db.collection('hm_broadcasts').doc(b.id).update({ title, date, type, notes, roles: newRoles }).catch(() => {});
    m.remove(); render(); showToast('Saved!');
  });

  m.querySelector('#modal-extra').addEventListener('click', async () => {
    if (!confirm(`Delete "${b.title}"?`)) return;
    const db = getDB();
    if (db) await db.collection('hm_broadcasts').doc(b.id).delete().catch(() => {});
    S.broadcasts = S.broadcasts.filter(x => x.id !== b.id);
    m.remove(); render(); showToast('Deleted.');
  });
}

// ── YEARBOOK ──────────────────────────────────────────────────
function renderYearbook() {
  const resources = YEARBOOK_RESOURCES.map(r => `
    <div class="resource-card">
      <div class="resource-title">${r.title}</div>
      <div class="resource-body">${r.body}</div>
    </div>`).join('');

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
          <section class="card coming-soon-card">
            <div class="coming-soon-icon">🚧</div>
            <h2>Coming Soon</h2>
            <p>The Yearbook section is being built out. Check back soon for section assignments, deadlines, and design resources.</p>
          </section>
        </div>
        <div class="side-col">
          <section class="card">
            <h2>Resources</h2>
            ${resources}
          </section>
        </div>
      </div>
    </div>`;
}

// ── BROADCAST SIGN-UP (Student) ───────────────────────────────
function renderAvailabilityPage() {
  const myName = localStorage.getItem('hm_student_name') || '';
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
          <span class="avail-gametime-chip">Game ${esc(b.gameTime)}</span>
          <span class="avail-crewcall-chip">Crew call ${computeCrewCall(b.gameTime, b.type)}</span>
        </div>` : ''}

        <label class="avail-available-toggle ${!myName ? 'avail-disabled' : ''}">
          <input type="checkbox" class="avail-broadcast-cb"
            data-bid="${b.id}"
            ${isAvailable ? 'checked' : ''}
            ${!myName ? 'disabled' : ''}>
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
            <label class="avail-name-label">Your Name</label>
            <div class="avail-name-row">
              <input id="avail-page-name" type="text" class="avail-name-input"
                placeholder="First and last name" value="${esc(myName)}">
              ${myName
                ? `<span class="avail-name-saved">✓ Saved</span>`
                : `<span class="dim" style="font-size:0.8rem">Enter your name to enable sign-ups</span>`}
            </div>
          </div>
          <div class="avail-name-field">
            <label class="avail-name-label">Email Address <span style="font-weight:400;color:var(--dim)">(for broadcast reminders)</span></label>
            <div class="avail-name-row">
              <input id="avail-page-email" type="email" class="avail-name-input"
                placeholder="your@email.com" value="${esc(localStorage.getItem('hm_student_email') || '')}">
              ${localStorage.getItem('hm_student_email')
                ? `<span class="avail-name-saved">✓ Saved</span>`
                : `<span class="dim" style="font-size:0.8rem">Receive day-before reminders</span>`}
            </div>
          </div>
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
    try { await db.collection('hm_radio_plans').add(submission); }
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
    if (db) await db.collection('hm_radio').doc('station_schedule').set(S.stationSchedule).catch(() => {});
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
      <label>Type</label>
      <select id="m-type">
        ${Object.entries(EVENT_TYPES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('')}
      </select>
    </div>`);
  m.querySelector('#modal-save').addEventListener('click', async () => {
    const title = val('m-title');
    const date  = val('m-date');
    const type  = val('m-type');
    if (!title || !date) { showToast('Please fill in all fields.'); return; }
    const db = getDB();
    const doc = { title, date, type, roles: {}, checks: {} };
    if (db) {
      try { const ref = await db.collection('hm_broadcasts').add(doc); doc.id = ref.id; } catch(e) {}
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
  if (db) await db.collection('hm_broadcasts').doc(b.id).update({ roles }).catch(() => {});
  showToast('Roles saved!');
  render();
}

async function saveBroadcastNotes() {
  const b = (S.broadcasts || []).find(x => x.id === S.broadcastId);
  if (!b) return;
  b.notes = val('broadcast-notes');
  const db = getDB();
  if (db) await db.collection('hm_broadcasts').doc(b.id).update({ notes: b.notes }).catch(() => {});
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
  if (db) await db.collection('hm_broadcasts').doc(b.id).update({ checks }).catch(() => {});
}

// ── Availability ──────────────────────────────────────────────
async function toggleBroadcastAvailability(broadcastId, available) {
  const myName = localStorage.getItem('hm_student_name') || '';
  if (!myName) { showToast('Enter your name first.'); return; }

  const existing = (S.availabilities || []).find(
    a => a.broadcastId === broadcastId && a.studentName.toLowerCase() === myName.toLowerCase()
  );

  if (available && !existing) {
    const myEmail = localStorage.getItem('hm_student_email') || '';
    const entry = { broadcastId, studentName: myName, email: myEmail, interestedRoles: [], submittedAt: new Date().toISOString() };
    const db = getDB();
    if (db) {
      try {
        const ref = await db.collection('hm_availability').add(entry);
        S.availabilities.push({ id: ref.id, ...entry });
      } catch(e) { showToast('Could not save. Try again.'); return; }
    } else {
      S.availabilities.push({ id: Date.now().toString(), ...entry });
    }
  } else if (!available && existing) {
    S.availabilities = S.availabilities.filter(a => a.id !== existing.id);
    const db = getDB();
    if (db) await db.collection('hm_availability').doc(existing.id).delete().catch(() => {});
  }
  render();
}

async function toggleAvailabilityRole(broadcastId, role, checked) {
  const myName = localStorage.getItem('hm_student_name') || '';
  if (!myName) { showToast('Enter your name first.'); return; }

  const existing = (S.availabilities || []).find(
    a => a.broadcastId === broadcastId && a.studentName.toLowerCase() === myName.toLowerCase()
  );
  const db = getDB();

  if (existing) {
    const roles = existing.interestedRoles || [];
    existing.interestedRoles = checked
      ? [...new Set([...roles, role])]
      : roles.filter(r => r !== role);
    if (db) await db.collection('hm_availability').doc(existing.id)
      .update({ interestedRoles: existing.interestedRoles }).catch(() => {});
  } else {
    const myEmail = localStorage.getItem('hm_student_email') || '';
    const entry = { broadcastId, studentName: myName, email: myEmail, interestedRoles: checked ? [role] : [], submittedAt: new Date().toISOString() };
    if (db) {
      try {
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
  if (db) await db.collection('hm_availability').doc(availId).delete().catch(() => {});
  render();
}

// ── Teacher: Submissions ──────────────────────────────────────
async function showSubmissions() {
  const db = getDB();
  let subs = [];
  if (db) {
    try {
      const snap = await db.collection('hm_radio_plans').get();
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
    el.addEventListener('click', () => go(el.dataset.nav)));

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
      await Promise.all(needsGameTime.map(b => {
        const seed = ALL_SEED_GAMES.find(g => g.id === b.id);
        b.gameTime = seed.gameTime;
        b.notes    = seed.notes;
        return db.collection('hm_broadcasts').doc(b.id).update({ gameTime: seed.gameTime, notes: seed.notes }).catch(() => {});
      }));
    }

    if (broadcasts.length === 0 && ALL_SEED_GAMES.length) {
      await Promise.all(ALL_SEED_GAMES.map(g =>
        db.collection('hm_broadcasts').doc(g.id).set(g).catch(() => {})
      ));
      S.broadcasts = ALL_SEED_GAMES.map(g => ({ ...g }));
    } else {
      const existingIds = new Set(broadcasts.map(b => b.id));
      const missing = ALL_SEED_GAMES.filter(g => !existingIds.has(g.id));
      if (missing.length) {
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
  await loadFromFirebase();
  render();
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
  if (db) await db.collection('hm_iasb_entries').doc(entryId).update({ submittedToPortal: submitted }).catch(() => {});
  showToast(submitted ? 'Marked as submitted!' : 'Submission mark removed.');
  render();
}

async function deleteIASBEntry(entryId) {
  S.iasbEntries = S.iasbEntries.filter(e => e.id !== entryId);
  const db = getDB();
  if (db) await db.collection('hm_iasb_entries').doc(entryId).delete().catch(() => {});
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
