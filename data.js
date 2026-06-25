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
