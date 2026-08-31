# Robot Brainiac - NoSQL Schema Design

## Game Overview
- **Type**: Robot movement puzzle game
- **Mechanic**: Command robot to navigate obstacles and reach goals
- **Core Feature**: Plan command sequences (forward, turn left/right, actions)
- **Progression**: Level-based with increasing difficulty
- **Win Condition**: Robot reaches goal position while avoiding obstacles
- **Replayability**: Optimize command sequences for efficiency (fewer moves, faster time)

---

## 1. USERS_ACCOUNT COLLECTION (Authentication)

```javascript
db.users_account.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439011"),
  
  // Authentication
  email: "player@example.com",
  username: "robot_master",
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
  _id: ObjectId("708f1f77bcf86cd799439012"),
  userAccountId: ObjectId("708f1f77bcf86cd799439011"),
  
  // Display Information
  displayName: "Robot Master",
  bio: "Solving robot puzzles one command at a time",
  avatar: {
    url: "https://cdn.example.com/avatars/708f1f77bcf86cd799439011.png",
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
    theme: "dark",
    soundEnabled: true,
    notificationsEnabled: true,
    showGridLines: true,
    showHints: true,
    difficulty: "medium"
  },
  
  // Privacy
  privacy: {
    profilePublic: true,
    showOnLeaderboard: true,
    allowFriendRequests: true
  },
  
  // Quick Stats (Cached)
  stats: {
    currentLevel: 24,
    totalLevelsCompleted: 24,
    currentXP: 48000,
    totalXP: 180000,
    peakEfficiencyRating: 95,
    averageMovesEfficiency: 82,
    lastPlayedAt: ISODate("2024-01-20T14:22:10Z")
  },
  
  // Badges & Status
  badges: {
    customTitle: "Puzzle Master",
    statusMessage: "Perfect 5/5 on last 3 levels!",
    featured: ["master_problem_solver", "speed_demon"]
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_profile.createIndex({ userAccountId: 1 }, { unique: true });
db.user_profile.createIndex({ "stats.currentLevel": -1 });
db.user_profile.createIndex({ "stats.peakEfficiencyRating": -1 });
```

---

## 3. USER_STATISTICS COLLECTION

```javascript
db.user_statistics.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439013"),
  userAccountId: ObjectId("708f1f77bcf86cd799439011"),
  
  // Level Progress
  levelProgress: {
    currentLevel: 24,
    totalLevelsCompleted: 24,
    totalLevelsStarted: 25,
    levelCompletionPercentage: 96
  },
  
  // XP & Progression
  xp: {
    current: 48000,
    totalEarned: 180000,
    level: 15,
    nextLevelRequires: 50000
  },
  
  // Performance Metrics
  performance: {
    totalSessionsPlayed: 245,
    sessionsCompleted: 238,
    sessionsAbandoned: 5,
    sessionsFailed: 2,
    averageAttempts: 1.8, // attempts per level to complete
    totalTimePlayedSeconds: 54000 // ~15 hours
  },
  
  // Efficiency & Optimization
  efficiency: {
    averageMovesPerLevel: 28,
    averageMovesEfficiency: 82, // % of optimal
    peakEfficiencyRating: 95,
    totalOptimalSolutions: 8, // Perfect solutions
    speedRuns: 3 // Completed in < 1 minute
  },
  
  // Streaks & Consistency
  streaks: {
    currentWinStreak: 5,
    longestWinStreak: 23,
    playStreak: {
      currentDays: 7,
      lastPlayDate: ISODate("2024-01-20T..."),
      longestDays: 31
    }
  },
  
  // Problem Type Stats (Different robot types/mechanics)
  problemStats: {
    byRobotType: [
      {
        robotType: "basic_movement",
        levelsCompleted: 8,
        averageMovesNeeded: 18,
        averageEfficiency: 85,
        bestEfficiency: 95
      },
      {
        robotType: "rotation_puzzle",
        levelsCompleted: 6,
        averageMovesNeeded: 24,
        averageEfficiency: 78,
        bestEfficiency: 90
      },
      {
        robotType: "multi_robot",
        levelsCompleted: 4,
        averageMovesNeeded: 42,
        averageEfficiency: 75,
        bestEfficiency: 88
      }
    ],
    byDifficulty: [
      {
        difficulty: "easy",
        levelsCompleted: 5,
        averageAttempts: 1.2,
        averageTime: 45 // seconds
      },
      {
        difficulty: "medium",
        levelsCompleted: 12,
        averageAttempts: 1.8,
        averageTime: 120
      },
      {
        difficulty: "hard",
        levelsCompleted: 5,
        averageAttempts: 3.2,
        averageTime: 300
      },
      {
        difficulty: "expert",
        levelsCompleted: 2,
        averageAttempts: 5.5,
        averageTime: 600
      }
    ]
  },
  
  // Achievements
  achievements: {
    total: 16,
    badges: [
      {
        id: "first_completion",
        name: "First Steps",
        earnedAt: ISODate("2023-06-20T...")
      },
      {
        id: "perfect_run",
        name: "Perfect Run",
        count: 3 // 3 perfect runs
      }
    ]
  },
  
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_statistics.createIndex({ userAccountId: 1 }, { unique: true });
db.user_statistics.createIndex({ "levelProgress.currentLevel": -1 });
db.user_statistics.createIndex({ "efficiency.peakEfficiencyRating": -1 });
```

