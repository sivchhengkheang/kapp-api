# 🐉 Dragon Drop — API Testing Guide

> Base URL: `http://localhost:5050/api/dragon-drop`
> All requests: `Content-Type: application/json`

---

## 🗂️ Test User ID
```
userAccountId: 60d5ec49f1a2b830a8a1e001
```

---

## 📋 Quick Flow
```
1. GET  /worlds                      → list worlds
2. GET  /worlds/:worldNumber/levels  → list levels in a world
3. POST /levels/:levelNumber/start   → start a level session
4. POST /levels/:levelNumber/submit  → submit results
5. GET  /users/progress              → check user progress
6. GET  /leaderboards/global         → view global leaderboard
7. GET  /bosses/:world               → get boss for a world
8. POST /bosses/:world/start         → start boss battle
9. POST /bosses/:world/submit        → submit boss battle result
```

---

## 1. 🌍 Worlds

### GET — List all worlds
```http
GET /api/dragon-drop/worlds
```
**Expected response:**
```json
{
  "success": true,
  "data": [
    {
      "worldNumber": 1,
      "name": "Ember Isle",
      "description": "A volcanic island where young dragons learn to control fire orbs.",
      "theme": "fire",
      "totalLevels": 10,
      "isUnlocked": true
    }
  ]
}
```

### GET — Single world
```http
GET /api/dragon-drop/worlds/1
```

### GET — All levels in a world
```http
GET /api/dragon-drop/worlds/1/levels
GET /api/dragon-drop/worlds/2/levels
```

---

## 2. 🏁 Levels

### GET — Level by number
```http
GET /api/dragon-drop/levels/1
```

### POST — Start a level
```http
POST /api/dragon-drop/levels/1/start
```
```json
{
  "userAccountId": "60d5ec49f1a2b830a8a1e001"
}
```
> 📋 Copy `data._id` → use as `sessionId` in submit.

---

### POST — Submit level results
```http
POST /api/dragon-drop/levels/1/submit
```

**3-star win:**
```json
{
  "sessionId": "PASTE_SESSION_ID_HERE",
  "performance": {
    "status": "completed",
    "levelPassed": true,
    "starRating": 3,
    "movesUsed": 12,
    "movesAvailable": 20,
    "movesRemaining": 8,
    "score": 4800,
    "baseScore": 3000,
    "comboBonus": 1200,
    "collectibleBonus": 600
  },
  "collectibles": {
    "collected": [
      {
        "id": "map-piece-w1-l1",
        "type": "map_piece",
        "collectedAt": 3,
        "moveNumber": 3,
        "requiredCombo": 3,
        "actualCombo": 4
      },
      {
        "id": "orb-fire-1",
        "type": "special_orb",
        "collectedAt": 7,
        "moveNumber": 7,
        "requiredCombo": 2,
        "actualCombo": 3
      }
    ],
    "missed": [],
    "collectionProgress": {
      "mapPieces": 1,
      "mapPiecesTotal": 1,
      "specialOrbs": 1,
      "specialOrbsTotal": 2
    }
  },
  "moveSequence": [
    {
      "moveNumber": 1,
      "action": {
        "dragFrom": { "x": 2, "y": 3 },
        "dragTo":   { "x": 2, "y": 2 },
        "orb": "fire"
      },
      "matches": [{ "type": "fire", "count": 3, "position": { "x": 2, "y": 2 }, "orbs": ["fire","fire","fire"] }],
      "comboCount": 1,
      "scoreEarned": 300,
      "cascadeOccurred": false
    },
    {
      "moveNumber": 2,
      "action": {
        "dragFrom": { "x": 4, "y": 1 },
        "dragTo":   { "x": 3, "y": 1 },
        "orb": "water"
      },
      "matches": [
        { "type": "water", "count": 3, "position": { "x": 3, "y": 1 }, "orbs": ["water","water","water"] },
        { "type": "fire",  "count": 3, "position": { "x": 2, "y": 3 }, "orbs": ["fire","fire","fire"] }
      ],
      "comboCount": 2,
      "scoreEarned": 900,
      "cascadeOccurred": true
    }
  ],
  "rewards": {
    "xpEarned": 80,
    "xpBonus": 40,
    "totalXP": 120,
    "pointsEarned": 4800,
    "mapPiecesEarned": 1,
    "orbsEarned": 5,
    "achievementsUnlocked": ["first_level_3star"],
    "levelUpAchieved": false
  }
}
```

**1-star pass (barely made it):**
```json
{
  "sessionId": "PASTE_SESSION_ID_HERE",
  "performance": {
    "status": "completed",
    "levelPassed": true,
    "starRating": 1,
    "movesUsed": 19,
    "movesAvailable": 20,
    "movesRemaining": 1,
    "score": 1200,
    "baseScore": 1000,
    "comboBonus": 200,
    "collectibleBonus": 0
  },
  "collectibles": {
    "collected": [],
    "missed": [
      { "id": "map-piece-w1-l1", "type": "map_piece", "reason": "not_enough_combo" }
    ],
    "collectionProgress": {
      "mapPieces": 0,
      "mapPiecesTotal": 1,
      "specialOrbs": 0,
      "specialOrbsTotal": 2
    }
  },
  "moveSequence": [],
  "rewards": {
    "xpEarned": 30,
    "xpBonus": 0,
    "totalXP": 30,
    "pointsEarned": 1200,
    "mapPiecesEarned": 0,
    "orbsEarned": 1,
    "achievementsUnlocked": [],
    "levelUpAchieved": false
  }
}
```

