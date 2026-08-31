# Typing Code Game - NoSQL Schema Design (MongoDB)

## Database Overview
This schema uses MongoDB with a document-based approach. Collections are denormalized where appropriate for performance, with references to other documents using `_id`.

---

## 1. USERS COLLECTION

### Schema Structure
```javascript
db.users.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439011"),
  
  // Authentication
  username: "pro_typer",
  email: "player@example.com",
  password_hash: "$2b$10$...",
  
  // Profile
  displayName: "Pro Typer",
  avatar: {
    url: "https://cdn.example.com/avatars/507f1f77bcf86cd799439011.png",
    uploadedAt: ISODate("2024-01-15T10:30:45Z")
  },
  bio: "Speedrun enthusiast",
  
  // Account Status
  accountStatus: "active", // 'active', 'inactive', 'banned', 'suspended'
  emailVerified: true,
  
  // Settings & Preferences
  preferences: {
    theme: "cyberpunk", // 'light', 'dark', 'cyberpunk'
    language: "en",
    notificationsEnabled: true,
    soundEnabled: true,
    difficultyPreference: "advanced"
  },
  
  // Location & Timezone
  profile: {
    countryCode: "US",
    timezone: "America/New_York",
    joinedFrom: "mobile_app" // 'web', 'mobile_app', 'desktop'
  },
  
  // Timestamps
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-20T14:22:10Z"),
  lastLoginAt: ISODate("2024-01-20T14:22:10Z"),
  lastActivityAt: ISODate("2024-01-20T15:10:30Z")
});

// Indexes
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });
db.users.createIndex({ "lastLoginAt": -1 });
```

---

## 2. USER_STATISTICS COLLECTION

### Schema Structure
```javascript
db.user_statistics.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: ObjectId("507f1f77bcf86cd799439011"), // Reference to users
  
  // Core Performance Metrics
  gamesPlayed: {
    total: 350,
    completed: 340,
    abandoned: 8,
    failed: 2
  },
  
  // Typing Speed & Accuracy
  wpm: {
    current: 128,
    average: 105,
    peak: 142,
    history: [ // Last 30 sessions
      { sessionId: ObjectId("..."), wpm: 142, date: ISODate("2024-01-20T...") },
      { sessionId: ObjectId("..."), wpm: 138, date: ISODate("2024-01-19T...") }
    ]
  },
  
  accuracy: {
    average: 96.5,
    bestStreak: 1250, // characters typed correctly in a row
    currentStreak: 340
  },
  
  // Progression
  level: {
    current: 25,
    xp: {
      current: 45000,
      totalEarned: 125000,
      nextLevelRequires: 50000
    }
  },
  
  // Streaks & Consistency
  streaks: {
    currentWinStreak: 12,
    longestWinStreak: 47,
    playStreak: {
      currentDays: 8,
      lastPlayDate: ISODate("2024-01-20T..."),
      longestDays: 35
    }
  },
  
  // Achievements & Points
  achievements: {
    total: 23,
    points: 15000,
    badges: [
      {
        id: "speed_demon",
        name: "Speed Demon",
        earnedAt: ISODate("2024-01-10T...")
      },
      {
        id: "accuracy_master",
        name: "Accuracy Master",
        earnedAt: ISODate("2024-01-15T...")
      }
    ]
  },
  
  // Category Performance
  categoryStats: [
    {
      category: "javascript",
      gamesPlayed: 85,
      averageWPM: 115,
      averageAccuracy: 97.2,
      highScore: 9500,
      timesPlayedThisWeek: 8
    },
    {
      category: "python",
      gamesPlayed: 62,
      averageWPM: 108,
      averageAccuracy: 95.1,
      highScore: 8200,
      timesPlayedThisWeek: 4
    }
  ],
  
  // Favorite Category & Difficulty
  preferences: {
    favoriteCategory: "javascript",
    preferredDifficulty: "advanced"
  },
  
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_statistics.createIndex({ userId: 1 }, { unique: true });
db.user_statistics.createIndex({ "level.current": -1 });
db.user_statistics.createIndex({ "wpm.peak": -1 });
db.user_statistics.createIndex({ "createdAt": 1 });
```

