const RADIO_SLOTS = 10;

const LIVE_ROLES = [
  'Producer', 'Technical Director', 'Main Camera',
  'Camera 2', 'Camera 3', 'Roam 1', 'Roam 2',
  'Jumbotron', 'Director'
];

const EVENT_TYPES = {
  football:        { label: 'Football',          color: '#f59e0b' },
  basketball_boys: { label: 'Boys Basketball',   color: '#ef4444' },
  basketball_girls:{ label: 'Girls Basketball',  color: '#3b82f6' },
  volleyball:      { label: 'Volleyball',        color: '#8b5cf6' },
  showchoir:  { label: 'Show Choir',    color: '#10b981' },
  graduation: { label: 'Graduation',    color: '#f59e0b' },
  other:      { label: 'Special Event', color: '#6b7280' }
};


// ── Radio Stations & Schedule ────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const STATIONS = [
  { id: 'point', name: 'The Point', freq: '91fm',                   color: '#f59e0b' },
  { id: 'two',   name: '2.0',       freq: 'The Next Level of Radio', color: '#ef4444' },
];

// ── Timing Policy ────────────────────────────────────────────
// Basketball: Media Row 45 min before tip-off · Door 33 unlocks 30 min earlier (75 min before)
// Football:   Press Box 60 min before kickoff · Door 33 unlocks 30 min earlier (90 min before)
const ARRIVAL_MINS          = { basketball_boys: 45, basketball_girls: 45, football: 60 };
const ARRIVAL_DEFAULT_MINS  = 60;
const DOOR_EXTRA_MINS       = 30;
const ARRIVAL_LABEL         = { basketball_boys: 'Media Row', basketball_girls: 'Media Row', football: 'Press Box' };
const ARRIVAL_DEFAULT_LABEL = 'Crew Call';