---

## 4. LEVELS COLLECTION (Puzzle/Level Definitions)

```javascript
db.levels.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439100"),
  
  // Level Identity
  levelNumber: 24,
  title: "The Maze Guardian",
  description: "Navigate the robot through a complex maze while avoiding moving obstacles",
  
  // Difficulty & Progression
  difficulty: "hard", // 'easy', 'medium', 'hard', 'expert'
  category: "maze_navigation",
  recommendedLevel: 20, // Recommended player level to attempt
  
  // Grid Configuration
  grid: {
    width: 12,
    height: 10,
    cellSize: 40 // pixels
  },
  
  // Robot Configuration
  robot: {
    startPosition: { x: 1, y: 1 },
    startDirection: "NORTH", // NORTH, EAST, SOUTH, WEST
    robotType: "standard", // 'standard', 'fast', 'heavy', 'smart'
    properties: {
      canRotate: true,
      canPushObjects: false,
      hasMemory: false, // Advanced feature
      speed: 1 // steps per second
    }
  },
  
  // Goal Configuration
  goal: {
    position: { x: 11, y: 9 },
    type: "reach_point", // 'reach_point', 'collect_all', 'avoid_area', 'push_object'
    objectives: [
      {
        id: "reach_goal",
        type: "reach_position",
        position: { x: 11, y: 9 },
        required: true
      }
    ]
  },
  
  // Obstacles on Grid
  obstacles: [
    {
      id: "wall_1",
      type: "wall", // 'wall', 'moving_wall', 'sensor_triggered'
      positions: [
        { x: 3, y: 2 },
        { x: 3, y: 3 },
        { x: 3, y: 4 }
      ],
      properties: {
        solid: true,
        movable: false,
        damageable: false
      }
    },
    {
      id: "moving_obstacle_1",
      type: "moving_wall",
      startPosition: { x: 5, y: 5 },
      path: [
        { x: 5, y: 5 },
        { x: 5, y: 8 },
        { x: 5, y: 5 }
      ],
      cycleDuration: 8, // seconds for one complete cycle
      properties: {
        solid: true,
        stopsRobot: true,
        damageOnCollision: false
      }
    },
    {
      id: "sensor_wall_1",
      type: "sensor_triggered",
      position: { x: 8, y: 6 },
      triggerCondition: "robot_approaches",
      triggerDistance: 2,
      activatesWall: "wall_temporary_1",
      properties: {
        oneTime: false,
        deactivatesAfter: 5 // seconds
      }
    }
  ],
  
  // Collectibles (Optional)
  collectibles: [
    {
      id: "coin_1",
      type: "star",
      position: { x: 6, y: 5 },
      points: 100,
      bonus: "speed_boost" // collected star grants bonus
    }
  ],
  
  // Solution & Hints
  solution: {
    optimalMoves: 18,
    optimalTime: 25, // seconds if move at normal speed
    optimalSequence: [
      "FORWARD",
      "FORWARD",
      "FORWARD",
      "TURN_RIGHT",
      "FORWARD",
      // ... 13 more commands
    ],
    hints: [
      {
        id: "hint_1",
        level: 1,
        text: "The direct path is blocked. Try going around.",
        revealAfterAttempts: 3
      },
      {
        id: "hint_2",
        level: 2,
        text: "Watch out for the moving obstacle at x=5. Time your movement.",
        revealAfterTime: 60 // seconds
      }
    ],
    allowedMoves: 35, // Maximum moves to solve (can go over but loses points)
    timeLimit: 300 // seconds
  },
  
  // Rewards
  rewards: {
    xpForCompletion: 500,
    xpForOptimal: 750,
    xpForPerfect: 1000,
    pointsForCompletion: 250,
    pointsForSpeed: 100,
    bonusAchievement: "maze_master_milestone_5"
  },
  
  // Metadata
  author: {
    type: "system", // 'system', 'designer', 'user'
    userId: null
  },
  
  // Statistics
  stats: {
    timesAttempted: 2340,
    timesCompleted: 2156,
    completionRate: 92.1,
    averageAttempts: 1.85,
    averageMoves: 25,
    averageTime: 42,
    averageEfficiency: 78,
    bestEfficiency: 100
  },
  
  // Publication Status
  status: {
    isPublished: true,
    isFeatured: true,
    isArchived: false
  },
  
  createdAt: ISODate("2023-08-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-15T10:30:45Z")
});

// Indexes
db.levels.createIndex({ levelNumber: 1 }, { unique: true });
db.levels.createIndex({ difficulty: 1 });
db.levels.createIndex({ recommendedLevel: 1 });
db.levels.createIndex({ category: 1 });
db.levels.createIndex({ "status.isPublished": 1 });
```

