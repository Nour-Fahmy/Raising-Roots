// =================== community.js ===================

// Function to show notifications
function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;

  // Add to document
  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Profile Functions
async function loadProfileContent() {
  const profileContainer = document.getElementById('profile-container');
  let isLoggedIn = false;
  let userData = null;

  // Check if token exists and is valid
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch('https://localhost:3000/api/v1/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        userData = await response.json();
        isLoggedIn = true;
      } else if (response.status === 401 || response.status === 403) {
        // If token is invalid or unauthorized, remove it
        console.warn(`Token invalid or unauthorized (Status: ${response.status}). Removing token.`);
        localStorage.removeItem('token');
      } else {
        // For other non-OK responses (e.g., network issues, server errors), log without removing token
        console.error(`Error verifying token: Status ${response.status}. Token not removed.`);
      }
    } catch (error) {
      console.error('Network error or unhandled exception during token verification:', error);
      // Do NOT remove token for network errors, as it might be temporary
    }
  }

  // Create profile content based on login state
  if (isLoggedIn) {
    profileContainer.innerHTML = `
      <div class="profile-dropdown">
        <button class="profile-btn">
          <img src="${userData?.profilePicture || '../images/default-avatar.png'}" 
               alt="Profile" 
               class="profile-img">
          <span>${userData?.username || 'Profile'}</span>
        </button>
        <div class="dropdown-content">
          <a href="profile.html">View Profile</a>
          <a href="profile.html#baby-info">Baby's Profile</a>
          <a href="shop.html">My Orders</a>
          <a href="#" onclick="handleLogout(event)">Logout</a>
        </div>
      </div>
    `;

    // Add event listener for profile dropdown
    const profileBtn = profileContainer.querySelector('.profile-btn');
    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        profileContainer.querySelector('.profile-dropdown').classList.toggle('active');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.profile-dropdown')) {
          profileContainer.querySelector('.profile-dropdown')?.classList.remove('active');
        }
      });
    }
  } else {
    profileContainer.innerHTML = `
      <div class="auth-message">
        <p>Please use the navigation bar to log in or sign up</p>
      </div>
    `;
  }
}

