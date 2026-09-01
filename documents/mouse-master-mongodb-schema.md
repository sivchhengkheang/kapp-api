# Mouse Master — MongoDB Schema (Draft)

> ⚠️ **Source limitation**: `master-mouse.vercel.app` is a client-rendered SPA. Automated fetch/search only exposed page metadata (title "Mouse Master | Adventures", description "A fun game to learn mouse skills for kids!", theme `#58cc02`) — not the real data model. This schema is a best-effort design based on that metadata, standard mouse-skills-trainer mechanics (click / double-click / right-click / drag / scroll / trace), and your existing four-game platform conventions (shared `users_account`, XP, achievements). **Validate against the real app** (browser devtools → Network/IndexedDB, or the source repo) before shipping.

---

## 1. Collection Overview

```
mouse_master_game/
├── skill_categories_mouse   (the 5 skill tracks)
├── mouse_levels             (level/challenge definitions)
├── game_sessions_mouse      (one per play session)
├── challenge_attempts_mouse (one per individual target/action within a session)
├── user_progress_mouse      (per-user, per-level best result)
├── skill_badges_mouse       (earned badges per skill category)
├── game_modes_mouse         (practice / timed / challenge)
└── leaderboards_mouse       (denormalized ranking snapshots)
```

Shared/cross-game collections referenced but owned elsewhere: `users_account`, `user_profile`, `user_statistics`, `user_achievements`.

---

## 2. Collection Schemas

### `skill_categories_mouse`
Defines the 5 skill tracks and their unlock order.

```javascript
{
  _id: ObjectId,
  categoryKey: "click_basics",       // "click_basics" | "double_right_click" | "drag_drop" | "scroll_precision" | "mixed_challenge"
  name: "Click Basics",
  description: "Hit static targets with a single click",
  order: 1,                          // unlock sequence
  levelRange: { start: 1, end: 5 },
  icon: "target",
  unlockRequirement: {
    type: "none" | "previous_category_complete",
    previousCategoryKey: null
  }
}
```

### `mouse_levels`
The challenge/level definitions (content, not user data).

```javascript
{
  _id: ObjectId,
  levelNumber: 7,
  categoryId: ObjectId,              // ref → skill_categories_mouse
  challengeType: "double_click",     // "click" | "double_click" | "right_click" | "drag" | "scroll" | "trace"
  difficulty: 2,                     // 1-5 scale within category
  config: {
    targetCount: 10,
    targetSizePx: 40,                // shrinks as difficulty increases
    targetSpeed: 0,                  // 0 = static, >0 = moving target px/sec
    movementPattern: "static",       // "static" | "linear" | "random" | "circular"
    dragZone: null,                  // { fromRect, toRect } for drag challenges
    scrollDistancePx: null,          // for scroll challenges
    tracePath: null,                 // SVG path string, for steady-hand tracing
    timeLimitMs: 15000
  },
  passThreshold: {
    minAccuracyPct: 80,
    maxAvgReactionMs: 800
  },
  xpReward: 50,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### `game_sessions_mouse`
One document per play session (a single level attempt run).

```javascript
{
  _id: ObjectId,
  userAccountId: ObjectId,           // ref → users_account
  levelId: ObjectId,                 // ref → mouse_levels
  gameModeId: ObjectId,              // ref → game_modes_mouse
  startedAt: ISODate,
  endedAt: ISODate,
  durationMs: 14230,

  // Aggregated results (denormalized for fast reads)
  targetsShown: 10,
  targetsHit: 9,
  targetsMissed: 1,
  accuracyPct: 90.0,
  avgReactionTimeMs: 412,
  fastestReactionMs: 210,
  slowestReactionMs: 890,
  overshootCount: 2,                 // clicks that landed near but outside target
  deviationScore: null,              // for trace challenges: avg px deviation from path

  passed: true,
  starsEarned: 3,                    // optional 1-3 star rating, mirrors Dragon Drop convention
  xpEarned: 45,                      // xpReward × accuracy multiplier

  deviceInfo: {
    inputType: "mouse",              // "mouse" | "trackpad" | "touch"
    screenWidth: 1920,
    screenHeight: 1080
  },

  createdAt: ISODate
}
```

### `challenge_attempts_mouse`
Fine-grained event log — one document per target/action within a session. Useful for analytics and anti-cheat/replay.

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,               // ref → game_sessions_mouse
  targetIndex: 3,                    // order within the session
  targetPosition: { x: 512, y: 340 },
  clickPosition: { x: 518, y: 344 }, // null if missed / timed out
  hit: true,
  reactionTimeMs: 380,
  overshootPx: 7.2,                  // distance between click and target center
  actionType: "click",               // matches challengeType on the level
  timestamp: ISODate
}
```
> High-volume collection — consider a TTL index (e.g. 90 days) or periodic archival/rollup into `game_sessions_mouse` aggregates if storage is a concern.

