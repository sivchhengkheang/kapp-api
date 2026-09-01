# Dragon Drop - NoSQL Schema Design

## Game Overview
- **Type**: Match-three puzzle game with collection mechanics
- **Mechanic**: Drag and match orbs to clear puzzles
- **Core Feature**: Collect map pieces and mystical orbs to unlock boss levels
- **Progression**: Story-driven across 3 unique worlds with 30+ levels
- **Win Condition**: Collect all map pieces and solve puzzles
- **Replayability**: Earn 1-3 stars based on collecting all items in single attempt
- **Narrative**: Save Princess Linia from dragon Feytch (story arc)

---

## 1. USERS_ACCOUNT COLLECTION (Authentication)

```javascript
db.users_account.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439011"),
  
  // Authentication
  email: "adventurer@example.com",
  username: "dragon_slayer",
  password_hash: "$2b$10$...",
  
  // Email Verification
  emailVerified: true,
  emailVerificationToken: null,
  
  // Account Status
  accountStatus: "active",
  
  // Security
  security: {
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    accountLockedUntil: null,
    passwordChangedAt: ISODate("2024-01-10T10:30:45Z")
  },
  
  // Story Progress
  storyProgress: {
    currentWorld: 2,
    worldStartedAt: {
      world_1: ISODate("2023-06-15T10:30:45Z"),
      world_2: ISODate("2024-01-10T14:22:10Z")
    }
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-20T14:22:10Z"),
  lastLoginAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.users_account.createIndex({ email: 1 }, { unique: true });
db.users_account.createIndex({ username: 1 }, { unique: true });
```

---

## 2. USER_PROFILE COLLECTION

```javascript
db.user_profile.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439012"),
  userAccountId: ObjectId("809f1f77bcf86cd799439011"),
  
  // Display Information
  displayName: "Dragon Slayer",
  bio: "On a quest to save Princess Linia",
  avatar: {
    url: "https://cdn.example.com/avatars/809f1f77bcf86cd799439011.png",
    uploadedAt: ISODate("2024-01-15T10:30:45Z"),
    type: "custom"
  },
  
  // User Profile
  profile: {
    countryCode: "US",
    timezone: "America/New_York",
    joinedFrom: "web"
  },
  
  // Preferences
  preferences: {
    language: "en",
    theme: "light",
    soundEnabled: true,
    musicEnabled: true,
    notificationsEnabled: true,
    particleEffects: true,
    difficulty: "normal" // 'easy', 'normal', 'hard'
  },
  
  // Privacy
  privacy: {
    profilePublic: true,
    showOnLeaderboard: true,
    allowFriendRequests: true
  },
  
  // Quick Stats (Cached)
  stats: {
    worldsCompleted: 1,
    totalLevelsCompleted: 12,
    totalStars: 28, // out of possible 36 (3 worlds × 12 levels × 1 star)
    totalMapPiecesCollected: 24,
    totalOrbs: 12,
    peakComboRecord: 8,
    lastPlayedAt: ISODate("2024-01-20T14:22:10Z")
  },
  
  // Badges & Status
  badges: {
    customTitle: "Master Collector",
    statusMessage: "Currently exploring World 2",
    featured: ["world_1_complete", "combo_master"]
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_profile.createIndex({ userAccountId: 1 }, { unique: true });
```

---

## 3. USER_STATISTICS COLLECTION

