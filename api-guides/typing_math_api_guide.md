# ➕ Typing Math — API Testing Guide

> Base URL: `http://localhost:5050/api/typing-math`
> All requests: `Content-Type: application/json`

---

## 🗂️ Test User ID
```
userAccountId / userId: 60d5ec49f1a2b830a8a1e001
```

---

## 📋 Quick Flow
```
1. POST /problems                → create math problems, get problemId(s)
2. POST /sessions                → start session
3. POST /attempts/bulk           → log all problem answers
4. PATCH /sessions/:id           → end session with results
5. PATCH /problems/:id/stats     → update attempt stats per problem
6. GET  /daily-challenges/today  → check today's daily challenge
7. PATCH /daily-challenges/:id/top-scores → post a score to leaderboard
```

---

## 1. 🔢 Math Problems

### GET — List all problems
```http
GET /api/typing-math/problems
```

### GET — Filter by operation
```http
GET /api/typing-math/problems?operation=addition
GET /api/typing-math/problems?operation=subtraction
GET /api/typing-math/problems?operation=multiplication
GET /api/typing-math/problems?operation=division
GET /api/typing-math/problems?operation=algebra
```

### GET — Filter by difficulty
```http
GET /api/typing-math/problems?difficulty=easy
GET /api/typing-math/problems?difficulty=medium
GET /api/typing-math/problems?difficulty=hard
```

### GET — Filter active only
```http
GET /api/typing-math/problems?isActive=true
```

### GET — Paginated
```http
GET /api/typing-math/problems?page=1&limit=10
```

### GET — Single problem
```http
GET /api/typing-math/problems/PROBLEM_ID_HERE
```

---

### POST — Create math problems

**Addition (easy)**
```http
POST /api/typing-math/problems
```
```json
{
  "problemId": "add-001",
  "question": "What is 47 + 38?",
  "answer": "85",
  "operation": "addition",
  "difficulty": "easy",
  "category": "arithmetic",
  "hints": ["Try breaking it into 47 + 30 = 77, then 77 + 8"],
  "explanation": "47 + 38 = (40 + 30) + (7 + 8) = 70 + 15 = 85",
  "difficultyAdjustments": {
    "recommendedForLevel": 1,
    "timeLimitSeconds": 15
  },
  "status": { "isActive": true }
}
```

**Multiplication (medium)**
```json
{
  "problemId": "mul-001",
  "question": "What is 13 × 14?",
  "answer": "182",
  "operation": "multiplication",
  "difficulty": "medium",
  "category": "arithmetic",
  "hints": ["Try 13 × 10 = 130, then 13 × 4 = 52"],
  "explanation": "13 × 14 = 13 × 10 + 13 × 4 = 130 + 52 = 182",
  "difficultyAdjustments": {
    "recommendedForLevel": 3,
    "timeLimitSeconds": 20
  },
  "status": { "isActive": true }
}
```

**Algebra (hard)**
```json
{
  "problemId": "alg-001",
  "question": "Solve for x: 3x + 7 = 22",
  "answer": "5",
  "operation": "algebra",
  "difficulty": "hard",
  "category": "algebra",
  "hints": ["Subtract 7 from both sides first", "Then divide by 3"],
  "explanation": "3x + 7 = 22 → 3x = 15 → x = 5",
  "difficultyAdjustments": {
    "recommendedForLevel": 5,
    "timeLimitSeconds": 30
  },
  "status": { "isActive": true }
}
```

**Division (medium)**
```json
{
  "problemId": "div-001",
  "question": "What is 144 ÷ 12?",
  "answer": "12",
  "operation": "division",
  "difficulty": "medium",
  "category": "arithmetic",
  "hints": ["Think: 12 × ? = 144"],
  "explanation": "144 ÷ 12 = 12 because 12 × 12 = 144",
  "difficultyAdjustments": {
    "recommendedForLevel": 3,
    "timeLimitSeconds": 18
  },
  "status": { "isActive": true }
}
```

