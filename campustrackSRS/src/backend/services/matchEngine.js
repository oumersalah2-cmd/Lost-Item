const { dbRun, dbAll } = require('../config/db');

/**
 * Calculates a match score between a lost item and a found item.
 * Score factors:
 * 1. Category must match (mandatory)
 * 2. Overlapping words in title/description (each matching keyword adds +20 points)
 * 3. Location matches (adds +40 points)
 */
function calculateMatchScore(item1, item2) {
  // Guard check: category must be identical
  if (item1.category_id !== item2.category_id) {
    return 0;
  }

  let score = 30; // base score for category overlap

  // Location check (case insensitive matching)
  if (item1.location && item2.location) {
    const loc1 = item1.location.trim().toLowerCase();
    const loc2 = item2.location.trim().toLowerCase();
    if (loc1 === loc2) {
      score += 40;
    } else if (loc1.includes(loc2) || loc2.includes(loc1)) {
      score += 20;
    }
  }

  // Word overlap in title
  const getKeywords = (text) => {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2); // filter out short words
  };

  const keywords1 = [...getKeywords(item1.title), ...getKeywords(item1.description)];
  const keywords2 = [...getKeywords(item2.title), ...getKeywords(item2.description)];

  const uniqueKeys1 = new Set(keywords1);
  const uniqueKeys2 = new Set(keywords2);

  let wordMatches = 0;
  for (const word of uniqueKeys1) {
    if (uniqueKeys2.has(word)) {
      wordMatches++;
    }
  }

  score += wordMatches * 15;

  return Math.min(score, 100); // capped at 100
}

/**
 * Run match engine when a new item is posted.
 * Identifies matches, registers them, and sends notifications.
 */
async function checkMatches(newItem) {
  try {
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';

    // Find all active opposite items in the same category
    const candidates = await dbAll(
      `SELECT * FROM items 
       WHERE type = ? AND category_id = ? AND status = 'active' AND id != ? AND user_id != ?`,
      [oppositeType, newItem.category_id, newItem.id, newItem.user_id]
    );

    for (const candidate of candidates) {
      const score = calculateMatchScore(newItem, candidate);

      // If score is above threshold (e.g. 40 points), register a match and notify
      if (score >= 45) {
        const lostItemId = newItem.type === 'lost' ? newItem.id : candidate.id;
        const foundItemId = newItem.type === 'found' ? newItem.id : candidate.id;

        // Check if match already exists
        const existingMatch = await dbAll(
          'SELECT id FROM matches WHERE lost_item_id = ? AND found_item_id = ?',
          [lostItemId, foundItemId]
        );

        if (existingMatch.length === 0) {
          // 1. Create match record
          await dbRun(
            'INSERT INTO matches (lost_item_id, found_item_id, match_score) VALUES (?, ?, ?)',
            [lostItemId, foundItemId, score]
          );

          // 2. Notify users
          // Retrieve owners
          const lostUserMsg = `Potential match found: a found item "${candidate.type === 'found' ? candidate.title : newItem.title}" matching your lost report was posted!`;
          const foundUserMsg = `Potential match found: a lost report for "${candidate.type === 'lost' ? candidate.title : newItem.title}" matching your found post was reported!`;

          // Notify lost item owner
          const lostOwnerId = newItem.type === 'lost' ? newItem.user_id : candidate.user_id;
          await dbRun(
            'INSERT INTO notifications (user_id, item_id, message, is_read) VALUES (?, ?, ?, 0)',
            [lostOwnerId, lostItemId, lostUserMsg]
          );

          // Notify found item poster
          const foundOwnerId = newItem.type === 'found' ? newItem.user_id : candidate.user_id;
          await dbRun(
            'INSERT INTO notifications (user_id, item_id, message, is_read) VALUES (?, ?, ?, 0)',
            [foundOwnerId, foundItemId, foundUserMsg]
          );
        }
      }
    }
  } catch (error) {
    console.error('Error running match engine:', error);
  }
}

module.exports = {
  checkMatches
};
