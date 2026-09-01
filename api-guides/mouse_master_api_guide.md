# 🖱️ Mouse Master — API Testing Guide

> Base URL: `http://localhost:5050/api/mouse-master`
> All requests use `Content-Type: application/json`

---

## 🗂️ Real IDs (already seeded in DB)

| Resource | Key | ID |
|---|---|---|
| Category | `click_basics` | `6a96e94ad22bdfa883f45547` |
| Game Mode | `practice` | `6a96e94cd22bdfa883f45548` |
| Level | level 1 (click) | `6a96e94cd22bdfa883f45549` |
| Test User | *(placeholder)* | `60d5ec49f1a2b830a8a1e001` |

> **Tip**: Copy IDs from each response into the next request where needed.

---

## 1. 📂 Skill Categories

### GET — List all categories
```http
GET /api/mouse-master/categories
```
**Expected response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6a96e94ad22bdfa883f45547",
      "categoryKey": "click_basics",
      "name": "Click Basics",
      "description": "Hit static targets with a single click",
      "order": 1,
      "levelRange": { "start": 1, "end": 5 },
      "icon": "target",
      "unlockRequirement": { "type": "none", "previousCategoryKey": null }
    }
  ]
}
```

---

### GET — Single category by key
```http
GET /api/mouse-master/categories/click_basics
```

---

### POST — Create a new category (seed more skill tracks)
```http
POST /api/mouse-master/categories
```
```json
{
  "categoryKey": "drag_drop",
  "name": "Drag & Drop",
  "description": "Drag items from one zone to another accurately",
  "order": 3,
  "levelRange": { "start": 11, "end": 15 },
  "icon": "hand",
  "unlockRequirement": {
    "type": "previous_category_complete",
    "previousCategoryKey": "double_right_click"
  }
}
```

> Create all 5 to unlock the full game:

| categoryKey | name | order |
|---|---|---|
| `click_basics` | Click Basics | 1 |
| `double_right_click` | Double & Right Click | 2 |
| `drag_drop` | Drag & Drop | 3 |
| `scroll_precision` | Scroll Precision | 4 |
| `mixed_challenge` | Mixed Challenge | 5 |

---

## 2. 🎮 Game Modes

### GET — List all modes
```http
GET /api/mouse-master/modes
```

---

### GET — Single mode
```http
GET /api/mouse-master/modes/practice
```

---

### POST — Create more game modes
```http
POST /api/mouse-master/modes
```
```json
{
  "modeKey": "timed",
  "name": "Timed Mode",
  "description": "Race against the clock for a high score",
  "affectsLeaderboard": true
}
```

```json
{
  "modeKey": "daily_challenge",
  "name": "Daily Challenge",
  "description": "One special challenge per day — compete globally",
  "affectsLeaderboard": true
}
```

---

## 3. 🏁 Mouse Levels

### GET — List all levels
```http
GET /api/mouse-master/levels
```

### GET — Filter by category
```http
GET /api/mouse-master/levels?categoryId=6a96e94ad22bdfa883f45547
```

### GET — Filter by difficulty
```http
GET /api/mouse-master/levels?difficulty=2
```

### GET — Levels for a skill track (level-select screen)
```http
GET /api/mouse-master/levels/category/click_basics
```

### GET — Single level
```http
GET /api/mouse-master/levels/6a96e94cd22bdfa883f45549
```

---

### POST — Create new levels

**Level 2 — Smaller targets (click)**
```http
POST /api/mouse-master/levels
```
```json
{
  "levelNumber": 2,
  "categoryId": "6a96e94ad22bdfa883f45547",
  "challengeType": "click",
  "difficulty": 2,
  "config": {
    "targetCount": 12,
    "targetSizePx": 45,
    "targetSpeed": 0,
    "movementPattern": "static",
    "timeLimitMs": 18000
  },
  "passThreshold": {
    "minAccuracyPct": 75,
    "maxAvgReactionMs": 900
  },
  "xpReward": 75
}
```

**Level 3 — Moving targets (click)**
```json
{
  "levelNumber": 3,
  "categoryId": "6a96e94ad22bdfa883f45547",
  "challengeType": "click",
  "difficulty": 3,
  "config": {
    "targetCount": 10,
    "targetSizePx": 40,
    "targetSpeed": 80,
    "movementPattern": "linear",
    "timeLimitMs": 20000
  },
  "passThreshold": {
    "minAccuracyPct": 80,
    "maxAvgReactionMs": 800
  },
  "xpReward": 100
}
```

**Drag & Drop level (requires drag_drop category ID)**
```json
{
  "levelNumber": 11,
  "categoryId": "<drag_drop_category_id>",
  "challengeType": "drag",
  "difficulty": 1,
  "config": {
    "targetCount": 5,
    "targetSizePx": 60,
    "targetSpeed": 0,
    "movementPattern": "static",
    "dragZone": {
      "fromRect": { "x": 50, "y": 200, "width": 100, "height": 100 },
      "toRect":   { "x": 600, "y": 200, "width": 100, "height": 100 }
    },
    "timeLimitMs": 30000
  },
  "passThreshold": {
    "minAccuracyPct": 70,
    "maxAvgReactionMs": 2000
  },
  "xpReward": 80
}
```

**Scroll Precision level**
```json
{
  "levelNumber": 16,
  "categoryId": "<scroll_precision_category_id>",
  "challengeType": "scroll",
  "difficulty": 1,
  "config": {
    "targetCount": 5,
    "targetSizePx": 50,
    "targetSpeed": 0,
    "movementPattern": "static",
    "scrollDistancePx": 400,
    "timeLimitMs": 25000
  },
  "passThreshold": {
    "minAccuracyPct": 70,
    "maxAvgReactionMs": 1500
  },
  "xpReward": 90
}
```

### PATCH — Update a level
```http
PATCH /api/mouse-master/levels/6a96e94cd22bdfa883f45549
```
```json
{
  "config": {
    "targetCount": 10,
    "targetSizePx": 55,
    "targetSpeed": 0,
    "movementPattern": "static",
    "timeLimitMs": 18000
  },
  "xpReward": 60
}
```

---

## 4. 🎯 Game Sessions — Full Play Flow

### Step 1 — Start a session
```http
POST /api/mouse-master/sessions
```
```json
{
  "userAccountId": "60d5ec49f1a2b830a8a1e001",
  "levelId": "6a96e94cd22bdfa883f45549",
  "gameModeId": "6a96e94cd22bdfa883f45548",
  "deviceInfo": {
    "inputType": "mouse",
    "screenWidth": 1920,
    "screenHeight": 1080
  }
}
```
**Expected response:**
```json
{
  "success": true,
  "data": {
    "_id": "COPY_THIS_SESSION_ID",
    "userAccountId": "60d5ec49f1a2b830a8a1e001",
    "levelId": "6a96e94cd22bdfa883f45549",
    "gameModeId": "6a96e94cd22bdfa883f45548",
    "startedAt": "2026-09-01T14:55:00.000Z",
    "passed": false,
    "starsEarned": 0,
    "xpEarned": 0
  }
}
```

> 📋 **Copy** `data._id` → use as `sessionId` in next steps

---

### Step 2 — Submit challenge attempts (bulk)

> Simulates 10 target events: 9 hits, 1 miss

```http
POST /api/mouse-master/attempts/bulk
```
```json
{
  "attempts": [
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 0,
      "targetPosition": { "x": 320, "y": 240 },
      "clickPosition":  { "x": 322, "y": 241 },
      "hit": true,
      "reactionTimeMs": 310,
      "overshootPx": 2.2,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:00.500Z"
    },
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 1,
      "targetPosition": { "x": 800, "y": 350 },
      "clickPosition":  { "x": 803, "y": 347 },
      "hit": true,
      "reactionTimeMs": 425,
      "overshootPx": 4.2,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:01.200Z"
    },
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 2,
      "targetPosition": { "x": 500, "y": 500 },
      "clickPosition":  { "x": 498, "y": 502 },
      "hit": true,
      "reactionTimeMs": 380,
      "overshootPx": 2.8,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:02.100Z"
    },
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 3,
      "targetPosition": { "x": 150, "y": 600 },
      "clickPosition":  { "x": 152, "y": 599 },
      "hit": true,
      "reactionTimeMs": 290,
      "overshootPx": 2.2,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:02.900Z"
    },
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 4,
      "targetPosition": { "x": 960, "y": 200 },
      "clickPosition":  { "x": 964, "y": 198 },
      "hit": true,
      "reactionTimeMs": 510,
      "overshootPx": 4.5,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:04.100Z"
    },
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 5,
      "targetPosition": { "x": 700, "y": 450 },
      "clickPosition":  { "x": 701, "y": 448 },
      "hit": true,
      "reactionTimeMs": 340,
      "overshootPx": 2.2,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:05.000Z"
    },
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 6,
      "targetPosition": { "x": 200, "y": 300 },
      "clickPosition":  { "x": 199, "y": 303 },
      "hit": true,
      "reactionTimeMs": 410,
      "overshootPx": 3.2,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:06.100Z"
    },
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 7,
      "targetPosition": { "x": 1100, "y": 350 },
      "clickPosition":  { "x": 1097, "y": 352 },
      "hit": true,
      "reactionTimeMs": 360,
      "overshootPx": 3.6,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:07.000Z"
    },
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 8,
      "targetPosition": { "x": 600, "y": 150 },
      "clickPosition":  { "x": 598, "y": 153 },
      "hit": true,
      "reactionTimeMs": 280,
      "overshootPx": 3.6,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:07.800Z"
    },
    {
      "sessionId": "PASTE_SESSION_ID_HERE",
      "targetIndex": 9,
      "targetPosition": { "x": 400, "y": 700 },
      "clickPosition": null,
      "hit": false,
      "reactionTimeMs": null,
      "overshootPx": null,
      "actionType": "click",
      "timestamp": "2026-09-01T15:00:09.500Z"
    }
  ]
}
```

---

### Step 3 — Complete the session (triggers all post-session hooks)

> Score: 9/10 = 90% accuracy, avg reaction 370ms → **3 stars, passed**

```http
PATCH /api/mouse-master/sessions/PASTE_SESSION_ID_HERE/complete
```
```json
{
  "endedAt": "2026-09-01T15:00:11.000Z",
  "durationMs": 11000,
  "targetsShown": 10,
  "targetsHit": 9,
  "targetsMissed": 1,
  "accuracyPct": 90.0,
  "avgReactionTimeMs": 370,
  "fastestReactionMs": 280,
  "slowestReactionMs": 510,
  "overshootCount": 2,
  "deviationScore": null,
  "passed": true,
  "starsEarned": 3,
  "xpEarned": 45
}
```

**What happens automatically:**
- ✅ `UserProgressMouse` upserted → `status: "completed"`, `bestAccuracyPct: 90`, `bestStars: 3`
- ✅ `UserStatistic.gameStats.mouse_master` updated with rolling averages
- ✅ `SkillBadgeMouse` "Clicker Badge" awarded if all levels in `click_basics` are done
- ✅ `UserAchievement` awarded if `mixed_challenge` category is fully complete

**Example response:**
```json
{
  "success": true,
  "data": {
    "_id": "PASTE_SESSION_ID_HERE",
    "passed": true,
    "starsEarned": 3,
    "xpEarned": 45,
    "accuracyPct": 90,
    "avgReactionTimeMs": 370,
    "fastestReactionMs": 280,
    "slowestReactionMs": 510,
    "targetsHit": 9,
    "targetsMissed": 1
  },
  "postSession": {
    "badgeAwarded": null,
    "achievementsUnlocked": []
  }
}
```

---

### Step 4 — Failed session (for contrast)

```http
POST /api/mouse-master/sessions
```
*(Same body as Step 1 — creates a new session)*

Then complete it with a fail:
```http
PATCH /api/mouse-master/sessions/NEW_SESSION_ID/complete
```
```json
{
  "endedAt": "2026-09-01T15:05:00.000Z",
  "durationMs": 15000,
  "targetsShown": 10,
  "targetsHit": 5,
  "targetsMissed": 5,
  "accuracyPct": 50.0,
  "avgReactionTimeMs": 850,
  "fastestReactionMs": 620,
  "slowestReactionMs": 1200,
  "overshootCount": 5,
  "deviationScore": null,
  "passed": false,
  "starsEarned": 0,
  "xpEarned": 0
}
```

---

## 5. 📊 User Progress

### GET — All progress (level-select screen)
```http
GET /api/mouse-master/progress/user/60d5ec49f1a2b830a8a1e001
```

### GET — Filter by status
```http
GET /api/mouse-master/progress/user/60d5ec49f1a2b830a8a1e001?status=completed
GET /api/mouse-master/progress/user/60d5ec49f1a2b830a8a1e001?status=unlocked
GET /api/mouse-master/progress/user/60d5ec49f1a2b830a8a1e001?status=locked
```

### GET — Progress for one specific level
```http
GET /api/mouse-master/progress/user/60d5ec49f1a2b830a8a1e001/level/6a96e94cd22bdfa883f45549
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "userAccountId": "60d5ec49f1a2b830a8a1e001",
    "levelId": "6a96e94cd22bdfa883f45549",
    "status": "completed",
    "bestAccuracyPct": 90,
    "bestAvgReactionMs": 370,
    "bestStars": 3,
    "attemptsCount": 1,
    "firstCompletedAt": "2026-09-01T15:00:11.000Z",
    "lastPlayedAt": "2026-09-01T15:00:11.000Z"
  }
}
```

### POST — Unlock a level manually
```http
POST /api/mouse-master/progress
```
```json
{
  "userAccountId": "60d5ec49f1a2b830a8a1e001",
  "levelId": "6a96e94cd22bdfa883f45549"
}
```

### PATCH — Manually upsert progress
```http
PATCH /api/mouse-master/progress/user/60d5ec49f1a2b830a8a1e001/level/6a96e94cd22bdfa883f45549
```
```json
{
  "status": "completed",
  "bestAccuracyPct": 95.0,
  "bestAvgReactionMs": 310,
  "bestStars": 3,
  "attemptsCount": 2
}
```

---

## 6. 🏅 Skill Badges

### GET — All badges for a user
```http
GET /api/mouse-master/badges/user/60d5ec49f1a2b830a8a1e001
```
**Expected response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "userAccountId": "60d5ec49f1a2b830a8a1e001",
      "categoryKey": "click_basics",
      "badgeName": "Clicker Badge",
      "earnedAt": "2026-09-01T15:00:11.000Z"
    }
  ]
}
```