---

## 3. GAME_SESSIONS COLLECTION

### Schema Structure
```javascript
db.game_sessions.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439013"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  
  // Game Configuration
  gameMode: "timed", // 'timed', 'survival', 'challenge', 'practice', 'race'
  category: "javascript",
  difficulty: "advanced",
  challengeId: ObjectId("507f1f77bcf86cd799439050"), // Reference to challenges
  
  // Duration & Timing
  timing: {
    startedAt: ISODate("2024-01-20T14:22:10Z"),
    endedAt: ISODate("2024-01-20T14:23:45Z"),
    durationSeconds: 95
  },
  
  // Typing Performance
  performance: {
    totalTyped: 512,
    wordsTyped: 42,
    correctWords: 41,
    incorrectWords: 1,
    
    accuracy: 97.6,
    wpm: 128,
    peakWpm: 142,
    
    // Detailed Metrics
    correctCharacters: 510,
    incorrectCharacters: 2,
    keyPresses: 512,
    completionPercentage: 100
  },
  
  // Game Results
  results: {
    status: "completed", // 'completed', 'quit', 'failed', 'paused'
    score: 8500,
    xpEarned: 250,
    isPersonalBest: true,
    rank: 15, // Position in leaderboard at that time
    
    // Bonus Points
    streakBonus: 150,
    accuracyBonus: 100,
    speedBonus: 200,
    consistencyBonus: 75
  },
  
  // Power-ups Used
  powerUps: [
    {
      id: ObjectId("507f1f77bcf86cd799439080"),
      name: "Time Slow",
      category: "time",
      usedAt: ISODate("2024-01-20T14:22:30Z"),
      duration: 10,
      effectiveness: 85,
      impact: {
        wpsBefore: 2.1,
        wpsAfter: 2.3,
        improved: true
      }
    },
    {
      id: ObjectId("507f1f77bcf86cd799439081"),
      name: "Second Chance",
      category: "protection",
      usedAt: ISODate("2024-01-20T14:23:20Z"),
      preventedFailure: true
    }
  ],
  
  // Mistakes Analysis
  mistakes: [
    {
      position: 45,
      characterTyped: "x",
      expectedCharacter: "c",
      context: "functi...on",
      time: ISODate("2024-01-20T14:22:45Z")
    },
    {
      position: 128,
      characterTyped: "l",
      expectedCharacter: "i",
      context: "consol...e",
      time: ISODate("2024-01-20T14:23:10Z")
    }
  ],
  
  // Consistency Score
  consistency: {
    score: 92,
    wpmVariance: 12.5,
    stabilityPeriod: "very_stable" // 'unstable', 'slightly_stable', 'stable', 'very_stable'
  },
  
  // Environment & Device
  device: {
    type: "desktop", // 'mobile', 'desktop', 'tablet'
    os: "Windows 10",
    browser: "Chrome 120"
  },
  
  // Challenge-specific Data
  challengeData: {
    snippetLength: 512,
    languageUsed: "javascript",
    timeAllowedSeconds: 120
  },
  
  createdAt: ISODate("2024-01-20T14:22:10Z"),
  updatedAt: ISODate("2024-01-20T14:23:45Z")
});

// Indexes
db.game_sessions.createIndex({ userId: 1 });
db.game_sessions.createIndex({ userId: 1, "createdAt": -1 });
db.game_sessions.createIndex({ category: 1, "createdAt": -1 });
db.game_sessions.createIndex({ "results.status": 1 });
db.game_sessions.createIndex({ "createdAt": 1 });
db.game_sessions.createIndex({ "performance.wpm": -1 });
```

---

## 4. CHALLENGES COLLECTION

