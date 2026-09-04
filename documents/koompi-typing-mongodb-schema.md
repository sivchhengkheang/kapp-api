# KOOMPI Typing — MongoDB Schema (Draft)

> ⚠️ **Source limitation**: `koompi-typing.vercel.app` is a client-rendered SPA. Automated fetch/search only exposed page metadata:
> - Title: "KOOMPI TYPING - Master Khmer & English Typing"
> - Description: "Master Khmer and English typing through gamified adventures. Build your streak and level up with KOOMPI TYPING!"
> - Theme color: `#3b82f6`
>
> No live level data, lesson content, or session model was retrievable. This schema is inferred from that metadata (bilingual Khmer/English, "gamified adventures," streaks, leveling — a Duolingo-style structure) plus your platform's existing conventions (`users_account`, XP, achievements). **Validate against the real app** before implementing.

---

## 1. What This Game Appears to Be

Unlike "Typing Code" (code snippets) or "Typing Math" (math problems) in your four/five-game doc, KOOMPI Typing reads as the **foundational typing-skills trainer**: letter/word/sentence drills in both Khmer and English, wrapped in a gamified "adventure" progression with daily streaks — closer to a language-learning app's lesson structure than a speed-typing arcade game.

Key inferred features from the metadata:
- **Bilingual content** (Khmer + English keyboard layouts)
- **"Gamified adventures"** → likely a unit/world map of sequential lessons
- **Streaks** → daily-engagement mechanic (Duolingo-style)
- **Leveling** → XP-based user level, separate from lesson/unit progression

---

## 2. Collection Overview

```
koompi_typing_game/
├── typing_units             (top-level "adventure" chapters/worlds)
├── typing_lessons           (individual lessons within a unit)
├── lesson_content_items     (the actual characters/words/sentences to type)
├── game_sessions_typing     (one per lesson attempt)
├── keystroke_events         (raw per-keystroke log within a session)
├── user_progress_typing     (per-user, per-lesson best result + unlock state)
├── user_streaks_typing      (daily streak tracking)
├── keyboard_heatmap_stats   (per-user, per-key accuracy/speed analytics)
├── game_modes_typing        (lesson / free-practice / timed test / daily challenge)
└── leaderboards_typing      (denormalized ranking snapshots)
```

Shared/cross-game collections referenced but owned elsewhere: `users_account`, `user_profile`, `user_statistics`, `user_achievements`.

---

## 3. Collection Schemas

### `typing_units`
Top-level "adventure" chapters (the world/story map).

```javascript
{
  _id: ObjectId,
  unitNumber: 1,
  language: "en",                    // "en" | "km" (Khmer)
  title: "Home Row Foundations",
  description: "Learn the home row keys: ASDF JKL;",
  theme: "forest_path",              // adventure map visual theme
  order: 1,
  unlockRequirement: {
    type: "none" | "previous_unit_complete",
    previousUnitId: null
  },
  lessonCount: 8
}
```

### `typing_lessons`
Individual lessons inside a unit.

```javascript
{
  _id: ObjectId,
  unitId: ObjectId,                  // ref → typing_units
  lessonNumber: 3,
  language: "en",
  lessonType: "letters",             // "letters" | "words" | "sentences" | "punctuation" | "numbers"
  title: "F and J keys",
  targetKeys: ["f", "j"],            // keys being drilled (null for word/sentence lessons)
  difficulty: 1,
  contentItemCount: 20,
  passThreshold: {
    minAccuracyPct: 90,
    minWpm: 10
  },
  xpReward: 30,
  order: 3
}
```

### `lesson_content_items`
The actual prompts (characters, words, or sentences) for a lesson — reusable content bank.

```javascript
{
  _id: ObjectId,
  lessonId: ObjectId,                // ref → typing_lessons
  itemType: "word",                  // "character" | "word" | "sentence"
  language: "km",
  text: "សួស្តី",                     // the Khmer/English text to type
  order: 5,
  audioUrl: null                     // optional pronunciation hint for kids
}
```

### `game_sessions_typing`
One document per lesson attempt (or free-practice/timed-test session).

```javascript
{
  _id: ObjectId,
  userAccountId: ObjectId,           // ref → users_account
  lessonId: ObjectId,                // ref → typing_lessons (null for free-practice mode)
  gameModeId: ObjectId,              // ref → game_modes_typing
  language: "en",

  startedAt: ISODate,
  endedAt: ISODate,
  durationMs: 42000,

  // Aggregated results (denormalized for fast reads)
  charactersTyped: 210,
  charactersCorrect: 198,
  charactersIncorrect: 12,
  accuracyPct: 94.3,
  wpm: 32,
  netWpm: 30,                        // WPM adjusted for errors
  backspaceCount: 14,

  passed: true,
  starsEarned: 2,                    // optional 1-3 star rating
  xpEarned: 28,

  streakDayContribution: true,       // whether this session counted toward the daily streak

  deviceInfo: {
    keyboardLayout: "khmer_niokey",  // or "qwerty_en"
    inputMethod: "physical_keyboard" // "physical_keyboard" | "on_screen"
  },

  createdAt: ISODate
}
```

### `keystroke_events`
Raw per-keystroke log within a session — powers accuracy heatmaps and mistake analysis.

```javascript
{
  _id: ObjectId,
  sessionId: ObjectId,               // ref → game_sessions_typing
  charIndex: 47,                     // position within the content item
  expectedChar: "ក",
  typedChar: "ខ",
  correct: false,
  keyCode: "KeyK",
  timeSinceLastKeyMs: 210,           // for WPM/rhythm calculation
  timestamp: ISODate
}
```
> High-volume collection — consider a TTL index (e.g. 90 days) or rollup into `keyboard_heatmap_stats` for long-term storage efficiency.

