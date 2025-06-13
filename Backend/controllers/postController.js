const Post = require('../models/post');
const { AppError, catchAsync } = require('../middleware/errorHandling');

// Get all posts with filtering and pagination
exports.getAllPosts = catchAsync(async (req, res) => {
  const { status, category, search, page = 1, limit = 10 } = req.query;
  
  // Build query
  const query = {};
  // Only show active posts by default unless status is explicitly specified
  query.status = status || 'active';
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } }
    ];
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
  try {
    const { status, comments } = req.body;
    
    // Add debug logging
    console.log('Request body:', req.body);
    console.log('Received status:', status);
    console.log('Status type:', typeof status);
    
    // Validate status if provided
    if (!status) {
      throw new AppError('Status is required', 400);
    }

    if (!['active', 'reported', 'pending'].includes(status)) {
      console.log('Invalid status value:', status);
      console.log('Allowed values:', ['active', 'reported', 'pending']);
      throw new AppError(`Invalid status value: ${status}. Allowed values are: active, reported, pending`, 400);
    }

    // Find the post first
    const post = await Post.findById(req.params.id);
    if (!post) {
      throw new AppError('Post not found', 404);
    }

    // Update the post
    try {
      post.status = status;
      if (comments) {
        post.comments = comments;
      }
      const savedPost = await post.save();
      console.log('Post saved successfully:', savedPost);
      
      res.status(200).json({
        success: true,
        data: savedPost
      });
    } catch (saveError) {
      console.error('Error saving post:', saveError);
      if (saveError.name === 'ValidationError') {
        throw new AppError(saveError.message, 400);
      }
      throw new AppError('Failed to save post: ' + saveError.message, 500);
    }
  } catch (error) {
    console.error('Error in updatePost:', error);
    if (error.name === 'ValidationError') {
      throw new AppError(error.message, 400);
    }
    if (error.name === 'AppError') {
      throw error;
    }
    throw new AppError('Failed to update post: ' + error.message, 500);
  }
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

// Get post statistics for admin
exports.getPostStats = catchAsync(async (req, res) => {
  const stats = await Post.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Get total posts
  const totalPosts = await Post.countDocuments();

  // Get recent posts (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentPosts = await Post.countDocuments({
    createdAt: { $gte: sevenDaysAgo }
  });

  // Get most active categories
  const categoryStats = await Post.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 5
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalPosts,
      recentPosts,
      statusBreakdown: stats,
      topCategories: categoryStats
    }
  });
});

// Toggle save/unsave a post
exports.toggleSave = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const saveIndex = post.savedBy.indexOf(req.user.userId);
  
  if (saveIndex === -1) {
    post.savedBy.push(req.user.userId);
  } else {
    post.savedBy.splice(saveIndex, 1);
  }

  await post.save();

  res.status(200).json({
    success: true,
    data: post
  });
});

// Get user's saved posts
exports.getSavedPosts = catchAsync(async (req, res) => {
  const posts = await Post.find({ savedBy: req.user.userId })
    .populate('author', 'username')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: posts
  });
}); 