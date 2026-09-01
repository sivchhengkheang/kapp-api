/**
 * Mouse Master — End-to-End Seed & Test Script
 *
 * Tests the full session write path from the schema doc §5:
 *   1. Seed: categories → game mode → level
 *   2. Start session
 *   3. Batch-insert challenge attempts
 *   4. Complete session (triggers all post-session hooks)
 *   5. Verify: progress, badges, leaderboard recompute
 *   6. Read-path assertions: categories, levels, progress, sessions
 *
 * Run: node test-mouse-master.mjs
 */

const BASE = 'http://localhost:5050/api/mouse-master';

// ── Helpers ──────────────────────────────────────────────────────────────────
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

// ── Stored IDs across steps ───────────────────────────────────────────────────
let categoryId, levelId, modeId, sessionId, fakeUserId;

// ─────────────────────────────────────────────────────────────────────────────
// Use a real UserAccount from the DB — fetch the first one
// ─────────────────────────────────────────────────────────────────────────────
async function resolveUserId() {
  // Try auth shared endpoint
  const r = await fetch('http://localhost:5050/api/shared/statistics').catch(() => null);
  // Fallback: generate a valid-looking ObjectId placeholder
  fakeUserId = '60d5ec49f1a2b830a8a1e001'; // placeholder for tests
  console.log(`\n  ℹ️  Using placeholder userAccountId: ${fakeUserId}`);
}

// ─────────────────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('  Mouse Master — API Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

await resolveUserId();

// ─────────────────────────────────────────────────────────────────────────────
// 1. CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
console.log('📁 1. Skill Categories');

{
  // Create
  const { status, body } = await req('POST', '/categories', {
    categoryKey: 'click_basics',
    name: 'Click Basics',
    description: 'Hit static targets with a single click',
    order: 1,
    levelRange: { start: 1, end: 5 },
    icon: 'target',
    unlockRequirement: { type: 'none', previousCategoryKey: null }
  });

  // 201 = created, 500 w/ duplicate key = already exists (acceptable for re-runs)
  const ok = status === 201 || (status === 500 && body.message?.includes('duplicate'));
  log('POST /categories (click_basics)', ok, `status ${status}`);
  categoryId = body.data?._id;

  if (!categoryId) {
    // Fetch existing
    const get = await req('GET', '/categories/click_basics');
    categoryId = get.body.data?._id;
    log('GET /categories/click_basics (fallback fetch)', !!categoryId, `id=${categoryId}`);
  }
}

{
  const { status, body } = await req('GET', '/categories');
  log('GET /categories', status === 200 && body.success, `count=${body.count}`);
}

