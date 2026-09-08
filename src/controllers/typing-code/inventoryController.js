import UserInventory from '../../models/typing-code/UserInventory.js';
import InventoryItem from '../../models/typing-code/InventoryItem.js';
import { get, set, del, delPattern, generateKey, TTL } from '../../utils/cache.js';

// POST /api/typing-code/inventory
// Create a new inventory document for a user
export const createUserInventory = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required.' });
    }

    const existing = await UserInventory.findOne({ userId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Inventory already exists for this user.',
        data: existing,
      });
    }

    const inventory = await UserInventory.create(req.body);
    await del(generateKey('typing-code', 'user-inventory', userId));
    return res.status(201).json({ success: true, data: inventory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-code/inventory/:userId
// Get a user's full inventory with populated item references
export const getUserInventory = async (req, res) => {
  try {
    const cacheKey = generateKey('typing-code', 'user-inventory', req.params.userId);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const inventory = await UserInventory.findOne({ userId: req.params.userId })
      .populate('powerUps.itemId', 'name slug type effect cost rarity')
      .populate('cosmetics.itemId', 'name slug type asset rarity')
      .populate('equipped.theme', 'name slug asset')
      .populate('equipped.avatar', 'name slug asset')
      .populate('equipped.backgroundEffect', 'name slug asset');

    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory not found for this user.' });
    }

    const responseData = { success: true, data: inventory };
    await set(cacheKey, responseData, TTL.USER_DATA);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/typing-code/inventory/:userId
// Update the user's inventory (add/remove power-ups, equip cosmetics, etc.)
export const updateUserInventory = async (req, res) => {
  try {
    const inventory = await UserInventory.findOneAndUpdate(
      { userId: req.params.userId },
      { $set: req.body },
      { returnDocument: 'after', runValidators: true }
    );

    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory not found for this user.' });
    }

    await del(generateKey('typing-code', 'user-inventory', req.params.userId));
    return res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/typing-code/inventory/:userId/add-item
// Push a new power-up or cosmetic item into the user's inventory
export const addItemToInventory = async (req, res) => {
  try {
    const { itemType, item } = req.body; // itemType: 'powerUps' | 'cosmetics'

    if (!itemType || !item) {
      return res.status(400).json({ success: false, message: 'itemType and item are required.' });
    }

    if (!['powerUps', 'cosmetics'].includes(itemType)) {
      return res.status(400).json({ success: false, message: "itemType must be 'powerUps' or 'cosmetics'." });
    }

    const push = {};
    push[itemType] = item;

    const inventory = await UserInventory.findOneAndUpdate(
      { userId: req.params.userId },
      { $push: push },
      { returnDocument: 'after' }
    );

    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory not found for this user.' });
    }

    await del(generateKey('typing-code', 'user-inventory', req.params.userId));
    return res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/typing-code/inventory/items
// Get all available inventory items (catalog)
export const getInventoryItems = async (req, res) => {
  try {
    const cacheKey = generateKey('typing-code', 'inventory-items', req.query);
    const cached = await get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const { type, rarity, limit = 50 } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (rarity) filter.rarity = rarity;

    const items = await InventoryItem.find(filter).limit(Number(limit));
    const responseData = { success: true, count: items.length, data: items };

    await set(cacheKey, responseData, TTL.LONG_STATIC);
    return res.status(200).json(responseData);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/typing-code/inventory/items
// Create a new inventory item definition (admin)
export const createInventoryItem = async (req, res) => {
  try {
    const slug = req.body.slug || req.body.itemId || (req.body.name ? req.body.name.toLowerCase().replace(/\s+/g, '_') : undefined);
    const itemData = { ...req.body, ...(slug ? { slug } : {}) };

    let item;
    if (slug) {
      item = await InventoryItem.findOneAndUpdate(
        { slug },
        { $setOnInsert: itemData },
        { upsert: true, returnDocument: 'after' }
      );
    } else {
      item = await InventoryItem.create(itemData);
    }

    await delPattern('typing-code:inventory-items:*');
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Item with this slug already exists.' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