---

## 5. GAME_SESSIONS COLLECTION

```javascript
db.game_sessions.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439200"),
  userAccountId: ObjectId("708f1f77bcf86cd799439011"),
  
  // Session Info
  levelId: ObjectId("708f1f77bcf86cd799439100"),
  levelNumber: 24,
  difficulty: "hard",
  
  // Timing
  timing: {
    startedAt: ISODate("2024-01-20T14:22:10Z"),
    endedAt: ISODate("2024-01-20T14:23:35Z"),
    durationSeconds: 85,
    pausedSeconds: 0 // Total time paused
  },
  
  // Performance & Results
  performance: {
    status: "completed", // 'completed', 'quit', 'failed', 'paused'
    goalReached: true,
    
    // Movement Data
    movesExecuted: 21,
    optimalMoves: 18,
    efficiency: 85.7, // (optimal / actual) * 100
    
    // Time Data
    timeToSolve: 85,
    timeOptimal: 25,
    speedRating: 75, // Based on time vs optimal
    
    // Collectibles
    collectiblesCollected: 1,
    collectiblesTotal: 1,
    bonusCollected: "speed_boost"
  },
  
  // Command Sequence Executed
  commandSequence: [
    {
      index: 0,
      command: "FORWARD",
      executed: true,
      result: "success",
      timestamp: 0,
      robotPosition: { x: 1, y: 2 }
    },
    {
      index: 1,
      command: "FORWARD",
      executed: true,
      result: "success",
      timestamp: 1,
      robotPosition: { x: 1, y: 3 }
    },
    {
      index: 2,
      command: "FORWARD",
      executed: true,
      result: "success",
      timestamp: 2,
      robotPosition: { x: 1, y: 4 }
    },
    {
      index: 3,
      command: "TURN_RIGHT",
      executed: true,
      result: "success",
      timestamp: 3,
      robotPosition: { x: 1, y: 4 },
      robotDirection: "EAST"
    }
    // ... more commands
  ],
  
  // Mistakes & Collisions
  mistakes: [
    {
      moveNumber: 15,
      command: "FORWARD",
      result: "collision",
      collisionWith: "moving_obstacle_1",
      attempted: true,
      consequences: "move_blocked"
    }
  ],
  
  // Scoring
  scoring: {
    baseScore: 500, // Completion
    efficiencyBonus: 150, // For using ≤ optimal moves
    speedBonus: 75, // For solving in good time
    collectibleBonus: 100, // For collecting all stars
    perfectBonus: 0, // Would be 500 if perfect
    totalScore: 725
  },
  
  // XP & Rewards
  rewards: {
    xpEarned: 500,
    xpBonus: 150,
    totalXP: 650,
    pointsEarned: 250,
    achievementsUnlocked: [],
    levelUpAchieved: false
  },
  
  // Analytics
  analytics: {
    playStyle: "methodical", // 'quick_and_dirty', 'methodical', 'optimized'
    restartCount: 0,
    hintUsed: false,
    autoSolveUsed: false,
    strategicPauses: 2
  },
  
  // Device Info
  device: {
    type: "desktop", // 'mobile', 'desktop', 'tablet'
    os: "Windows 10",
    browser: "Chrome 120"
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

## 6. LEVEL_ATTEMPTS COLLECTION (Detailed Attempt History)

```javascript
db.level_attempts.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439210"),
  userAccountId: ObjectId("708f1f77bcf86cd799439011"),
  levelId: ObjectId("708f1f77bcf86cd799439100"),
  levelNumber: 24,
  
  // Attempt Number
  attemptNumber: 2, // 2nd attempt at this level
  
  // Session Reference
  sessionId: ObjectId("708f1f77bcf86cd799439200"),
  
  // Attempt Timeline
  startedAt: ISODate("2024-01-20T14:22:10Z"),
  endedAt: ISODate("2024-01-20T14:23:35Z"),
  
  // Attempt Result
  result: {
    status: "completed", // 'completed', 'quit', 'failed'
    goalReached: true,
    movesUsed: 21,
    timeUsed: 85,
    efficiency: 85.7,
    score: 725
  },
  
  // Command Execution Trace
  commandTrace: [
    {
      command: "FORWARD",
      position: { x: 1, y: 2 },
      direction: "NORTH",
      success: true,
      collisionDetected: false
    }
    // ... more traces
  ],
  
  // Mistakes Made
  mistakes: [
    {
      type: "collision",
      at: "move_15",
      detail: "Hit moving obstacle"
    }
  ],
  
  // User's Command Plan (If saved)
  userPlan: {
    savedAt: ISODate("2024-01-20T14:21:00Z"),
    commands: [
      "FORWARD",
      "FORWARD",
      "FORWARD",
      "TURN_RIGHT",
      // ... full sequence
    ],
    planNotes: "Go around the left side"
  }
});

