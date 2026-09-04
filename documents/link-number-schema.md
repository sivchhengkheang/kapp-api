# Link Number Game - NoSQL Schema Design

## Game Overview
- **Type**: Number link puzzle game (Flow Free style)
- **Mechanic**: Connect matching numbered pairs with paths without crossing
- **Core Feature**: Solve grid-based puzzles by creating non-intersecting paths
- **Progression**: Increasing difficulty levels with larger grids
- **Win Condition**: Connect all number pairs AND fill entire board with paths
- **Replayability**: Multiple puzzle configurations, star ratings, speed challenges
- **Educational Focus**: Logic, spatial reasoning, constraint satisfaction

---

## 1. USERS_ACCOUNT COLLECTION (Authentication)

```javascript
db.users_account.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439011"),
  
  // Authentication
  email: "puzzler@example.com",
  username: "link_master",
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
  
  // Game Progress
  gameProgress: {
    currentLevel: 24,
    currentDifficulty: "medium", // 'easy', 'medium', 'hard', 'expert'
    totalLevelsCompleted: 23
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
  _id: ObjectId("a10f1f77bcf86cd799439012"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  
  // Display Information
  displayName: "Link Master",
  bio: "Solving number puzzles one path at a time",
  avatar: {
    url: "https://cdn.example.com/avatars/a10f1f77bcf86cd799439011.png",
    uploadedAt: ISODate("2024-01-15T10:30:45Z")
  },
  
  // Preferences
  preferences: {
    language: "en",
    theme: "light", // 'light', 'dark'
    soundEnabled: true,
    musicEnabled: true,
    animationsEnabled: true,
    showHints: true,
    gridSize: "medium" // UI preference
  },
  
  // Privacy
  privacy: {
    profilePublic: true,
    showOnLeaderboard: true,
    allowFriendRequests: true
  },
  
  // Quick Stats (Cached)
  stats: {
    totalLevelsCompleted: 23,
    totalStars: 68, // Out of max (3 per level × 23)
    totalPuzzlesSolved: 23,
    currentStreak: 8, // Days
    bestTime: 45, // seconds on any level
    lastPlayedAt: ISODate("2024-01-20T14:22:10Z")
  },
  
  // Badges
  badges: {
    customTitle: "Master Solver",
    recentAchievements: ["speed_demon", "no_mistakes"],
    totalBadges: 12
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_profile.createIndex({ userAccountId: 1 }, { unique: true });
db.user_profile.createIndex({ "stats.totalStars": -1 });
```

---

## 3. USER_STATISTICS COLLECTION