```javascript
db.user_statistics.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439013"),
  userAccountId: ObjectId("809f1f77bcf86cd799439011"),
  
  // Progress
  progression: {
    worldsStarted: 2,
    worldsCompleted: 1,
    totalLevelsAttempted: 18,
    totalLevelsCompleted: 12,
    totalLevelsFailed: 0,
    currentWorld: 2,
    currentLevel: 8
  },
  
  // XP & Progression
  xp: {
    current: 24000,
    totalEarned: 85000,
    level: 12,
    nextLevelRequires: 30000
  },
  
  // Star System
  stars: {
    totalStarsEarned: 28,
    maxPossibleStars: 36, // 3 worlds × 12 levels
    starDistribution: {
      oneStarLevels: 4,
      twoStarLevels: 8,
      threeStarLevels: 0 // Perfect levels with all collectibles
    },
    perfectLevels: [] // Levels with 3-star rating
  },
  
  // Collection Stats
  collections: {
    totalMapPiecesCollected: 24,
    mapPiecesPerWorld: {
      world_1: 12, // All 12 pieces from world 1
      world_2: 12,
      world_3: 0
    },
    totalOrbsCollected: 12,
    orbsPerWorld: {
      world_1: 4,
      world_2: 8,
      world_3: 0
    }
  },
  
  // Combat/Puzzle Performance
  performance: {
    totalMovesAveraged: 145,
    bestCombo: 8,
    totalCombosAveraged: 3.2,
    totalTimePlayedSeconds: 18000, // 5 hours
    averageLevelTime: 1500 // 25 minutes per level
  },
  
  // Boss Battles
  bossStats: {
    bossBattlesAttempted: 1,
    bossBattlesWon: 0,
    bossBattlesLost: 1,
    currentBossOnAttempt: 1,
    lastBossAttemptAt: ISODate("2024-01-20T14:00:00Z")
  },
  
  // Achievements
  achievements: {
    total: 5,
    badges: [
      {
        id: "world_1_complete",
        name: "World Explorer",
        earnedAt: ISODate("2024-01-15T...")
      },
      {
        id: "collector",
        name: "Map Piece Collector",
        progress: 24,
        target: 30
      }
    ]
  },
  
  // Difficulty Performance
  byDifficulty: {
    easy: { levelsCompleted: 4, averageStars: 2.25 },
    normal: { levelsCompleted: 8, averageStars: 1.75 }
  },
  
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_statistics.createIndex({ userAccountId: 1 }, { unique: true });
db.user_statistics.createIndex({ "progression.currentWorld": 1 });
db.user_statistics.createIndex({ "stars.totalStarsEarned": -1 });
```

---

## 4. LEVELS COLLECTION (Level Definitions)

```javascript
db.levels.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439100"),
  
  // Level Identity
  levelNumber: 8,
  worldNumber: 2,
  title: "Enchanted Forest",
  storyText: "The forest glows with mystical light. Collect the map pieces to progress deeper...",
  
  // Difficulty & Progression
  difficulty: "normal", // 'easy', 'normal', 'hard'
  recommendedLevel: 8,
  
  // Grid Configuration
  puzzle: {
    gridWidth: 6,
    gridHeight: 8,
    initialOrbs: [
      { x: 0, y: 0, type: "red" },
      { x: 1, y: 0, type: "blue" },
      { x: 2, y: 0, type: "green" },
      // ... rest of grid
    ],
    orbTypes: ["red", "blue", "green", "yellow", "purple"], // Available colors
    specialOrbs: [
      { x: 3, y: 5, type: "mystical_orb", rarity: "rare" }
    ]
  },
  
  // Objectives
  objectives: {
    primary: {
      type: "clear_orbs",
      targetCount: 30,
      description: "Clear 30 orbs"
    },
    collectibles: [
      {
        id: "map_piece_1",
        type: "map_piece",
        position: { x: 5, y: 7 },
        requiresCombo: 5, // Requires combo of 5+ to unlock
        description: "Map piece in top-right corner"
      },
      {
        id: "map_piece_2",
        type: "map_piece",
        position: { x: 2, y: 4 },
        requiresCombo: 3,
        description: "Map piece in center"
      },
      {
        id: "mystical_orb",
        type: "special_orb",
        position: { x: 3, y: 5 },
        requiresCombo: 8,
        description: "Mystical orb - match special orb"
      }
    ]
  },
  
  // Obstacles
  obstacles: [
    {
      id: "ice_block_1",
      type: "ice_block",
      positions: [{ x: 1, y: 2 }],
      hitsRequired: 2, // Must be hit twice to break
      blocksOrbs: true
    },
    {
      id: "locked_tile",
      type: "locked_tile",
      position: { x: 4, y: 3 },
      unlocksAt: "combo_7_orbs"
    }
  ],
  
  // Game Rules
  rules: {
    moveLimit: 25, // Moves available
    timeLimit: null, // null = unlimited
    comboMultiplier: 1.2, // Each combo increases score
    cascadeEnabled: true // Orbs fall and create new matches
  },
  
  // Scoring & Rewards
  rewards: {
    baseXP: 300,
    xpForCollectibles: 50, // Per collectible
    xpForMovesFull: 50, // If moves left
    
    // Star-based rewards
    stars: {
      oneStar: {
        minMovesUsed: 20,
        minScore: 5000,
        xpBonus: 100,
        rewardText: "Good effort!"
      },
      twoStars: {
        minMovesUsed: 18,
        minScore: 7500,
        xpBonus: 200,
        collectAllItems: false,
        rewardText: "Well done!"
      },
      threeStars: {
        minMovesUsed: 15,
        minScore: 10000,
        xpBonus: 300,
        collectAllItems: true, // Must collect ALL items
        rewardText: "Perfect!"
      }
    }
  },
  
  // Solution & Hints
  solution: {
    optimalMoves: 15,
    optimialCombos: 4,
    hints: [
      {
        id: "hint_1",
        level: 1,
        text: "Try matching colors from the bottom up for combos",
        revealAfterAttempts: 2
      },
      {
        id: "hint_2",
        level: 2,
        text: "Ice blocks need 2 matches to break",
        revealAfterTime: 120 // seconds
      }
    ]
  },
  
  // Metadata
  author: {
    type: "system",
    designNotes: "Medium difficulty, introduces ice blocks"
  },
  
  // Statistics
  stats: {
    timesAttempted: 12400,
    timesCompleted: 10200,
    completionRate: 82.3,
    averageMovesUsed: 19,
    averageScore: 7800,
    bestScore: 12500,
    perfectRunsCount: 340, // 3-star ratings
    averageAttempts: 1.85 // Attempts per completion
  },
  
  // Progression
  unlocks: {
    unlockedAt: "world_2_start",
    nextLevel: 9,
    leadsToWorld: null,
    leadsToBonus: null
  },
  
  // Content
  theme: {
    background: "enchanted_forest",
    musicTrack: "world_2_theme",
    particleEffects: ["magical_sparkles", "glowing_orbs"]
  },
  
  status: {
    isPublished: true,
    isArchived: false
  },
  
  createdAt: ISODate("2023-08-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-15T10:30:45Z")
});

// Indexes
db.levels.createIndex({ levelNumber: 1 }, { unique: true });
db.levels.createIndex({ worldNumber: 1, levelNumber: 1 });
db.levels.createIndex({ difficulty: 1 });
db.levels.createIndex({ "stats.completionRate": -1 });
```

