import express from 'express';
import { 
  getBossForWorld, 
  startBossBattle, 
  submitBossBattle 
} from '../../controllers/dragon-drop/bossController.js';

const router = express.Router();

router.get('/:world', getBossForWorld);
router.post('/:world/start', startBossBattle);
router.post('/:world/submit', submitBossBattle);

export default router;
