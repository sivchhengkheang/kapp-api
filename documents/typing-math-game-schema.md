# Typing Math Game - NoSQL Schema Design

## Game Overview
- **Educational typing + math game**
- **Language support**: English & Khmer
- **Platforms**: Web (React) & Desktop (Electron)
- **Core Feature**: Type math answers quickly to improve speed & accuracy
- **Progression**: Difficulty-based levels (Easy → Expert)

---

## 1. USERS_ACCOUNT COLLECTION (Authentication)

```javascript
db.users_account.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439011"),
  
  // Authentication Credentials
  email: "student@example.com",
  username: "math_master",
  password_hash: "$2b$10$...",
  
  // Email Verification
  emailVerified: true,
  emailVerificationToken: null,
  emailVerificationTokenExpiry: null,
  
  // Account Status
  accountStatus: "active",
  accountStatusReason: null,
  
  // Password Reset
  passwordResetToken: null,
  passwordResetTokenExpiry: null,
  
  // Security
  security: {
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    accountLockedUntil: null,
    passwordChangedAt: ISODate("2024-01-10T10:30:45Z")
  },
  
  // Timestamps
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-20T14:22:10Z"),
  lastLoginAt: ISODate("2024-01-20T14:22:10Z"),
  
  // Social Auth
  socialAuth: {
    google: null,
    github: null
  },
  
  // Email Preferences
  emailNotifications: {
    achievements: true,
    leaderboardUpdates: true,
    dailyChallenge: true,
    tips: false
  }
});

// Indexes
db.users_account.createIndex({ email: 1 }, { unique: true });
db.users_account.createIndex({ username: 1 }, { unique: true });
db.users_account.createIndex({ accountStatus: 1 });
db.users_account.createIndex({ "security.accountLockedUntil": 1 });
```

---

## 2. USER_PROFILE COLLECTION (Game Profile)

```javascript
db.user_profile.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439012"),
  userAccountId: ObjectId("607f1f77bcf86cd799439011"),
  
  // Display Information
  displayName: "Math Master",
  bio: "Love solving math problems fast!",
  avatar: {
    url: "https://cdn.example.com/avatars/607f1f77bcf86cd799439011.png",
    uploadedAt: ISODate("2024-01-15T10:30:45Z"),
    type: "custom"
  },
  
  // Location & Profile
  profile: {
    countryCode: "KH",
    timezone: "Asia/Bangkok",
    schoolName: null,
    gradeLevel: "10",
    joinedFrom: "web" // 'web', 'desktop_electron'
  },
  
  // Language & Preferences
  preferences: {
    language: "en", // 'en', 'km' (Khmer)
    theme: "light",
    soundEnabled: true,
    notificationsEnabled: true,
    showCorrectAnswer: true,
    operationsPreference: ["addition", "subtraction", "multiplication"]
  },
  
  // Privacy Settings
  privacy: {
    profilePublic: true,
    showOnLeaderboard: true,
    allowFriendRequests: true,
    showAchievements: true
  },
  
  // Quick Stats (Cached)
  stats: {
    level: 15,
    currentXP: 32000,
    peakWPM: 85,
    averageAccuracy: 94.2,
    totalGamesPlayed: 250,
    totalMathProblems: 5000,
    lastPlayedAt: ISODate("2024-01-20T14:22:10Z")
  },
  
  // Badges & Status
  badges: {
    customTitle: "Calculation Master",
    statusMessage: "On a 8 game win streak!",
    featured: ["math_wizard", "accuracy_champion"]
  },
  
  // Timestamps
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_profile.createIndex({ userAccountId: 1 }, { unique: true });
db.user_profile.createIndex({ "stats.level": -1 });
db.user_profile.createIndex({ "stats.peakWPM": -1 });
```

---

## 3. USER_STATISTICS COLLECTION (Detailed Game Stats)