---

## 5. GAME_SESSIONS COLLECTION

```javascript
db.game_sessions.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439200"),
  userAccountId: ObjectId("809f1f77bcf86cd799439011"),
  
  // Level Info
  levelId: ObjectId("809f1f77bcf86cd799439100"),
  levelNumber: 8,
  worldNumber: 2,
  difficulty: "normal",
  
  // Timing
  timing: {
    startedAt: ISODate("2024-01-20T14:22:10Z"),
    endedAt: ISODate("2024-01-20T14:28:45Z"),
    durationSeconds: 395,
    pausedSeconds: 0
  },
  
  // Performance & Results
  performance: {
    status: "completed", // 'completed', 'quit', 'failed'
    levelPassed: true,
    starRating: 2, // 1, 2, or 3 stars
    
    // Movement Data
    movesUsed: 18,
    movesAvailable: 25,
    movesRemaining: 7,
    
    // Score
    score: 8200,
    baseScore: 5000,
    comboBonus: 2100,
    collectibleBonus: 1100
  },
  
  // Collectibles
  collectibles: {
    collected: [
      {
        id: "map_piece_1",
        type: "map_piece",
        collectedAt: 285, // seconds into session
        moveNumber: 12,
        requiredCombo: 5,
        actualCombo: 6
      },
      {
        id: "map_piece_2",
        type: "map_piece",
        collectedAt: 358,
        moveNumber: 18,
        requiredCombo: 3,
        actualCombo: 3
      }
    ],
    missed: [
      {
        id: "mystical_orb",
        type: "special_orb",
        reason: "Not enough combos"
      }
    ],
    collectionProgress: {
      mapPieces: 2,
      mapPiecesTotal: 3,
      specialOrbs: 0,
      specialOrbsTotal: 1
    }
  },
  
  // Move Sequence (Detailed)
  moveSequence: [
    {
      moveNumber: 1,
      startGridState: [...],
      endGridState: [...],
      action: {
        dragFrom: { x: 2, y: 3 },
        dragTo: { x: 2, y: 4 },
        orb: "blue"
      },
      matches: [
        {
          type: "horizontal",
          count: 3,
          position: { x: 2, y: 4 },
          orbs: ["blue", "blue", "blue"]
        }
      ],
      comboCount: 1,
      scoreEarned: 150,
      cascadeOccurred: true
    }
    // ... 17 more moves
  ],
  
  // Combo Tracking
  combos: {
    totalCombos: 4,
    bestCombo: 6,
    comboHistory: [
      { moveNumber: 5, comboCount: 5, scoreEarned: 800 },
      { moveNumber: 8, comboCount: 3, scoreEarned: 450 },
      { moveNumber: 12, comboCount: 6, scoreEarned: 950 },
      { moveNumber: 16, comboCount: 4, scoreEarned: 600 }
    ]
  },
  
  // Mistakes & Failed Moves
  mistakes: [],
  
  // Rewards Earned
  rewards: {
    xpEarned: 400,
    xpBonus: 200, // Two-star bonus
    totalXP: 600,
    pointsEarned: 250,
    mapPiecesEarned: 2,
    orbsEarned: 0,
    achievementsUnlocked: [],
    levelUpAchieved: false
  },
  
  // Analytics
  analytics: {
    playStyle: "strategic", // 'quick', 'strategic', 'casual'
    comboFrequency: "moderate",
    cascadeFrequency: 8, // Times cascade occurred
    restartCount: 0,
    hintUsed: false
  },
  
  // Device Info
  device: {
    type: "mobile",
    os: "iOS 16",
    browser: "Safari",
    screenSize: "iphone_12"
  },
  
  createdAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.game_sessions.createIndex({ userAccountId: 1 });
db.game_sessions.createIndex({ userAccountId: 1, "createdAt": -1 });
db.game_sessions.createIndex({ levelId: 1 });
db.game_sessions.createIndex({ "performance.status": 1 });
```