### Schema Structure
```javascript
db.challenges.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439050"),
  
  // Basic Info
  title: "React Hooks Challenge",
  description: "Master React hooks by implementing useState and useEffect",
  
  // Content
  codeSnippet: `import React, { useState, useEffect } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`,
  
  language: "javascript",
  
  // Metadata
  category: "react",
  difficulty: "intermediate", // 'beginner', 'intermediate', 'advanced', 'expert'
  
  length: {
    characters: 512,
    lines: 24,
    words: 67
  },
  
  estimatedTimeSeconds: 90,
  
  // Tagging & Discovery
  tags: [
    "react",
    "hooks",
    "state-management",
    "functional-components",
    "javascript"
  ],
  
  // Creator & Ownership
  creator: {
    userId: ObjectId("507f1f77bcf86cd799439001"),
    username: "code_master",
    createdAt: ISODate("2023-12-01T10:30:45Z")
  },
  
  // Publishing Status
  status: {
    isPublished: true,
    isFeatured: true,
    featuredAt: ISODate("2024-01-15T..."),
    isArchived: false
  },
  
  // Statistics
  stats: {
    timesPlayed: 1250,
    averageWpm: 95,
    averageAccuracy: 93.2,
    medianCompletionTimeSeconds: 105,
    
    // Performance Distribution
    successRate: 89.5,
    abandonedRate: 8.3,
    failedRate: 2.2
  },
  
  // Quality Metrics
  quality: {
    rating: 4.7,
    reviews: 342,
    difficulty: {
      baseDifficulty: 60, // 0-100
      adjustedByData: 65
    }
  },
  
  // Moderation
  moderation: {
    flaggedCount: 0,
    approvedAt: ISODate("2023-12-05T..."),
    approvedBy: ObjectId("507f1f77bcf86cd7994390ff")
  },
  
  // SEO & Discovery
  seo: {
    slug: "react-hooks-challenge",
    keywords: ["react", "hooks", "javascript", "functional-programming"]
  },
  
  createdAt: ISODate("2023-12-01T10:30:45Z"),
  updatedAt: ISODate("2024-01-18T14:22:10Z")
});

// Indexes
db.challenges.createIndex({ category: 1, difficulty: 1 });
db.challenges.createIndex({ "status.isPublished": 1 });
db.challenges.createIndex({ "status.isFeatured": 1 });
db.challenges.createIndex({ tags: 1 });
db.challenges.createIndex({ "stats.timesPlayed": -1 });
```

---

## 5. CATEGORIES COLLECTION

### Schema Structure
```javascript
db.categories.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439060"),
  
  name: "JavaScript",
  slug: "javascript",
  description: "Master JavaScript from basics to advanced concepts",
  
  icon: {
    url: "https://cdn.example.com/icons/javascript.svg",
    color: "#F7DF1E"
  },
  
  stats: {
    totalChallenges: 85,
    totalTimesPlayed: 25000,
    averagePlayersPerDay: 340,
    averageDifficulty: 65
  },
  
  // Subcategories
  subcategories: [
    {
      name: "ES6+",
      slug: "es6-plus",
      challengeCount: 23
    },
    {
      name: "Async & Promises",
      slug: "async-promises",
      challengeCount: 18
    },
    {
      name: "DOM Manipulation",
      slug: "dom-manipulation",
      challengeCount: 15
    }
  ],
  
  // Difficulty Distribution
  difficultyDistribution: {
    beginner: 20,
    intermediate: 35,
    advanced: 20,
    expert: 10
  },
  
  // Rankings & Leaderboard
  topPlayers: [
    {
      rank: 1,
      userId: ObjectId("507f1f77bcf86cd799439011"),
      username: "pro_typer",
      score: 125000,
      wpm: 142
    }
  ],
  
  displayOrder: 1,
  isActive: true,
  
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.categories.createIndex({ slug: 1 }, { unique: true });
db.categories.createIndex({ displayOrder: 1 });
```

---

## 6. GAME_MODES COLLECTION