```javascript
db.user_statistics.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439013"),
  userAccountId: ObjectId("607f1f77bcf86cd799439011"),
  
  // Games Played
  gamesPlayed: {
    total: 250,
    completed: 245,
    abandoned: 3,
    failed: 2
  },
  
  // Typing Speed (WPM - Words Per Minute on number input)
  wpm: {
    current: 85,
    average: 72,
    peak: 95,
    history: [
      { sessionId: ObjectId("..."), wpm: 92, date: ISODate("2024-01-20T...") },
      { sessionId: ObjectId("..."), wpm: 88, date: ISODate("2024-01-19T...") }
    ]
  },
  
  // Math Accuracy
  accuracy: {
    average: 94.2,
    bestStreak: 280, // correct answers in a row
    currentStreak: 45,
    
    // By operation type
    byOperation: {
      addition: { accuracy: 96.5, solved: 1200 },
      subtraction: { accuracy: 94.2, solved: 1100 },
      multiplication: { accuracy: 91.3, solved: 980 },
      division: { accuracy: 88.5, solved: 720 },
      fractions: { accuracy: 85.0, solved: 500 }
    }
  },
  
  // Progression
  level: {
    current: 15,
    xp: {
      current: 32000,
      totalEarned: 125000,
      nextLevelRequires: 40000
    }
  },
  
  // Problem Solving Stats
  problemStats: {
    totalSolved: 5000,
    totalAttempted: 5300,
    totalSkipped: 100,
    averageSolveTime: 2.5, // seconds
    fastestSolveTime: 0.8, // seconds
    slowestSolveTime: 8.5 // seconds
  },
  
  // Streaks
  streaks: {
    currentGameWinStreak: 8,
    longestGameWinStreak: 24,
    currentPerfectStreakCount: 45, // consecutive correct answers
    longestPerfectStreak: 280,
    playStreak: {
      currentDays: 12,
      lastPlayDate: ISODate("2024-01-20T..."),
      longestDays: 45
    }
  },
  
  // Achievements & Points
  achievements: {
    total: 18,
    points: 12000,
    badges: [
      {
        id: "math_wizard",
        name: "Math Wizard",
        earnedAt: ISODate("2024-01-10T...")
      }
    ]
  },
  
  // Category Performance (Math Topics)
  categoryStats: [
    {
      category: "basic_operations",
      subcategory: "addition",
      problemsSolved: 1200,
      averageAccuracy: 96.5,
      averageWPM: 85,
      highScore: 9500,
      timesPlayedThisWeek: 25
    },
    {
      category: "basic_operations",
      subcategory: "multiplication",
      problemsSolved: 980,
      averageAccuracy: 91.3,
      averageWPM: 75,
      highScore: 8200,
      timesPlayedThisWeek: 18
    },
    {
      category: "advanced",
      subcategory: "fractions",
      problemsSolved: 500,
      averageAccuracy: 85.0,
      averageWPM: 60,
      highScore: 6800,
      timesPlayedThisWeek: 5
    }
  ],
  
  // Time Tracking
  totalPlayTimeSeconds: 18000, // 5 hours
  
  updatedAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.user_statistics.createIndex({ userAccountId: 1 }, { unique: true });
db.user_statistics.createIndex({ "level.current": -1 });
db.user_statistics.createIndex({ "wpm.peak": -1 });
```

---

## 4. MATH_PROBLEMS COLLECTION (Problem Bank)

