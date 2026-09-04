import KeystrokeEvent from '../../models/koompi-typing/KeystrokeEvent.js';
import GameSessionTyping from '../../models/koompi-typing/GameSessionTyping.js';

// POST /api/koompi-typing/keystrokes/batch
// Batch inserts keystrokes for an ongoing or finalized session
export const recordKeystrokes = async (req, res) => {
  try {
    const { sessionId, events } = req.body;

    if (!sessionId || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'sessionId and a non-empty events array are required.'
      });
    }

    const sessionExists = await GameSessionTyping.exists({ _id: sessionId });
    if (!sessionExists) {
      return res.status(404).json({ success: false, message: 'Game session not found.' });
    }

    const docs = events.map(evt => ({
      sessionId,
      charIndex: evt.charIndex,
      expectedChar: evt.expectedChar,
      typedChar: evt.typedChar,
      correct: Boolean(evt.correct),
      keyCode: evt.keyCode,
      timeSinceLastKeyMs: evt.timeSinceLastKeyMs || 0,
      timestamp: evt.timestamp || new Date()
    }));

    const inserted = await KeystrokeEvent.insertMany(docs);

    return res.status(201).json({
      success: true,
      count: inserted.length,
      message: `${inserted.length} keystroke events recorded.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/koompi-typing/keystrokes/session/:sessionId
export const getKeystrokesBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const events = await KeystrokeEvent.find({ sessionId }).sort({ charIndex: 1 });

    return res.json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