### Schema Structure
```javascript
db.game_modes.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439070"),
  
  name: "Survival",
  slug: "survival",
  description: "Type without making mistakes. One mistake and it's game over!",
  
  modeType: "survival",
  
  // Game Rules
  rules: {
    lives: 3,
    timeLimit: null, // null = no limit
    scoringMultiplier: 2,
    difficultyScaling: true,
    
    // Game Mechanics
    mechanics: {
      loseLifeOn: "mistake",
      difficulty: {
        startingLevel: "intermediate",
        increaseFrequency: 30, // seconds
        increaseAmount: 0.1
      }
    },
    
    // Scoring Rules
    scoring: {
      basePointsPerWord: 10,
      accuracyBonus: 1.5, // Multiplier
      speedBonus: 1.2,
      streakBonus: 0.1
    }
  },
  
  // Visual & UX
  display: {
    icon: "https://cdn.example.com/icons/survival-mode.svg",
    color: "#E74C3C",
    order: 2,
    description: "High intensity, zero tolerance"
  },
  
  // Statistics
  stats: {
    timesPlayed: 8500,
    averageScore: 4200,
    averageWpm: 98,
    popularityRank: 2
  },
  
  isActive: true,
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample Timed Mode
db.game_modes.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439071"),
  name: "Timed",
  slug: "timed",
  description: "Race against the clock for 60 seconds",
  modeType: "timed",
  rules: {
    durationSeconds: 60,
    lives: null,
    scoringMultiplier: 1,
    mechanics: {
      endCondition: "time_expired"
    },
    scoring: {
      basePointsPerWord: 5,
      accuracyBonus: 1.0
    }
  },
  display: {
    icon: "https://cdn.example.com/icons/timed-mode.svg",
    color: "#3498DB",
    order: 1
  },
  stats: {
    timesPlayed: 15000,
    averageScore: 5100,
    averageWpm: 105,
    popularityRank: 1
  },
  isActive: true
});
```

---

## 7. INVENTORY_ITEMS COLLECTION

### Schema Structure
```javascript
db.inventory_items.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439080"),
  
  name: "Time Slow",
  slug: "time-slow",
  description: "Slow down time for 10 seconds",
  
  type: "power_up",
  category: "time",
  rarity: "rare", // 'common', 'rare', 'epic', 'legendary'
  
  // Power-up Effect
  effect: {
    type: "time_manipulation",
    parameters: {
      durationSeconds: 10,
      timeMultiplier: 0.7, // Time runs at 70% speed
      visual: "blue_overlay",
      audio: "whoosh"
    },
    
    // Effect Impact
    impact: {
      wpsBenefitPercent: 15,
      accuracyBenefitPercent: 8,
      averageScoreIncrease: 250
    }
  },
  
  // Visual Asset
  asset: {
    iconUrl: "https://cdn.example.com/items/time-slow.png",
    animationUrl: "https://cdn.example.com/items/time-slow.webm"
  },
  
  // Economy
  cost: {
    points: 500, // In-game currency
    xp: 0,
    premium: 2.99 // USD
  },
  
  stackable: true,
  maxStackCount: 99,
  
  // Availability
  acquisition: {
    isPurchasable: true,
    isAchievable: true,
    achievementRequired: "master_500_games",
    dropRate: 0.05 // 5% chance from challenges
  },
  
  // Cooldown & Limitations
  cooldown: {
    cooldownSeconds: 30,
    usesPerGame: 2
  },
  
  // Statistics & Popularity
  stats: {
    totalAcquired: 125000,
    totalUsed: 98500,
    averageEffectiveness: 82,
    popularityRank: 3
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-15T10:30:45Z")
});

// Sample Cosmetic Item
db.inventory_items.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439090"),
  name: "Neon Cyberpunk Theme",
  slug: "neon-cyberpunk",
  type: "cosmetic",
  category: "theme",
  rarity: "epic",
  
  asset: {
    previewUrl: "https://cdn.example.com/themes/neon-cyberpunk-preview.png",
    cssUrl: "https://cdn.example.com/themes/neon-cyberpunk.css"
  },
  
  cost: {
    points: 2000,
    xp: 500,
    premium: 4.99
  },
  
  stackable: false,
  maxStackCount: 1,
  
  acquisition: {
    isPurchasable: true,
    isAchievable: true,
    achievementRequired: null
  },
  
  stats: {
    totalAcquired: 45000,
    usersUsingNow: 12000,
    satisfaction: 4.8
  }
});
```

