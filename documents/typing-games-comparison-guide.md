# Typing Code Game vs Typing Math Game - Schema Comparison

## Executive Summary

Both games share the **same authentication and profile infrastructure** but have **different game-specific collections** based on their unique content types and mechanics.

```
Shared Components (Auth):
  ✅ users_account
  ✅ auth_sessions
  ✅ login_history
  ✅ user_profile
  ✅ user_achievements
  ✅ leaderboards

Game-Specific (Different):
  ❌ challenges (Code) vs math_problems (Math)
  ❌ Power-ups system vs Daily Challenges system
  ❌ Single language vs Bilingual
  ❌ Code complexity progression vs Math difficulty progression
```

---

## DETAILED COMPARISON

### 1. CONTENT STRUCTURE

#### Typing Code Game
```javascript
// challenges collection
{
  _id: ObjectId(...),
  title: "React Hooks Challenge",
  codeSnippet: "import React, { useState } from 'react';\n...",
  language: "javascript",
  category: "react",
  difficulty: "intermediate",
  tags: ["react", "hooks", "functional-components"],
  // Code is stored as full text
}
```

**Characteristics:**
- Full code snippets (usually 200-500 characters)
- Language-specific (JavaScript, Python, HTML, etc.)
- Single category per challenge
- Text-based content

#### Typing Math Game
```javascript
// math_problems collection
{
  _id: ObjectId(...),
  operation: "addition",
  category: "basic_operations",
  subcategory: "addition",
  difficulty: "beginner",
  problem: {
    operand1: 25,
    operand2: 47,
    operator: "+",
    displayText: "25 + 47 = ?"
  },
  answer: {
    correctAnswer: 72,
    acceptableFormats: [72, "72"],
    precision: 0
  },
  // Structured data - not text-based
}
```

**Characteristics:**
- Structured problem data (operands, operators)
- Mathematical operations (not languages)
- Multiple operations per category
- Numeric-focused content
- Bilingual translations included

---

### 2. GAME SESSIONS

#### Typing Code Game
```javascript
db.game_sessions.findOne({
  gameMode: "timed",
  performance: {
    totalTyped: 512,
    correctWords: 41,
    incorrectWords: 1,
    accuracy: 97.6,
    wpm: 128,
    mistakes: [
      {
        position: 45,
        characterTyped: "x",
        expectedCharacter: "c"
      }
    ]
  },
  powerUps: [
    { id: "time_slow", usedAt: ISODate(...) }
  ]
});
```

**Metrics:**
- Character-by-character tracking
- WPM based on typing speed
- Accuracy on code correctness
- Power-up usage during game

#### Typing Math Game
```javascript
db.game_sessions.findOne({
  gameMode: "timed_challenge",
  performance: {
    totalProblems: 40,
    solvedCorrectly: 38,
    solvedIncorrectly: 1,
    skipped: 1,
    accuracy: 97.5,
    wpm: 82,
    averageProblemTime: 2.8,
    longestCorrectStreak: 28
  },
  problemDetails: [
    {
      problemId: ObjectId(...),
      problem: "25 + 47 = ?",
      userAnswer: "72",
      correctAnswer: "72",
      isCorrect: true,
      timeToAnswer: 2.3
    }
  ]
});
```

**Metrics:**
- Problem-by-problem tracking
- WPM based on problem-solving speed
- Accuracy on mathematical correctness
- Average time per problem
- Longest streak of correct answers

---

### 3. STATISTICS TRACKING

#### Typing Code Game
```javascript
db.user_statistics.findOne({
  _id: ObjectId(...),
  wpm: {
    current: 128,
    average: 105,
    peak: 142,
    history: [ /* last 30 sessions */ ]
  },
  accuracy: {
    average: 96.5,
    bestStreak: 1250,
    currentStreak: 340
  },
  categoryStats: [
    {
      category: "javascript",
      gamesPlayed: 85,
      averageWPM: 115,
      averageAccuracy: 97.2
    },
    {
      category: "python",
      gamesPlayed: 62,
      averageWPM: 108,
      averageAccuracy: 95.1
    }
  ]
});
```

**Tracked By:**
- Programming language (JavaScript, Python, React, etc.)
- Code complexity (Beginner → Expert)
- Character accuracy