```javascript
db.user_statistics.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439013"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  
  // Progression
  progression: {
    currentLevel: 24,
    currentDifficulty: "medium",
    totalLevelsStarted: 35,
    totalLevelsCompleted: 23,
    totalLevelsFailed: 0,
    totalLevelsAbandoned: 12,
    totalLevelsAttempted: 23 // Attempts until completion
  },
  
  // XP & Points
  xp: {
    current: 5400,
    totalEarned: 18500,
    level: 12,
    nextLevelRequires: 6000
  },
  
  // Star System (3 stars max per level)
  stars: {
    totalStarsEarned: 68,
    maxPossibleStars: 69, // 3 × 23 completed levels
    starDistribution: {
      oneStarLevels: 5,
      twoStarLevels: 10,
      threeStarLevels: 8
    },
    perfectLevels: 8 // Levels with 3 stars
  },
  
  // Puzzle Solving Metrics
  puzzleMetrics: {
    // Path Creation
    totalPathsCreated: 500,
    validPathsCreated: 495,
    invalidPathsAttempted: 5,
    
    // Efficiency
    averageMovesToSolve: 45, // Total moves across all attempts
    averageTimesToSolve: 85, // seconds
    fastestSolveTime: 32,
    slowestSolveTime: 280,
    
    // Accuracy
    firstTrySolveRate: 34.8, // % solved on first attempt
    averageAttemptsPerPuzzle: 1.8,
    zeroMistakeRate: 42.1, // % solved without mistakes
    
    // Grid Mastery
    gridSizePerformance: {
      "3x3": { completed: 5, avgTime: 45, accuracy: 95 },
      "4x4": { completed: 8, avgTime: 78, accuracy: 92 },
      "5x5": { completed: 10, avgTime: 125, accuracy: 88 }
    }
  },
  
  // Difficulty Performance
  byDifficulty: {
    easy: { completed: 10, avgTime: 60, avgStars: 2.8 },
    medium: { completed: 13, avgTime: 95, avgStars: 2.6 }
  },
  
  // Strategy Analytics
  strategyUsed: {
    randomPath: 15, // % of attempts
    strategicPath: 75,
    hintUsed: 18,
    undoUsed: 42,
    restartUsed: 8
  },
  
  // Time Analytics
  playingPatterns: {
    totalSessionsPlayed: 34,
    averageSessionDuration: 18, // minutes
    longestSessionDuration: 65,
    totalPlayTimeMinutes: 612,
    averageDailyPlayMinutes: 15,
    preferredPlayTime: "evening", // 'morning', 'afternoon', 'evening'
    sessionStreak: {
      currentDays: 8,
      longestDays: 21
    }
  },
  
  // Achievements
  achievements: {
    total: 12,
    badges: [
      {
        id: "first_solve",
        name: "First Solver",
        earnedAt: ISODate("2023-06-16T...")
      },
      {
        id: "speed_demon",
        name: "Speed Demon",
        progress: 90,
        target: 100
      }
    ]
  },
  
  // Learning Insights
  improvements: {
    avgTimeTrend: "improving", // 'declining', 'stable', 'improving'
    accuracyTrend: "stable",
    speedImprovement: 35, // % faster than first attempt
    consistencyScore: 0.82 // 0-1
  },
  
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_statistics.createIndex({ userAccountId: 1 }, { unique: true });
db.user_statistics.createIndex({ "progression.currentLevel": -1 });
db.user_statistics.createIndex({ "stars.totalStarsEarned": -1 });
```

---

## 4. PUZZLE_BOARDS COLLECTION (Level Definitions)