---

## 6. LEVEL_PROGRESS COLLECTION

```javascript
db.level_progress.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439210"),
  userAccountId: ObjectId("809f1f77bcf86cd799439011"),
  levelId: ObjectId("809f1f77bcf86cd799439100"),
  
  levelNumber: 8,
  worldNumber: 2,
  
  // Progress Status
  status: "completed", // 'locked', 'unlocked', 'in_progress', 'completed'
  unlockedAt: ISODate("2024-01-13T..."),
  firstAttemptAt: ISODate("2024-01-15T..."),
  completedAt: ISODate("2024-01-20T14:28:45Z"),
  
  // Star Information
  currentStars: 2,
  maxStars: 3,
  threeStarRequirement: {
    collectAllItems: true,
    movesLimit: 15,
    score: 10000
  },
  
  // Attempts
  totalAttempts: 3,
  attempts: [
    {
      attemptNumber: 1,
      status: "failed",
      starRating: 0,
      score: 4200,
      movesUsed: 25,
      collectedItems: 0,
      attemptedAt: ISODate("2024-01-15T...")
    },
    {
      attemptNumber: 2,
      status: "completed",
      starRating: 1,
      score: 6800,
      movesUsed: 21,
      collectedItems: 1,
      attemptedAt: ISODate("2024-01-18T...")
    },
    {
      attemptNumber: 3,
      status: "completed",
      starRating: 2,
      score: 8200,
      movesUsed: 18,
      collectedItems: 2,
      attemptedAt: ISODate("2024-01-20T...")
    }
  ],
  
  // Collection Progress
  mapPiecesCollected: [
    {
      id: "map_piece_1",
      collectedAt: ISODate("2024-01-20T..."),
      attemptNumber: 3
    },
    {
      id: "map_piece_2",
      collectedAt: ISODate("2024-01-20T..."),
      attemptNumber: 3
    }
  ],
  mapPiecesMissing: ["mystical_orb"],
  
  // Best Performance
  bestAttempt: {
    attemptNumber: 3,
    score: 8200,
    stars: 2,
    movesUsed: 18,
    collectedItems: 2
  },
  
  // Rewards Claimed
  rewardsClaimed: {
    xp: 600,
    points: 250,
    firstCompletionBonus: true,
    starBonuses: {
      oneStar: true,
      twoStar: true,
      threeStar: false
    }
  }
});

// Indexes
db.level_progress.createIndex({ userAccountId: 1, levelId: 1 }, { unique: true });
db.level_progress.createIndex({ userAccountId: 1, worldNumber: 1 });
```

---

## 7. WORLD_PROGRESS COLLECTION