#### Typing Math Game
```javascript
db.user_statistics.findOne({
  _id: ObjectId(...),
  wpm: {
    current: 85,
    average: 72,
    peak: 95
  },
  accuracy: {
    average: 94.2,
    bestStreak: 280,
    currentStreak: 45,
    byOperation: {
      addition: { accuracy: 96.5, solved: 1200 },
      subtraction: { accuracy: 94.2, solved: 1100 },
      multiplication: { accuracy: 91.3, solved: 980 }
    }
  },
  problemStats: {
    totalSolved: 5000,
    averageSolveTime: 2.5,
    fastestSolveTime: 0.8
  },
  categoryStats: [
    {
      category: "basic_operations",
      subcategory: "addition",
      problemsSolved: 1200,
      averageAccuracy: 96.5,
      averageWPM: 85
    }
  ]
});
```

**Tracked By:**
- Mathematical operation (Addition, Subtraction, etc.)
- Difficulty level (Beginner → Expert)
- Problem-solving accuracy
- Time per problem

---

### 4. PROGRESSION SYSTEM

#### Typing Code Game
```
Level → XP → Achievements
  1     0      [No achievements yet]
  2     1000   Speed milestone (50 WPM)
  3     3000   Accuracy milestone (90%)
  ...
  25    45000  Python expert, React master
  50    125000 Code wizard, Speedrun champion

Progression Factors:
  • WPM improvement
  • Accuracy maintenance
  • Challenge variety
  • Category mastery
```

#### Typing Math Game
```
Level → XP → Daily Challenges → Achievements
  1     0      Not eligible       [Beginner level]
  2     1000   Easy challenge    Speed demon (90 WPM)
  5     5000   Intermediate      Math wizard (90% acc on 50 games)
  10    15000  Hard challenge    Daily grinder (7-day streak)
  15    32000  Expert challenge  Calculation master
  20    50000  Master level      Math prodigy

Progression Factors:
  • WPM improvement on numbers
  • Accuracy on math
  • Daily challenge completion
  • Operation-specific mastery
  • Play streaks
```

---

### 5. SPECIAL SYSTEMS

#### Typing Code Game: Power-ups System
```javascript
// inventory_items
{
  type: "power_up",
  name: "Time Slow",
  effect: {
    type: "time_manipulation",
    durationSeconds: 10,
    timeMultiplier: 0.7
  },
  cost: { points: 500, xp: 0, premium: 2.99 },
  stackable: true,
  maxStackCount: 99
}

// Usage
POST /games/123/use-powerup/time_slow
→ Slows down typing speed temporarily
→ Increases WPM potential during effect
```

**Power-up Types:**
- Time manipulation (slow time)
- Protection (second chance, shield)
- Boost (accuracy increase, speed increase)
- Visual enhancements

#### Typing Math Game: Daily Challenge System
```javascript
// daily_challenges
{
  date: ISODate("2024-01-20T00:00:00Z"),
  title: "Addition Master - Day 20",
  challengeConfig: {
    operations: ["addition"],
    difficulty: "intermediate",
    problemCount: 50,
    durationSeconds: 180
  },
  problems: [ /* 50 problem IDs */ ],
  rewards: {
    xpForCompletion: 200,
    pointsForCompletion: 500,
    xpForFirstPlace: 500,
    specialReward: "bonus_multiplier_2x"
  },
  topScores: [
    { rank: 1, displayName: "Pro Solver", score: 9800 }
  ]
}

// Mechanics
→ Only 1 attempt per calendar day
→ Global ranking against all players
→ Resets at 00:00 UTC
→ Special rewards for placement
```

**Daily Challenge Features:**
- Time-limited (1 attempt per day)
- Themed operation focus
- Global competition
- Leaderboard ranking
- Bonus rewards for top performers

---

### 6. LANGUAGE SUPPORT

#### Typing Code Game
```javascript
// Single language
db.user_profile.updateOne(
  { userAccountId },
  { $set: { "preferences.language": "en" } }
);

// Code displays same in all regions
challenges → displayText = "def add(a, b): return a + b"
```

**Supported Languages:**
- English only (currently)

#### Typing Math Game
```javascript
// Bilingual support
db.user_profile.updateOne(
  { userAccountId },
  { $set: { "preferences.language": "km" } } // Khmer
);

// Math problems translated
db.math_problems.findOne({
  translations: {
    en: { displayText: "25 + 47 = ?", description: "Add two numbers" },
    km: { displayText: "25 + 47 = ?", description: "បូក លេខ" }
  }
});

// UI translated
{
  button: {
    en: "Submit",
    km: "ដាក់ស្នើ"
  }
}
```