---

## 8. USER_INVENTORY COLLECTION

### Schema Structure
```javascript
db.user_inventory.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439100"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  
  powerUps: [
    {
      itemId: ObjectId("507f1f77bcf86cd799439080"), // Time Slow
      quantity: 5,
      isEquipped: true,
      lastUsedAt: ISODate("2024-01-20T14:23:45Z"),
      acquiredAt: ISODate("2024-01-10T10:30:45Z"),
      source: "purchased" // 'purchased', 'earned', 'achievement', 'drop'
    },
    {
      itemId: ObjectId("507f1f77bcf86cd799439081"), // Second Chance
      quantity: 3,
      isEquipped: true,
      lastUsedAt: ISODate("2024-01-18T10:30:45Z"),
      acquiredAt: ISODate("2024-01-05T10:30:45Z"),
      source: "achievement"
    }
  ],
  
  cosmetics: [
    {
      itemId: ObjectId("507f1f77bcf86cd799439090"), // Neon Theme
      isEquipped: true,
      acquiredAt: ISODate("2024-01-15T10:30:45Z"),
      source: "purchased"
    }
  ],
  
  // Equipment Slots
  equipped: {
    theme: ObjectId("507f1f77bcf86cd799439090"),
    avatar: ObjectId("507f1f77bcf86cd799439091"),
    backgroundEffect: null
  },
  
  // Statistics
  stats: {
    totalItemsOwned: 18,
    powerUpsTotalUsed: 156,
    lastInventoryUpdateAt: ISODate("2024-01-20T14:22:10Z")
  },
  
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_inventory.createIndex({ userId: 1 }, { unique: true });
db.user_inventory.createIndex({ "powerUps.itemId": 1 });
db.user_inventory.createIndex({ "cosmetics.isEquipped": 1 });
```

---

## 9. ACHIEVEMENTS COLLECTION

### Schema Structure
```javascript
db.achievements.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439110"),
  
  achievementId: "speed_demon",
  name: "Speed Demon",
  description: "Reach 140 WPM in a single session",
  
  icon: {
    url: "https://cdn.example.com/achievements/speed-demon.png",
    rarity: "epic"
  },
  
  // Requirements
  requirement: {
    type: "wpm_threshold",
    targetWPM: 140,
    minimumAccuracy: 85,
    gameMode: "any" // 'any', 'timed', 'survival', etc.
  },
  
  // Rewards
  rewards: {
    xp: 500,
    points: 1000,
    item: null // Optional item unlock
  },
  
  // Metadata
  category: "speed", // 'speed', 'accuracy', 'consistency', 'progression', 'social'
  rarity: "epic",
  displayOrder: 1,
  
  // Statistics
  stats: {
    totalEarned: 15000,
    progressionPercentage: 45 // % of players who have this
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample progression achievement
db.achievements.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439111"),
  achievementId: "level_master",
  name: "Level Master",
  description: "Reach level 50",
  
  requirement: {
    type: "level_reached",
    targetLevel: 50
  },
  
  rewards: {
    xp: 2000,
    points: 5000,
    item: ObjectId("507f1f77bcf86cd799439090") // Unlock special theme
  },
  
  category: "progression",
  rarity: "legendary",
  displayOrder: 2,
  
  stats: {
    totalEarned: 2500,
    progressionPercentage: 5
  }
});

// Indexes
db.achievements.createIndex({ achievementId: 1 }, { unique: true });
db.achievements.createIndex({ category: 1 });
```