```javascript
db.world_progress.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439220"),
  userAccountId: ObjectId("809f1f77bcf86cd799439011"),
  
  worldNumber: 2,
  worldTitle: "Forgotten Highlands",
  
  // World Status
  status: "in_progress", // 'locked', 'unlocked', 'in_progress', 'completed'
  unlockedAt: ISODate("2024-01-12T..."),
  startedAt: ISODate("2024-01-13T..."),
  completedAt: null,
  
  // Level Progress
  levelsTotal: 12,
  levelsCompleted: 8,
  levelsInProgress: 1,
  levelsLocked: 3,
  
  // Star Progress
  starsEarned: 16, // out of 36 (12 × 3)
  starsPercentage: 44.4,
  
  // Map Pieces
  mapPiecesCollected: 20,
  mapPiecesNeeded: 12, // To unlock boss
  mapPiecesProgress: 20, // Progress to boss
  
  // Mystical Orbs
  orbsCollected: 8,
  orbsTotal: 12,
  
  // Boss Level
  bossLevel: {
    levelId: ObjectId("809f1f77bcf86cd799439150"),
    title: "Shadow Sprite - Guardian of Highlands",
    status: "unlocked", // 'locked', 'unlocked', 'attempted', 'defeated'
    requiredMapPieces: 12,
    currentMapPieces: 20,
    attemptCount: 1,
    defeats: 1,
    bestScore: 0,
    storyReward: "received_world_2_key"
  },
  
  // World Rewards
  rewards: {
    totalXP: 4800,
    totalPoints: 2500,
    unlockedStory: "world_2_intro", // Story unlocked when world started
    nextStorySegment: "world_2_boss_defeat" // Unlocks when boss defeated
  },
  
  // Statistics
  stats: {
    totalTimeSpentSeconds: 28000,
    averageLevelTime: 3500,
    bestLevelScore: 12500,
    totalMovesAveraged: 21,
    bestCombo: 8
  },
  
  // Completion Milestones
  milestones: {
    firstLevelCompleted: ISODate("2024-01-13T..."),
    firstPerfectRun: null, // Not yet achieved
    allMapPiecesCollected: ISODate("2024-01-20T..."), // Time this happened
    bossUnlocked: ISODate("2024-01-20T...")
  }
});

// Indexes
db.world_progress.createIndex({ userAccountId: 1, worldNumber: 1 }, { unique: true });
db.world_progress.createIndex({ "status": 1 });
```

---

## 8. BOSS_BATTLES COLLECTION

```javascript
db.boss_battles.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439300"),
  userAccountId: ObjectId("809f1f77bcf86cd799439011"),
  
  // Boss Info
  bossLevelId: ObjectId("809f1f77bcf86cd799439150"),
  bossName: "Shadow Sprite",
  worldNumber: 2,
  bossNumber: 1,
  
  // Battle Status
  status: "completed", // 'completed', 'failed', 'in_progress'
  battleResult: "defeat",
  
  // Battle Details
  attempts: {
    attemptNumber: 1,
    maxAttempts: 3,
    startedAt: ISODate("2024-01-20T14:00:00Z"),
    endedAt: ISODate("2024-01-20T14:10:00Z"),
    durationSeconds: 600
  },
  
  // Boss Stats
  boss: {
    name: "Shadow Sprite",
    health: 10000,
    healthRemaining: 4200,
    element: "dark",
    attackPower: 150,
    attacks: [
      {
        name: "Shadow Blast",
        damage: 300,
        interval: "every_3_turns",
        description: "Deals massive dark damage"
      }
    ]
  },
  
  // Battle Performance
  performance: {
    playerDamageDealt: 5800,
    bossHealthRemaining: 4200,
    damagePercentage: 58,
    
    // Moves
    totalMoves: 22,
    totalCombos: 5,
    bestCombo: 7,
    
    // Score
    score: 5800,
    timeBonus: 200,
    totalScore: 6000
  },
  
  // Rewards (if defeated)
  rewards: {
    xpEarned: 0, // No XP for defeat
    pointsEarned: 0,
    itemDrops: [] // Items dropped by boss
  },
  
  // Progression
  nextAttempt: {
    availableAt: ISODate("2024-01-21T14:00:00Z"), // Can retry next day
    retriesRemaining: 2
  }
});

// Indexes
db.boss_battles.createIndex({ userAccountId: 1, bossLevelId: 1 });
db.boss_battles.createIndex({ userAccountId: 1, "createdAt": -1 });
```