```javascript
db.math_problems.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439100"),
  
  // Problem Identification
  problemId: "add_2digit_1",
  title: "Addition of Two-Digit Numbers",
  description: "Add two 2-digit numbers",
  
  // Math Details
  operation: "addition", // 'addition', 'subtraction', 'multiplication', 'division', 'fractions', 'decimals', 'mixed'
  category: "basic_operations",
  subcategory: "addition",
  difficulty: "beginner", // 'beginner', 'easy', 'intermediate', 'hard', 'expert'
  
  // Problem Content
  problem: {
    operand1: 25,
    operand2: 47,
    operator: "+",
    displayText: "25 + 47 = ?", // Display text
    answerText: "25 + 47 = _____" // For typing
  },
  
  // Correct Answer
  answer: {
    correctAnswer: 72,
    acceptableFormats: [72, "72"], // Different valid formats
    isInteger: true,
    canBeNegative: false,
    precision: 0 // decimal places required
  },
  
  // Common Wrong Answers (for hints)
  commonMistakes: [
    { answer: 62, explanation: "Did you add 2+7? Check again" },
    { answer: 73, explanation: "Close! Double-check your addition" }
  ],
  
  // Metadata
  creator: {
    type: "system", // 'system', 'teacher', 'user'
    userId: null // null if system
  },
  
  // Statistics
  stats: {
    timesAttempted: 5400,
    timesCorrect: 5100,
    successRate: 94.4,
    averageTimeSeconds: 2.8,
    averageWPMOnAnswer: 85,
    commonErrorRate: 2.1 // % who make common mistakes
  },
  
  // Difficulty Adjustment
  difficulty: {
    baseDifficulty: 20, // 0-100 scale
    adjustedByData: 22,
    recommendedForLevel: 1
  },
  
  // Status
  status: {
    isActive: true,
    isArchived: false,
    isReviewedByTeacher: false
  },
  
  // Bilingual Support
  translations: {
    en: {
      displayText: "25 + 47 = ?",
      description: "Add two 2-digit numbers"
    },
    km: {
      displayText: "25 + 47 = ?",
      description: "បូក លេខ 2 ខ្ទង់"
    }
  },
  
  // Tags & Discovery
  tags: ["addition", "two-digit", "basic"],
  
  createdAt: ISODate("2023-06-15T10:30:45Z"),
  updatedAt: ISODate("2024-01-15T10:30:45Z")
});

// Indexes
db.math_problems.createIndex({ operation: 1, difficulty: 1 });
db.math_problems.createIndex({ category: 1, subcategory: 1 });
db.math_problems.createIndex({ "status.isActive": 1 });
db.math_problems.createIndex({ "difficulty.recommendedForLevel": 1 });
db.math_problems.createIndex({ tags: 1 });
```

---

## 5. GAME_SESSIONS COLLECTION (Sessions)

```javascript
db.game_sessions.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439200"),
  userAccountId: ObjectId("607f1f77bcf86cd799439011"),
  
  // Game Configuration
  gameMode: "timed_challenge", // 'timed_challenge', 'survival', 'daily_challenge', 'practice', 'test'
  category: "basic_operations",
  operations: ["addition", "subtraction"], // Multiple operations in one game
  difficulty: "intermediate",
  
  // Game Settings
  settings: {
    durationSeconds: 120,
    problemCount: 40,
    showTimer: true,
    showScore: true,
    hintAllowed: false,
    showPreviousProblem: true
  },
  
  // Timing
  timing: {
    startedAt: ISODate("2024-01-20T14:22:10Z"),
    endedAt: ISODate("2024-01-20T14:24:30Z"),
    durationSeconds: 140
  },
  
  // Performance Metrics
  performance: {
    totalProblems: 40,
    solvedCorrectly: 38,
    solvedIncorrectly: 1,
    skipped: 1,
    
    accuracy: 97.5,
    wpm: 82,
    peakWpm: 95,
    averageProblemTime: 2.8, // seconds
    
    // Time distribution
    fastestProblem: 0.9,
    slowestProblem: 8.2,
    
    // Streak information
    longestCorrectStreak: 28,
    currentCorrectStreak: 5
  },
  
  // Results & Scoring
  results: {
    status: "completed", // 'completed', 'quit', 'paused', 'failed'
    score: 9200,
    xpEarned: 180,
    isPersonalBest: false,
    previousBestScore: 9500
  },
  
  // Problem-by-Problem Tracking
  problemDetails: [
    {
      problemId: ObjectId("607f1f77bcf86cd799439100"),
      operation: "addition",
      problem: "25 + 47 = ?",
      userAnswer: "72",
      correctAnswer: "72",
      isCorrect: true,
      timeToAnswer: 2.3,
      attemptNumber: 1
    },
    {
      problemId: ObjectId("607f1f77bcf86cd799439101"),
      operation: "subtraction",
      problem: "95 - 28 = ?",
      userAnswer: "67",
      correctAnswer: "67",
      isCorrect: true,
      timeToAnswer: 2.1,
      attemptNumber: 1
    }
    // ... 38 more problems
  ],
  
  // Mistakes Analysis
  mistakes: [
    {
      position: 15,
      problemId: ObjectId("607f1f77bcf86cd799439102"),
      operation: "multiplication",
      problem: "6 × 8 = ?",
      userAnswer: "47",
      correctAnswer: "48",
      mistakeType: "calculation_error",
      timeToAnswer: 3.5
    }
  ],
  
  // Device Info
  device: {
    type: "web", // 'web', 'desktop_electron', 'mobile'
    os: "Windows 10",
    browser: "Chrome 120",
    language: "en" // 'en', 'km'
  },
  
  // Consistency Score
  consistency: {
    score: 88,
    timeVariance: 1.2, // std dev of problem times
    accuracyStability: "very_consistent" // 'unstable', 'slightly_consistent', 'consistent', 'very_consistent'
  },
  
  createdAt: ISODate("2024-01-20T14:22:10Z")
});

// Indexes
db.game_sessions.createIndex({ userAccountId: 1 });
db.game_sessions.createIndex({ userAccountId: 1, "createdAt": -1 });
db.game_sessions.createIndex({ category: 1, "createdAt": -1 });
db.game_sessions.createIndex({ "results.status": 1 });
db.game_sessions.createIndex({ "performance.accuracy": -1 });
```

