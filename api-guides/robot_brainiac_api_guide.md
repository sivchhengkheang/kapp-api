# 🤖 Robot Brainiac — API Testing Guide

> Base URL: `http://localhost:5050/api/robot-brainiac`
> All requests: `Content-Type: application/json`

---

## 🗂️ Test User ID
```
userAccountId / userId: 60d5ec49f1a2b830a8a1e001
```

---

## 📋 Quick Flow
```
1. POST /levels              → create level, get levelId
2. POST /sessions            → create session (in_progress)
3. PATCH /sessions/:id       → update when session ends (completed/failed)
4. POST /attempts            → record a single attempt
5. POST /attempts/bulk       → record all attempts at once
6. POST /levels/:id/stats    → increment level play stats
7. GET  /sessions/user/:userId/best → verify best efficiency
8. GET  /levels/next         → get next recommended level
```

---

## 1. 🗺️ Levels

### GET — List all levels
```http
GET /api/robot-brainiac/levels
```

### GET — Filter by difficulty
```http
GET /api/robot-brainiac/levels?difficulty=easy
GET /api/robot-brainiac/levels?difficulty=medium
GET /api/robot-brainiac/levels?difficulty=hard
GET /api/robot-brainiac/levels?difficulty=expert
```

### GET — Filter by category
```http
GET /api/robot-brainiac/levels?category=maze_navigation
GET /api/robot-brainiac/levels?category=pattern_recognition
GET /api/robot-brainiac/levels?category=obstacle_avoidance
```

### GET — Published levels only
```http
GET /api/robot-brainiac/levels?isPublished=true
```

### GET — Featured levels
```http
GET /api/robot-brainiac/levels?isFeatured=true
```

### GET — Paginated
```http
GET /api/robot-brainiac/levels?page=1&limit=10
```

### GET — Next recommended level for a user
```http
GET /api/robot-brainiac/levels/next
```
> Returns the lowest-numbered published level near the user's current level.

### GET — Single level by ID
```http
GET /api/robot-brainiac/levels/LEVEL_ID_HERE
```

---

### POST — Create a level (easy, maze navigation)
```http
POST /api/robot-brainiac/levels
```
```json
{
  "levelNumber": 1,
  "title": "First Steps",
  "description": "Guide your robot from start to the green goal square.",
  "difficulty": "easy",
  "category": "maze_navigation",
  "recommendedLevel": 1,
  "grid": {
    "width": 5,
    "height": 5,
    "cellSize": 80
  },
  "robot": {
    "startPosition": { "x": 0, "y": 0 },
    "startDirection": "EAST",
    "robotType": "standard",
    "properties": {
      "canRotate": true,
      "canPushObjects": false,
      "hasMemory": false,
      "speed": 1
    }
  },
  "goal": {
    "position": { "x": 4, "y": 4 },
    "type": "reach_point",
    "objectives": [
      {
        "id": "obj-1",
        "type": "reach_goal",
        "position": { "x": 4, "y": 4 },
        "required": true
      }
    ]
  },
  "obstacles": [
    {
      "id": "wall-1",
      "type": "wall",
      "positions": [
        { "x": 2, "y": 0 },
        { "x": 2, "y": 1 },
        { "x": 2, "y": 2 }
      ],
      "properties": {
        "solid": true,
        "movable": false,
        "damageable": false,
        "stopsRobot": true,
        "damageOnCollision": false
      }
    }
  ],
  "collectibles": [
    {
      "id": "star-1",
      "type": "star",
      "position": { "x": 3, "y": 1 },
      "points": 100,
      "bonus": "speed_star"
    }
  ],
  "solution": {
    "optimalMoves": 8,
    "optimalTime": 30,
    "optimalSequence": ["FORWARD","FORWARD","TURN_RIGHT","FORWARD","TURN_LEFT","FORWARD","FORWARD","FORWARD"],
    "allowedMoves": 15,
    "timeLimit": 120,
    "hints": [
      {
        "id": "hint-1",
        "level": 1,
        "text": "Move EAST first, there's a wall blocking the center path.",
        "revealAfterAttempts": 2,
        "revealAfterTime": 30
      }
    ]
  },
  "rewards": {
    "xpForCompletion": 100,
    "xpForOptimal": 200,
    "xpForPerfect": 400,
    "pointsForCompletion": 100,
    "pointsForSpeed": 50,
    "bonusAchievement": "first_steps"
  },
  "author": {
    "type": "system"
  },
  "status": {
    "isPublished": true,
    "isFeatured": false,
    "isArchived": false
  }
}
```