---

## 9. WORLDS COLLECTION

```javascript
db.worlds.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439400"),
  
  worldNumber: 2,
  title: "Forgotten Highlands",
  description: "Ancient mountains shrouded in mystery. Dark creatures roam these lands.",
  
  // Story
  story: {
    introduction: "You climb higher into the misty mountains...",
    narrative: "The highlands hold the next clue to finding Princess Linia...",
    conclusion: "You defeat the Shadow Sprite and recover an ancient map fragment.",
    storyCharacters: ["Princess Linia", "Shadow Sprite", "Wise Elder"]
  },
  
  // Level Structure
  levels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Level IDs
  totalLevels: 12,
  
  // Boss
  boss: {
    bossId: ObjectId("809f1f77bcf86cd799439150"),
    name: "Shadow Sprite",
    description: "A powerful creature guarding the highlands",
    difficulty: "hard",
    requiredMapPieces: 12,
    unlockReward: "world_3_unlock"
  },
  
  // Progression Requirements
  requirements: {
    previousWorldCompleted: true,
    previousWorldId: ObjectId("809f1f77bcf86cd799439401"),
    minPlayerLevel: 5
  },
  
  // World Rewards
  rewards: {
    baseXP: 4800,
    basePoints: 2500,
    worldCompletionBonus: {
      xp: 1000,
      items: ["ancient_key", "world_2_trophy"]
    }
  },
  
  // Visual & Theme
  theme: {
    backgroundColor: "#2c3e50",
    primaryColor: "#34495e",
    musicTrack: "world_2_theme",
    environment: "misty_mountains",
    weather: "fog",
    ambiance: "mysterious"
  },
  
  // Statistics
  stats: {
    totalAttempts: 185000,
    totalCompletions: 145000,
    completionRate: 78.4,
    averageTimeToComplete: 15000, // seconds
    averageStarsEarned: 2.1,
    perfectRunsCount: 8500
  },
  
  // Publishing
  status: {
    isPublished: true,
    isArchived: false,
    releaseDate: ISODate("2023-09-01T...")
  },
  
  createdAt: ISODate("2023-08-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-15T10:30:45Z")
});

// Indexes
db.worlds.createIndex({ worldNumber: 1 }, { unique: true });
db.worlds.createIndex({ "status.isPublished": 1 });
```

---

## 10. MAP_PIECES COLLECTION

```javascript
db.map_pieces.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439500"),
  
  // Identity
  mapPieceId: "world_2_piece_1",
  worldNumber: 2,
  pieceNumber: 1,
  title: "Lost Scroll Fragment",
  
  // Location
  location: {
    levelId: ObjectId("809f1f77bcf86cd799439100"),
    levelNumber: 8,
    position: "top_right_corner",
    description: "Hidden in the enchanted forest canopy"
  },
  
  // Collection Info
  rarity: "uncommon",
  requiresCombo: 5, // Minimum combo to reveal
  requiresPerfectRun: false,
  
  // Visual
  sprite: {
    url: "https://cdn.example.com/items/map-piece-1.png",
    color: "#E8D4A2",
    glow: true
  },
  
  // Story
  lore: "This fragment of an ancient map shows the path to the highlands.",
  
  // Unlock Value
  countsTowardBoss: true, // Counts toward boss unlock
  bossPiecesNeeded: 12,
  
  // Collection Stats
  stats: {
    totalCollected: 145000,
    collectionRate: 95.3,
    averageLevelRequired: 8
  }
});

// Indexes
db.map_pieces.createIndex({ worldNumber: 1, pieceNumber: 1 }, { unique: true });
db.map_pieces.createIndex({ "location.levelId": 1 });
```

---

## 11. ACHIEVEMENTS COLLECTION