---

## 6. GAME_MODES COLLECTION

```javascript
db.game_modes.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439300"),
  
  name: "Timed Challenge",
  slug: "timed_challenge",
  description: "Answer as many problems as you can within the time limit",
  
  modeType: "timed_challenge",
  
  // Game Rules
  rules: {
    durationSeconds: 120,
    problemCount: null, // null = continue until time ends
    lives: null,
    scoreMultiplier: 1,
    skipAllowed: true,
    hintAllowed: false,
    
    // Scoring
    scoring: {
      basePointsPerProblem: 100,
      accuracyBonus: 1.5, // multiplier
      speedBonus: 1.2,
      streakBonus: 0.2
    }
  },
  
  // Visual & UX
  display: {
    icon: "https://cdn.example.com/icons/timed-mode.svg",
    color: "#3498DB",
    order: 1,
    description: "Beat the clock!"
  },
  
  // Statistics
  stats: {
    timesPlayed: 12500,
    averageScore: 8500,
    averageAccuracy: 92.1,
    averageWpm: 78
  },
  
  isActive: true,
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample: Survival Mode
db.game_modes.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439301"),
  name: "Survival",
  slug: "survival",
  description: "One wrong answer and it's game over!",
  modeType: "survival",
  rules: {
    durationSeconds: null,
    lives: 3,
    scoreMultiplier: 2,
    skipAllowed: false,
    hintAllowed: false,
    mechanics: {
      difficulty: {
        startingLevel: "easy",
        increaseFrequency: 10, // every 10 correct answers
        increaseAmount: 1
      }
    }
  },
  display: {
    icon: "https://cdn.example.com/icons/survival.svg",
    color: "#E74C3C",
    order: 2
  },
  stats: {
    timesPlayed: 8000,
    averageScore: 6200,
    averageAccuracy: 89.5
  },
  isActive: true
});

// Sample: Daily Challenge
db.game_modes.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439302"),
  name: "Daily Challenge",
  slug: "daily_challenge",
  description: "Compete on today's challenge. Limited one attempt per day!",
  modeType: "daily_challenge",
  rules: {
    durationSeconds: 180,
    problemCount: 50,
    livesPerDay: 1, // Only 1 attempt per calendar day
    resetTime: "00:00:00 UTC",
    scoreMultiplier: 3, // Higher rewards
    ranking: "global" // Global rankings
  },
  display: {
    icon: "https://cdn.example.com/icons/daily.svg",
    color: "#F39C12",
    order: 3
  },
  isActive: true
});
```

---

## 7. CATEGORIES COLLECTION (Math Topics)