### PATCH — Update a problem
```http
PATCH /api/typing-math/problems/PROBLEM_ID_HERE
```
```json
{
  "difficultyAdjustments": {
    "timeLimitSeconds": 12
  },
  "status": { "isFeatured": true }
}
```

### PATCH — Increment problem stats (call after each attempt)
```http
PATCH /api/typing-math/problems/PROBLEM_ID_HERE/stats
```
```json
{
  "stats.timesAttempted": 1,
  "stats.timesCorrect": 1
}
```

For a wrong answer:
```json
{
  "stats.timesAttempted": 1,
  "stats.timesCorrect": 0,
  "stats.timesIncorrect": 1
}
```

### DELETE — Delete a problem
```http
DELETE /api/typing-math/problems/PROBLEM_ID_HERE
```

---

## 2. 🎮 Game Sessions

### POST — Start a math session
```http
POST /api/typing-math/sessions
```
```json
{
  "userId": "60d5ec49f1a2b830a8a1e001",
  "mode": "normal",
  "difficulty": "medium",
  "category": "arithmetic",
  "problemIds": [
    "PROBLEM_ID_1",
    "PROBLEM_ID_2",
    "PROBLEM_ID_3"
  ],
  "timing": {
    "startedAt": "2026-09-01T15:00:00.000Z"
  }
}
```
> 📋 Copy `data._id` → use as session ID in next steps.

---

### PATCH — End session (set results)
```http
PATCH /api/typing-math/sessions/PASTE_SESSION_ID_HERE
```

**Good performance:**
```json
{
  "timing": {
    "endedAt": "2026-09-01T15:03:30.000Z",
    "durationSeconds": 210
  },
  "performance": {
    "totalProblems": 10,
    "correctAnswers": 8,
    "incorrectAnswers": 2,
    "skippedProblems": 0,
    "accuracy": 80.0,
    "averageSolveTimeMs": 4200,
    "fastestSolveTimeMs": 2100,
    "slowestSolveTimeMs": 8900,
    "wpm": 32
  },
  "results": {
    "status": "completed",
    "passed": true,
    "score": 8200,
    "xpEarned": 95,
    "streakBonus": 15
  }
}
```

**Perfect score:**
```json
{
  "timing": {
    "endedAt": "2026-09-01T15:02:00.000Z",
    "durationSeconds": 120
  },
  "performance": {
    "totalProblems": 10,
    "correctAnswers": 10,
    "incorrectAnswers": 0,
    "skippedProblems": 0,
    "accuracy": 100.0,
    "averageSolveTimeMs": 3100,
    "fastestSolveTimeMs": 1800,
    "slowestSolveTimeMs": 5200,
    "wpm": 41
  },
  "results": {
    "status": "completed",
    "passed": true,
    "score": 12500,
    "xpEarned": 150,
    "streakBonus": 50
  }
}
```

---

### GET — All sessions for user
```http
GET /api/typing-math/sessions/user/60d5ec49f1a2b830a8a1e001
```

### GET — Filter by status
```http
GET /api/typing-math/sessions/user/60d5ec49f1a2b830a8a1e001?status=completed
```

### GET — Best session (highest score)
```http
GET /api/typing-math/sessions/user/60d5ec49f1a2b830a8a1e001/best
```

### GET — Single session
```http
GET /api/typing-math/sessions/PASTE_SESSION_ID_HERE
```

### DELETE — Delete session
```http
DELETE /api/typing-math/sessions/PASTE_SESSION_ID_HERE
```

---

## 3. 📝 Problem Attempts

### POST — Single attempt (real-time)
```http
POST /api/typing-math/attempts
```
```json
{
  "userId": "60d5ec49f1a2b830a8a1e001",
  "sessionId": "PASTE_SESSION_ID_HERE",
  "problemId": "PASTE_PROBLEM_ID_HERE",
  "userAnswer": "85",
  "isCorrect": true,
  "solveTimeMs": 3200,
  "hintsUsed": 0,
  "attemptNumber": 1
}
```

