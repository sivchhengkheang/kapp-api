# 🔢 Link Number — API Guide

> **Base URL**: `http://localhost:5050/api/link-number`  
> **Direct SPEC Aliases**: `http://localhost:5050/api` (`/levels`, `/user/progress`, `/game/save`, `/leaderboard`)  
> All requests use `Content-Type: application/json`  
> User Authentication: Bearer JWT token in `Authorization: Bearer <token>` or `x-user-id: <userId>` header / `userId` in body or query param.

---

## 🗂️ Overview & Data Architecture

Link Number is a number-linking flow puzzle game.
The API server matches the frontend game structure and the specification defined in `GAME_DATA_SPECIFICATION.md`:

| Resource | Route (Namespaced) | Route (SPEC Alias) | Purpose |
|---|---|---|---|
| **Levels** | `/api/link-number/levels` | `/api/levels` | Fetch 100 game levels across 5 categories |
| **Level Detail** | `/api/link-number/levels/:id` | `/api/levels/:id` | Fetch single level by integer ID (1–100) |
| **Level Completion** | `/api/link-number/levels/:id/complete` | `/api/levels/:id/complete` | Record completion, update stars, progression & leaderboard |
| **Cloud Auto-Save** | `/api/link-number/save` | `/api/game/save` | Save and restore active in-progress puzzle lines (`Path[]`) |
| **User Progress** | `/api/link-number/progress` | `/api/user/progress` | Fetch player level map state (`completedLevelIds`, `currentLevelIndex`) |
| **Leaderboard** | `/api/link-number/leaderboards/:levelId` | `/api/leaderboard/:levelId` | Per-level fastest speedrun rankings |
| **Global Leaderboard** | `/api/link-number/leaderboards/global` | `/api/link-number/leaderboards` | All-time player star rankings |

---

## 1. 🎮 Game Levels

All 100 levels from `levels.ts` are stored in MongoDB with pairs, colors, start/end coordinates, and grid dimensions.

### GET — List all levels
```http
GET /api/link-number/levels
```
*(Also accessible at `GET /api/levels`)*

**Optional query parameters:**
| Parameter | Description | Example |
|---|---|---|
| `category` | Filter by category name | `?category=Starter+Pack` |
| `difficulty` | Filter by difficulty (`Easy`, `Medium`, `Hard`, `Expert`) | `?difficulty=Easy` |
| `size` | Filter by grid dimension (`5`, `6`, `7`, `8`, `9`) | `?size=5` |
| `page` | Page number (default: 1) | `?page=1` |
| `limit` | Items per page (default: 100) | `?limit=20` |

**Level Categories in DB:**
1. `Starter Pack` (Levels 1–20, Size 5×5, Easy)
2. `The Grid Rises` (Levels 21–40, Size 6×6, Medium)
3. `Multi-Hue Master` (Levels 41–60, Size 7×7, Medium)
4. `Complex Conduits` (Levels 61–80, Size 8×8, Hard)
5. `The Flow Grandmaster` (Levels 81–100, Size 9×9, Expert)

**Example response:**
```json
{
  "success": true,
  "count": 20,
  "total": 100,
  "page": 1,
  "data": [
    {
      "id": 1,
      "category": "Starter Pack",
      "size": 5,
      "difficulty": "Easy",
      "pairs": [
        {
          "value": 1,
          "color": "#ef4444",
          "start": { "x": 0, "y": 4 },
          "end": { "x": 2, "y": 1 }
        },
        {
          "value": 2,
          "color": "#3b82f6",
          "start": { "x": 4, "y": 3 },
          "end": { "x": 3, "y": 4 }
        },
        {
          "value": 3,
          "color": "#22c55e",
          "start": { "x": 4, "y": 0 },
          "end": { "x": 1, "y": 4 }
        },
        {
          "value": 4,
          "color": "#eab308",
          "start": { "x": 0, "y": 0 },
          "end": { "x": 0, "y": 2 }
        },
        {
          "value": 5,
          "color": "#a855f7",
          "start": { "x": 1, "y": 1 },
          "end": { "x": 3, "y": 1 }
        }
      ],
      "isActive": true,
      "order": 1
    }
  ]
}
```

---

### GET — Fetch single level by ID
```http
GET /api/link-number/levels/1
```
*(Also accessible at `GET /api/levels/1`)*

