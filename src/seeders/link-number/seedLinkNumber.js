/**
 * Link Number Game — Seed Script
 * Seeds: 3 PuzzleBoards, 1 DailyChallenge, 3 BoardGenerationTemplates
 *
 * Usage: node src/seeders/link-number/seedLinkNumber.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// ── Resolve .env relative to project root ─────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import PuzzleBoard             from '../../models/link-number/PuzzleBoard.js';
import DailyChallenge          from '../../models/link-number/DailyChallenge.js';
import BoardGenerationTemplate from '../../models/link-number/BoardGenerationTemplate.js';

// ─────────────────────────────────────────────────────────────────────────────
// Puzzle Board Data
// ─────────────────────────────────────────────────────────────────────────────

const puzzleBoards = [
  // ── Board 1: Easy 3×3 ──────────────────────────────────────────────────────
  {
    boardNumber: 1,
    title: 'First Link',
    description: 'A beginner-friendly 3×3 puzzle to learn the basics of path linking.',
    difficulty: 'easy',
    gridSize: '3x3',
    category: 'standard',
    grid: {
      width: 3,
      height: 3,
      totalCells: 9,
      totalPairs: 3,
      numberPairs: [
        { id: 'pair_1', number: 1, positions: [{ x: 0, y: 0 }, { x: 2, y: 2 }] },
        { id: 'pair_2', number: 2, positions: [{ x: 2, y: 0 }, { x: 0, y: 2 }] },
        { id: 'pair_3', number: 3, positions: [{ x: 1, y: 0 }, { x: 1, y: 2 }] }
      ]
    },
    constraints: {
      pathsCannotCross: true,
      mustFillAllCells: true,
      eachCellUsedOnce: true,
      perfectSolution: { pathsRequired: 3, totalCellsCovered: 9, optimalMoveCount: 9 }
    },
    solution: {
      paths: [
        {
          pairId: 'pair_1', number: 1,
          path: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }]
        },
        {
          pairId: 'pair_2', number: 2,
          path: [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }]
        },
        {
          pairId: 'pair_3', number: 3,
          path: [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }]
        }
      ],
      totalMovesOptimal: 9,
      isUnique: true,
      solvableSteps: 3
    },
    hints: [
      { id: 'hint_1', level: 1, text: 'Start connecting from corner numbers first.', revealAfterTime: 60, revealAfterAttempts: 2 },
      { id: 'hint_2', level: 2, text: 'Number 3 can go straight down the middle column.', revealAfterAttempts: 4 }
    ],
    rewards: {
      baseXP: 100,
      xpForPerfect: 200,
      xpForSpeed: 50,
      stars: {
        oneStar:   { minTime: 180, allowMistakes: true,  xpBonus: 50  },
        twoStars:  { minTime: 90,  maxMistakes: 2,        xpBonus: 100 },
        threeStars:{ minTime: 45,  maxMistakes: 0,        xpBonus: 200 }
      }
    },
    difficultyMetrics: {
      branchingFactor: 2.1,
      minPathLength: 3,
      maxPathLength: 5,
      averagePathLength: 4,
      symmetry: 'medium',
      deductionDifficulty: 'easy'
    },
    stats: {
      totalAttempts: 0, totalCompletions: 0, completionRate: 0,
      averageTime: 0, averageAttemptsPerCompletion: 0,
      perfectRuns: 0, abandonmentRate: 0, averageStarsEarned: 0
    },
    theme: {
      backgroundColor: '#F8F9FA', lineColor: '#3B82F6',
      numberColor: '#1F2937', gridLineColor: '#E5E7EB',
      successColor: '#10B981', errorColor: '#EF4444'
    },
    accessibility: { colorblindFriendly: true, highContrast: false, largeNumbers: true, voiceInstructions: false },
    status: { isPublished: true, isArchived: false, isBeta: false, isFeatureLevel: false }
  },

  // ── Board 2: Medium 5×5 ───────────────────────────────────────────────────
  {
    boardNumber: 2,
    title: 'Strategic Links',
    description: 'A challenging 5×5 puzzle requiring careful path planning.',
    difficulty: 'medium',
    gridSize: '5x5',
    category: 'standard',
    grid: {
      width: 5,
      height: 5,
      totalCells: 25,
      totalPairs: 5,
      numberPairs: [
        { id: 'pair_1', number: 1, positions: [{ x: 0, y: 0 }, { x: 4, y: 4 }] },
        { id: 'pair_2', number: 2, positions: [{ x: 0, y: 2 }, { x: 3, y: 3 }] },
        { id: 'pair_3', number: 3, positions: [{ x: 1, y: 0 }, { x: 4, y: 1 }] },
        { id: 'pair_4', number: 4, positions: [{ x: 2, y: 1 }, { x: 1, y: 3 }] },
        { id: 'pair_5', number: 5, positions: [{ x: 4, y: 0 }, { x: 0, y: 4 }] }
      ]
    },
    constraints: {
      pathsCannotCross: true,
      mustFillAllCells: true,
      eachCellUsedOnce: true,
      perfectSolution: { pathsRequired: 5, totalCellsCovered: 25, optimalMoveCount: 45 }
    },
    solution: {
      paths: [
        {
          pairId: 'pair_1', number: 1,
          path: [
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 },
            { x: 4, y: 0 }, { x: 4, y: 1 }, { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }
          ]
        },
        {
          pairId: 'pair_5', number: 5,
          path: [
            { x: 4, y: 0 }, { x: 3, y: 0 },
            { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 2 },
            { x: 0, y: 2 }, { x: 0, y: 3 }, { x: 0, y: 4 }
          ]
        }
      ],
      totalMovesOptimal: 45,
      isUnique: true,
      solvableSteps: 5
    },
    hints: [
      { id: 'hint_1', level: 1, text: 'Start with the numbers in the corners.', revealAfterTime: 120, revealAfterAttempts: 3 },
      { id: 'hint_2', level: 2, text: 'Number 3 should connect diagonally across.', revealAfterAttempts: 5 }
    ],
    rewards: {
      baseXP: 200,
      xpForPerfect: 500,
      xpForSpeed: 100,
      stars: {
        oneStar:   { minTime: 300, allowMistakes: true, xpBonus: 100 },
        twoStars:  { minTime: 180, maxMistakes: 3,      xpBonus: 200 },
        threeStars:{ minTime: 120, maxMistakes: 0,      xpBonus: 300 }
      }
    },
    difficultyMetrics: {
      branchingFactor: 4.2,
      minPathLength: 8,
      maxPathLength: 12,
      averagePathLength: 9,
      symmetry: 'low',
      deductionDifficulty: 'medium'
    },
    stats: {
      totalAttempts: 0, totalCompletions: 0, completionRate: 0,
      averageTime: 0, averageAttemptsPerCompletion: 0,
      perfectRuns: 0, abandonmentRate: 0, averageStarsEarned: 0
    },
    theme: {
      backgroundColor: '#F0F4FF', lineColor: '#6366F1',
      numberColor: '#1F2937', gridLineColor: '#C7D2FE',
      successColor: '#10B981', errorColor: '#EF4444'
    },
    accessibility: { colorblindFriendly: true, highContrast: false, largeNumbers: false, voiceInstructions: false },
    status: { isPublished: true, isArchived: false, isBeta: false, isFeatureLevel: false }
  },

  // ── Board 3: Hard 6×6 ─────────────────────────────────────────────────────
  {
    boardNumber: 3,
    title: 'Labyrinth',
    description: 'A complex 6×6 board that tests advanced spatial reasoning.',
    difficulty: 'hard',
    gridSize: '6x6',
    category: 'standard',
    grid: {
      width: 6,
      height: 6,
      totalCells: 36,
      totalPairs: 6,
      numberPairs: [
        { id: 'pair_1', number: 1, positions: [{ x: 0, y: 0 }, { x: 5, y: 5 }] },
        { id: 'pair_2', number: 2, positions: [{ x: 5, y: 0 }, { x: 0, y: 5 }] },
        { id: 'pair_3', number: 3, positions: [{ x: 2, y: 0 }, { x: 2, y: 5 }] },
        { id: 'pair_4', number: 4, positions: [{ x: 0, y: 2 }, { x: 5, y: 2 }] },
        { id: 'pair_5', number: 5, positions: [{ x: 1, y: 1 }, { x: 4, y: 4 }] },
        { id: 'pair_6', number: 6, positions: [{ x: 4, y: 1 }, { x: 1, y: 4 }] }
      ]
    },
    constraints: {
      pathsCannotCross: true,
      mustFillAllCells: true,
      eachCellUsedOnce: true,
      perfectSolution: { pathsRequired: 6, totalCellsCovered: 36, optimalMoveCount: 70 }
    },
    solution: {
      paths: [],
      totalMovesOptimal: 70,
      isUnique: true,
      solvableSteps: 6
    },
    hints: [
      { id: 'hint_1', level: 1, text: 'Begin by tracing the outer boundary paths.', revealAfterTime: 180, revealAfterAttempts: 3 },
      { id: 'hint_2', level: 2, text: 'Numbers 3 and 4 cross the board in straight lines.', revealAfterAttempts: 6 },
      { id: 'hint_3', level: 3, text: 'Number 5 and 6 must weave through the center region.', revealAfterAttempts: 10 }
    ],
    rewards: {
      baseXP: 350,
      xpForPerfect: 800,
      xpForSpeed: 200,
      stars: {
        oneStar:   { minTime: 480, allowMistakes: true, xpBonus: 150 },
        twoStars:  { minTime: 300, maxMistakes: 3,      xpBonus: 300 },
        threeStars:{ minTime: 200, maxMistakes: 0,      xpBonus: 500 }
      }
    },
    difficultyMetrics: {
      branchingFactor: 7.5,
      minPathLength: 10,
      maxPathLength: 18,
      averagePathLength: 13,
      symmetry: 'none',
      deductionDifficulty: 'hard'
    },
    stats: {
      totalAttempts: 0, totalCompletions: 0, completionRate: 0,
      averageTime: 0, averageAttemptsPerCompletion: 0,
      perfectRuns: 0, abandonmentRate: 0, averageStarsEarned: 0
    },
    theme: {
      backgroundColor: '#0F172A', lineColor: '#F59E0B',
      numberColor: '#F1F5F9', gridLineColor: '#334155',
      successColor: '#10B981', errorColor: '#EF4444'
    },
    accessibility: { colorblindFriendly: true, highContrast: true, largeNumbers: false, voiceInstructions: false },
    status: { isPublished: true, isArchived: false, isBeta: false, isFeatureLevel: true }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Board Generation Templates
// ─────────────────────────────────────────────────────────────────────────────

const templates = [
  {
    templateId: '3x3_easy',
    gridSize: '3x3',
    difficulty: 'easy',
    parameters: { gridWidth: 3, gridHeight: 3, numberPairs: 3, pairPositioning: 'edge_focus', pathComplexity: 'low', symmetry: false, minPathLength: 3, maxPathLength: 5 },
    metrics: { branchingFactor: 'low', deductionRequired: 'low', backtrackingNeeded: false, numSolutions: 1 },
    validation: { mustHaveUniqueSolution: true, minSpaceRequiredPerPath: 3, maxIntersectionPoints: 0 },
    stats: { averageCompletionRate: 0, averageTime: 0, averageStars: 0, totalGenerated: 1 }
  },
  {
    templateId: '5x5_medium',
    gridSize: '5x5',
    difficulty: 'medium',
    parameters: { gridWidth: 5, gridHeight: 5, numberPairs: 5, pairPositioning: 'random', pathComplexity: 'medium', symmetry: false, minPathLength: 8, maxPathLength: 12 },
    metrics: { branchingFactor: 'medium', deductionRequired: 'medium', backtrackingNeeded: false, numSolutions: 1 },
    validation: { mustHaveUniqueSolution: true, minSpaceRequiredPerPath: 8, maxIntersectionPoints: 0 },
    stats: { averageCompletionRate: 0, averageTime: 0, averageStars: 0, totalGenerated: 1 }
  },
  {
    templateId: '6x6_hard',
    gridSize: '6x6',
    difficulty: 'hard',
    parameters: { gridWidth: 6, gridHeight: 6, numberPairs: 6, pairPositioning: 'distributed', pathComplexity: 'high', symmetry: false, minPathLength: 10, maxPathLength: 18 },
    metrics: { branchingFactor: 'high', deductionRequired: 'high', backtrackingNeeded: true, numSolutions: 1 },
    validation: { mustHaveUniqueSolution: true, minSpaceRequiredPerPath: 10, maxIntersectionPoints: 0 },
    stats: { averageCompletionRate: 0, averageTime: 0, averageStars: 0, totalGenerated: 1 }
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Main seed function
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!uri) {
    console.error('❌ MONGO_URI / DATABASE_URL not set in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB\n');

  // ── PuzzleBoards ─────────────────────────────────────────────────────────────
  console.log('📋 Seeding PuzzleBoards...');
  const insertedBoards = [];
  for (const board of puzzleBoards) {
    const result = await PuzzleBoard.findOneAndUpdate(
      { boardNumber: board.boardNumber },
      { $setOnInsert: board },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    insertedBoards.push(result);
    console.log(`   ✓ Board #${board.boardNumber} — "${board.title}" (${board.difficulty})`);
  }

  // ── DailyChallenge ────────────────────────────────────────────────────────────
  console.log('\n📅 Seeding DailyChallenge (today)...');
  const mediumBoard = insertedBoards.find(b => b.difficulty === 'medium');
  const today = (() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  })();

  // Count existing challenges to get next challenge number
  const existingCount = await DailyChallenge.countDocuments();

  await DailyChallenge.findOneAndUpdate(
    { date: today },
    {
      $setOnInsert: {
        date: today,
        challengeNumber: existingCount + 1,
        title: 'Link Master Challenge',
        puzzle: {
          boardId:    mediumBoard._id,
          gridSize:   mediumBoard.gridSize,
          difficulty: mediumBoard.difficulty
        },
        rules: { singleAttemptPerDay: true, timeLimit: 300, mistakePenalty: -50 },
        rewards: { baseXP: 300, basePoints: 500, bonusForPerfect: 500, bonusForSpeed: 200 }
      }
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
  );
  console.log(`   ✓ Daily Challenge #${existingCount + 1} for ${today.toISOString().slice(0, 10)} → Board #${mediumBoard.boardNumber}`);

  // ── BoardGenerationTemplates ─────────────────────────────────────────────────
  console.log('\n🏗️  Seeding BoardGenerationTemplates...');
  for (const template of templates) {
    await BoardGenerationTemplate.findOneAndUpdate(
      { templateId: template.templateId },
      { $setOnInsert: template },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    console.log(`   ✓ Template "${template.templateId}" (${template.difficulty} ${template.gridSize})`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────────
  const [boardCount, challengeCount, templateCount] = await Promise.all([
    PuzzleBoard.countDocuments(),
    DailyChallenge.countDocuments(),
    BoardGenerationTemplate.countDocuments()
  ]);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Link Number Seed Complete!');
  console.log(`   PuzzleBoards:             ${boardCount}`);
  console.log(`   DailyChallenges:           ${challengeCount}`);
  console.log(`   BoardGenerationTemplates:  ${templateCount}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