// Indexes
db.level_attempts.createIndex({ userAccountId: 1, levelId: 1 });
db.level_attempts.createIndex({ userAccountId: 1, "startedAt": -1 });
db.level_attempts.createIndex({ levelId: 1, result: 1 });
```

---

## 7. ACHIEVEMENTS COLLECTION

```javascript
db.achievements.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439300"),
  
  achievementId: "master_problem_solver",
  name: "Master Problem Solver",
  description: "Complete 20 levels with perfect efficiency (>90%)",
  
  icon: {
    url: "https://cdn.example.com/achievements/master-solver.png",
    rarity: "epic"
  },
  
  // Requirements
  requirement: {
    type: "levels_with_efficiency",
    targetLevels: 20,
    minEfficiency: 90
  },
  
  // Rewards
  rewards: {
    xp: 1000,
    points: 5000,
    unlocksItem: "master_robot_skin"
  },
  
  // Metadata
  category: "optimization", // 'speedrunning', 'optimization', 'completion', 'collection'
  rarity: "epic",
  
  // Stats
  stats: {
    totalEarned: 1250,
    percentageOfPlayers: 8
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample: Speedrunning Achievement
db.achievements.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439301"),
  achievementId: "speed_demon",
  name: "Speed Demon",
  description: "Complete a level in < 1 minute",
  requirement: {
    type: "speedrun",
    targetTime: 60, // seconds
    minLevel: 5
  },
  rewards: {
    xp: 300,
    points: 1000
  },
  category: "speedrunning",
  rarity: "rare",
  stats: {
    totalEarned: 5400,
    percentageOfPlayers: 35
  }
});