// ── Basketball Home Games 2026–2027 ──────────────────────────
const BASKETBALL_HOME_GAMES = [
  { id: 'bb26-1121', title: 'Boys Basketball Scrimmage vs. Blackford',       date: '2026-11-21', type: 'basketball_boys', gameTime: '11:00 AM', roles: {}, checks: {}, notes: 'Scrimmage — Spartan Arena' },
  { id: 'bb26-1125', title: 'Boys Basketball vs. Huntington North',           date: '2026-11-25', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb26-1201', title: 'Boys Basketball vs. Leo High School',            date: '2026-12-01', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb26-1204', title: 'Boys Basketball vs. Warsaw High School',         date: '2026-12-04', type: 'basketball_boys', gameTime: '7:45 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb26-1211', title: 'Boys Basketball vs. Bishop Dwenger',             date: '2026-12-11', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb26-1229', title: 'Boys Basketball — Homestead Holiday Tournament', date: '2026-12-29', type: 'basketball_boys', gameTime: '5:30 PM',  roles: {}, checks: {}, notes: 'Homestead Holiday Tournament — Spartan Arena & Victory Gym — Games: 5:30 PM & 7:00 PM' },
  { id: 'bb26-1230', title: 'Boys Basketball — Homestead Holiday Tournament', date: '2026-12-30', type: 'basketball_boys', gameTime: '10:00 AM', roles: {}, checks: {}, notes: 'Homestead Holiday Tournament — Spartan Arena & Victory Gym — Games: 10:00 AM, 11:30 AM, 4:00 PM & 5:30 PM' },
  { id: 'bb27-0108', title: 'Boys Basketball vs. South Side',                 date: '2027-01-08', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0112', title: 'Boys Basketball vs. Blackhawk Christian',        date: '2027-01-12', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0122', title: 'Boys Basketball vs. North Side',                 date: '2027-01-22', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0126', title: 'Boys Basketball vs. New Haven',                  date: '2027-01-26', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0206', title: 'Boys Basketball vs. Oak Hill High School',       date: '2027-02-06', type: 'basketball_boys', gameTime: '1:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0209', title: 'Boys Basketball vs. Wayne High School',          date: '2027-02-09', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'bb27-0212', title: 'Boys Basketball vs. Concordia High School',      date: '2027-02-12', type: 'basketball_boys', gameTime: '7:30 PM',  roles: {}, checks: {}, notes: 'Spartan Arena' },
];

// ── Football Home Games 2026 ──────────────────────────────────
const FOOTBALL_HOME_GAMES = [
  { id: 'fb26-0814', title: 'Football Scrimmage vs. Snider',        date: '2026-08-14', type: 'football', gameTime: '7:00 PM', roles: {}, checks: {}, notes: 'Scrimmage — Spartan Stadium' },
  { id: 'fb26-0821', title: 'Football vs. Westfield High School',   date: '2026-08-21', type: 'football', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
  { id: 'fb26-0828', title: 'Football vs. Noblesville',             date: '2026-08-28', type: 'football', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
  { id: 'fb26-0904', title: 'Football vs. South Side',              date: '2026-09-04', type: 'football', gameTime: '7:00 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
  { id: 'fb26-0918', title: 'Football vs. Bishop Dwenger',          date: '2026-09-18', type: 'football', gameTime: '7:00 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
  { id: 'fb26-1002', title: 'Football vs. Carroll High School',     date: '2026-10-02', type: 'football', gameTime: '7:00 PM', roles: {}, checks: {}, notes: 'Spartan Stadium' },
];

// ── Girls Varsity Basketball Home Games 2026–2027 ─────────────
const GIRLS_BASKETBALL_HOME_GAMES = [
  { id: 'gb26-1028', title: 'Girls Basketball Scrimmage vs. Penn',        date: '2026-10-28', type: 'basketball_girls', gameTime: '6:00 PM', roles: {}, checks: {}, notes: 'Scrimmage — Spartan Arena' },
  { id: 'gb26-1117', title: 'Girls Basketball vs. Norwell',               date: '2026-11-17', type: 'basketball_girls', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb26-1127', title: 'Girls Basketball vs. Bellmont',              date: '2026-11-27', type: 'basketball_girls', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb26-1211', title: 'Girls Basketball vs. Bishop Dwenger',        date: '2026-12-11', type: 'basketball_girls', gameTime: '6:00 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb26-1219', title: 'Girls Basketball vs. Hamilton Southeastern', date: '2026-12-19', type: 'basketball_girls', gameTime: '3:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb27-0102', title: 'Girls Basketball vs. North Central HS',      date: '2027-01-02', type: 'basketball_girls', gameTime: '2:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb27-0108', title: 'Girls Basketball vs. Whitko',                date: '2027-01-08', type: 'basketball_girls', gameTime: '6:00 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb27-0113', title: 'Girls Basketball vs. Oak Hill High School',  date: '2027-01-13', type: 'basketball_girls', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
  { id: 'gb27-0119', title: 'Girls Basketball vs. Warsaw High School',    date: '2027-01-19', type: 'basketball_girls', gameTime: '7:30 PM', roles: {}, checks: {}, notes: 'Spartan Arena' },
];

// ── Special Events ────────────────────────────────────────────
const SPECIAL_EVENTS = [
  { id: 'sc27-0219',   title: 'Show Choir Showcase', date: '2027-02-19', type: 'showchoir',  gameTime: '', roles: {}, checks: {}, notes: 'TBD — time to be announced' },
  { id: 'sc27-0220',   title: 'Show Choir Showcase', date: '2027-02-20', type: 'showchoir',  gameTime: '', roles: {}, checks: {}, notes: 'TBD — time to be announced' },
  { id: 'grad27-0607', title: 'Graduation',           date: '2027-06-07', type: 'graduation', gameTime: '', roles: {}, checks: {}, notes: 'TBD — time to be announced' },
];

// ── IASB Competition ──────────────────────────────────────────
const IASB_SEASON   = '2026–2027';
const IASB_DEADLINE = '2027-02-05'; // update if IASB announces a different date

// Change this to whatever PIN you want — students should not know it
const TEACHER_PIN = '2027';

// Google Drive folder links — Dropbox 2027 in Audio Broadcasting shared drive
const IASB_DROPBOX_URL = 'https://drive.google.com/drive/folders/1Kg4UYcKzOLNYYqoEOG3fo2xbwNQtZCIY';

const IASB_DRIVE_FOLDERS = {
  R1: 'https://drive.google.com/drive/folders/1hbQe5g66WZdA8yGVZLv4UsU319rKsU0_',
  R2: 'https://drive.google.com/drive/folders/1lfZdA9ZWW4B-Dh9rymSHmATpVG-xS3i1',
  R3: 'https://drive.google.com/drive/folders/1Chda-yLZFyUwd6h7ftyeRFfl7wlaTIdR',
  R4: 'https://drive.google.com/drive/folders/1D95DC1TEN8ycisRi-tSigcnODfnQBNso',
  R5: 'https://drive.google.com/drive/folders/1UXqCTtVaujtEFYzC57f7BClBCQ6S4chR',
  R6: 'https://drive.google.com/drive/folders/1-lkafPeyTOayCpgUdzef_GWzXv7k1iaL',
  R7: 'https://drive.google.com/drive/folders/1MBicWR2Y-UulSdkIqttdqB_EkTwl2Xpm',
  R8: 'https://drive.google.com/drive/folders/1fR3WoNs5VfiY6jBorian4eORBbyGBwcW',
  R9: 'https://drive.google.com/drive/folders/1TbYun0vlO3-E1-ZKGVbqO8woy419RRM_',
  N2: 'https://drive.google.com/drive/folders/1xR9lcWruFXP55vzsIMDGrS4mz2pFLRWR',
  M3: 'https://drive.google.com/drive/folders/1K20xhwUEAmbCdIodrYRdcfUIROey1GOZ',
};

const IASB_CATEGORIES = [
  {
    code: 'R1', division: 'Radio', color: '#f59e0b',
    name: 'Air Personality', tag: 'LIVE Finals',
    perSchool: 2, solo: true,
    format: 'Scoped aircheck — music removed', length: '2–3 min', fileFormat: '.mp3',
    description: 'Solo DJ performance. Showcase your voice, personality, content, and on-air delivery. The top 6 entries compete live at the state finals on 88.7 FM WICR.',
    criteria: ['Voice quality', 'Ad-libbing', 'Content', 'Energy & pacing', 'Branding', 'Audience connection'],
    checklist: [
      'Solo performance only — team shows enter R3 Radio Show instead',
      'Remove all music from your aircheck (scoped)',
      'Final length: 2 to 3 minutes — not shorter, not longer',
      'Shows consecutive air break(s) — no jump cuts between unrelated breaks',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R2', division: 'Radio', color: '#f59e0b',
    name: 'Talk Show', tag: null,
    perSchool: 2, solo: false,
    format: 'Scoped aircheck', length: '5–7 min', fileFormat: '.mp3',
    description: 'Spoken-word, non-music program — opinions, reviews, interviews, or discussion. Sports-themed talk shows must enter S2 Sports Talk Show instead.',
    criteria: ['Knowledge & content', 'Ad-libbing', 'Intro of topic/guest', 'Energy & interaction', 'Delivery', 'Production elements', 'Branding'],
    checklist: [
      'Spoken-word only — no music-format shows (those enter R3 Radio Show)',
      'Scope your aircheck — remove any music beds',
      'Length: 5 to 7 minutes',
      'Features a variety of elements: opinion, interviews, or audience interaction',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R3', division: 'Radio', color: '#f59e0b',
    name: 'Radio Show', tag: null,
    perSchool: 2, solo: false,
    format: 'Scoped aircheck — music removed', length: '5–7 min', fileFormat: '.mp3',
    description: 'Team entertainment program in music format. Solo performers must enter R1 Air Personality. Opinion or review programs must enter R2 Talk Show.',
    criteria: ['Content', 'Announcer interaction', 'Delivery', 'Audience connection', 'Production elements', 'Branding', 'Overall impression'],
    checklist: [
      'Team performance (2+ DJs) — solo DJ enters R1 Air Personality instead',
      'Entertainment / music-format show — opinion shows enter R2 Talk Show',
      'Remove all music from your aircheck (scoped)',
      'Length: 5 to 7 minutes',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R4', division: 'Radio', color: '#f59e0b',
    name: 'Spot Production', tag: null,
    perSchool: 2, solo: true,
    format: 'Commercial, PSA, or station promo', length: ':30 or :60', fileFormat: '.mp3',
    description: 'Write and produce an original commercial, public service announcement, or station promotional spot. Exactly 30 or 60 seconds — timing is judged.',
    criteria: ['Concept', 'Production value', 'Opening hook', 'Voice & delivery', 'Script quality', 'Use of sound', 'Creativity', 'Timing'],
    checklist: [
      'Original content — commercial, PSA, or station promo',
      'Choose one length: :30 (:29.0–:30.0) OR :60 (:59.0–:60.0)',
      'All voice and production work done by students',
      'Verify exact timing before exporting',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R5', division: 'Radio', color: '#f59e0b',
    name: 'Imaging', tag: 'School-Wide',
    perSchool: 1, solo: false,
    format: 'Collage of sweepers, drop-ins, promos, jingles', length: 'Max 2 min total', fileFormat: '.mp3',
    description: 'One entry per school. A collage of the station\'s imaging elements. Students must perform all voice work. Include multiple productions in a single file.',
    criteria: ['Branding consistency', 'Execution', 'Use of sound', 'Variety', 'Creativity', 'Production value', 'Voice performance', 'Pacing'],
    checklist: [
      'One entry per school — this is a collective station submission',
      'Students must perform all voice work',
      'Include multiple productions: sweepers, drop-ins, promos, and/or jingles',
      'Total combined length: 2 minutes or less',
      'Export as a single .mp3 collage file and upload',
    ]
  },
  {
    code: 'R6', division: 'Radio', color: '#f59e0b',
    name: 'Copywriting', tag: null,
    perSchool: 2, solo: true,
    format: 'Written script ONLY — no audio', length: 'Per client specs', fileFormat: '.pdf',
    description: 'Write a commercial script based on the IASB client fact sheet at IASBOnline.org. Submit a word-processed script only — no recorded audio.',
    criteria: ['Strong lead', 'Holding audience attention', 'Interest & desire', 'Delivering client\'s message', 'Call to action', 'Creativity', 'Timing'],
    checklist: [
      'Download the client fact sheet from IASBOnline.org',
      'Write script at the length specified by the client',
      'Script must list: talent roles, music & SFX notes, and production directions',
      'Complete and attach the IASB competition agreement form',
      'Submit word-processed script ONLY — no audio recording',
      'Export as .pdf and upload',
    ]
  },
  {
    code: 'R7', division: 'Radio', color: '#f59e0b',
    name: 'Interview', tag: null,
    perSchool: 2, solo: true,
    format: 'Audio interview', length: '2+ min', fileFormat: '.mp3',
    description: 'Conduct and record a real interview with a real person. No fictional characters. Audio from this entry cannot be re-entered as a Podcast (M3).',
    criteria: ['Introduction', 'Question order', 'Question quality & depth', 'Delivery & style', 'Conclusion'],
    checklist: [
      'Real interview — no fictional characters or dramatizations',
      'Cannot be submitted as a Podcast (M3) — those are separate entries',
      'Minimum length: 2 minutes',
      'Include a clear introduction that sets up the interview subject',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R8', division: 'Radio', color: '#f59e0b',
    name: 'Adapted Drama', tag: null,
    perSchool: 2, solo: false,
    format: 'Audio drama from existing script', length: '5–15 min', fileFormat: '.mp3',
    description: 'Produce an audio drama based on an existing, non-student-written script. Two entries in this category must use two different scripts.',
    criteria: ['Opening', 'Delivery', 'Scene transitions', 'Vocal performance', 'Music & sound effects', 'Conclusion'],
    checklist: [
      'Must use an existing, non-student-written script',
      'Two entries must use two different scripts',
      'Length: 5 to 15 minutes',
      'Use music and/or sound effects to support the drama',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'R9', division: 'Radio', color: '#f59e0b',
    name: 'Original Drama', tag: null,
    perSchool: 2, solo: false,
    format: 'Audio drama from student-written script', length: '5–15 min', fileFormat: '.mp3',
    description: 'Write and produce an original audio drama. Students must write the script. Two entries must use two different original scripts.',
    criteria: ['Script quality', 'Opening', 'Delivery', 'Scene transitions', 'Vocal performance', 'Music & sound effects', 'Conclusion'],
    checklist: [
      'Script must be written by students — not from an existing work',
      'Two entries must use two different original scripts',
      'Length: 5 to 15 minutes',
      'Use music and/or sound effects to support the drama',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'N2', division: 'News', color: '#ef4444',
    name: 'Radio In-Depth', tag: null,
    perSchool: 2, solo: true,
    format: 'Audio news or feature story', length: '2+ min', fileFormat: '.mp3',
    description: 'In-depth audio coverage of a single news or feature topic. This is NOT a podcast — podcast entries must use M3. No fictional content.',
    criteria: ['Opening', 'Content', 'Delivery', 'Audio quality', 'Creativity', 'Credibility', 'Writing', 'Pacing', 'Closing'],
    checklist: [
      'Single-topic news or feature story — not a podcast format',
      'Cannot be re-entered as a Podcast (M3)',
      'Minimum length: 2 minutes',
      'Strong opening that establishes the story and its importance',
      'Export and upload as .mp3',
    ]
  },
  {
    code: 'M3', division: 'Emerging Media', color: '#8b5cf6',
    name: 'Podcast', tag: null,
    perSchool: 2, solo: false,
    format: 'Single episode from a series', length: '5–15 min', fileFormat: '.mp3 + .jpg',
    description: 'Submit one episode from an ongoing podcast series. Must also upload the show\'s cover art as a .jpg. Audio cannot be reused from a Vodcast (M4) entry.',
    criteria: ['Pre-planning', 'Opening', 'Storytelling', 'Creativity & originality', 'Production quality', 'Vocal performance', 'Closing'],
    checklist: [
      'Episode must come from an ongoing podcast series',
      'Audio cannot be reused from a Vodcast (M4) entry',
      'Length: 5 to 15 minutes',
      'Prepare show thumbnail / cover art as a .jpg file (required)',
      'Export audio as .mp3',
      'Upload BOTH the .mp3 audio AND the .jpg cover art',
    ]
  },
];

// ── Lessons ───────────────────────────────────────────────────
const LESSONS = {
  radio: {
    name: 'Radio Broadcasting',
    color: '#a78bfa',
    icon: '📻',
    units: [
      {
        id: 'u1',
        title: 'Unit 1 — Introduction',
        lessons: [
          {
            id: 'welcome',
            title: 'Welcome to Audio Broadcasting',
            duration: '1 class',
            summary: 'What you\'ll do this semester, the daily routine, and program overview.',
            sections: [
              { type: 'intro', content: 'This class is about doing real radio. From day one you\'ll be on the air at one of two actual stations — The Point 91FM and WCYT 2.0. You\'ll produce real content, work with professional equipment, and build skills that carry into any broadcast career.',
                sideImg: 'images/iasb-group.png', sideImgCap: 'The Homestead Audio Broadcasting team at IASB — this could be you.' },
              { type: 'callout', label: 'Semester Roadmap', items: [
                'Air Personality — Solo DJ breaks on The Point and 2.0',
                'Talk Shows — Weekly group radio shows with your crew',
                'Projects — Issue Report, Copywriting, IASB Competition entries',
                'Production — Adobe Audition, imaging, spot production',
              ]},
              { type: 'callout', label: 'After School', items: [
                'The Point and 2.0 run live shows Monday through Friday after school',
                'Audio Aficionados — full album listening club (day TBD)',
              ], sideImg: 'images/mic-cartoon.png', sideImgCap: 'Homestead Audio Broadcasting — student-run, community-heard.' },
            ]
          },
          {
            id: 'stations',
            title: 'Our Stations',
            duration: '1 class',
            summary: 'WCYT The Point 91FM and 2.0 — history, genre, power, and identity.',
            sections: [
              { type: 'intro', content: 'Homestead Audio Broadcasting operates two real radio stations — both student-run, broadcasting to real audiences. The current wcyt.org has Live Playlist, Podcasts, Sports, Awards, and social media on Instagram, YouTube, X, Facebook, Spotify, and TikTok.',
                sideImg: 'images/logo-wcyt-point.png', sideImgCap: 'WCYT — The Point 91FM' },
              { type: 'keyterms', title: 'WCYT — The Point 91FM', terms: [
                { term: 'On Air Since', def: '1993' },
                { term: 'Genre', def: 'Independent Music' },
                { term: 'Frequency', def: '91.1 FM' },
                { term: 'Power', def: '1 Kilowatt (upgraded from 125W in 2024)' },
                { term: 'Taglines', def: '"Where Music is the Point" · "Your Alternative to Commercial Radio" · "The Independent Music Source"' },
                { term: 'Website', def: 'WCYT.org' },
              ], sideImg: 'images/coverage-map.png', sideImgCap: 'The Point 91FM\'s broadcast coverage across Fort Wayne and surrounding communities.' },
              { type: 'keyterms', title: 'WCYT 2.0', terms: [
                { term: 'On Air Since', def: '2023' },
                { term: 'Genre', def: 'All music types' },
                { term: 'Platform', def: 'Online only — WCYT.org' },
                { term: 'Tagline', def: '"The Next Level of Radio"' },
              ], sideImg: 'images/logo-2point0.png', sideImgCap: 'WCYT 2.0 — The Next Level of Radio' },
              { type: 'callout', label: 'Studio Facilities', items: [
                'Recording Studios — multitrack production sessions',
                'Podcast Studios — close-mic interview and podcast setup',
                'Radio Stations — live broadcast environments',
              ], sideImg: 'images/wcyt-homepage.png', sideImgCap: 'The current WCYT.org — Live Playlist, Podcasts, Sports, Awards, and 6 social platforms.' },
              { type: 'text', title: '🏆 IASB Radio School of the Year', content: 'The program has won IASB Radio School of the Year in <strong>2026</strong>, 2024, 2023, 2021, 2019, 2018, and 2017. That reputation is built one air shift at a time — by students like you.',
                sideImg: 'images/iasb-finalists.png', sideImgCap: 'IASB finalists list — Homestead students highlighted in yellow.' },
            ]
          },
          {
            id: 'fcc',
            title: 'FCC Rules & On-Air Standards',
            duration: '2 classes',
            summary: 'Federal regulations every broadcaster must know — obscenity, indecency, underwriting.',
            sections: [
              { type: 'intro', content: 'Every broadcaster in America is regulated by the FCC — the Federal Communications Commission. As a student broadcaster on a licensed station, you are held to the exact same legal standards as any professional. "I didn\'t know I was on the air" is not a defense the FCC accepts.',
                sideImg: 'images/coverage-map.png', sideImgCap: 'The Point 91FM broadcasts to real communities — which means real FCC accountability.' },
              { type: 'callout', label: '⚠️ Non-Negotiable', warning: true, content: 'Any profanity or unprofessional language — whether you think the mic is live or not — will get you pulled from air immediately. Treat every microphone as live at all times.' },
              { type: 'keyterms', title: 'The Three Content Categories', terms: [
                { term: 'Obscene', def: 'No First Amendment protection. Must meet the Supreme Court\'s 3-part test. Prohibited at ALL hours, 24/7.' },
                { term: 'Indecent', def: 'Sexual or excretory content that is patently offensive but doesn\'t meet the obscenity test. Banned 6 AM–10 PM when children may be listening.' },
                { term: 'Profane', def: '"Grossly offensive" language considered a public nuisance. Also banned 6 AM–10 PM.' },
              ]},
              { type: 'text', title: 'Enforcement & Consequences', content: 'Violations begin with listener complaints reviewed by FCC staff. Penalties range from a formal warning to a fine to revoking the station\'s broadcast license. In 2020, one university paid a $76,000 fine for underwriting violations alone. These consequences are real — for a licensed station and for you personally.' },
              { type: 'text', title: 'Our Standard Goes Further', content: 'At Homestead we go beyond the legal minimum. Speak on air as if the whole school is listening — G-rated only. No speaking negatively about students, teachers, or anyone else. The FCC also prohibits broadcasting false information about crimes or catastrophes if it would cause public harm.' },
              { type: 'keyterms', title: 'Sponsors & Underwriting', terms: [
                { term: 'Why underwriting?', def: 'Noncommercial FM stations cannot run traditional advertisements. Sponsors are instead acknowledged with scripted underwriting announcements.' },
                { term: 'Our sponsors', def: 'Marcos Pizza · Casa Italian Restaurants' },
                { term: 'What\'s not allowed', def: 'Comparative or qualitative descriptions, price information, sales, calls to action, inducements to buy, or detailed "menu listings"' },
                { term: 'The rule', def: 'If you\'re unsure whether you can say it about a sponsor — don\'t say it.' },
              ]},
            ]
          },
          {
            id: 'expectations',
            title: 'Classroom Expectations & Grading',
            duration: '1 class',
            summary: 'Room rules, how grades work, project submission, and the final project.',
            sections: [
              { type: 'intro', content: 'Your grade is built on <strong>participation and effort</strong>, combined with project grades. Show up prepared, engage with the work, and push yourself on air. The final project counts for a significant portion of your overall grade.',
                sideImg: 'images/iasb-group.png', sideImgCap: 'What you build here can take you to stages like this.' },
              { type: 'list', title: 'Room Rules', items: [
                'No food in editing studios or radio stations. Drinks with lids at desks only.',
                'Phones out of sight unless pre-approved by the teacher.',
                'One person in the hallway at a time. No passes in the first or last 10 minutes of class.',
                'If you\'re scheduled on-air, use the restroom before class — missing your air shift affects your participation grade.',
                'Leave all spaces clean. Repeated messes = no food privileges for everyone.',
              ]},
              { type: 'callout', label: 'What Counts for Your Grade', items: [
                'Participation and effort during on-air shifts and class activities',
                'Project grades — Issue Report, Copywriting, IASB entries, and more',
                '<strong>Final Project — counts for a significant portion of your overall grade</strong>',
                'Staying on task (no games, no email chatting)',
                'Engagement during discussions, prep, and group planning',
              ]},
              { type: 'text', title: 'Project Submission', content: 'All projects go into the Google Shared Drive Dropbox with your name and the project title in the correct folder for the year. Late work must be emailed to adunn@sacs.k12.in.us with the assignment name and file location — it can help your grade but won\'t replace the participation points you missed that week.' },
              { type: 'text', title: 'Different Skill Levels Are a Feature', content: 'Grades are individual — you are not compared to anyone else. There are many different experience levels in this room, and that\'s a strength. Work with students who are more advanced, ask questions, and use the people around you as a resource.' },
            ]
          },
        ]
      },
      {
        id: 'u2',
        title: 'Unit 2 — Air Personality',
        lessons: [
          {
            id: 'ap-intro',
            title: 'What is Air Personality?',
            duration: '1 class',
            summary: 'Goals for your air shifts, the 5-break structure, and what makes a great DJ break.',
            sections: [
              { type: 'intro', content: 'Air personality is the art of connecting with listeners between songs. Great radio isn\'t just music — it\'s about making people feel like someone real is there with them. Your job is to be that presence.',
                sideImg: 'images/mic-cartoon.png', sideImgCap: 'Every break is your moment — make it count.' },
              { type: 'callout', label: 'Your Air Shift Goals', items: [
                'Goal of 5 DJ breaks per class period — before and after songs only',
                'Always skip ID Shouts and move Top of Hour breaks',
                'Introduce yourself in every break',
                'Give the listener artist and song information with a personal touch',
                'Final break: sign off, thank listeners, announce who\'s on next',
              ]},
              { type: 'keyterms', title: 'Pre-Sell and Back-Sell', terms: [
                { term: 'Back-Sell', def: 'Identifying what song just played — artist, title, album. Done immediately after a song ends, before you say anything else.' },
                { term: 'Pre-Sell', def: 'Teasing what\'s coming up next. Creates anticipation and gives listeners a reason to stay.' },
              ]},
              { type: 'text', title: 'Personality on Air', content: 'Every break should include a window into your actual personality — your hobbies, a dream destination, music that matters to you, something you found interesting. Genuine interest is audible. Listeners hear the difference between real and forced.',
                sideImg: 'images/npr-tips.png', sideImgCap: 'NPR\'s guide to sounding your best — read every line before your next shift.' },
            ]
          },
          {
            id: 'front-load',
            title: 'Front Loading Content',
            duration: '1 class',
            summary: 'Lead with the most important info first. Artist, song, album, year — never filler phrases.',
            sections: [
              { type: 'intro', content: 'Front loading means delivering the most important information first. Listeners don\'t wait around — if your break opens with a filler phrase, you\'ve already lost them before you\'ve said anything meaningful.',
                sideImg: 'images/mic-cartoon.png', sideImgCap: 'Your first word is your first impression.' },
              { type: 'callout', label: '🚫 Never Open a Break With These', warning: true, items: [
                '"That was…"',
                '"You just heard…"',
                '"What was just played was…"',
              ]},
              { type: 'list', title: 'Back-Sell Formula — Always Lead With This', items: [
                'Artist Name',
                'Song Title',
                'Album Title',
                'Release Year',
              ]},
              { type: 'text', title: 'Example Back-Sell', content: '"It\'s The Point 91FM — The XX, \'I Dare You\' from <em>I See You</em>, 2017. I\'m [Your Name]…"<br><br>Notice: the artist name comes before anything else. The listener hears what they need immediately, not after you warm up.' },
              { type: 'callout', label: 'Every Break Should End With', items: [
                'Your name or show name',
                'A WCYT tagline (e.g. "Where Music is the Point" or "Your Alternative to Commercial Radio")',
                'A tease for the next song or segment',
              ]},
            ]
          },
          {
            id: 'first-break',
            title: 'Your First DJ Break',
            duration: '1–2 classes',
            summary: 'Listen to a real student break, learn the 5-element formula, and go on air.',
            sections: [
              { type: 'intro', content: 'Today you go on air. Before you sit down at the board, you need to know exactly what you\'re going to say — and why every word matters.' },
              { type: 'audio',
                src: 'audio/carter-dj-break.mp3',
                label: 'Listen First — Carter\'s DJ Break',
                context: 'Before we break down the formula, hear what a complete break sounds like from a real WCYT DJ. Listen for how he opens, where his personality shows up, and how he ends.',
                note: '<strong>What to listen for:</strong> He opens with the artist and title — not "that was." He gives a real opinion on something happening right now. He invites the listener into a conversation. He teases what\'s next.',
                tip: '⭐ <strong>Advanced move — notice this:</strong> At the end, Carter talks over the instrumental intro of the next song and lands his last word exactly as the lyrics begin. This is called <strong>hitting the post</strong>. You\'ll learn this technique later in the semester. For now, just notice it happens.' },
              { type: 'list', title: 'Every DJ Break Has 5 Elements', items: [
                '<strong>Back-Sell</strong> — Tell them what just played',
                '<strong>Introduction</strong> — Tell them who you are <em>(every break)</em>',
                '<strong>Promotion</strong> — One line for WCYT',
                '<strong>Fun Fact</strong> — Something genuine you actually care about',
                '<strong>Pre-Sell</strong> — Tell them what\'s coming next',
              ]},
              { type: 'keyterms', title: 'Element 1 — Back-Sell', terms: [
                { term: 'Required', def: 'Artist name and song title — both, every time' },
                { term: 'Flexible', def: 'Album, year, and order — use whatever sounds natural to you' },
                { term: 'Multiple songs', def: 'If several songs played back-to-back, back-sell all of them' },
                { term: 'Example', def: '"From the 1998 album Mutations, it\'s Beck\'s \'Cold Brains\'" — artist and title, front-loaded, sounds natural' },
              ]},
              { type: 'list', title: '3 Ways to Open Without "That Was"', items: [
                '<strong>Artist/Song First</strong> — "Beck\'s \'Cold Brains\' from Mutations, 1998..."',
                '<strong>Station + Name First</strong> — "It\'s The Point 91FM, I\'m [name], and we just heard [artist/title]..."',
                '<strong>Name + Tagline First</strong> — "[Name] on Your Alternative to Commercial Radio — [artist/title]..."',
              ]},
              { type: 'text', title: 'Element 2 — Introduction', content: 'Introduce yourself <strong>every break</strong>. Your name, the station, and one real thing about yourself — a hobby, an opinion, something honest. Keep it fresh each time — don\'t repeat the same line. Carter\'s intro came <em>after</em> he hooked the listener with a topic — he earned it by being interesting first.' },
              { type: 'text', title: 'Element 3 — Promotion', content: 'One line. A special show, an upcoming event, social media, or the station website. Keep it brief — the promotion should feel like something you actually want listeners to know, not a commercial crammed into your break.' },
              { type: 'text', title: 'Element 4 — Fun Fact', content: 'This is where your personality lives. Pick something you actually find interesting — music news, a current event, something at school, a personal take. Carter\'s AI commercials take worked because it was <em>specific</em>: "Coke did it better, not gonna lie." Specific opinions are always better than vague ones. Listeners can tell the difference.' },
              { type: 'text', title: 'Element 5 — Pre-Sell', content: 'Go into Simian and pick your next song <em>before</em> your break starts. Then tease it with the artist, title, and a reason to stay tuned. <em>"Coming up — Vampire Weekend\'s \'Hannah Hunt\' — do not touch that dial."</em><br><br>The pre-sell gives listeners a reason to stay through the music. No pre-sell, no reason to stay.' },
              { type: 'text', title: 'The DJ Panel — wcyt.org/dj', content: 'Every shift starts and ends here. Log in at <strong>wcyt.org/dj</strong> (password: <strong>Homestead911-2.0</strong>). Enter your Show/DJ name, select your station, and set status to <strong>On Air</strong> when you go live. Hit <strong>End Show</strong> when you\'re done. The Now Playing Override lets you manually enter what\'s on air when the system can\'t auto-detect it.',
                sideImg: 'images/dj-panel.png', sideImgCap: 'Set On Air when you start. End Show when you\'re done. Every single shift.' },
              { type: 'callout', label: '✍️ Write Your Break Before You Sit Down', items: [
                '<strong>Opening + Back-Sell:</strong> Choose a song in Simian. Write your opening line with artist and title using one of the 3 patterns.',
                '<strong>Introduction:</strong> Your name, the station, one honest thing about yourself.',
                '<strong>Promotion:</strong> One line for WCYT — show, event, social media, or website.',
                '<strong>Fun Fact:</strong> Something specific you actually find interesting.',
                '<strong>Pre-Sell:</strong> Choose your next Simian song. Artist, title, reason to stay.',
              ]},
              { type: 'callout', label: 'Every Shift — No Exceptions', items: [
                'Head directly to your studio at the start of air time',
                'Log in to wcyt.org/dj — set status to On Air',
                'Both DJs participate in every break — no one sits out',
                'Write your break before you sit down — do not wing it',
                'Final break: sign off, thank listeners, announce who\'s on next, hit End Show',
                'Headphones on mic stands — wipe them down before you leave',
              ], sideImg: 'images/on-air-checklist.png', sideImgCap: 'On Air Checklist — red items are required every single break.' },
            ]
          },
        ]
      },
      {
        id: 'u2b',
        title: 'Unit 2 — Radio Show Pairs',
        lessons: [
          {
            id: 'radio-pairs',
            title: 'Radio Show Pairs',
            duration: '1 class',
            summary: 'How pairs work — every other song, both stations, what you say in each break.',
            sections: [
              { type: 'intro', content: 'Radio Show Pairs puts two DJs on air together on every other song. Half the class runs The Point, half runs 2.0. You\'re still doing everything from Unit 2 — just with a partner and a faster rotation.',
                sideImg: 'images/pairs-schedule.png', sideImgCap: 'The weekly pairs schedule — The Point 91FM and 2.0 side by side.' },
              { type: 'callout', label: 'How Pairs Work', items: [
                'Half the class is on WCYT The Point — half is on 2.0',
                'Pairs go on air every other song — not every song',
                'Both DJs are on mic for every break — no sitting out',
                'RECORD your shifts — airchecks are required',
              ]},
              { type: 'list', title: 'What Goes In Every Break', items: [
                '<strong>Pre-Sell & Back-Sell</strong> — Artist, title, what just played and what\'s next',
                '<strong>Coming Up in the Hour</strong> — Tease something interesting ahead',
                '<strong>Quick Music News</strong> — One current story from the music world',
                '<strong>Quick Artist Info</strong> — A fact about the artist you just played',
                '<strong>Fun Topic</strong> — Something genuine, your opinion, your personality',
                '<strong>Pre-Sell</strong> — Tease the next song with a reason to stay',
              ]},
              { type: 'callout', label: 'Pick Your Own Playlist', items: [
                'You choose your songs from the Simian catalog — not auto-scheduled',
                'Be creative — don\'t just play the first songs you find',
                'Your playlist should reflect your taste and fit the station\'s vibe',
                'Pre-sell every song before it plays so listeners know what\'s coming',
              ]},
              { type: 'callout', label: '⚠️ Record Every Shift', warning: true, content: 'You must record your airshift every time. Airchecks are how you self-assess, how your teacher grades, and how you build your IASB portfolio. If you don\'t record, that shift didn\'t happen.' },
            ]
          },
        ]
      },
      {
        id: 'u3',
        title: 'Unit 3 — Radio Talk Shows',
        lessons: [
          {
            id: 'show-structure',
            title: 'Talk Show Structure',
            duration: '2 classes',
            summary: 'How a show is structured — three breaks, recurring segments, group formation, and planning.',
            sections: [
              { type: 'intro', content: 'Talk shows run the full class period with two or more hosts. Three 8–10 minute breaks cover News, Celebrities, Entertainment, Social Media, Teens, and Lifestyle. No sports — there\'s a separate class for that.' },
              { type: 'keyterms', title: 'Three-Break Format', terms: [
                { term: 'Break 1', def: 'Introduction — overview of the episode\'s topics + News of the Week. Use Google News, Reddit, or X for a current relevant story.' },
                { term: 'Break 2', def: 'Recurring Segment — your show\'s weekly feature with an engaging hook and station promotion.' },
                { term: 'Break 3', def: 'Main Topic — the signature deep-dive of the episode. Can also be a second news story.' },
              ]},
              { type: 'list', title: 'Topic Categories', items: [
                'Celebrity', 'Video Games', 'Movies', 'Technology',
                'Super Heroes', 'School Life', 'Music', 'Pop Culture', 'Advice',
              ]},
              { type: 'callout', label: '📅 Show Planning — The Day Before', items: [
                'Your group plans the full show the day before it airs — not the morning of',
                'Give Mr. Dunn a rundown before your show: how you\'ll promote each break, and how you\'ll open each break',
                'Each break needs a clear opening line and a promotion plan going in',
                'Unplanned shows sound unplanned — listeners notice and so does the teacher',
              ]},
              { type: 'callout', label: 'Building Your Show Identity', items: [
                'Choose a show name',
                'Write a tagline — one sentence describing what the show is about',
                'Design a recurring segment that gives listeners something consistent to come back for',
                'Use your tagline at the start of every show and in promotional mentions',
              ]},
              { type: 'text', title: 'Finding Your Group', content: 'Groups are 3–4 students. When forming, think about what topic you\'d all genuinely research and talk about every week for a full semester. Shared real interest makes far better radio than just picking your friends.' },
              { type: 'text', title: 'Your Show Thumbnail', content: 'Every show needs a thumbnail that appears on WCYT.org and the DJ panel. Create yours in Canva or Photoshop at <strong>500px × 500px</strong>, JPG or PNG. Email the finished file to adunn@sacs.k12.in.us to get it added. Your thumbnail is the first thing listeners see — make it represent your show.',
                sideImg: 'images/wcyt-homepage.png', sideImgCap: 'Your show thumbnail appears right here on WCYT.org when you\'re on air.' },
              { type: 'gallery', label: 'Student Show Thumbnail Examples', images: [
                { src: 'images/show-thumb-theories.png', alt: 'Off The Theories' },
                { src: 'images/show-thumb-reeltalk.png', alt: 'Reel Talk' },
                { src: 'images/show-thumb-gg.png', alt: 'GG Radio' },
                { src: 'images/show-thumb-davon.png', alt: 'The Davon & Vaughn Show' },
              ]},
              { type: 'video', youtube: 'wQ04EZV9z3M', label: 'How to Make a Successful Radio Show', note: 'Watch this before you plan your first talk show — the structure tips apply directly to your three-break format.' },
            ]
          },
        ]
      },
      {
        id: 'u4',
        title: 'Unit 4 — Production',
        lessons: [
          {
            id: 'destructive-editing',
            title: 'Destructive vs Non-Destructive Editing',
            duration: '1 class',
            summary: 'Why there are two editors in Audition — and which one you should almost always use.',
            sections: [
              { type: 'intro', content: 'Audition has two completely different workspaces: the Waveform Editor and the Multitrack Editor. Most students don\'t understand why both exist. The difference comes down to one question: do your edits permanently change the file, or not?' },
              { type: 'keyterms', title: 'The Two Editors', terms: [
                { term: 'Waveform Editor', def: 'Destructive — every change is stamped permanently onto the audio file. Opens automatically when you double-click a clip.' },
                { term: 'Multitrack Editor', def: 'Non-destructive — changes happen inside the session file. Your original audio clips are never touched.' },
              ], sideImg: 'images/waveform-editor.png', sideImgCap: 'The Waveform Editor shows raw audio at the sample level — every change is permanent.' },
              { type: 'text', title: 'Destructive Editing — The Waveform Editor', content: 'The Waveform Editor opens immediately when you drag in an audio file. It\'s quick and feels obvious, which is why beginners default to it. The problem: every cut, filter, or effect you apply is baked into the file permanently. It\'s like applying an Instagram filter and saving it over your original photo — that first-take audio is gone for good once you hit Save.',
                sideImg: 'images/waveform-editor.png', sideImgCap: 'Waveform Editor — great for trimming dead air at the end of a clip. Bad for anything you might want to undo later.' },
              { type: 'text', title: 'Non-Destructive Editing — The Multitrack', content: 'In the Multitrack Editor, cuts, fades, and effects happen inside the session file — not the source audio. Your original clips are always safe. You can close Audition, come back a week later, and pick up exactly where you left off. This is the right tool for almost every project.',
                sideImg: 'images/multitrack-editor.png', sideImgCap: 'Multitrack Editor — edits live in the session file. The original audio is always preserved.' },
              { type: 'callout', label: '⚠️ Auto-Save Only Works in Multitrack', warning: true, content: '"My computer crashed and I lost everything" — this only happens in the Waveform Editor. The Multitrack has built-in auto-save. Find it under Edit → Preferences → Auto Save. Always work in Multitrack so your project is protected.' },
              { type: 'list', title: 'When to Use Each', items: [
                '<strong>Waveform Editor:</strong> Trimming dead air off the end of a file — a quick fix you\'ll never need to undo',
                '<strong>Waveform Editor:</strong> Noise reduction processing (this effect requires destructive editing)',
                '<strong>Multitrack:</strong> Everything else — DJ breaks, imaging spots, music beds, show recordings',
                'If there\'s even a 5% chance you might want to undo it, use Multitrack',
              ]},
            ]
          },
          {
            id: 'audition-basics',
            title: 'Adobe Audition Basics',
            duration: '2–3 classes',
            summary: 'Destructive vs. non-destructive editing, normalize, hard limit, and audio cleanup tools.',
            sections: [
              { type: 'intro', content: 'Adobe Audition is your main production tool. You\'ll use it to edit airchecks, build show opens, produce promos, master competition entries, and clean up voice recordings.',
                sideImg: 'images/audition-levels.png', sideImgCap: 'Good levels = great audio. This is the first thing you learn.' },
              { type: 'keyterms', title: 'Two Modes of Editing', terms: [
                { term: 'Destructive Edit', def: 'Permanently changes the source audio file. Cannot be undone after saving. Use only when you\'re completely sure.' },
                { term: 'Non-Destructive Edit', def: 'Works with clips and effects on a multitrack timeline. Original file is untouched. This is the default method for most production work.' },
              ]},
              { type: 'video', youtube: 'b0hFYjNQTkI', label: 'Adobe Audition Multitrack Editor — The One Trick That Changes Everything', note: 'This covers exactly the non-destructive workflow you\'ll use for show production.' },
              { type: 'list', title: 'Mastering Your Audio — The 2-Step', items: [
                'Normalize to −0.1 dB (or −6 dB for multitrack mixes)',
                'Apply Hard Limit to prevent clipping and control peak levels',
              ], sideImg: 'images/clipping.png', sideImgCap: 'Clipping = audio hitting the ceiling and distorting. Normalize + Hard Limit prevents this.' },
              { type: 'callout', label: 'Save As .WAV — Always', content: 'Export your final file as .WAV (Wave PCM) for full quality. Never submit an .mp3 for competition or graded projects.',
                sideImg: 'images/save-as-wav.png', sideImgCap: 'Use "Save As" in Audition → Wave PCM. This is your final export step every time.' },
              { type: 'callout', label: 'Quick Cleanup Tool', content: 'Adobe Podcast Enhance (podcast.adobe.com/enhance) dramatically cleans up voice recordings — removes room noise, improves mic quality. Run your audio through it before you master.' },
              { type: 'video', youtube: 'xI0USfUwJRs', label: 'How to Edit Keyframes in Adobe Audition', note: 'Keyframes let you automate volume, panning, and effects over time — essential for building polished promos and show opens.' },
            ]
          },
          {
            id: 'stutter',
            title: 'Stutter Effect',
            duration: '1–2 classes',
            summary: 'Build a stutter effect in Audition using copy/paste, crossfades, and pitch shifting on envelopes.',
            sections: [
              { type: 'intro', content: 'The stutter effect is one of the most recognizable sounds in radio imaging. You\'ll build it by cutting a single word into repeated pieces, crossfading them, then automating a pitch shift over time using envelopes.' },
              { type: 'list', title: 'Step 1 — Record and Set Up', items: [
                'Record: "The Point 91FM — Louder, Clearer, Better"',
                'Record two complete versions',
                'Place your recording into a multitrack session',
              ]},
              { type: 'list', title: 'Step 2 — Build the Stutter', items: [
                'Use the Razor tool to cut after "The Point 91FM, Louder, Clearer"',
                'Move "Better" to the right to create space',
                'Highlight just the "Buh" sound from "Better"',
                'Copy and paste that "Buh" sound 4 times in a row',
                'Make sure all 4 clips are crossfaded into each other',
              ]},
              { type: 'list', title: 'Step 3 — Add Pitch Shift', items: [
                'Open the Effects Rack for your stutter track',
                'Add Time and Pitch → Pitch Shifter',
                'Close the effect popup',
                'Click the > arrow next to the Read menu on your stutter track',
                'Select Show Envelopes → Pitch Shifter',
                'Draw keyframes on the timeline to shift pitch across the stutter',
              ], sideImg: 'images/pitch-shifter-envelope.png', sideImgCap: 'Show Envelopes → Pitch Shifter lets you draw pitch changes over time directly on the track.' },
              { type: 'video', youtube: 'PtJ6bZzFUW8', label: 'How to Get a Stutter Effect on Vocals (Adobe Audition Multitrack)', note: 'This covers the exact stutter workflow you\'ll use — watch before you start.' },
            ]
          },
          {
            id: 'double-track',
            title: 'Double Track',
            duration: '1 class',
            summary: 'Use Automatic Speech Alignment to layer two voice recordings and create a thicker, doubled sound.',
            sections: [
              { type: 'intro', content: 'Double tracking takes two recordings of the same line and aligns them perfectly using Adobe Audition\'s Automatic Speech Alignment tool. The result is a thicker, more powerful vocal sound used in radio imaging and production.' },
              { type: 'list', title: 'How to Double Track', items: [
                'Select your two different "Clearer" audio parts from your recordings',
                'Copy one and paste it to the track directly below the other',
                'Hold <strong>Ctrl + Left Click</strong> to select both clips at once',
                'Right-click one of the clips → <strong>Automatic Speech Alignment</strong>',
                'Audition will align the second clip to match the first perfectly',
              ], sideImg: 'images/audition-remix-align.png', sideImgCap: 'Right-click menu showing Automatic Speech Alignment — this is what locks two vocal tracks together.' },
              { type: 'callout', label: 'Why It Works', items: [
                'Even two perfect takes are slightly different in timing and tone',
                'Speech Alignment corrects those differences automatically',
                'The result sounds thicker and more professional than a single track',
                'Used on station IDs, imaging elements, and show opens',
              ]},
              { type: 'video', youtube: 'Zuxzl8pl-Jg', label: 'Double Up Your Voice in Adobe Audition', note: 'Watch this to see the full double tracking workflow in action.' },
            ]
          },
          {
            id: 'remix-stretch',
            title: 'Remix & Stretch',
            duration: '1–2 classes',
            summary: 'Use Remix to fit a music bed to any length, and Stretch to manually resize audio clips on the timeline.',
            sections: [
              { type: 'intro', content: 'Remix and Stretch are two ways to make audio fit a specific duration. Remix intelligently rearranges a music bed to hit an exact length. Stretch lets you manually drag a clip longer or shorter. Together they\'re essential for production work.' },
              { type: 'list', title: 'Getting Your Files', items: [
                'Log into Benztown: User <strong>wcytfm</strong> / Password <strong>WCYT91.1homestead</strong>',
                'Download 1 music bed and 1 alien/imaging FX clip',
                'Place both into your multitrack session',
              ]},
              { type: 'list', title: 'Enable Remix on Your Music Bed', items: [
                'Right-click your music bed clip on the timeline',
                'Go to <strong>Remix → Enable Remix</strong>',
                'A blue Remix bar will appear on the clip',
              ], sideImg: 'images/audition-remix-align.png', sideImgCap: 'Right-click → Remix → Enable Remix to activate intelligent duration matching.' },
              { type: 'list', title: 'Set Your Target Duration', items: [
                'Click the <strong>Properties</strong> tab in the panel on the right',
                'Change the <strong>Target Duration</strong> to your desired length',
                'Audition will intelligently rearrange the music to fit',
                'Use <strong>Edit Length</strong> slider (Short → Long) to control how much it edits',
                'Use <strong>Features</strong> slider (Timbre → Harmonic) to control what it matches',
              ], sideImg: 'images/remix-properties.png', sideImgCap: 'Remix Properties — set Target Duration and adjust Edit Length and Features sliders.' },
              { type: 'list', title: 'Using Stretch', items: [
                'Select the Stretch icon in the toolbar (time-stretch cursor)',
                'Drag the edge of any clip to make it longer or shorter',
                'Use on your FX sound clip to fit it into your imaging piece',
              ]},
              { type: 'video', youtube: '8xopxZ_zvUU', label: 'Adobe Audition Stretch in the Multitrack', note: 'Covers the Stretch tool — watch before using it on your FX clip.' },
              { type: 'list', title: 'Advanced Remix — Edit Length', items: [
                '<strong>Short</strong> — Creates shorter segments with more edit transitions. Best for songs with a lot of dynamic changes.',
                '<strong>Long</strong> — Finds the longest possible passages with the fewest transitions. Results in smoother, more seamless loops.',
                'Look for the wavy lines on the audio clip — those are the edit points Remix created.',
              ], sideImg: 'images/remix-edit-length.png', sideImgCap: 'Edit Length controls how aggressively Remix cuts the music. Short = more cuts, Long = fewer cuts.' },
              { type: 'keyterms', title: 'Advanced Remix — Features', terms: [
                { term: 'Timbre', def: 'Remix focuses on matching the beats and rhythm of the song. Use this for high-energy, tempo-driven music.' },
                { term: 'Harmonic', def: 'Remix focuses on melody and harmony to find the smoothest edit points. Use this for melodic or slower songs.' },
              ], sideImg: 'images/remix-advanced-panel.png', sideImgCap: 'The Remix properties panel — Features slider moves between Timbre (rhythm) and Harmonic (melody).' },
              { type: 'keyterms', title: 'Advanced Remix — Loop Settings', terms: [
                { term: 'Minimum Loop', def: 'The shortest segment Audition will use, in beats. Segments won\'t be cut shorter than this.' },
                { term: 'Maximum Slack', def: 'Wiggle room around your target duration. Set to 5 seconds with a 30-second target and the output could be anywhere from 25–35 seconds — Audition picks the cleanest edit point in that range.' },
              ]},
            ]
          },
          {
            id: 'reverb',
            title: 'Effects Rack — Reverb',
            duration: '1–2 classes',
            summary: 'Add Studio Reverb via the Effects Rack, then use envelopes to automate the wet/dry mix over time.',
            sections: [
              { type: 'intro', content: 'Reverb adds space and depth to audio — it makes sound feel like it\'s in a room, a hall, or an enormous space. In radio production, you\'ll use it to make station IDs and imaging elements feel bigger. The key skill is automating the reverb with envelopes so it builds over time.' },
              { type: 'list', title: 'Add Reverb via the Effects Rack', items: [
                'Open the Effects Rack panel for your track',
                'Click an empty slot → <strong>Reverb → Studio Reverb</strong>',
                'A Studio Reverb settings window will open',
                'Adjust Room Size, Decay, and Wet/Dry mix to taste',
              ], sideImg: 'images/reverb-menu.png', sideImgCap: 'Effects Rack → Reverb → Studio Reverb. Start here to add reverb to any track.' },
              { type: 'keyterms', title: 'Studio Reverb Settings', terms: [
                { term: 'Room Size', def: 'How large the simulated space is — bigger = more reverb spread' },
                { term: 'Decay', def: 'How long the reverb tail lasts after the sound ends' },
                { term: 'Early Reflections', def: 'The first bounces off walls — affects how natural it sounds' },
                { term: 'Dry', def: 'The original, unaffected signal level' },
                { term: 'Wet', def: 'How much reverb effect is applied — higher = more reverb' },
              ], sideImg: 'images/studio-reverb.png', sideImgCap: 'Studio Reverb settings — start with default and adjust Decay and Wet to hear the difference.' },
              { type: 'list', title: 'Automate Reverb with Envelopes', items: [
                'Click the > arrow next to the Read menu on your reverb track',
                'Select <strong>Show Envelopes → Studio Reverb → Wet Output Level</strong>',
                'An orange envelope line appears on your clip',
                'Add keyframes to make the reverb build up over time',
                'Start dry at the beginning — bring the wet level up toward "Louder"',
              ], sideImg: 'images/reverb-envelope.png', sideImgCap: 'Show Envelopes → Studio Reverb → Wet Output Level — draw keyframes to automate reverb over time.' },
              { type: 'list', title: 'Match Clip Loudness — Final Step', items: [
                'Select all clips in your multitrack',
                'Right-click → <strong>Match Clip Loudness</strong>',
                'This balances all your clips to the same volume before mixdown',
                'Always do this before your final export',
              ], sideImg: 'images/match-clip-loudness.png', sideImgCap: 'Right-click → Match Clip Loudness. Run this on all clips before your final mixdown.' },
            ]
          },
          {
            id: 'spectral-display',
            title: 'Spectral Frequency Display',
            duration: '1 class',
            summary: 'Use the spectral view to visually identify and remove problem sounds — beeps, hisses, and artifacts.',
            sections: [
              { type: 'intro', content: 'The Spectral Frequency Display shows your audio as a heat map — frequency over time, with color representing loudness. It\'s the fastest way to spot and fix problem sounds like beeps, mic hisses, and audio artifacts that are hard to find in a normal waveform view.' },
              { type: 'text', title: 'How to Open It', content: 'The Spectral Display is <strong>not open by default</strong>. Find it in the toolbar at the top of Audition and click to toggle it on. It opens inside the Waveform Editor below your regular waveform view.',
                sideImg: 'images/spectral-display.png', sideImgCap: 'The Spectral Frequency Display — frequency runs along the vertical axis, time runs left to right.' },
              { type: 'keyterms', title: 'Reading the Colors', terms: [
                { term: 'Dark Blue', def: 'Low amplitude — quiet sounds in that frequency range' },
                { term: 'Purple / Red', def: 'Medium amplitude — present but not dominant' },
                { term: 'Orange / Yellow', def: 'High amplitude — the loudest sounds in the display. Bright yellow = maximum intensity.' },
                { term: 'Frequency (vertical)', def: 'Low frequencies at the bottom, high frequencies at the top' },
                { term: 'Time (horizontal)', def: 'The display moves left to right, just like the waveform' },
              ], sideImg: 'images/spectral-display-labeled.png', sideImgCap: 'Bright yellow = loud. Dark blue = quiet. A loud beep shows as a sudden bright vertical stripe.' },
              { type: 'list', title: 'What to Look For', items: [
                '<strong>Beep or tone:</strong> A bright vertical stripe at one frequency — select it with the lasso tool and delete',
                '<strong>Mic hiss:</strong> A consistent band of color across the high frequencies — use Noise Reduction instead',
                '<strong>Click or pop:</strong> A sudden bright flash across all frequencies — zoom in and delete',
                '<strong>Room rumble:</strong> A persistent glow at the very bottom — use a high-pass filter to cut it',
              ]},
              { type: 'callout', label: 'Spectral + Noise Reduction', items: [
                'The Spectral Display helps you SEE problems — Noise Reduction removes them',
                'Effects → Noise Reduction / Restoration → Noise Reduction',
                'Capture a noise print from a section of silence, then apply to the full clip',
                'This is a destructive effect — do it in the Waveform Editor, on a copy of your file',
              ]},
            ]
          },
        ]
      },
    ]
  },
  live: {
    name: 'Homestead Live',
    color: '#06b6d4',
    icon: '🎬',
    units: []
  },
  yearbook: {
    name: 'Yearbook',
    color: '#34d399',
    icon: '📖',
    units: []
  },
  sports: {
    name: 'Sports Broadcasting',
    color: '#f97316',
    icon: '🏟️',
    units: []
  },
  indepth: {
    name: 'HHS In-Depth',
    color: '#3b82f6',
    icon: '🎧',
    units: []
  }
};
