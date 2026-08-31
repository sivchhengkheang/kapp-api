import { Router } from 'express';
import {
  createUserInventory,
  getUserInventory,
  updateUserInventory,
  addItemToInventory,
  getInventoryItems,
  createInventoryItem,
} from '../../controllers/typing-code/inventoryController.js';

const router = Router();

// GET  /api/typing-code/inventory/items  - List all available inventory item definitions
// POST /api/typing-code/inventory/items  - Create a new inventory item (admin)
router.route('/items').get(getInventoryItems).post(createInventoryItem);

// POST /api/typing-code/inventory  - Create a new user inventory document
router.post('/', createUserInventory);

// GET   /api/typing-code/inventory/:userId          - Get user's inventory (populated)
// PATCH /api/typing-code/inventory/:userId          - Set/update inventory fields
router
  .route('/:userId')
  .get(getUserInventory)
  .patch(updateUserInventory);

// PATCH /api/typing-code/inventory/:userId/add-item - Push a new item into inventory
router.patch('/:userId/add-item', addItemToInventory);

export default router;