```javascript
db.categories.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439400"),
  
  name: "Basic Operations",
  slug: "basic_operations",
  description: "Addition, Subtraction, Multiplication, Division",
  
  icon: {
    url: "https://cdn.example.com/icons/basic-ops.svg",
    color: "#3498DB"
  },
  
  // Subcategories
  subcategories: [
    {
      name: "Addition",
      slug: "addition",
      description: "Add numbers together",
      icon: "plus",
      problemCount: 1200,
      recommendedGrade: "1-3"
    },
    {
      name: "Subtraction",
      slug: "subtraction",
      description: "Subtract numbers",
      icon: "minus",
      problemCount: 1100,
      recommendedGrade: "1-3"
    },
    {
      name: "Multiplication",
      slug: "multiplication",
      description: "Multiply numbers",
      icon: "multiply",
      problemCount: 980,
      recommendedGrade: "3-5"
    },
    {
      name: "Division",
      slug: "division",
      description: "Divide numbers",
      icon: "divide",
      problemCount: 850,
      recommendedGrade: "3-5"
    }
  ],
  
  // Statistics
  stats: {
    totalProblems: 4130,
    totalAttempts: 285000,
    averageAccuracy: 91.5,
    averageWPM: 75
  },
  
  // Difficulty Distribution
  difficultyDistribution: {
    beginner: 800,
    easy: 1200,
    intermediate: 1300,
    hard: 600,
    expert: 230
  },
  
  // Recommended for
  recommendedFor: {
    gradeLevel: "1-5",
    minAgeYears: 6,
    maxAgeYears: 11
  },
  
  displayOrder: 1,
  isActive: true,
  
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample: Advanced Category
db.categories.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439401"),
  name: "Advanced",
  slug: "advanced",
  description: "Fractions, Decimals, Percentages, Mixed Operations",
  subcategories: [
    {
      name: "Fractions",
      slug: "fractions",
      problemCount: 500,
      recommendedGrade: "5-7"
    },
    {
      name: "Decimals",
      slug: "decimals",
      problemCount: 450,
      recommendedGrade: "5-8"
    },
    {
      name: "Percentages",
      slug: "percentages",
      problemCount: 350,
      recommendedGrade: "6-9"
    }
  ],
  stats: {
    totalProblems: 1300,
    averageAccuracy: 85.2,
    averageWPM: 62
  },
  recommendedFor: {
    gradeLevel: "5-9",
    minAgeYears: 10,
    maxAgeYears: 15
  },
  displayOrder: 2,
  isActive: true
});
```

---

## 8. ACHIEVEMENTS COLLECTION

```javascript
db.achievements.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439500"),
  
  achievementId: "math_wizard",
  name: "Math Wizard",
  description: "Reach 90% accuracy in 50 games",
  
  icon: {
    url: "https://cdn.example.com/achievements/math-wizard.png",
    rarity: "epic"
  },
  
  // Requirements
  requirement: {
    type: "accuracy_milestone",
    minAccuracy: 90,
    minGamesCount: 50,
    timeframe: null // null = all-time
  },
  
  // Rewards
  rewards: {
    xp: 300,
    points: 1500,
    unlocksItems: ["wizard_badge"]
  },
  
  // Metadata
  category: "accuracy", // 'accuracy', 'speed', 'consistency', 'dedication', 'social'
  rarity: "epic",
  displayOrder: 1,
  
  // Statistics
  stats: {
    totalEarned: 8500,
    percentageOfPlayers: 35 // % of all players who have this
  },
  
  createdAt: ISODate("2023-06-15T10:30:45Z")
});

// Sample: Speed Achievement
db.achievements.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439501"),
  achievementId: "speed_demon",
  name: "Speed Demon",
  description: "Achieve 90 WPM in a single session",
  requirement: {
    type: "wpm_threshold",
    targetWPM: 90,
    minimumAccuracy: 85
  },
  rewards: {
    xp: 250,
    points: 1000
  },
  category: "speed",
  rarity: "rare",
  stats: {
    totalEarned: 5200,
    percentageOfPlayers: 18
  }
});

// Sample: Dedication Achievement
db.achievements.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439502"),
  achievementId: "daily_grinder",
  name: "Daily Grinder",
  description: "Play for 7 consecutive days",
  requirement: {
    type: "play_streak",
    targetDays: 7
  },
  rewards: {
    xp: 500,
    points: 2000
  },
  category: "dedication",
  rarity: "common",
  stats: {
    totalEarned: 12000,
    percentageOfPlayers: 42
  }
});
```

---

## 9. USER_ACHIEVEMENTS COLLECTION