---

### POST — Bulk insert (at session end — recommended)
```http
POST /api/typing-math/attempts/bulk
```
```json
{
  "attempts": [
    {
      "userId": "60d5ec49f1a2b830a8a1e001",
      "sessionId": "PASTE_SESSION_ID_HERE",
      "problemId": "PROBLEM_ID_1",
      "userAnswer": "85",
      "isCorrect": true,
      "solveTimeMs": 3100,
      "hintsUsed": 0,
      "attemptNumber": 1
    },
    {
      "userId": "60d5ec49f1a2b830a8a1e001",
      "sessionId": "PASTE_SESSION_ID_HERE",
      "problemId": "PROBLEM_ID_2",
      "userAnswer": "180",
      "isCorrect": false,
      "solveTimeMs": 8900,
      "hintsUsed": 1,
      "attemptNumber": 1
    },
    {
      "userId": "60d5ec49f1a2b830a8a1e001",
      "sessionId": "PASTE_SESSION_ID_HERE",
      "problemId": "PROBLEM_ID_3",
      "userAnswer": "5",
      "isCorrect": true,
      "solveTimeMs": 5400,
      "hintsUsed": 1,
      "attemptNumber": 2
    }
  ]
}
```

### GET — All attempts for user
```http
GET /api/typing-math/attempts/user/60d5ec49f1a2b830a8a1e001
```

### GET — All attempts in a session
```http
GET /api/typing-math/attempts/session/PASTE_SESSION_ID_HERE
```

### GET — Single attempt
```http
GET /api/typing-math/attempts/ATTEMPT_ID_HERE
```

### DELETE — Delete attempt
```http
DELETE /api/typing-math/attempts/ATTEMPT_ID_HERE
```

---

## 4. 📅 Daily Challenges

### GET — Today's active challenge
```http
GET /api/typing-math/daily-challenges/today
```

### GET — All daily challenges
```http
GET /api/typing-math/daily-challenges
```

### GET — Single daily challenge
```http
GET /api/typing-math/daily-challenges/DAILY_CHALLENGE_ID_HERE
```

---

### POST — Create a daily challenge
```http
POST /api/typing-math/daily-challenges
```
```json
{
  "date": "2026-09-01",
  "title": "Speed Round Monday",
  "description": "10 mixed arithmetic problems — how fast can you go?",
  "difficulty": "medium",
  "problemIds": [
    "PROBLEM_ID_1",
    "PROBLEM_ID_2",
    "PROBLEM_ID_3"
  ],
  "timeLimit": 180,
  "bonusXP": 50,
  "isActive": true
}
```

### PATCH — Update a daily challenge
```http
PATCH /api/typing-math/daily-challenges/DAILY_CHALLENGE_ID_HERE
```
```json
{
  "bonusXP": 75,
  "isActive": true
}
```

### PATCH — Submit a top score to the daily challenge board
```http
PATCH /api/typing-math/daily-challenges/DAILY_CHALLENGE_ID_HERE/top-scores
```
```json
{
  "userId": "60d5ec49f1a2b830a8a1e001",
  "username": "speedtyper99",
  "score": 9800,
  "accuracy": 95.0,
  "solveTimeMs": 142000,
  "submittedAt": "2026-09-01T15:30:00.000Z"
}
```

---

## ❗ Edge Cases

| Test | Request | Expected |
|---|---|---|
| Missing `problemId` on create | `POST /problems` with no `problemId` | `400 Bad Request` |
| Duplicate `problemId` | `POST /problems` same `problemId` twice | `409 Conflict` |
| Non-existent problem | `GET /problems/000000000000000000000000` | `404 Not Found` |
| Non-existent session | `GET /sessions/000000000000000000000000` | `404 Not Found` |
| No best session found | `GET /sessions/user/UNKNOWN_ID/best` | `404 Not Found` |
