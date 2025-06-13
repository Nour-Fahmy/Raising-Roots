const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', postController.getAllPosts);

// Admin routes - must come before /:id routes
router.get('/stats/admin', isAdmin, postController.getPostStats);

// Protected routes
router.get('/:id', postController.getPost);
router.post('/', postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);
router.post('/:id/report', postController.reportPost);
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comment', postController.addComment);

module.exports = router; 