**Example response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "category": "Starter Pack",
    "size": 5,
    "difficulty": "Easy",
    "pairs": [
      { "value": 1, "color": "#ef4444", "start": { "x": 0, "y": 4 }, "end": { "x": 2, "y": 1 } },
      { "value": 2, "color": "#3b82f6", "start": { "x": 4, "y": 3 }, "end": { "x": 3, "y": 4 } },
      { "value": 3, "color": "#22c55e", "start": { "x": 4, "y": 0 }, "end": { "x": 1, "y": 4 } },
      { "value": 4, "color": "#eab308", "start": { "x": 0, "y": 0 }, "end": { "x": 0, "y": 2 } },
      { "value": 5, "color": "#a855f7", "start": { "x": 1, "y": 1 }, "end": { "x": 3, "y": 1 } }
    ],
    "isActive": true,
    "order": 1
  }
}
```

---

### POST — Record level completion
Submit level performance when the player solves a puzzle.

```http
POST /api/link-number/levels/1/complete
```
*(Also accessible at `POST /api/levels/1/complete`)*

**Headers:**
- `Authorization: Bearer <token>` (optional if `userId` is passed in body)

**Request Body:**
```json
{
  "userId": "68666d40c0c44c6900eafbbd",
  "stars": 3,
  "timeTakenMs": 14250,
  "movesCount": 5,
  "mistakesCount": 0,
  "resetsCount": 0
}
```

**What this automatically handles:**
1. ✅ **Records LevelCompletion**: Logs personal record (`stars`, `timeTakenMs`, `movesCount`, `mistakesCount`).
2. ✅ **Updates UserProgress**: Adds `1` to `completedLevelIds`, advances `highestUnlockedIndex`, increments `totalStars`.
3. ✅ **Updates Leaderboard**: If `timeTakenMs` is a new personal best, updates the per-level speedrun ranking.
4. ✅ **Clears Active GameSave**: Removes in-progress puzzle save for this level.

**Example response:**
```json
{
  "success": true,
  "newStars": 3,
  "isNewBest": true,
  "totalStars": 3,
  "completedLevelIds": [1],
  "highestUnlockedIndex": 1,
  "data": {
    "levelId": 1,
    "stars": 3,
    "timeTakenMs": 14250,
    "movesCount": 5,
    "mistakesCount": 0,
    "resetsCount": 0,
    "completedAt": "2026-09-10T08:58:00.000Z"
  }
}
```

---

## 2. ☁️ Cloud Auto-Save (Active In-Progress Puzzle)

Allows the player to pause or close the browser/app and resume exactly where they left off, including all drawn paths and elapsed time.

### PUT — Save active puzzle
```http
PUT /api/link-number/save
```
*(Also accessible at `PUT /api/game/save`)*

**Request Body:**
```json
{
  "userId": "68666d40c0c44c6900eafbbd",
  "levelId": 5,
  "paths": [
    {
      "value": 1,
      "color": "#ef4444",
      "isComplete": true,
      "points": [
        { "x": 0, "y": 0 },
        { "x": 1, "y": 0 },
        { "x": 2, "y": 0 }
      ]
    },
    {
      "value": 2,
      "color": "#3b82f6",
      "isComplete": false,
      "points": [
        { "x": 4, "y": 4 },
        { "x": 4, "y": 3 }
      ]
    }
  ],
  "elapsedSeconds": 24
}
```

**Example response:**
```json
{
  "success": true,
  "message": "Game progress saved successfully.",
  "data": {
    "levelId": 5,
    "pathsCount": 2,
    "elapsedSeconds": 24,
    "updatedAt": "2026-09-10T08:58:10.000Z"
  }
}
```

---

### GET — Restore active puzzle
```http
GET /api/link-number/save?userId=68666d40c0c44c6900eafbbd
```
*(Also accessible at `GET /api/game/save`)*

**Example response:**
```json
{
  "success": true,
  "data": {
    "levelId": 5,
    "paths": [
      {
        "value": 1,
        "color": "#ef4444",
        "isComplete": true,
        "points": [{ "x": 0, "y": 0 }, { "x": 1, "y": 0 }, { "x": 2, "y": 0 }]
      },
      {
        "value": 2,
        "color": "#3b82f6",
        "isComplete": false,
        "points": [{ "x": 4, "y": 4 }, { "x": 4, "y": 3 }]
      }
    ],
    "elapsedSeconds": 24,
    "updatedAt": "2026-09-10T08:58:10.000Z"
  }
}
```

---

### DELETE — Clear active save
```http
DELETE /api/link-number/save?userId=68666d40c0c44c6900eafbbd
```

**Example response:**
```json
{
  "success": true,
  "message": "Active save cleared successfully."
}
```

---

## 3. 🗺️ User Progress & Level Map

Tracks the player's overall journey, completed levels, and star ratings to render the Level Map in `LevelMap.tsx`.

### GET — Fetch user progress
```http
GET /api/link-number/progress?userId=68666d40c0c44c6900eafbbd
```
*(Also accessible at `GET /api/user/progress` or `GET /api/link-number/progress/user/:userId`)*

**Example response:**
```json
{
  "success": true,
  "data": {
    "userId": "68666d40c0c44c6900eafbbd",
    "currentLevelIndex": 4,
    "highestUnlockedIndex": 6,
    "completedLevelIds": [1, 2, 3, 4, 5, 6],
    "totalStars": 18,
    "totalCompleted": 6
  }
}
```

---

### PUT — Update current level position on map
```http
PUT /api/link-number/progress
```

**Request Body:**
```json
{
  "userId": "68666d40c0c44c6900eafbbd",
  "currentLevelIndex": 5
}
```

**Example response:**
```json
{
  "success": true,
  "message": "Progress updated successfully.",
  "data": {
    "currentLevelIndex": 5,
    "highestUnlockedIndex": 6,
    "completedLevelIds": [1, 2, 3, 4, 5, 6],
    "totalStars": 18
  }
}
```

---

## 4. 🏆 Leaderboards

Real-time speedrun rankings.

### GET — Per-level fastest speedrun ranking
```http
GET /api/link-number/leaderboards/1?limit=20
```
*(Also accessible at `GET /api/leaderboard/1`)*

**Query parameters:**
- `limit` (default: 20, max: 100)

**Example response:**
```json
{
  "success": true,
  "levelId": 1,
  "count": 2,
  "data": [
    {
      "rank": 1,
      "userId": "68666d40c0c44c6900eafbbd",
      "username": "player_one",
      "bestTimeMs": 6420,
      "stars": 3,
      "achievedAt": "2026-09-09T12:00:00.000Z"
    },
    {
      "rank": 2,
      "userId": "68666d40c0c44c6900eafbb2",
      "username": "SpeedLinker",
      "bestTimeMs": 9850,
      "stars": 3,
      "achievedAt": "2026-09-09T14:30:00.000Z"
    }
  ]
}
```

---

### GET — Global all-time star rankings
```http
GET /api/link-number/leaderboards/global?limit=20
```

**Example response:**
```json
{
  "success": true,
  "type": "global",
  "count": 2,
  "data": [
    {
      "rank": 1,
      "userId": "68666d40c0c44c6900eafbbd",
      "username": "player_one",
      "totalStars": 36,
      "totalCompleted": 12,
      "highestUnlockedIndex": 12
    }
  ]
}
```

---

## 5. 🧩 Legacy PuzzleBoards & Sessions

The server maintains backward compatibility with the session-based telemetry endpoints:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/link-number/puzzles` | `GET` | List legacy seeded boards |
| `/api/link-number/puzzles/:boardNumber` | `GET` | Get legacy board details |
| `/api/link-number/sessions` | `POST` | Start telemetry session |
| `/api/link-number/sessions/:id/complete` | `PATCH` | Complete telemetry session |
| `/api/link-number/daily/today` | `GET` | Fetch daily challenge |
| `/api/link-number/difficulty/user/:userId` | `GET` | Legacy tier progression |

---

## 📋 Quick Start Cheat Sheet

```
1. Seed 100 levels:
   node src/seeders/link-number/seedLinkNumber.js

2. Fetch all levels:
   GET /api/link-number/levels

3. Fetch level 1:
   GET /api/link-number/levels/1

4. Auto-save puzzle during gameplay:
   PUT /api/link-number/save
   Body: { userId, levelId: 1, paths: [...], elapsedSeconds: 15 }

5. Restore active puzzle on app load:
   GET /api/link-number/save?userId=...

6. Complete level:
   POST /api/link-number/levels/1/complete
   Body: { userId, stars: 3, timeTakenMs: 14250, movesCount: 5 }

7. Get user level map progress:
   GET /api/link-number/progress?userId=...

8. Get Level 1 fastest speedruns:
   GET /api/link-number/leaderboards/1
```