// Handle logout
async function handleLogout(e) {
  if (e) e.preventDefault();
  
  try {
    // Clear the token first to ensure immediate logout
    localStorage.removeItem('token');
    
    // Try to notify the server about logout
    const response = await fetch('https://localhost:3000/api/v1/users/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    // Redirect back to community page
    window.location.href = './community.html';
  } catch (error) {
    console.error('Error during logout:', error);
    // Still redirect even if server logout fails
    window.location.href = './community.html';
  }
}

// Load profile content when the page loads
window.onload = function() {
  loadProfileContent();
  loadMessages();
  showCommunityPosts();
  
  // Add header search event listener
  const headerSearch = document.querySelector('.search-bar input');
  if (headerSearch) {
    headerSearch.addEventListener('input', handleHeaderSearch);
  }
  
  // Check if we should show the expert section based on URL hash
  if (window.location.hash === '#expert-section') {
    selectChannel('expert');
  }

  // Add expert form event listener here to ensure DOM is ready
  const expertForm = document.getElementById('expert-application-form');
  if (expertForm) {
    console.log('Expert application form found. Attaching event listener.');
    expertForm.addEventListener('submit', async function(event) {
      console.log('Form submission detected.');
      event.preventDefault(); // Prevent default form submission
      console.log('Default submission prevented.');
      const formData = new FormData(expertForm);
      try {
        const response = await fetch('/api/v1/experts/apply', {
          method: 'POST',
          body: formData
        });
        if (response.ok) {
          console.log('Application submitted successfully to backend.');
          expertForm.reset();
          document.getElementById('expert-application-success').classList.remove('hidden');
          setTimeout(() => {
            document.getElementById('expert-application-success').classList.add('hidden');
          }, 4000);
        } else {
          const errorData = await response.json();
          console.error('Backend error:', errorData);
          alert(`There was an error submitting your application: ${errorData.message || 'Please try again.'}`);
        }
      } catch (error) {
        console.error('Network or fetch error:', error);
        alert('There was a network error submitting your application. Please check your connection and try again.');
      }
    });
  } else {
    console.log('Expert application form element not found.');
  }
};

// Function to show community posts (home)
async function showCommunityPosts(page = 1) {
  // Hide all sections
  document.querySelector('#community-section').classList.add('hidden');
  document.querySelector('#expert-section').classList.add('hidden');
  document.querySelector('#dm-section').classList.add('hidden');
  document.querySelector('#saved-posts-section').classList.add('hidden');
  document.querySelector('#expert-application-section').classList.add('hidden');
  
  // Show community posts
  document.querySelector('#community-posts').classList.remove('hidden');
  
  // Update active state in sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector('.nav-item[onclick="showCommunityPosts()"]').classList.add('active');

  // Fetch posts from backend with pagination
  try {
    const response = await fetch(`https://localhost:3000/api/v1/posts?page=${page}&limit=10`);
    if (response.ok) {
      const result = await response.json();
      const postsContainer = document.getElementById('posts-container');
      postsContainer.innerHTML = ''; // Clear existing posts
      
      if (result.data && result.data.length > 0) {
        // Add posts to container
        result.data.forEach(post => {
          postsContainer.appendChild(createPostElement(post));
        });

        // Add pagination controls
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'pagination-btn';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Previous';
        prevButton.disabled = page === 1;
        prevButton.onclick = () => showCommunityPosts(page - 1);
        paginationContainer.appendChild(prevButton);

        // Page numbers
        const totalPages = result.pagination.pages;
        const maxVisiblePages = 5;
        let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
          const pageButton = document.createElement('button');
          pageButton.className = `pagination-btn ${i === page ? 'active' : ''}`;
          pageButton.textContent = i;
          pageButton.onclick = () => showCommunityPosts(i);
          paginationContainer.appendChild(pageButton);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'pagination-btn';
        nextButton.innerHTML = 'Next <i class="fas fa-chevron-right"></i>';
        nextButton.disabled = page === totalPages;
        nextButton.onclick = () => showCommunityPosts(page + 1);
        paginationContainer.appendChild(nextButton);

        // Add pagination info
        const paginationInfo = document.createElement('div');
        paginationInfo.className = 'pagination-info';
        paginationInfo.textContent = `Page ${page} of ${totalPages}`;
        paginationContainer.appendChild(paginationInfo);

        postsContainer.appendChild(paginationContainer);
      } else {
        postsContainer.innerHTML = '<p class="no-posts">No posts yet. Be the first to share!</p>';
      }
    } else {
      console.error('Failed to fetch posts');
    }
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
}

// Function to select and display the active channel
function selectChannel(channel) {
  // Hide all sections
  document.querySelector('#community-posts').classList.add('hidden');
  document.querySelector('#saved-posts-section').classList.add('hidden');
  document.querySelector('#expert-application-section').classList.add('hidden');
  
  // Show the correct channel section and hide others
  const channels = ['community', 'expert', 'dm'];  // Channel names
  channels.forEach(ch => {
    // Hide all channels
    const channelSection = document.querySelector(`#${ch}-section`);
    if (channel === ch) {
      // Show the selected channel
      channelSection.classList.remove('hidden');
      // Load users if DM section is selected
      if (ch === 'dm') {
        loadAllUsers();
      }
    } else {
      // Hide other channels
      channelSection.classList.add('hidden');
    }
  });
  
  // Update active state in sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector(`.nav-item[onclick="selectChannel('${channel}')"]`).classList.add('active');

  // Ensure expert application section is hidden
  document.querySelector('#expert-application-section').classList.add('hidden');
}

// Function to send a message
function sendMessage(type) {
  const input = document.getElementById(`${type}-input`);
  const messageContainer = document.getElementById(`${type}-messages`);
  const text = input.value.trim();
  if (text === '') return;

  // Create a new message element
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  if (type === "expert") messageDiv.classList.add("expert");
  messageDiv.innerHTML = `<strong>You:</strong> ${text}`;
  messageContainer.appendChild(messageDiv);
  input.value = ""; // Clear the input
  messageContainer.scrollTop = messageContainer.scrollHeight;

  saveMessage(type, messageDiv.innerHTML);

  // If it's an expert message, simulate a reply
  if (type === "expert") {
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "expert", "typing");
    typingDiv.innerHTML = `<em>Dr. Maya is typing...</em>`;
    messageContainer.appendChild(typingDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    // Simulate expert reply after a timeout
    setTimeout(() => {
      const reply = generateExpertReply();
      const replyDiv = document.createElement("div");
      replyDiv.classList.add("message", "expert");
      replyDiv.innerHTML = `<strong>Dr. Maya:</strong> ${reply}`;
      messageContainer.removeChild(typingDiv); // Remove typing indicator
      messageContainer.appendChild(replyDiv);
      saveMessage(type, replyDiv.innerHTML);
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }, 1500);
  }
}

// Save message to local storage for persistence
function saveMessage(type, content) {
  const key = `${type}-chat`;
  let stored = JSON.parse(localStorage.getItem(key)) || [];
  stored.push(content);
  localStorage.setItem(key, JSON.stringify(stored));
}

// Load messages from local storage on page load
function loadMessages() {
  ['community', 'expert'].forEach(type => {
    const key = `${type}-chat`;
    const container = document.getElementById(`${type}-messages`);
    if (!container) return;
    const stored = JSON.parse(localStorage.getItem(key)) || [];

    // Display a welcome message for the community chat if no messages exist
    if (type === "community" && stored.length === 0) {
      const welcome = document.createElement("div");
      welcome.classList.add("message");
      welcome.innerHTML = `<strong>Welcome to the Raising Roots Community!</strong> Feel free to share your thoughts, ask questions, and support each other 💬💕`;
      container.appendChild(welcome);
      saveMessage(type, welcome.innerHTML);
    }

    // Render all saved messages
    stored.forEach(msgHTML => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      if (type === "expert") messageDiv.classList.add("expert");
      messageDiv.innerHTML = msgHTML;
      container.appendChild(messageDiv);
    });
  });
}

// Generate a random reply from the expert
function generateExpertReply() {
  const replies = [
    "Make sure to feed your baby every 2–3 hours.",
    "If your baby has a fever over 38°C, consult your pediatrician immediately.",
    "Skin-to-skin contact is great for bonding and temperature regulation.",
    "You can gently massage your baby to help relieve gas and improve sleep."
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// =================== Theme Toggle Logic ===================

document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }

  // Theme toggle click handler
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  });
});

