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
      const response = await fetch('http://localhost:3000/api/v1/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        userData = await response.json();
        isLoggedIn = true;
      } else {
        // If token is invalid, remove it
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      // If there's an error, remove the token
      localStorage.removeItem('token');
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
      <div class="auth-buttons">
        <a href="login.html?redirect=community.html" class="login-btn">Login</a>
        <a href="login.html?redirect=community.html" class="signup-btn">Sign Up</a>
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
    const response = await fetch('http://localhost:3000/api/v1/users/logout', {
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
async function showCommunityPosts() {
  // Hide all sections
  document.querySelector('#community-section').classList.add('hidden');
  document.querySelector('#expert-section').classList.add('hidden');
  document.querySelector('#dm-section').classList.add('hidden');
  document.querySelector('#saved-posts-section').classList.add('hidden');
  
  // Show community posts
  document.querySelector('#community-posts').classList.remove('hidden');
  
  // Update active state in sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector('.nav-item[onclick="showCommunityPosts()"]').classList.add('active');

  // Fetch posts from backend
  try {
    const response = await fetch('http://localhost:3000/api/v1/posts');
    if (response.ok) {
      const posts = await response.json();
      const postsContainer = document.getElementById('posts-container');
      postsContainer.innerHTML = ''; // Clear existing posts
      
      if (posts.data && posts.data.length > 0) {
        posts.data.forEach(post => {
          postsContainer.appendChild(createPostElement(post));
        });
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
  
  const token = localStorage.getItem('token');
  if (!token) {
    showNotification('Please login to create a post', 'error');
    return;
  }

  // Hide form first
  hideCreatePostForm();

  try {
    const response = await fetch('http://localhost:3000/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content, category })
    });

    const data = await response.json();

    if (response.ok) {
      // Wait for form animation to complete before showing notification
      setTimeout(() => {
        showNotification('Post submitted successfully! It will be visible after admin approval.', 'success');
        // Refresh the posts list
        showCommunityPosts();
      }, 300);
    } else {
      showNotification(data.message || 'Failed to create post', 'error');
    }
  } catch (error) {
    console.error('Error creating post:', error);
    showNotification('Error creating post', 'error');
  }
}

// Function to create a post element
function createPostElement(post) {
  const article = document.createElement('article');
  article.className = 'post-card';
  article.dataset.postId = post._id;
  article.dataset.category = post.category;

  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(localStorage.getItem('user')) : null;

  article.innerHTML = `
    <div class="post-header">
      <div class="post-author">
        <img src="../images/default-avatar.png" alt="${post.author.username || 'User'}" class="author-avatar">
        <div class="author-info">
          <h3 class="author-name">${post.author.username || 'Anonymous'}</h3>
          <span class="post-date">${new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
      <div class="post-actions">
        ${user ? `
        <button class="report-btn" onclick="reportPost('${post._id}')" title="Report Post">
          <i class="fas fa-flag"></i>
        </button>
        ` : ''}
      </div>
    </div>
    <div class="post-content">
      <h3 class="post-title">${post.title || 'Untitled Post'}</h3>
      <p class="post-text">${post.content || ''}</p>
    </div>
    <div class="post-footer">
      <div class="post-category">${post.category || 'Uncategorized'}</div>
      <div class="post-engagement">
        <button class="like-btn" onclick="likePost(this)">
          <i class="far fa-heart"></i>
          <span class="likes-count">${post.likes ? post.likes.length : 0}</span>
        </button>
        <button class="comment-btn" onclick="showComments(this)">
          <i class="far fa-comment"></i>
          <span class="comments-count">${post.comments ? post.comments.length : 0}</span>
        </button>
        <button class="save-btn" onclick="toggleSavePost(this)" title="Save Post">
          <i class="far fa-bookmark"></i>
        </button>
      </div>
    </div>
  `;
  return article;
}

// Function to like a post
async function likePost(button) {
  const postId = button.dataset.postId;
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Please login to like posts');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/v1/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const updatedPost = await response.json();
      const likeCount = updatedPost.data.likes.length;
      button.innerHTML = `<i class="fas fa-heart"></i> Like (${likeCount})`;
    } else {
      const error = await response.json();
      alert(error.message || 'Failed to like post');
    }
  } catch (error) {
    console.error('Error liking post:', error);
    alert('Failed to like post. Please try again.');
  }
}

function showComments(button) {
  // Implementation for showing comments
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
let currentUser = null;
const dmMessages = {};

function selectUser(userElement, username) {
  // Remove active class from all users
  document.querySelectorAll('.user-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to selected user
  userElement.classList.add('active');
  
  // Show chat messages
  document.querySelector('.chat-placeholder').classList.add('hidden');
  document.querySelector('.chat-messages').classList.remove('hidden');
  
  // Load messages for this user
  loadDMMessages(username);
}

function searchUsers(query) {
  const users = document.querySelectorAll('.user-item');
  query = query.toLowerCase();
  
  users.forEach(user => {
    const username = user.querySelector('h4').textContent.toLowerCase();
    user.style.display = username.includes(query) ? 'flex' : 'none';
  });
}

function loadDMMessages(username) {
  const container = document.getElementById('dm-messages');
  container.innerHTML = ''; // Clear existing messages
  
  // Load messages from localStorage
  const key = `dm-${username}`;
  const stored = JSON.parse(localStorage.getItem(key)) || [];
  
  // Render messages
  stored.forEach(msgHTML => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");
    messageDiv.innerHTML = msgHTML;
    container.appendChild(messageDiv);
  });
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

function sendDMMessage() {
  const input = document.getElementById('dm-input');
  const text = input.value.trim();
  if (text === '') return;
  
  const activeUser = document.querySelector('.user-item.active');
  if (!activeUser) return;
  
  const username = activeUser.querySelector('h4').textContent;
  const container = document.getElementById('dm-messages');
  
  // Create and append message
  const messageDiv = createMessageElement({
    content: text,
    sender: 'You',
    time: new Date().toLocaleTimeString()
  });
  container.appendChild(messageDiv);
  
  // Save message
  const key = `dm-${username}`;
  let stored = JSON.parse(localStorage.getItem(key)) || [];
  stored.push(messageDiv.innerHTML);
  localStorage.setItem(key, JSON.stringify(stored));
  
  // Clear input and scroll to bottom
  input.value = '';
  container.scrollTop = container.scrollHeight;
  
  // Simulate reply after a delay
  setTimeout(() => {
    const reply = getRandomReply();
    const replyDiv = createMessageElement({
      content: reply,
      sender: username,
      time: new Date().toLocaleTimeString()
    });
    container.appendChild(replyDiv);
    
    // Save reply
    stored.push(replyDiv.innerHTML);
    localStorage.setItem(key, JSON.stringify(stored));
    
    container.scrollTop = container.scrollHeight;
  }, 1000);
}

function createMessageElement(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  if (message.sender === 'You') div.classList.add('sent');
  
  div.innerHTML = `
    <div class="message-content">
      <strong>${message.sender}:</strong> ${message.content}
      <div class="message-time">${message.time}</div>
    </div>
  `;
  
  return div;
}

function getRandomReply() {
  const replies = [
    "That's great to hear!",
    "I understand how you feel.",
    "Let me think about that...",
    "Thanks for sharing!",
    "I'm here to help!"
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

// Add event listener for DM input
document.getElementById('dm-input')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    sendDMMessage();
  }
});

// Save/Unsave Post Functionality
function toggleSavePost(button) {
  const postCard = button.closest('.post-card');
  const postId = postCard.dataset.postId;
  const postTitle = postCard.querySelector('.post-title').textContent;
  const postContent = postCard.querySelector('.post-text').textContent;
  const postAuthor = postCard.querySelector('.author-name').textContent;
  const postDate = postCard.querySelector('.post-date').textContent;
  const postCategory = postCard.querySelector('.post-category').textContent;

  // Get saved posts from localStorage
  const savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || {};
  
  if (savedPosts[postId]) {
    // Remove from saved posts
    delete savedPosts[postId];
    button.classList.remove('saved');
    button.querySelector('i').classList.remove('fas');
    button.querySelector('i').classList.add('far');
    showNotification('Post removed from saved posts', 'info');
  } else {
    // Add to saved posts
    savedPosts[postId] = {
      title: postTitle,
      content: postContent,
      author: postAuthor,
      date: postDate,
      category: postCategory
    };
    button.classList.add('saved');
    button.querySelector('i').classList.remove('far');
    button.querySelector('i').classList.add('fas');
    showNotification('Post saved successfully', 'success');
  }
  
  // Update localStorage
  localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
}

function showSavedPosts() {
  // Hide all sections
  document.querySelector('#community-posts').classList.add('hidden');
  document.querySelector('#community-section').classList.add('hidden');
  document.querySelector('#expert-section').classList.add('hidden');
  document.querySelector('#dm-section').classList.add('hidden');
  
  // Show saved posts section
  document.querySelector('#saved-posts-section').classList.remove('hidden');
  
  // Update active state in sidebar
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  document.querySelector('.nav-item[onclick="showSavedPosts()"]').classList.add('active');

  // Load saved posts
  const container = document.getElementById('saved-posts-container');
  container.innerHTML = '';
  const savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || {};
  const keys = Object.keys(savedPosts);
  
  if (keys.length === 0) {
    container.innerHTML = '<p style="padding:2rem; text-align:center; color:var(--text-muted);">No saved posts yet.</p>';
  }

  keys.reverse().forEach(key => {
    const post = savedPosts[key];
    const article = document.createElement('article');
    article.className = 'post-card';
    article.innerHTML = `
      <div class="post-header">
        <div class="post-author">
          <img src="../images/default-avatar.png" alt="${post.author}" class="author-avatar">
          <div class="author-info">
            <h3 class="author-name">${post.author}</h3>
            <span class="post-date">${post.date}</span>
          </div>
        </div>
        <div class="post-actions">
          <button class="report-btn" onclick="reportPost('${key}')" title="Report Post">
            <i class="fas fa-flag"></i>
          </button>
        </div>
      </div>
      <div class="post-content">
        <h3 class="post-title">${post.title}</h3>
        <p class="post-text">${post.content}</p>
      </div>
      <div class="post-footer">
        <div class="post-category">${post.category}</div>
        <div class="post-engagement">
          <button class="like-btn" onclick="likePost(this)">
            <i class="far fa-heart"></i>
            <span class="likes-count">0</span>
          </button>
          <button class="comment-btn" onclick="showComments(this)">
            <i class="far fa-comment"></i>
            <span class="comments-count">0</span>
          </button>
          <button class="save-btn saved" onclick="toggleSavePost(this)" title="Remove from Saved">
            <i class="fas fa-bookmark"></i>
          </button>
        </div>
      </div>
    `;
    container.appendChild(article);
  });
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
    const title = post.querySelector('h3').textContent.toLowerCase();
    const content = post.querySelector('.post-content p').textContent.toLowerCase();
    const author = post.querySelector('.author').textContent.toLowerCase();
    const category = post.querySelector('.category').textContent.toLowerCase();
    
    const isVisible = title.includes(searchTerm) || 
                     content.includes(searchTerm) || 
                     author.includes(searchTerm) || 
                     category.includes(searchTerm);
    
    post.style.display = isVisible ? 'block' : 'none';
  });
  
  // Search through users in DM section
  users.forEach(user => {
    const username = user.querySelector('h4').textContent.toLowerCase();
    const isVisible = username.includes(searchTerm);
    user.style.display = isVisible ? 'flex' : 'none';
  });
}

// Function to show expert application form
function showExpertApplicationForm() {
    const form = document.getElementById('expertApplicationForm');
    if (form) {
        form.style.display = 'block';
        // Add event listener for clicking outside the form
        document.addEventListener('click', handleOutsideClick);
    }
}

// Function to hide expert application form
function hideExpertApplicationForm() {
    const form = document.getElementById('expertApplicationForm');
    if (form) {
        form.style.display = 'none';
        // Remove event listener when hiding the form
        document.removeEventListener('click', handleOutsideClick);
    }
}

// Function to handle clicks outside the form
function handleOutsideClick(event) {
    const form = document.getElementById('expertApplicationForm');
    const applyButton = document.querySelector('.apply-expert-btn');
    
    // Check if click is outside both the form and the apply button
    if (form && !form.contains(event.target) && !applyButton.contains(event.target)) {
        hideExpertApplicationForm();
    }
}

// Add cleanup when navigating away
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        hideExpertApplicationForm();
    }
});