```javascript
db.puzzle_boards.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439100"),
  
  // Board Identity
  boardNumber: 24,
  title: "Strategic Links",
  description: "A challenging puzzle requiring careful path planning",
  
  // Difficulty & Category
  difficulty: "medium", // 'easy', 'medium', 'hard', 'expert'
  gridSize: "5x5",
  category: "standard", // 'standard', 'daily', 'weekly', 'special'
  
  // Grid Configuration
  grid: {
    width: 5,
    height: 5,
    totalCells: 25,
    
    // Number Positions (the pairs to connect)
    numberPairs: [
      {
        id: "pair_1",
        number: 1,
        positions: [
          { x: 0, y: 0 }, // First occurrence of 1
          { x: 4, y: 4 }  // Second occurrence of 1
        ]
      },
      {
        id: "pair_2",
        number: 2,
        positions: [
          { x: 0, y: 2 },
          { x: 3, y: 3 }
        ]
      },
      {
        id: "pair_3",
        number: 3,
        positions: [
          { x: 1, y: 0 },
          { x: 4, y: 1 }
        ]
      },
      {
        id: "pair_4",
        number: 4,
        positions: [
          { x: 2, y: 1 },
          { x: 1, y: 3 }
        ]
      },
      {
        id: "pair_5",
        number: 5,
        positions: [
          { x: 4, y: 0 },
          { x: 0, y: 4 }
        ]
      }
    ],
    
    // Total number pairs to connect
    totalPairs: 5
  },
  
  // Constraints & Rules
  constraints: {
    pathsCannotCross: true,
    mustFillAllCells: true, // Must use every cell
    eachCellUsedOnce: true,
    perfectSolution: {
      pathsRequired: 5,
      totalCellsCovered: 25,
      optimalMoveCount: 45
    }
  },
  
  // Solution
  solution: {
    paths: [
      {
        pairId: "pair_1",
        number: 1,
        path: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
          { x: 4, y: 0 },
          { x: 4, y: 1 },
          { x: 4, y: 2 },
          { x: 4, y: 3 },
          { x: 4, y: 4 }
        ]
      }
      // ... more paths
    ],
    totalMovesOptimal: 45,
    isUnique: true,
    solvableSteps: 5 // Minimum steps to solve
  },
  
  // Hints System
  hints: [
    {
      id: "hint_1",
      level: 1, // Progressive hints
      text: "Start with the numbers in the corners",
      revealAfterTime: 120, // seconds
      revealAfterAttempts: 3
    },
    {
      id: "hint_2",
      level: 2,
      text: "Number 3 should connect diagonally across",
      revealAfterAttempts: 5
    }
  ],
  
  // Scoring & Rewards
  rewards: {
    baseXP: 200,
    xpForPerfect: 500,
    xpForSpeed: 100, // If completed quickly
    
    // Star-based rewards
    stars: {
      oneStar: {
        minTime: 300, // seconds
        allowMistakes: true,
        xpBonus: 100
      },
      twoStars: {
        minTime: 180,
        maxMistakes: 3,
        xpBonus: 200
      },
      threeStars: {
        minTime: 120,
        maxMistakes: 0, // Perfect
        xpBonus: 300
      }
    }
  },
  
  // Game Difficulty Metrics
  difficultyMetrics: {
    branchingFactor: 4.2, // Complexity of solution space
    minPathLength: 8,
    maxPathLength: 12,
    averagePathLength: 9,
    symmetry: "low", // 'none', 'low', 'medium', 'high'
    deductionDifficulty: "medium" // How much logical deduction needed
  },
  
  // Statistics
  stats: {
    totalAttempts: 8500,
    totalCompletions: 6200,
    completionRate: 72.9,
    averageTime: 92,
    averageAttemptsPerCompletion: 1.9,
    perfectRuns: 850,
    abandonmentRate: 12.5,
    averageStarsEarned: 2.2
  },
  
  // Visual Theme
  theme: {
    backgroundColor: "#F8F9FA",
    lineColor: "#3B82F6",
    numberColor: "#1F2937",
    gridLineColor: "#E5E7EB",
    successColor: "#10B981",
    errorColor: "#EF4444"
  },
  
  // Accessibility
  accessibility: {
    colorblindFriendly: true,
    highContrast: true,
    largeNumbers: false,
    voiceInstructions: false
  },
  
  status: {
    isPublished: true,
    isArchived: false,
    isBeta: false,
    isFeatureLevel: false
  },
  
  createdAt: ISODate("2023-08-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-15T10:30:45Z")
});

// Indexes
db.puzzle_boards.createIndex({ boardNumber: 1 }, { unique: true });
db.puzzle_boards.createIndex({ difficulty: 1 });
db.puzzle_boards.createIndex({ gridSize: 1 });
db.puzzle_boards.createIndex({ category: 1 });
db.puzzle_boards.createIndex({ "stats.completionRate": -1 });
```

---

## 5. GAME_SESSIONS COLLECTION

