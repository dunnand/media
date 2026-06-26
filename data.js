const RADIO_SLOTS = 10;

const LIVE_ROLES = [
  'Producer', 'Technical Director', 'Main Camera',
  'Camera 2', 'Camera 3', 'Roam 1', 'Roam 2',
  'Jumbotron', 'Director'
];

const EVENT_TYPES = {
  football:   { label: 'Football',      color: '#f59e0b' },
  basketball: { label: 'Basketball',    color: '#ef4444' },
  volleyball: { label: 'Volleyball',    color: '#8b5cf6' },
  showchoir:  { label: 'Show Choir',    color: '#10b981' },
  graduation: { label: 'Graduation',    color: '#f59e0b' },
  other:      { label: 'Special Event', color: '#6b7280' }
};

const RADIO_RESOURCES = [
  {
    title: 'FCC On-Air Rules',
    body: 'Identify your station at the top and bottom of each hour. No profanity, obscenity, or indecency on air. Music with explicit lyrics must be edited or avoided during school hours.'
  },
  {
    title: 'Mic Technique',
    body: 'Speak across the mic, not directly into it. Stay 4–6 inches away. Avoid plosives (hard P and B sounds) by angling your head slightly. Never touch or tap the mic while live.'
  },
  {
    title: 'On-Air Etiquette',
    body: 'Dead air is the enemy — always be ready to fill. Speak clearly at a moderate pace. Cue your partner before throwing to them. Never talk over music or each other.'
  }
];

const LIVE_RESOURCES = [
  {
    title: 'Pre-Show Checklist',
    body: 'Test all cameras 30 min before air. Confirm graphics are loaded and approved. Run a full audio check. All crew must be in position 15 min before air.'
  },
  {
    title: 'Graphics Standards',
    body: 'Lower thirds must use the approved font and color scheme. Score bugs update within 3 seconds of a score. All graphics must be reviewed by the TD before going live.'
  },
  {
    title: 'Director Calls',
    body: 'Camera 1 = Main Camera. Camera 2/3 = Camera 2/3. Roam = Roaming cameras. JT = Jumbotron. The TD handles switching on the Director\'s call.'
  }
];

const YEARBOOK_RESOURCES = [
  {
    title: 'Photo Standards',
    body: 'All photos must be at least 300 DPI for print. Action shots should show movement. Avoid photos where subjects\' eyes are closed or they appear unaware.'
  },
  {
    title: 'Caption Writing',
    body: 'Captions identify who, what, when, where. Lead with action, not names. Names go left to right, front to back. Always double-check spelling of names.'
  },
  {
    title: 'Deadlines',
    body: 'Missing a deadline affects the entire book. All sections must be submitted on time. If you\'re behind, tell the editor immediately — don\'t wait until the deadline.'
  }
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