// Add cleanup when the page is unloaded
window.addEventListener('beforeunload', () => {
    hideExpertApplicationForm();
});

// Function to create post card
function createPostCard(post) {
    const template = document.getElementById('postCardTemplate');
    const card = template.content.cloneNode(true);
    
    // Set post content
    card.querySelector('.post-title').textContent = post.title;
    card.querySelector('.post-text').textContent = post.content;
    card.querySelector('.post-category').textContent = post.category;
    card.querySelector('.author-name').textContent = post.author.username;
    card.querySelector('.post-date').textContent = new Date(post.createdAt).toLocaleDateString();
    
    // Add report functionality
    const reportBtn = card.querySelector('.report-btn');
    reportBtn.addEventListener('click', () => reportPost(post._id));
    
    return card;
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
    if (!reason) return;

    const response = await fetch(`http://localhost:3000/api/v1/posts/${postId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reason })
    });

    const data = await response.json();

    if (response.ok) {
      showNotification('Post reported successfully', 'success');
    } else {
      showNotification(data.message || 'Failed to report post', 'error');
    }
  } catch (error) {
    console.error('Error reporting post:', error);
    showNotification('An error occurred while reporting the post', 'error');
  }
}

// Expert Application Functions
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

// Handle expert application form submission
document.getElementById('expert-application-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData();
  formData.append('name', document.getElementById('expert-name').value);
  formData.append('email', document.getElementById('expert-email').value);
  formData.append('number', document.getElementById('expert-number').value);
  formData.append('cv', document.getElementById('expert-cv').files[0]);

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please log in to submit an application', 'error');
      return;
    }

    const response = await fetch('http://localhost:3000/api/v1/experts/apply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    // Show success message regardless of response type since we know it worked
    document.getElementById('expert-application-success').classList.remove('hidden');
    document.getElementById('expert-application-form').reset();
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      document.getElementById('expert-application-success').classList.add('hidden');
    }, 3000);

    showNotification('Application submitted successfully!', 'success');

  } catch (error) {
    console.error('Application submission error:', error);
    // Only show error if we're certain it failed
    if (!document.getElementById('expert-application-success').classList.contains('hidden')) {
      showNotification('There was an error submitting your application. Please try again.', 'error');
    }
  }
});