// Go back to the channel selector when clicking the back button
function goBackToChannels() {
  // Hide all chat sections
  document.querySelector('#community-section').classList.add('hidden');
  document.querySelector('#expert-section').classList.add('hidden');
  document.querySelector('#dm-section').classList.add('hidden');

  // Show the channel selector
  document.querySelector('#channel-selector').classList.remove('hidden');
  
  // Show the community posts section
  document.querySelector('#community-posts').classList.remove('hidden');
}

// Community Posts Functions
function showCreatePostForm() {
  const form = document.getElementById('create-post-form');
  form.classList.remove('hidden');
  // Add a small delay before adding active class for animation
  setTimeout(() => {
    form.classList.add('active');
  }, 10);
}

function hideCreatePostForm() {
  const form = document.getElementById('create-post-form');
  form.classList.remove('active');
  // Wait for animation to complete before hiding
  setTimeout(() => {
    form.classList.add('hidden');
    // Clear form fields
    document.getElementById('post-title').value = '';
    document.getElementById('post-content').value = '';
    document.getElementById('post-category').value = '';
  }, 300);
}

// Function to submit a new post
async function submitPost(event) {
  event.preventDefault();
  
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  const category = document.getElementById('post-category').value;
  
  // Get the authentication token
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Please login to create a post', 'error');
    window.location.href = 'login.html?redirect=community.html';
    return;
  }

  try {
    const response = await fetch('https://localhost:3000/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        content,
        category
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create post');
    }

    const result = await response.json();
    showNotification('Post created successfully!', 'success');
    hideCreatePostForm();
    showCommunityPosts(); // Refresh the posts list
  } catch (error) {
    console.error('Error creating post:', error);
    showNotification(error.message || 'Failed to create post', 'error');
  }
}

