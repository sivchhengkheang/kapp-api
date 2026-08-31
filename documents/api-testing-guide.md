# 🧪 Postman API Testing Guide — Kapp Server

> **Base URL:** `http://localhost:5050`  
> **Content-Type Header:** `application/json` (required for all POST/PATCH requests)

---

## 📋 Table of Contents

1. [Health Check](#1-health-check)
2. [Shared — Achievements](#2-shared--achievements)
3. [Shared — User Statistics](#3-shared--user-statistics)
4. [Shared — Leaderboard](#4-shared--leaderboard)
5. [Typing Code — Challenges](#5-typing-code--challenges)
6. [Typing Code — Game Sessions](#6-typing-code--game-sessions)
7. [Typing Code — Inventory](#7-typing-code--inventory)
8. [Typing Math — Math Problems](#8-typing-math--math-problems)
9. [Typing Math — Game Sessions](#9-typing-math--game-sessions)
10. [Typing Math — Problem Attempts](#10-typing-math--problem-attempts)
11. [Typing Math — Daily Challenges](#11-typing-math--daily-challenges)

---

## 1. Health Check

### `GET /`
Verify the server is running and MongoDB is connected.

```
GET http://localhost:5050/
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Kapp Server is running 🚀"
}
```

---

## 2. Shared — Achievements

### `POST /api/shared/achievements`
Create an achievement definition (admin action).

```
POST http://localhost:5050/api/shared/achievements
Content-Type: application/json
```

```json
{
  "achievementId": "speed_demon_001",
  "name": "Speed Demon",
  "description": "Reach 100 WPM in a single typing session",
  "icon": {
    "url": "https://cdn.kapp.io/icons/speed_demon.png",
    "rarity": "epic"
  },
  "requirement": {
    "type": "wpm_threshold",
    "targetWPM": 100,
    "minimumAccuracy": 90,
    "gameMode": "timed"
  },
  "rewards": {
    "xp": 500,
    "points": 200
  },
  "category": "speed",
  "rarity": "epic",
  "displayOrder": 1
}
```

---

### `GET /api/shared/achievements`
List all achievements. Supports query filters.

```
GET http://localhost:5050/api/shared/achievements
GET http://localhost:5050/api/shared/achievements?category=speed
GET http://localhost:5050/api/shared/achievements?rarity=epic
GET http://localhost:5050/api/shared/achievements?category=accuracy&rarity=rare
```

**Query Params:**
| Param | Values | Description |
|-------|--------|-------------|
| `category` | `speed`, `accuracy`, `consistency`, `progression`, `social` | Filter by category |
| `rarity` | `common`, `rare`, `epic`, `legendary` | Filter by rarity |

---

### `GET /api/shared/achievements/:id`
```
GET http://localhost:5050/api/shared/achievements/6a94e92cfe806fbec430d8ce
```

---

### `PATCH /api/shared/achievements/:id`
Update an achievement.

```
PATCH http://localhost:5050/api/shared/achievements/6a94e92cfe806fbec430d8ce
Content-Type: application/json
```

```json
{
  "requirement": {
    "targetWPM": 120,
    "minimumAccuracy": 92
  },
  "rewards": {
    "xp": 750,
    "points": 300
  }
}
```

---

### `DELETE /api/shared/achievements/:id`
```
DELETE http://localhost:5050/api/shared/achievements/6a94e92cfe806fbec430d8ce
```

---

## 3. Shared — User Statistics

### `POST /api/shared/statistics`
Create a fresh statistics document for a new user.

```
POST http://localhost:5050/api/shared/statistics
Content-Type: application/json
```

```json
{
  "userAccountId": "64f1b2c3d4e5f6a7b8c9d0e1",
  "gamesPlayed": {
    "total": 0,
    "completed": 0,
    "abandoned": 0,
    "failed": 0
  },
  "wpm": {
    "current": 0,
    "average": 0,
    "peak": 0
  },
  "accuracy": {
    "average": 0,
    "bestStreak": 0,
    "currentStreak": 0
  },
  "level": {
    "current": 1,
    "xp": {
      "current": 0,
      "totalEarned": 0,
      "nextLevelRequires": 1000
    }
  },
  "streaks": {
    "currentGameWinStreak": 0,
    "longestGameWinStreak": 0,
    "playStreak": {
      "currentDays": 0,
      "longestDays": 0
    }
  },
  "totalPlayTimeSeconds": 0,
  "preferences": {
    "favoriteCategory": "javascript",
    "preferredDifficulty": "intermediate"
  }
}
```

---

### `GET /api/shared/statistics/:userId`
```
GET http://localhost:5050/api/shared/statistics/64f1b2c3d4e5f6a7b8c9d0e1
```

---

### `PATCH /api/shared/statistics/:userId`
Update statistics after a game session completes.

```
PATCH http://localhost:5050/api/shared/statistics/64f1b2c3d4e5f6a7b8c9d0e1
Content-Type: application/json
```

```json
{
  "wpm.current": 87,
  "wpm.average": 74,
  "wpm.peak": 87,
  "accuracy.average": 94.5,
  "level.current": 3,
  "level.xp.current": 340,
  "level.xp.totalEarned": 2340,
  "streaks.currentGameWinStreak": 5,
  "totalPlayTimeSeconds": 7200
}
```

---

### `PATCH /api/shared/statistics/:userId/increment`
Atomically increment counters after a session ends.

```
PATCH http://localhost:5050/api/shared/statistics/64f1b2c3d4e5f6a7b8c9d0e1/increment
Content-Type: application/json
```

```json
{
  "gamesPlayed.total": 1,
  "gamesPlayed.completed": 1,
  "totalPlayTimeSeconds": 180
}
```

---

### `DELETE /api/shared/statistics/:userId`
```
DELETE http://localhost:5050/api/shared/statistics/64f1b2c3d4e5f6a7b8c9d0e1
```

---

## 4. Shared — Leaderboard

### `POST /api/shared/leaderboard`
Upsert a leaderboard entry. Calling again with same `userId + boardType + period` updates the existing record.

```
POST http://localhost:5050/api/shared/leaderboard
Content-Type: application/json
```

```json
{
  "userId": "64f1b2c3d4e5f6a7b8c9d0e1",
  "boardType": "global",
  "period": "weekly",
  "category": null,
  "rank": 12,
  "metrics": {
    "score": 15420,
    "wpm": 87,
    "averageAccuracy": 94.5,
    "gamesCompleted": 23,
    "totalXP": 2340,
    "gamesThisWeek": 8
  },
  "userSnapshot": {
    "username": "kheangsive",
    "displayName": "Kheang Sive",
    "avatar": "https://cdn.kapp.io/avatars/user001.png",
    "level": 12
  },
  "calculatedAt": "2026-08-31T02:00:00.000Z",
  "previousRank": 14,
  "rankChange": 2,
  "isNewEntry": false
}
```

**Category leaderboard example:**
```json
{
  "userId": "64f1b2c3d4e5f6a7b8c9d0e1",
  "boardType": "category",
  "period": "all_time",
  "category": "javascript",
  "rank": 5,
  "metrics": {
    "score": 48200,
    "wpm": 102,
    "averageAccuracy": 96.8,
    "gamesCompleted": 87
  },
  "userSnapshot": {
    "username": "kheangsive",
    "displayName": "Kheang Sive",
    "level": 12
  },
  "calculatedAt": "2026-08-31T02:00:00.000Z"
}
```

---

### `GET /api/shared/leaderboard`
```
GET http://localhost:5050/api/shared/leaderboard
GET http://localhost:5050/api/shared/leaderboard?boardType=global&period=weekly
GET http://localhost:5050/api/shared/leaderboard?boardType=category&category=javascript&period=all_time
GET http://localhost:5050/api/shared/leaderboard?period=weekly&limit=10
```

**Query Params:**
| Param | Values | Description |
|-------|--------|-------------|
| `boardType` | `global`, `category`, `weekly`, `friends` | Board type |
| `period` | `weekly`, `monthly`, `all_time` | Time period |
| `category` | e.g. `javascript`, `python` | Category filter |
| `limit` | number (default: 50) | Max results |

---

### `GET /api/shared/leaderboard/user/:userId`
```
GET http://localhost:5050/api/shared/leaderboard/user/64f1b2c3d4e5f6a7b8c9d0e1
```

---

### `PATCH /api/shared/leaderboard/:id`
```
PATCH http://localhost:5050/api/shared/leaderboard/6a94e92cfe806fbec430d8ce
Content-Type: application/json
```

```json
{
  "rank": 8,
  "rankChange": 4,
  "metrics.score": 18700,
  "metrics.wpm": 95
}
```

---

### `DELETE /api/shared/leaderboard/:id`
```
DELETE http://localhost:5050/api/shared/leaderboard/6a94e92cfe806fbec430d8ce
```

---

## 5. Typing Code — Challenges

### `POST /api/typing-code/challenges`
Create a new code snippet challenge.

```
POST http://localhost:5050/api/typing-code/challenges
Content-Type: application/json
```

```json
{
  "title": "JavaScript Arrow Function",
  "description": "Type this modern ES6 arrow function syntax",
  "codeSnippet": "const add = (a, b) => a + b;\nconsole.log(add(2, 3));",
  "language": "javascript",
  "category": "javascript",
  "difficulty": "beginner",
  "length": {
    "characters": 51,
    "lines": 2,
    "words": 10
  },
  "estimatedTimeSeconds": 30,
  "tags": ["es6", "functions", "arrow"],
  "status": {
    "isPublished": true,
    "isFeatured": false
  },
  "seo": {
    "slug": "javascript-arrow-function",
    "keywords": ["arrow function", "es6", "javascript"]
  }
}
```

**Python example:**
```json
{
  "title": "Python List Comprehension",
  "description": "Classic Python one-liner for filtering lists",
  "codeSnippet": "squares = [x**2 for x in range(10) if x % 2 == 0]\nprint(squares)",
  "language": "python",
  "category": "python",
  "difficulty": "intermediate",
  "length": {
    "characters": 63,
    "lines": 2,
    "words": 12
  },
  "estimatedTimeSeconds": 45,
  "tags": ["list-comprehension", "python", "functional"],
  "status": {
    "isPublished": true,
    "isFeatured": true
  }
}
```

---

### `GET /api/typing-code/challenges`
```
GET http://localhost:5050/api/typing-code/challenges
GET http://localhost:5050/api/typing-code/challenges?language=javascript&difficulty=beginner
GET http://localhost:5050/api/typing-code/challenges?isPublished=true&isFeatured=true
GET http://localhost:5050/api/typing-code/challenges?category=python&page=1&limit=10
```

**Query Params:**
| Param | Values | Description |
|-------|--------|-------------|
| `language` | `javascript`, `python`, `java`, etc. | Language filter |
| `difficulty` | `beginner`, `intermediate`, `advanced`, `expert` | Difficulty |
| `category` | any string | Category filter |
| `isPublished` | `true`, `false` | Published filter |
| `isFeatured` | `true`, `false` | Featured filter |
| `page` | number | Page number |
| `limit` | number | Per page |

---

### `PATCH /api/typing-code/challenges/:id/stats`
Atomically increment play count after every session ends.

```
PATCH http://localhost:5050/api/typing-code/challenges/6a94e938fe806fbec430d8cf/stats
Content-Type: application/json
```

```json
{
  "stats.timesPlayed": 1
}
```

---

### `PATCH /api/typing-code/challenges/:id`
```
PATCH http://localhost:5050/api/typing-code/challenges/6a94e938fe806fbec430d8cf
Content-Type: application/json
```

```json
{
  "status.isFeatured": true,
  "stats.averageWpm": 62.4,
  "stats.averageAccuracy": 91.2,
  "stats.successRate": 87.5
}
```

---

### `DELETE /api/typing-code/challenges/:id`
```
DELETE http://localhost:5050/api/typing-code/challenges/6a94e938fe806fbec430d8cf
```

---

## 6. Typing Code — Game Sessions

### `POST /api/typing-code/sessions`
Start a new code typing session when the player begins a game.

```
POST http://localhost:5050/api/typing-code/sessions
Content-Type: application/json
```

```json
{
  "userId": "64f1b2c3d4e5f6a7b8c9d0e1",
  "gameMode": "timed",
  "category": "javascript",
  "difficulty": "intermediate",
  "challengeId": "6a94e938fe806fbec430d8cf",
  "timing": {
    "startedAt": "2026-08-31T09:00:00.000Z"
  },
  "challengeData": {
    "snippetLength": 120,
    "languageUsed": "javascript",
    "timeAllowedSeconds": 60
  },
  "device": {
    "type": "desktop",
    "os": "Windows 11",
    "browser": "Chrome 127"
  }
}
```

---

### `PATCH /api/typing-code/sessions/:id`
End the session — send all performance and results data.

```
PATCH http://localhost:5050/api/typing-code/sessions/6a94e938fe806fbec430d8ce
Content-Type: application/json
```

```json
{
  "timing": {
    "endedAt": "2026-08-31T09:01:45.000Z",
    "durationSeconds": 105
  },
  "performance": {
    "totalTyped": 120,
    "wordsTyped": 24,
    "correctWords": 22,
    "incorrectWords": 2,
    "accuracy": 91.67,
    "wpm": 74,
    "peakWpm": 89,
    "correctCharacters": 112,
    "incorrectCharacters": 8,
    "keyPresses": 128,
    "completionPercentage": 100
  },
  "results": {
    "status": "completed",
    "score": 8420,
    "xpEarned": 120,
    "isPersonalBest": true,
    "rank": 8,
    "streakBonus": 200,
    "accuracyBonus": 150,
    "speedBonus": 100,
    "consistencyBonus": 50
  },
  "consistency": {
    "score": 82,
    "wpmVariance": 12.4,
    "stabilityPeriod": "stable"
  },
  "mistakes": [
    {
      "position": 34,
      "characterTyped": "a",
      "expectedCharacter": "s",
      "context": "const",
      "time": "2026-08-31T09:00:38.000Z"
    }
  ]
}
```

---

### `GET /api/typing-code/sessions/user/:userId`
```
GET http://localhost:5050/api/typing-code/sessions/user/64f1b2c3d4e5f6a7b8c9d0e1
GET http://localhost:5050/api/typing-code/sessions/user/64f1b2c3d4e5f6a7b8c9d0e1?status=completed
GET http://localhost:5050/api/typing-code/sessions/user/64f1b2c3d4e5f6a7b8c9d0e1?category=javascript&limit=5
```

---

### `GET /api/typing-code/sessions/user/:userId/best`
User's personal best session (highest WPM).

```
GET http://localhost:5050/api/typing-code/sessions/user/64f1b2c3d4e5f6a7b8c9d0e1/best
```

---

### `DELETE /api/typing-code/sessions/:id`
```
DELETE http://localhost:5050/api/typing-code/sessions/6a94e938fe806fbec430d8ce
```

---

## 7. Typing Code — Inventory

### `POST /api/typing-code/inventory/items`
Create a power-up or cosmetic item definition.

```
POST http://localhost:5050/api/typing-code/inventory/items
Content-Type: application/json
```

```json
{
  "name": "Time Freeze",
  "slug": "time-freeze",
  "description": "Pause the countdown timer for 10 seconds",
  "type": "power_up",
  "category": "time",
  "rarity": "rare",
  "effect": {
    "type": "pause_timer",
    "parameters": {
      "durationSeconds": 10
    },
    "impact": {
      "wpsBenefitPercent": 15,
      "accuracyBenefitPercent": 5
    }
  },
  "cost": {
    "points": 500,
    "xp": 0,
    "premium": 0
  },
  "stackable": true,
  "maxStackCount": 3,
  "acquisition": {
    "isPurchasable": true,
    "isAchievable": false,
    "dropRate": 0.05
  },
  "cooldown": {
    "cooldownSeconds": 30,
    "usesPerGame": 2
  }
}
```

---

### `GET /api/typing-code/inventory/items`
```
GET http://localhost:5050/api/typing-code/inventory/items
GET http://localhost:5050/api/typing-code/inventory/items?type=power_up
GET http://localhost:5050/api/typing-code/inventory/items?rarity=rare
```

---

### `POST /api/typing-code/inventory`
Create a user inventory document (on account creation).

```
POST http://localhost:5050/api/typing-code/inventory
Content-Type: application/json
```

```json
{
  "userId": "64f1b2c3d4e5f6a7b8c9d0e1",
  "powerUps": [],
  "cosmetics": [],
  "stats": {
    "totalItemsOwned": 0,
    "powerUpsTotalUsed": 0,
    "lastInventoryUpdateAt": "2026-08-31T09:00:00.000Z"
  }
}
```

---

### `GET /api/typing-code/inventory/:userId`
```
GET http://localhost:5050/api/typing-code/inventory/64f1b2c3d4e5f6a7b8c9d0e1
```

---

### `PATCH /api/typing-code/inventory/:userId/add-item`
Add a power-up to the user's inventory.

```
PATCH http://localhost:5050/api/typing-code/inventory/64f1b2c3d4e5f6a7b8c9d0e1/add-item
Content-Type: application/json
```

```json
{
  "itemType": "powerUps",
  "item": {
    "itemId": "6a94e938fe806fbec430d8cf",
    "quantity": 1,
    "isEquipped": false,
    "acquiredAt": "2026-08-31T09:05:00.000Z",
    "source": "purchased"
  }
}
```

**Add a cosmetic:**
```json
{
  "itemType": "cosmetics",
  "item": {
    "itemId": "6a94e938fe806fbec430d8d0",
    "isEquipped": true,
    "acquiredAt": "2026-08-31T09:10:00.000Z",
    "source": "achievement"
  }
}
```

---

## 8. Typing Math — Math Problems

### `POST /api/typing-math/problems`
Create math problems.

```
POST http://localhost:5050/api/typing-math/problems
Content-Type: application/json
```

```json
{
  "problemId": "prob_add_002",
  "title": "Two-Digit Addition",
  "operation": "addition",
  "category": "arithmetic",
  "subcategory": "two-digit",
  "difficulty": "easy",
  "problem": {
    "operand1": 47,
    "operand2": 36,
    "operator": "+",
    "displayText": "47 + 36 = ?",
    "answerText": "83"
  },
  "answer": {
    "correctAnswer": 83,
    "isInteger": true,
    "canBeNegative": false
  },
  "commonMistakes": [
    { "answer": 73, "explanation": "Digits swapped in ones place" },
    { "answer": 84, "explanation": "Carry error" }
  ],
  "creator": { "type": "system" },
  "status": { "isActive": true },
  "tags": ["addition", "two-digit", "carry"]
}
```

**Multiplication example:**
```json
{
  "problemId": "prob_mul_001",
  "title": "Times Table — 7s",
  "operation": "multiplication",
  "category": "arithmetic",
  "subcategory": "times-tables",
  "difficulty": "intermediate",
  "problem": {
    "operand1": 7,
    "operand2": 8,
    "operator": "x",
    "displayText": "7 x 8 = ?",
    "answerText": "56"
  },
  "answer": {
    "correctAnswer": 56,
    "isInteger": true,
    "canBeNegative": false
  },
  "creator": { "type": "system" },
  "status": { "isActive": true },
  "tags": ["multiplication", "times-table", "7s"]
}
```

---

### `GET /api/typing-math/problems`
```
GET http://localhost:5050/api/typing-math/problems
GET http://localhost:5050/api/typing-math/problems?operation=addition&difficulty=easy
GET http://localhost:5050/api/typing-math/problems?operation=multiplication&isActive=true&limit=10
```

**Query Params:**
| Param | Values | Description |
|-------|--------|-------------|
| `operation` | `addition`, `subtraction`, `multiplication`, `division`, `fractions`, `decimals`, `mixed` | Operation |
| `difficulty` | `beginner`, `easy`, `intermediate`, `hard`, `expert` | Difficulty |
| `category` | any string | Category |
| `isActive` | `true`, `false` | Active status |
| `page` | number | Page |
| `limit` | number | Per page |

---

### `PATCH /api/typing-math/problems/:id/stats`
Increment attempt stats after each problem (call per problem or at session end).

```
PATCH http://localhost:5050/api/typing-math/problems/6a94e92cfe806fbec430d8ce/stats
Content-Type: application/json
```

```json
{
  "stats.timesAttempted": 1,
  "stats.timesCorrect": 1
}
```

**Wrong answer (only increment attempted):**
```json
{
  "stats.timesAttempted": 1
}
```

---

## 9. Typing Math — Game Sessions

### `POST /api/typing-math/sessions`
Start a new math session.

```
POST http://localhost:5050/api/typing-math/sessions
Content-Type: application/json
```

```json
{
  "userAccountId": "64f1b2c3d4e5f6a7b8c9d0e1",
  "gameMode": "timed_challenge",
  "category": "arithmetic",
  "operations": ["addition", "subtraction"],
  "difficulty": "intermediate",
  "settings": {
    "durationSeconds": 60,
    "problemCount": 20,
    "showTimer": true,
    "showScore": true,
    "hintAllowed": false,
    "showPreviousProblem": false
  },
  "timing": {
    "startedAt": "2026-08-31T09:10:00.000Z"
  },
  "device": {
    "type": "web",
    "os": "Windows 11",
    "browser": "Chrome 127",
    "language": "en"
  }
}
```

---

### `PATCH /api/typing-math/sessions/:id`
End the session with full results.

```
PATCH http://localhost:5050/api/typing-math/sessions/6a94e938fe806fbec430d8ce
Content-Type: application/json
```

```json
{
  "timing": {
    "endedAt": "2026-08-31T09:11:02.000Z",
    "durationSeconds": 62
  },
  "performance": {
    "totalProblems": 20,
    "solvedCorrectly": 17,
    "solvedIncorrectly": 2,
    "skipped": 1,
    "accuracy": 85,
    "wpm": 42,
    "peakWpm": 55,
    "averageProblemTime": 3.1,
    "fastestProblem": 1.4,
    "slowestProblem": 8.2,
    "longestCorrectStreak": 8,
    "currentCorrectStreak": 4
  },
  "results": {
    "status": "completed",
    "score": 6800,
    "xpEarned": 85,
    "isPersonalBest": false,
    "previousBestScore": 7100
  },
  "consistency": {
    "score": 74,
    "timeVariance": 2.1,
    "accuracyStability": "consistent"
  },
  "problemDetails": [
    {
      "problemId": "6a94e92cfe806fbec430d8ce",
      "operation": "addition",
      "problem": "47 + 36 = ?",
      "userAnswer": "83",
      "correctAnswer": "83",
      "isCorrect": true,
      "timeToAnswer": 2.1,
      "attemptNumber": 1
    }
  ],
  "mistakes": [
    {
      "position": 5,
      "problemId": "6a94e92cfe806fbec430d8d0",
      "operation": "multiplication",
      "problem": "7 x 8 = ?",
      "userAnswer": "54",
      "correctAnswer": "56",
      "mistakeType": "off_by_small",
      "timeToAnswer": 4.8
    }
  ]
}
```

---

### `GET /api/typing-math/sessions/user/:userId`
```
GET http://localhost:5050/api/typing-math/sessions/user/64f1b2c3d4e5f6a7b8c9d0e1
GET http://localhost:5050/api/typing-math/sessions/user/64f1b2c3d4e5f6a7b8c9d0e1?status=completed
GET http://localhost:5050/api/typing-math/sessions/user/64f1b2c3d4e5f6a7b8c9d0e1?gameMode=timed_challenge&limit=5
```

---

### `GET /api/typing-math/sessions/user/:userId/best`
```
GET http://localhost:5050/api/typing-math/sessions/user/64f1b2c3d4e5f6a7b8c9d0e1/best
```

---

### `DELETE /api/typing-math/sessions/:id`
```
DELETE http://localhost:5050/api/typing-math/sessions/6a94e938fe806fbec430d8ce
```

---

## 10. Typing Math — Problem Attempts

### `POST /api/typing-math/attempts`
Record a single problem attempt in real-time.

```
POST http://localhost:5050/api/typing-math/attempts
Content-Type: application/json
```

```json
{
  "userAccountId": "64f1b2c3d4e5f6a7b8c9d0e1",
  "sessionId": "6a94e938fe806fbec430d8ce",
  "problemId": "6a94e92cfe806fbec430d8ce",
  "operation": "addition",
  "problem": "47 + 36 = ?",
  "userAnswer": "83",
  "correctAnswer": "83",
  "isCorrect": true,
  "timeToAnswer": 2.1,
  "timeFromGameStart": 5.3,
  "attemptNumber": 1,
  "hintUsed": false,
  "skipped": false,
  "inputMethod": "keyboard",
  "keystrokes": {
    "totalKeypresses": 3,
    "corrections": 0,
    "deletions": 0,
    "accuracy": 100
  },
  "problemDifficulty": {
    "baseLevel": 2,
    "userLevel": 3,
    "isAppropriate": true
  },
  "timestamp": "2026-08-31T09:10:05.300Z"
}
```

---

### `POST /api/typing-math/attempts/bulk`
Submit all attempts at once when the session ends (most efficient).

```
POST http://localhost:5050/api/typing-math/attempts/bulk
Content-Type: application/json
```

```json
{
  "attempts": [
    {
      "userAccountId": "64f1b2c3d4e5f6a7b8c9d0e1",
      "sessionId": "6a94e938fe806fbec430d8ce",
      "problemId": "6a94e92cfe806fbec430d8ce",
      "operation": "addition",
      "problem": "47 + 36 = ?",
      "userAnswer": "83",
      "correctAnswer": "83",
      "isCorrect": true,
      "timeToAnswer": 2.1,
      "timeFromGameStart": 2.1,
      "attemptNumber": 1,
      "inputMethod": "keyboard",
      "timestamp": "2026-08-31T09:10:02.100Z"
    },
    {
      "userAccountId": "64f1b2c3d4e5f6a7b8c9d0e1",
      "sessionId": "6a94e938fe806fbec430d8ce",
      "problemId": "6a94e92cfe806fbec430d8cf",
      "operation": "multiplication",
      "problem": "7 x 8 = ?",
      "userAnswer": "54",
      "correctAnswer": "56",
      "isCorrect": false,
      "timeToAnswer": 4.8,
      "timeFromGameStart": 8.7,
      "attemptNumber": 1,
      "hintUsed": false,
      "inputMethod": "keyboard",
      "timestamp": "2026-08-31T09:10:08.700Z"
    },
    {
      "userAccountId": "64f1b2c3d4e5f6a7b8c9d0e1",
      "sessionId": "6a94e938fe806fbec430d8ce",
      "problemId": "6a94e92cfe806fbec430d8d0",
      "operation": "subtraction",
      "problem": "91 - 34 = ?",
      "userAnswer": "57",
      "correctAnswer": "57",
      "isCorrect": true,
      "timeToAnswer": 3.4,
      "timeFromGameStart": 12.1,
      "attemptNumber": 1,
      "inputMethod": "keyboard",
      "timestamp": "2026-08-31T09:10:12.100Z"
    }
  ]
}
```

---

### `GET /api/typing-math/attempts/user/:userId`
```
GET http://localhost:5050/api/typing-math/attempts/user/64f1b2c3d4e5f6a7b8c9d0e1
GET http://localhost:5050/api/typing-math/attempts/user/64f1b2c3d4e5f6a7b8c9d0e1?isCorrect=false
GET http://localhost:5050/api/typing-math/attempts/user/64f1b2c3d4e5f6a7b8c9d0e1?operation=multiplication&limit=20
```

---

### `GET /api/typing-math/attempts/session/:sessionId`
All attempts in a session, ordered by game time.

```
GET http://localhost:5050/api/typing-math/attempts/session/6a94e938fe806fbec430d8ce
```

---

### `DELETE /api/typing-math/attempts/:id`
```
DELETE http://localhost:5050/api/typing-math/attempts/6a94e92cfe806fbec430d8d1
```

---

## 11. Typing Math — Daily Challenges

### `POST /api/typing-math/daily-challenges`
Create today's daily challenge.

```
POST http://localhost:5050/api/typing-math/daily-challenges
Content-Type: application/json
```

```json
{
  "date": "2026-08-31T00:00:00.000Z",
  "title": "Sunday Sprint — Mixed Operations",
  "description": "20 mixed math problems to test your all-around skills. Top 3 get bonus XP!",
  "challengeConfig": {
    "operations": ["addition", "subtraction", "multiplication"],
    "difficulty": "intermediate",
    "problemCount": 20,
    "durationSeconds": 120,
    "categoryFocus": "arithmetic"
  },
  "problems": [
    "6a94e92cfe806fbec430d8ce",
    "6a94e92cfe806fbec430d8cf"
  ],
  "rewards": {
    "xpForCompletion": 150,
    "pointsForCompletion": 500,
    "xpForFirstPlace": 500,
    "specialReward": "Golden Trophy Badge"
  },
  "isActive": true
}
```

---

### `GET /api/typing-math/daily-challenges/today`
Get today's active challenge (call this on app startup).

```
GET http://localhost:5050/api/typing-math/daily-challenges/today
```

---

### `GET /api/typing-math/daily-challenges`
```
GET http://localhost:5050/api/typing-math/daily-challenges
GET http://localhost:5050/api/typing-math/daily-challenges?isActive=true&limit=7
```

---

### `PATCH /api/typing-math/daily-challenges/:id/top-scores`
Submit a user's score to the daily challenge leaderboard.

```
PATCH http://localhost:5050/api/typing-math/daily-challenges/6a94e938fe806fbec430d8ce/top-scores
Content-Type: application/json
```

```json
{
  "rank": 1,
  "userAccountId": "64f1b2c3d4e5f6a7b8c9d0e1",
  "displayName": "Kheang Sive",
  "score": 9850,
  "accuracy": 98.5,
  "timeToComplete": 87.3
}
```

---

### `PATCH /api/typing-math/daily-challenges/:id`
Update challenge stats at end of day.

```
PATCH http://localhost:5050/api/typing-math/daily-challenges/6a94e938fe806fbec430d8ce
Content-Type: application/json
```

```json
{
  "stats.totalAttempts": 142,
  "stats.totalCompleted": 118,
  "stats.averageScore": 6240,
  "stats.averageAccuracy": 82.4,
  "stats.averageTime": 98.7,
  "isActive": false
}
```

---

## Recommended Testing Workflows

### Full Typing Math Game Flow (in order)

```
Step 1.  POST /api/typing-math/problems           → Create 3+ problems, copy their _id values
Step 2.  POST /api/typing-math/daily-challenges   → Create today's challenge using problem _ids
Step 3.  GET  /api/typing-math/daily-challenges/today → Verify it loads
Step 4.  POST /api/typing-math/sessions           → Start a game session, copy session _id
Step 5.  POST /api/typing-math/attempts/bulk      → Submit all attempts (session + problem _ids)
Step 6.  PATCH /api/typing-math/sessions/:id      → End session with results + performance
Step 7.  PATCH /api/typing-math/problems/:id/stats → Increment stats for each problem
Step 8.  PATCH /api/typing-math/daily-challenges/:id/top-scores → Submit the score
Step 9.  POST  /api/shared/statistics             → Create user stats doc (first time only)
Step 10. PATCH /api/shared/statistics/:userId/increment → Increment gamesPlayed counters
Step 11. POST  /api/shared/leaderboard            → Upsert leaderboard entry
```

### Full Typing Code Game Flow (in order)

```
Step 1.  POST /api/typing-code/challenges           → Create a challenge, copy _id
Step 2.  POST /api/typing-code/inventory/items      → Create a power-up item, copy _id
Step 3.  POST /api/typing-code/inventory            → Create user inventory (first time only)
Step 4.  POST /api/typing-code/sessions             → Start session with challengeId
Step 5.  PATCH /api/typing-code/sessions/:id        → End session with performance + results
Step 6.  PATCH /api/typing-code/challenges/:id/stats → Increment stats.timesPlayed by 1
Step 7.  PATCH /api/shared/statistics/:userId/increment → Update gamesPlayed counters
Step 8.  POST  /api/shared/leaderboard              → Upsert leaderboard entry
```

---

## Postman Tips

> **Save IDs as Environment Variables**  
> In the **Tests** tab of each POST request, add:
> ```javascript
> pm.environment.set("sessionId", pm.response.json().data._id);
> pm.environment.set("userId", pm.response.json().data._id);
> ```
> Then use `{{sessionId}}` and `{{userId}}` in URLs and request bodies.

> **Set Base URL as a variable**  
> Create a `baseUrl` environment variable = `http://localhost:5050`  
> Use `{{baseUrl}}/api/typing-math/sessions` in all requests.

> **Note on ObjectIds**  
> Replace all `64f1b2c3d4e5f6a7b8c9d0e1` and `6a94e938fe806fbec430d8ce` placeholders with real `_id` values returned by your POST responses. MongoDB ObjectIds are 24-character hex strings.

> **Auth is not yet implemented**  
> The `UserAccount`, `AuthSession`, and `LoginHistory` models exist in `/src/models/shared/` and are ready to be wired up. All current routes are unprotected. Auth (register, login, JWT middleware) can be added as the next step.
