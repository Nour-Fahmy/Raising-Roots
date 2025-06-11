// =================== community.js ===================

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
function showCommunityPosts() {
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
}

function hideCreatePostForm() {
  const form = document.getElementById('create-post-form');
  form.classList.add('hidden');
  // Clear form fields
  document.getElementById('post-title').value = '';
  document.getElementById('post-content').value = '';
  document.getElementById('post-category').value = '';
}

function submitPost(event) {
  event.preventDefault();
  
  const title = document.getElementById('post-title').value;
  const content = document.getElementById('post-content').value;
  const category = document.getElementById('post-category').value;
  
  // Create new post element
  const postElement = createPostElement({
    title,
    content,
    category,
    author: 'Current User', // This would come from user authentication
    date: 'Just now'
  });
  
  // Add post to the grid
  const postsContainer = document.getElementById('posts-container');
  postsContainer.insertBefore(postElement, postsContainer.firstChild);
  
  // Hide form and clear fields
  hideCreatePostForm();
}

function createPostElement(post) {
  const article = document.createElement('article');
  article.className = 'post-card';
  
  article.innerHTML = `
    <div class="post-header">
      <img src="../images/default-avatar.png" alt="User Avatar" class="user-avatar">
      <div class="post-info">
        <h3>${post.title}</h3>
        <div class="post-meta">
          <span class="author">${post.author}</span>
          <span class="date">${post.date}</span>
          <span class="category">${post.category}</span>
        </div>
      </div>
    </div>
    <div class="post-content">
      <p>${post.content}</p>
    </div>
    <div class="post-actions">
      <button class="action-btn" onclick="likePost(this)">
        <i class="fas fa-heart"></i> Like
      </button>
      <button class="action-btn" onclick="showComments(this)">
        <i class="fas fa-comment"></i> Comment
      </button>
      <button class="action-btn" onclick="sharePost(this)">
        <i class="fas fa-share"></i> Share
      </button>
    </div>
  `;
  
  return article;
}

function likePost(button) {
  const icon = button.querySelector('i');
  if (icon.classList.contains('fas')) {
    icon.classList.remove('fas');
    icon.classList.add('far');
  } else {
    icon.classList.remove('far');
    icon.classList.add('fas');
    icon.style.color = '#ff4757';
  }
}

function showComments(button) {
  // This would be implemented to show a comments section
  alert('Comments feature coming soon!');
}

function sharePost(button) {
  // This would be implemented to share the post
  alert('Share feature coming soon!');
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
document.getElementById('search-posts').addEventListener('input', filterPosts);

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
  const postTitle = postCard.querySelector('h3').textContent;
  const postContent = postCard.querySelector('.post-content p').textContent;
  const postAuthor = postCard.querySelector('.author').textContent;
  const postDate = postCard.querySelector('.date').textContent;
  const postCategory = postCard.querySelector('.category').textContent;

  // Create a unique key for the post (could use title+author+date)
  const postKey = `${postTitle}|${postAuthor}|${postDate}`;

  // Get saved posts from localStorage
  let savedPosts = JSON.parse(localStorage.getItem('savedPosts')) || {};

  const icon = button.querySelector('i');
  if (savedPosts[postKey]) {
    // Unsave
    delete savedPosts[postKey];
    icon.classList.remove('fas');
    icon.classList.add('far');
    button.innerHTML = '<i class="far fa-bookmark"></i> Save';
  } else {
    // Save
    savedPosts[postKey] = {
      title: postTitle,
      content: postContent,
      author: postAuthor,
      date: postDate,
      category: postCategory
    };
    icon.classList.remove('far');
    icon.classList.add('fas');
    button.innerHTML = '<i class="fas fa-bookmark"></i> Saved';
  }
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
    container.innerHTML = '<p style="padding:2rem; text-align:center; color:#888;">No saved posts yet.</p>';
    return;
  }
  keys.reverse().forEach(key => {
    const post = savedPosts[key];
    const article = document.createElement('article');
    article.className = 'post-card';
    article.innerHTML = `
      <div class="post-header">
        <img src="../images/default-avatar.png" alt="User Avatar" class="user-avatar">
        <div class="post-info">
          <h3>${post.title}</h3>
          <div class="post-meta">
            <span class="author">${post.author}</span>
            <span class="date">${post.date}</span>
            <span class="category">${post.category}</span>
          </div>
        </div>
      </div>
      <div class="post-content">
        <p>${post.content}</p>
      </div>
      <div class="post-actions">
        <button class="action-btn" onclick="likePost(this)"><i class="fas fa-heart"></i> Like</button>
        <button class="action-btn" onclick="showComments(this)"><i class="fas fa-comment"></i> Comment</button>
        <button class="action-btn" onclick="sharePost(this)"><i class="fas fa-share"></i> Share</button>
        <button class="action-btn" onclick="toggleSavePost(this)"><i class="fas fa-bookmark"></i> Saved</button>
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
  // Hide all other sections
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

