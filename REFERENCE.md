# Homestead Media — Full Project Reference

---

## What This Is

A student-facing website for Homestead High School's Audio Broadcasting program. It serves as a hub for the radio class — broadcast scheduling, student sign-ups, lesson content, and IASB competition entries. It lives at:

- **Local:** `C:\Users\Andy\homestead_media\`
- **GitHub:** `github.com/dunnand/homestead_media`
- **Live site:** `dunnand.github.io/homestead_media/`

---

## Tech Stack

- **Pure HTML, CSS, JavaScript** — no frameworks, no build process. Open the files and they work.
- **Firebase Firestore** — cloud database for broadcasts, student sign-ups, IASB entries, and station schedule. Project ID: `audioaficionados-21ba0`. Uses the compat SDK v10.12.2 loaded from Google's CDN.
- **GitHub Actions** — automated daily email reminders sent to students signed up for broadcasts the next day. Uses Nodemailer + Gmail App Password. Workflow file at `.github/workflows/send-reminders.yml`, script at `scripts/send-reminders.js`.
- **No login system** — teacher access is gated by a PIN: `2027`

---

## File Structure

```
homestead_media/
├── index.html          ← Single HTML page. All three script/CSS files load here.
├── styles.css          ← All styling
├── script.js           ← All JavaScript — SPA logic, rendering, listeners
├── data.js             ← All data — broadcasts, LESSONS content, seed games
├── images/             ← All lesson images (see full list below)
├── scripts/
│   └── send-reminders.js   ← Node.js script run by GitHub Actions
└── .github/
    └── workflows/
        └── send-reminders.yml  ← Daily cron job definition
```

Cache busting: all three files in index.html load with `?v=YYYYMMDD`. Update this date whenever you push changes or the browser will serve old cached files.

---

## How the App Works

This is a **Single Page Application (SPA)**. There is no routing — one HTML file, JavaScript swaps the content.

### State Object (`S`)
Everything lives in one object at the top of `script.js`:
```javascript
const S = {
  view: 'home',
  broadcastId: null,
  teacherMode: false,
  lessonCourse: null,   // 'radio', 'live', 'yearbook'
  lessonUnit: null,     // unit id e.g. 'u1'
  lessonId: null,       // lesson id e.g. 'welcome'
  lessonSlide: 0,       // current slide index within a lesson
  // ...plus Firebase data arrays
};
```

### Navigation
Call `go('viewname')` from anywhere to navigate. It updates `S.view` and calls `render()`.

### Render Cycle
```
go(view) → S.view = view → render() → app.innerHTML = [html] → attachListeners()
```
`render()` is a switch statement — one `case` per view. After every render, `attachListeners()` re-wires all click handlers because the DOM was replaced.

### Data Attributes for Navigation
- `data-nav="viewname"` — navigate to a top-level view
- `data-lesson-course="radio"` — open a lesson course (optionally with `data-lesson-unit` and `data-lesson-id`)
- `data-lesson-back="hub"` or `"course"` — navigate back within lessons
- `data-lesson-slide="prev"` or `"next"` — move between lesson slides

---

## Views (Pages)

| View | What it is |
|---|---|
| `home` | Landing page with hero section |
| `schedule` | Radio station DJ schedule (The Point + 2.0) — editable by teacher |
| `games` | Broadcast game schedule — basketball, football etc. |
| `signup` | Students enter name + email to sign up for a broadcast crew |
| `teacher` | Teacher admin panel — PIN `2027` — manage broadcasts, view sign-ups |
| `iasb` | IASB competition entry form |
| `lessons` | Full lesson system (described in detail below) |

---

## Firebase Collections

| Collection | What's stored |
|---|---|
| `hm_broadcasts` | Each broadcast event (title, date, time, type, notes) |
| `hm_availability` | Student sign-ups (name, email, broadcastId) |
| `hm_iasb_entries` | IASB competition submissions |
| `hm_radio` / `station_schedule` | The weekly DJ schedule for both stations |

Firebase is loaded from CDN — no npm, no build step. If the database ever needs to be accessed directly, go to `console.firebase.google.com`, project `audioaficionados-21ba0`.

---

## GitHub Actions — Email Reminders

Every day at a set time, a Node.js script runs on GitHub's servers. It:
1. Checks Firestore for any broadcasts scheduled for tomorrow
2. Finds all students signed up for those broadcasts
3. Sends each student a reminder email with their call time, Door 33 time, and location

**Secrets required in GitHub repo settings:**
- `FIREBASE_SERVICE_ACCOUNT` — JSON key for a Firebase service account
- `FROM_EMAIL` — Gmail address emails send from
- `GMAIL_APP_PASSWORD` — Gmail App Password (not the regular password)

---

## The Lesson System

### How It's Organized

Lesson content lives entirely in `data.js` inside the `LESSONS` constant. Three courses exist:

```
LESSONS
├── radio    (Radio Broadcasting — fully built)
├── live     (Homestead Live — empty, shows "Coming Soon")
└── yearbook (Yearbook — empty, shows "Coming Soon")
```

### Navigation Flow
```
Lessons Hub (pick a course)
  → Course Page (list of units and lessons)
    → Lesson Slideshow (one section per slide)
