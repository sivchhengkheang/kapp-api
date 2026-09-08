/**
 * ════════════════════════════════════════════════════════════════════
 *  KAPP — All-Games API Test Suite
 *
 *  Covers all 7 games from the API guides:
 *    1. Dragon Drop       — /api/dragon-drop
 *    2. KOOMPI Typing     — /api/koompi-typing
 *    3. Link Number       — /api/link-number
 *    4. Mouse Master      — /api/mouse-master
 *    5. Robot Brainiac    — /api/robot-brainiac
 *    6. Typing Code       — /api/typing-code
 *    7. Typing Math       — /api/typing-math
 *
 *  Run:
 *    node test-all-games.mjs                      (all games)
 *    node test-all-games.mjs --game dragon-drop   (single game)
 *    node test-all-games.mjs --verbose            (show response bodies on failure)
 *
 *  Base URL:  http://localhost:5050
 * ════════════════════════════════════════════════════════════════════
 */

const BASE_PORT = process.env.PORT || 5050;
const BASE_URL  = `http://localhost:${BASE_PORT}`;

const VERBOSE     = process.argv.includes('--verbose');
const GAME_FILTER = (() => {
  const idx = process.argv.indexOf('--game');
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

// ─── Test Harness ─────────────────────────────────────────────────────────────

let passed   = 0;
let failed   = 0;
const failures = [];

function log(label, ok, extra = '', responseBody = null) {
  if (ok) {
    console.log(`  ✅  ${label}${extra ? ' — ' + extra : ''}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}${extra ? ' — ' + extra : ''}`);
    failures.push({ label, extra });
    failed++;
    if (VERBOSE && responseBody) {
      console.error('     Response:', JSON.stringify(responseBody, null, 2));
    }
  }
}

async function req(method, path, body) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    };
    const r    = await fetch(`${BASE_URL}${path}`, opts);
    const json = await r.json().catch(() => ({}));
    return { status: r.status, body: json };
  } catch (err) {
    return { status: 0, body: {}, error: err.message };
  }
}

function section(title) {
  console.log(`\n${'─'.repeat(65)}`);
  console.log(`  ${title}`);
  console.log('─'.repeat(65));
}

function gameHeader(emoji, name) {
  console.log(`\n${'═'.repeat(65)}`);
  console.log(`  ${emoji}  ${name}`);
  console.log('═'.repeat(65));
}

// ─── Shared Test User IDs (from guides) ──────────────────────────────────────

const USER_A = '60d5ec49f1a2b830a8a1e001'; // Dragon Drop / Mouse Master / Robot / Typing / KOOMPI Typing
const USER_B = '68666d40c0c44c6900eafbbd'; // Link Number