// Function to create a post element
function createPostElement(post) {
  const template = document.getElementById('postCardTemplate');
  const postElement = template.content.cloneNode(true);
  
  const postCard = postElement.querySelector('.post-card');
  postCard.dataset.postId = post._id;
  
  // Set author info with fallback
  const authorAvatar = postElement.querySelector('.author-avatar');
  if (authorAvatar) {
    authorAvatar.src = '../images/default-avatar.png';
  }

  const authorName = postElement.querySelector('.author-name');
  if (authorName) {
    authorName.textContent = post.author?.username || 'Anonymous';
  }

  const postDate = postElement.querySelector('.post-date');
  if (postDate) {
    postDate.textContent = new Date(post.createdAt).toLocaleDateString();
  }
  
  // Set post content
  const postTitle = postElement.querySelector('.post-title');
  if (postTitle) {
    postTitle.textContent = post.title;
  }

  const postText = postElement.querySelector('.post-text');
  if (postText) {
    postText.textContent = post.content;
  }

  const postCategory = postElement.querySelector('.post-category');
  if (postCategory) {
    postCategory.textContent = post.category;
  }
  
  // Set likes and comments count
  const likesCount = postElement.querySelector('.likes-count');
  if (likesCount) {
    likesCount.textContent = post.likes?.length || 0;
  }
  
  const commentsCount = postElement.querySelector('.comments-count');
  if (commentsCount) {
    commentsCount.textContent = post.comments?.length || 0;
  }

  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('userId');

  // Set up like button
  const likeButton = postElement.querySelector('.like-btn');
  if (likeButton) {
    // Check if the post is already liked by the current user
    const isLiked = post.likes && post.likes.some(likeId => likeId.toString() === currentUserId);
    
    if (isLiked) {
      likeButton.classList.add('liked');
      const icon = likeButton.querySelector('i');
      icon.classList.remove('far');
      icon.classList.add('fas');
      icon.style.setProperty('color', '#e74c3c', 'important');
    }
    
    // Attach like function to button with proper event handling
    likeButton.addEventListener('click', function(e) {
      e.preventDefault();
      likePost(this);
    });
  }
  
  // Set up comment button
  const commentButton = postElement.querySelector('.comment-btn');
  if (commentButton) {
    commentButton.onclick = () => showComments(commentButton);
  }

  // Set up save button
  const saveButton = postElement.querySelector('.save-btn');
  if (saveButton) {
    const isSaved = post.savedBy && post.savedBy.includes(currentUserId);
    if (isSaved) {
      saveButton.classList.add('saved');
      const icon = saveButton.querySelector('i');
      icon.classList.remove('far');
      icon.classList.add('fas');
    }
    saveButton.onclick = () => toggleSavePost(saveButton);
  }
  
  // Set up report button
  const reportButton = postElement.querySelector('.report-btn');
  if (reportButton) {
    reportButton.onclick = () => reportPost(post._id);
  }
  
  // Add comments section
  const commentsSection = document.createElement('div');
  commentsSection.className = 'comments-section hidden';
  commentsSection.innerHTML = `
    <div class="comments-list"></div>
    <div class="comment-form">
      <textarea class="comment-input" placeholder="Write a comment..."></textarea>
      <button class="submit-comment" onclick="submitComment('${post._id}', this.previousElementSibling)">Comment</button>
    </div>
  `;
  postCard.appendChild(commentsSection);
  
  return postElement;
}

