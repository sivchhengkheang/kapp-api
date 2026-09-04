# 🔢 Link Number — API Guide

> Base URL: `http://localhost:5050/api/link-number`
> All requests use `Content-Type: application/json`

---

## 🗂️ Real IDs (already seeded in DB)

> Run `node src/seeders/link-number/seedLinkNumber.js` first if not done yet.

| Resource | Description | ID |
|---|---|---|
| Board #1 | "First Link" — Easy 3×3 | *(copy from GET /puzzles)* |
| Board #2 | "Strategic Links" — Medium 5×5 | *(copy from GET /puzzles)* |
| Board #3 | "Labyrinth" — Hard 6×6 | *(copy from GET /puzzles)* |
| Daily Challenge | Today's challenge (linked to Board #2) | *(auto-created by seed)* |
| Test User | Use any valid 24-char ObjectId | `68666d40c0c44c6900eafbbd` |

> **Tip**: Run `GET /puzzles` first to grab the real `_id` values for boards.

---

## 1. 🧩 Puzzle Boards

### GET — List all published boards
```http
GET /api/link-number/puzzles
```

**Optional query params:**
| Param | Values | Example |
|---|---|---|
| `difficulty` | `easy` `medium` `hard` `expert` | `?difficulty=easy` |
| `category` | `standard` `daily` `weekly` `special` | `?category=standard` |
| `gridSize` | `3x3` `4x4` `5x5` `6x6` | `?gridSize=5x5` |
| `page` | number | `?page=1` |
| `limit` | number (default 20) | `?limit=10` |

**Example response:**
```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "6a97d47a31a847af29c554c4",
      "boardNumber": 1,
      "title": "First Link",
      "description": "A beginner-friendly 3×3 puzzle to learn the basics of path linking.",
      "difficulty": "easy",
      "gridSize": "3x3",
      "category": "standard",
      "grid": {
        "width": 3,
        "height": 3,
        "totalCells": 9,
        "totalPairs": 3,
        "numberPairs": [
          { "id": "pair_1", "number": 1, "positions": [{ "x": 0, "y": 0 }, { "x": 2, "y": 2 }] },
          { "id": "pair_2", "number": 2, "positions": [{ "x": 2, "y": 0 }, { "x": 0, "y": 2 }] },
          { "id": "pair_3", "number": 3, "positions": [{ "x": 1, "y": 0 }, { "x": 1, "y": 2 }] }
        ]
      },
      "status": { "isPublished": true, "isArchived": false }
    }
  ]
}
```

---

### GET — Filter by difficulty
```http
GET /api/link-number/puzzles/difficulty/medium
```