### GET — Specific category badge
```http
GET /api/mouse-master/badges/user/60d5ec49f1a2b830a8a1e001/click_basics
```

### POST — Award a badge manually
```http
POST /api/mouse-master/badges
```
```json
{
  "userAccountId": "60d5ec49f1a2b830a8a1e001",
  "categoryKey": "drag_drop",
  "badgeName": "Dragger Badge",
  "earnedAt": "2026-09-01T16:00:00.000Z",
  "levelIdOnEarn": "6a96e94cd22bdfa883f45549"
}
```
> Sending the **same categoryKey twice** returns `409 Conflict` — badge already earned.

---

## 7. 📋 Session History

### GET — All sessions for a user
```http
GET /api/mouse-master/sessions/user/60d5ec49f1a2b830a8a1e001
```

### GET — Only passed sessions
```http
GET /api/mouse-master/sessions/user/60d5ec49f1a2b830a8a1e001?passed=true
```

### GET — Only failed sessions
```http
GET /api/mouse-master/sessions/user/60d5ec49f1a2b830a8a1e001?passed=false
```

### GET — Paginated (page 2, 5 per page)
```http
GET /api/mouse-master/sessions/user/60d5ec49f1a2b830a8a1e001?page=1&limit=5
```

### GET — Best session (highest accuracy + fastest)
```http
GET /api/mouse-master/sessions/user/60d5ec49f1a2b830a8a1e001/best
```

