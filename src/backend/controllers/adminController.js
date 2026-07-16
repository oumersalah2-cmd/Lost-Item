const { dbGet, dbAll, dbRun } = require('../config/db');

// Retrieve global system statistics
const getStats = async (req, res) => {
  try {
    // Total users count
    const totalUsers = await dbGet("SELECT COUNT(*) AS count FROM users WHERE role = 'user'");
    
    // Total lost items
    const totalLost = await dbGet("SELECT COUNT(*) AS count FROM items WHERE type = 'lost'");
    
    // Total found items
    const totalFound = await dbGet("SELECT COUNT(*) AS count FROM items WHERE type = 'found'");
    
    // Total resolved (status = 'claimed')
    const totalClaimed = await dbGet("SELECT COUNT(*) AS count FROM items WHERE status = 'claimed'");
    
    // Total pending (status = 'active')
    const totalActive = await dbGet("SELECT COUNT(*) AS count FROM items WHERE status = 'active'");

    // Total closed
    const totalClosed = await dbGet("SELECT COUNT(*) AS count FROM items WHERE status = 'closed'");

    return res.status(200).json({
      totalUsers: totalUsers.count,
      totalLost: totalLost.count,
      totalFound: totalFound.count,
      totalClaimed: totalClaimed.count,
      totalActive: totalActive.count,
      totalClosed: totalClosed.count
    });
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    return res.status(500).json({ error: 'Internal server error while retrieving system metrics.' });
  }
};

// Retrieve list of all registered users
const getUsers = async (req, res) => {
  try {
    const users = await dbAll(
      `SELECT id, full_name, email, role, is_active, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Toggle user account activation status (Ban/Unban)
const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body; // expected 0 (banned) or 1 (active)

  if (is_active !== 0 && is_active !== 1) {
    return res.status(400).json({ error: 'Invalid is_active value. Must be 0 or 1.' });
  }

  try {
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot ban an administrator account.' });
    }

    await dbRun('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [is_active, id]);

    return res.status(200).json({
      message: `User account has been successfully ${is_active ? 'activated' : 'suspended'}.`,
      user: { ...user, is_active }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ error: 'Internal server error while updating user account status.' });
  }
};

module.exports = {
  getStats,
  getUsers,
  toggleUserStatus
};