---

## 10. USER_ACHIEVEMENTS COLLECTION

### Schema Structure
```javascript
db.user_achievements.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439120"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  achievementId: ObjectId("507f1f77bcf86cd799439110"), // Reference to achievement
  
  achievementSlug: "speed_demon",
  
  // Earning Details
  earnedAt: ISODate("2024-01-15T10:30:45Z"),
  earnedInSession: ObjectId("507f1f77bcf86cd799439013"), // Which game session earned it
  
  // Progress (for multi-stage achievements)
  progress: {
    current: 100,
    target: 100,
    completionPercentage: 100
  },
  
  // Notification
  notified: true,
  notifiedAt: ISODate("2024-01-15T10:31:00Z"),
  
  // Display Status
  isDisplayed: true,
  displayOrder: 1
});

// Indexes
db.user_achievements.createIndex({ userId: 1 });
db.user_achievements.createIndex({ userId: 1, achievementId: 1 }, { unique: true });
db.user_achievements.createIndex({ earnedAt: -1 });
```

---

## 11. LEADERBOARDS COLLECTION

### Schema Structure
```javascript
db.leaderboards.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439130"),
  
  // Leaderboard Configuration
  boardType: "global", // 'global', 'category', 'weekly', 'friends'
  category: null, // null for global, "javascript" for category-specific
  period: "all_time", // 'weekly', 'monthly', 'all_time'
  
  // Ranking Entry
  userId: ObjectId("507f1f77bcf86cd799439011"),
  rank: 15,
  
  // Score Metrics
  metrics: {
    score: 125000,
    wpm: 142,
    averageAccuracy: 96.5,
    gamesCompleted: 340,
    totalXP: 125000,
    
    // Calculation
    scoreFormula: "games_completed * avg_wpm * (accuracy / 100)"
  },
  
  // User Snapshot (for display)
  userSnapshot: {
    username: "pro_typer",
    displayName: "Pro Typer",
    avatar: "https://cdn.example.com/avatars/507f1f77bcf86cd799439011.png",
    level: 25
  },
  
  // Calculation Info
  calculatedAt: ISODate("2024-01-20T00:00:00Z"),
  validUntil: ISODate("2024-01-21T00:00:00Z"),
  
  // Change Information
  previousRank: 16,
  rankChange: 1, // +1 = improved
  isNew: false
});

// Weekly Leaderboard
db.leaderboards.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439131"),
  boardType: "weekly",
  category: "javascript",
  period: "weekly",
  weekStartDate: ISODate("2024-01-15T00:00:00Z"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  rank: 8,
  metrics: {
    score: 18500,
    wpm: 138,
    gamesThisWeek: 35
  },
  userSnapshot: {
    username: "pro_typer",
    displayName: "Pro Typer",
    avatar: "https://cdn.example.com/avatars/507f1f77bcf86cd799439011.png"
  },
  calculatedAt: ISODate("2024-01-20T22:00:00Z"),
  validUntil: ISODate("2024-01-21T22:00:00Z")
});

// Indexes - CRITICAL for performance
db.leaderboards.createIndex({ boardType: 1, period: 1, rank: 1 });
db.leaderboards.createIndex({ userId: 1, boardType: 1, period: 1 }, { unique: true });
db.leaderboards.createIndex({ category: 1, period: 1, rank: 1 });
db.leaderboards.createIndex({ calculatedAt: 1 });
db.leaderboards.createIndex({ "metrics.score": -1 });
```

---

## 12. AUTH_SESSIONS COLLECTION