// Function to like a post
async function likePost(button) {
  try {
    const postId = button.closest('.post-card').dataset.postId;
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
  
    if (!token) {
      return;
    }

    // Check if the post is already liked by the user
    const isCurrentlyLiked = button.classList.contains('liked');

    const response = await fetch(`https://localhost:3000/api/v1/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to like post');
    }
    
    const result = await response.json();
    const likesCount = button.querySelector('.likes-count');
    
    // Check if result.data exists (API response structure)
    const likes = result.data ? result.data.likes : result.likes;
    if (!likes) {
      throw new Error('Invalid response format from server');
    }
    
    likesCount.textContent = likes.length;
    
    // Convert all IDs to strings for comparison
    const isLiked = likes.some(likeId => likeId.toString() === userId);
    
    // Update button and icon classes
    if (isLiked) {
      button.classList.add('liked');
      const icon = button.querySelector('i');
      icon.classList.remove('far');
      icon.classList.add('fas');
      icon.style.setProperty('color', '#e74c3c', 'important');
    } else {
      button.classList.remove('liked');
      const icon = button.querySelector('i');
      icon.classList.remove('fas');
      icon.classList.add('far');
      icon.style.removeProperty('color');
    }
    
    // Add animation
    const icon = button.querySelector('i');
    icon.classList.add('like-animation');
    setTimeout(() => {
      icon.classList.remove('like-animation');
    }, 300);
    
  } catch (error) {
    console.error('Error liking post:', error);
  }
}

function showComments(button) {
  const postCard = button.closest('.post-card');
  const postId = postCard.dataset.postId;
  const commentsSection = postCard.querySelector('.comments-section');
  
  if (!commentsSection) {
    // Create comments section if it doesn't exist
    const newCommentsSection = document.createElement('div');
    newCommentsSection.className = 'comments-section';
    newCommentsSection.innerHTML = `
      <div class="comments-list"></div>
      <div class="comment-form">
        <textarea placeholder="Write a comment..." class="comment-input"></textarea>
        <button class="submit-comment">Post</button>
      </div>
    `;
    postCard.appendChild(newCommentsSection);
    
    // Add event listener for comment submission
    const submitButton = newCommentsSection.querySelector('.submit-comment');
    const commentInput = newCommentsSection.querySelector('.comment-input');
    
    submitButton.addEventListener('click', () => submitComment(postId, commentInput));
  } else {
    // Toggle comments section visibility
    commentsSection.classList.toggle('hidden');
  }
  
  // Load comments if they haven't been loaded yet
  if (!commentsSection || !commentsSection.dataset.loaded) {
    loadComments(postId);
  }
}

async function loadComments(postId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`https://localhost:3000/api/v1/posts/${postId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to load comments');
    }

    const data = await response.json();
    const commentsList = document.querySelector(`[data-post-id="${postId}"] .comments-list`);
    
    if (commentsList) {
      commentsList.innerHTML = data.data.comments.map(comment => `
        <div class="comment">
          <div class="comment-header">
            <span class="comment-author">${comment.user.username}</span>
            <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="comment-content">${comment.content}</div>
        </div>
      `).join('');
      
      commentsList.dataset.loaded = 'true';
    }
  } catch (error) {
    console.error('Error loading comments:', error);
    showNotification('Failed to load comments', 'error');
  }
}