```javascript
db.user_achievements.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439600"),
  userAccountId: ObjectId("607f1f77bcf86cd799439011"),
  achievementId: ObjectId("607f1f77bcf86cd799439500"),
  
  achievementSlug: "math_wizard",
  
  // Earning Details
  earnedAt: ISODate("2024-01-15T10:30:45Z"),
  earnedInSession: ObjectId("607f1f77bcf86cd799439200"),
  
  // Progress (for multi-stage achievements)
  progress: {
    current: 100,
    target: 100,
    completionPercentage: 100,
    
    // Detailed progress tracking
    gamesWithGoodAccuracy: 50,
    averageAccuracy: 92.5
  },
  
  notified: true,
  notifiedAt: ISODate("2024-01-15T10:31:00Z")
});

// Indexes
db.user_achievements.createIndex({ userAccountId: 1 });
db.user_achievements.createIndex({ userAccountId: 1, achievementId: 1 }, { unique: true });
```

---

## 10. LEADERBOARDS COLLECTION

```javascript
db.leaderboards.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439700"),
  userAccountId: ObjectId("607f1f77bcf86cd799439011"),
  
  // Leaderboard Configuration
  boardType: "global", // 'global', 'category', 'weekly', 'daily', 'friends'
  category: null,
  period: "all_time", // 'weekly', 'daily', 'all_time'
  
  // Ranking
  rank: 42,
  
  // Score Metrics
  metrics: {
    score: 98500,
    totalAccuracy: 94.2,
    averageWpm: 82,
    gamesCompleted: 245,
    totalXP: 125000,
    
    // Calculation formula
    scoreFormula: "(total_accuracy * avg_wpm * games_completed) / 100"
  },
  
  // User Snapshot (for fast display)
  userSnapshot: {
    displayName: "Math Master",
    avatar: "https://cdn.example.com/avatars/607f1f77bcf86cd799439011.png",
    level: 15,
    country: "KH"
  },
  
  // Calculation Metadata
  calculatedAt: ISODate("2024-01-20T00:00:00Z"),
  validUntil: ISODate("2024-01-21T00:00:00Z"),
  previousRank: 45,
  rankChange: 3
});

// Weekly Category Leaderboard
db.leaderboards.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439701"),
  userAccountId: ObjectId("607f1f77bcf86cd799439011"),
  boardType: "category",
  category: "addition",
  period: "weekly",
  weekStartDate: ISODate("2024-01-15T00:00:00Z"),
  rank: 8,
  metrics: {
    score: 15200,
    totalAccuracy: 96.8,
    averageWpm: 88,
    gamesThisWeek: 35
  },
  userSnapshot: {
    displayName: "Math Master",
    avatar: "https://cdn.example.com/avatars/607f1f77bcf86cd799439011.png"
  },
  calculatedAt: ISODate("2024-01-20T22:00:00Z")
});

// Daily Challenge Leaderboard
db.leaderboards.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439702"),
  userAccountId: ObjectId("607f1f77bcf86cd799439011"),
  boardType: "daily",
  period: "daily",
  date: ISODate("2024-01-20T00:00:00Z"),
  rank: 5,
  metrics: {
    score: 9200,
    totalAccuracy: 97.5,
    timeToComplete: 142 // seconds
  },
  userSnapshot: {
    displayName: "Math Master",
    avatar: "https://cdn.example.com/avatars/607f1f77bcf86cd799439011.png"
  },
  calculatedAt: ISODate("2024-01-20T22:00:00Z")
});

// Indexes
db.leaderboards.createIndex({ boardType: 1, period: 1, rank: 1 });
db.leaderboards.createIndex({ userAccountId: 1, boardType: 1, period: 1 }, { unique: true });
db.leaderboards.createIndex({ "metrics.score": -1 });
```

---

## 11. DAILY_CHALLENGE COLLECTION