### Schema Structure
```javascript
db.auth_sessions.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439140"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  
  // Tokens
  tokens: {
    refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    refreshTokenHash: "sha256_hash_of_refresh_token",
    accessTokenHash: "sha256_hash_of_access_token"
  },
  
  // Device & Session Info
  device: {
    type: "desktop", // 'mobile', 'desktop', 'tablet'
    name: "Chrome on Windows 10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36..."
  },
  
  network: {
    ipAddress: "192.168.1.100",
    location: {
      country: "US",
      city: "New York",
      latitude: 40.7128,
      longitude: -74.0060
    }
  },
  
  // Session Lifecycle
  createdAt: ISODate("2024-01-20T14:22:10Z"),
  lastActivityAt: ISODate("2024-01-20T15:45:30Z"),
  expiresAt: ISODate("2024-04-20T14:22:10Z"), // 3 months
  
  isActive: true,
  wasRevoked: false,
  revokedAt: null,
  revokedReason: null,
  
  // Security
  security: {
    remoteLoginAttempts: 0,
    suspiciousActivityFlag: false
  }
});

// Indexes
db.auth_sessions.createIndex({ userId: 1 });
db.auth_sessions.createIndex({ "tokens.refreshToken": 1 });
db.auth_sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL
db.auth_sessions.createIndex({ isActive: 1 });
```

---

## 13. LOGIN_HISTORY COLLECTION

### Schema Structure
```javascript
db.login_history.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439150"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  
  // Login Event
  event: {
    type: "successful", // 'successful', 'failed', 'logout'
    timestamp: ISODate("2024-01-20T14:22:10Z")
  },
  
  // Device Info
  device: {
    type: "desktop",
    os: "Windows 10",
    browser: "Chrome 120",
    userAgent: "Mozilla/5.0..."
  },
  
  // Network Info
  network: {
    ipAddress: "192.168.1.100",
    location: {
      country: "US",
      city: "New York",
      timezone: "America/New_York"
    }
  },
  
  // Session Details
  sessionId: ObjectId("507f1f77bcf86cd799439140"),
  logoutAt: null, // null if still logged in
  
  // Security Flags
  security: {
    isNewDevice: false,
    isNewLocation: false,
    requiresMFA: false,
    riskLevel: "low" // 'low', 'medium', 'high'
  }
});

// Indexes
db.login_history.createIndex({ userId: 1, "event.timestamp": -1 });
db.login_history.createIndex({ "event.timestamp": 1 });
db.login_history.createIndex({ userId: 1, "event.type": 1 });
```

---

## 14. GAME_ANALYTICS COLLECTION

### Schema Structure (Time Series)
```javascript
db.game_analytics.insertOne({
  _id: ObjectId("507f1f77bcf86cd799439160"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  sessionId: ObjectId("507f1f77bcf86cd799439013"),
  
  // Event Information
  event: {
    type: "session_completed", // 'session_start', 'power_up_used', 'achievement_earned', 'session_completed'
    category: "gameplay",
    timestamp: ISODate("2024-01-20T14:23:45Z")
  },
  
  // Event Data (flexible)
  eventData: {
    score: 8500,
    wpm: 128,
    accuracy: 97.6,
    powerUpsUsed: ["time_slow", "second_chance"],
    achievements: ["speed_demon"]
  },
  
  // User State at Event
  userState: {
    level: 25,
    totalXP: 125000,
    currentWinStreak: 12
  },
  
  // Performance Metrics
  performance: {
    currentWPM: 128,
    currentAccuracy: 97.6,
    sessionDuration: 95
  },
  
  // Device Context
  device: {
    type: "desktop",
    os: "Windows 10"
  }
});

// Schema Settings for Time Series (MongoDB 5.0+)
db.createCollection("game_analytics", {
  timeseries: {
    timeField: "event.timestamp",
    metaField: "metadata",
    granularity: "minutes"
  }
});

// Indexes
db.game_analytics.createIndex({ userId: 1, "event.timestamp": -1 });
db.game_analytics.createIndex({ "event.type": 1 });
db.game_analytics.createIndex({ "event.timestamp": 1 });
```

---

## QUERYING PATTERNS & EXAMPLES