```

Each lesson is a slideshow. The slides are:
1. **Title slide** — big icon, lesson name, duration, summary, "Press → to begin"
2. **One slide per section** — each section in the lesson's `sections[]` array
3. **End slide** — "Lesson Complete!" + link to next lesson or "Unit Complete!"

Keyboard arrows (← →) navigate slides. Progress bar at bottom tracks position.

### Adding or Editing a Lesson

Open `data.js`. Find the `LESSONS` constant. All lesson content is here as JavaScript objects. Structure:

```javascript
{
  id: 'lesson-id',
  title: 'Lesson Title',
  duration: '1 class',
  summary: 'One sentence summary shown in course list and title slide.',
  sections: [
    // One object per slide
  ]
}
```

### Section Types

Every section becomes one slide. These are the available types:

**`intro`** — Opening statement with lightbulb icon
```javascript
{ type: 'intro', content: 'Text here.' }
```

**`callout`** — Colored box, tip (teal) or warning (amber)
```javascript
{ type: 'callout', label: 'Label', items: ['item 1', 'item 2'] }
{ type: 'callout', label: 'Label', warning: true, content: 'Single paragraph warning.' }
```

**`keyterms`** — Two-column term/definition table
```javascript
{ type: 'keyterms', title: 'Section Title', terms: [
  { term: 'Term', def: 'Definition' }
]}
```

**`list`** — Bulleted list
```javascript
{ type: 'list', title: 'Title', items: ['item 1', 'item 2'] }
```

**`text`** — Paragraph block
```javascript
{ type: 'text', title: 'Title', content: 'Paragraph text. HTML tags work here.' }
```

**`video`** — Embedded YouTube video
```javascript
{ type: 'video', youtube: 'VIDEO_ID_HERE', label: 'Video Title', note: 'Context note.' }
```

**`gallery`** — 2x2 image grid
```javascript
{ type: 'gallery', label: 'Gallery Title', images: [
  { src: 'images/filename.png', alt: 'Caption' }
]}
```

### Adding a Side Image to Any Section

Any section type can show an image alongside it by adding:
```javascript
{ type: 'text', title: '...', content: '...',
  sideImg: 'images/filename.png',
  sideImgCap: 'Caption text under the image.' }