**Supported Languages:**
- English (en)
- Khmer (km) - ភាសាខ្មែរ

**Scope of Bilingual:**
- Math problem translations
- UI labels
- Instructions
- Achievement names
- Leaderboard UI

---

### 7. PLATFORM SUPPORT

#### Typing Code Game
```
┌─────────────────┐
│   Web (React)   │  Chrome, Firefox, Safari
├─────────────────┤
│  Browser-based  │  Hosted on Vercel
└─────────────────┘
```

#### Typing Math Game
```
┌──────────────────────────┐
│  Web (React)             │  Same as Typing Code
├──────────────────────────┤
│  Desktop (Electron)      │  Windows, macOS, Linux
├──────────────────────────┤
│  Mobile Responsive       │  iOS Safari, Android Chrome
└──────────────────────────┘
```

**Multi-Platform Implications:**
- Desktop can work offline
- Desktop has local storage
- Web requires internet
- Sync data across platforms
- Different performance profiles

---

### 8. COLLECTION COMPARISON TABLE

| Collection | Typing Code | Typing Math | Type |
|-----------|------------|-------------|------|
| users_account | ✅ | ✅ | **SHARED** |
| user_profile | ✅ | ✅ | **SHARED** |
| user_statistics | ✅ | ✅ | **SHARED** (different schema) |
| auth_sessions | ✅ | ✅ | **SHARED** |
| login_history | ✅ | ✅ | **SHARED** |
| leaderboards | ✅ | ✅ | **SHARED** |
| achievements | ✅ | ✅ | **SHARED** (different achievements) |
| game_modes | ✅ | ✅ | **SHARED** (different modes) |
| game_sessions | ✅ | ✅ | **SHARED** (different schema) |
| challenges | ✅ | ❌ | **CODE GAME ONLY** |
| math_problems | ❌ | ✅ | **MATH GAME ONLY** |
| power_ups | ✅ | ❌ | **CODE GAME ONLY** |
| daily_challenges | ❌ | ✅ | **MATH GAME ONLY** |
| problem_attempts | ❌ | ✅ | **MATH GAME ONLY** |
| user_performance_history | ❌ | ✅ | **MATH GAME ONLY** |
| categories | ✅ | ✅ | **SHARED** (different schema) |

---

## SHARED DATABASE ARCHITECTURE

### Single Database with Namespacing

```javascript
// Database: typing_games

// Auth Collections (Shared)
├── users_account         // All users
├── auth_sessions         // All sessions
└── login_history         // Audit trail

// Profile Collections (Shared)
├── user_profile          // All users' profiles
├── user_statistics       // All users' stats (flexible schema)
└── user_achievements     // All achievements (game-agnostic)

// Leaderboards (Shared with game prefix)
├── leaderboards_game_code
└── leaderboards_game_math

// Code Game Collections
├── challenges            // Code snippets
├── game_sessions_code
├── power_ups
└── inventory_items

// Math Game Collections
├── math_problems         // Problem bank
├── game_sessions_math
├── daily_challenges
├── problem_attempts
└── user_performance_history

// Shared Content
├── game_modes_code       // Or unified: game_modes with gameType field
├── game_modes_math
├── categories_code
└── categories_math
```

### Alternative: Multi-Database Approach

```javascript
// Database 1: shared_auth
├── users_account
├── auth_sessions
└── login_history

// Database 2: typing_code_game
├── challenges
├── game_sessions
├── power_ups
├── leaderboards
└── user_achievements

// Database 3: typing_math_game
├── math_problems
├── game_sessions
├── daily_challenges
├── leaderboards
└── user_achievements
```

**Recommendation:** Use **single database with namespacing** for easier transactions and shared user data.

---

## MIGRATION PATH: ONE DATABASE TO MULTI-GAME PLATFORM

### Phase 1: Shared Auth (Current State)
```
typing_games/
  ├── users_account     ✅
  ├── auth_sessions     ✅
  └── login_history     ✅
```

### Phase 2: Add Profile Layer
```
typing_games/
  ├── users_account     ✅
  ├── user_profile      ✅ (Add displayName, preferences)
  ├── user_statistics   ✅ (Flexible schema for both games)
  ├── auth_sessions     ✅
  └── login_history     ✅
```

