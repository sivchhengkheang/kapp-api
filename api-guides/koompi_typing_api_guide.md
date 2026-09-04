# ⌨️ KOOMPI Typing — API Guide

> Base URL: `http://localhost:5050/api/koompi-typing`  
> All requests use `Content-Type: application/json`

---

## 🗂️ Overview & Route Map

| Endpoint Prefix | Description | Primary Methods |
|---|---|---|
| `/units` | Adventure map chapters / world units (Khmer & English) | `GET`, `POST`, `PUT`, `DELETE` |
| `/lessons` | Individual typing lessons within adventure units | `GET`, `POST`, `PUT`, `DELETE` |
| `/content-items` | Target characters, words, sentences, and audio hints | `GET`, `POST`, `PUT`, `DELETE` |
| `/modes` | Game modes (`lesson`, `free_practice`, `timed_test`, `daily_challenge`) | `GET`, `POST` |
| `/sessions` | Game session lifecycle (start, complete with hooks) | `GET`, `POST`, `PATCH`, `DELETE` |
| `/keystrokes` | High-frequency per-keystroke logging for accuracy heatmaps | `GET`, `POST` |
| `/progress` | Per-user, per-lesson progression and unlock statuses | `GET`, `PUT` |
| `/streaks` | Daily streak counter, activity history, and streak freezes | `GET`, `POST` |
| `/heatmap` | Per-key accuracy and average latency heatmap rollups | `GET`, `PUT` |
| `/leaderboards` | Global, language, and weekly leaderboard rankings | `GET`, `POST` |

---

## 1. 🗺️ Adventure Units (`/units`)

### GET — List all units
```http
GET /api/koompi-typing/units
GET /api/koompi-typing/units?language=en
GET /api/koompi-typing/units?language=km
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `language` | string (`en` \| `km`) | Filter units by language track |

**Example Response:**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "6a98f1a1c9e83b543210abcd",
      "unitNumber": 1,
      "language": "en",
      "title": "Home Row Foundations",
      "description": "Learn the home row keys: ASDF JKL;",
      "theme": "forest_path",
      "order": 1,
      "unlockRequirement": {
        "type": "none",
        "previousUnitId": null
      },
      "lessonCount": 8,
      "createdAt": "2026-09-04T02:45:00.000Z",
      "updatedAt": "2026-09-04T02:45:00.000Z"
    }
  ]
}
```

---

### GET — Unit by ID (with populated lessons)
```http
GET /api/koompi-typing/units/:id
```

---

### POST — Create a unit
```http
POST /api/koompi-typing/units
```
**Request Body:**
```json
{
  "unitNumber": 1,
  "language": "en",
  "title": "Home Row Foundations",
  "description": "Learn the home row keys: ASDF JKL;",
  "theme": "forest_path",
  "order": 1,
  "unlockRequirement": {
    "type": "none",
    "previousUnitId": null
  }
}
```

---

### PUT — Update a unit
```http
PUT /api/koompi-typing/units/:id
```

---

### DELETE — Delete a unit
```http
DELETE /api/koompi-typing/units/:id
```
> Deleting a unit automatically removes its associated lessons.

---

## 2. 📖 Typing Lessons (`/lessons`)

### GET — List lessons
```http
GET /api/koompi-typing/lessons
GET /api/koompi-typing/lessons?unitId=6a98f1a1c9e83b543210abcd
GET /api/koompi-typing/lessons?language=km&difficulty=1
```

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `unitId` | ObjectId | Filter by parent unit |
| `language` | string | `en` or `km` |
| `difficulty` | number | 1 to 5 scale |
| `lessonType` | string | `letters`, `words`, `sentences`, `punctuation`, `numbers` |

---

### GET — Lesson by ID (with populated content items)
```http
GET /api/koompi-typing/lessons/:id
```

---

### POST — Create a lesson
```http
POST /api/koompi-typing/lessons
```
**Request Body:**
```json
{
  "unitId": "6a98f1a1c9e83b543210abcd",
  "lessonNumber": 1,
  "language": "en",
  "lessonType": "letters",
  "title": "F and J Keys",
  "targetKeys": ["f", "j"],
  "difficulty": 1,
  "passThreshold": {
    "minAccuracyPct": 90,
    "minWpm": 15
  },
  "xpReward": 30,
  "order": 1
}
```

---

### PUT — Update a lesson
```http
PUT /api/koompi-typing/lessons/:id
```

---

### DELETE — Delete a lesson
```http
DELETE /api/koompi-typing/lessons/:id
```

---