### GET — Single session detail
```http
GET /api/mouse-master/sessions/PASTE_SESSION_ID_HERE
```

---

## 8. 🎯 Single Attempt (Real-time)

> Use this instead of bulk when streaming events live.

```http
POST /api/mouse-master/attempts
```
```json
{
  "sessionId": "PASTE_SESSION_ID_HERE",
  "targetIndex": 0,
  "targetPosition": { "x": 450, "y": 300 },
  "clickPosition":  { "x": 452, "y": 298 },
  "hit": true,
  "reactionTimeMs": 320,
  "overshootPx": 2.8,
  "actionType": "click",
  "timestamp": "2026-09-01T15:00:00.300Z"
}
```

### GET — All attempts in a session
```http
GET /api/mouse-master/attempts/session/PASTE_SESSION_ID_HERE
```

---

## 9. 🏆 Leaderboard

### POST — Recompute global leaderboard
```http
POST /api/mouse-master/leaderboards/recompute
```
```json
{
  "boardType": "global",
  "limit": 50
}
```

### POST — Recompute weekly leaderboard
```json
{
  "boardType": "weekly",
  "periodStart": "2026-08-25T00:00:00.000Z",
  "periodEnd":   "2026-09-01T23:59:59.000Z",
  "limit": 20
}
```