async function submitComment(postId, inputElement) {
  try {
    const content = inputElement.value.trim();
    if (!content) {
      showNotification('Please enter a comment', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please login to comment', 'error');
      return;
    }

    const response = await fetch(`https://localhost:3000/api/v1/posts/${postId}/comment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      throw new Error('Failed to post comment');
    }

    const data = await response.json();
    inputElement.value = '';
    
    // Reload comments to show the new one
    loadComments(postId);
    
    // Update comment count
    const commentCount = document.querySelector(`[data-post-id="${postId}"] .comments-count`);
    if (commentCount) {
      commentCount.textContent = data.data.comments.length;
    }
    
    showNotification('Comment posted successfully', 'success');
  } catch (error) {
    console.error('Error posting comment:', error);
    showNotification('Failed to post comment', 'error');
  }
}

function filterPosts() {
  const category = document.getElementById('category-filter').value;
  const searchTerm = document.getElementById('search-posts').value.toLowerCase();
  const posts = document.querySelectorAll('.post-card');
  
  posts.forEach(post => {
    const postCategory = post.querySelector('.category').textContent.toLowerCase();
    const postTitle = post.querySelector('h3').textContent.toLowerCase();
    const postContent = post.querySelector('.post-content p').textContent.toLowerCase();
    
    const matchesCategory = category === 'all' || postCategory === category;
    const matchesSearch = searchTerm === '' || 
      postTitle.includes(searchTerm) || 
      postContent.includes(searchTerm);
    
    post.style.display = matchesCategory && matchesSearch ? 'block' : 'none';
  });
}

// Add event listener for search input
const searchInput = document.getElementById('search-posts');
if (searchInput) {
  searchInput.addEventListener('input', filterPosts);
}

// DM Functions
let currentUser = null; // Stores the currently selected user's info
let authenticatedUserId = null; // Stores the ID of the logged-in user

// Initialize authenticatedUserId on page load
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT payload
      authenticatedUserId = payload.userId;
    } catch (e) {
      console.error('Error decoding token:', e);
      localStorage.removeItem('token'); // Invalid token, remove it
    }
  }
});

// Function to load all users
async function loadAllUsers() {
  const userList = document.querySelector('.users');
  if (!userList) return;

  // Show a simple message to search for users
  userList.innerHTML = `
    <div class="no-results">
      <i class="fas fa-search" style="font-size: 24px; margin-bottom: 10px;"></i>
      <p>Search for a user to start chatting</p>
    </div>
  `;
}

// Update searchUsers function to use the API
async function searchUsers(query) {
  const userList = document.querySelector('.users');
  if (!userList) return;

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please log in to search users', 'error');
      return;
    }

    // Only add query parameter if there's actually a search term
    const url = query.trim() 
      ? `https://localhost:3000/api/v1/users/search?query=${encodeURIComponent(query)}`
      : 'https://localhost:3000/api/v1/users/search';

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const users = await response.json();
      userList.innerHTML = '';
      
      if (users.length === 0) {
        userList.innerHTML = '<div class="no-results">No users found</div>';
        return;
      }

      users.forEach(user => {
        // Don't show the current user in the list
        if (user._id === localStorage.getItem('userId')) return;

        const userElement = document.createElement('div');
        userElement.className = 'user-item';
        userElement.innerHTML = `
          <img src="${user.profilePicture || '../images/default-avatar.png'}" alt="${user.username}" class="user-avatar">
          <div class="user-info">
            <h4>${user.username}</h4>
            <p class="status">${user.status || 'Available'}</p>
          </div>
        `;
        userElement.onclick = () => selectUser(userElement, user.username, user._id);
        userList.appendChild(userElement);
      });
    } else {
      showNotification('Error searching users', 'error');
      userList.innerHTML = '<div class="no-results">Error searching users</div>';
    }
  } catch (error) {
    console.error('Error searching users:', error);
    showNotification('Error searching users', 'error');
    userList.innerHTML = '<div class="no-results">Error searching users</div>';
  }
}

async function selectUser(userElement, username, userId) {
    // Remove active class from all user items
  document.querySelectorAll('.user-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to selected user
  userElement.classList.add('active');
  
    // Store the receiver ID in the dm-section dataset
    const dmSection = document.getElementById('dm-section');
    dmSection.dataset.receiverId = userId;

    // Show chat interface
  document.querySelector('.chat-placeholder').classList.add('hidden');
  document.querySelector('.chat-messages').classList.remove('hidden');
  
    // Load chat history
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please log in to view messages', 'error');
        return;
    }

    const currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
    await loadDMMessages(currentUserId, userId);
}

async function loadDMMessages(user1Id, user2Id) {
    const messagesContainer = document.getElementById('dm-messages');
    messagesContainer.innerHTML = '<div class="loading">Loading messages...</div>';

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please log in to view messages', 'error');
            return;
        }

        const response = await fetch(`https://localhost:3000/api/v1/messages/${user1Id}/${user2Id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const result = await response.json();
            const messages = result.data;
            messagesContainer.innerHTML = '';
            
            if (messages.length === 0) {
                messagesContainer.innerHTML = '<div class="no-messages">No messages yet. Start the conversation!</div>';
                return;
            }

            const currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
            messages.forEach(message => {
                messagesContainer.appendChild(createMessageElement(message, currentUserId));
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else {
            const errorData = await response.json();
            console.error('Error loading messages (server response):', response.status, errorData);
            showNotification(`Error loading messages: ${errorData.message || 'Unknown error'}`, 'error');
            messagesContainer.innerHTML = `<div class="no-messages">Error loading messages: ${errorData.message || 'Please try again.'}</div>`;
        }
    } catch (error) {
        console.error('Network error or unhandled exception during message load:', error);
        showNotification('Network error loading messages. Please check your connection and try again.', 'error');
        messagesContainer.innerHTML = '<div class="no-messages">Network error. Please try again.</div>';
    }
}

async function sendDMMessage() {
  const input = document.getElementById('dm-input');
    const content = input.value.trim();
    const receiverId = document.getElementById('dm-section').dataset.receiverId;

    if (!content || !receiverId) return;

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please log in to send messages', 'error');
            return;
        }

        const response = await fetch('https://localhost:3000/api/v1/messages/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                receiverId,
                content
            })
        });

        if (response.ok) {
  input.value = '';
            const result = await response.json();
            const message = result.data;
            const messagesContainer = document.getElementById('dm-messages');
            const currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
            messagesContainer.appendChild(createMessageElement(message, currentUserId));
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } else {
            const errorData = await response.json();
            console.error('Error sending message (server response):', response.status, errorData);
            showNotification(`Error sending message: ${errorData.message || 'Unknown error'}`, 'error');
        }
    } catch (error) {
        console.error('Network error or unhandled exception during message send:', error);
        showNotification('Network error sending message. Please check your connection and try again.', 'error');
    }
}

function createMessageElement(message, currentUserId) {
  const div = document.createElement('div');
  div.classList.add('message');

  // Determine if the message was sent by the current user
  const isSentByMe = message.sender._id === currentUserId; // Access _id from populated sender
  if (isSentByMe) {
    div.classList.add('sent');
  } else {
    div.classList.add('received');
  }
  
  const senderUsername = message.sender.username; // Access username from populated sender
  const messageTime = new Date(message.timestamp).toLocaleTimeString();
  
  div.innerHTML = `
    <div class="message-content">
      <strong>${senderUsername}:</strong> ${message.content}
      <div class="message-time">${messageTime}</div>
    </div>
  `;
  
  return div;
}

// Add event listener for DM input
document.getElementById('dm-input')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    sendDMMessage();
  }
});

// Save/Unsave Post Functionality
async function toggleSavePost(button) {
  try {
    const postCard = button.closest('.post-card');
    if (!postCard) {
      throw new Error('Post card not found');
    }

    const postId = postCard.dataset.postId;
    if (!postId) {
      throw new Error('Post ID not found');
    }

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    if (!token) {
      return;
    }
    
    const response = await fetch(`https://localhost:3000/api/v1/posts/${postId}/save`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to save post');
    }
    
    const result = await response.json();
    
    // Check if result.data exists (API response structure)
    const savedBy = result.data ? result.data.savedBy : result.savedBy;
    if (!savedBy) {
      throw new Error('Invalid response format from server');
    }
    
    const isSaved = savedBy.includes(userId);
    
    // Update button state
    button.classList.toggle('saved', isSaved);
    const icon = button.querySelector('i');
    icon.classList.toggle('far', !isSaved);
    icon.classList.toggle('fas', isSaved);
    
    // Add animation
    icon.classList.add('save-animation');
    setTimeout(() => {
      icon.classList.remove('save-animation');
    }, 300);
    
  } catch (error) {
    console.error('Error saving post:', error);
  }
}