```javascript
db.achievements.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439600"),
  
  achievementId: "world_1_complete",
  name: "World Explorer",
  description: "Complete all levels in World 1",
  
  icon: {
    url: "https://cdn.example.com/achievements/world-explorer.png",
    rarity: "common"
  },
  
  // Requirements
  requirement: {
    type: "world_completion",
    targetWorld: 1,
    requiredStars: 0
  },
  
  // Rewards
  rewards: {
    xp: 500,
    points: 1000,
    unlocksWorld: 2
  },
  
  // Metadata
  category: "exploration",
  rarity: "common",
  
  // Stats
  stats: {
    totalEarned: 145000,
    percentageOfPlayers: 94
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample: Collection Achievement
db.achievements.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439601"),
  achievementId: "perfect_collector",
  name: "Perfect Collector",
  description: "Earn 3 stars on 10 levels",
  requirement: {
    type: "stars",
    targetStars: 30,
    minStarLevel: 3
  },
  rewards: {
    xp: 800,
    points: 2000
  },
  category: "collection",
  rarity: "uncommon",
  stats: {
    totalEarned: 32000,
    percentageOfPlayers: 18
  }
});

// Sample: Combo Achievement
db.achievements.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439602"),
  achievementId: "combo_master",
  name: "Combo Master",
  description: "Create a 10+ combo in a single move",
  requirement: {
    type: "combo_milestone",
    targetCombo: 10
  },
  rewards: {
    xp: 300,
    points: 500
  },
  category: "skill",
  rarity: "rare",
  stats: {
    totalEarned: 8500,
    percentageOfPlayers: 6
  }
});
```

---

## 12. USER_ACHIEVEMENTS COLLECTION

```javascript
db.user_achievements.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439610"),
  userAccountId: ObjectId("809f1f77bcf86cd799439011"),
  achievementId: ObjectId("809f1f77bcf86cd799439601"),
  
  achievementSlug: "world_1_complete",
  
  // Earning Details
  earnedAt: ISODate("2024-01-12T10:30:45Z"),
  earnedInLevel: ObjectId("809f1f77bcf86cd799439105"),
  
  // Progress
  progress: {
    current: 100,
    target: 100,
    completionPercentage: 100,
    worldsCompleted: 1
  },
  
  notified: true,
  notifiedAt: ISODate("2024-01-12T10:31:00Z")
});

// Indexes
db.user_achievements.createIndex({ userAccountId: 1 });
db.user_achievements.createIndex({ userAccountId: 1, achievementId: 1 }, { unique: true });
```

---

## 13. LEADERBOARDS COLLECTION

```javascript
db.leaderboards.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439700"),
  userAccountId: ObjectId("809f1f77bcf86cd799439011"),
  
  // Leaderboard Type
  boardType: "global", // 'global', 'by_world', 'by_level', 'stars'
  period: "all_time",
  worldNumber: null, // null for global
  levelNumber: null,
  
  // Ranking
  rank: 1245,
  
  // Score Metrics
  metrics: {
    totalStars: 28,
    totalMapPieces: 24,
    totalOrbs: 12,
    worldsCompleted: 1,
    totalScore: 85000,
    averageScorePerLevel: 7100
  },
  
  // User Snapshot
  userSnapshot: {
    displayName: "Dragon Slayer",
    avatar: "https://cdn.example.com/avatars/809f1f77bcf86cd799439011.png"
  },
  
  // Calculation Info
  calculatedAt: ISODate("2024-01-20T00:00:00Z"),
  
  previousRank: 1350,
  rankChange: 105 // Moved up 105 positions
});

// World-specific Leaderboard
db.leaderboards.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439701"),
  userAccountId: ObjectId("809f1f77bcf86cd799439011"),
  boardType: "by_world",
  worldNumber: 1,
  rank: 342,
  metrics: {
    totalStars: 32, // Out of 36 for world 1
    totalMapPieces: 12,
    averageScore: 8500
  },
  userSnapshot: {
    displayName: "Dragon Slayer"
  },
  calculatedAt: ISODate("2024-01-20T00:00:00Z")
});

// Indexes
db.leaderboards.createIndex({ boardType: 1, period: 1, rank: 1 });
db.leaderboards.createIndex({ userAccountId: 1, boardType: 1, "worldNumber": 1 }, { unique: true });
```

---

## 14. ORB_TYPES COLLECTION