**Example response:**
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "6a97d47a31a847af29c554c5",
      "boardNumber": 2,
      "title": "Strategic Links",
      "difficulty": "medium",
      "gridSize": "5x5",
      "grid": {
        "width": 5,
        "height": 5,
        "totalCells": 25,
        "totalPairs": 5,
        "numberPairs": [
          { "id": "pair_1", "number": 1, "positions": [{ "x": 0, "y": 0 }, { "x": 4, "y": 4 }] },
          { "id": "pair_2", "number": 2, "positions": [{ "x": 0, "y": 2 }, { "x": 3, "y": 3 }] },
          { "id": "pair_3", "number": 3, "positions": [{ "x": 1, "y": 0 }, { "x": 4, "y": 1 }] },
          { "id": "pair_4", "number": 4, "positions": [{ "x": 2, "y": 1 }, { "x": 1, "y": 3 }] },
          { "id": "pair_5", "number": 5, "positions": [{ "x": 4, "y": 0 }, { "x": 0, "y": 4 }] }
        ]
      },
      "hints": [
        { "id": "hint_1", "level": 1, "text": "Start with the numbers in the corners.", "revealAfterTime": 120, "revealAfterAttempts": 3 }
      ],
      "rewards": {
        "baseXP": 200,
        "xpForPerfect": 500,
        "stars": {
          "oneStar":   { "minTime": 300, "allowMistakes": true, "xpBonus": 100 },
          "twoStars":  { "minTime": 180, "maxMistakes": 3,      "xpBonus": 200 },
          "threeStars":{ "minTime": 120, "maxMistakes": 0,      "xpBonus": 300 }
        }
      }
    }
  ]
}
```

---

### GET — Single board by board number
```http
GET /api/link-number/puzzles/1
```

> Solution paths are **excluded** from this response (returned only after puzzle completion).

**Example response:**
```json
{
  "success": true,
  "data": {
    "_id": "6a97d47a31a847af29c554c4",
    "boardNumber": 1,
    "title": "First Link",
    "description": "A beginner-friendly 3×3 puzzle to learn the basics of path linking.",
    "difficulty": "easy",
    "gridSize": "3x3",
    "category": "standard",
    "grid": {
      "width": 3,
      "height": 3,
      "totalCells": 9,
      "totalPairs": 3,
      "numberPairs": [
        { "id": "pair_1", "number": 1, "positions": [{ "x": 0, "y": 0 }, { "x": 2, "y": 2 }] },
        { "id": "pair_2", "number": 2, "positions": [{ "x": 2, "y": 0 }, { "x": 0, "y": 2 }] },
        { "id": "pair_3", "number": 3, "positions": [{ "x": 1, "y": 0 }, { "x": 1, "y": 2 }] }
      ]
    },
    "constraints": {
      "pathsCannotCross": true,
      "mustFillAllCells": true,
      "eachCellUsedOnce": true,
      "perfectSolution": { "pathsRequired": 3, "totalCellsCovered": 9, "optimalMoveCount": 9 }
    },
    "hints": [
      { "id": "hint_1", "level": 1, "text": "Start connecting from corner numbers first.", "revealAfterTime": 60, "revealAfterAttempts": 2 },
      { "id": "hint_2", "level": 2, "text": "Number 3 can go straight down the middle column.", "revealAfterAttempts": 4 }
    ],
    "rewards": {
      "baseXP": 100,
      "xpForPerfect": 200,
      "xpForSpeed": 50,
      "stars": {
        "oneStar":   { "minTime": 180, "allowMistakes": true, "xpBonus": 50  },
        "twoStars":  { "minTime": 90,  "maxMistakes": 2,      "xpBonus": 100 },
        "threeStars":{ "minTime": 45,  "maxMistakes": 0,      "xpBonus": 200 }
      }
    },
    "difficultyMetrics": {
      "branchingFactor": 2.1,
      "minPathLength": 3,
      "maxPathLength": 5,
      "symmetry": "medium",
      "deductionDifficulty": "easy"
    },
    "theme": {
      "backgroundColor": "#F8F9FA",
      "lineColor": "#3B82F6",
      "numberColor": "#1F2937",
      "gridLineColor": "#E5E7EB",
      "successColor": "#10B981",
      "errorColor": "#EF4444"
    },
    "accessibility": { "colorblindFriendly": true, "highContrast": false, "largeNumbers": true },
    "stats": { "totalAttempts": 0, "totalCompletions": 0, "completionRate": 0 },
    "status": { "isPublished": true, "isArchived": false, "isBeta": false, "isFeatureLevel": false }
  }
}
```

---

### GET — Puzzle stats only
```http
GET /api/link-number/puzzles/2/stats
```

**Example response:**
```json
{
  "success": true,
  "data": {
    "_id": "6a97d47a31a847af29c554c5",
    "boardNumber": 2,
    "title": "Strategic Links",
    "difficulty": "medium",
    "gridSize": "5x5",
    "stats": {
      "totalAttempts": 1250,
      "totalCompletions": 910,
      "completionRate": 72.8,
      "averageTime": 94,
      "averageAttemptsPerCompletion": 1.9,
      "perfectRuns": 132,
      "abandonmentRate": 11.4,
      "averageStarsEarned": 2.3
    }
  }
}
```

---

### POST — Create a new puzzle board (admin)
```http
POST /api/link-number/puzzles
```
```json
{
  "boardNumber": 4,
  "title": "Expert Spiral",
  "description": "A twisting 5×5 expert puzzle for seasoned solvers.",
  "difficulty": "expert",
  "gridSize": "5x5",
  "category": "special",
  "grid": {
    "width": 5,
    "height": 5,
    "totalCells": 25,
    "totalPairs": 5,
    "numberPairs": [
      { "id": "pair_1", "number": 1, "positions": [{ "x": 0, "y": 0 }, { "x": 4, "y": 4 }] },
      { "id": "pair_2", "number": 2, "positions": [{ "x": 4, "y": 0 }, { "x": 0, "y": 4 }] },
      { "id": "pair_3", "number": 3, "positions": [{ "x": 2, "y": 0 }, { "x": 2, "y": 4 }] },
      { "id": "pair_4", "number": 4, "positions": [{ "x": 0, "y": 2 }, { "x": 4, "y": 2 }] },
      { "id": "pair_5", "number": 5, "positions": [{ "x": 1, "y": 1 }, { "x": 3, "y": 3 }] }
    ]
  },
  "constraints": {
    "pathsCannotCross": true,
    "mustFillAllCells": true,
    "eachCellUsedOnce": true
  },
  "hints": [
    { "id": "hint_1", "level": 1, "text": "Map the perimeter paths first.", "revealAfterTime": 120, "revealAfterAttempts": 3 }
  ],
  "rewards": {
    "baseXP": 400,
    "xpForPerfect": 900,
    "xpForSpeed": 150,
    "stars": {
      "oneStar":   { "minTime": 600, "allowMistakes": true, "xpBonus": 200 },
      "twoStars":  { "minTime": 360, "maxMistakes": 2,      "xpBonus": 350 },
      "threeStars":{ "minTime": 240, "maxMistakes": 0,      "xpBonus": 600 }
    }
  },
  "status": { "isPublished": true, "isArchived": false, "isBeta": false, "isFeatureLevel": false }
}
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "_id": "6a97d47a31a847af29c554d0",
    "boardNumber": 4,
    "title": "Expert Spiral",
    "difficulty": "expert",
    "gridSize": "5x5",
    "createdAt": "2026-09-02T08:00:00.000Z"
  }
}
```

---

## 2. 🎮 Game Sessions — Full Play Flow

### Step 1 — Start a session
```http
POST /api/link-number/sessions
```
```json
{
  "userAccountId": "68666d40c0c44c6900eafbbd",
  "boardId": "6a97d47a31a847af29c554c4",
  "device": {
    "type": "desktop",
    "os": "Windows 11",
    "browser": "Chrome 127",
    "screenSize": "1920x1080"
  }
}
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "_id": "COPY_THIS_SESSION_ID",
    "userAccountId": "68666d40c0c44c6900eafbbd",
    "boardId": "6a97d47a31a847af29c554c4",
    "boardNumber": 1,
    "difficulty": "easy",
    "gridSize": "3x3",
    "timing": {
      "startedAt": "2026-09-02T08:00:00.000Z",
      "endedAt": null,
      "durationSeconds": null,
      "pausedSeconds": 0
    },
    "result": {
      "status": "in_progress",
      "puzzleSolved": false,
      "starRating": 0,
      "score": 0
    },
    "device": {
      "type": "desktop",
      "os": "Windows 11",
      "browser": "Chrome 127",
      "screenSize": "1920x1080"
    }
  }
}
```

> 📋 **Copy** `data._id` → use as `:sessionId` in Step 2

---

### Step 2 — Complete the session (3-star perfect run)

> Player solved Board #1 in 38 seconds with 0 mistakes → **3 stars** ✅

```http
PATCH /api/link-number/sessions/PASTE_SESSION_ID_HERE/complete
```
```json
{
  "timing": {
    "startedAt": "2026-09-02T08:00:00.000Z",
    "endedAt": "2026-09-02T08:00:38.000Z",
    "durationSeconds": 38,
    "activePlayTimeSeconds": 38,
    "pausedSeconds": 0
  },
  "result": {
    "status": "completed",
    "puzzleSolved": true,
    "boardFilled": true,
    "mistakesMade": 0,
    "unvalidMovesAttempted": 0,
    "firstTryComplete": true,
    "starRating": 3,
    "score": 1450,
    "baseScore": 1000,
    "timeBonus": 300,
    "perfectBonus": 150,
    "xpEarned": 300
  },
  "moveHistory": [
    {
      "moveNumber": 1,
      "timestamp": 2.1,
      "action": "draw_path",
      "pairId": "pair_3",
      "number": 3,
      "pathSegments": [
        { "x": 1, "y": 0, "x_to": 1, "y_to": 1 },
        { "x": 1, "y": 1, "x_to": 1, "y_to": 2 }
      ],
      "cellsCovered": 3,
      "isValid": true,
      "pathLength": 3
    },
    {
      "moveNumber": 2,
      "timestamp": 8.4,
      "action": "draw_path",
      "pairId": "pair_1",
      "number": 1,
      "pathSegments": [
        { "x": 0, "y": 0, "x_to": 0, "y_to": 1 },
        { "x": 0, "y": 1, "x_to": 0, "y_to": 2 },
        { "x": 0, "y": 2, "x_to": 1, "y_to": 2 },
        { "x": 1, "y": 2, "x_to": 2, "y_to": 2 }
      ],
      "cellsCovered": 5,
      "isValid": true,
      "pathLength": 5
    },
    {
      "moveNumber": 3,
      "timestamp": 18.7,
      "action": "draw_path",
      "pairId": "pair_2",
      "number": 2,
      "pathSegments": [
        { "x": 2, "y": 0, "x_to": 2, "y_to": 1 },
        { "x": 2, "y": 1, "x_to": 2, "y_to": 2 }
      ],
      "cellsCovered": 3,
      "isValid": true,
      "pathLength": 3
    }
  ],
  "paths": [
    {
      "pathId": "path_1",
      "pairId": "pair_1",
      "number": 1,
      "cellsCovered": 5,
      "cellsList": [
        { "x": 0, "y": 0 }, { "x": 0, "y": 1 }, { "x": 0, "y": 2 }, { "x": 1, "y": 2 }, { "x": 2, "y": 2 }
      ],
      "isCorrect": true,
      "crossesAnotherPath": false,
      "completionTime": 18.7
    },
    {
      "pathId": "path_2",
      "pairId": "pair_2",
      "number": 2,
      "cellsCovered": 3,
      "cellsList": [
        { "x": 2, "y": 0 }, { "x": 2, "y": 1 }, { "x": 2, "y": 2 }
      ],
      "isCorrect": true,
      "crossesAnotherPath": false,
      "completionTime": 30.2
    },
    {
      "pathId": "path_3",
      "pairId": "pair_3",
      "number": 3,
      "cellsCovered": 3,
      "cellsList": [
        { "x": 1, "y": 0 }, { "x": 1, "y": 1 }, { "x": 1, "y": 2 }
      ],
      "isCorrect": true,
      "crossesAnotherPath": false,
      "completionTime": 8.4
    }
  ],
  "userActions": {
    "totalMoves": 3,
    "pathsDrawn": 3,
    "pathsCleared": 0,
    "pathsUndone": 0,
    "hintsUsed": 0,
    "hintLevelsRevealed": 0,
    "undoCount": 0,
    "restartCount": 0
  },
  "analytics": {
    "playStyle": "strategic",
    "problemSolving": "methodical",
    "hesitationPoints": 1,
    "errorDetection": "immediate",
    "engagementScore": 0.95,
    "focusLevel": "high"
  }
}
```

**What happens automatically:**
- ✅ `BoardProgress` upserted → `status: "completed"`, `currentStars: 3`, `bestAttempt.score: 1450`
- ✅ `UserStatistic.gameStats.link_number` updated with rolling averages
- ✅ `DifficultyProgression` easy tier `boardsCompleted` incremented
- ✅ `UserAchievement` checked: `link_perfect_solver` (3-star) and `link_speed_demon` (under 60s) awarded

**Example response:**
```json
{
  "success": true,
  "data": {
    "_id": "PASTE_SESSION_ID_HERE",
    "boardNumber": 1,
    "difficulty": "easy",
    "result": {
      "status": "completed",
      "puzzleSolved": true,
      "boardFilled": true,
      "mistakesMade": 0,
      "firstTryComplete": true,
      "starRating": 3,
      "score": 1450,
      "baseScore": 1000,
      "timeBonus": 300,
      "perfectBonus": 150,
      "xpEarned": 300
    },
    "timing": {
      "startedAt": "2026-09-02T08:00:00.000Z",
      "endedAt": "2026-09-02T08:00:38.000Z",
      "durationSeconds": 38
    }
  },
  "postSession": {
    "achievementsUnlocked": ["link_perfect_solver", "link_speed_demon"]
  }
}
```

---

### Step 3 — A failed/quit session (for contrast)

```http
POST /api/link-number/sessions
```
*(Same body as Step 1 — creates a new session)*

Then complete it with a quit result:
```http
PATCH /api/link-number/sessions/NEW_SESSION_ID/complete
```
```json
{
  "timing": {
    "startedAt": "2026-09-02T09:00:00.000Z",
    "endedAt": "2026-09-02T09:01:45.000Z",
    "durationSeconds": 105,
    "activePlayTimeSeconds": 90,
    "pausedSeconds": 15
  },
  "result": {
    "status": "quit",
    "puzzleSolved": false,
    "boardFilled": false,
    "mistakesMade": 4,
    "unvalidMovesAttempted": 6,
    "firstTryComplete": false,
    "starRating": 0,
    "score": 0,
    "baseScore": 0,
    "timeBonus": 0,
    "perfectBonus": 0,
    "xpEarned": 0
  },
  "userActions": {
    "totalMoves": 10,
    "pathsDrawn": 4,
    "pathsCleared": 3,
    "pathsUndone": 2,
    "hintsUsed": 1,
    "hintLevelsRevealed": 1,
    "undoCount": 2,
    "restartCount": 1
  }
}
```

---

### GET — All sessions for a user
```http
GET /api/link-number/sessions/user/68666d40c0c44c6900eafbbd
```

**Query params:**
| Param | Example | Description |
|---|---|---|
| `boardId` | `?boardId=6a97d47a...` | Filter by board |
| `status` | `?status=completed` | `in_progress` `completed` `quit` `failed` `paused` |
| `page` | `?page=1` | Pagination |
| `limit` | `?limit=10` | Items per page |

**Example response:**
```json
{
  "success": true,
  "count": 2,
  "total": 2,
  "page": 1,
  "pages": 1,
  "data": [
    {
      "_id": "6a97d59cfde9e857985a7859",
      "boardId": {
        "_id": "6a97d47a31a847af29c554c4",
        "boardNumber": 1,
        "title": "First Link",
        "difficulty": "easy",
        "gridSize": "3x3"
      },
      "result": {
        "status": "completed",
        "puzzleSolved": true,
        "starRating": 3,
        "score": 1450
      },
      "timing": {
        "durationSeconds": 38
      },
      "createdAt": "2026-09-02T08:00:00.000Z"
    }
  ]
}
```

---

### GET — Single session detail
```http
GET /api/link-number/sessions/PASTE_SESSION_ID_HERE
```

**Example response:**
```json
{
  "success": true,
  "data": {
    "_id": "6a97d59cfde9e857985a7859",
    "boardId": {
      "_id": "6a97d47a31a847af29c554c4",
      "boardNumber": 1,
      "title": "First Link",
      "difficulty": "easy",
      "gridSize": "3x3",
      "grid": { "width": 3, "height": 3, "totalCells": 9, "totalPairs": 3 },
      "rewards": { "baseXP": 100, "xpForPerfect": 200 }
    },
    "boardNumber": 1,
    "difficulty": "easy",
    "timing": {
      "startedAt": "2026-09-02T08:00:00.000Z",
      "endedAt": "2026-09-02T08:00:38.000Z",
      "durationSeconds": 38,
      "activePlayTimeSeconds": 38,
      "pausedSeconds": 0
    },
    "result": {
      "status": "completed",
      "puzzleSolved": true,
      "boardFilled": true,
      "mistakesMade": 0,
      "starRating": 3,
      "score": 1450,
      "xpEarned": 300
    },
    "paths": [
      {
        "pathId": "path_1",
        "pairId": "pair_1",
        "number": 1,
        "cellsCovered": 5,
        "isCorrect": true,
        "crossesAnotherPath": false,
        "completionTime": 18.7
      }
    ],
    "userActions": {
      "totalMoves": 3,
      "pathsDrawn": 3,
      "hintsUsed": 0,
      "undoCount": 0
    },
    "analytics": {
      "playStyle": "strategic",
      "focusLevel": "high",
      "engagementScore": 0.95
    }
  }
}
```

---

### DELETE — Delete a session
```http
DELETE /api/link-number/sessions/PASTE_SESSION_ID_HERE
```

**Expected response:**
```json
{
  "success": true,
  "message": "Session deleted."
}
```

---

## 3. 📊 Board Progress

### GET — All board progress for a user
```http
GET /api/link-number/progress/user/68666d40c0c44c6900eafbbd
```

**Query params:**
| Param | Example | Description |
|---|---|---|
| `status` | `?status=completed` | `locked` `unlocked` `in_progress` `completed` |
| `difficulty` | `?difficulty=easy` | Filter by difficulty |
| `page` | `?page=1` | Pagination |

**Example response:**
```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "page": 1,
  "pages": 1,
  "summary": {
    "total": 1,
    "completed": 1,
    "inProgress": 0,
    "totalStars": 3
  },
  "data": [
    {
      "_id": "6a97d5ac31a847af29c554cc",
      "userAccountId": "68666d40c0c44c6900eafbbd",
      "boardId": {
        "_id": "6a97d47a31a847af29c554c4",
        "boardNumber": 1,
        "title": "First Link",
        "difficulty": "easy",
        "gridSize": "3x3",
        "category": "standard"
      },
      "boardNumber": 1,
      "difficulty": "easy",
      "status": "completed",
      "currentStars": 3,
      "maxStars": 3,
      "completedAt": "2026-09-02T08:00:38.000Z",
      "totalAttempts": 1,
      "bestAttempt": {
        "attemptNumber": 1,
        "score": 1450,
        "stars": 3,
        "time": 38,
        "mistakes": 0
      },
      "performanceTrend": {
        "initialTime": 38,
        "currentBestTime": 38,
        "improvementPercent": 0,
        "currentBestScore": 1450
      },
      "rewardsClaimed": {
        "xp": 0,
        "points": 0,
        "firstCompletionBonus": true,
        "starBonuses": { "oneStar": true, "twoStar": true, "threeStar": true }
      }
    }
  ]
}
```

---

### GET — Single board progress for a user
```http
GET /api/link-number/progress/user/68666d40c0c44c6900eafbbd/BOARD_ID_HERE
```

**Example response:**
```json
{
  "success": true,
  "data": {
    "boardNumber": 1,
    "difficulty": "easy",
    "status": "completed",
    "currentStars": 3,
    "totalAttempts": 1,
    "attempts": [
      {
        "attemptNumber": 1,
        "status": "completed",
        "starRating": 3,
        "score": 1450,
        "time": 38,
        "mistakes": 0,
        "attemptedAt": "2026-09-02T08:00:38.000Z"
      }
    ],
    "bestAttempt": {
      "score": 1450,
      "stars": 3,
      "time": 38,
      "mistakes": 0
    },
    "threeStarRequirement": {
      "maxTime": 45,
      "maxMistakes": 0,
      "boardFilled": true
    }
  }
}
```

---

## 4. 📈 Difficulty Progression

### POST — Initialize progression for a new user (first play)
```http
POST /api/link-number/difficulty/user/68666d40c0c44c6900eafbbd/initialize
```
*(No body required)*

**Example response:**
```json
{
  "success": true,
  "data": {
    "_id": "6a97d6bc31a847af29c554d0",
    "userAccountId": "68666d40c0c44c6900eafbbd",
    "currentDifficulty": "easy",
    "currentLevel": 1,
    "difficultyTiers": [
      {
        "tierName": "easy",
        "completed": false,
        "boardsCompleted": 0,
        "boardsTotal": 10,
        "unlockedAt": "2026-09-02T08:00:00.000Z",
        "averageStars": 0,
        "averageTime": 0,
        "requirement": null
      },
      {
        "tierName": "medium",
        "completed": false,
        "boardsCompleted": 0,
        "boardsTotal": 25,
        "unlockedAt": null,
        "requirement": "Complete all 10 easy puzzles"
      },
      {
        "tierName": "hard",
        "completed": false,
        "boardsCompleted": 0,
        "boardsTotal": 30,
        "unlockedAt": null,
        "requirement": "Complete 20 medium puzzles"
      },
      {
        "tierName": "expert",
        "completed": false,
        "boardsCompleted": 0,
        "boardsTotal": 20,
        "unlockedAt": null,
        "requirement": "Complete 25 hard puzzles"
      }
    ],
    "unlockProgress": {
      "nextTier": "medium",
      "requirement": 10,
      "currentProgress": 0,
      "percentComplete": 0
    },
    "mastery": {
      "easy_avg_time": 0,
      "easy_perfect_rate": 0,
      "readyForHard": false,
      "readyForExpert": false
    }
  }
}
```

> If the user already has a progression doc, it returns `{ "alreadyExists": true }` with the existing data.

---

### GET — Get a user's difficulty tier progression
```http
GET /api/link-number/difficulty/user/68666d40c0c44c6900eafbbd
```

**Example response (after completing 3 easy boards):**
```json
{
  "success": true,
  "data": {
    "userAccountId": "68666d40c0c44c6900eafbbd",
    "currentDifficulty": "easy",
    "currentLevel": 4,
    "difficultyTiers": [
      {
        "tierName": "easy",
        "completed": false,
        "boardsCompleted": 3,
        "boardsTotal": 10,
        "unlockedAt": "2026-09-02T08:00:00.000Z",
        "averageStars": 2.8,
        "averageTime": 52,
        "currentProgress": 30
      },
      {
        "tierName": "medium",
        "completed": false,
        "boardsCompleted": 0,
        "boardsTotal": 25,
        "unlockedAt": null,
        "requirement": "Complete all 10 easy puzzles"
      }
    ],
    "unlockProgress": {
      "nextTier": "medium",
      "requirement": 10,
      "currentProgress": 3,
      "percentComplete": 30
    },
    "mastery": {
      "easy_avg_time": 52,
      "easy_perfect_rate": 66,
      "readyForHard": false
    }
  }
}
```

---

## 5. 📅 Daily Challenge

### GET — Today's challenge
```http
GET /api/link-number/daily/today
```

**Example response:**
```json
{
  "success": true,
  "data": {
    "_id": "6a97d5c0fde9e857985a7870",
    "date": "2026-09-02T00:00:00.000Z",
    "challengeNumber": 1,
    "title": "Link Master Challenge",
    "puzzle": {
      "boardId": {
        "_id": "6a97d47a31a847af29c554c5",
        "boardNumber": 2,
        "title": "Strategic Links",
        "difficulty": "medium",
        "gridSize": "5x5",
        "grid": {
          "width": 5,
          "height": 5,
          "totalCells": 25,
          "totalPairs": 5,
          "numberPairs": [
            { "id": "pair_1", "number": 1, "positions": [{ "x": 0, "y": 0 }, { "x": 4, "y": 4 }] },
            { "id": "pair_5", "number": 5, "positions": [{ "x": 4, "y": 0 }, { "x": 0, "y": 4 }] }
          ]
        },
        "hints": [
          { "id": "hint_1", "level": 1, "text": "Start with the numbers in the corners.", "revealAfterTime": 120 }
        ]
      },
      "gridSize": "5x5",
      "difficulty": "medium"
    },
    "rules": {
      "singleAttemptPerDay": true,
      "timeLimit": 300,
      "mistakePenalty": -50
    },
    "rewards": {
      "baseXP": 300,
      "basePoints": 500,
      "bonusForPerfect": 500,
      "bonusForSpeed": 200
    },
    "stats": {
      "totalAttempts": 0,
      "totalCompletions": 0,
      "completionRate": 0
    }
  }
}
```

---

### GET — Past daily challenges (history)
```http
GET /api/link-number/daily/history
```

**Query params:**
| Param | Example | Description |
|---|---|---|
| `page` | `?page=1` | Pagination |
| `limit` | `?limit=10` | Items per page (default 10) |

**Example response:**
```json
{
  "success": true,
  "count": 0,
  "total": 0,
  "page": 1,
  "pages": 0,
  "data": []
}
```

> History excludes today — only shows past completed challenge days.

---

### GET — Today's daily leaderboard
```http
GET /api/link-number/daily/leaderboard
```

**Example response:**
```json
{
  "success": true,
  "date": "2026-09-02T00:00:00.000Z",
  "challengeNumber": 1,
  "leaderboard": {
    "topScores": [
      {
        "rank": 1,
        "displayName": "Link Master",
        "score": 1800,
        "time": 48,
        "completedAt": "2026-09-02T08:30:00.000Z"
      },
      {
        "rank": 2,
        "displayName": "PathFinder",
        "score": 1650,
        "time": 72,
        "completedAt": "2026-09-02T09:12:00.000Z"
      }
    ],
    "computedAt": "2026-09-02T12:00:00.000Z"
  },
  "stats": {
    "totalAttempts": 420,
    "totalCompletions": 308,
    "completionRate": 73.3,
    "averageTime": 96,
    "averageScore": 1120
  }
}
```

---

### POST — Create a daily challenge (admin)
```http
POST /api/link-number/daily
```
```json
{
  "date": "2026-09-03T00:00:00.000Z",
  "challengeNumber": 2,
  "title": "Speed Run Tuesday",
  "puzzle": {
    "boardId": "6a97d47a31a847af29c554c4",
    "gridSize": "3x3",
    "difficulty": "easy"
  },
  "rules": {
    "singleAttemptPerDay": true,
    "timeLimit": 60,
    "mistakePenalty": -100
  },
  "rewards": {
    "baseXP": 200,
    "basePoints": 300,
    "bonusForPerfect": 400,
    "bonusForSpeed": 300
  }
}
```

**Expected response:**
```json
{
  "success": true,
  "data": {
    "_id": "6a97d6d031a847af29c554e0",
    "date": "2026-09-03T00:00:00.000Z",
    "challengeNumber": 2,
    "title": "Speed Run Tuesday",
    "createdAt": "2026-09-02T10:00:00.000Z"
  }
}
```

> Sending the **same date twice** returns `409 Conflict`.

---

## 6. 🏆 Leaderboards

### GET — Global leaderboard (all-time, all boards)
```http
GET /api/link-number/leaderboards/global
```

**Query params:**
| Param | Default | Description |
|---|---|---|
| `limit` | `20` | Max entries (capped at 100) |

**Example response:**
```json
{
  "success": true,
  "type": "global",
  "count": 2,
  "data": [
    {
      "rank": 1,
      "userAccountId": "68666d40c0c44c6900eafbbd",
      "displayName": "Link Master",
      "totalScore": 1450,
      "totalStars": 3,
      "boardsCompleted": 1,
      "averageTime": 38,
      "fastestTime": 38,
      "perfectRuns": 1
    },
    {
      "rank": 2,
      "userAccountId": "68666d40c0c44c6900eafbb2",
      "displayName": "PathFinder",
      "totalScore": 980,
      "totalStars": 2,
      "boardsCompleted": 1,
      "averageTime": 95,
      "fastestTime": 95,
      "perfectRuns": 0
    }
  ]
}
```

---

### GET — Speed leaderboard (fastest solve times)
```http
GET /api/link-number/leaderboards/speed
```
```http
GET /api/link-number/leaderboards/speed?limit=10
```

**Example response:**
```json
{
  "success": true,
  "type": "speed",
  "count": 1,
  "data": [
    {
      "rank": 1,
      "userAccountId": "68666d40c0c44c6900eafbbd",
      "displayName": "Link Master",
      "totalScore": 1450,
      "boardsCompleted": 1,
      "averageTime": 38,
      "fastestTime": 38,
      "perfectRuns": 1
    }
  ]
}
```

---

### GET — Accuracy leaderboard (most perfect/3-star runs)
```http
GET /api/link-number/leaderboards/accuracy
```

**Example response:**
```json
{
  "success": true,
  "type": "accuracy",
  "count": 1,
  "data": [
    {
      "rank": 1,
      "userAccountId": "68666d40c0c44c6900eafbbd",
      "displayName": "Link Master",
      "totalStars": 3,
      "boardsCompleted": 1,
      "perfectRuns": 1
    }
  ]
}
```

---

### GET — By-difficulty leaderboard
```http
GET /api/link-number/leaderboards/difficulty/easy
GET /api/link-number/leaderboards/difficulty/medium
GET /api/link-number/leaderboards/difficulty/hard
GET /api/link-number/leaderboards/difficulty/expert
```

**Example response:**
```json
{
  "success": true,
  "type": "by_difficulty",
  "difficulty": "easy",
  "count": 1,
  "data": [
    {
      "rank": 1,
      "userAccountId": "68666d40c0c44c6900eafbbd",
      "displayName": "Link Master",
      "totalScore": 1450,
      "totalStars": 3,
      "boardsCompleted": 1,
      "averageTime": 38,
      "fastestTime": 38,
      "perfectRuns": 1
    }
  ]
}
```

---

## ❗ Error Responses

| Scenario | HTTP | Response |
|---|---|---|
| Board not found | `404` | `{ "success": false, "message": "Puzzle board #99 not found." }` |
| Invalid difficulty | `400` | `{ "success": false, "message": "Invalid difficulty. Must be one of: easy, medium, hard, expert" }` |
| Duplicate board number | `409` | `{ "success": false, "message": "A board with this boardNumber already exists." }` |
| Session not found | `404` | `{ "success": false, "message": "Session not found." }` |
| Missing required fields | `500` | `{ "success": false, "message": "Path 'boardId' is required." }` |
| No daily challenge today | `404` | `{ "success": false, "message": "No daily challenge has been set for today yet." }` |
| Duplicate daily date | `409` | `{ "success": false, "message": "A daily challenge already exists for this date." }` |
| Progression not found | `404` | `{ "success": false, "message": "No difficulty progression found for this user. Start playing to create one." }` |

---

## 📋 Quick Start Cheat Sheet

```
1. GET  /puzzles                              → list 3 seeded boards, grab _id values
2. POST /sessions                            → start session, get sessionId
3. PATCH /sessions/:id/complete              → submit result, triggers all post-session hooks
4. GET  /progress/user/:userId               → verify BoardProgress updated with stars
5. POST /difficulty/user/:userId/initialize  → create difficulty progression doc
6. GET  /difficulty/user/:userId             → view tier unlock progress
7. GET  /daily/today                         → view today's daily challenge
8. GET  /leaderboards/global                 → view top players after sessions are created
9. GET  /leaderboards/speed                  → fastest solvers
10. GET /leaderboards/difficulty/easy        → difficulty-specific rankings
```

---

## 🔁 Re-seed the Database

```bash
node src/seeders/link-number/seedLinkNumber.js
```

> Safe to run multiple times — uses `$setOnInsert` (upsert), never creates duplicates.

| Collection | Seeded |
|---|---|
| `puzzleboards` | 3 boards (easy 3×3, medium 5×5, hard 6×6) |
| `dailychallengelinks` | 1 (today, linked to medium board) |
| `boardgenerationtemplates` | 3 (one per difficulty) |
