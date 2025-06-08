// =================== community.js ===================

// Function to select and display the active channel
function selectChannel(channel) {
  // Show the correct channel section and hide others
  document.querySelector('#channel-selector').classList.add('hidden');
  
  // Hide the community posts section
  document.querySelector('#community-posts').classList.add('hidden');
  
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

// Load messages when the page loads
window.onload = function() {
    loadMessages();
    
    // Check if we should show the expert section based on URL hash
    if (window.location.hash === '#expert-section') {
        selectChannel('expert');
    }
};

// =================== Theme Toggle Logic ===================

const themeToggle = document.getElementById("theme-toggle");

themeToggle.addEventListener("click", () => {
  // Toggle the dark theme class on the body
  document.body.classList.toggle("dark-theme");

  const isDark = document.body.classList.contains("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");

  // Change the theme toggle icon
  themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Load theme preference from localStorage on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
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
  
  // Set current user
  currentUser = username;
  
  // Show chat interface
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
    if (username.includes(query)) {
      user.style.display = 'flex';
    } else {
      user.style.display = 'none';
    }
  });
}

function loadDMMessages(username) {
  const messagesContainer = document.getElementById('dm-messages');
  messagesContainer.innerHTML = '';
  
  // Initialize messages array for this user if it doesn't exist
  if (!dmMessages[username]) {
    dmMessages[username] = [
      {
        sender: username,
        content: 'Hi there! How can I help you today?',
        time: '10:30 AM'
      }
    ];
  }
  
  // Display messages
  dmMessages[username].forEach(message => {
    const messageElement = createMessageElement(message);
    messagesContainer.appendChild(messageElement);
  });
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function sendDMMessage() {
  if (!currentUser) return;
  
  const input = document.getElementById('dm-input');
  const message = input.value.trim();
  
  if (message) {
    // Add message to array
    if (!dmMessages[currentUser]) {
      dmMessages[currentUser] = [];
    }
    
    const newMessage = {
      sender: 'You',
      content: message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    dmMessages[currentUser].push(newMessage);
    
    // Add message to UI
    const messagesContainer = document.getElementById('dm-messages');
    const messageElement = createMessageElement(newMessage);
    messagesContainer.appendChild(messageElement);
    
    // Clear input
    input.value = '';
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Simulate reply after 1 second
    setTimeout(() => {
      const reply = {
        sender: currentUser,
        content: getRandomReply(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      dmMessages[currentUser].push(reply);
      const replyElement = createMessageElement(reply);
      messagesContainer.appendChild(replyElement);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
  }
}

function createMessageElement(message) {
  const div = document.createElement('div');
  div.className = `message ${message.sender === 'You' ? 'sent' : ''}`;
  
  div.innerHTML = `
    <img src="../images/default-avatar.png" alt="${message.sender}" class="user-avatar">
    <div class="message-content">
      <p>${message.content}</p>
      <span class="message-time">${message.time}</span>
    </div>
  `;
  
  return div;
}

function getRandomReply() {
  const replies = [
    "That's a great question!",
    "I understand your concern.",
    "Let me help you with that.",
    "Thanks for sharing!",
    "I'm here to help!",
    "That's interesting!",
    "I see what you mean.",
    "Let's discuss this further."
  ];
  
  return replies[Math.floor(Math.random() * replies.length)];
}

// Add event listener for DM input
document.getElementById('dm-input')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    sendDMMessage();
  }
});