```javascript
db.daily_challenges.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439800"),
  
  date: ISODate("2024-01-20T00:00:00Z"),
  
  // Challenge Details
  title: "Addition Master - Day 20",
  description: "Solve 50 addition problems under 3 minutes",
  
  // Challenge Configuration
  challengeConfig: {
    operations: ["addition"],
    difficulty: "intermediate",
    problemCount: 50,
    durationSeconds: 180,
    categoryFocus: "basic_operations"
  },
  
  // Problem Selection
  problems: [
    ObjectId("607f1f77bcf86cd799439100"),
    ObjectId("607f1f77bcf86cd799439103"),
    // ... 48 more problem IDs
  ],
  
  // Rewards for this day
  rewards: {
    xpForCompletion: 200,
    pointsForCompletion: 500,
    xpForFirstPlace: 500,
    specialReward: "bonus_multiplier_2x" // Can unlock item/multiplier
  },
  
  // Statistics
  stats: {
    totalAttempts: 5200,
    totalCompleted: 4800,
    averageScore: 8700,
    averageAccuracy: 92.3,
    averageTime: 168
  },
  
  // Leaderboard for this day
  topScores: [
    {
      rank: 1,
      userAccountId: ObjectId("607f1f77bcf86cd799439001"),
      displayName: "Pro Solver",
      score: 9800,
      accuracy: 98.5,
      timeToComplete: 145
    },
    {
      rank: 2,
      userAccountId: ObjectId("607f1f77bcf86cd799439011"),
      displayName: "Math Master",
      score: 9200,
      accuracy: 97.5,
      timeToComplete: 158
    }
  ],
  
  isActive: true,
  createdAt: ISODate("2024-01-20T00:00:00Z")
});

// Indexes
db.daily_challenges.createIndex({ date: 1 }, { unique: true });
db.daily_challenges.createIndex({ isActive: 1 });
```

---

## 12. USER_PERFORMANCE_HISTORY COLLECTION (Time Series)

```javascript
db.user_performance_history.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439900"),
  userAccountId: ObjectId("607f1f77bcf86cd799439011"),
  
  // Time-based performance tracking
  date: ISODate("2024-01-20T00:00:00Z"), // Daily aggregation
  
  // Daily Metrics
  dailyStats: {
    gamesPlayed: 5,
    averageAccuracy: 94.2,
    averageWpm: 80,
    totalProblemsCorrect: 189,
    totalProblems: 200,
    totalPlayTimeSeconds: 600,
    xpGained: 450,
    pointsGained: 2500
  },
  
  // Trend Data
  operationPerformance: {
    addition: { accuracy: 96.5, wpm: 85, gamesPlayed: 2 },
    subtraction: { accuracy: 92.3, wpm: 78, gamesPlayed: 2 },
    multiplication: { accuracy: 91.0, wpm: 75, gamesPlayed: 1 }
  },
  
  // Achievements unlocked today
  achievementsUnlockedToday: ["daily_grinder"],
  
  // Streak information
  currentStreak: 12 // days played consecutively
});

// Schema Settings for Time Series (MongoDB 5.0+)
db.createCollection("user_performance_history", {
  timeseries: {
    timeField: "date",
    metaField: "dailyStats",
    granularity: "hours"
  }
});

// Indexes
db.user_performance_history.createIndex({ userAccountId: 1, date: -1 });
```

---

## 13. USER_FRIENDS COLLECTION

```javascript
db.user_friends.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439950"),
  userId: ObjectId("607f1f77bcf86cd799439011"),
  friendId: ObjectId("607f1f77bcf86cd799439012"),
  
  status: "accepted", // 'pending', 'accepted', 'blocked'
  
  requestedAt: ISODate("2024-01-10T10:30:45Z"),
  acceptedAt: ISODate("2024-01-11T10:30:45Z"),
  
  // Friend metadata
  relationship: {
    nickname: null,
    favorited: false,
    lastPlayedTogether: ISODate("2024-01-18T...")
  }
});

// Indexes
db.user_friends.createIndex({ userId: 1, friendId: 1 }, { unique: true });
db.user_friends.createIndex({ userId: 1, status: 1 });
```

---

## 14. AUTH_SESSIONS & LOGIN_HISTORY COLLECTIONS

Same as previous schema (see auth flow documentation)

---

## 15. PROBLEM_ATTEMPTS COLLECTION (Detailed Tracking)

