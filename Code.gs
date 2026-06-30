// HHS Athletics Calendar Sync — Google Apps Script
//
// SETUP (one-time):
// 1. Go to script.google.com → New project → paste this file
// 2. Deploy → New deployment → Web app
//    Execute as: Me | Who has access: Anyone with the link
// 3. Copy the web app URL into data.js → SYNC_SCRIPT_URL
// 4. Run createAnnualTrigger() once from the editor to set up auto-sync each August 1

const SOURCE_CAL_ID = 'fd9gn9o6bq5lfvsaiqkt4gs4n1gneqc6@import.calendar.google.com';
const TARGET_CAL_ID = '2b9bdfdee65f7330d8d5d2fd1d4877c1b709289fa0b0747427f57fd62516bed5@group.calendar.google.com';

function doGet(e) {
  try {
    const result = syncAthletics();
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function syncAthletics() {
  const now = new Date();
  // School year starts in August
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const start = new Date(startYear, 7, 1);     // Aug 1
  const end   = new Date(startYear + 1, 7, 1); // Aug 1 next year

  const sourceCal = CalendarApp.getCalendarById(SOURCE_CAL_ID);
  const targetCal = CalendarApp.getCalendarById(TARGET_CAL_ID);

  if (!sourceCal) return { success: false, error: 'Source calendar not found. Make sure it is shared with this Google account.' };
  if (!targetCal) return { success: false, error: 'Target (HHS Media Events) calendar not found.' };

  const allSource = sourceCal.getEvents(start, end);

  // Keep varsity-level events; drop JV-only, practices, Flag Football, Special Events
  const varsityRe = /\(V\)|\(Boys V\)|\(Girls V\)|Varsity|\(V & JV\)/;
  const excludeRe = /\(JV\)|JV Only|JV only|JV Invite|JV invite|JV invitational|Snider JV|Riley JV|West Noble.*JV|Canterbury.*JV for HHS|Penn.*JV Only|Practice|Flag Football|Special Events/i;

  const toAdd = allSource.filter(ev => {
    const t = ev.getTitle();
    return varsityRe.test(t) && !excludeRe.test(t);
  });

  // Deduplicate against what's already in the target calendar
  const existing = targetCal.getEvents(start, end);
  const existingKeys = new Set(
    existing.map(ev => ev.getTitle() + '|' + ev.getStartTime().getTime())
  );

  let added = 0, skipped = 0;
  toAdd.forEach(ev => {
    const key = ev.getTitle() + '|' + ev.getStartTime().getTime();
    if (existingKeys.has(key)) { skipped++; return; }
    targetCal.createEvent(ev.getTitle(), ev.getStartTime(), ev.getEndTime());
    added++;
    Utilities.sleep(100); // avoid API quota bursts
  });

  return {
    success: true,
    schoolYear: startYear + '-' + (startYear + 1),
    scanned: allSource.length,
    varsity: toAdd.length,
    added,
    skipped
  };
}

// Runs every August 1 at 8am — call once from the editor after deploying
function createAnnualTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'maybeSync')
    .forEach(t => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('maybeSync')
    .timeBased()
    .onMonthDay(1)
    .atHour(8)
    .create();

  Logger.log('Annual trigger set: runs on the 1st of each month at 8am, syncs only in August.');
}

// Wrapper called by the monthly trigger — only syncs in August
function maybeSync() {
  if (new Date().getMonth() === 7) {
    syncAthletics();
  }
}
