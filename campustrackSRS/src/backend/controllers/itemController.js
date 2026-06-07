const { dbRun, dbGet, dbAll } = require('../config/db');
const { checkMatches } = require('../services/matchEngine');

// Create lost or found item posting
const createItem = async (req, res) => {
  const { type, title, category_id, description, location, item_date } = req.body;
  const user_id = req.user.id; // From authMiddleware

  if (!type || !title || !category_id || !item_date) {
    return res.status(400).json({ error: 'Required fields (type, title, category_id, item_date) are missing.' });
  }

  if (type !== 'lost' && type !== 'found') {
    return res.status(400).json({ error: 'Item type must be either "lost" or "found".' });
  }

  // Get image URL if file was uploaded
  let image_url = null;
  if (req.file) {
    image_url = `/uploads/${req.file.filename}`;
  }

  try {
    // Check if category exists
    const category = await dbGet('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (!category) {
      return res.status(400).json({ error: 'Invalid category selection.' });
    }

    const result = await dbRun(
      `INSERT INTO items (user_id, type, title, category_id, description, location, item_date, image_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [user_id, type, title, category_id, description || '', location || '', item_date, image_url]
    );

    const newItem = {
      id: result.lastID,
      user_id,
      type,
      title,
      category_id: parseInt(category_id),
      description: description || '',
      location: location || '',
      item_date,
      image_url,
      status: 'active'
    };

    // Run matching engine asynchronously to check for overlaps
    checkMatches(newItem);

    return res.status(201).json({
      message: `${type === 'lost' ? 'Lost' : 'Found'} item report posted successfully!`,
      item: newItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    return res.status(500).json({ error: 'Internal server error while posting item.' });
  }
};

// Get all postings with flexible filters
const getItems = async (req, res) => {
  const { q, category_id, location, start_date, end_date, type, status } = req.query;

  let sql = `
    SELECT items.*, categories.name AS category_name, users.full_name AS reporter_name
    FROM items
    JOIN categories ON items.category_id = categories.id
    JOIN users ON items.user_id = users.id
    WHERE 1=1
  `;
  const params = [];

  // Keyword query search (searches title and description)
  if (q) {
    sql += ' AND (items.title LIKE ? OR items.description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }

  // Category filter
  if (category_id) {
    sql += ' AND items.category_id = ?';
    params.push(category_id);
  }

  // Location filter
  if (location) {
    sql += ' AND items.location LIKE ?';
    params.push(`%${location}%`);
  }

  // Date range filters
  if (start_date) {
    sql += ' AND items.item_date >= ?';
    params.push(start_date);
  }
  if (end_date) {
    sql += ' AND items.item_date <= ?';
    params.push(end_date);
  }

  // Type filter
  if (type) {
    sql += ' AND items.type = ?';
    params.push(type);
  }

  // Status filter (defaults to active if not specified, but admin can see all)
  if (status) {
    if (status !== 'all') {
      sql += ' AND items.status = ?';
      params.push(status);
    }
  } else {
    sql += " AND items.status = 'active'";
  }

  // Order by latest first
  sql += ' ORDER BY items.created_at DESC';

  try {
    const items = await dbAll(sql, params);
    return res.status(200).json(items);
  } catch (error) {
    console.error('Fetch items error:', error);
    return res.status(500).json({ error: 'Internal server error while searching items.' });
  }
};

// Get single item details (with contact info privacy for guests)
const getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const item = await dbGet(
      `SELECT items.*, categories.name AS category_name, users.full_name AS reporter_name, users.email AS reporter_email
       FROM items
       JOIN categories ON items.category_id = categories.id
       JOIN users ON items.user_id = users.id
       WHERE items.id = ?`,
      [id]
    );

    if (!item) {
      return res.status(404).json({ error: 'Item posting not found.' });
    }

    // Privacy rule: Only logged in users can see the reporter's email contact details
    let isGuest = true;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      isGuest = false;
    }
    if (req.headers.cookie && req.headers.cookie.includes('token=')) {
      isGuest = false;
    }

    if (isGuest) {
      // Delete sensitive fields for Guest role
      delete item.reporter_email;
      delete item.user_id;
    }

    return res.status(200).json(item);
  } catch (error) {
    console.error('Fetch item details error:', error);
    return res.status(500).json({ error: 'Internal server error while fetching item details.' });
  }
};

// Update item status (active -> claimed -> closed)
const updateItemStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const user_id = req.user.id;
  const user_role = req.user.role;

  if (!status || !['active', 'claimed', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be active, claimed, or closed.' });
  }

  try {
    const item = await dbGet('SELECT * FROM items WHERE id = ?', [id]);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    // Authorized check: only owner of post or admin can change status
    if (item.user_id !== user_id && user_role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to update this item.' });
    }

    await dbRun('UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

    return res.status(200).json({
      message: `Item status successfully updated to "${status}".`,
      item: { ...item, status }
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ error: 'Internal server error updating item status.' });
  }
};

// Retrieve postings of currently logged in user
const getUserItems = async (req, res) => {
  const user_id = req.user.id;

  try {
    const items = await dbAll(
      `SELECT items.*, categories.name AS category_name
       FROM items
       JOIN categories ON items.category_id = categories.id
       WHERE items.user_id = ?
       ORDER BY items.created_at DESC`,
      [user_id]
    );
    return res.status(200).json(items);
  } catch (error) {
    console.error('Get user items error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;
  const user_role = req.user.role;

  try {
    const item = await dbGet('SELECT * FROM items WHERE id = ?', [id]);
    if (!item) {
      return res.status(404).json({ error: 'Item not found.' });
    }

    if (item.user_id !== user_id && user_role !== 'admin') {
      return res.status(403).json({ error: 'You are not authorized to delete this posting.' });
    }

    await dbRun('DELETE FROM items WHERE id = ?', [id]);
    return res.status(200).json({ message: 'Posting successfully deleted.' });
  } catch (error) {
    console.error('Delete item error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Retrieve categories
const getCategories = async (req, res) => {
  try {
    const categories = await dbAll('SELECT * FROM categories ORDER BY name ASC');
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  createItem,
  getItems,
  getItemById,
  updateItemStatus,
  getUserItems,
  deleteItem,
  getCategories
};