// Sample: Completion Achievement
db.achievements.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439302"),
  achievementId: "all_levels_beaten",
  name: "Grand Master",
  description: "Complete all levels in the game",
  requirement: {
    type: "all_levels",
    targetCompletion: 100
  },
  rewards: {
    xp: 2000,
    points: 10000,
    unlocksItem: "ultimate_trophy"
  },
  category: "completion",
  rarity: "legendary",
  stats: {
    totalEarned: 342,
    percentageOfPlayers: 2
  }
});
```

---

## 8. USER_ACHIEVEMENTS COLLECTION

```javascript
db.user_achievements.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439310"),
  userAccountId: ObjectId("708f1f77bcf86cd799439011"),
  achievementId: ObjectId("708f1f77bcf86cd799439301"),
  
  achievementSlug: "speed_demon",
  
  // Earning Details
  earnedAt: ISODate("2024-01-18T10:30:45Z"),
  earnedInSession: ObjectId("708f1f77bcf86cd799439200"),
  levelCompletedAt: 12,
  
  // Progress
  progress: {
    current: 100,
    target: 100,
    details: {
      levelCompleted: 12,
      timeAchieved: 58 // seconds
    }
  },
  
  notified: true
});

// Indexes
db.user_achievements.createIndex({ userAccountId: 1 });
db.user_achievements.createIndex({ userAccountId: 1, achievementId: 1 }, { unique: true });
```

---

## 9. LEADERBOARDS COLLECTION

```javascript
db.leaderboards.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439400"),
  userAccountId: ObjectId("708f1f77bcf86cd799439011"),
  
  // Leaderboard Type
  boardType: "global", // 'global', 'by_level', 'speedrun', 'efficiency'
  period: "all_time",
  levelId: null, // null for global, specific level ID for level-specific
  
  // Ranking
  rank: 23,
  
  // Score Metrics
  metrics: {
    totalScore: 24500,
    averageEfficiency: 82,
    levelCompletion: 96,
    speedRunsCount: 3,
    perfectRuns: 1,
    totalXP: 180000,
    
    // Calculation
    scoreFormula: "(avg_efficiency * levels_completed * 100) + bonus"
  },
  
  // User Snapshot
  userSnapshot: {
    displayName: "Robot Master",
    avatar: "https://cdn.example.com/avatars/708f1f77bcf86cd799439011.png",
    level: 15,
    badge: "Master Problem Solver"
  },
  
  // Calculation Info
  calculatedAt: ISODate("2024-01-20T00:00:00Z"),
  validUntil: ISODate("2024-01-21T00:00:00Z"),
  
  previousRank: 25,
  rankChange: 2
});

// Speedrun Leaderboard
db.leaderboards.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439401"),
  userAccountId: ObjectId("708f1f77bcf86cd799439011"),
  boardType: "speedrun",
  period: "weekly",
  levelId: ObjectId("708f1f77bcf86cd799439100"),
  rank: 3,
  metrics: {
    fastestTime: 58, // seconds
    averageTime: 72,
    runsCount: 5
  },
  userSnapshot: {
    displayName: "Robot Master",
    avatar: "https://cdn.example.com/avatars/708f1f77bcf86cd799439011.png"
  },
  calculatedAt: ISODate("2024-01-20T22:00:00Z")
});