```javascript
db.game_sessions.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439200"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  
  // Puzzle Info
  boardId: ObjectId("a10f1f77bcf86cd799439100"),
  boardNumber: 24,
  difficulty: "medium",
  gridSize: "5x5",
  
  // Timing
  timing: {
    startedAt: ISODate("2024-01-20T14:22:10Z"),
    endedAt: ISODate("2024-01-20T14:24:15Z"),
    durationSeconds: 125,
    activePlayTimeSeconds: 115,
    pausedSeconds: 10
  },
  
  // Game Result
  result: {
    status: "completed", // 'completed', 'quit', 'failed', 'paused'
    puzzleSolved: true,
    boardFilled: true, // All 25 cells covered
    
    // Accuracy
    mistakesMade: 0,
    unvalidMovesAttempted: 2,
    firstTryComplete: true,
    
    // Performance
    starRating: 3, // 1, 2, or 3 stars
    score: 2150,
    baseScore: 1500,
    timeBonus: 300,
    perfectBonus: 350
  },
  
  // Move History (Detailed)
  moveHistory: [
    {
      moveNumber: 1,
      timestamp: 3.2,
      action: "draw_path",
      pairId: "pair_1",
      number: 1,
      pathSegments: [
        { x: 0, y: 0, x_to: 1, y_to: 0 },
        { x: 1, y: 0, x_to: 2, y_to: 0 }
      ],
      cellsCovered: 3,
      isValid: true,
      pathLength: 9
    },
    {
      moveNumber: 2,
      timestamp: 8.5,
      action: "draw_path",
      pairId: "pair_2",
      number: 2,
      pathSegments: [
        { x: 0, y: 2, x_to: 1, y_to: 2 }
      ],
      cellsCovered: 2,
      isValid: true,
      pathLength: 6
    },
    {
      moveNumber: 3,
      timestamp: 15.3,
      action: "undo",
      undoType: "last_move",
      reason: "user_error"
    },
    {
      moveNumber: 4,
      timestamp: 18.2,
      action: "hint_used",
      hintLevel: 1,
      hintText: "Start with the numbers in the corners"
    }
    // ... more moves
  ],
  
  // Path Details
  paths: [
    {
      pathId: "path_1",
      pairId: "pair_1",
      number: 1,
      cellsCovered: 9,
      cellsList: [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        // ... all 9 cells
      ],
      isCorrect: true,
      crossesAnotherPath: false,
      completionTime: 5.2 // seconds
    },
    // ... other paths
  ],
  
  // User Actions
  userActions: {
    totalMoves: 23,
    pathsDrawn: 5,
    pathsCleared: 2,
    pathsUndone: 1,
    hintsUsed: 1,
    hintLevelsRevealed: 1,
    undoCount: 3,
    restartCount: 0
  },
  
  // Analytics
  analytics: {
    playStyle: "strategic", // 'random', 'systematic', 'strategic'
    problemSolving: "methodical",
    hesitationPoints: 2, // Times player paused
    errorDetection: "immediate", // How quickly errors detected
    engagementScore: 0.92,
    focusLevel: "high"
  },
  
  // Device Info
  device: {
    type: "desktop",
    os: "Windows 10",
    browser: "Chrome",
    screenSize: "1920x1080"
  },
  
  createdAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.game_sessions.createIndex({ userAccountId: 1 });
db.game_sessions.createIndex({ userAccountId: 1, "createdAt": -1 });
db.game_sessions.createIndex({ boardId: 1 });
db.game_sessions.createIndex({ "result.status": 1 });
```

---

## 6. BOARD_PROGRESS COLLECTION

