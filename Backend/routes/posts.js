const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateToken = require('../middleware/auth');
const { AuthorizationError } = require('../middleware/errorHandling');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    throw new AuthorizationError('Only admins can perform this action');
  }
  next();
};

// Public routes
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPost);

// Protected routes (require authentication)
router.use(authenticateToken);

// User routes
router.post('/', postController.createPost);
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comment', postController.addComment);
router.post('/:id/report', postController.reportPost);

// Admin only routes
router.get('/stats', isAdmin, postController.getPostStats);
router.put('/:id', isAdmin, postController.updatePost);
router.delete('/:id', isAdmin, postController.deletePost);

module.exports = router; 