## 3. 📝 Lesson Content Items (`/content-items`)

### GET — List content items
```http
GET /api/koompi-typing/content-items?lessonId=6a98f1a1c9e83b543210abce
```

---

### POST — Create single content item
```http
POST /api/koompi-typing/content-items
```
**Request Body:**
```json
{
  "lessonId": "6a98f1a1c9e83b543210abce",
  "itemType": "character",
  "language": "en",
  "text": "f j f j",
  "order": 1,
  "audioUrl": null
}
```

---

### POST — Bulk insert content items
```http
POST /api/koompi-typing/content-items
```
**Request Body:**
```json
{
  "items": [
    {
      "lessonId": "6a98f1a1c9e83b543210abce",
      "itemType": "character",
      "language": "en",
      "text": "jf jf ff jj",
      "order": 2
    },
    {
      "lessonId": "6a98f1a1c9e83b543210abce",
      "itemType": "word",
      "language": "en",
      "text": "fjf jfj",
      "order": 3
    }
  ]
}
```

---

## 4. 🎮 Game Modes (`/modes`)

### GET — List all game modes
```http
GET /api/koompi-typing/modes
```

### GET — Mode by key
```http
GET /api/koompi-typing/modes/lesson
GET /api/koompi-typing/modes/timed_test
```

### POST — Create game mode
```http
POST /api/koompi-typing/modes
```
```json
{
  "modeKey": "lesson",
  "name": "Lesson Adventure Mode",
  "description": "Guided sequential lessons on the adventure map",
  "affectsLeaderboard": true
}
```

---

## 5. ⏱️ Game Sessions & Session Completion (`/sessions`)

### POST — Start a session
```http
POST /api/koompi-typing/sessions
```
**Request Body:**
```json
{
  "userAccountId": "60d5ec49f1a2b830a8a1e001",
  "lessonId": "6a98f1a1c9e83b543210abce",
  "gameModeId": "6a98f1a1c9e83b543210abcf",
  "language": "en",
  "deviceInfo": {
    "keyboardLayout": "qwerty_en",
    "inputMethod": "physical_keyboard"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "6a98f1a2c9e83b543210abd0",
    "userAccountId": "60d5ec49f1a2b830a8a1e001",
    "lessonId": "6a98f1a1c9e83b543210abce",
    "language": "en",
    "startedAt": "2026-09-04T02:45:10.000Z",
    "passed": false,
    "starsEarned": 0,
    "xpEarned": 0
  }
}
```

---

### PATCH — Complete session & trigger all post-session hooks
```http
PATCH /api/koompi-typing/sessions/:id/complete
```
**Request Body:**
```json
{
  "durationMs": 32000,
  "charactersTyped": 120,
  "charactersCorrect": 116,
  "charactersIncorrect": 4,
  "accuracyPct": 96.7,
  "wpm": 45,
  "netWpm": 43.5,
  "backspaceCount": 2,
  "passed": true,
  "starsEarned": 3,
  "xpEarned": 30,
  "keyStats": {
    "f": { "attempts": 60, "correct": 58, "avgTimeMs": 130 },
    "j": { "attempts": 60, "correct": 58, "avgTimeMs": 125 }
  }
}
```

**Automated Post-Session Lifecycle Hooks Executed:**
1. **`UserProgressTyping`**: Compares and stores best accuracy, net WPM, and stars. If `passed: true`, automatically unlocks the next lesson in the unit.
2. **`UserStreakTyping`**: Inspects daily calendar difference. Increments current/longest streak or consumes a streak freeze if 1 day was missed.
3. **`KeyboardHeatmapStat`**: Merges per-key attempts, correct hits, and weighted latency into the user's persistent heatmap.
4. **`UserStatistic`**: Rolls up cross-game platform statistics under `gameStats.koompi_typing`.
5. **`UserAchievement`**: Evaluates speed (`typing_speed_40wpm`, `typing_speed_60wpm`) and streak milestones (`typing_streak_7`, `typing_streak_30`).

**Example Response:**
```json
{
  "success": true,
  "data": {
    "_id": "6a98f1a2c9e83b543210abd0",
    "passed": true,
    "starsEarned": 3,
    "wpm": 45,
    "netWpm": 43.5,
    "accuracyPct": 96.7,
    "streakDayContribution": true
  },
  "postSessionResults": {
    "progressUpdated": {
      "status": "completed",
      "bestAccuracyPct": 96.7,
      "bestWpm": 45,
      "bestNetWpm": 43.5,
      "bestStars": 3,
      "attemptsCount": 1
    },
    "nextLessonUnlocked": "6a98f1a1c9e83b543210abcf",
    "streak": {
      "currentStreakDays": 1,
      "longestStreakDays": 1
    },
    "achievementsUnlocked": [
      {
        "achievementKey": "typing_speed_40wpm",
        "title": "Swift Typist",
        "points": 40
      }
    ]
  }
}
```