### POST — Create a harder level (medium, obstacle avoidance)
```json
{
  "levelNumber": 2,
  "title": "Moving Walls",
  "description": "Avoid moving walls — timing is everything!",
  "difficulty": "medium",
  "category": "obstacle_avoidance",
  "recommendedLevel": 3,
  "grid": { "width": 6, "height": 6, "cellSize": 80 },
  "robot": {
    "startPosition": { "x": 0, "y": 3 },
    "startDirection": "EAST",
    "robotType": "standard",
    "properties": { "canRotate": true, "canPushObjects": false, "hasMemory": false, "speed": 1 }
  },
  "goal": {
    "position": { "x": 5, "y": 3 },
    "type": "reach_point",
    "objectives": [{ "id": "obj-1", "type": "reach_goal", "position": { "x": 5, "y": 3 }, "required": true }]
  },
  "obstacles": [
    {
      "id": "moving-wall-1",
      "type": "moving_wall",
      "startPosition": { "x": 3, "y": 0 },
      "path": [{ "x": 3, "y": 0 }, { "x": 3, "y": 5 }, { "x": 3, "y": 0 }],
      "cycleDuration": 4,
      "properties": { "solid": true, "movable": false, "damageable": false, "stopsRobot": true, "damageOnCollision": true }
    }
  ],
  "collectibles": [],
  "solution": {
    "optimalMoves": 6,
    "optimalTime": 25,
    "optimalSequence": ["FORWARD","FORWARD","WAIT","FORWARD","FORWARD","FORWARD"],
    "allowedMoves": 12,
    "timeLimit": 90
  },
  "rewards": {
    "xpForCompletion": 200,
    "xpForOptimal": 400,
    "xpForPerfect": 800,
    "pointsForCompletion": 200,
    "pointsForSpeed": 100
  },
  "author": { "type": "system" },
  "status": { "isPublished": true, "isFeatured": true, "isArchived": false }
}
```

### PATCH — Update level
```http
PATCH /api/robot-brainiac/levels/LEVEL_ID_HERE
```
```json
{
  "status": { "isFeatured": true },
  "rewards": { "xpForCompletion": 150 }
}
```

### POST — Increment level stats (after each attempt)
```http
POST /api/robot-brainiac/levels/LEVEL_ID_HERE/stats
```
```json
{
  "stats.timesAttempted": 1,
  "stats.timesCompleted": 1
}
```

### DELETE — Delete level
```http
DELETE /api/robot-brainiac/levels/LEVEL_ID_HERE
```

---

## 2. 🎮 Game Sessions

### POST — Create session (start playing)
```http
POST /api/robot-brainiac/sessions
```
```json
{
  "userAccountId": "60d5ec49f1a2b830a8a1e001",
  "levelId": "PASTE_LEVEL_ID_HERE",
  "levelNumber": 1,
  "difficulty": "easy",
  "timing": {
    "startedAt": "2026-09-01T15:00:00.000Z",
    "pausedSeconds": 0
  },
  "performance": {
    "status": "in_progress"
  },
  "analytics": {
    "restartCount": 0,
    "hintUsed": false,
    "hintsUsedCount": 0,
    "autoSolveUsed": false
  },
  "device": {
    "type": "desktop",
    "os": "Linux",
    "browser": "Chrome"
  }
}
```
> 📋 Copy `data._id` → use as session ID in next steps.

---