async function showSavedPosts() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please login to view saved posts', 'error');
      return;
    }

  // Hide all sections
    document.querySelectorAll('section').forEach(section => {
      section.classList.add('hidden');
    });
  
  // Show saved posts section
    const savedPostsSection = document.getElementById('saved-posts-section');
    savedPostsSection.classList.remove('hidden');
  
  // Update active state in sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector('.nav-item[onclick="showSavedPosts()"]').classList.add('active');

    // Fetch saved posts from server
    const response = await fetch('https://localhost:3000/api/v1/posts/saved', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch saved posts');
    }

    const result = await response.json();
    const savedPosts = result.data;

    // Clear existing posts
  const container = document.getElementById('saved-posts-container');
  container.innerHTML = '';

    if (savedPosts.length === 0) {
      container.innerHTML = '<p class="no-posts">No saved posts yet</p>';
      return;
    }

    // Add saved posts to container
    savedPosts.forEach(post => {
      const postElement = createPostElement(post);
      container.appendChild(postElement);
    });

  } catch (error) {
    console.error('Error loading saved posts:', error);
    showNotification('Failed to load saved posts', 'error');
  }
}

// Initialize profile menu on page load
document.addEventListener('DOMContentLoaded', () => {
  const profileLink = document.querySelector('.profile-link');
  if (profileLink) {
    profileLink.addEventListener('click', (e) => {
      e.preventDefault();
      showProfileMenu();
    });
  }
});

