const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', postController.getAllPosts);

// Protected routes - require authentication
router.post('/', authenticateToken, postController.createPost);

// Saved posts route must come before /:id routes
router.get('/saved', authenticateToken, postController.getSavedPosts);

// Routes with :id parameter
router.get('/:id', postController.getPost);
router.put('/:id', authenticateToken, postController.updatePost);
router.delete('/:id', authenticateToken, postController.deletePost);
router.post('/:id/report', authenticateToken, postController.reportPost);
router.post('/:id/like', authenticateToken, postController.toggleLike);
router.post('/:id/save', authenticateToken, postController.toggleSave);
router.post('/:id/comment', authenticateToken, postController.addComment);

// Admin routes
router.get('/stats/admin', authenticateToken, isAdmin, postController.getPostStats);

// Route to get total post count for admin dashboard
router.get('/count', authenticateToken, isAdmin, postController.getPostsCount);

module.exports = router; 