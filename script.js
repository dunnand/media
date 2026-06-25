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
const S = {
  view: 'home',
  broadcastId: null,
  teacherMode: false,
  schedule: { weekOf: '', shows: [] },
  broadcasts: [],
  plannerStep: 0,
  plannerData: null,
  submissions: [],
  iasbEntries: [],
  iasbCategory: null,
};

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
function renderRadio() {
  const shows = S.schedule.shows || [];
  const weekOf = S.schedule.weekOf || '';

  const slotRows = [];
  for (let i = 0; i < RADIO_SLOTS; i++) {
    const show = shows[i] || null;
    slotRows.push(show ? `
      <div class="show-slot filled">
        <div class="slot-num">${i + 1}</div>
        <div class="show-info">
          <div class="show-title">${esc(show.title || 'Untitled Show')}</div>
          <div class="show-djs">${esc((show.djs || []).join(', ') || 'TBD')}</div>
        </div>
        ${show.airTime ? `<div class="show-time">${esc(show.airTime)}</div>` : ''}
        ${S.teacherMode ? `<button class="slot-edit-btn" data-slot="${i}">Edit</button>` : ''}
      </div>` : `
      <div class="show-slot empty">
        <div class="slot-num">${i + 1}</div>
        <div class="show-info"><div class="show-title dim">Open Slot</div></div>
        ${S.teacherMode ? `<button class="slot-edit-btn" data-slot="${i}">+ Add Show</button>` : ''}
      </div>`);
  }

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
          <section class="card">
            <div class="card-header">
              <h2>This Week's Shows</h2>
              <div style="display:flex;gap:8px;align-items:center">
                ${weekOf ? `<span class="week-label">Week of ${weekOf}</span>` : ''}
                ${S.teacherMode ? `<button class="btn-primary" id="set-week-btn">Set Week</button>` : ''}
              </div>
            </div>
            <div class="schedule-list">${slotRows.join('')}</div>
          </section>
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
  const stepLabels = ['Your Info', 'Theme', 'Break 1', 'Break 2', 'Break 3', 'Review'];
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
        <h2>Part 1 — Your Theme</h2>
        <p>Every great talk show has a clear theme that ties everything together.</p>
        <div class="form-group">
          <label>Theme Title / Name</label>
          <input id="p-theme-title" type="text" value="${esc((p.theme || {}).title || '')}" placeholder="e.g. This or That, School Spotlight, Pop Culture Weekly">
        </div>
        <div class="form-group">
          <label>Theme Description <span class="hint">(2–3 sentences)</span></label>
          <textarea id="p-theme-desc" rows="4" placeholder="Describe what your show is about and why your theme fits your audience.">${esc((p.theme || {}).description || '')}</textarea>
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
            <div class="review-label">Theme</div>
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

  const countdownBlock = next ? (() => {
    const et = EVENT_TYPES[next.type] || EVENT_TYPES.other;
    const days = Math.ceil((new Date(next.date + 'T00:00:00') - now) / 86400000);
    return `
      <section class="card next-broadcast-card">
        <div class="next-label">Next Broadcast</div>
        <div class="next-event-type" style="color:${et.color}">${et.label}</div>
        <div class="next-event-name">${esc(next.title)}</div>
        <div class="next-date">${fmtDate(next.date, true)}</div>
        <div class="countdown">${days <= 0 ? 'TODAY' : days === 1 ? '1 day away' : days + ' days away'}</div>
        <button class="btn-primary" data-broadcast="${next.id}" style="background:var(--live);color:#000">
          View Broadcast Prep →
        </button>
      </section>`;
  })() : `
    <section class="card" style="text-align:center;padding:32px">
      <p class="dim" style="margin-bottom:16px">No upcoming broadcasts scheduled.</p>
      ${S.teacherMode ? '<button class="btn-primary" id="add-broadcast">+ Add Broadcast</button>' : ''}
    </section>`;

  const broadcastItems = upcoming.map(b => {
    const et = EVENT_TYPES[b.type] || EVENT_TYPES.other;
    return `
      <div class="broadcast-item" data-broadcast="${b.id}">
        <div class="broadcast-type-dot" style="background:${et.color}"></div>
        <div class="broadcast-info">
          <div class="broadcast-title">${esc(b.title)}</div>
          <div class="broadcast-date">${fmtDate(b.date)}</div>
        </div>
        <div class="broadcast-tag" style="color:${et.color}">${et.label}</div>
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
              <h2>Upcoming Broadcasts</h2>
              ${S.teacherMode ? `<button class="btn-primary" id="add-broadcast">+ Add</button>` : ''}
            </div>
            <div class="broadcast-list">${broadcastItems}</div>
          </section>
        </div>
        <div class="side-col">
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

  return `
    ${navBar('live')}
    <div class="class-page">
      <button class="back-btn" data-nav="live">← Back to Homestead Live</button>
      <div class="broadcast-detail-header">
        <div class="broadcast-type-badge" style="background:${et.color}">${et.label}</div>
        <h1>${esc(b.title)}</h1>
        <div class="broadcast-detail-date">${fmtDate(b.date, true)}</div>
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
  showToast('Plan submitted! ✓');
  S.plannerData = null;
  S.plannerStep = 0;
  go('radio');
}

// ── Teacher: Schedule ─────────────────────────────────────────
function showSetWeekModal() {
  const m = modal(`
    <h2>Set Week</h2>
    <div class="form-group">
      <label>Week of</label>
      <input type="date" id="m-week" value="${S.schedule.weekOf || ''}">
    </div>`);
  m.querySelector('#modal-save').addEventListener('click', async () => {
    S.schedule.weekOf = val('m-week');
    const db = getDB();
    if (db) await db.collection('hm_radio').doc('schedule').set(S.schedule).catch(() => {});
    m.remove(); render();
  });
}

function showEditSlotModal(idx) {
  const show = (S.schedule.shows || [])[idx] || {};
  const m = modal(`
    <h2>Show Slot ${idx + 1}</h2>
    <div class="form-group">
      <label>Show Name</label>
      <input id="m-title" type="text" value="${esc(show.title || '')}" placeholder="e.g. Morning Vibes">
    </div>
    <div class="form-group">
      <label>DJs <span class="hint">(comma separated)</span></label>
      <input id="m-djs" type="text" value="${esc((show.djs || []).join(', '))}" placeholder="Alex, Jordan">
    </div>
    <div class="form-group">
      <label>Air Time</label>
      <input id="m-time" type="text" value="${esc(show.airTime || '')}" placeholder="e.g. 8:00 AM">
    </div>`, show.title ? 'Clear Slot' : null);
  m.querySelector('#modal-save').addEventListener('click', async () => {
    if (!S.schedule.shows) S.schedule.shows = [];
    S.schedule.shows[idx] = { title: val('m-title'), djs: val('m-djs').split(',').map(s => s.trim()).filter(Boolean), airTime: val('m-time') };
    const db = getDB();
    if (db) await db.collection('hm_radio').doc('schedule').set(S.schedule).catch(() => {});
    m.remove(); render();
  });
  const clearBtn = m.querySelector('#modal-extra');
  if (clearBtn) clearBtn.addEventListener('click', async () => {
    if (!S.schedule.shows) S.schedule.shows = [];
    S.schedule.shows[idx] = null;
    const db = getDB();
    if (db) await db.collection('hm_radio').doc('schedule').set(S.schedule).catch(() => {});
    m.remove(); render();
  });
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

  const sw = document.getElementById('set-week-btn');
  if (sw) sw.addEventListener('click', showSetWeekModal);

  const vs = document.getElementById('view-submissions');
  if (vs) vs.addEventListener('click', showSubmissions);

  document.querySelectorAll('.slot-edit-btn').forEach(btn =>
    btn.addEventListener('click', () => showEditSlotModal(parseInt(btn.dataset.slot))));

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
    const [schedSnap, bcastSnap, iasbSnap] = await Promise.all([
      db.collection('hm_radio').doc('schedule').get(),
      db.collection('hm_broadcasts').get(),
      db.collection('hm_iasb_entries').get()
    ]);
    if (schedSnap.exists) S.schedule = schedSnap.data() || { shows: [] };
    const broadcasts = [];
    bcastSnap.forEach(doc => broadcasts.push({ id: doc.id, ...doc.data() }));
    S.broadcasts = broadcasts;
    const iasbEntries = [];
    iasbSnap.forEach(doc => iasbEntries.push({ id: doc.id, ...doc.data() }));
    S.iasbEntries = iasbEntries;
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

  const formSection = IASB_FORM_URL
    ? `<iframe src="${IASB_FORM_URL}" class="iasb-form-iframe" frameborder="0"></iframe>`
    : `
      <div class="iasb-form-instructions">
        <div class="iasb-form-icon">📎</div>
        <h3>Set Up File Submission</h3>
        <p>Create a Google Form so students can upload audio files directly to your Drive, then paste the embed URL into <code>IASB_FORM_URL</code> in <code>data.js</code>.</p>
        <div class="iasb-form-steps">
          <div class="iasb-form-step"><span>1</span><span>Go to forms.google.com and create a new form titled "IASB Competition File Submission"</span></div>
          <div class="iasb-form-step"><span>2</span><span>Add fields: Student Name(s), IASB Category (dropdown), Entry Title, File Upload (.mp3/.pdf), Cover Art for Podcasts (.jpg, not required), Notes</span></div>
          <div class="iasb-form-step"><span>3</span><span>Click Send → Embed tab → copy the URL from inside <code>src="…"</code></span></div>
          <div class="iasb-form-step"><span>4</span><span>Paste it as the value of <code>IASB_FORM_URL</code> in <code>data.js</code></span></div>
        </div>
      </div>`;

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
        <div class="card-header"><h2>Submit Files to Google Drive</h2></div>
        ${formSection}
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

  const formBtn = IASB_FORM_URL
    ? `<a href="${IASB_FORM_URL}" target="_blank" class="btn-primary" style="display:block;text-align:center;background:${cat.color};color:#000;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600;font-size:0.875rem">Open Submission Form →</a>`
    : `<p class="dim" style="font-size:0.8rem;line-height:1.5">Google Form not set up yet. See the IASB Hub for setup instructions.</p>`;

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