```javascript
db.board_progress.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439210"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  boardId: ObjectId("a10f1f77bcf86cd799439100"),
  
  boardNumber: 24,
  difficulty: "medium",
  
  // Progress Status
  status: "completed", // 'locked', 'unlocked', 'in_progress', 'completed'
  unlockedAt: ISODate("2024-01-15T..."),
  firstAttemptAt: ISODate("2024-01-18T..."),
  completedAt: ISODate("2024-01-20T14:24:15Z"),
  
  // Star Information
  currentStars: 3,
  maxStars: 3,
  threeStarRequirement: {
    maxTime: 120,
    maxMistakes: 0,
    boardFilled: true
  },
  
  // Attempts Tracking
  totalAttempts: 1,
  attempts: [
    {
      attemptNumber: 1,
      status: "completed",
      starRating: 3,
      score: 2150,
      time: 125,
      mistakes: 0,
      attemptedAt: ISODate("2024-01-20T...")
    }
  ],
  
  // Best Performance
  bestAttempt: {
    attemptNumber: 1,
    score: 2150,
    stars: 3,
    time: 125,
    mistakes: 0
  },
  
  // Performance Trend
  performanceTrend: {
    initialTime: 125,
    currentBestTime: 125,
    improvementPercent: 0,
    initialScore: 2150,
    currentBestScore: 2150,
    consistency: "perfect"
  },
  
  // Rewards Claimed
  rewardsClaimed: {
    xp: 800,
    points: 250,
    firstCompletionBonus: true,
    starBonuses: {
      oneStar: true,
      twoStar: true,
      threeStar: true
    }
  }
});

// Indexes
db.board_progress.createIndex({ userAccountId: 1, boardId: 1 }, { unique: true });
db.board_progress.createIndex({ userAccountId: 1, "status": 1 });
db.board_progress.createIndex({ userAccountId: 1, boardNumber: 1 });
```

---

## 7. DIFFICULTY_PROGRESSION COLLECTION

```javascript
db.difficulty_progression.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439300"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  
  // Current Difficulty Tier
  currentDifficulty: "medium",
  currentLevel: 24,
  
  // Difficulty Progress
  difficultyTiers: [
    {
      tierName: "easy",
      completed: true,
      boardsCompleted: 10,
      boardsTotal: 10,
      unlockedAt: ISODate("2023-06-15T..."),
      completedAt: ISODate("2023-07-01T..."),
      averageStars: 2.9,
      averageTime: 60
    },
    {
      tierName: "medium",
      completed: false,
      boardsCompleted: 13,
      boardsTotal: 25,
      unlockedAt: ISODate("2023-07-02T..."),
      averageStars: 2.6,
      averageTime: 95,
      currentProgress: 52
    },
    {
      tierName: "hard",
      completed: false,
      boardsCompleted: 0,
      boardsTotal: 30,
      unlockedAt: null, // Not unlocked yet
      requirement: "Complete 20 medium puzzles"
    }
  ],
  
  // Unlocking Requirements
  unlockProgress: {
    nextTier: "hard",
    requirement: 20,
    currentProgress: 13,
    percentComplete: 65
  },
  
  // Mastery Metrics
  mastery: {
    easy_avg_time: 60,
    easy_perfect_rate: 95,
    medium_avg_time: 95,
    medium_perfect_rate: 42,
    readyForHard: false
  }
});

// Indexes
db.difficulty_progression.createIndex({ userAccountId: 1 }, { unique: true });
db.difficulty_progression.createIndex({ currentDifficulty: 1 });
```

---

## 8. ACHIEVEMENTS COLLECTION