```
This creates a two-column layout: content left, image right.

### Adding a New Lesson

1. Open `data.js`
2. Find the unit you want to add it to (e.g. `id: 'u2'`)
3. Add a new object to that unit's `lessons: []` array
4. Add the lesson icon to `LESSON_ICONS` in `script.js` (e.g. `'my-lesson-id': '🎙️'`)

### Adding a New Unit

Add a new object to the `units: []` array inside a course:
```javascript
{ id: 'u5', title: 'Unit 5 — Title', lessons: [ ... ] }
```

---

## Images

All lesson images live in `images/` folder. Current inventory:

| File | What it is | Used in |
|---|---|---|
| `logo-wcyt-point.png` | WCYT / The Point 91FM official logo | Stations |
| `logo-2point0.png` | WCYT 2.0 pixel logo | Stations |
| `wcyt-homepage.png` | Current WCYT.org homepage screenshot | Stations |
| `coverage-map.png` | The Point 91FM broadcast coverage map | Stations, FCC |
| `iasb-group.png` | Team photo at IASB competition | Welcome, Expectations |
| `iasb-finalists.png` | IASB finalists list (Homestead students highlighted) | Stations |
| `mic-cartoon.png` | Cartoon microphone illustration | Welcome, Air Personality |
| `npr-tips.png` | NPR "Want to sound your best?" infographic | Air Personality |
| `simian.png` | Simian radio automation software screenshot | First Break |
| `song-catalog.png` | Simian song catalog categories spreadsheet | First Break |
| `on-air-checklist.png` | On Air Checklist (red = every break) | First Break |
| `benztown.png` | Benztown music library interface | First Break |
| `dj-panel.png` | wcyt.org/dj panel (On Air/On Break/End Show) | First Break |
| `audition-levels.png` | "Adobe Audition LEVELS" graphic with ear | Audition Basics |
| `clipping.png` | Clipping waveform graphic | Audition Basics |
| `save-as-wav.png` | Save As WAV export dialog | Audition Basics |
| `show-thumb-theories.png` | "Off The Theories" student show thumbnail | Show Structure |
| `show-thumb-reeltalk.png` | "Reel Talk" student show thumbnail | Show Structure |
| `show-thumb-gg.png` | "GG Radio" student show thumbnail | Show Structure |
| `show-thumb-davon.png` | "The Davon & Vaughn Show" thumbnail | Show Structure |

All images were extracted from your Canva/PPTX source files.

---

## Source PowerPoint Files

Three PPTX decks were used to build lesson content:

| File | Content |
|---|---|
| `Audio 1st Semester.pptx` | 100-slide Sem 1 deck — all Unit 1-4 content, FCC rules, Air Personality, Audition basics |
| `Sem 2 2026- Radio Pairs & Audio Production Tricks.pptx` | 29-slide Sem 2 deck — Radio Pairs, Double Track, Remix/Stretch, Reverb FX, IASB finalists |
| `DJ Panel WCYT.org.pptx` | 6-slide deck — wcyt.org/dj panel walkthrough, show thumbnail creation, student thumbnail examples |

---

## What's Built vs. What's Pending

### Built and working:
- Full SPA with all views (home, schedule, games, signup, teacher, iasb, lessons)
- Lesson slideshow system with keyboard navigation, progress bar, side images, video embeds, gallery
- 4 units, 9 lessons of Radio Broadcasting content
- Daily email reminder GitHub Action
- All images extracted from source PPTXs and integrated
- IASB finalists, DJ panel, On Air Checklist, Simian catalog all in lessons

### Decided but not yet done:
- **Commit and push** — many sessions of work are uncommitted locally. The live GitHub Pages site is behind.
- **Gamma/Canva route** — we decided the lesson slideshow on the website is not as good as Canva visually. Plan is to link to Canva/Gamma decks from the lesson cards instead of using the built-in slideshow.
- **New Unit 4 lessons** from Sem 2 PPTX: Radio Pairs, Double Track & Speech Alignment, Remix & Stretch, FX & Reverb (all content extracted, not yet built)
- **Homestead Live course** — empty, needs lessons
- **Yearbook course** — empty, needs lessons
- **Firebase security rules** — currently open, flagged for tightening later

---

## Key Credentials & Logins

| What | Value |
|---|---|
| Teacher PIN (site) | `2027` |
| wcyt.org/dj password | `Homestead911-2.0` |
| DJ panel URL | `wcyt.org/dj` |
| Firebase project | `audioaficionados-21ba0` |
| GitHub repo | `github.com/dunnand/homestead_media` |
| Teacher email | `adunn@sacs.k12.in.us` |
| Personal email | `dunnand@gmail.com` |

---

## How to Resume With an AI

Share this file and say:

> "I'm working on the Homestead Media website at C:\Users\Andy\homestead_media\ — here's the full project reference (REFERENCE.md). I want to [specific task]."

The AI can then read the actual files with the paths listed above to get current state before making any changes.