---

### GET — Level play stats
```http
GET /api/dragon-drop/levels/1/stats
```

### GET — User's best run on a level
```http
GET /api/dragon-drop/levels/1/best-run?userAccountId=60d5ec49f1a2b830a8a1e001
```

### GET — All user attempts on a level
```http
GET /api/dragon-drop/levels/1/attempts?userAccountId=60d5ec49f1a2b830a8a1e001
```

---

## 3. 👤 User Progress & Stats

### GET — Overall user progress
```http
GET /api/dragon-drop/users/progress?userAccountId=60d5ec49f1a2b830a8a1e001
```

### GET — World progress
```http
GET /api/dragon-drop/users/world-progress/1?userAccountId=60d5ec49f1a2b830a8a1e001
GET /api/dragon-drop/users/world-progress/2?userAccountId=60d5ec49f1a2b830a8a1e001
```

### GET — Level progress
```http
GET /api/dragon-drop/users/level-progress/1?userAccountId=60d5ec49f1a2b830a8a1e001
```

### GET — User game statistics
```http
GET /api/dragon-drop/users/statistics?userAccountId=60d5ec49f1a2b830a8a1e001
```

---

## 4. 🗺️ Map Pieces

### GET — All collected map pieces for user
```http
GET /api/dragon-drop/map-pieces/collected?userAccountId=60d5ec49f1a2b830a8a1e001
```

### GET — Map pieces collected in a specific world
```http
GET /api/dragon-drop/map-pieces/world/1?userAccountId=60d5ec49f1a2b830a8a1e001
GET /api/dragon-drop/map-pieces/world/2?userAccountId=60d5ec49f1a2b830a8a1e001
```

---

## 5. 🐲 Boss Battles

### GET — Boss info for a world
```http
GET /api/dragon-drop/bosses/1
```
**Expected response:**
```json
{
  "success": true,
  "data": {
    "name": "Infernus the Fire Drake",
    "worldNumber": 1,
    "difficulty": "hard",
    "hp": 1000,
    "specialMove": "fire_tornado"
  }
}
```

### POST — Start boss battle
```http
POST /api/dragon-drop/bosses/1/start
```
```json
{
  "userAccountId": "60d5ec49f1a2b830a8a1e001"
}
```
> 📋 Copy `data._id` → use as `battleId` in submit.

---

### POST — Submit boss battle result

**Victory:**
```http
POST /api/dragon-drop/bosses/1/submit
```
```json
{
  "battleId": "PASTE_BATTLE_ID_HERE",
  "battleResult": "victory",
  "performance": {
    "totalMoves": 18,
    "playerHPRemaining": 65,
    "bossHPDealt": 1000,
    "maxComboAchieved": 5,
    "totalDamageDealt": 1200,
    "specialMoveUsed": true,
    "turnsToWin": 12
  },
  "rewards": {
    "xpEarned": 500,
    "xpBonus": 200,
    "totalXP": 700,
    "pointsEarned": 8000,
    "mapPiecesEarned": 3,
    "orbsEarned": 10,
    "achievementsUnlocked": ["dragon_slayer", "world_1_complete"],
    "worldUnlocked": 2
  }
}
```

**Defeat:**
```json
{
  "battleId": "PASTE_BATTLE_ID_HERE",
  "battleResult": "defeat",
  "performance": {
    "totalMoves": 20,
    "playerHPRemaining": 0,
    "bossHPDealt": 640,
    "maxComboAchieved": 2,
    "totalDamageDealt": 640,
    "specialMoveUsed": false,
    "turnsToWin": null
  },
  "rewards": {
    "xpEarned": 50,
    "xpBonus": 0,
    "totalXP": 50,
    "pointsEarned": 0,
    "mapPiecesEarned": 0,
    "orbsEarned": 0,
    "achievementsUnlocked": []
  }
}
```

---

## 6. 🏆 Leaderboards

### GET — Global leaderboard
```http
GET /api/dragon-drop/leaderboards/global
```

### GET — Stars leaderboard (most stars collected)
```http
GET /api/dragon-drop/leaderboards/stars
```

### GET — World-specific leaderboard
```http
GET /api/dragon-drop/leaderboards/world/1
GET /api/dragon-drop/leaderboards/world/2
```

### GET — Level-specific leaderboard
```http
GET /api/dragon-drop/leaderboards/level/1
GET /api/dragon-drop/leaderboards/level/5
```

---

## ❗ Edge Cases

| Test | Request | Expected |
|---|---|---|
| World with no boss | `GET /bosses/99` | `404 Not Found` |
| Non-existent world | `GET /worlds/99` | `404 Not Found` |
| Non-existent level | `GET /levels/999` | `404 Not Found` |
| Invalid session in submit | `POST /levels/1/submit` with bad `sessionId` | `404 Not Found` |
| Best run with no sessions | `GET /levels/1/best-run?userAccountId=UNKNOWN` | `404 Not Found` |