### PATCH — End session (robot reached goal — success)
```http
PATCH /api/robot-brainiac/sessions/PASTE_SESSION_ID_HERE
```
```json
{
  "timing": {
    "endedAt": "2026-09-01T15:01:30.000Z",
    "durationSeconds": 90,
    "pausedSeconds": 0
  },
  "performance": {
    "status": "completed",
    "goalReached": true,
    "movesExecuted": 8,
    "optimalMoves": 8,
    "efficiency": 100,
    "timeToSolve": 90,
    "timeOptimal": 30,
    "speedRating": 85,
    "collectiblesCollected": 1,
    "collectiblesTotal": 1,
    "attemptCount": 1
  },
  "commandSequence": [
    { "index": 0, "command": "FORWARD",    "executed": true, "result": "success", "timestamp": 5,  "robotPosition": { "x": 1, "y": 0 }, "robotDirection": "EAST" },
    { "index": 1, "command": "FORWARD",    "executed": true, "result": "success", "timestamp": 10, "robotPosition": { "x": 2, "y": 0 }, "robotDirection": "EAST" },
    { "index": 2, "command": "TURN_RIGHT", "executed": true, "result": "success", "timestamp": 15, "robotPosition": { "x": 2, "y": 0 }, "robotDirection": "SOUTH" },
    { "index": 3, "command": "FORWARD",    "executed": true, "result": "success", "timestamp": 20, "robotPosition": { "x": 2, "y": 1 }, "robotDirection": "SOUTH" },
    { "index": 4, "command": "TURN_LEFT",  "executed": true, "result": "success", "timestamp": 25, "robotPosition": { "x": 2, "y": 1 }, "robotDirection": "EAST" },
    { "index": 5, "command": "FORWARD",    "executed": true, "result": "success", "timestamp": 30, "robotPosition": { "x": 3, "y": 1 }, "robotDirection": "EAST" },
    { "index": 6, "command": "FORWARD",    "executed": true, "result": "success", "timestamp": 35, "robotPosition": { "x": 4, "y": 1 }, "robotDirection": "EAST" },
    { "index": 7, "command": "FORWARD",    "executed": true, "result": "success", "timestamp": 40, "robotPosition": { "x": 4, "y": 4 }, "robotDirection": "EAST" }
  ],
  "mistakes": [],
  "scoring": {
    "baseScore": 500,
    "efficiencyBonus": 300,
    "speedBonus": 200,
    "collectibleBonus": 100,
    "perfectBonus": 100,
    "totalScore": 1200
  },
  "rewards": {
    "xpEarned": 100,
    "xpBonus": 100,
    "totalXP": 200,
    "pointsEarned": 1200,
    "achievementsUnlocked": ["first_steps"],
    "levelUpAchieved": false,
    "isPersonalBest": true
  },
  "analytics": {
    "playStyle": "optimized",
    "restartCount": 0,
    "hintUsed": false,
    "hintsUsedCount": 0,
    "autoSolveUsed": false,
    "strategicPauses": 2
  }
}
```

**Failed session (collision):**
```json
{
  "timing": {
    "endedAt": "2026-09-01T15:02:00.000Z",
    "durationSeconds": 120
  },
  "performance": {
    "status": "failed",
    "goalReached": false,
    "movesExecuted": 5,
    "optimalMoves": 8,
    "efficiency": 0,
    "attemptCount": 2
  },
  "mistakes": [
    {
      "moveNumber": 3,
      "command": "FORWARD",
      "result": "collision",
      "collisionWith": "wall-1",
      "attempted": true,
      "consequences": "robot_stopped"
    }
  ],
  "scoring": {
    "baseScore": 0,
    "efficiencyBonus": 0,
    "speedBonus": 0,
    "collectibleBonus": 0,
    "perfectBonus": 0,
    "totalScore": 0
  },
  "rewards": {
    "xpEarned": 10,
    "xpBonus": 0,
    "totalXP": 10,
    "pointsEarned": 0,
    "achievementsUnlocked": [],
    "levelUpAchieved": false,
    "isPersonalBest": false
  }
}
```

---

### GET — All sessions for user
```http
GET /api/robot-brainiac/sessions/user/60d5ec49f1a2b830a8a1e001
```

