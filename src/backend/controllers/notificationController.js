const { dbAll, dbRun } = require('../config/db');

// Get all notifications for logged in user
const getNotifications = async (req, res) => {
  const user_id = req.user.id;

  try {
    const notifications = await dbAll(
      `SELECT notifications.*, items.title AS item_title
       FROM notifications
       LEFT JOIN items ON notifications.item_id = items.id
       WHERE notifications.user_id = ?
       ORDER BY notifications.created_at DESC`,
      [user_id]
    );
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Mark single notification as read
const markAsRead = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    await dbRun(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, user_id]
    );
    return res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  const user_id = req.user.id;

  try {
    await dbRun(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
      [user_id]
    );
    return res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