```javascript
db.achievements.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439400"),
  
  achievementId: "perfect_solver",
  name: "Perfect Solver",
  description: "Complete any puzzle with zero mistakes and bonus time",
  
  icon: {
    url: "https://cdn.example.com/achievements/perfect-solver.png",
    rarity: "rare"
  },
  
  // Requirements
  requirement: {
    type: "perfect_completion",
    mistakes: 0,
    timeBonus: true,
    boardsFilled: true
  },
  
  // Rewards
  rewards: {
    xp: 500,
    points: 1000
  },
  
  // Metadata
  category: "skill", // 'skill', 'speed', 'consistency', 'exploration'
  rarity: "rare",
  
  // Stats
  stats: {
    totalEarned: 5200,
    percentageOfPlayers: 23
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample: Speed Achievement
db.achievements.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439401"),
  achievementId: "speed_demon",
  name: "Speed Demon",
  description: "Solve a puzzle in under 60 seconds",
  requirement: {
    type: "speed_milestone",
    maxTime: 60
  },
  rewards: {
    xp: 300,
    points: 500
  },
  category: "speed",
  rarity: "common",
  stats: {
    totalEarned: 28500,
    percentageOfPlayers: 65
  }
});

// Sample: Completion Achievement
db.achievements.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439402"),
  achievementId: "all_easy_complete",
  name: "Easy Tier Master",
  description: "Complete all easy difficulty puzzles",
  requirement: {
    type: "difficulty_completion",
    difficulty: "easy",
    targetBoardsCompleted: 10
  },
  rewards: {
    xp: 1000,
    points: 2000,
    unlocksContent: true
  },
  category: "exploration",
  rarity: "uncommon",
  stats: {
    totalEarned: 18000,
    percentageOfPlayers: 42
  }
});

// Sample: Mastery Achievement
db.achievements.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439403"),
  achievementId: "no_mistakes_master",
  name: "Flawless",
  description: "Solve 5 consecutive puzzles without any mistakes",
  requirement: {
    type: "streak",
    mistakes: 0,
    consecutive: 5,
    scope: "any"
  },
  rewards: {
    xp: 600,
    points: 1200
  },
  category: "skill",
  rarity: "rare",
  stats: {
    totalEarned: 8200,
    percentageOfPlayers: 18
  }
});

// Indexes
db.achievements.createIndex({ achievementId: 1 }, { unique: true });
db.achievements.createIndex({ category: 1 });
db.achievements.createIndex({ rarity: 1 });
```

---

## 9. USER_ACHIEVEMENTS COLLECTION

```javascript
db.user_achievements.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439410"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  achievementId: ObjectId("a10f1f77bcf86cd799439401"),
  
  achievementSlug: "speed_demon",
  
  // Earning Details
  earnedAt: ISODate("2024-01-18T10:30:45Z"),
  earnedInBoard: ObjectId("a10f1f77bcf86cd799439100"),
  
  // Progress for multi-step achievements
  progress: {
    current: 100,
    target: 100,
    completionPercentage: 100,
    fastestTime: 47
  },
  
  notified: true,
  notifiedAt: ISODate("2024-01-18T10:31:00Z")
});

// Indexes
db.user_achievements.createIndex({ userAccountId: 1 });
db.user_achievements.createIndex({ userAccountId: 1, achievementId: 1 }, { unique: true });
```

---

## 10. LEADERBOARDS COLLECTION

```javascript
db.leaderboards.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439500"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  
  // Leaderboard Type
  boardType: "global", // 'global', 'by_difficulty', 'speed', 'accuracy', 'weekly'
  period: "all_time",
  difficulty: null, // null for global
  
  // Ranking
  rank: 285,
  
  // Score Metrics
  metrics: {
    totalScore: 42500,
    totalStars: 68,
    totalBoardsCompleted: 23,
    averageTime: 92,
    averageStars: 2.96,
    perfectBoardCount: 8,
    perfectRate: 34.8
  },
  
  // User Snapshot
  userSnapshot: {
    displayName: "Link Master",
    avatar: "https://cdn.example.com/avatars/a10f1f77bcf86cd799439011.png"
  },
  
  // Calculation Info
  calculatedAt: ISODate("2024-01-20T00:00:00Z"),
  previousRank: 320,
  rankChange: 35 // Moved up 35 positions
});

// Speed Leaderboard
db.leaderboards.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439501"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  boardType: "speed",
  period: "weekly",
  rank: 45,
  metrics: {
    averageTime: 92,
    fastestTime: 32,
    speedRank: "advanced"
  },
  userSnapshot: {
    displayName: "Link Master"
  },
  calculatedAt: ISODate("2024-01-20T00:00:00Z")
});

// Accuracy Leaderboard
db.leaderboards.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439502"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  boardType: "accuracy",
  period: "all_time",
  rank: 128,
  metrics: {
    perfectRate: 34.8,
    perfectBoardCount: 8,
    accuracyRank: "excellent"
  },
  userSnapshot: {
    displayName: "Link Master"
  },
  calculatedAt: ISODate("2024-01-20T00:00:00Z")
});

// Difficulty-Specific Leaderboard
db.leaderboards.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439503"),
  userAccountId: ObjectId("a10f1f77bcf86cd799439011"),
  boardType: "by_difficulty",
  period: "all_time",
  difficulty: "medium",
  rank: 142,
  metrics: {
    score: 28500,
    boardsCompleted: 13,
    averageTime: 95,
    averageStars: 2.6
  },
  userSnapshot: {
    displayName: "Link Master"
  },
  calculatedAt: ISODate("2024-01-20T00:00:00Z")
});

// Indexes
db.leaderboards.createIndex({ boardType: 1, period: 1, rank: 1 });
db.leaderboards.createIndex({ userAccountId: 1, boardType: 1, difficulty: 1 }, { unique: true });
```