```javascript
db.problem_attempts.insertOne({
  _id: ObjectId("607f1f77bcf86cd799439980"),
  userAccountId: ObjectId("607f1f77bcf86cd799439011"),
  sessionId: ObjectId("607f1f77bcf86cd799439200"),
  
  // Problem Details
  problemId: ObjectId("607f1f77bcf86cd799439100"),
  operation: "addition",
  problem: "25 + 47 = ?",
  
  // User's Attempt
  userAnswer: "72",
  correctAnswer: "72",
  isCorrect: true,
  
  // Timing
  timeToAnswer: 2.3, // seconds
  timeFromGameStart: 25.4,
  
  // Attempt Metadata
  attemptNumber: 1, // 1st attempt, no hints used
  hintUsed: false,
  skipped: false,
  
  // User's Input Method
  inputMethod: "keyboard", // 'keyboard', 'mouse_click', 'touch'
  
  // Keystroke Analysis
  keystrokes: {
    totalKeypresses: 3,
    corrections: 0,
    deletions: 0,
    accuracy: 100
  },
  
  // Problem Difficulty at Time
  problemDifficulty: {
    baseLevel: 20,
    userLevel: 15,
    isAppropriate: true
  },
  
  timestamp: ISODate("2024-01-20T14:22:15Z")
});

// Indexes
db.problem_attempts.createIndex({ userAccountId: 1, timestamp: -1 });
db.problem_attempts.createIndex({ sessionId: 1 });
db.problem_attempts.createIndex({ problemId: 1 });
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
    ├────────┬────────┬────────┬────────┬────────┐    │
    │ user_  │ user_  │ game_  │ daily_ │ user_  │    │
    │profile │stats   │sessions│chall..│friends │    │
    │        │        │        │       │        │    │
    │ user_  │ leaderboards   │ prob.. │        │    │
    │achieve-│        │        │_att..  │        │    │
    │ments   │        │        │        │        │    │
    └────────┴────────┴────────┴────────┴────────┘    │
                │ All reference userAccountId
    ┌───────────▼──────────────────────────────────┐  │
    │    PERFORMANCE TRACKING                      │  │
    │  user_performance_history (time series)      │  │
    └───────────────────────────────────────────────┐  │
                                                       │
    ┌────────────────────────────────────────────────┐ │
    │    PROBLEM BANK & CONTENT                      │ │
    │  math_problems                                 │ │
    │  game_modes                                    │ │
    │  categories                                    │ │
    │  achievements                                  │ │
    └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

## KEY DIFFERENCES FROM TYPING_CODE_GAME

| Aspect | Typing Code Game | Typing Math Game |
|--------|------------------|------------------|
| **Content** | Code snippets | Math problems |
| **Challenge** | Type code accurately | Solve math problems |
| **Tracking** | WPM on code | WPM on numbers |
| **Accuracy Metric** | Character accuracy | Math answer correctness |
| **Categories** | Programming languages | Math operations |
| **Progression** | Code complexity | Math difficulty |
| **Operations** | Single operation (type) | Multiple operations (add, subtract, etc.) |
| **Bilingual** | No | Yes (English & Khmer) |
| **Special Feature** | Power-ups | Daily challenges, Time trials |

---

## API ENDPOINTS

### Math Problems & Practice
```
GET    /math/problems?operation=addition&difficulty=beginner
GET    /math/problems/:id
GET    /math/categories
GET    /math/categories/:slug/problems

POST   /games/start                  // Start a new game
POST   /games/:id/submit-answer      // Submit answer to problem
POST   /games/:id/skip               // Skip a problem
POST   /games/:id/complete           // Finish game session
POST   /games/:id/pause              // Pause game

GET    /users/stats/by-operation
GET    /users/stats/by-category
GET    /users/performance-history    // Time-series data

GET    /leaderboards/global?period=all_time
GET    /leaderboards/daily/:date
GET    /leaderboards/category/:slug
GET    /leaderboards/friends

GET    /daily-challenge/today
POST   /daily-challenge/today/submit-score

GET    /achievements
GET    /users/achievements
POST   /users/achievements/:id/claim // Claim reward
```

---

## INDEXING STRATEGY

| Collection | Indexes | Purpose |
|-----------|---------|---------|
| math_problems | operation, difficulty | Problem discovery |
| game_sessions | userAccountId, -createdAt | Session history |
| leaderboards | boardType, period, rank | Fast leaderboard query |
| daily_challenges | date | Daily challenge lookup |
| problem_attempts | userAccountId, -timestamp | User attempt history |
| user_statistics | userAccountId | Stats lookup |
| user_performance_history | userAccountId, -date | Time-series queries |