```javascript
db.orb_types.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439800"),
  
  name: "Red Orb",
  type: "red",
  element: "fire",
  
  // Visual
  sprite: {
    url: "https://cdn.example.com/orbs/red.png",
    color: "#E74C3C",
    effect: "flame"
  },
  
  // Matching
  matchesWith: ["red"],
  minMatch: 3, // 3 in a row = match
  matchScore: 100,
  
  // Effects
  effects: {
    matchEffect: "burst",
    cascadeBonus: 1.2,
    comboBonus: 50 // per additional combo
  },
  
  // Frequency
  dropRate: 0.2, // 20% spawn rate
  
  // Power-ups
  canBePartOfCombo: true,
  canCreateCascade: true
});

// Sample: Special Orb
db.orb_types.insertOne({
  _id: ObjectId("809f1f77bcf86cd799439801"),
  name: "Mystical Orb",
  type: "mystical",
  element: "universal",
  rarity: "rare",
  
  // Matching
  matchesWithAny: true, // Matches any color
  matchScore: 250,
  
  effects: {
    specialEffect: "rainbow_explosion",
    cascadeBonus: 2.0,
    clearRadius: 3 // Clears 3 cells around
  },
  
  dropRate: 0.02 // 2% spawn rate (rare)
});
```

---

## COLLECTION HIERARCHY

```
┌─────────────────────────────────────────────────────┐
│         AUTHENTICATION LAYER                        │
├─────────────────────────────────────────────────────┤
│  users_account → auth_sessions → login_history     │
└────────────────┬────────────────────────────────────┘
                 │ userAccountId (FK)
    ┌────────────▼────────────────────────────────────┐
    │        GAME DATA LAYER                          │
    ├──────────┬──────────┬──────────┬───────────────┤
    │ user_    │ user_    │ world_   │ boss_battles  │
    │ profile  │ stats    │ progress │               │
    │          │          │          │ level_        │
    │ level_   │ game_    │ level_   │ progress      │
    │ progress │ sessions │ stats    │               │
    └──────────┴──────────┴──────────┴───────────────┘
                │ All reference userAccountId
    ┌───────────▼──────────────────────────────────┐
    │    GAME CONTENT LAYER                        │
    ├──────────┬──────────┬──────────┬────────────┤
    │ worlds   │ levels   │ map_     │ orb_types  │
    │          │          │ pieces   │            │
    └──────────┴──────────┴──────────┴────────────┘
    
    ┌────────────────────────────────────────────┐
    │    PROGRESSION & REWARDS                   │
    ├──────────┬──────────┬──────────────────────┤
    │achieve   │ user_    │ leaderboards         │
    │ments    │achieve   │                      │
    └──────────┴──────────┴──────────────────────┘
```

---

## API ENDPOINTS

### Level & World
```
GET    /worlds                         // Get all worlds
GET    /worlds/:worldNumber             // Get world details
GET    /worlds/:worldNumber/levels      // Get levels in world

GET    /levels/:levelNumber             // Get level details
GET    /levels/:levelNumber/stats       // Level statistics
GET    /levels/:levelNumber/best-run    // Best run on level

POST   /levels/:levelNumber/start       // Start a level
POST   /levels/:levelNumber/submit      // Submit level result
GET    /levels/:levelNumber/attempts    // Past attempts
```

### Progress & Stats
```
GET    /users/progress                  // Overall progress
GET    /users/world-progress/:world     // Progress in world
GET    /users/level-progress/:level     // Progress on level
GET    /users/statistics                // User statistics

GET    /map-pieces/collected            // Collected map pieces
GET    /map-pieces/world/:world         // Map pieces in world
```

### Boss & Combat
```
GET    /bosses/:world                   // Get boss for world
POST   /bosses/:world/start              // Start boss battle
POST   /bosses/:world/submit             // Submit boss battle result
```

### Leaderboards
```
GET    /leaderboards/global             // Global leaderboard
GET    /leaderboards/stars              // By total stars
GET    /leaderboards/world/:world       // By world
GET    /leaderboards/level/:level       // By level high scores
```

---

## KEY DESIGN FEATURES

1. **Story-Driven Progression** - Narrative across worlds, unlocking through completion
2. **Star Rating System** - 1-3 stars based on performance (perfect = collect all)
3. **Map Piece Collection** - Collectibles that unlock boss levels
4. **Mystical Orbs** - Special collectibles with rarity/difficulty
5. **World Structure** - 3 worlds with 12 levels each = 36 total levels
6. **Boss Battles** - Completion of world leads to boss encounter
7. **Combo System** - Rewards for creating matches of 3+ orbs
8. **Cascade Mechanics** - Falling orbs create new matches for combos
9. **Detailed Analytics** - Track every move, combo, and collectible
10. **Achievement System** - World completion, perfect runs, combo milestones