---

## 11. DAILY_CHALLENGES COLLECTION

```javascript
db.daily_challenges.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439600"),
  
  // Challenge Identity
  date: ISODate("2024-01-20T00:00:00Z"),
  challengeNumber: 547,
  title: "Link Master Challenge",
  
  // Puzzle Details
  puzzle: {
    boardId: ObjectId("a10f1f77bcf86cd799439100"),
    gridSize: "5x5",
    difficulty: "medium"
  },
  
  // Challenge Rules
  rules: {
    singleAttemptPerDay: true, // One chance per day
    timeLimit: 180, // seconds
    mistakePenalty: -50 // Points
  },
  
  // Rewards
  rewards: {
    baseXP: 300,
    basePoints: 500,
    bonusForPerfect: 500,
    bonusForSpeed: 200
  },
  
  // Leaderboard
  dailyLeaderboard: {
    topScores: [
      {
        rank: 1,
        userAccountId: ObjectId("..."),
        displayName: "Link Master",
        score: 1200,
        time: 45,
        completedAt: ISODate("2024-01-20T08:30:00Z")
      }
      // ... more entries
    ]
  },
  
  // Statistics
  stats: {
    totalAttempts: 12500,
    totalCompletions: 9200,
    completionRate: 73.6,
    averageTime: 95,
    averageScore: 850
  }
});

// Indexes
db.daily_challenges.createIndex({ date: 1 }, { unique: true });
db.daily_challenges.createIndex({ challengeNumber: -1 });
```

---

## 12. BOARD_GENERATION_TEMPLATE COLLECTION

```javascript
db.board_generation_template.insertOne({
  _id: ObjectId("a10f1f77bcf86cd799439700"),
  
  templateId: "5x5_medium",
  gridSize: "5x5",
  difficulty: "medium",
  
  // Generation Parameters
  parameters: {
    gridWidth: 5,
    gridHeight: 5,
    numberPairs: 5, // How many number pairs
    pairPositioning: "random", // 'random', 'edge_focus', 'distributed'
    pathComplexity: "medium", // How many crossing paths to avoid
    symmetry: false,
    minPathLength: 8,
    maxPathLength: 12
  },
  
  // Difficulty Metrics
  metrics: {
    branchingFactor: "medium", // Solution space complexity
    deductionRequired: "medium",
    backtrackingNeeded: false,
    numSolutions: 1 // Is solution unique
  },
  
  // Validation Rules
  validation: {
    mustHaveUniqueSolution: true,
    minSpaceRequiredPerPath: 8,
    maxIntersectionPoints: 0 // Paths must not cross
  },
  
  // Statistics
  stats: {
    averageCompletionRate: 72.9,
    averageTime: 92,
    averageStars: 2.2,
    totalGenerated: 500
  }
});

// Indexes
db.board_generation_template.createIndex({ templateId: 1 }, { unique: true });
db.board_generation_template.createIndex({ difficulty: 1 });
```

---

## COLLECTION HIERARCHY