### POST — Recompute by category
```json
{
  "boardType": "by_category",
  "categoryKey": "click_basics",
  "limit": 10
}
```

### GET — Fetch global leaderboard
```http
GET /api/mouse-master/leaderboards?boardType=global
```

### GET — Fetch category leaderboard
```http
GET /api/mouse-master/leaderboards?boardType=by_category&categoryKey=click_basics
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "boardType": "global",
    "rankings": [
      {
        "userAccountId": "60d5ec49f1a2b830a8a1e001",
        "displayName": "testuser",
        "score": 243.24,
        "avgReactionTimeMs": 370,
        "accuracyPct": 90,
        "rank": 1
      }
    ],
    "computedAt": "2026-09-01T15:10:00.000Z"
  }
}
```

> **Score formula:** `score = accuracyPct × (1000 / avgReactionTimeMs)`
> Example: `90 × (1000 / 370) = 243.2`

---

## 10. ❗ Edge Cases to Test

| Test | Request | Expected |
|---|---|---|
| Non-existent level | `GET /levels/000000000000000000000000` | `404` |
| Non-existent category | `GET /categories/fake_key` | `404` |
| Empty bulk attempts | `POST /attempts/bulk` `{ "attempts": [] }` | `400` |
| Duplicate badge | `POST /badges` same user + categoryKey twice | `409` |
| Non-existent session | `GET /sessions/000000000000000000000000` | `404` |

---

## 📋 Quick Flow Cheat Sheet

```
1. GET  /categories                  → check seeded data
2. GET  /modes                       → check seeded data
3. GET  /levels                      → check seeded data
4. POST /sessions                    → get sessionId
5. POST /attempts/bulk               → insert 10 events using sessionId
6. PATCH /sessions/:id/complete      → close session, triggers hooks
7. GET  /progress/user/:userId       → verify progress updated
8. GET  /badges/user/:userId         → check badge awarded
9. POST /leaderboards/recompute      → build rankings
10. GET  /leaderboards?boardType=global → view top scores
```
