const admin      = require('firebase-admin');
const nodemailer = require('nodemailer');

// ── Init ──────────────────────────────────────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const FROM_EMAIL = process.env.FROM_EMAIL;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: FROM_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ── Crew call helper (mirrors front-end logic) ────────────────
const CREW_CALL_MINS = { basketball_boys: 75, basketball_girls: 75 };
const CREW_CALL_DEFAULT_MINS = 90;

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

function fmtDate(dateStr) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

// ── Email builder ─────────────────────────────────────────────
function buildEmail(student, b) {
  const crewCall     = computeCrewCall(b.gameTime, b.type);
  const isBasketball = b.type === 'basketball_boys' || b.type === 'basketball_girls';
  const offsetMins   = CREW_CALL_MINS[b.type] ?? CREW_CALL_DEFAULT_MINS;
  const hasLocation  = b.notes && b.notes !== 'TBD — time to be announced';

  const text = [
    `Hi ${student.studentName},`,
    ``,
    `Reminder: you are signed up to crew the following broadcast TOMORROW.`,
    ``,
    `Event:      ${b.title}`,
    `Date:       ${fmtDate(b.date)}`,
    b.gameTime ? `Game Time:  ${b.gameTime}` : null,
    crewCall   ? `Crew Call:  ${crewCall}  ← BE HERE` : null,
    hasLocation ? `Location:   ${b.notes}` : null,
    ``,
    crewCall
      ? `Arrive at ${crewCall}. Eat in the classroom first (${offsetMins} min before ` +
        `${isBasketball ? 'tip-off' : 'start'}), then set up for the broadcast.`
      : null,
    ``,
    `See you there!`,
    `— Homestead Live`,
  ].filter(l => l !== null).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:20px;background:#0d0d0d;font-family:-apple-system,sans-serif">
      <div style="max-width:480px;margin:0 auto">
        <div style="background:#111;border-radius:14px;overflow:hidden;border:1px solid #222">
          <div style="background:#06b6d4;padding:16px 24px">
            <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.1em;color:rgba(0,0,0,0.6);text-transform:uppercase">Homestead Live</div>
            <div style="font-size:1.25rem;font-weight:900;color:#000;margin-top:4px">Tomorrow: ${b.title}</div>
            <div style="font-size:0.85rem;color:rgba(0,0,0,0.7);margin-top:4px">${fmtDate(b.date)}</div>
          </div>
          <div style="padding:24px">
            ${crewCall ? `
            <div style="display:flex;background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:20px;border:1px solid #2a2a2a">
              <div style="flex:1;padding:16px;text-align:center;border-right:1px solid #2a2a2a">
                <div style="font-size:1.8rem;font-weight:900;color:#06b6d4;line-height:1">${crewCall}</div>
                <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;color:#666;text-transform:uppercase;margin-top:6px">Crew Call</div>
              </div>
              ${b.gameTime ? `
              <div style="flex:1;padding:16px;text-align:center">
                <div style="font-size:1.8rem;font-weight:900;color:#fff;line-height:1">${b.gameTime}</div>
                <div style="font-size:0.65rem;font-weight:700;letter-spacing:0.08em;color:#666;text-transform:uppercase;margin-top:6px">Game Time</div>
              </div>` : ''}
            </div>` : ''}
            <p style="color:#ccc;line-height:1.6;margin:0 0 12px">
              Hi <strong style="color:#fff">${student.studentName}</strong> — you're on crew for tomorrow's broadcast.
              ${crewCall ? `Arrive by <strong style="color:#06b6d4">${crewCall}</strong>. Eat in the classroom first (${offsetMins} min before ${isBasketball ? 'tip-off' : 'start'}), then set up.` : ''}
            </p>
            ${hasLocation ? `<p style="color:#888;font-size:0.85rem;margin:0 0 12px">&#128205; ${b.notes}</p>` : ''}
            <hr style="border:none;border-top:1px solid #222;margin:20px 0">
            <p style="color:#444;font-size:0.75rem;margin:0">You received this because you signed up on Homestead Media. Questions? See your teacher.</p>
          </div>
        </div>
      </div>
    </body>
    </html>`;

  return { to: student.email, subject: `Tomorrow — ${b.title}`, text, html };
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  console.log(`Checking broadcasts for ${tomorrowStr}...`);

  const broadcastsSnap = await db.collection('hm_broadcasts')
    .where('date', '==', tomorrowStr)
    .get();

  if (broadcastsSnap.empty) {
    console.log('No broadcasts tomorrow. Nothing to send.');
    return;
  }

  let totalSent = 0;

  for (const doc of broadcastsSnap.docs) {
    const b = { id: doc.id, ...doc.data() };
    console.log(`\nBroadcast: ${b.title}`);

    const availSnap = await db.collection('hm_availability')
      .where('broadcastId', '==', b.id)
      .get();

    const students = availSnap.docs
      .map(d => d.data())
      .filter(d => d.email && d.studentName);

    if (!students.length) {
      console.log('  No students with email addresses signed up.');
      continue;
    }

    for (const student of students) {
      const msg = buildEmail(student, b);
      try {
        await transporter.sendMail({
          from: `"Homestead Live" <${FROM_EMAIL}>`,
          to:      msg.to,
          subject: msg.subject,
          text:    msg.text,
          html:    msg.html,
        });
        console.log(`  ✓ ${student.studentName} → ${student.email}`);
        totalSent++;
      } catch (err) {
        console.error(`  ✗ ${student.email}: ${err.message}`);
      }
    }
  }

  console.log(`\nDone. ${totalSent} email(s) sent.`);
}

main().catch(err => { console.error(err); process.exit(1); });
