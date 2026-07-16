require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const { initDatabase } = require('./config/db');
const auth = require('./controllers/authController');
const items = require('./controllers/itemController');
const notifications = require('./controllers/notificationController');
const admin = require('./controllers/adminController');
const { authenticateToken, authorizeAdmin } = require('./middleware/authMiddleware');
const upload = require('./middleware/uploadMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Express Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup static folders
const frontendDir = path.join(__dirname, '..', 'frontend');
const uploadsDir = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded item images
app.use('/uploads', express.static(uploadsDir));

// Serve frontend assets (pages, css, js)
app.use(express.static(frontendDir));

// API Routes

// 1. Authentication Endpoints
app.post('/api/auth/register', auth.register);
app.post('/api/auth/login', auth.login);
app.post('/api/auth/logout', auth.logout);
app.get('/api/auth/me', authenticateToken, auth.me);

// 2. Items Listings & Management Endpoints
app.get('/api/items/categories', items.getCategories);
app.get('/api/items/my', authenticateToken, items.getUserItems);
app.get('/api/items/:id', items.getItemById);
app.get('/api/items', items.getItems);
app.post('/api/items', authenticateToken, upload.single('image'), items.createItem);
app.put('/api/items/:id/status', authenticateToken, items.updateItemStatus);
app.delete('/api/items/:id', authenticateToken, items.deleteItem);

// 3. User Notifications Endpoints
app.get('/api/notifications', authenticateToken, notifications.getNotifications);
app.put('/api/notifications/read-all', authenticateToken, notifications.markAllAsRead);
app.put('/api/notifications/:id/read', authenticateToken, notifications.markAsRead);

// 4. Admin Portal Endpoints
app.get('/api/admin/stats', authenticateToken, authorizeAdmin, admin.getStats);
app.get('/api/admin/users', authenticateToken, authorizeAdmin, admin.getUsers);
app.put('/api/admin/users/:id/status', authenticateToken, authorizeAdmin, admin.toggleUserStatus);

// Catch-all route to serve the landing page for any unknown routes (or handle as SPA if desired, 
// but since we're using static HTML files, we will serve index.html by default)
app.get('*', (req, res, next) => {
  // If request is for an API, return 404
  if (req.url.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found.' });
  }
  // Otherwise serve landing page
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Initialize DB and start server
const startServer = async () => {
  console.log('Initializing CampusTrack Database...');
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` CampusTrack Web Server is running on port ${PORT}`);
    console.log(` Local URL: http://localhost:${PORT}`);
    console.log(`===================================================`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
