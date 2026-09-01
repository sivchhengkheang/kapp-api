import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { dbConnection } from './src/config/dbConnection.js';
import { startLevel, submitLevel } from './src/controllers/dragon-drop/levelController.js';
import GameSessionDragon from './src/models/dragon-drop/GameSessionDragon.js';
import UserAccount from './src/models/shared/UserAccount.js';
import LevelDragon from './src/models/dragon-drop/Level.js';

dotenv.config();

// Simple express res mock
class MockRes {
  status(code) {
    this.statusCode = code;
    return this;
  }
  json(data) {
    this.body = data;
    return this;
  }
}

async function runTest() {
  try {
    await dbConnection();
    console.log('--- Connected to DB for Verification ---');

    // Get dummy user and level from DB (seeded earlier)
    const user = await UserAccount.findOne({ email: 'adventurer@example.com' });
    const level = await LevelDragon.findOne({ levelNumber: 8 });

    if (!user || !level) {
      console.log('Missing seeded user or level. Please run seed script first.');
      process.exit(1);
    }

    // 1. Test startLevel controller
    console.log('\n[1] Testing startLevel...');
    const startReq = {
      params: { levelNumber: 8 },
      body: { userAccountId: user._id }
    };
    const startRes = new MockRes();
    await startLevel(startReq, startRes);
    
    if (startRes.statusCode === 201) {
      console.log('✅ startLevel succeeded. Session created with ID:', startRes.body.data._id);
    } else {
      console.log('❌ startLevel failed:', startRes.body);
      process.exit(1);
    }

    const sessionId = startRes.body.data._id;

    // 2. Test submitLevel controller (Update database)
    console.log('\n[2] Testing submitLevel (Updating database)...');
    const submitReq = {
      body: {
        sessionId: sessionId,
        performance: {
          score: 12500,
          starRating: 3
        },
        collectibles: {
          collected: [
            { id: "map_piece_1", type: "map_piece", collectedAt: 120, moveNumber: 15 }
          ]
        },
        rewards: {
          xpEarned: 500
        }
      }
    };
    const submitRes = new MockRes();
    await submitLevel(submitReq, submitRes);

    if (submitRes.statusCode === 200) {
      console.log('✅ submitLevel succeeded. Status updated to:', submitRes.body.data.performance.status);
    } else {
      console.log('❌ submitLevel failed:', submitRes.body);
      process.exit(1);
    }

    // 3. Verify in Database
    console.log('\n[3] Verifying data directly in MongoDB...');
    const dbSession = await GameSessionDragon.findById(sessionId);
    if (dbSession) {
      console.log('✅ Document found in GameSessionDragon collection!');
      console.log('   Status:', dbSession.performance.status);
      console.log('   Score:', dbSession.performance.score);
      console.log('   Stars:', dbSession.performance.starRating);
      console.log('   Map Pieces Collected:', dbSession.collectibles.collected.length);
      
      if (dbSession.performance.score === 12500 && dbSession.performance.status === 'completed') {
        console.log('\n🎉 ALL TESTS PASSED! Database is updating correctly.');
      }
    } else {
      console.log('❌ Document NOT found in DB!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

runTest();