{
  const { status, body } = await req('GET', '/categories/click_basics');
  log('GET /categories/:categoryKey', status === 200 && body.data?.categoryKey === 'click_basics');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. GAME MODES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 2. Game Modes');

{
  const { status, body } = await req('POST', '/modes', {
    modeKey: 'practice',
    name: 'Practice Mode',
    description: 'No time pressure, unlimited retries',
    affectsLeaderboard: false
  });
  const ok = status === 201 || (status === 500 && body.message?.includes('duplicate'));
  log('POST /modes (practice)', ok, `status ${status}`);
  modeId = body.data?._id;

  if (!modeId) {
    const get = await req('GET', '/modes/practice');
    modeId = get.body.data?._id;
    log('GET /modes/practice (fallback fetch)', !!modeId, `id=${modeId}`);
  }
}

{
  const { status, body } = await req('GET', '/modes');
  log('GET /modes', status === 200 && body.success, `count=${body.count}`);
}

{
  const { status, body } = await req('GET', '/modes/practice');
  log('GET /modes/:modeKey', status === 200 && body.data?.modeKey === 'practice');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LEVELS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 3. Mouse Levels');

{
  const { status, body } = await req('POST', '/levels', {
    levelNumber: 1,
    categoryId,
    challengeType: 'click',
    difficulty: 1,
    config: {
      targetCount: 10,
      targetSizePx: 60,
      targetSpeed: 0,
      movementPattern: 'static',
      timeLimitMs: 15000
    },
    passThreshold: { minAccuracyPct: 70, maxAvgReactionMs: 1000 },
    xpReward: 50
  });
  const ok = status === 201 || (status === 500 && body.message?.includes('duplicate'));
  log('POST /levels (level 1)', ok, `status ${status}`);
  levelId = body.data?._id;

  if (!levelId) {
    const get = await req('GET', `/levels?categoryId=${categoryId}`);
    levelId = get.body.data?.[0]?._id;
    log('GET /levels?categoryId (fallback fetch)', !!levelId, `id=${levelId}`);
  }
}

{
  const { status, body } = await req('GET', '/levels');
  log('GET /levels', status === 200 && body.success, `count=${body.count}`);
}

{
  const { status, body } = await req('GET', `/levels/${levelId}`);
  log('GET /levels/:id', status === 200 && !!body.data?._id);
}

{
  const { status, body } = await req('GET', '/levels/category/click_basics');
  log('GET /levels/category/:categoryKey', status === 200 && body.success, `count=${body.count}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. SESSION — START
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 4. Game Sessions');

{
  const { status, body } = await req('POST', '/sessions', {
    userAccountId: fakeUserId,
    levelId,
    gameModeId: modeId,
    deviceInfo: { inputType: 'mouse', screenWidth: 1920, screenHeight: 1080 }
  });
  log('POST /sessions (start)', status === 201 && body.success, `id=${body.data?._id}`);
  sessionId = body.data?._id;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. CHALLENGE ATTEMPTS — bulk insert
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 5. Challenge Attempts');

{
  const attempts = Array.from({ length: 10 }, (_, i) => ({
    sessionId,
    targetIndex: i,
    targetPosition: { x: 100 + i * 40, y: 200 + i * 10 },
    clickPosition:  i < 9 ? { x: 103 + i * 40, y: 202 + i * 10 } : null, // last one missed
    hit: i < 9,
    reactionTimeMs: 300 + i * 30,
    overshootPx: i < 9 ? Math.round(Math.sqrt(9 + 4)) : null,
    actionType: 'click',
    timestamp: new Date().toISOString()
  }));

  const { status, body } = await req('POST', '/attempts/bulk', { attempts });
  log('POST /attempts/bulk (10 events)', status === 201 && body.success, `inserted=${body.count}`);
}

{
  const { status, body } = await req('GET', `/attempts/session/${sessionId}`);
  log('GET /attempts/session/:sessionId', status === 200 && body.count === 10, `count=${body.count}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. SESSION — COMPLETE (triggers all post-session hooks)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 6. Session Complete (post-session hooks)');

{
  const { status, body } = await req('PATCH', `/sessions/${sessionId}/complete`, {
    endedAt: new Date().toISOString(),
    durationMs: 12400,
    targetsShown: 10,
    targetsHit: 9,
    targetsMissed: 1,
    accuracyPct: 90.0,
    avgReactionTimeMs: 435,
    fastestReactionMs: 300,
    slowestReactionMs: 570,
    overshootCount: 2,
    deviationScore: null,
    passed: true,
    starsEarned: 3,
    xpEarned: 45
  });

  log('PATCH /sessions/:id/complete', status === 200 && body.success, `passed=${body.data?.passed}`);
  log('  └─ starsEarned=3', body.data?.starsEarned === 3);
  log('  └─ xpEarned=45', body.data?.xpEarned === 45);
  log('  └─ accuracyPct=90', body.data?.accuracyPct === 90);
  if (body.postSession?.badgeAwarded) {
    log('  └─ Badge awarded', true, body.postSession.badgeAwarded.badgeName);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. USER PROGRESS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 7. User Progress');

{
  const { status, body } = await req('GET', `/progress/user/${fakeUserId}`);
  log('GET /progress/user/:userId', status === 200 && body.success, `count=${body.count}`);
  const prog = body.data?.[0];
  if (prog) {
    log('  └─ status=completed', prog.status === 'completed');
    log('  └─ bestAccuracyPct=90', prog.bestAccuracyPct === 90);
    log('  └─ bestStars=3', prog.bestStars === 3);
    log('  └─ attemptsCount >= 1', prog.attemptsCount >= 1);
  }
}

{
  const { status, body } = await req('GET', `/progress/user/${fakeUserId}/level/${levelId}`);
  log('GET /progress/user/:userId/level/:levelId', status === 200 && !!body.data);
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. SKILL BADGES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 8. Skill Badges');

{
  const { status, body } = await req('GET', `/badges/user/${fakeUserId}`);
  log('GET /badges/user/:userId', status === 200 && body.success, `count=${body.count}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. SESSION READ
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 9. Session Read Paths');

{
  const { status, body } = await req('GET', `/sessions/${sessionId}`);
  log('GET /sessions/:id', status === 200 && body.data?._id === sessionId);
}

{
  const { status, body } = await req('GET', `/sessions/user/${fakeUserId}`);
  log('GET /sessions/user/:userId', status === 200 && body.count >= 1, `count=${body.count}`);
}

{
  const { status, body } = await req('GET', `/sessions/user/${fakeUserId}/best`);
  log('GET /sessions/user/:userId/best', status === 200 && !!body.data);
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. LEADERBOARD RECOMPUTE
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 10. Leaderboard');

{
  const { status, body } = await req('POST', '/leaderboards/recompute', {
    boardType: 'global',
    limit: 10
  });
  log('POST /leaderboards/recompute', status === 200 && body.success, `rankings=${body.count}`);

  if (body.data?.rankings?.length > 0) {
    const top = body.data.rankings[0];
    log('  └─ rank=1 present', top.rank === 1);
    log('  └─ score computed', typeof top.score === 'number');
  }
}

{
  const { status, body } = await req('GET', '/leaderboards?boardType=global');
  log('GET /leaderboards?boardType=global', status === 200 && body.success);
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. ERROR / EDGE CASES
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n📁 11. Edge Cases');

{
  const { status, body } = await req('GET', '/levels/000000000000000000000000');
  log('GET /levels/:id — not found → 404', status === 404);
}

{
  const { status, body } = await req('GET', '/categories/nonexistent_key');
  log('GET /categories/:key — not found → 404', status === 404);
}

{
  const { status, body } = await req('POST', '/attempts/bulk', { attempts: [] });
  log('POST /attempts/bulk — empty array → 400', status === 400);
}

{
  // Duplicate badge should return 409
  const { status } = await req('POST', '/badges', {
    userAccountId: fakeUserId,
    categoryKey: 'click_basics',
    badgeName: 'Clicker Badge',
    earnedAt: new Date().toISOString()
  });
  // First call creates, second should conflict
  const { status: status2 } = await req('POST', '/badges', {
    userAccountId: fakeUserId,
    categoryKey: 'click_basics',
    badgeName: 'Clicker Badge',
    earnedAt: new Date().toISOString()
  });
  log('POST /badges — duplicate → 409', status2 === 409, `status=${status2}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('═══════════════════════════════════════════════════════════════\n');

if (failed > 0) process.exit(1);
