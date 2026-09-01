# ⌨️ Typing Code — API Testing Guide

> Base URL: `http://localhost:5050/api/typing-code`
> All requests: `Content-Type: application/json`

---

## 🗂️ Test User ID
```
userAccountId / userId: 60d5ec49f1a2b830a8a1e001
```
> Replace with a real `UserAccount._id` from your DB for full integration.

---

## 📋 Quick Flow
```
1. POST /challenges              → create a challenge, get challengeId
2. POST /sessions                → start session using challengeId
3. PATCH /sessions/:id           → end session with results
4. PATCH /challenges/:id/stats   → increment challenge play count
5. GET  /sessions/user/:userId/best → verify best WPM recorded
6. GET  /inventory/:userId       → check inventory
```

---

## 1. 💻 Challenges

### GET — List all challenges
```http
GET /api/typing-code/challenges
```

### GET — Filter by language
```http
GET /api/typing-code/challenges?language=javascript
GET /api/typing-code/challenges?language=python
GET /api/typing-code/challenges?language=typescript
```

### GET — Filter by difficulty
```http
GET /api/typing-code/challenges?difficulty=beginner
GET /api/typing-code/challenges?difficulty=intermediate
GET /api/typing-code/challenges?difficulty=advanced
```

### GET — Filter published only
```http
GET /api/typing-code/challenges?isPublished=true
```

### GET — Paginated
```http
GET /api/typing-code/challenges?page=1&limit=10
```

### GET — Single challenge
```http
GET /api/typing-code/challenges/CHALLENGE_ID_HERE
```

---

### POST — Create challenge (JavaScript, beginner)
```http
POST /api/typing-code/challenges
```
```json
{
  "title": "Hello World Function",
  "language": "javascript",
  "difficulty": "beginner",
  "category": "functions",
  "description": "A classic hello world function to warm up your fingers.",
  "codeSnippet": "function helloWorld() {\n  return 'Hello, World!';\n}\n\nconsole.log(helloWorld());",
  "tags": ["beginner", "functions", "output"],
  "timeLimit": 120,
  "targetWPM": 40,
  "status": {
    "isPublished": true,
    "isFeatured": false
  }
}
```

### POST — Create challenge (Python, intermediate)
```json
{
  "title": "List Comprehension Filter",
  "language": "python",
  "difficulty": "intermediate",
  "category": "data_structures",
  "description": "Filter even numbers using list comprehension.",
  "codeSnippet": "numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]\neven_numbers = [n for n in numbers if n % 2 == 0]\nprint(even_numbers)",
  "tags": ["lists", "comprehension", "filter"],
  "timeLimit": 90,
  "targetWPM": 50,
  "status": {
    "isPublished": true,
    "isFeatured": true
  }
}
```

### POST — Create challenge (TypeScript, advanced)
```json
{
  "title": "Generic Type Constraint",
  "language": "typescript",
  "difficulty": "advanced",
  "category": "generics",
  "description": "Write a generic function with type constraints.",
  "codeSnippet": "function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {\n  return obj[key];\n}\n\nconst person = { name: 'Alice', age: 25 };\nconsole.log(getProperty(person, 'name'));",
  "tags": ["generics", "types", "advanced"],
  "timeLimit": 180,
  "targetWPM": 60,
  "status": {
    "isPublished": true,
    "isFeatured": false
  }
}
```

### PATCH — Update a challenge
```http
PATCH /api/typing-code/challenges/CHALLENGE_ID_HERE
```
```json
{
  "targetWPM": 45,
  "timeLimit": 100,
  "status": {
    "isFeatured": true
  }
}
```

### PATCH — Increment play stats (call after each session)
```http
PATCH /api/typing-code/challenges/CHALLENGE_ID_HERE/stats
```
```json
{
  "stats.timesPlayed": 1,
  "stats.timesCompleted": 1
}
```

### DELETE — Delete a challenge
```http
DELETE /api/typing-code/challenges/CHALLENGE_ID_HERE
```

---

## 2. 🎮 Game Sessions

### POST — Start a session
```http
POST /api/typing-code/sessions
```
```json
{
  "userId": "60d5ec49f1a2b830a8a1e001",
  "challengeId": "PASTE_CHALLENGE_ID_HERE",
  "category": "functions",
  "mode": "normal",
  "timing": {
    "startedAt": "2026-09-01T15:00:00.000Z"
  }
}
```
> 📋 Copy `data._id` → use as session ID in next steps.

