// Weekly Accomplishments filing — standalone copy for the form OWNER's account.
//
// WHY THIS EXISTS: form uploads are owned by the Form's owner, so only that
// account can reliably move them. This file runs under the owner's account
// (bound to the Form: Form → ⋮ → Script editor), leaving the main Code.gs
// project (calendar sync, show plans, graphics list) untouched.
//
// SETUP (once, signed in as the Form owner):
//   1. Form → ⋮ → Script editor → paste this whole file over the default code → Save.
//   2. Run setupWeeklyFormTrigger() → approve permissions.
//   3. In the OLD Apps Script project (the one behind SYNC_SCRIPT_URL) open
//      Triggers and delete the onWeeklyFormSubmit trigger, so responses aren't
//      filed twice.
//
// KEEP IN SYNC: WEEKLY_FOLDERS below is a copy of the list in Code.gs and
// YB_WEEKLY_FOLDERS in script.js. When second-semester folderIds get filled in
// (createFutureWeeklyFolders), paste the new IDs here too.
// This account must also have edit access to those weekly folders.

const WEEKLY_FOLDERS = [
  { label: 'Week 1 (Aug 5–Aug 7)',   start: '2026-08-05', end: '2026-08-07', folderId: '1TFPzjcReUZufpX1POtZkZC-yEV6PqUey' },
  { label: 'Week 2 (Aug 10–Aug 14)', start: '2026-08-10', end: '2026-08-14', folderId: '1M_RJN-LIkEIHQ9NQrwbDdc1iCYwE8PV1' },
  { label: 'Week 3 (Aug 17–Aug 21)', start: '2026-08-17', end: '2026-08-21', folderId: '1T4EcB8bmNZptz_E67Z40sxeFWZ-TM5a6' },
  { label: 'Week 4 (Aug 24–Aug 28)', start: '2026-08-24', end: '2026-08-28', folderId: '1oP6jKxlIaDjrDdnTpgQtJre7ycJqFvD-' },
  { label: 'Week 5 (Aug 31–Sep 4)',  start: '2026-08-31', end: '2026-09-04', folderId: '1CKIe2YlLq3hAbo2FAi8S3Xb9Aho9Uckg' },
  { label: 'Week 6 (Sep 7–Sep 11)',  start: '2026-09-07', end: '2026-09-11', folderId: '1C0F8-8EZ_7ALXGvZTXOVOzzh5q8S_WCA' },
  { label: 'Week 7 (Sep 14–Sep 18)', start: '2026-09-14', end: '2026-09-18', folderId: '1fKgRUkC_0fsGSXMZ3tn8WoDmotDJdOsK' },
  { label: 'Week 8 (Sep 21–Sep 25)', start: '2026-09-21', end: '2026-09-25', folderId: '1_3AWr3Cr5uFhCDAcpxXxoYH9z-UjqbJi' },
  { label: 'Week 9 (Sep 28–Oct 2)',  start: '2026-09-28', end: '2026-10-02', folderId: '1Y_7GE2ZTqDm8XbkghcJe33Bx6bWQZ0Tz' },
  { label: 'Week 10 (Oct 5–Oct 9)',  start: '2026-10-05', end: '2026-10-09', folderId: '1wEPasRKeLdHA06an_v1ExlM9wemmv2AW' },
  { label: 'Week 12 (Oct 19–Oct 23)', start: '2026-10-19', end: '2026-10-23', folderId: '16y09Qmns3c725dTFkJirmFwrXr0ruyB9' },
  { label: 'Week 13 (Oct 26–Oct 30)', start: '2026-10-26', end: '2026-10-30', folderId: '1zDYdNIjkiYIEKDZTnwcp0DU77Hovs7gx' },
  { label: 'Week 14 (Nov 2–Nov 6)',   start: '2026-11-02', end: '2026-11-06', folderId: '1LWvvryST_eyG1jfwOYpwdhjNruMcsTxH' },
  { label: 'Week 15 (Nov 9–Nov 13)',  start: '2026-11-09', end: '2026-11-13', folderId: '1MBs3AbzuIpaFb7j-IaSa2Ba2sIV7D_J4' },
  { label: 'Week 16 (Nov 16–Nov 20)', start: '2026-11-16', end: '2026-11-20', folderId: '1hCA8bSOxF8RR9_MGIvzDaJnBm3GGOhBb' },
  { label: 'Week 17 (Nov 23–Nov 27)', start: '2026-11-23', end: '2026-11-27', folderId: '1oQjI1xUxuafG0dpTXHp8z9j6ag734GvF' },
  { label: 'Week 18 (Nov 30–Dec 4)',  start: '2026-11-30', end: '2026-12-04', folderId: '1EBoCUbTzGdLNkFC9xUpnqV329AIDclcD' },
  { label: 'Week 19 (Dec 7–Dec 11)',  start: '2026-12-07', end: '2026-12-11', folderId: '1lE-hTcnTvAzFOvK5jUoMVqTDNeyqG6qj' },
  { label: 'Week 20 (Dec 14–Dec 18)', start: '2026-12-14', end: '2026-12-18', folderId: '1SYJo0oIYb3Ut-ZQ7-IStIFyhe21yzLYA' },
  // Second semester — run createFutureWeeklyFolders() to fill these in.
  { label: 'Week 21 (Jan 5–Jan 8)',   start: '2027-01-05', end: '2027-01-08', folderId: '' },
  { label: 'Week 22 (Jan 11–Jan 15)', start: '2027-01-11', end: '2027-01-15', folderId: '' },
  { label: 'Week 23 (Jan 18–Jan 22)', start: '2027-01-18', end: '2027-01-22', folderId: '' },
  { label: 'Week 24 (Jan 25–Jan 29)', start: '2027-01-25', end: '2027-01-29', folderId: '' },
  { label: 'Week 25 (Feb 1–Feb 5)',   start: '2027-02-01', end: '2027-02-05', folderId: '' },
  { label: 'Week 26 (Feb 8–Feb 12)',  start: '2027-02-08', end: '2027-02-12', folderId: '' },
  { label: 'Week 27 (Feb 15–Feb 19)', start: '2027-02-15', end: '2027-02-19', folderId: '' },
  { label: 'Week 28 (Feb 22–Feb 26)', start: '2027-02-22', end: '2027-02-26', folderId: '' },
  { label: 'Week 29 (Mar 1–Mar 5)',   start: '2027-03-01', end: '2027-03-05', folderId: '' },
  { label: 'Week 30 (Mar 8–Mar 12)',  start: '2027-03-08', end: '2027-03-12', folderId: '' },
  { label: 'Week 31 (Mar 15–Mar 19)', start: '2027-03-15', end: '2027-03-19', folderId: '' },
  { label: 'Week 32 (Mar 22–Mar 26)', start: '2027-03-22', end: '2027-03-26', folderId: '' },
  { label: 'Week 33 (Mar 29–Apr 2)',  start: '2027-03-29', end: '2027-04-02', folderId: '' },
  { label: 'Week 34 (Apr 5–Apr 9)',   start: '2027-04-05', end: '2027-04-09', folderId: '' },
  { label: 'Week 35 (Apr 12–Apr 16)', start: '2027-04-12', end: '2027-04-16', folderId: '' },
  { label: 'Week 36 (Apr 19–Apr 23)', start: '2027-04-19', end: '2027-04-23', folderId: '' },
  { label: 'Week 37 (Apr 26–Apr 30)', start: '2027-04-26', end: '2027-04-30', folderId: '' },
  { label: 'Week 38 (May 3–May 7)',   start: '2027-05-03', end: '2027-05-07', folderId: '' },
  { label: 'Week 39 (May 10–May 14)', start: '2027-05-10', end: '2027-05-14', folderId: '' },
  { label: 'Week 40 (May 17–May 21)', start: '2027-05-17', end: '2027-05-21', folderId: '' },
  { label: 'Week 41 (May 24–May 28)', start: '2027-05-24', end: '2027-05-28', folderId: '' },
];