// Efficiency Leaderboard
db.leaderboards.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439402"),
  userAccountId: ObjectId("708f1f77bcf86cd799439011"),
  boardType: "efficiency",
  period: "all_time",
  rank: 8,
  metrics: {
    averageEfficiency: 82.5,
    perfectSolutions: 8,
    levelsWithOptimal: 18,
    bestLevel: { levelId: ObjectId("..."), efficiency: 95 }
  },
  userSnapshot: {
    displayName: "Robot Master",
    avatar: "https://cdn.example.com/avatars/708f1f77bcf86cd799439011.png"
  },
  calculatedAt: ISODate("2024-01-20T22:00:00Z")
});

// Indexes
db.leaderboards.createIndex({ boardType: 1, period: 1, rank: 1 });
db.leaderboards.createIndex({ userAccountId: 1, boardType: 1 }, { unique: true });
db.leaderboards.createIndex({ "metrics.totalScore": -1 });
```

---

## 10. LEVEL_CATEGORIES COLLECTION

```javascript
db.level_categories.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439500"),
  
  name: "Maze Navigation",
  slug: "maze_navigation",
  description: "Navigate through complex mazes with obstacles",
  
  icon: {
    url: "https://cdn.example.com/icons/maze.svg",
    color: "#E74C3C"
  },
  
  // Levels in Category
  levels: [10, 15, 20, 24, 28], // Level numbers
  totalLevels: 8,
  
  // Statistics
  stats: {
    totalAttempts: 45000,
    totalCompletions: 38200,
    completionRate: 84.9,
    averageEfficiency: 78,
    averageAttempts: 2.1
  },
  
  // Difficulty Progression
  difficultyProgression: [
    { name: "Easy Navigation", levelRange: "1-3", robots: 1 },
    { name: "Multi-Robot Coordination", levelRange: "4-6", robots: 2 },
    { name: "Complex Mazes", levelRange: "7-8", robots: 1, obstacles: "many" }
  ],
  
  // Recommended Prerequisites
  prerequisites: [],
  
  displayOrder: 2,
  isActive: true,
  
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample: Pattern Recognition Category
db.level_categories.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439501"),
  name: "Pattern Recognition",
  slug: "pattern_recognition",
  description: "Solve puzzles based on patterns and logic",
  levels: [2, 5, 8, 11, 14],
  totalLevels: 5,
  stats: {
    totalAttempts: 32000,
    totalCompletions: 29400,
    completionRate: 91.9,
    averageEfficiency: 85
  },
  prerequisites: [ObjectId("708f1f77bcf86cd799439500")], // Requires Maze category first
  displayOrder: 3,
  isActive: true
});

// Sample: Time Challenge Category
db.level_categories.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439502"),
  name: "Time Challenge",
  slug: "time_challenge",
  description: "Complete levels as quickly as possible",
  levels: [3, 6, 9, 12, 18, 25],
  totalLevels: 6,
  stats: {
    totalAttempts: 28000,
    averageTime: 45,
    fastestSolve: 12
  },
  prerequisites: [],
  displayOrder: 1,
  isActive: true
});