```
┌─────────────────────────────────────────────────────┐
│         AUTHENTICATION LAYER                        │
├─────────────────────────────────────────────────────┤
│  users_account                                      │
│  ├── auth_sessions (1:N)                            │
│  └── login_history (1:N)                            │
└────────────────┬────────────────────────────────────┘
                 │ userAccountId (FK)
    ┌────────────▼────────────────────────────────────┐
    │        GAME DATA LAYER                          │
    ├───────────┬────────────┬────────────┬──────────┤
    │ user_     │ user_      │ board_     │ game_    │
    │ profile   │ statistics │ progress   │ sessions │
    │           │            │            │          │
    │ difficulty                          │ board_   │
    │ _progre   │ daily_challenges        │ progress │
    │ ssion     │                         │          │
    └───────────┴────────────┴────────────┴──────────┘
                │ All reference userAccountId
    ┌───────────▼──────────────────────────────────┐
    │    GAME CONTENT LAYER                        │
    ├──────────┬──────────┬────────────────────────┤
    │ puzzle_  │ board_   │ board_generation_      │
    │ boards   │ stats    │ template               │
    └──────────┴──────────┴────────────────────────┘
    
    ┌────────────────────────────────────────────┐
    │    PROGRESSION & REWARDS                   │
    ├──────────┬──────────┬──────────────────────┤
    │achieve   │ user_    │ leaderboards         │
    │ments    │achieve   │                      │
    └──────────┴──────────┴──────────────────────┘
```

---

## API ENDPOINTS

### Puzzle Boards
```
GET    /puzzles                         // Get available puzzles
GET    /puzzles/:boardNumber            // Get specific puzzle
GET    /puzzles/:boardNumber/stats      // Puzzle statistics
GET    /puzzles/difficulty/:difficulty // By difficulty

POST   /puzzles/:boardNumber/start      // Start puzzle
POST   /puzzles/:boardNumber/submit     // Submit solution
GET    /puzzles/:boardNumber/attempts   // Past attempts
```

### Progress & Stats
```
GET    /users/progress                  // Overall progress
GET    /users/difficulty-progress       // Difficulty tier progress
GET    /users/statistics                // User statistics
GET    /users/board-progress/:boardId   // Progress on specific board

GET    /users/streaks                   // Current streaks
GET    /users/performance-trends        // Performance analysis
```

### Daily Challenge
```
GET    /daily-challenge                 // Today's challenge
GET    /daily-challenge/leaderboard     // Today's leaderboard
POST   /daily-challenge/submit          // Submit daily challenge
GET    /daily-challenge/history         // Past challenges
```

### Achievements
```
GET    /achievements                    // All achievements
GET    /users/achievements              // User achievements
GET    /users/achievements/progress     // In-progress achievements
```

### Leaderboards
```
GET    /leaderboards/global             // Global leaderboard
GET    /leaderboards/speed              // Speed ranking
GET    /leaderboards/accuracy           // Accuracy ranking
GET    /leaderboards/difficulty/:diff   // By difficulty
GET    /leaderboards/daily              // Daily challenge top scores
```

---

## KEY DESIGN FEATURES

1. **Path-Based Puzzle Solving** - Connect number pairs without crossing paths
2. **Grid-Based Gameplay** - Multiple grid sizes (3x3 to 6x6+)
3. **Constraint Satisfaction** - Non-crossing paths, full board coverage
4. **Difficulty Progression** - Easy → Medium → Hard → Expert tiers
5. **Detailed Analytics** - Track every move, path, and decision
6. **Unique Solutions** - Each puzzle has one optimal solution
7. **Star Rating System** - Based on time and accuracy
8. **Daily Challenges** - One unique puzzle per day
9. **Hint System** - Progressive hints revealed over time/attempts
10. **Performance Metrics** - Time, accuracy, strategy analysis
11. **Streak Tracking** - Daily and weekly play streaks
12. **Speed/Accuracy Leaderboards** - Multiple ranking types
13. **Achievement Badges** - Skill, speed, completion, consistency
14. **Puzzle Generation** - Templated board generation system