### Phase 3: Add First Game (Code)
```
typing_games/
  ├── [Shared above]
  ├── challenges                    ✅
  ├── game_sessions_code           ✅
  ├── game_modes                    ✅
  ├── power_ups                     ✅
  └── leaderboards_code            ✅
```

### Phase 4: Add Second Game (Math)
```
typing_games/
  ├── [Shared above]
  ├── [Code Game collections]
  ├── math_problems                ✅
  ├── game_sessions_math           ✅
  ├── daily_challenges             ✅
  ├── problem_attempts             ✅
  ├── user_performance_history     ✅
  └── leaderboards_math            ✅
```

### Phase 5: Cross-Game Features (Future)
```
typing_games/
  ├── [All above]
  ├── user_badges                  (Unified achievements)
  ├── user_inventory               (Shared cosmetics across games)
  └── cross_game_challenges        (Play both games in one session)
```

---

## KEY DIFFERENCES IN SCHEMA DESIGN

| Aspect | Typing Code | Typing Math |
|--------|------------|-------------|
| **Problem Storage** | Text (code snippet) | Structured (operands + operator) |
| **Bilingual** | Not required | Required (EN + Khmer) |
| **Special System** | Power-ups (in-game boost) | Daily Challenges (time-gated) |
| **Accuracy Metric** | Character-level | Problem-level (all or nothing) |
| **Time Tracking** | Total typing time | Per-problem time |
| **Progression** | Language mastery | Operation mastery |
| **Desktop Support** | Web only | Web + Electron |
| **Categories** | Languages | Math operations |

---

## QUERYING EXAMPLES FOR BOTH GAMES

### Get All User Data (Works for Both)
```javascript
// Same query structure for both games
const userData = await Promise.all([
  db.users_account.findOne({ _id: userAccountId }),
  db.user_profile.findOne({ userAccountId }),
  db.user_statistics.findOne({ userAccountId }),
  db.user_achievements.find({ userAccountId }).toArray(),
  // Game-specific:
  // db.game_sessions_code.find({ userAccountId }) OR
  // db.game_sessions_math.find({ userAccountId })
]);
```

### Get Leaderboard (Game-Specific Query)
```javascript
// Typing Code
db.leaderboards_code.find({
  boardType: "global",
  period: "all_time"
}).sort({ rank: 1 }).limit(100);

// Typing Math
db.leaderboards_math.find({
  boardType: "global",
  period: "all_time"
}).sort({ rank: 1 }).limit(100);
```

### Get User Stats by Game
```javascript
// Typing Code - By Category (Language)
db.user_statistics.findOne({ userAccountId })
  .then(stats => stats.categoryStats.filter(c => c.category === "javascript"));

// Typing Math - By Category (Operation)
db.user_statistics.findOne({ userAccountId })
  .then(stats => stats.categoryStats.filter(c => c.operation === "addition"));
```

---

## IMPLEMENTATION NOTES

### For Your KOOMPI Game Platform

1. **Use single `typing_games` database** with game type namespacing
2. **Share user authentication** across both games
3. **Keep game-specific collections separate** (challenges vs math_problems)
4. **Unify user_statistics** with flexible schema using `operation` or `category` fields
5. **Support bilingual** in user_profile preferences
6. **Plan for multi-platform** - consider Electron support for code game too

### Database Strategy
```javascript
// User logs in once, accesses both games
POST /auth/login → users_account
GET /user/profile → user_profile (works for both games)
GET /user/stats → user_statistics (flexible by gameType)

// Game selection
POST /games/code/session → game_sessions_code
POST /games/math/session → game_sessions_math

// Both contribute to unified leaderboards
GET /leaderboards/global → combines both games
GET /leaderboards/code → code game only
GET /leaderboards/math → math game only
```

---

## SUMMARY

| Aspect | Status |
|--------|--------|
| **Shared Auth** | ✅ Same `users_account` collection |
| **Shared Profile** | ✅ Same `user_profile` with language support |
| **Game-Specific Content** | ✅ Different `challenges` vs `math_problems` |
| **Game Sessions** | ✅ Separate collections (game_sessions_code, game_sessions_math) |
| **Statistics** | ✅ Unified with flexible `categoryStats` or `byOperation` |
| **Leaderboards** | ✅ Separate by game type |
| **Achievements** | ✅ Game-specific achievements in unified collection |
| **Platforms** | ✅ Web (both) + Desktop (math game) |
| **Languages** | ✅ English (code) + English + Khmer (math) |