// Indexes
db.level_categories.createIndex({ slug: 1 }, { unique: true });
db.level_categories.createIndex({ displayOrder: 1 });
```

---

## 11. ROBOT_TYPES COLLECTION

```javascript
db.robot_types.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439600"),
  
  name: "Standard Robot",
  slug: "standard",
  description: "The basic robot with normal movement speed",
  
  // Robot Properties
  properties: {
    speed: 1, // cells per second
    size: 1, // in cells
    canRotate: true,
    canPushObjects: false,
    canJump: false,
    hasMemory: false,
    canSense: false
  },
  
  // Available Commands
  availableCommands: [
    "FORWARD",
    "TURN_LEFT",
    "TURN_RIGHT",
    "WAIT" // Do nothing for 1 second
  ],
  
  // Visual
  sprite: {
    url: "https://cdn.example.com/robots/standard.png",
    color: "#3498DB"
  },
  
  // Unlocking
  unlockedAt: 0, // From start
  
  // Stats & Usage
  stats: {
    timesUsed: 45000,
    averageSuccessRate: 86
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample: Advanced Robot
db.robot_types.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439601"),
  name: "Memory Robot",
  slug: "memory_robot",
  description: "Advanced robot with loop support (repeat commands)",
  properties: {
    speed: 1,
    canRotate: true,
    canPushObjects: false,
    hasMemory: true, // Can record and repeat sequences
    hasLoops: true // Can use FOR LOOP commands
  },
  availableCommands: [
    "FORWARD",
    "TURN_LEFT",
    "TURN_RIGHT",
    "WAIT",
    "LOOP_START",
    "LOOP_END"
  ],
  sprite: {
    url: "https://cdn.example.com/robots/memory.png",
    color: "#9B59B6"
  },
  unlockedAt: 8, // After level 8
  stats: {
    timesUsed: 12000,
    averageSuccessRate: 82
  }
});

// Sample: Fast Robot
db.robot_types.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439602"),
  name: "Speed Racer",
  slug: "speed_racer",
  description: "Fast robot - double movement speed",
  properties: {
    speed: 2, // Double speed
    canRotate: true,
    canPushObjects: false
  },
  availableCommands: [
    "FORWARD",
    "TURN_LEFT",
    "TURN_RIGHT"
  ],
  sprite: {
    url: "https://cdn.example.com/robots/speed.png",
    color: "#F39C12"
  },
  unlockedAt: 12,
  stats: {
    timesUsed: 8500,
    averageSuccessRate: 79
  }
});

// Indexes
db.robot_types.createIndex({ slug: 1 }, { unique: true });
db.robot_types.createIndex({ unlockedAt: 1 });
```

---

## 12. GAME_MODES COLLECTION

```javascript
db.game_modes.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439700"),
  
  name: "Classic Mode",
  slug: "classic_mode",
  description: "Complete each level one at a time",
  
  modeType: "classic",
  
  // Rules
  rules: {
    freePlayLevels: true,
    leaderboardType: "efficiency", // What metric is tracked
    timeLimit: null,
    movesLimit: null,
    lives: null,
    retries: "unlimited"
  },
  
  // Progression
  progression: {
    linear: true, // Must complete in order
    canSkipLevels: false,
    unlocksNextOn: "completion"
  },
  
  // Scoring
  scoring: {
    basePoints: 250,
    efficiencyMultiplier: 1.5,
    speedBonus: true,
    perfectRunBonus: 500
  },
  
  display: {
    icon: "https://cdn.example.com/icons/classic.svg",
    color: "#3498DB",
    order: 1
  },
  
  stats: {
    timesPlayed: 125000,
    averageCompletionRate: 78
  },
  
  isActive: true,
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample: Challenge Mode
db.game_modes.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439701"),
  name: "Challenge Mode",
  slug: "challenge_mode",
  description: "Race against time or try to solve with minimum moves",
  modeType: "challenge",
  rules: {
    timeLimit: 300, // 5 minutes for all selected levels
    challengeType: "speed_run", // 'speed_run', 'minimum_moves', 'perfect_solution'
    retries: 3,
    leaderboardType: "speedrun"
  },
  progression: {
    linear: false,
    canSelectLevels: true,
    levelSelectFilter: { minLevel: 5 }
  },
  scoring: {
    basePoints: 500,
    speedBonus: 2.0,
    perfectRunBonus: 1000
  },
  display: {
    icon: "https://cdn.example.com/icons/challenge.svg",
    color: "#E74C3C",
    order: 2
  },
  stats: {
    timesPlayed: 45000
  },
  isActive: true
});