function weeklyFolderForDate(dateStr) {
  const current = WEEKLY_FOLDERS.find(w => dateStr >= w.start && dateStr <= w.end);
  if (current) return current.folderId;
  const upcoming = WEEKLY_FOLDERS.find(w => w.start > dateStr);
  if (upcoming) return upcoming.folderId;
  if (dateStr < WEEKLY_FOLDERS[0].start) return WEEKLY_FOLDERS[0].folderId;
  return WEEKLY_FOLDERS[WEEKLY_FOLDERS.length - 1].folderId;
}

function setupWeeklyFormTrigger() {
  const form = FormApp.getActiveForm();
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'onWeeklyFormSubmit')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('onWeeklyFormSubmit').forForm(form).onFormSubmit().create();
  Logger.log('Trigger attached to: ' + form.getTitle());
}

function onWeeklyFormSubmit(e) {
  const answers = {};
  const uploadIds = []; // file-upload questions return an array of Drive file IDs
  e.response.getItemResponses().forEach(item => {
    if (item.getItem().getType() === FormApp.ItemType.FILE_UPLOAD) {
      [].concat(item.getResponse() || []).forEach(id => uploadIds.push(id));
      return;
    }
    answers[item.getItem().getTitle()] = item.getResponse();
  });

  const name = answers['First and Last Name'] || 'Unknown Student';
  const work = answers['What did you accomplish this week?'] || '';
  const link = answers['Link to photos or work (optional)'] || '';

  const tz = 'America/Indiana/Indianapolis';
  const todayStr   = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
  const dateLabel  = Utilities.formatDate(new Date(), tz, 'MMM d, yyyy');
  const folder     = DriveApp.getFolderById(weeklyFolderForDate(todayStr));

  const doc = DocumentApp.create(`${name} — ${dateLabel}`);
  const body = doc.getBody();
  body.appendParagraph(`${name} — ${dateLabel}`).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('What I accomplished this week:');
  body.appendParagraph(work);
  if (link) body.appendParagraph('Link: ' + link);

  // Move uploaded files into the week's folder alongside the Doc. If a file can't
  // be moved (owned by the Form owner and not shared with this script's account),
  // leave it where it is and link it from the Doc so it's never lost.
  if (uploadIds.length) try {
    body.appendParagraph('Uploaded files:');
    uploadIds.forEach(id => {
      let file = null, why = '';
      try { file = DriveApp.getFileById(id); } catch (err) { why = String(err); }
      if (!file) { body.appendParagraph('Could not move this upload (' + why + ') — open it here: https://drive.google.com/file/d/' + id + '/view'); return; }
      try { file.moveTo(folder); } catch (err) { body.appendParagraph('(left in place: ' + String(err) + ')'); }
      body.appendParagraph(file.getName() + ' — ' + file.getUrl());
    });
  } catch (err) { body.appendParagraph('(upload handling failed: ' + String(err) + ')'); }
  doc.saveAndClose();

  DriveApp.getFileById(doc.getId()).moveTo(folder);
}