// ─────────────────────────────────────────────────────────────────────────────
// 1. DRAGON DROP
// ─────────────────────────────────────────────────────────────────────────────
async function testDragonDrop() {
  if (GAME_FILTER && GAME_FILTER !== 'dragon-drop') return;
  gameHeader('🐉', 'Dragon Drop  —  /api/dragon-drop');

  const BASE = '/api/dragon-drop';

  // Worlds
  section('1. Worlds');
  const worlds = await req('GET', `${BASE}/worlds`);
  log('GET /worlds', worlds.status === 200, `count=${worlds.body?.data?.length ?? '?'}`);

  const world1 = await req('GET', `${BASE}/worlds/1`);
  log('GET /worlds/1', world1.status === 200);

  const world99 = await req('GET', `${BASE}/worlds/99`);
  log('GET /worlds/99 — 404 edge case', world99.status === 404);

  const world1Levels = await req('GET', `${BASE}/worlds/1/levels`);
  log('GET /worlds/1/levels', world1Levels.status === 200);

  // Levels
  section('2. Levels');
  const level1 = await req('GET', `${BASE}/levels/1`);
  log('GET /levels/1', level1.status === 200);

  const level999 = await req('GET', `${BASE}/levels/999`);
  log('GET /levels/999 — 404 edge case', level999.status === 404);

  const startLevel = await req('POST', `${BASE}/levels/1/start`, { userAccountId: USER_A });
  log('POST /levels/1/start — start session', [200, 201].includes(startLevel.status));
  const sessionId = startLevel.body?.data?._id;

  if (sessionId) {
    const submit = await req('POST', `${BASE}/levels/1/submit`, {
      sessionId,
      performance: {
        status: 'completed', levelPassed: true, starRating: 3,
        movesUsed: 12, movesAvailable: 20, movesRemaining: 8,
        score: 4800, baseScore: 3000, comboBonus: 1200, collectibleBonus: 600,
      },
      collectibles: {
        collected: [
          { id: 'map-piece-w1-l1', type: 'map_piece', collectedAt: 3, moveNumber: 3, requiredCombo: 3, actualCombo: 4 },
          { id: 'orb-fire-1', type: 'special_orb', collectedAt: 7, moveNumber: 7, requiredCombo: 2, actualCombo: 3 },
        ],
        missed: [],
        collectionProgress: { mapPieces: 1, mapPiecesTotal: 1, specialOrbs: 1, specialOrbsTotal: 2 },
      },
      moveSequence: [
        {
          moveNumber: 1,
          action: { dragFrom: { x: 2, y: 3 }, dragTo: { x: 2, y: 2 }, orb: 'fire' },
          matches: [{ type: 'fire', count: 3, position: { x: 2, y: 2 }, orbs: ['fire','fire','fire'] }],
          comboCount: 1, scoreEarned: 300, cascadeOccurred: false,
        },
        {
          moveNumber: 2,
          action: { dragFrom: { x: 4, y: 1 }, dragTo: { x: 3, y: 1 }, orb: 'water' },
          matches: [
            { type: 'water', count: 3, position: { x: 3, y: 1 }, orbs: ['water','water','water'] },
            { type: 'fire',  count: 3, position: { x: 2, y: 3 }, orbs: ['fire','fire','fire'] },
          ],
          comboCount: 2, scoreEarned: 900, cascadeOccurred: true,
        },
      ],
      rewards: {
        xpEarned: 80, xpBonus: 40, totalXP: 120, pointsEarned: 4800,
        mapPiecesEarned: 1, orbsEarned: 5, achievementsUnlocked: ['first_level_3star'], levelUpAchieved: false,
      },
    });
    log('POST /levels/1/submit — 3-star win', [200, 201].includes(submit.status));
  }

  // Bad sessionId edge case
  const badSubmit = await req('POST', `${BASE}/levels/1/submit`, {
    sessionId: '000000000000000000000000',
    performance: { status: 'completed', levelPassed: true, starRating: 1 },
    collectibles: { collected: [], missed: [] },
    moveSequence: [],
    rewards: { xpEarned: 0, totalXP: 0 },
  });
  log('POST /levels/1/submit — bad sessionId → 404 edge case', badSubmit.status === 404, '', badSubmit.body);

  const levelStats = await req('GET', `${BASE}/levels/1/stats`);
  log('GET /levels/1/stats', [200, 404].includes(levelStats.status));

  const bestRun = await req('GET', `${BASE}/levels/1/best-run?userAccountId=${USER_A}`);
  log('GET /levels/1/best-run', [200, 404].includes(bestRun.status));

  const attempts = await req('GET', `${BASE}/levels/1/attempts?userAccountId=${USER_A}`);
  log('GET /levels/1/attempts', [200, 404].includes(attempts.status));

  // User Progress
  section('3. User Progress');
  const progress = await req('GET', `${BASE}/users/progress?userAccountId=${USER_A}`);
  log('GET /users/progress', [200, 404].includes(progress.status));

  const worldProgress = await req('GET', `${BASE}/users/world-progress/1?userAccountId=${USER_A}`);
  log('GET /users/world-progress/1', [200, 404].includes(worldProgress.status));

  const levelProgress = await req('GET', `${BASE}/users/level-progress/1?userAccountId=${USER_A}`);
  log('GET /users/level-progress/1', [200, 404].includes(levelProgress.status));

  const statistics = await req('GET', `${BASE}/users/statistics?userAccountId=${USER_A}`);
  log('GET /users/statistics', [200, 404].includes(statistics.status));

  // Map Pieces
  section('4. Map Pieces');
  const mapPieces = await req('GET', `${BASE}/map-pieces/collected?userAccountId=${USER_A}`);
  log('GET /map-pieces/collected', [200, 404].includes(mapPieces.status));

  const worldMapPieces = await req('GET', `${BASE}/map-pieces/world/1?userAccountId=${USER_A}`);
  log('GET /map-pieces/world/1', [200, 404].includes(worldMapPieces.status));

  // Boss Battles
  section('5. Boss Battles');
  const boss1 = await req('GET', `${BASE}/bosses/1`);
  log('GET /bosses/1', [200, 404].includes(boss1.status));

  const boss99 = await req('GET', `${BASE}/bosses/99`);
  log('GET /bosses/99 — 404 edge case', boss99.status === 404);

  const startBoss = await req('POST', `${BASE}/bosses/1/start`, { userAccountId: USER_A });
  log('POST /bosses/1/start', [200, 201, 400, 404].includes(startBoss.status));
  const battleId = startBoss.body?.data?._id;

  if (battleId) {
    const victorySubmit = await req('POST', `${BASE}/bosses/1/submit`, {
      battleId,
      battleResult: 'victory',
      performance: {
        totalMoves: 18, playerHPRemaining: 65, bossHPDealt: 1000,
        maxComboAchieved: 5, totalDamageDealt: 1200, specialMoveUsed: true, turnsToWin: 12,
      },
      rewards: {
        xpEarned: 500, xpBonus: 200, totalXP: 700, pointsEarned: 8000,
        mapPiecesEarned: 3, orbsEarned: 10,
        achievementsUnlocked: ['dragon_slayer', 'world_1_complete'], worldUnlocked: 2,
      },
    });
    log('POST /bosses/1/submit — victory', [200, 201].includes(victorySubmit.status));
  }

  // Leaderboards
  section('6. Leaderboards');
  const globalLB  = await req('GET', `${BASE}/leaderboards/global`);
  log('GET /leaderboards/global', [200, 404].includes(globalLB.status));

  const starsLB   = await req('GET', `${BASE}/leaderboards/stars`);
  log('GET /leaderboards/stars', [200, 404].includes(starsLB.status));

  const world1LB  = await req('GET', `${BASE}/leaderboards/world/1`);
  log('GET /leaderboards/world/1', [200, 404].includes(world1LB.status));

  const level1LB  = await req('GET', `${BASE}/leaderboards/level/1`);
  log('GET /leaderboards/level/1', [200, 404].includes(level1LB.status));
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. KOOMPI TYPING
// ─────────────────────────────────────────────────────────────────────────────
async function testKoompiTyping() {
  if (GAME_FILTER && GAME_FILTER !== 'koompi-typing') return;
  gameHeader('⌨️', 'KOOMPI Typing  —  /api/koompi-typing');

  const BASE = '/api/koompi-typing';
  let unitId, lessonId, modeId, sessionId;

  // Units
  section('1. Adventure Units');
  const unitList = await req('GET', `${BASE}/units`);
  log('GET /units', unitList.status === 200, `count=${unitList.body?.count ?? '?'}`);

  const unitListEn = await req('GET', `${BASE}/units?language=en`);
  log('GET /units?language=en', unitListEn.status === 200);

  const unitListKm = await req('GET', `${BASE}/units?language=km`);
  log('GET /units?language=km', unitListKm.status === 200);

  const createUnit = await req('POST', `${BASE}/units`, {
    unitNumber: 99,
    language: 'en',
    title: 'Test Unit — Home Row',
    description: 'Testing ASDF JKL;',
    theme: 'forest_path',
    order: 99,
    unlockRequirement: { type: 'none', previousUnitId: null },
  });
  log('POST /units — create', [200, 201].includes(createUnit.status));
  unitId = createUnit.body?.data?._id;

  // Lessons
  section('2. Typing Lessons');
  const lessonList = await req('GET', `${BASE}/lessons`);
  log('GET /lessons', lessonList.status === 200);

  if (unitId) {
    const createLesson = await req('POST', `${BASE}/lessons`, {
      unitId,
      lessonNumber: 1,
      language: 'en',
      lessonType: 'letters',
      title: 'F and J Keys',
      targetKeys: ['f', 'j'],
      difficulty: 1,
      passThreshold: { minAccuracyPct: 90, minWpm: 15 },
      xpReward: 30,
      order: 1,
    });
    log('POST /lessons — create lesson 1', [200, 201].includes(createLesson.status));
    lessonId = createLesson.body?.data?._id;

    const createLesson2 = await req('POST', `${BASE}/lessons`, {
      unitId,
      lessonNumber: 2,
      language: 'en',
      lessonType: 'letters',
      title: 'D and K Keys',
      targetKeys: ['d', 'k'],
      difficulty: 1,
      passThreshold: { minAccuracyPct: 90, minWpm: 15 },
      xpReward: 30,
      order: 2,
    });
    log('POST /lessons — create lesson 2 (for unlock chain)', [200, 201].includes(createLesson2.status));
  } else {
    log('POST /lessons — skipped (no unitId)', false);
  }

  if (lessonId) {
    const getLesson = await req('GET', `${BASE}/lessons/${lessonId}`);
    log('GET /lessons/:id', getLesson.status === 200);
  }

  // Content Items
  section('3. Content Items');
  if (lessonId) {
    const createItem = await req('POST', `${BASE}/content-items`, {
      lessonId,
      itemType: 'character',
      language: 'en',
      text: 'f j f j',
      order: 1,
      audioUrl: null,
    });
    log('POST /content-items — single', [200, 201].includes(createItem.status));

    const bulkItems = await req('POST', `${BASE}/content-items`, {
      items: [
        { lessonId, itemType: 'character', language: 'en', text: 'jf jf ff jj', order: 2 },
        { lessonId, itemType: 'word',      language: 'en', text: 'fjf jfj',     order: 3 },
      ],
    });
    log('POST /content-items — bulk', [200, 201].includes(bulkItems.status));

    const listItems = await req('GET', `${BASE}/content-items?lessonId=${lessonId}`);
    log('GET /content-items?lessonId', listItems.status === 200);
  }

  // Game Modes
  section('4. Game Modes');
  const modeList = await req('GET', `${BASE}/modes`);
  log('GET /modes', modeList.status === 200);

  const createMode = await req('POST', `${BASE}/modes`, {
    modeKey: 'lesson',
    name: 'Lesson Adventure Mode',
    description: 'Guided sequential lessons on the adventure map',
    affectsLeaderboard: true,
  });
  log('POST /modes — create (or 409 if exists)', [200, 201, 409].includes(createMode.status));
  modeId = createMode.body?.data?._id ?? modeList.body?.data?.[0]?._id;

  const modeByKey = await req('GET', `${BASE}/modes/lesson`);
  log('GET /modes/lesson', [200, 404].includes(modeByKey.status));
  if (!modeId && modeByKey.body?.data?._id) modeId = modeByKey.body.data._id;

  // Sessions
  section('5. Game Sessions');
  if (lessonId && modeId) {
    const startSession = await req('POST', `${BASE}/sessions`, {
      userAccountId: USER_A,
      lessonId,
      gameModeId: modeId,
      language: 'en',
      deviceInfo: { keyboardLayout: 'qwerty_en', inputMethod: 'physical_keyboard' },
    });
    log('POST /sessions — start', [200, 201].includes(startSession.status));
    sessionId = startSession.body?.data?._id;

    // Keystrokes
    section('6. Keystroke Events');
    if (sessionId) {
      const batchKS = await req('POST', `${BASE}/keystrokes/batch`, {
        sessionId,
        events: [
          { charIndex: 0, expectedChar: 'f', typedChar: 'f', correct: true,  keyCode: 'KeyF',  timeSinceLastKeyMs: 140 },
          { charIndex: 1, expectedChar: ' ', typedChar: ' ', correct: true,  keyCode: 'Space', timeSinceLastKeyMs: 110 },
          { charIndex: 2, expectedChar: 'j', typedChar: 'j', correct: true,  keyCode: 'KeyJ',  timeSinceLastKeyMs: 130 },
          { charIndex: 3, expectedChar: 'f', typedChar: 'g', correct: false, keyCode: 'KeyG',  timeSinceLastKeyMs: 160 },
        ],
      });
      log('POST /keystrokes/batch', [200, 201].includes(batchKS.status));

      const getKS = await req('GET', `${BASE}/keystrokes/session/${sessionId}`);
      log('GET /keystrokes/session/:sessionId', [200, 404].includes(getKS.status));

      // Complete Session — triggers all post-session hooks
      section('7. Complete Session (post-session hooks)');
      const complete = await req('PATCH', `${BASE}/sessions/${sessionId}/complete`, {
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
          j: { attempts: 60, correct: 58, avgTimeMs: 125 },
        },
      });
      log('PATCH /sessions/:id/complete', [200, 201].includes(complete.status));
      log(
        '  → postSessionResults returned',
        !!complete.body?.postSessionResults,
        `streak=${JSON.stringify(complete.body?.postSessionResults?.streak ?? 'n/a')}`
      );
      log(
        '  → achievementsUnlocked array present',
        Array.isArray(complete.body?.postSessionResults?.achievementsUnlocked)
      );
    }

    const getSession = await req('GET', `${BASE}/sessions/${sessionId ?? '000000000000000000000000'}`);
    log('GET /sessions/:id', [200, 404].includes(getSession.status));

    const userSessions = await req('GET', `${BASE}/sessions/user/${USER_A}?page=1&limit=20&passed=true`);
    log('GET /sessions/user/:userId?passed=true', [200, 404].includes(userSessions.status));
  } else {
    log('Sessions — skipped (missing lessonId or modeId)', false);
  }

  // Progress
  section('8. User Progress');
  const progressAll = await req('GET', `${BASE}/progress/user/${USER_A}`);
  log('GET /progress/user/:userId', [200, 404].includes(progressAll.status));

  if (lessonId) {
    const progressLesson = await req('GET', `${BASE}/progress/user/${USER_A}/lesson/${lessonId}`);
    log('GET /progress/user/:userId/lesson/:lessonId', [200, 404].includes(progressLesson.status));

    const unlockProgress = await req('PUT', `${BASE}/progress/user/${USER_A}/lesson/${lessonId}`, {
      status: 'unlocked',
    });
    log('PUT /progress — unlock lesson', [200, 201, 404].includes(unlockProgress.status));
  }

  // Streaks
  section('9. Daily Streaks');
  const streaks = await req('GET', `${BASE}/streaks/user/${USER_A}`);
  log('GET /streaks/user/:userId', [200, 404].includes(streaks.status));

  const addFreeze = await req('POST', `${BASE}/streaks/user/${USER_A}/add-freeze`, { count: 1 });
  log('POST /streaks/user/:userId/add-freeze', [200, 201, 404].includes(addFreeze.status));

  // Heatmap
  section('10. Keyboard Heatmap');
  const heatmap = await req('GET', `${BASE}/heatmap/user/${USER_A}?language=en`);
  log('GET /heatmap/user/:userId?language=en', [200, 404].includes(heatmap.status));

  const syncHeatmap = await req('PUT', `${BASE}/heatmap/user/${USER_A}`, {
    language: 'en',
    keyStats: { k: { attempts: 25, correct: 24, avgTimeMs: 145 } },
  });
  log('PUT /heatmap/user/:userId — sync', [200, 201, 404].includes(syncHeatmap.status));

  // Leaderboards
  section('11. Leaderboards');
  const lbGlobal  = await req('GET', `${BASE}/leaderboards?boardType=global`);
  log('GET /leaderboards?boardType=global', [200, 404].includes(lbGlobal.status));

  const lbWeekly  = await req('GET', `${BASE}/leaderboards?boardType=weekly`);
  log('GET /leaderboards?boardType=weekly', [200, 404].includes(lbWeekly.status));

  const recompute = await req('POST', `${BASE}/leaderboards/recompute`, { boardType: 'global' });
  log('POST /leaderboards/recompute', [200, 201, 404].includes(recompute.status));

  // Cleanup
  section('12. Cleanup');
  if (unitId) {
    const delUnit = await req('DELETE', `${BASE}/units/${unitId}`);
    log('DELETE /units/:id — cleanup test unit (cascades lessons)', [200, 204].includes(delUnit.status));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. LINK NUMBER
// ─────────────────────────────────────────────────────────────────────────────
async function testLinkNumber() {
  if (GAME_FILTER && GAME_FILTER !== 'link-number') return;
  gameHeader('🔢', 'Link Number  —  /api/link-number');

  const BASE = '/api/link-number';
  let boardId, sessionId;

  // Puzzles
  section('1. Puzzle Boards');
  const puzzles = await req('GET', `${BASE}/puzzles`);
  log('GET /puzzles — list all', puzzles.status === 200, `count=${puzzles.body?.count ?? '?'}`);
  boardId = puzzles.body?.data?.[0]?._id;

  const filterEasy   = await req('GET', `${BASE}/puzzles?difficulty=easy`);
  log('GET /puzzles?difficulty=easy', filterEasy.status === 200);

  const filterMedium = await req('GET', `${BASE}/puzzles/difficulty/medium`);
  log('GET /puzzles/difficulty/medium', [200, 404].includes(filterMedium.status));

  const puzzle1 = await req('GET', `${BASE}/puzzles/1`);
  log('GET /puzzles/1 — by board number', [200, 404].includes(puzzle1.status));
  if (!boardId && puzzle1.body?.data?._id) boardId = puzzle1.body.data._id;

  const puzzle2Stats = await req('GET', `${BASE}/puzzles/2/stats`);
  log('GET /puzzles/2/stats', [200, 404].includes(puzzle2Stats.status));

  const createPuzzle = await req('POST', `${BASE}/puzzles`, {
    boardNumber: 4,
    title: 'Expert Spiral',
    description: 'A twisting 5x5 expert puzzle for seasoned solvers.',
    difficulty: 'expert',
    gridSize: '5x5',
    category: 'special',
    grid: {
      width: 5, height: 5, totalCells: 25, totalPairs: 5,
      numberPairs: [
        { id: 'pair_1', number: 1, positions: [{ x: 0, y: 0 }, { x: 4, y: 4 }] },
        { id: 'pair_2', number: 2, positions: [{ x: 4, y: 0 }, { x: 0, y: 4 }] },
        { id: 'pair_3', number: 3, positions: [{ x: 2, y: 0 }, { x: 2, y: 4 }] },
        { id: 'pair_4', number: 4, positions: [{ x: 0, y: 2 }, { x: 4, y: 2 }] },
        { id: 'pair_5', number: 5, positions: [{ x: 1, y: 1 }, { x: 3, y: 3 }] },
      ],
    },
    constraints: { pathsCannotCross: true, mustFillAllCells: true, eachCellUsedOnce: true },
    hints: [{ id: 'hint_1', level: 1, text: 'Map the perimeter paths first.', revealAfterTime: 120, revealAfterAttempts: 3 }],
    rewards: {
      baseXP: 400, xpForPerfect: 900, xpForSpeed: 150,
      stars: {
        oneStar:    { minTime: 600, allowMistakes: true, xpBonus: 200 },
        twoStars:   { minTime: 360, maxMistakes: 2,      xpBonus: 350 },
        threeStars: { minTime: 240, maxMistakes: 0,      xpBonus: 600 },
      },
    },
    status: { isPublished: true, isArchived: false, isBeta: false, isFeatureLevel: false },
  });
  log('POST /puzzles — create board 4 (admin)', [200, 201, 409].includes(createPuzzle.status));

  // Sessions
  section('2. Game Sessions');
  if (boardId) {
    const startSession = await req('POST', `${BASE}/sessions`, {
      userAccountId: USER_B,
      boardId,
      device: { type: 'desktop', os: 'Windows 11', browser: 'Chrome 127', screenSize: '1920x1080' },
    });
    log('POST /sessions — start', [200, 201].includes(startSession.status));
    sessionId = startSession.body?.data?._id;

    if (sessionId) {
      // 3-star perfect run
      const complete = await req('PATCH', `${BASE}/sessions/${sessionId}/complete`, {
        timing: {
          startedAt: '2026-09-02T08:00:00.000Z',
          endedAt:   '2026-09-02T08:00:38.000Z',
          durationSeconds: 38, activePlayTimeSeconds: 38, pausedSeconds: 0,
        },
        result: {
          status: 'completed', puzzleSolved: true, boardFilled: true,
          mistakesMade: 0, unvalidMovesAttempted: 0, firstTryComplete: true,
          starRating: 3, score: 1450, baseScore: 1000, timeBonus: 300, perfectBonus: 150, xpEarned: 300,
        },
        moveHistory: [
          {
            moveNumber: 1, timestamp: 2.1, action: 'draw_path', pairId: 'pair_3', number: 3,
            pathSegments: [{ x: 1, y: 0, x_to: 1, y_to: 1 }, { x: 1, y: 1, x_to: 1, y_to: 2 }],
            cellsCovered: 3, isValid: true, pathLength: 3,
          },
          {
            moveNumber: 2, timestamp: 8.4, action: 'draw_path', pairId: 'pair_1', number: 1,
            pathSegments: [
              { x: 0, y: 0, x_to: 0, y_to: 1 }, { x: 0, y: 1, x_to: 0, y_to: 2 },
              { x: 0, y: 2, x_to: 1, y_to: 2 }, { x: 1, y: 2, x_to: 2, y_to: 2 },
            ],
            cellsCovered: 5, isValid: true, pathLength: 5,
          },
          {
            moveNumber: 3, timestamp: 18.7, action: 'draw_path', pairId: 'pair_2', number: 2,
            pathSegments: [{ x: 2, y: 0, x_to: 2, y_to: 1 }, { x: 2, y: 1, x_to: 2, y_to: 2 }],
            cellsCovered: 3, isValid: true, pathLength: 3,
          },
        ],
        paths: [
          { pathId: 'path_1', pairId: 'pair_1', number: 1, cellsCovered: 5, cellsList: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }], isCorrect: true, crossesAnotherPath: false, completionTime: 18.7 },
          { pathId: 'path_2', pairId: 'pair_2', number: 2, cellsCovered: 3, cellsList: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }], isCorrect: true, crossesAnotherPath: false, completionTime: 30.2 },
          { pathId: 'path_3', pairId: 'pair_3', number: 3, cellsCovered: 3, cellsList: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }], isCorrect: true, crossesAnotherPath: false, completionTime: 8.4 },
        ],
        userActions: { totalMoves: 3, pathsDrawn: 3, pathsCleared: 0, pathsUndone: 0, hintsUsed: 0, hintLevelsRevealed: 0, undoCount: 0, restartCount: 0 },
        analytics: { playStyle: 'strategic', problemSolving: 'methodical', hesitationPoints: 1, errorDetection: 'immediate', engagementScore: 0.95, focusLevel: 'high' },
      });
      log('PATCH /sessions/:id/complete — 3-star perfect run', [200, 201].includes(complete.status));
      log(
        '  → achievementsUnlocked',
        Array.isArray(complete.body?.postSession?.achievementsUnlocked),
        JSON.stringify(complete.body?.postSession?.achievementsUnlocked ?? [])
      );

      const getSession = await req('GET', `${BASE}/sessions/${sessionId}`);
      log('GET /sessions/:id — single detail', getSession.status === 200);
    }

    // Quit session
    const startSession2 = await req('POST', `${BASE}/sessions`, {
      userAccountId: USER_B,
      boardId,
      device: { type: 'desktop', os: 'Windows 11', browser: 'Chrome 127', screenSize: '1920x1080' },
    });
    const sessionId2 = startSession2.body?.data?._id;
    if (sessionId2) {
      const quit = await req('PATCH', `${BASE}/sessions/${sessionId2}/complete`, {
        timing: { startedAt: '2026-09-02T09:00:00.000Z', endedAt: '2026-09-02T09:01:45.000Z', durationSeconds: 105, activePlayTimeSeconds: 90, pausedSeconds: 15 },
        result: { status: 'quit', puzzleSolved: false, boardFilled: false, mistakesMade: 4, unvalidMovesAttempted: 6, firstTryComplete: false, starRating: 0, score: 0, baseScore: 0, timeBonus: 0, perfectBonus: 0, xpEarned: 0 },
        userActions: { totalMoves: 10, pathsDrawn: 4, pathsCleared: 3, pathsUndone: 2, hintsUsed: 1, hintLevelsRevealed: 1, undoCount: 2, restartCount: 1 },
      });
      log('PATCH /sessions/:id/complete — quit run', [200, 201].includes(quit.status));

      const delSession = await req('DELETE', `${BASE}/sessions/${sessionId2}`);
      log('DELETE /sessions/:id — cleanup', [200, 204].includes(delSession.status));
    }

    const userSessions = await req('GET', `${BASE}/sessions/user/${USER_B}`);
    log('GET /sessions/user/:userId', [200, 404].includes(userSessions.status));
  } else {
    log('Sessions — skipped (no boardId found)', false);
  }

  // Board Progress
  section('3. Board Progress');
  const progressAll  = await req('GET', `${BASE}/progress/user/${USER_B}`);
  log('GET /progress/user/:userId', [200, 404].includes(progressAll.status));

  const progressDone = await req('GET', `${BASE}/progress/user/${USER_B}?status=completed`);
  log('GET /progress/user/:userId?status=completed', [200, 404].includes(progressDone.status));

  if (boardId) {
    const progressBoard = await req('GET', `${BASE}/progress/user/${USER_B}/${boardId}`);
    log('GET /progress/user/:userId/:boardId', [200, 404].includes(progressBoard.status));
  }

  // Daily Challenge
  section('4. Daily Challenge');
  const today    = await req('GET', `${BASE}/daily-challenges/today`);
  log('GET /daily-challenges/today', [200, 404].includes(today.status));

  const allDaily = await req('GET', `${BASE}/daily-challenges`);
  log('GET /daily-challenges — all', [200, 404].includes(allDaily.status));

  // Leaderboards
  section('5. Leaderboards');
  const globalLB = await req('GET', `${BASE}/leaderboards?boardType=global`);
  log('GET /leaderboards?boardType=global', [200, 404].includes(globalLB.status));
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. MOUSE MASTER
// ─────────────────────────────────────────────────────────────────────────────
async function testMouseMaster() {
  if (GAME_FILTER && GAME_FILTER !== 'mouse-master') return;
  gameHeader('🖱️', 'Mouse Master  —  /api/mouse-master');

  const BASE = '/api/mouse-master';
  const SEEDED_CAT_ID   = '6a96e94ad22bdfa883f45547';
  const SEEDED_MODE_ID  = '6a96e94cd22bdfa883f45548';
  const SEEDED_LEVEL_ID = '6a96e94cd22bdfa883f45549';
  let sessionId;

  // Categories
  section('1. Skill Categories');
  const categories = await req('GET', `${BASE}/categories`);
  log('GET /categories', categories.status === 200, `count=${categories.body?.count ?? '?'}`);

  const catByKey  = await req('GET', `${BASE}/categories/click_basics`);
  log('GET /categories/click_basics', [200, 404].includes(catByKey.status));

  const fakeCat   = await req('GET', `${BASE}/categories/fake_key`);
  log('GET /categories/fake_key — 404 edge case', fakeCat.status === 404);

  const createCat = await req('POST', `${BASE}/categories`, {
    categoryKey: 'drag_drop',
    name: 'Drag & Drop',
    description: 'Drag items from one zone to another accurately',
    order: 3,
    levelRange: { start: 11, end: 15 },
    icon: 'hand',
    unlockRequirement: { type: 'previous_category_complete', previousCategoryKey: 'double_right_click' },
  });
  log('POST /categories — create drag_drop', [200, 201, 409].includes(createCat.status));

  // Game Modes
  section('2. Game Modes');
  const modes     = await req('GET', `${BASE}/modes`);
  log('GET /modes', modes.status === 200);

  const modeByKey = await req('GET', `${BASE}/modes/practice`);
  log('GET /modes/practice', [200, 404].includes(modeByKey.status));

  const createTimed = await req('POST', `${BASE}/modes`, {
    modeKey: 'timed',
    name: 'Timed Mode',
    description: 'Race against the clock for a high score',
    affectsLeaderboard: true,
  });
  log('POST /modes — create timed', [200, 201, 409].includes(createTimed.status));

  // Levels
  section('3. Mouse Levels');
  const levels       = await req('GET', `${BASE}/levels`);
  log('GET /levels', levels.status === 200);

  const levelsByCat  = await req('GET', `${BASE}/levels?categoryId=${SEEDED_CAT_ID}`);
  log('GET /levels?categoryId', levelsByCat.status === 200);

  const levelsByDiff = await req('GET', `${BASE}/levels?difficulty=2`);
  log('GET /levels?difficulty=2', levelsByDiff.status === 200);

  const levelsByCatKey = await req('GET', `${BASE}/levels/category/click_basics`);
  log('GET /levels/category/click_basics', [200, 404].includes(levelsByCatKey.status));

  const level1     = await req('GET', `${BASE}/levels/${SEEDED_LEVEL_ID}`);
  log('GET /levels/:id — seeded level', [200, 404].includes(level1.status));

  const fakeLevel  = await req('GET', `${BASE}/levels/000000000000000000000000`);
  log('GET /levels/000... — 404 edge case', fakeLevel.status === 404);

  const createLevel2 = await req('POST', `${BASE}/levels`, {
    levelNumber: 2,
    categoryId: SEEDED_CAT_ID,
    challengeType: 'click',
    difficulty: 2,
    config: { targetCount: 12, targetSizePx: 45, targetSpeed: 0, movementPattern: 'static', timeLimitMs: 18000 },
    passThreshold: { minAccuracyPct: 75, maxAvgReactionMs: 900 },
    xpReward: 75,
  });
  log('POST /levels — create level 2', [200, 201, 409].includes(createLevel2.status));

  const patchLevel = await req('PATCH', `${BASE}/levels/${SEEDED_LEVEL_ID}`, {
    config: { targetCount: 10, targetSizePx: 55, targetSpeed: 0, movementPattern: 'static', timeLimitMs: 18000 },
    xpReward: 60,
  });
  log('PATCH /levels/:id — update', [200, 201, 404].includes(patchLevel.status));

  // Full Play Flow
  section('4. Game Sessions — Full Play Flow');
  const startSession = await req('POST', `${BASE}/sessions`, {
    userAccountId: USER_A,
    levelId: SEEDED_LEVEL_ID,
    gameModeId: SEEDED_MODE_ID,
    deviceInfo: { inputType: 'mouse', screenWidth: 1920, screenHeight: 1080 },
  });
  log('POST /sessions — start (step 1)', [200, 201].includes(startSession.status));
  sessionId = startSession.body?.data?._id;

  if (sessionId) {
    // 10 target events: 9 hits, 1 miss
    const attempts = Array.from({ length: 9 }, (_, i) => ({
      sessionId,
      targetIndex:    i,
      targetPosition: { x: 100 + i * 100, y: 200 + i * 30 },
      clickPosition:  { x: 102 + i * 100, y: 201 + i * 30 },
      hit: true,
      reactionTimeMs: 300 + i * 20,
      overshootPx: 2.2 + i * 0.2,
      actionType: 'click',
      timestamp: `2026-09-01T15:00:0${i}.500Z`,
    }));
    attempts.push({
      sessionId, targetIndex: 9,
      targetPosition: { x: 400, y: 700 }, clickPosition: null,
      hit: false, reactionTimeMs: null, overshootPx: null,
      actionType: 'click', timestamp: '2026-09-01T15:00:09.500Z',
    });

    const bulk = await req('POST', `${BASE}/attempts/bulk`, { attempts });
    log('POST /attempts/bulk — 10 events (step 2)', [200, 201].includes(bulk.status));

    // Complete — 90% accuracy, 3 stars
    const complete = await req('PATCH', `${BASE}/sessions/${sessionId}/complete`, {
      endedAt: '2026-09-01T15:00:11.000Z',
      durationMs: 11000,
      targetsShown: 10, targetsHit: 9, targetsMissed: 1,
      accuracyPct: 90.0,
      avgReactionTimeMs: 370,
      fastestReactionMs: 280,
      slowestReactionMs: 510,
      overshootCount: 2,
      deviationScore: null,
      passed: true, starsEarned: 3, xpEarned: 45,
    });
    log('PATCH /sessions/:id/complete — 3-star pass (step 3)', [200, 201].includes(complete.status));
    log(
      '  → postSession returned',
      complete.body?.postSession !== undefined,
      `badge=${complete.body?.postSession?.badgeAwarded ?? 'null'}`
    );

    // Failed session (step 4)
    const startFail   = await req('POST', `${BASE}/sessions`, {
      userAccountId: USER_A, levelId: SEEDED_LEVEL_ID, gameModeId: SEEDED_MODE_ID,
      deviceInfo: { inputType: 'mouse', screenWidth: 1920, screenHeight: 1080 },
    });
    const failId = startFail.body?.data?._id;
    if (failId) {
      const fail = await req('PATCH', `${BASE}/sessions/${failId}/complete`, {
        endedAt: '2026-09-01T15:05:00.000Z', durationMs: 15000,
        targetsShown: 10, targetsHit: 5, targetsMissed: 5,
        accuracyPct: 50.0, avgReactionTimeMs: 850, fastestReactionMs: 620, slowestReactionMs: 1200,
        overshootCount: 5, deviationScore: null, passed: false, starsEarned: 0, xpEarned: 0,
      });
      log('PATCH /sessions/:id/complete — failed run (step 4)', [200, 201].includes(fail.status));
    }

    // Single real-time attempt
    const singleAttempt = await req('POST', `${BASE}/attempts`, {
      sessionId, targetIndex: 0,
      targetPosition: { x: 450, y: 300 }, clickPosition: { x: 452, y: 298 },
      hit: true, reactionTimeMs: 320, overshootPx: 2.8,
      actionType: 'click', timestamp: '2026-09-01T15:00:00.300Z',
    });
    log('POST /attempts — single real-time (step 5)', [200, 201].includes(singleAttempt.status));

    const getAttempts = await req('GET', `${BASE}/attempts/session/${sessionId}`);
    log('GET /attempts/session/:sessionId', [200, 404].includes(getAttempts.status));
  } else {
    log('Attempts & complete — skipped (no sessionId)', false);
  }

  // Empty bulk edge case
  const emptyBulk = await req('POST', `${BASE}/attempts/bulk`, { attempts: [] });
  log('POST /attempts/bulk — empty → 400 edge case', emptyBulk.status === 400, '', emptyBulk.body);

  // User Progress
  section('5. User Progress');
  const progressAll   = await req('GET', `${BASE}/progress/user/${USER_A}`);
  log('GET /progress/user/:userId — all', [200, 404].includes(progressAll.status));

  const progressDone  = await req('GET', `${BASE}/progress/user/${USER_A}?status=completed`);
  log('GET /progress/user/:userId?status=completed', [200, 404].includes(progressDone.status));

  const progressLevel = await req('GET', `${BASE}/progress/user/${USER_A}/level/${SEEDED_LEVEL_ID}`);
  log('GET /progress/user/:userId/level/:levelId', [200, 404].includes(progressLevel.status));

  const unlockProgress = await req('POST', `${BASE}/progress`, {
    userAccountId: USER_A, levelId: SEEDED_LEVEL_ID,
  });
  log('POST /progress — unlock level manually', [200, 201, 409].includes(unlockProgress.status));

  const manualUpsert = await req('PATCH', `${BASE}/progress/user/${USER_A}/level/${SEEDED_LEVEL_ID}`, {
    status: 'completed', bestAccuracyPct: 95.0, bestAvgReactionMs: 310, bestStars: 3, attemptsCount: 2,
  });
  log('PATCH /progress — manual upsert', [200, 201, 404].includes(manualUpsert.status));

  // Skill Badges
  section('6. Skill Badges');
  const badges = await req('GET', `${BASE}/badges/user/${USER_A}`);
  log('GET /badges/user/:userId', [200, 404].includes(badges.status));

  const specificBadge = await req('GET', `${BASE}/badges/user/${USER_A}/click_basics`);
  log('GET /badges/user/:userId/click_basics', [200, 404].includes(specificBadge.status));

  const awardBadge = await req('POST', `${BASE}/badges`, {
    userAccountId: USER_A,
    categoryKey: 'drag_drop',
    badgeName: 'Dragger Badge',
    earnedAt: '2026-09-01T16:00:00.000Z',
    levelIdOnEarn: SEEDED_LEVEL_ID,
  });
  log('POST /badges — award badge', [200, 201, 409].includes(awardBadge.status));

  const dupBadge = await req('POST', `${BASE}/badges`, {
    userAccountId: USER_A, categoryKey: 'drag_drop',
    badgeName: 'Dragger Badge', earnedAt: '2026-09-01T16:00:00.000Z', levelIdOnEarn: SEEDED_LEVEL_ID,
  });
  log('POST /badges — duplicate → 409 edge case', dupBadge.status === 409, '', dupBadge.body);

  // Session History
  section('7. Session History');
  const allSessions   = await req('GET', `${BASE}/sessions/user/${USER_A}`);
  log('GET /sessions/user/:userId — all', [200, 404].includes(allSessions.status));

  const passedSess    = await req('GET', `${BASE}/sessions/user/${USER_A}?passed=true`);
  log('GET /sessions/user/:userId?passed=true', [200, 404].includes(passedSess.status));

  const failedSess    = await req('GET', `${BASE}/sessions/user/${USER_A}?passed=false`);
  log('GET /sessions/user/:userId?passed=false', [200, 404].includes(failedSess.status));

  const pagedSess     = await req('GET', `${BASE}/sessions/user/${USER_A}?page=1&limit=5`);
  log('GET /sessions/user/:userId?page=1&limit=5', [200, 404].includes(pagedSess.status));

  const bestSession   = await req('GET', `${BASE}/sessions/user/${USER_A}/best`);
  log('GET /sessions/user/:userId/best', [200, 404].includes(bestSession.status));

  if (sessionId) {
    const singleSession = await req('GET', `${BASE}/sessions/${sessionId}`);
    log('GET /sessions/:id — single detail', [200, 404].includes(singleSession.status));
  }

  // Leaderboards
  section('8. Leaderboards');
  const recompGlobal = await req('POST', `${BASE}/leaderboards/recompute`, { boardType: 'global', limit: 50 });
  log('POST /leaderboards/recompute — global', [200, 201, 404].includes(recompGlobal.status));

  const recompWeekly = await req('POST', `${BASE}/leaderboards/recompute`, {
    boardType: 'weekly',
    periodStart: '2026-08-25T00:00:00.000Z',
    periodEnd:   '2026-09-01T23:59:59.000Z',
    limit: 20,
  });
  log('POST /leaderboards/recompute — weekly', [200, 201, 404].includes(recompWeekly.status));

  const recompCat    = await req('POST', `${BASE}/leaderboards/recompute`, {
    boardType: 'by_category', categoryKey: 'click_basics', limit: 10,
  });
  log('POST /leaderboards/recompute — by_category', [200, 201, 404].includes(recompCat.status));

  const globalLB     = await req('GET', `${BASE}/leaderboards?boardType=global`);
  log('GET /leaderboards?boardType=global', [200, 404].includes(globalLB.status));

  const catLB        = await req('GET', `${BASE}/leaderboards?boardType=by_category&categoryKey=click_basics`);
  log('GET /leaderboards?boardType=by_category&categoryKey=click_basics', [200, 404].includes(catLB.status));
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ROBOT BRAINIAC
// ─────────────────────────────────────────────────────────────────────────────
async function testRobotBrainiac() {
  if (GAME_FILTER && GAME_FILTER !== 'robot-brainiac') return;
  gameHeader('🤖', 'Robot Brainiac  —  /api/robot-brainiac');

  const BASE = '/api/robot-brainiac';
  let levelId, sessionId;

  // Levels
  section('1. Levels');
  const levels      = await req('GET', `${BASE}/levels`);
  log('GET /levels — list all', levels.status === 200);

  const filterEasy  = await req('GET', `${BASE}/levels?difficulty=easy`);
  log('GET /levels?difficulty=easy', filterEasy.status === 200);

  const filterCat   = await req('GET', `${BASE}/levels?category=maze_navigation`);
  log('GET /levels?category=maze_navigation', filterCat.status === 200);

  const published   = await req('GET', `${BASE}/levels?isPublished=true`);
  log('GET /levels?isPublished=true', published.status === 200);

  const featured    = await req('GET', `${BASE}/levels?isFeatured=true`);
  log('GET /levels?isFeatured=true', featured.status === 200);

  const nextLevel   = await req('GET', `${BASE}/levels/next`);
  log('GET /levels/next — recommended', [200, 404].includes(nextLevel.status));

  const fakeLevel   = await req('GET', `${BASE}/levels/000000000000000000000000`);
  log('GET /levels/000... — 404 edge case', fakeLevel.status === 404);

  // Create level 1
  const createLevel = await req('POST', `${BASE}/levels`, {
    levelNumber: 1,
    title: 'First Steps',
    description: 'Guide your robot from start to the green goal square.',
    difficulty: 'easy',
    category: 'maze_navigation',
    recommendedLevel: 1,
    grid: { width: 5, height: 5, cellSize: 80 },
    robot: {
      startPosition: { x: 0, y: 0 }, startDirection: 'EAST', robotType: 'standard',
      properties: { canRotate: true, canPushObjects: false, hasMemory: false, speed: 1 },
    },
    goal: {
      position: { x: 4, y: 4 }, type: 'reach_point',
      objectives: [{ id: 'obj-1', type: 'reach_goal', position: { x: 4, y: 4 }, required: true }],
    },
    obstacles: [{
      id: 'wall-1', type: 'wall',
      positions: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      properties: { solid: true, movable: false, damageable: false, stopsRobot: true, damageOnCollision: false },
    }],
    collectibles: [{ id: 'star-1', type: 'star', position: { x: 3, y: 1 }, points: 100, bonus: 'speed_star' }],
    solution: {
      optimalMoves: 8, optimalTime: 30,
      optimalSequence: ['FORWARD','FORWARD','TURN_RIGHT','FORWARD','TURN_LEFT','FORWARD','FORWARD','FORWARD'],
      allowedMoves: 15, timeLimit: 120,
      hints: [{ id: 'hint-1', level: 1, text: 'Move EAST first, there is a wall blocking the center path.', revealAfterAttempts: 2, revealAfterTime: 30 }],
    },
    rewards: { xpForCompletion: 100, xpForOptimal: 200, xpForPerfect: 400, pointsForCompletion: 100, pointsForSpeed: 50, bonusAchievement: 'first_steps' },
    author: { type: 'system' },
    status: { isPublished: true, isFeatured: false, isArchived: false },
  });
  log('POST /levels — create level 1', [200, 201, 409].includes(createLevel.status));
  levelId = createLevel.body?.data?._id;
  if (!levelId) levelId = levels.body?.data?.[0]?._id;

  if (levelId) {
    const getLevel   = await req('GET', `${BASE}/levels/${levelId}`);
    log('GET /levels/:id — single', getLevel.status === 200);

    const patchLevel = await req('PATCH', `${BASE}/levels/${levelId}`, {
      status: { isFeatured: true },
      rewards: { xpForCompletion: 150 },
    });
    log('PATCH /levels/:id — update', [200, 201, 404].includes(patchLevel.status));

    const levelStats = await req('POST', `${BASE}/levels/${levelId}/stats`, {
      'stats.timesAttempted': 1, 'stats.timesCompleted': 1,
    });
    log('POST /levels/:id/stats — increment', [200, 201, 404].includes(levelStats.status));
  }

  // Duplicate levelNumber edge case
  const dupLevel = await req('POST', `${BASE}/levels`, {
    levelNumber: 1, title: 'Duplicate',
    difficulty: 'easy', category: 'maze_navigation',
    grid: { width: 5, height: 5, cellSize: 80 },
    robot: { startPosition: { x: 0, y: 0 }, startDirection: 'EAST', robotType: 'standard', properties: { canRotate: true } },
    goal: { position: { x: 4, y: 4 }, type: 'reach_point', objectives: [] },
    status: { isPublished: true },
  });
  log('POST /levels — duplicate levelNumber → 409 edge case', dupLevel.status === 409, '', dupLevel.body);

  // Sessions
  section('2. Game Sessions');
  if (levelId) {
    const startSession = await req('POST', `${BASE}/sessions`, {
      userAccountId: USER_A, levelId, levelNumber: 1, difficulty: 'easy',
      timing: { startedAt: '2026-09-01T15:00:00.000Z', pausedSeconds: 0 },
      performance: { status: 'in_progress' },
      analytics: { restartCount: 0, hintUsed: false, hintsUsedCount: 0, autoSolveUsed: false },
      device: { type: 'desktop', os: 'Linux', browser: 'Chrome' },
    });
    log('POST /sessions — start', [200, 201].includes(startSession.status));
    sessionId = startSession.body?.data?._id;

    if (sessionId) {
      // Successful completion
      const endSuccess = await req('PATCH', `${BASE}/sessions/${sessionId}`, {
        timing: { endedAt: '2026-09-01T15:01:30.000Z', durationSeconds: 90, pausedSeconds: 0 },
        performance: {
          status: 'completed', goalReached: true,
          movesExecuted: 8, optimalMoves: 8, efficiency: 100,
          timeToSolve: 90, timeOptimal: 30, speedRating: 85,
          collectiblesCollected: 1, collectiblesTotal: 1, attemptCount: 1,
        },
        commandSequence: [
          { index: 0, command: 'FORWARD',    executed: true, result: 'success', timestamp: 5,  robotPosition: { x: 1, y: 0 }, robotDirection: 'EAST' },
          { index: 1, command: 'FORWARD',    executed: true, result: 'success', timestamp: 10, robotPosition: { x: 2, y: 0 }, robotDirection: 'EAST' },
          { index: 2, command: 'TURN_RIGHT', executed: true, result: 'success', timestamp: 15, robotPosition: { x: 2, y: 0 }, robotDirection: 'SOUTH' },
          { index: 3, command: 'FORWARD',    executed: true, result: 'success', timestamp: 20, robotPosition: { x: 2, y: 1 }, robotDirection: 'SOUTH' },
          { index: 4, command: 'TURN_LEFT',  executed: true, result: 'success', timestamp: 25, robotPosition: { x: 2, y: 1 }, robotDirection: 'EAST' },
          { index: 5, command: 'FORWARD',    executed: true, result: 'success', timestamp: 30, robotPosition: { x: 3, y: 1 }, robotDirection: 'EAST' },
          { index: 6, command: 'FORWARD',    executed: true, result: 'success', timestamp: 35, robotPosition: { x: 4, y: 1 }, robotDirection: 'EAST' },
          { index: 7, command: 'FORWARD',    executed: true, result: 'success', timestamp: 40, robotPosition: { x: 4, y: 4 }, robotDirection: 'EAST' },
        ],
        mistakes: [],
        scoring: { baseScore: 500, efficiencyBonus: 300, speedBonus: 200, collectibleBonus: 100, perfectBonus: 100, totalScore: 1200 },
        rewards: { xpEarned: 100, xpBonus: 100, totalXP: 200, pointsEarned: 1200, achievementsUnlocked: ['first_steps'], levelUpAchieved: false, isPersonalBest: true },
        analytics: { playStyle: 'optimized', restartCount: 0, hintUsed: false, hintsUsedCount: 0, autoSolveUsed: false, strategicPauses: 2 },
      });
      log('PATCH /sessions/:id — completed (success)', [200, 201].includes(endSuccess.status));

      // Failed session
      const startFail = await req('POST', `${BASE}/sessions`, {
        userAccountId: USER_A, levelId, levelNumber: 1, difficulty: 'easy',
        timing: { startedAt: '2026-09-01T15:02:00.000Z', pausedSeconds: 0 },
        performance: { status: 'in_progress' },
        analytics: { restartCount: 0, hintUsed: false, hintsUsedCount: 0, autoSolveUsed: false },
        device: { type: 'desktop', os: 'Linux', browser: 'Chrome' },
      });
      const failId = startFail.body?.data?._id;
      if (failId) {
        const endFail = await req('PATCH', `${BASE}/sessions/${failId}`, {
          timing: { endedAt: '2026-09-01T15:02:00.000Z', durationSeconds: 120 },
          performance: { status: 'failed', goalReached: false, movesExecuted: 5, optimalMoves: 8, efficiency: 0, attemptCount: 2 },
          mistakes: [{ moveNumber: 3, command: 'FORWARD', result: 'collision', collisionWith: 'wall-1', attempted: true, consequences: 'robot_stopped' }],
          scoring: { baseScore: 0, efficiencyBonus: 0, speedBonus: 0, collectibleBonus: 0, perfectBonus: 0, totalScore: 0 },
          rewards: { xpEarned: 10, xpBonus: 0, totalXP: 10, pointsEarned: 0, achievementsUnlocked: [], levelUpAchieved: false, isPersonalBest: false },
        });
        log('PATCH /sessions/:id — failed (collision)', [200, 201].includes(endFail.status));
      }

      const getSess = await req('GET', `${BASE}/sessions/${sessionId}`);
      log('GET /sessions/:id — single', getSess.status === 200);
    }

    const userSessions    = await req('GET', `${BASE}/sessions/user/${USER_A}`);
    log('GET /sessions/user/:userId', [200, 404].includes(userSessions.status));

    const filterCompleted = await req('GET', `${BASE}/sessions/user/${USER_A}?status=completed`);
    log('GET /sessions/user/:userId?status=completed', [200, 404].includes(filterCompleted.status));

    const bestSession     = await req('GET', `${BASE}/sessions/user/${USER_A}/best`);
    log('GET /sessions/user/:userId/best', [200, 404].includes(bestSession.status));
  } else {
    log('Sessions — skipped (no levelId)', false);
  }

  // Attempts
  section('3. Level Attempts');
  if (levelId && sessionId) {
    const singleAttempt = await req('POST', `${BASE}/attempts`, {
      userAccountId: USER_A, sessionId, levelId,
      attemptNumber: 1,
      commandSequence: ['FORWARD', 'FORWARD', 'TURN_RIGHT', 'FORWARD'],
      result: { status: 'failed', goalReached: false, movesUsed: 4, collisionOccurred: true, collisionWith: 'wall-1' },
    });
    log('POST /attempts — single', [200, 201].includes(singleAttempt.status));

    const bulkAttempts = await req('POST', `${BASE}/attempts/bulk`, {
      attempts: [
        {
          userAccountId: USER_A, sessionId, levelId, attemptNumber: 1,
          commandSequence: ['FORWARD', 'FORWARD', 'FORWARD'],
          result: { status: 'failed', goalReached: false, movesUsed: 3, collisionOccurred: true },
        },
        {
          userAccountId: USER_A, sessionId, levelId, attemptNumber: 2,
          commandSequence: ['FORWARD','FORWARD','TURN_RIGHT','FORWARD','TURN_LEFT','FORWARD','FORWARD','FORWARD'],
          result: { status: 'completed', goalReached: true, movesUsed: 8, collisionOccurred: false, efficiency: 100 },
        },
      ],
    });
    log('POST /attempts/bulk — 2 attempts', [200, 201].includes(bulkAttempts.status));

    const getAttemptsBySess  = await req('GET', `${BASE}/attempts/session/${sessionId}`);
    log('GET /attempts/session/:sessionId', [200, 404].includes(getAttemptsBySess.status));

    const getAttemptsByUser  = await req('GET', `${BASE}/attempts/user/${USER_A}`);
    log('GET /attempts/user/:userId', [200, 404].includes(getAttemptsByUser.status));

    const getAttemptsByLevel = await req('GET', `${BASE}/attempts/level/${levelId}`);
    log('GET /attempts/level/:levelId', [200, 404].includes(getAttemptsByLevel.status));
  }

  // Empty bulk edge case
  const emptyBulk = await req('POST', `${BASE}/attempts/bulk`, { attempts: [] });
  log('POST /attempts/bulk — empty → 400 edge case', emptyBulk.status === 400);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. TYPING CODE
// ─────────────────────────────────────────────────────────────────────────────
async function testTypingCode() {
  if (GAME_FILTER && GAME_FILTER !== 'typing-code') return;
  gameHeader('💻', 'Typing Code  —  /api/typing-code');

  const BASE = '/api/typing-code';
  let challengeId, sessionId;

  // Challenges
  section('1. Challenges');
  const challenges     = await req('GET', `${BASE}/challenges`);
  log('GET /challenges', challenges.status === 200);

  const filterJS       = await req('GET', `${BASE}/challenges?language=javascript`);
  log('GET /challenges?language=javascript', filterJS.status === 200);

  const filterBeginner = await req('GET', `${BASE}/challenges?difficulty=beginner`);
  log('GET /challenges?difficulty=beginner', filterBeginner.status === 200);

  const filterPub      = await req('GET', `${BASE}/challenges?isPublished=true`);
  log('GET /challenges?isPublished=true', filterPub.status === 200);

  const createJS = await req('POST', `${BASE}/challenges`, {
    title: 'Hello World Function',
    language: 'javascript',
    difficulty: 'beginner',
    category: 'functions',
    description: 'A classic hello world function to warm up your fingers.',
    codeSnippet: "function helloWorld() {\n  return 'Hello, World!';\n}\n\nconsole.log(helloWorld());",
    tags: ['beginner', 'functions', 'output'],
    timeLimit: 120,
    targetWPM: 40,
    status: { isPublished: true, isFeatured: false },
  });
  log('POST /challenges — JS beginner', [200, 201].includes(createJS.status));
  challengeId = createJS.body?.data?._id;

  const createPY = await req('POST', `${BASE}/challenges`, {
    title: 'List Comprehension Filter',
    language: 'python',
    difficulty: 'intermediate',
    category: 'data_structures',
    description: 'Filter even numbers using list comprehension.',
    codeSnippet: 'numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\neven_numbers = [n for n in numbers if n % 2 == 0]\nprint(even_numbers)',
    tags: ['lists', 'comprehension', 'filter'],
    timeLimit: 90, targetWPM: 50,
    status: { isPublished: true, isFeatured: true },
  });
  log('POST /challenges — Python intermediate', [200, 201].includes(createPY.status));

  const createTS = await req('POST', `${BASE}/challenges`, {
    title: 'Generic Type Constraint',
    language: 'typescript',
    difficulty: 'advanced',
    category: 'generics',
    description: 'Write a generic function with type constraints.',
    codeSnippet: "function getProperty(obj, key) {\n  return obj[key];\n}\n\nconst person = { name: 'Alice', age: 25 };\nconsole.log(getProperty(person, 'name'));",
    tags: ['generics', 'types', 'advanced'],
    timeLimit: 180, targetWPM: 60,
    status: { isPublished: true, isFeatured: false },
  });
  log('POST /challenges — TypeScript advanced', [200, 201].includes(createTS.status));

  if (challengeId) {
    const getChallenge = await req('GET', `${BASE}/challenges/${challengeId}`);
    log('GET /challenges/:id', getChallenge.status === 200);

    const patchChallenge = await req('PATCH', `${BASE}/challenges/${challengeId}`, {
      targetWPM: 45, timeLimit: 100,
      status: { isFeatured: true },
    });
    log('PATCH /challenges/:id — update', [200, 201, 404].includes(patchChallenge.status));

    const patchStats = await req('PATCH', `${BASE}/challenges/${challengeId}/stats`, {
      'stats.timesPlayed': 1, 'stats.timesCompleted': 1,
    });
    log('PATCH /challenges/:id/stats — increment', [200, 201, 404].includes(patchStats.status));
  }

  const fakeChallenge = await req('GET', `${BASE}/challenges/000000000000000000000000`);
  log('GET /challenges/000... — 404 edge case', fakeChallenge.status === 404);

  // Sessions
  section('2. Game Sessions');
  if (challengeId) {
    const startSession = await req('POST', `${BASE}/sessions`, {
      userId: USER_A, challengeId,
      category: 'functions', mode: 'normal',
      timing: { startedAt: '2026-09-01T15:00:00.000Z' },
    });
    log('POST /sessions — start', [200, 201].includes(startSession.status));
    sessionId = startSession.body?.data?._id;

    if (sessionId) {
      const endHigh = await req('PATCH', `${BASE}/sessions/${sessionId}`, {
        timing: { startedAt: '2026-09-01T15:00:00.000Z', endedAt: '2026-09-01T15:01:45.000Z', durationSeconds: 105 },
        performance: { wpm: 68, rawWPM: 72, accuracy: 94.4, correctChars: 185, incorrectChars: 11, totalChars: 196, backspaceCount: 8 },
        results: { status: 'completed', passed: true, score: 6800, xpEarned: 120, streakBonus: 20 },
      });
      log('PATCH /sessions/:id — completed, 68 WPM', [200, 201].includes(endHigh.status));

      const startFail = await req('POST', `${BASE}/sessions`, {
        userId: USER_A, challengeId, category: 'functions', mode: 'normal',
        timing: { startedAt: '2026-09-01T15:00:00.000Z' },
      });
      const failId = startFail.body?.data?._id;
      if (failId) {
        const endFail = await req('PATCH', `${BASE}/sessions/${failId}`, {
          timing: { startedAt: '2026-09-01T15:00:00.000Z', endedAt: '2026-09-01T15:02:00.000Z', durationSeconds: 120 },
          performance: { wpm: 28, rawWPM: 31, accuracy: 82.5, correctChars: 90, incorrectChars: 19, totalChars: 109, backspaceCount: 15 },
          results: { status: 'failed', passed: false, score: 1200, xpEarned: 10, streakBonus: 0 },
        });
        log('PATCH /sessions/:id — failed (ran out of time)', [200, 201].includes(endFail.status));
      }

      const getSess = await req('GET', `${BASE}/sessions/${sessionId}`);
      log('GET /sessions/:id', [200, 404].includes(getSess.status));
    }

    const userSessions  = await req('GET', `${BASE}/sessions/user/${USER_A}`);
    log('GET /sessions/user/:userId', [200, 404].includes(userSessions.status));

    const filterStatus  = await req('GET', `${BASE}/sessions/user/${USER_A}?status=completed`);
    log('GET /sessions/user/:userId?status=completed', [200, 404].includes(filterStatus.status));

    const filterCat     = await req('GET', `${BASE}/sessions/user/${USER_A}?category=functions`);
    log('GET /sessions/user/:userId?category=functions', [200, 404].includes(filterCat.status));

    const bestSess      = await req('GET', `${BASE}/sessions/user/${USER_A}/best`);
    log('GET /sessions/user/:userId/best', [200, 404].includes(bestSess.status));
  }

  // Missing userId edge case
  const noUser = await req('POST', `${BASE}/sessions`, {
    challengeId: '000000000000000000000000', mode: 'normal',
  });
  log('POST /sessions — missing userId → 400 edge case', noUser.status === 400, '', noUser.body);

  // Inventory
  section('3. Inventory');
  const itemDefs = await req('GET', `${BASE}/inventory/items`);
  log('GET /inventory/items — all definitions', [200, 404].includes(itemDefs.status));

  const createItem = await req('POST', `${BASE}/inventory/items`, {
    itemId: 'code_boost_x2',
    name: 'Code Boost x2',
    description: 'Doubles XP earned for the next session',
    type: 'boost', rarity: 'rare',
    effect: { xpMultiplier: 2.0, durationSessions: 1 },
    price: 500,
  });
  log('POST /inventory/items — create definition', [200, 201, 409].includes(createItem.status));

  const createInv = await req('POST', `${BASE}/inventory`, {
    userId: USER_A, items: [],
    currency: { coins: 100, gems: 5 },
  });
  log('POST /inventory — create user inventory', [200, 201, 409].includes(createInv.status));

  const getInv    = await req('GET', `${BASE}/inventory/${USER_A}`);
  log('GET /inventory/:userId', [200, 404].includes(getInv.status));

  const updateInv = await req('PATCH', `${BASE}/inventory/${USER_A}`, {
    'currency.coins': 350, 'currency.gems': 8,
  });
  log('PATCH /inventory/:userId — set coins/gems', [200, 201, 404].includes(updateInv.status));
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TYPING MATH
// ─────────────────────────────────────────────────────────────────────────────
async function testTypingMath() {
  if (GAME_FILTER && GAME_FILTER !== 'typing-math') return;
  gameHeader('➕', 'Typing Math  —  /api/typing-math');

  const BASE = '/api/typing-math';
  let problemId1, problemId2, problemId3, sessionId, dailyChallengeId;

  // Math Problems
  section('1. Math Problems');
  const problems    = await req('GET', `${BASE}/problems`);
  log('GET /problems — list all', problems.status === 200);

  const filterAdd   = await req('GET', `${BASE}/problems?operation=addition`);
  log('GET /problems?operation=addition', filterAdd.status === 200);

  const filterMed   = await req('GET', `${BASE}/problems?difficulty=medium`);
  log('GET /problems?difficulty=medium', filterMed.status === 200);

  const filterActive = await req('GET', `${BASE}/problems?isActive=true`);
  log('GET /problems?isActive=true', filterActive.status === 200);

  // Create problems
  const p1 = await req('POST', `${BASE}/problems`, {
    problemId: 'add-001',
    question: 'What is 47 + 38?',
    answer: '85',
    operation: 'addition', difficulty: 'easy', category: 'arithmetic',
    hints: ['Try breaking it into 47 + 30 = 77, then 77 + 8'],
    explanation: '47 + 38 = (40 + 30) + (7 + 8) = 70 + 15 = 85',
    difficultyAdjustments: { recommendedForLevel: 1, timeLimitSeconds: 15 },
    status: { isActive: true },
  });
  log('POST /problems — addition easy', [200, 201, 409].includes(p1.status));
  problemId1 = p1.body?.data?._id;
  if (!problemId1 && p1.status === 409) problemId1 = filterAdd.body?.data?.[0]?._id;

  const p2 = await req('POST', `${BASE}/problems`, {
    problemId: 'mul-001',
    question: 'What is 13 x 14?',
    answer: '182',
    operation: 'multiplication', difficulty: 'medium', category: 'arithmetic',
    hints: ['Try 13 x 10 = 130, then 13 x 4 = 52'],
    explanation: '13 x 14 = 13 x 10 + 13 x 4 = 130 + 52 = 182',
    difficultyAdjustments: { recommendedForLevel: 3, timeLimitSeconds: 20 },
    status: { isActive: true },
  });
  log('POST /problems — multiplication medium', [200, 201, 409].includes(p2.status));
  problemId2 = p2.body?.data?._id;

  const p3 = await req('POST', `${BASE}/problems`, {
    problemId: 'alg-001',
    question: 'Solve for x: 3x + 7 = 22',
    answer: '5',
    operation: 'algebra', difficulty: 'hard', category: 'algebra',
    hints: ['Subtract 7 from both sides first', 'Then divide by 3'],
    explanation: '3x + 7 = 22 => 3x = 15 => x = 5',
    difficultyAdjustments: { recommendedForLevel: 5, timeLimitSeconds: 30 },
    status: { isActive: true },
  });
  log('POST /problems — algebra hard', [200, 201, 409].includes(p3.status));
  problemId3 = p3.body?.data?._id;

  if (problemId1) {
    const getProblem = await req('GET', `${BASE}/problems/${problemId1}`);
    log('GET /problems/:id', getProblem.status === 200);

    const patchProblem = await req('PATCH', `${BASE}/problems/${problemId1}`, {
      difficultyAdjustments: { timeLimitSeconds: 12 },
      status: { isFeatured: true },
    });
    log('PATCH /problems/:id — update', [200, 201, 404].includes(patchProblem.status));

    const patchStatsOk = await req('PATCH', `${BASE}/problems/${problemId1}/stats`, {
      'stats.timesAttempted': 1, 'stats.timesCorrect': 1,
    });
    log('PATCH /problems/:id/stats — correct', [200, 201, 404].includes(patchStatsOk.status));

    const patchStatsBad = await req('PATCH', `${BASE}/problems/${problemId1}/stats`, {
      'stats.timesAttempted': 1, 'stats.timesCorrect': 0, 'stats.timesIncorrect': 1,
    });
    log('PATCH /problems/:id/stats — wrong', [200, 201, 404].includes(patchStatsBad.status));
  }

  // Duplicate problemId edge case
  const dupProblem = await req('POST', `${BASE}/problems`, {
    problemId: 'add-001',
    question: 'Duplicate?', answer: '0',
    operation: 'addition', difficulty: 'easy', category: 'arithmetic',
    status: { isActive: true },
  });
  log('POST /problems — duplicate problemId → 409 edge case', dupProblem.status === 409, '', dupProblem.body);

  // Sessions
  section('2. Game Sessions');
  const pIds = [problemId1, problemId2, problemId3].filter(Boolean);

  if (pIds.length > 0) {
    const startSession = await req('POST', `${BASE}/sessions`, {
      userId: USER_A, mode: 'normal', difficulty: 'medium', category: 'arithmetic',
      problemIds: pIds,
      timing: { startedAt: '2026-09-01T15:00:00.000Z' },
    });
    log('POST /sessions — start', [200, 201].includes(startSession.status));
    sessionId = startSession.body?.data?._id;

    if (sessionId) {
      // Good performance
      const endGood = await req('PATCH', `${BASE}/sessions/${sessionId}`, {
        timing: { endedAt: '2026-09-01T15:03:30.000Z', durationSeconds: 210 },
        performance: {
          totalProblems: 10, correctAnswers: 8, incorrectAnswers: 2, skippedProblems: 0,
          accuracy: 80.0, averageSolveTimeMs: 4200, fastestSolveTimeMs: 2100, slowestSolveTimeMs: 8900, wpm: 32,
        },
        results: { status: 'completed', passed: true, score: 8200, xpEarned: 95, streakBonus: 15 },
      });
      log('PATCH /sessions/:id — good performance (80% accuracy)', [200, 201].includes(endGood.status));

      // Perfect score
      const startPerfect = await req('POST', `${BASE}/sessions`, {
        userId: USER_A, mode: 'normal', difficulty: 'medium', category: 'arithmetic',
        problemIds: pIds, timing: { startedAt: '2026-09-01T15:05:00.000Z' },
      });
      const perfectId = startPerfect.body?.data?._id;
      if (perfectId) {
        const endPerfect = await req('PATCH', `${BASE}/sessions/${perfectId}`, {
          timing: { endedAt: '2026-09-01T15:07:00.000Z', durationSeconds: 120 },
          performance: {
            totalProblems: 10, correctAnswers: 10, incorrectAnswers: 0, skippedProblems: 0,
            accuracy: 100.0, averageSolveTimeMs: 3100, fastestSolveTimeMs: 1800, slowestSolveTimeMs: 5200, wpm: 41,
          },
          results: { status: 'completed', passed: true, score: 12500, xpEarned: 150, streakBonus: 50 },
        });
        log('PATCH /sessions/:id — perfect score (100%)', [200, 201].includes(endPerfect.status));
      }
    }

    // Attempts
    section('3. Problem Attempts');
    if (sessionId && problemId1) {
      const singleAttempt = await req('POST', `${BASE}/attempts`, {
        userId: USER_A, sessionId, problemId: problemId1,
        userAnswer: '85', isCorrect: true, solveTimeMs: 3200, hintsUsed: 0, attemptNumber: 1,
      });
      log('POST /attempts — single', [200, 201].includes(singleAttempt.status));

      const bulkAttempts = await req('POST', `${BASE}/attempts/bulk`, {
        attempts: [
          { userId: USER_A, sessionId, problemId: problemId1, userAnswer: '85', isCorrect: true,  solveTimeMs: 3100, hintsUsed: 0, attemptNumber: 1 },
          { userId: USER_A, sessionId, problemId: problemId2 ?? problemId1, userAnswer: '180', isCorrect: false, solveTimeMs: 8900, hintsUsed: 1, attemptNumber: 1 },
          { userId: USER_A, sessionId, problemId: problemId3 ?? problemId1, userAnswer: '5',   isCorrect: true,  solveTimeMs: 5400, hintsUsed: 1, attemptNumber: 2 },
        ],
      });
      log('POST /attempts/bulk — 3 attempts', [200, 201].includes(bulkAttempts.status));

      const getAttemptsBySess = await req('GET', `${BASE}/attempts/session/${sessionId}`);
      log('GET /attempts/session/:sessionId', [200, 404].includes(getAttemptsBySess.status));
    }

    const userAttempts = await req('GET', `${BASE}/attempts/user/${USER_A}`);
    log('GET /attempts/user/:userId', [200, 404].includes(userAttempts.status));

    const userSessions     = await req('GET', `${BASE}/sessions/user/${USER_A}`);
    log('GET /sessions/user/:userId', [200, 404].includes(userSessions.status));

    const filterCompleted  = await req('GET', `${BASE}/sessions/user/${USER_A}?status=completed`);
    log('GET /sessions/user/:userId?status=completed', [200, 404].includes(filterCompleted.status));

    const bestSession      = await req('GET', `${BASE}/sessions/user/${USER_A}/best`);
    log('GET /sessions/user/:userId/best', [200, 404].includes(bestSession.status));
  } else {
    log('Sessions & Attempts — skipped (no problemIds)', false);
  }

  // Daily Challenges
  section('4. Daily Challenges');
  const today    = await req('GET', `${BASE}/daily-challenges/today`);
  log('GET /daily-challenges/today', [200, 404].includes(today.status));

  const allDaily = await req('GET', `${BASE}/daily-challenges`);
  log('GET /daily-challenges — all', [200, 404].includes(allDaily.status));

  if (problemId1) {
    const createDaily = await req('POST', `${BASE}/daily-challenges`, {
      date: '2026-09-08',
      title: 'Speed Round Monday',
      description: '10 mixed arithmetic problems — how fast can you go?',
      difficulty: 'medium',
      problemIds: [problemId1, problemId2, problemId3].filter(Boolean),
      timeLimit: 180, bonusXP: 50, isActive: true,
    });
    log('POST /daily-challenges — create', [200, 201, 409].includes(createDaily.status));
    dailyChallengeId = createDaily.body?.data?._id;

    if (dailyChallengeId) {
      const patchDaily = await req('PATCH', `${BASE}/daily-challenges/${dailyChallengeId}`, {
        bonusXP: 75, isActive: true,
      });
      log('PATCH /daily-challenges/:id — update bonusXP', [200, 201, 404].includes(patchDaily.status));

      const submitScore = await req('PATCH', `${BASE}/daily-challenges/${dailyChallengeId}/top-scores`, {
        userId: USER_A,
        username: 'speedtyper99',
        score: 9800,
        accuracy: 95.0,
        solveTimeMs: 142000,
        submittedAt: '2026-09-08T15:30:00.000Z',
      });
      log('PATCH /daily-challenges/:id/top-scores — submit score', [200, 201, 404].includes(submitScore.status));
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(65));
console.log('  🎮  KAPP — All-Games API Test Suite');
console.log(`  📡  Base URL : ${BASE_URL}`);
if (GAME_FILTER) console.log(`  🎯  Game     : ${GAME_FILTER}`);
if (VERBOSE)     console.log('  📝  Verbose  : ON');
console.log('═'.repeat(65));

const t0 = Date.now();

await testDragonDrop();
await testKoompiTyping();
await testLinkNumber();
await testMouseMaster();
await testRobotBrainiac();
await testTypingCode();
await testTypingMath();

const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

// Summary
console.log('\n' + '═'.repeat(65));
console.log('  📊  RESULTS SUMMARY');
console.log('═'.repeat(65));
console.log(`  ✅  Passed  : ${passed}`);
console.log(`  ❌  Failed  : ${failed}`);
console.log(`  ⏱️   Duration: ${elapsed}s`);

if (failures.length > 0) {
  console.log('\n  Failed tests:');
  failures.forEach(f => console.error(`    ❌  ${f.label}${f.extra ? ' — ' + f.extra : ''}`));
}

console.log('═'.repeat(65) + '\n');
process.exit(failed > 0 ? 1 : 0);