### `user_progress_typing`
Per-user, per-lesson best/latest result — powers the adventure map unlock state.

```javascript
{
  _id: ObjectId,
  userAccountId: ObjectId,
  lessonId: ObjectId,
  status: "completed",               // "locked" | "unlocked" | "completed"
  bestAccuracyPct: 97.0,
  bestWpm: 38,
  bestStars: 3,
  attemptsCount: 5,
  firstCompletedAt: ISODate,
  lastPlayedAt: ISODate
}
```
Unique index: `{ userAccountId: 1, lessonId: 1 }`

### `user_streaks_typing`
Daily streak tracking (core to the "Build your streak" hook).

```javascript
{
  _id: ObjectId,
  userAccountId: ObjectId,
  currentStreakDays: 12,
  longestStreakDays: 30,
  lastActivityDate: ISODate,         // date-only precision
  streakFreezesAvailable: 1,         // optional Duolingo-style streak-saver mechanic
  history: [
    { date: ISODate, sessionsPlayed: 2, xpEarned: 60 }
    // rolling window, or move to a separate time-series collection at scale
  ]
}
```
Unique index: `{ userAccountId: 1 }`

### `keyboard_heatmap_stats`
Per-user, per-key rollup — avoids querying raw `keystroke_events` for dashboards.

```javascript
{
  _id: ObjectId,
  userAccountId: ObjectId,
  language: "en",
  keyStats: {
    "a": { attempts: 320, correct: 310, avgTimeMs: 180 },
    "s": { attempts: 298, correct: 295, avgTimeMs: 165 }
    // ... one entry per key
  },
  updatedAt: ISODate
}
```

### `game_modes_typing`
```javascript
{
  _id: ObjectId,
  modeKey: "lesson",                 // "lesson" | "free_practice" | "timed_test" | "daily_challenge"
  name: "Lesson Mode",
  description: "Guided lesson with target keys",
  affectsLeaderboard: true
}
```

### `leaderboards_typing`
```javascript
{
  _id: ObjectId,
  boardType: "global",               // "global" | "by_language" | "weekly" | "friends"
  language: null,                    // set when boardType = "by_language"
  periodStart: ISODate,
  periodEnd: ISODate,
  rankings: [
    {
      userAccountId: ObjectId,
      displayName: "Sopheak",
      score: 91.2,                   // e.g. netWpm × accuracyPct weighting
      wpm: 34,
      accuracyPct: 96.1,
      rank: 1
    }
  ],
  computedAt: ISODate
}
```
Score formula suggestion (consistent with your platform pattern):
```
score = netWpm * (accuracyPct / 100)
```

---

## 4. Recommended Indexes

```javascript
db.typing_lessons.createIndex({ unitId: 1, lessonNumber: 1 }, { unique: true });
db.lesson_content_items.createIndex({ lessonId: 1, order: 1 });

db.game_sessions_typing.createIndex({ userAccountId: 1, lessonId: 1, createdAt: -1 });
db.game_sessions_typing.createIndex({ lessonId: 1, netWpm: -1 }); // per-lesson leaderboard

db.keystroke_events.createIndex({ sessionId: 1, charIndex: 1 });
db.keystroke_events.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90-day TTL, optional

db.user_progress_typing.createIndex({ userAccountId: 1, lessonId: 1 }, { unique: true });
db.user_progress_typing.createIndex({ userAccountId: 1, status: 1 });

db.user_streaks_typing.createIndex({ userAccountId: 1 }, { unique: true });
db.keyboard_heatmap_stats.createIndex({ userAccountId: 1, language: 1 }, { unique: true });

db.leaderboards_typing.createIndex({ boardType: 1, language: 1, periodStart: -1 });
```

---

## 5. Integration with Shared Collections

```javascript
// user_statistics.gameStats.koompi_typing (updated after each session)
{
  lessonsCompleted: 24,
  wpm: 34,                         // running best/average
  accuracyPct: 95.1,
  currentStreakDays: 12,
  totalSessionsPlayed: 60,
  languagesPracticed: ["en", "km"],
  lastPlayedAt: ISODate
}

// user_achievements (unified badge system) — KOOMPI Typing entries reference
{
  userAccountId: ObjectId,
  achievementKey: "typing_streak_30",      // "typing_bilingual_master", "typing_speed_40wpm", etc.
  earnedAt: ISODate,
  sourceGame: "koompi_typing"
}
```

---

## 6. Write Path (typical session flow)

```
1. Client requests lesson  → read typing_lessons + lesson_content_items + user_progress_typing (unlock check)
2. Client streams keystrokes → insert keystroke_events (or buffer client-side, batch insert on session end)
3. Session ends            → insert game_sessions_typing (aggregated result)
4. Post-session hooks:
   a. Upsert user_progress_typing (best-of comparison)
   b. Upsert user_streaks_typing (check if today already counted; increment/reset streak)
   c. Upsert keyboard_heatmap_stats (merge key-level stats)
   d. Upsert user_statistics.gameStats.koompi_typing
   e. Check + insert user_achievements if thresholds met (streak milestones, WPM milestones)
   f. Enqueue leaderboards_typing recompute (async job, not inline)
```

---

## 7. Open Questions to Resolve Against the Real App

- Is content organized as Units → Lessons (Duolingo-style) or a flatter level list like the other KOOMPI games?
- Are Khmer and English fully separate progression tracks, or interleaved within the same adventure map?
- Does "level up" refer to a lesson-completion level or an XP-based account level (or both)?
- Is there a streak-freeze / streak-repair mechanic, and does it cost in-game currency?
- Is there a placement test to skip ahead for users who already type well?
- Any parental/teacher dashboard data model needed, given the education-focused framing?