### Get User Profile with Statistics
```javascript
db.users.aggregate([
  {
    $match: { username: "pro_typer" }
  },
  {
    $lookup: {
      from: "user_statistics",
      localField: "_id",
      foreignField: "userId",
      as: "stats"
    }
  },
  {
    $lookup: {
      from: "user_achievements",
      localField: "_id",
      foreignField: "userId",
      as: "achievements"
    }
  },
  {
    $unwind: "$stats"
  }
]).pretty();
```

### Get Recent Game Sessions with Challenge Info
```javascript
db.game_sessions.aggregate([
  {
    $match: { userId: ObjectId("507f1f77bcf86cd799439011") }
  },
  {
    $sort: { createdAt: -1 }
  },
  {
    $limit: 10
  },
  {
    $lookup: {
      from: "challenges",
      localField: "challengeId",
      foreignField: "_id",
      as: "challenge"
    }
  },
  {
    $unwind: "$challenge"
  }
]).pretty();
```

### Get Global Leaderboard
```javascript
db.leaderboards.find({
  boardType: "global",
  period: "all_time"
}).sort({ rank: 1 }).limit(100).pretty();
```

### Get Category-Specific Top 10
```javascript
db.leaderboards.find({
  boardType: "category",
  category: "javascript",
  period: "weekly"
}).sort({ rank: 1 }).limit(10).projection({
  rank: 1,
  "metrics.score": 1,
  "userSnapshot.username": 1,
  "userSnapshot.level": 1
}).pretty();
```

### Get User's Equipped Items
```javascript
db.user_inventory.findOne(
  { userId: ObjectId("507f1f77bcf86cd799439011") },
  { equipped: 1, cosmetics: 1 }
).pretty();
```

---

## DATA DENORMALIZATION STRATEGY

### What's Denormalized & Why:
- **User snapshots in leaderboards** - Avoids lookup on every leaderboard view
- **Category stats aggregated** - Pre-calculated for fast queries
- **Power-up effectiveness data** - Tracked in session for analytics
- **Challenge stats in collection** - Updated periodically for performance

### Aggregation Pipeline for Updates:
```javascript
// Update category stats weekly
db.challenges.updateMany(
  { _id: ObjectId("507f1f77bcf86cd799439050") },
  [
    {
      $set: {
        "stats.averageWpm": {
          $avg: "$performanceHistory.wpm"
        }
      }
    }
  ]
);
```

---

## INDEXES SUMMARY

| Collection | Index Fields | Type | Purpose |
|-----------|-------------|------|---------|
| users | username, email | Unique | Fast lookups |
| users | lastLoginAt | Compound | User activity |
| user_statistics | userId | Unique | Profile stats |
| game_sessions | userId, createdAt | Compound | Session history |
| challenges | category, difficulty | Compound | Discovery |
| leaderboards | boardType, rank | Compound | Leaderboard views |
| auth_sessions | expiresAt | TTL | Auto-cleanup |
| login_history | userId, timestamp | Compound | Audit trail |

---

## BACKUP & SHARDING STRATEGY

### Sharding Key Recommendation:
```javascript
// Shard by userId for horizontal scaling
sh.shardCollection("typing_game.game_sessions", { userId: 1 })
sh.shardCollection("typing_game.user_achievements", { userId: 1 })
sh.shardCollection("typing_game.login_history", { userId: 1 })
```

### Backup Collections:
```javascript
// Keep read-only snapshots for analytics
db.leaderboards_snapshot_2024_01_20.find().pretty();
db.user_statistics_snapshot_2024_01_20.find().pretty();
```

---

## KEY DIFFERENCES FROM SQL SCHEMA

| Aspect | SQL | NoSQL |
|--------|-----|-------|
| User Stats | Separate table (1:1) | Embedded in document |
| Session Mistakes | Separate table (1:N) | Array in document |
| Power-ups Used | Separate table (1:N) | Array in document |
| Leaderboard Caching | Materialized view | Cached collection |
| Relationships | Foreign keys | Document references + $lookup |
| Flexibility | Strict schema | Flexible document structure |
| Scaling | Vertical | Horizontal (sharding) |

