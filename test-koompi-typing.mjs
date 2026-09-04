/**
 * KOOMPI Typing — End-to-End Test Suite
 *
 * Tests the complete API lifecycle:
 *   1. Adventure Units CRUD
 *   2. Typing Lessons CRUD
 *   3. Lesson Content Items (single & bulk)
 *   4. Game Modes
 *   5. Game Session Start
 *   6. Keystroke Event logging (batch)
 *   7. Game Session Complete (triggers all post-session hooks:
 *      progress, streaks, heatmap, user statistics, achievements)
 *   8. Progress, Streaks, and Heatmap verification
 *   9. Leaderboard recomputation & query
 *
 * Run: node test-koompi-typing.mjs
 */

const BASE = 'http://localhost:5050/api/koompi-typing';

let passed = 0;
let failed = 0;

function log(label, ok, extra = '') {
  if (ok) {
    console.log(`  ✅  ${label}${extra ? ' — ' + extra : ''}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${extra ? ' — ' + extra : ''}`);
    failed++;
  }
}

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {})
  };
  const r = await fetch(`${BASE}${path}`, opts);
  const json = await r.json().catch(() => ({}));
  return { status: r.status, body: json };
}

let unitId, lessonId, nextLessonId, contentItemId, modeId, sessionId;
const testUserId = '60d5ec49f1a2b830a8a1e001'; // Mock or seeded UserAccount ObjectId

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  KOOMPI Typing — API Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. ADVENTURE UNITS
// ─────────────────────────────────────────────────────────────────────────────
console.log('📁 1. Typing Units');

{
  const res = await req('POST', '/units', {
    unitNumber: 99,
    language: 'en',
    title: 'Home Row Test Unit',
    description: 'Learn the foundational home row keys: ASDF JKL;',
    theme: 'forest_path',
    order: 99
  });

  const ok = res.status === 201 || (res.status === 500 && res.body.message?.includes('duplicate'));
  log('POST /units', ok, `status ${res.status}`);
  unitId = res.body.data?._id;

  if (!unitId) {
    const getRes = await req('GET', '/units?language=en');
    const existing = getRes.body.data?.find(u => u.unitNumber === 99);
    unitId = existing?._id;
  }
}

{
  const { status, body } = await req('GET', '/units?language=en');
  log('GET /units?language=en', status === 200 && body.success, `count=${body.count}`);
}

