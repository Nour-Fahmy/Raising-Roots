const Post = require('../models/post');
const { AppError, catchAsync } = require('../middleware/errorHandling');

// Get all posts with filtering and pagination
exports.getAllPosts = catchAsync(async (req, res) => {
  const { status, category, search, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$text = { $search: search };
  }

  // Execute query with pagination
  const posts = await Post.find(query)
    .populate('author', 'username')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  // Get total count for pagination
  const total = await Post.countDocuments(query);

  res.status(200).json({
    success: true,
    data: posts,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
});

// Get a single post
exports.getPost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'username')
    .populate('comments.user', 'username');

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  res.status(200).json({
    success: true,
    data: post
  });
});

// Create a new post
exports.createPost = catchAsync(async (req, res) => {
  const post = await Post.create({
    ...req.body,
    author: req.user.userId
  });

  res.status(201).json({
    success: true,
    data: post
  });
});

// Update a post
exports.updatePost = catchAsync(async (req, res) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  res.status(200).json({
    success: true,
    data: post
  });
});

// Delete a post
exports.deletePost = catchAsync(async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);

  if (!post) {
    throw new AppError('Post not found', 404);
  }

  res.status(200).json({
    success: true,
    data: null
  });
});

// Report a post
exports.reportPost = catchAsync(async (req, res) => {
  const { reason } = req.body;
  
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  // Check if user has already reported
  const hasReported = post.reports.some(report => 
    report.user.toString() === req.user.userId
  );

  if (hasReported) {
    throw new AppError('You have already reported this post', 400);
  }

  post.reports.push({
    user: req.user.userId,
    reason
  });

  // Update status to reported if it reaches threshold
  if (post.reports.length >= 3) {
    post.status = 'reported';
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// Like/Unlike a post
exports.toggleLike = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const likeIndex = post.likes.indexOf(req.user.userId);
  
  if (likeIndex === -1) {
    post.likes.push(req.user.userId);
  } else {
    post.likes.splice(likeIndex, 1);
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// Add a comment
exports.addComment = catchAsync(async (req, res) => {
  const { content } = req.body;
  
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  post.comments.push({
    user: req.user.userId,
    content
  });

  await post.save();

  // Populate the new comment's user info
  await post.populate('comments.user', 'username');

  res.status(200).json({
    success: true,
    data: post
  });
});

// Get post statistics for admin dashboard
exports.getPostStats = catchAsync(async (req, res) => {
  const stats = await Post.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const categoryStats = await Post.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      statusStats: stats,
      categoryStats
    }
  });
}); 