---

### GET — Session by ID
```http
GET /api/koompi-typing/sessions/:id
```

### GET — Sessions by User
```http
GET /api/koompi-typing/sessions/user/:userId?page=1&limit=20&passed=true
```

---

## 6. ⌨️ Keystroke Events (`/keystrokes`)

### POST — Batch log keystrokes
```http
POST /api/koompi-typing/keystrokes/batch
```
**Request Body:**
```json
{
  "sessionId": "6a98f1a2c9e83b543210abd0",
  "events": [
    {
      "charIndex": 0,
      "expectedChar": "f",
      "typedChar": "f",
      "correct": true,
      "keyCode": "KeyF",
      "timeSinceLastKeyMs": 140
    },
    {
      "charIndex": 1,
      "expectedChar": " ",
      "typedChar": " ",
      "correct": true,
      "keyCode": "Space",
      "timeSinceLastKeyMs": 110
    }
  ]
}
```

### GET — Fetch keystrokes for a session
```http
GET /api/koompi-typing/keystrokes/session/:sessionId
```

---

## 7. 📊 User Progress (`/progress`)

### GET — User progress across adventure map
```http
GET /api/koompi-typing/progress/user/:userId
GET /api/koompi-typing/progress/user/:userId?unitId=6a98f1a1c9e83b543210abcd
```

### GET — Progress for a specific lesson
```http
GET /api/koompi-typing/progress/user/:userId/lesson/:lessonId
```

### PUT — Manually update progress (Placement/Admin)
```http
PUT /api/koompi-typing/progress/user/:userId/lesson/:lessonId
```
```json
{
  "status": "unlocked"
}
```

---

## 8. 🔥 Daily Streaks (`/streaks`)

### GET — User streak status
```http
GET /api/koompi-typing/streaks/user/:userId
```
**Response:**
```json
{
  "success": true,
  "data": {
    "userAccountId": "60d5ec49f1a2b830a8a1e001",
    "currentStreakDays": 5,
    "longestStreakDays": 14,
    "lastActivityDate": "2026-09-04T02:45:00.000Z",
    "streakFreezesAvailable": 1,
    "history": [
      {
        "date": "2026-09-04T02:45:00.000Z",
        "sessionsPlayed": 2,
        "xpEarned": 60
      }
    ]
  }
}
```

### POST — Consume streak freeze
```http
POST /api/koompi-typing/streaks/user/:userId/freeze
```

### POST — Add/Award streak freeze
```http
POST /api/koompi-typing/streaks/user/:userId/add-freeze
```
```json
{
  "count": 1
}
```

---

## 9. 🗺️ Keyboard Heatmap (`/heatmap`)

### GET — Fetch user's heatmap
```http
GET /api/koompi-typing/heatmap/user/:userId?language=en
GET /api/koompi-typing/heatmap/user/:userId?language=km
```
**Response:**
```json
{
  "success": true,
  "data": {
    "userAccountId": "60d5ec49f1a2b830a8a1e001",
    "language": "en",
    "keyStats": {
      "f": { "attempts": 120, "correct": 116, "avgTimeMs": 130 },
      "j": { "attempts": 120, "correct": 118, "avgTimeMs": 125 }
    }
  }
}
```

### PUT — Sync heatmap directly
```http
PUT /api/koompi-typing/heatmap/user/:userId
```
```json
{
  "language": "en",
  "keyStats": {
    "k": { "attempts": 25, "correct": 24, "avgTimeMs": 145 }
  }
}
```

---

## 10. 🏆 Leaderboards (`/leaderboards`)

### GET — Fetch current leaderboard
```http
GET /api/koompi-typing/leaderboards?boardType=global
GET /api/koompi-typing/leaderboards?boardType=by_language&language=km
GET /api/koompi-typing/leaderboards?boardType=weekly
```

### POST — Recompute leaderboard
```http
POST /api/koompi-typing/leaderboards/recompute
```
```json
{
  "boardType": "global"
}
```

**Ranking Score Formula:**
```
score = netWpm * (accuracyPct / 100)
```
Aggregates the highest score per user across completed sessions, sorts in descending order, and attaches rank position and player display names.