{
  const { status, body } = await req('GET', `/units/${unitId}`);
  log('GET /units/:id', status === 200 && body.data?._id === unitId);
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TYPING LESSONS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📖 2. Typing Lessons');

{
  // Create Lesson 1
  const res = await req('POST', '/lessons', {
    unitId,
    lessonNumber: 1,
    language: 'en',
    lessonType: 'letters',
    title: 'Keys F and J',
    targetKeys: ['f', 'j'],
    difficulty: 1,
    passThreshold: { minAccuracyPct: 90, minWpm: 15 },
    xpReward: 30,
    order: 1
  });

  const ok = res.status === 201 || (res.status === 500 && res.body.message?.includes('duplicate'));
  log('POST /lessons (Lesson 1)', ok, `status ${res.status}`);
  lessonId = res.body.data?._id;

  if (!lessonId) {
    const list = await req('GET', `/lessons?unitId=${unitId}`);
    lessonId = list.body.data?.find(l => l.lessonNumber === 1)?._id;
  }
}

{
  // Create Lesson 2 (to test unlock progression)
  const res = await req('POST', '/lessons', {
    unitId,
    lessonNumber: 2,
    language: 'en',
    lessonType: 'letters',
    title: 'Keys D and K',
    targetKeys: ['d', 'k'],
    difficulty: 1,
    passThreshold: { minAccuracyPct: 90, minWpm: 15 },
    xpReward: 30,
    order: 2
  });

  const ok = res.status === 201 || (res.status === 500 && res.body.message?.includes('duplicate'));
  log('POST /lessons (Lesson 2 for progression)', ok, `status ${res.status}`);
  nextLessonId = res.body.data?._id;

  if (!nextLessonId) {
    const list = await req('GET', `/lessons?unitId=${unitId}`);
    nextLessonId = list.body.data?.find(l => l.lessonNumber === 2)?._id;
  }
}

{
  const { status, body } = await req('GET', `/lessons?unitId=${unitId}`);
  log('GET /lessons?unitId=...', status === 200 && body.success, `count=${body.count}`);
}

{
  const { status, body } = await req('GET', `/lessons/${lessonId}`);
  log('GET /lessons/:id', status === 200 && body.data?.title === 'Keys F and J');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LESSON CONTENT ITEMS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📝 3. Lesson Content Items');

{
  // Single insert
  const res = await req('POST', '/content-items', {
    lessonId,
    itemType: 'character',
    language: 'en',
    text: 'f j f j',
    order: 1
  });
  log('POST /content-items (single)', res.status === 201 && res.body.success);
  contentItemId = res.body.data?._id;
}

{
  // Bulk insert
  const res = await req('POST', '/content-items', {
    items: [
      { lessonId, itemType: 'character', language: 'en', text: 'jf jf ff jj', order: 2 },
      { lessonId, itemType: 'word', language: 'en', text: 'fjf jfj', order: 3 }
    ]
  });
  log('POST /content-items (bulk insert)', res.status === 201 && res.body.count === 2);
}

{
  const { status, body } = await req('GET', `/content-items?lessonId=${lessonId}`);
  log('GET /content-items?lessonId=...', status === 200 && body.count >= 3);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. GAME MODES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🎮 4. Game Modes');

{
  const res = await req('POST', '/modes', {
    modeKey: 'lesson',
    name: 'Lesson Adventure Mode',
    description: 'Guided sequential lessons on the adventure map',
    affectsLeaderboard: true
  });
  const ok = res.status === 201 || (res.status === 500 && res.body.message?.includes('duplicate'));
  log('POST /modes', ok, `status ${res.status}`);
  modeId = res.body.data?._id;
}

{
  const { status, body } = await req('GET', '/modes');
  log('GET /modes', status === 200 && body.success);
}

{
  const { status, body } = await req('GET', '/modes/lesson');
  log('GET /modes/:modeKey', status === 200 && body.data?.modeKey === 'lesson');
  if (!modeId) modeId = body.data?._id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GAME SESSIONS & WRITE PATH
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n⏱️  5. Game Sessions');

{
  // Start session
  const res = await req('POST', '/sessions', {
    userAccountId: testUserId,
    lessonId,
    gameModeId: modeId,
    language: 'en',
    deviceInfo: { keyboardLayout: 'qwerty_en', inputMethod: 'physical_keyboard' }
  });

  log('POST /sessions (startSession)', res.status === 201 && res.body.success);
  sessionId = res.body.data?._id;
}

{
  // Stream batch keystrokes
  const res = await req('POST', '/keystrokes/batch', {
    sessionId,
    events: [
      { charIndex: 0, expectedChar: 'f', typedChar: 'f', correct: true, keyCode: 'KeyF', timeSinceLastKeyMs: 140 },
      { charIndex: 1, expectedChar: ' ', typedChar: ' ', correct: true, keyCode: 'Space', timeSinceLastKeyMs: 120 },
      { charIndex: 2, expectedChar: 'j', typedChar: 'j', correct: true, keyCode: 'KeyJ', timeSinceLastKeyMs: 130 },
      { charIndex: 3, expectedChar: ' ', typedChar: ' ', correct: true, keyCode: 'Space', timeSinceLastKeyMs: 110 }
    ]
  });

  log('POST /keystrokes/batch', res.status === 201 && res.body.count === 4);
}

{
  // Retrieve recorded keystrokes
  const { status, body } = await req('GET', `/keystrokes/session/${sessionId}`);
  log('GET /keystrokes/session/:sessionId', status === 200 && body.count === 4);
}

{
  // Complete session & trigger all post-session hooks
  const res = await req('PATCH', `/sessions/${sessionId}/complete`, {
    durationMs: 32000,
    charactersTyped: 120,
    charactersCorrect: 116,
    charactersIncorrect: 4,
    accuracyPct: 96.7,
    wpm: 45,
    netWpm: 43.5,
    backspaceCount: 2,
    passed: true,
    starsEarned: 3,
    xpEarned: 30,
    keyStats: {
      f: { attempts: 60, correct: 58, avgTimeMs: 130 },
      j: { attempts: 60, correct: 58, avgTimeMs: 125 }
    }
  });

  const ok = res.status === 200 && res.body.success;
  log('PATCH /sessions/:id/complete', ok);
  if (ok) {
    const { postSessionResults } = res.body;
    log('  ↳ UserProgress updated', !!postSessionResults?.progressUpdated);
    log('  ↳ Next lesson unlocked', !!postSessionResults?.nextLessonUnlocked);
    log('  ↳ Daily streak contributed', postSessionResults?.streak?.currentStreakDays >= 1);
  }
}

{
  const { status, body } = await req('GET', `/sessions/${sessionId}`);
  log('GET /sessions/:id', status === 200 && body.data?._id === sessionId && body.data?.passed === true);
}

{
  const { status, body } = await req('GET', `/sessions/user/${testUserId}`);
  log('GET /sessions/user/:userId', status === 200 && body.count >= 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. USER PROGRESS & UNLOCK STATUS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📊 6. User Progress');

{
  const { status, body } = await req('GET', `/progress/user/${testUserId}`);
  log('GET /progress/user/:userId', status === 200 && body.count >= 1);
}

{
  const { status, body } = await req('GET', `/progress/user/${testUserId}/lesson/${lessonId}`);
  log('GET /progress/user/:userId/lesson/:lessonId', status === 200 && body.data?.bestStars === 3);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. USER STREAKS & FREEZES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🔥 7. User Streaks');

{
  const { status, body } = await req('GET', `/streaks/user/${testUserId}`);
  log('GET /streaks/user/:userId', status === 200 && body.data?.currentStreakDays >= 1);
}

{
  const { status, body } = await req('POST', `/streaks/user/${testUserId}/add-freeze`, { count: 2 });
  log('POST /streaks/user/:userId/add-freeze', status === 200 && body.data?.streakFreezesAvailable >= 2);
}

{
  const { status, body } = await req('POST', `/streaks/user/${testUserId}/freeze`);
  log('POST /streaks/user/:userId/freeze', status === 200 && body.success);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. KEYBOARD HEATMAP
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n⌨️  8. Keyboard Heatmap');

{
  const { status, body } = await req('GET', `/heatmap/user/${testUserId}?language=en`);
  const hasF = body.data?.keyStats?.f?.attempts > 0 || body.data?.keyStats?.['f']?.attempts > 0;
  log('GET /heatmap/user/:userId?language=en', status === 200 && body.success);
}

{
  const { status, body } = await req('PUT', `/heatmap/user/${testUserId}`, {
    language: 'en',
    keyStats: {
      k: { attempts: 20, correct: 19, avgTimeMs: 140 }
    }
  });
  log('PUT /heatmap/user/:userId', status === 200 && body.success);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. LEADERBOARDS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n🏆 9. Leaderboards');

{
  const res = await req('POST', '/leaderboards/recompute', {
    boardType: 'global'
  });
  log('POST /leaderboards/recompute', res.status === 200 && res.body.success);
}

{
  const { status, body } = await req('GET', '/leaderboards?boardType=global');
  log('GET /leaderboards?boardType=global', status === 200 && body.success);
}

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  Tests completed: ${passed} passed, ${failed} failed.`);
console.log('═══════════════════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