// Show Expert Application Section
function showExpertApplicationSection() {
  // Hide all sections
  document.querySelector('#community-posts').classList.add('hidden');
  document.querySelector('#community-section').classList.add('hidden');
  document.querySelector('#expert-section').classList.add('hidden');
  document.querySelector('#dm-section').classList.add('hidden');
  document.querySelector('#saved-posts-section').classList.add('hidden');
  
  // Show expert application section
  document.querySelector('#expert-application-section').classList.remove('hidden');
  
  // Update active state in sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector('.nav-item[onclick="showExpertApplicationSection()"]').classList.add('active');
}

// Function to handle header search
function handleHeaderSearch(event) {
  const searchTerm = event.target.value.toLowerCase().trim();
  const posts = document.querySelectorAll('.post-card');
  const users = document.querySelectorAll('.user-item');
  
  // Search through posts
  posts.forEach(post => {
    const title = post.querySelector('.post-title')?.textContent.toLowerCase() || '';
    const content = post.querySelector('.post-text')?.textContent.toLowerCase() || '';
    const author = post.querySelector('.author-name')?.textContent.toLowerCase() || '';
    
    const isVisible = title.includes(searchTerm) || 
                     content.includes(searchTerm) || 
                     author.includes(searchTerm);
    
    post.style.display = isVisible ? 'block' : 'none';
  });
  
  // Search through users in DM section
  users.forEach(user => {
    const username = user.querySelector('h4')?.textContent.toLowerCase() || '';
    const isVisible = username.includes(searchTerm);
    user.style.display = isVisible ? 'flex' : 'none';
  });
}

// Function to report a post
async function reportPost(postId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please login to report posts', 'error');
      return;
    }

    const reason = prompt('Please enter the reason for reporting this post:');
    if (!reason) return; // User cancelled the prompt

    const response = await fetch(`https://localhost:3000/api/v1/posts/${postId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        reason,
        status: 'pending' // Initial status of the report
      })
    });

    if (!response.ok) {
      throw new Error('Failed to report post');
    }

    const result = await response.json();
    
    // Check if we have a valid report ID in the response
    if (result.data && result.data._id) {
      // Store report ID for tracking
      localStorage.setItem(`report_${postId}`, result.data._id);
      showNotification('Post reported successfully. Our moderators will review it shortly.', 'success');
      // Start polling for report status
      checkReportStatus(postId, result.data._id);
    } else {
      showNotification('Post reported successfully.', 'success');
    }
  } catch (error) {
    console.error('Error reporting post:', error);
    showNotification('Failed to report post', 'error');
  }
}

// Function to check report status
async function checkReportStatus(postId, reportId) {
  // Don't proceed if we don't have a valid report ID
  if (!reportId) {
    console.warn('No report ID provided for status check');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`https://localhost:3000/api/v1/posts/${postId}/report/${reportId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.warn('Failed to fetch report status:', response.status);
      return;
    }

    const result = await response.json();
    const status = result.data?.status;

    if (!status) {
      console.warn('No status found in response');
      return;
    }

    switch (status) {
      case 'reviewed':
        showNotification('Your report has been reviewed by our moderators.', 'info');
        break;
      case 'action_taken':
        showNotification('Action has been taken based on your report.', 'success');
        break;
      case 'dismissed':
        showNotification('After review, no action was needed for this post.', 'info');
        break;
      case 'pending':
        // If the report is still pending, check again in 5 minutes
        setTimeout(() => checkReportStatus(postId, reportId), 5 * 60 * 1000);
        break;
    }
  } catch (error) {
    console.error('Error checking report status:', error);
  }
}