### `user_progress_mouse`
Per-user, per-level best/latest result — powers the level-select screen and unlock logic.

```javascript
{
  _id: ObjectId,
  userAccountId: ObjectId,
  levelId: ObjectId,
  status: "completed",               // "locked" | "unlocked" | "completed"
  bestAccuracyPct: 96.0,
  bestAvgReactionMs: 350,
  bestStars: 3,
  attemptsCount: 4,
  firstCompletedAt: ISODate,
  lastPlayedAt: ISODate
}
```
Unique index: `{ userAccountId: 1, levelId: 1 }`

### `skill_badges_mouse`
Earned badges per skill category (Clicker, Dragger, Scroller, Steady Hand, Mouse Master).

```javascript
{
  _id: ObjectId,
  userAccountId: ObjectId,
  categoryKey: "drag_drop",
  badgeName: "Dragger Badge",
  earnedAt: ISODate,
  levelIdOnEarn: ObjectId
}
```

### `game_modes_mouse`
```javascript
{
  _id: ObjectId,
  modeKey: "practice",               // "practice" | "timed" | "daily_challenge"
  name: "Practice Mode",
  description: "No time pressure, unlimited retries",
  affectsLeaderboard: false
}
```

### `leaderboards_mouse`
Denormalized snapshots for fast leaderboard reads (recomputed on a schedule or on session completion).

```javascript
{
  _id: ObjectId,
  boardType: "global",               // "global" | "by_category" | "weekly" | "friends" | "reflex"
  categoryKey: null,                 // set when boardType = "by_category"
  periodStart: ISODate,              // set for weekly boards
  periodEnd: ISODate,
  rankings: [
    {
      userAccountId: ObjectId,
      displayName: "Alice",
      score: 94.3,                   // e.g. accuracyPct weighted by 1/avgReactionTimeMs
      avgReactionTimeMs: 320,
      accuracyPct: 96.5,
      rank: 1
    }
    // ...
  ],
  computedAt: ISODate
}
```
Score formula suggestion (matches the existing platform pattern of `metric × modifier`):
```
score = accuracyPct * (1000 / avgReactionTimeMs)
```

---

## 3. Recommended Indexes

```javascript
db.mouse_levels.createIndex({ categoryId: 1, levelNumber: 1 }, { unique: true });

db.game_sessions_mouse.createIndex({ userAccountId: 1, levelId: 1, createdAt: -1 });
db.game_sessions_mouse.createIndex({ levelId: 1, accuracyPct: -1 }); // per-level leaderboard queries

db.challenge_attempts_mouse.createIndex({ sessionId: 1, targetIndex: 1 });
db.challenge_attempts_mouse.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90-day TTL, optional

db.user_progress_mouse.createIndex({ userAccountId: 1, levelId: 1 }, { unique: true });
db.user_progress_mouse.createIndex({ userAccountId: 1, status: 1 });

db.skill_badges_mouse.createIndex({ userAccountId: 1, categoryKey: 1 }, { unique: true });

db.leaderboards_mouse.createIndex({ boardType: 1, categoryKey: 1, periodStart: -1 });
```

---

## 4. Integration with Shared Collections

```javascript
// user_statistics.gameStats.mouse_master (updated after each session)
{
  levelsCompleted: 12,
  accuracyPct: 93.4,          // running average
  avgReactionTimeMs: 360,
  skillBadgesEarned: 3,
  totalSessionsPlayed: 40,
  lastPlayedAt: ISODate
}

// user_achievements (unified badge system) — Mouse Master entries reference
{
  userAccountId: ObjectId,
  achievementKey: "mouse_sharp_shooter",   // "mouse_steady_hand", "mouse_reflex_master", etc.
  earnedAt: ISODate,
  sourceGame: "mouse_master"
}
```

---

## 5. Write Path (typical session flow)

```
1. Client requests level  → read mouse_levels + user_progress_mouse (unlock check)
2. Client streams events  → insert challenge_attempts_mouse (or buffer client-side, batch insert on session end)
3. Session ends           → insert game_sessions_mouse (aggregated result)
4. Post-session hooks:
   a. Upsert user_progress_mouse (best-of comparison)
   b. Upsert user_statistics.gameStats.mouse_master
   c. Check + insert skill_badges_mouse / user_achievements if thresholds met
   d. Enqueue leaderboards_mouse recompute (async job, not inline)
```

---

## 6. Open Questions to Resolve Against the Real App

- Does Mouse Master have a story/world wrapper (like Dragon Drop) or is it purely skill-drill based?
- Is there a "daily challenge" mode (like Typing Math)?
- Are targets ever multi-touch/multi-target-simultaneous, or strictly one-at-a-time?
- Is scroll measured by distance, direction accuracy, or a target "stop zone"?
- Any age-gating or parental-dashboard data to store (given the "for kids" framing)?