---

### PATCH — End session (set results)
```http
PATCH /api/typing-code/sessions/PASTE_SESSION_ID_HERE
```

**Completed session (high WPM):**
```json
{
  "timing": {
    "startedAt": "2026-09-01T15:00:00.000Z",
    "endedAt":   "2026-09-01T15:01:45.000Z",
    "durationSeconds": 105
  },
  "performance": {
    "wpm": 68,
    "rawWPM": 72,
    "accuracy": 94.4,
    "correctChars": 185,
    "incorrectChars": 11,
    "totalChars": 196,
    "backspaceCount": 8
  },
  "results": {
    "status": "completed",
    "passed": true,
    "score": 6800,
    "xpEarned": 120,
    "streakBonus": 20
  }
}
```

**Failed session (ran out of time):**
```json
{
  "timing": {
    "startedAt": "2026-09-01T15:00:00.000Z",
    "endedAt":   "2026-09-01T15:02:00.000Z",
    "durationSeconds": 120
  },
  "performance": {
    "wpm": 28,
    "rawWPM": 31,
    "accuracy": 82.5,
    "correctChars": 90,
    "incorrectChars": 19,
    "totalChars": 109,
    "backspaceCount": 15
  },
  "results": {
    "status": "failed",
    "passed": false,
    "score": 1200,
    "xpEarned": 10,
    "streakBonus": 0
  }
}
```

---

### GET — All sessions for a user
```http
GET /api/typing-code/sessions/user/60d5ec49f1a2b830a8a1e001
```

### GET — Filter by status
```http
GET /api/typing-code/sessions/user/60d5ec49f1a2b830a8a1e001?status=completed
GET /api/typing-code/sessions/user/60d5ec49f1a2b830a8a1e001?status=failed
```

### GET — Filter by category
```http
GET /api/typing-code/sessions/user/60d5ec49f1a2b830a8a1e001?category=functions
```

### GET — Paginated history
```http
GET /api/typing-code/sessions/user/60d5ec49f1a2b830a8a1e001?page=1&limit=5
```

### GET — Best session (highest WPM)
```http
GET /api/typing-code/sessions/user/60d5ec49f1a2b830a8a1e001/best
```

### GET — Single session
```http
GET /api/typing-code/sessions/PASTE_SESSION_ID_HERE
```

### DELETE — Delete session
```http
DELETE /api/typing-code/sessions/PASTE_SESSION_ID_HERE
```

---

## 3. 🎒 Inventory

### GET — List all item definitions (admin)
```http
GET /api/typing-code/inventory/items
```

### POST — Create an item definition (admin)
```http
POST /api/typing-code/inventory/items
```
```json
{
  "itemId": "code_boost_x2",
  "name": "Code Boost x2",
  "description": "Doubles XP earned for the next session",
  "type": "boost",
  "rarity": "rare",
  "effect": {
    "xpMultiplier": 2.0,
    "durationSessions": 1
  },
  "price": 500
}
```

### POST — Create user inventory
```http
POST /api/typing-code/inventory
```
```json
{
  "userId": "60d5ec49f1a2b830a8a1e001",
  "items": [],
  "currency": {
    "coins": 100,
    "gems": 5
  }
}
```

### GET — Get user inventory
```http
GET /api/typing-code/inventory/60d5ec49f1a2b830a8a1e001
```

### PATCH — Update inventory (set coins/gems)
```http
PATCH /api/typing-code/inventory/60d5ec49f1a2b830a8a1e001
```
```json
{
  "currency.coins": 350,
  "currency.gems": 8
}
```

### PATCH — Add item to inventory
```http
PATCH /api/typing-code/inventory/60d5ec49f1a2b830a8a1e001/add-item
```
```json
{
  "itemId": "ITEM_DEFINITION_ID_HERE",
  "quantity": 1,
  "acquiredAt": "2026-09-01T15:00:00.000Z",
  "source": "purchase"
}
```

---

## ❗ Edge Cases

| Test | Request | Expected |
|---|---|---|
| Missing userId on create | `POST /sessions` with no `userId` | `400 Bad Request` |
| Non-existent challenge | `GET /challenges/000000000000000000000000` | `404 Not Found` |
| Non-existent session | `GET /sessions/000000000000000000000000` | `404 Not Found` |
| Best session, no data | `GET /sessions/user/UNKNOWN_ID/best` | `404 Not Found` |