### GET — Filter by status
```http
GET /api/robot-brainiac/sessions/user/60d5ec49f1a2b830a8a1e001?status=completed
GET /api/robot-brainiac/sessions/user/60d5ec49f1a2b830a8a1e001?status=failed
```

### GET — Filter by level
```http
GET /api/robot-brainiac/sessions/user/60d5ec49f1a2b830a8a1e001?levelId=LEVEL_ID_HERE
```

### GET — Best session (highest efficiency + score)
```http
GET /api/robot-brainiac/sessions/user/60d5ec49f1a2b830a8a1e001/best
```

### GET — Single session
```http
GET /api/robot-brainiac/sessions/PASTE_SESSION_ID_HERE
```

### DELETE — Delete session
```http
DELETE /api/robot-brainiac/sessions/PASTE_SESSION_ID_HERE
```

---

## 3. 🔄 Level Attempts

### POST — Single attempt
```http
POST /api/robot-brainiac/attempts
```
```json
{
  "userAccountId": "60d5ec49f1a2b830a8a1e001",
  "sessionId": "PASTE_SESSION_ID_HERE",
  "levelId": "PASTE_LEVEL_ID_HERE",
  "attemptNumber": 1,
  "commandSequence": ["FORWARD", "FORWARD", "TURN_RIGHT", "FORWARD"],
  "result": {
    "status": "failed",
    "goalReached": false,
    "movesUsed": 4,
    "collisionOccurred": true,
    "collisionWith": "wall-1"
  }
}
```

### POST — Bulk insert (all restarts from a session)
```http
POST /api/robot-brainiac/attempts/bulk
```
```json
{
  "attempts": [
    {
      "userAccountId": "60d5ec49f1a2b830a8a1e001",
      "sessionId": "PASTE_SESSION_ID_HERE",
      "levelId": "PASTE_LEVEL_ID_HERE",
      "attemptNumber": 1,
      "commandSequence": ["FORWARD", "FORWARD", "FORWARD"],
      "result": {
        "status": "failed",
        "goalReached": false,
        "movesUsed": 3,
        "collisionOccurred": true
      }
    },
    {
      "userAccountId": "60d5ec49f1a2b830a8a1e001",
      "sessionId": "PASTE_SESSION_ID_HERE",
      "levelId": "PASTE_LEVEL_ID_HERE",
      "attemptNumber": 2,
      "commandSequence": ["FORWARD","FORWARD","TURN_RIGHT","FORWARD","TURN_LEFT","FORWARD","FORWARD","FORWARD"],
      "result": {
        "status": "completed",
        "goalReached": true,
        "movesUsed": 8,
        "collisionOccurred": false,
        "efficiency": 100
      }
    }
  ]
}
```

### GET — All attempts for user
```http
GET /api/robot-brainiac/attempts/user/60d5ec49f1a2b830a8a1e001
```

### GET — Filter by level
```http
GET /api/robot-brainiac/attempts/user/60d5ec49f1a2b830a8a1e001?levelId=LEVEL_ID_HERE
```

### GET — Attempts in a session
```http
GET /api/robot-brainiac/attempts/session/PASTE_SESSION_ID_HERE
```

### GET — All attempts on a level (analytics/admin)
```http
GET /api/robot-brainiac/attempts/level/LEVEL_ID_HERE
```

### GET — Single attempt
```http
GET /api/robot-brainiac/attempts/ATTEMPT_ID_HERE
```

### DELETE — Delete attempt
```http
DELETE /api/robot-brainiac/attempts/ATTEMPT_ID_HERE
```

---

## ❗ Edge Cases

| Test | Request | Expected |
|---|---|---|
| Duplicate levelNumber | `POST /levels` same `levelNumber` | `409 Conflict` |
| Non-existent level | `GET /levels/000000000000000000000000` | `404 Not Found` |
| Non-existent session | `GET /sessions/000000000000000000000000` | `404 Not Found` |
| No best session | `GET /sessions/user/UNKNOWN_ID/best` | `404 Not Found` |
| Empty bulk attempts | `POST /attempts/bulk` `{ "attempts": [] }` | `400 Bad Request` |
| No next level found | `GET /levels/next` when no published levels | `404 Not Found` |