// Indexes
db.game_modes.createIndex({ slug: 1 }, { unique: true });
db.game_modes.createIndex({ "display.order": 1 });
```

---

## 13. LEVEL_STATISTICS COLLECTION (Aggregated)

```javascript
db.level_statistics.insertOne({
  _id: ObjectId("708f1f77bcf86cd799439800"),
  levelId: ObjectId("708f1f77bcf86cd799439100"),
  
  levelNumber: 24,
  date: ISODate("2024-01-20T00:00:00Z"), // Daily stats
  
  // Play Statistics
  stats: {
    timesPlayed: 2340,
    timesCompleted: 2156,
    completionRate: 92.1,
    averageAttempts: 1.85
  },
  
  // Performance Metrics
  performance: {
    averageMoves: 25.3,
    optimalMoves: 18,
    averageEfficiency: 78,
    averageTime: 42,
    bestTime: 15,
    averageHints: 0.3
  },
  
  // Difficulty Assessment
  difficulty: {
    baseDifficulty: 7.5,
    playerAssessedDifficulty: 7.8,
    recommendedLevel: 20
  },
  
  // User Feedback
  feedback: {
    averageRating: 4.2, // out of 5
    totalReviews: 156,
    liked: 142,
    disliked: 14
  }
});

// Indexes
db.level_statistics.createIndex({ levelId: 1, date: -1 });
```

---

## 14. AUTH_SESSIONS & LOGIN_HISTORY COLLECTIONS

Same as previous schema (see auth flow documentation)

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
    ├───────────┬────────────┬──────────┬────────────┤
    │ user_     │ user_      │ game_    │ level_     │
    │ profile   │ statistics │ sessions │ attempts   │
    │           │            │          │            │
    │ user_     │ leaderboards           │ level_     │
    │ achieve   │                        │ stats      │
    └───────────┴────────────┴──────────┴────────────┘
                │ All reference userAccountId
    ┌───────────▼──────────────────────────────────┐
    │    GAME CONTENT LAYER                        │
    ├──────────┬──────────┬──────────┬────────────┤
    │ levels   │ level_   │ game_    │ robot_     │
    │          │ categories│ modes    │ types      │
    └──────────┴──────────┴──────────┴────────────┘
    
    ┌────────────────────────────────────────────┐
    │    PROGRESSION & REWARDS                   │
    ├──────────┬──────────┬──────────────────────┤
    │achieve   │ user_    │ level_statistics     │
    │ments    │achieve   │                      │
    └──────────┴──────────┴──────────────────────┘
```

---

## API ENDPOINTS

### Game Play
```
POST   /levels/:levelId/start           // Start a level
POST   /levels/:levelId/submit          // Submit command sequence
POST   /levels/:levelId/test-commands   // Test without finishing
GET    /levels/:levelId                 // Get level details
GET    /levels/:levelId/attempts        // Get past attempts
GET    /levels/:levelId/hint/:hintId    // Get a hint

GET    /levels?difficulty=hard&category=maze
GET    /levels/next                     // Get next unlocked level
```

### Statistics & Progress
```
GET    /users/stats                     // User statistics
GET    /users/progress                  // Level progress
GET    /users/achievements              // User achievements
GET    /users/personal-best/:levelId    // Best run on a level

GET    /leaderboards/global
GET    /leaderboards/by-level/:levelId
GET    /leaderboards/speedrun
GET    /leaderboards/efficiency
```

### User Customization
```
PUT    /users/robot-type/:robotSlug     // Select robot type
GET    /robots                          // Available robots
GET    /robots/:slug                    // Robot details
```

---

## KEY DESIGN FEATURES

1. **Efficiency Tracking** - Measures solution quality vs optimal
2. **Multiple Leaderboards** - Global, speedrun, efficiency, by-level
3. **Robot Types** - Different mechanics (speed, memory, sensing)
4. **Level Progression** - Unlock system with recommended difficulty
5. **Detailed Analytics** - Track every move, collision, timing
6. **Achievement System** - Speed, optimization, completion based
7. **Command Sequences** - Record and analyze player solutions
8. **Time Series Stats** - Daily aggregation for trending

