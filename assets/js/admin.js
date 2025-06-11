/*
* Admin Dashboard JavaScript
* Created by: [Your Name]
* Date: [Current Date]
*
* This file contains all the interactive features of our admin dashboard.
* We're using vanilla JavaScript (no frameworks) to keep it simple and lightweight.
*/

// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the dashboard
    initializeDashboard();
    
    // Set up event listeners
    setupEventListeners();
});

// Initialize dashboard components
function initializeDashboard() {
    // Hide all sections except dashboard initially
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('dashboard').style.display = 'block';
    
    // Update statistics
    updateStatistics();
    
    // Update recent activity
    updateRecentActivity();
}

// Set up event listeners for navigation and interactions
function setupEventListeners() {
    // Navigation menu
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            navigateToSection(targetId);
        });
    });
    
    // Mobile navigation toggle
    const navToggle = document.getElementById('navToggle');
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('active');
        });
    }
    
    // Product form toggle
    const addProductBtn = document.getElementById('addProductBtn');
    const productForm = document.querySelector('.product-form');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    
    if (addProductBtn && productForm) {
        addProductBtn.addEventListener('click', () => {
            productForm.style.display = 'block';
            addProductBtn.style.display = 'none';
        });
    }
    
    if (cancelAddBtn && productForm) {
        cancelAddBtn.addEventListener('click', () => {
            productForm.style.display = 'none';
            addProductBtn.style.display = 'flex';
        });
    }
    
    // Search functionality
    const searchInputs = document.querySelectorAll('.search-box input');
    searchInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const section = e.target.closest('section');
            handleSearch(section.id, searchTerm);
        });
    });
    
    // Category filters
    const categoryFilters = document.querySelectorAll('.filter-select');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', (e) => {
            const section = e.target.closest('section');
            handleFilter(section.id, e.target.value);
        });
    });
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(button.closest('.tab-content'), tabId);
        });
    });
}

// Navigate between sections
function navigateToSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        // Fetch posts when navigating to posts section
        if (sectionId === 'posts') {
            fetchPosts();
        }
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.querySelector(`a[href="#${sectionId}"]`)) {
            item.classList.add('active');
        }
    });

    if (sectionId === 'community') {
        fetchCommunity();
    }
}

// Update dashboard statistics
function updateStatistics() {
    // This would typically fetch data from an API
    const stats = {
        orders: 150,
        users: 2450,
        doctors: 45,
        posts: 320
    };
    
    // Update the UI with the stats
    Object.entries(stats).forEach(([key, value]) => {
        const statElement = document.querySelector(`.stat-card:nth-child(${getStatIndex(key)}) .stat-number`);
        if (statElement) {
            statElement.textContent = formatNumber(value);
        }
    });
}

// Get the index for each stat card
function getStatIndex(key) {
    const indices = {
        orders: 1,
        users: 2,
        doctors: 3,
        posts: 4
    };
    return indices[key] || 1;
}

// Handle search functionality
function handleSearch(sectionId, searchTerm) {
    switch (sectionId) {
        case 'products':
            searchProducts(searchTerm);
            break;
        case 'orders':
            searchOrders(searchTerm);
            break;
        case 'community':
            searchCommunity(searchTerm);
            break;
        case 'posts':
            searchPosts(searchTerm);
            break;
    }
}

// Handle filter changes
function handleFilter(sectionId, filterValue) {
    switch (sectionId) {
        case 'products':
            filterProducts(filterValue);
            break;
        case 'orders':
            filterOrders(filterValue);
            break;
        case 'expert-applications':
            fetchApplications();
            break;
    }
}

// Switch between tabs
function switchTab(tabContainer, tabId) {
    // Update active tab button
    const tabButtons = tabContainer.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.toggle('active', button.getAttribute('data-tab') === tabId);
    });
    
    // Show active tab content
    const tabPanes = tabContainer.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === `${tabId}-tab`);
    });
}

// Utility functions
function formatNumber(number) {
    return number.toLocaleString();
}

function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
}

// Updates the recent activity feed with latest activities
function updateRecentActivity() {
    const activities = [
        {
            icon: 'user-plus',
            text: 'New user registered',
            time: '2 minutes ago'
        },
        {
            icon: 'comment',
            text: 'New community post',
            time: '15 minutes ago'
        },
        {
            icon: 'edit',
            text: 'Content updated',
            time: '1 hour ago'
        }
    ];

    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="fas fa-${activity.icon}"></i>
                <div class="activity-details">
                    <p>${activity.text}</p>
                    <span>${activity.time}</span>
                </div>
            </div>
        `).join('');
    }
}

// Category Selection Logic
document.addEventListener('DOMContentLoaded', function() {
    const productCategory = document.getElementById('productCategory');
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subSubcategoryGroup = document.getElementById('subSubcategoryGroup');
    const productSubcategory = document.getElementById('productSubcategory');
    const productSubSubcategory = document.getElementById('productSubSubcategory');

    // Handle main category selection
    productCategory.addEventListener('change', function() {
        const selectedCategory = this.value;
        
        // Reset subcategory and sub-subcategory
        productSubcategory.value = '';
        productSubSubcategory.value = '';
        
        if (selectedCategory === 'kids') {
            subcategoryGroup.style.display = 'block';
            subSubcategoryGroup.style.display = 'none';
        } else {
            subcategoryGroup.style.display = 'none';
            subSubcategoryGroup.style.display = 'none';
        }
    });

    // Handle subcategory selection
    productSubcategory.addEventListener('change', function() {
        const selectedSubcategory = this.value;
        
        // Reset sub-subcategory
        productSubSubcategory.value = '';
        
        if (selectedSubcategory === 'boys' || selectedSubcategory === 'girls') {
            subSubcategoryGroup.style.display = 'block';
        } else {
            subSubcategoryGroup.style.display = 'none';
        }
    });

    // Filter sub-subcategory options based on selected subcategory
    productSubcategory.addEventListener('change', function() {
        const selectedSubcategory = this.value;
        const subSubcategoryOptions = productSubSubcategory.options;
        
        // Hide all options first
        for (let i = 0; i < subSubcategoryOptions.length; i++) {
            subSubcategoryOptions[i].style.display = 'none';
        }
        
        // Show relevant options based on subcategory
        if (selectedSubcategory === 'boys') {
            for (let i = 0; i < subSubcategoryOptions.length; i++) {
                if (subSubcategoryOptions[i].value.startsWith('boys-')) {
                    subSubcategoryOptions[i].style.display = '';
                }
            }
        } else if (selectedSubcategory === 'girls') {
            for (let i = 0; i < subSubcategoryOptions.length; i++) {
                if (subSubcategoryOptions[i].value.startsWith('girls-')) {
                    subSubcategoryOptions[i].style.display = '';
                }
            }
        }
    });
});

// Expert Applications Management
document.addEventListener('DOMContentLoaded', function() {
    // Initialize expert applications functionality
    initExpertApplications();
});

function initExpertApplications() {
    const applicationsSection = document.getElementById('expert-applications');
    if (!applicationsSection) return;

    // Ensure the applications-grid exists or create it if not
    let expertApplicationsGrid = document.getElementById('applicationsContainer');
    if (!expertApplicationsGrid) {
        expertApplicationsGrid = document.createElement('div');
        expertApplicationsGrid.id = 'applicationsContainer';
        expertApplicationsGrid.className = 'applications-grid';
        applicationsSection.appendChild(expertApplicationsGrid);
    }

    // Fetch applications from the backend
    fetchApplications();

    // Attach event listeners for search and filter
    const searchInput = document.getElementById('searchApplications');
    const statusFilter = document.getElementById('applicationStatus');

    if (searchInput) {
        searchInput.addEventListener('input', () => fetchApplications());
    }
    if (statusFilter) {
        statusFilter.addEventListener('change', () => fetchApplications());
    }
}

async function fetchApplications() {
    const expertApplicationsGrid = document.getElementById('applicationsContainer');
    if (!expertApplicationsGrid) return;

    expertApplicationsGrid.innerHTML = '<p style="text-align: center; padding: 20px;">Loading applications...</p>';

    try {
        const searchTerm = document.getElementById('searchApplications')?.value.toLowerCase() || '';
        const statusFilter = document.getElementById('applicationStatus')?.value || 'all';

        const response = await fetch('http://localhost:3000/api/v1/experts');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const applications = await response.json();

        const filteredApplications = applications.filter(app => {
            const matchesSearch = app.name.toLowerCase().includes(searchTerm) || app.email.toLowerCase().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        if (filteredApplications.length === 0) {
            expertApplicationsGrid.innerHTML = '<p style="text-align: center; padding: 20px;">No applications found.</p>';
            return;
        }

        expertApplicationsGrid.innerHTML = filteredApplications.map(app => {
            console.log('Raw app.cvFile from Backend:', app.cvFile);
            const filename = app.cvFile.split('/').pop();
            console.log('Extracted filename:', filename);
            return `
            <div class="application-card" data-application-id="${app._id}">
                <div class="application-header">
                    <div class="expert-info">
                        <div class="expert-details">
                            <h3>${app.name}</h3>
                            <p class="application-email">${app.email}</p>
                            <p class="application-number">${app.number}</p>
                        </div>
                    </div>
                    <div class="application-status ${app.status}">${app.status.charAt(0).toUpperCase() + app.status.slice(1)}</div>
                </div>
                <div class="application-content">
                    <div class="documents-section">
                        <h4><i class="fas fa-file-alt"></i> Documents</h4>
                        <div class="document-links">
                            <a href="http://localhost:3000/uploads/cvs/${filename}" target="_blank" class="document-link"><i class="fas fa-file-pdf"></i> View CV</a>
                        </div>
                    </div>
                </div>
                <div class="application-actions">
                    <button class="btn approve-btn" onclick="handleApplicationAction(this, 'approved')" ${app.status !== 'pending' ? 'disabled' : ''}><i class="fas fa-check"></i> Approve</button>
                    <button class="btn reject-btn" onclick="handleApplicationAction(this, 'rejected')" ${app.status !== 'pending' ? 'disabled' : ''}><i class="fas fa-times"></i> Reject</button>
                </div>
            </div>
        `;
        }).join('');

    } catch (error) {
        console.error('Error fetching applications:', error);
        expertApplicationsGrid.innerHTML = '<p style="text-align: center; padding: 20px; color: red;">Error loading applications.</p>';
    }
}

async function handleApplicationAction(button, status) {
    const card = button.closest('.application-card');
    const applicationId = card.dataset.applicationId;
    const expertName = card.querySelector('.expert-details h3').textContent;

    if (!applicationId) {
        showNotification('Application ID not found.', 'error');
        return;
    }

    const confirmMessage = status === 'approved'
        ? `Are you sure you want to approve ${expertName}'s application?`
        : `Are you sure you want to reject ${expertName}'s application?`;

    if (confirm(confirmMessage)) {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/experts/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update application status.');
            }

            // Update UI
            const statusElement = card.querySelector('.application-status');
            statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusElement.className = `application-status ${status}`;

            // Disable buttons after action
            card.querySelectorAll('.approve-btn, .reject-btn').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            });

            showNotification(`${expertName}'s application has been ${status} successfully!`, 'success');

        } catch (error) {
            console.error('Error updating application status:', error);
            showNotification(`Failed to update ${expertName}'s application: ${error.message}`, 'error');
        }
    }
}

function viewApplicationDetails(card) {
    // This function can be simplified or removed as per new requirements if not needed
    // For now, it will remain as is, but might display old details if not updated
    const expertName = card.querySelector('.expert-details h3').textContent;
    const specialty = card.querySelector('.specialty').textContent;
    const qualifications = Array.from(card.querySelectorAll('.qualification-section li')).map(li => li.textContent);
    const experience = Array.from(card.querySelectorAll('.experience-section li')).map(li => li.textContent);
    
    // Create modal content
    const modalContent = `
        <div class="modal-content">
            <h2>${expertName}</h2>
            <p class="specialty">${specialty}</p>
            
            <div class="modal-section">
                <h3>Qualifications</h3>
                <ul>
                    ${qualifications.map(q => `<li>${q}</li>`).join('')}
                </ul>
            </div>
            
            <div class="modal-section">
                <h3>Experience</h3>
                <ul>
                    ${experience.map(e => `<li>${e}</li>`).join('')}
                </ul>
            </div>
            
            <div class="modal-section">
                <h3>Documents</h3>
                <div class="document-links">
                    ${Array.from(card.querySelectorAll('.document-link')).map(link => 
                        `<a href="${link.href}" target="_blank">${link.innerHTML}</a>`
                    ).join('')}
                </div>
            </div>
        </div>
    `;
    
    // Show modal
    showModal(modalContent);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function showModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-container">
                ${content}
                <button class="modal-close">&times;</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking close button or overlay
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === modal.querySelector('.modal-overlay')) {
            modal.remove();
        }
    });
}

// Add modal and notification styles
const modalStyles = `
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5); /* Semi-transparent overlay */
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-container {
    background: white;
    padding: 20px;
    border-radius: 10px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
}

.modal-close {
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 5px;
    color: white;
    z-index: 1001;
    animation: slideIn 0.3s ease-out;
}

.notification.success {
    background-color: #28a745;
}

.notification.error {
    background-color: #dc3545;
}

.notification.info {
    background-color: #17a2b8;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet);

// Function to fetch and display posts
async function fetchPosts() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/posts');
        if (response.ok) {
            const data = await response.json();
            const postsGrid = document.querySelector('#all-posts-tab .posts-grid');
            postsGrid.innerHTML = ''; // Clear existing posts
            
            if (data.data && data.data.length > 0) {
                data.data.forEach(post => {
                    postsGrid.appendChild(createPostCard(post));
                });
            } else {
                postsGrid.innerHTML = '<p class="no-posts">No posts found</p>';
            }
        } else {
            console.error('Failed to fetch posts');
            showNotification('Failed to fetch posts', 'error');
        }
    } catch (error) {
        console.error('Error fetching posts:', error);
        showNotification('Error fetching posts', 'error');
    }
}

// Function to create a post card for admin panel
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <img src="../../images/default-avatar.png" alt="${post.author?.username || 'Anonymous'}">
                <div class="post-author-info">
                    <h4>${post.author?.username || 'Anonymous'}</h4>
                    <p>${new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="post-status ${post.status}">${post.status}</div>
        </div>
        <div class="post-content">
            <h3>${post.title}</h3>
            <p>${post.content}</p>
        </div>
        <div class="post-stats">
            <span><i class="fas fa-heart"></i> ${post.likes?.length || 0}</span>
            <span><i class="fas fa-comment"></i> ${post.comments?.length || 0}</span>
            <span><i class="fas fa-flag"></i> ${post.reports?.length || 0}</span>
        </div>
        <div class="post-actions">
            <button class="btn primary-btn" onclick="handlePostAction(this, '${post._id}', 'approve')">
                <i class="fas fa-check"></i> Approve
            </button>
            <button class="btn secondary-btn" onclick="handlePostAction(this, '${post._id}', 'hide')">
                <i class="fas fa-eye-slash"></i> Hide
            </button>
            <button class="btn danger-btn" onclick="handlePostAction(this, '${post._id}', 'delete')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return card;
}

// Function to handle post actions (approve, hide, delete)
async function handlePostAction(button, postId, action) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please login to perform this action', 'error');
        return;
    }

    try {
        let response;
        switch (action) {
            case 'approve':
                response = await fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'active' })
                });
                break;
            case 'hide':
                response = await fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ status: 'hidden' })
                });
                break;
            case 'delete':
                response = await fetch(`http://localhost:3000/api/v1/posts/${postId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                break;
        }

        if (response.ok) {
            showNotification(`Post ${action}d successfully`, 'success');
            fetchPosts(); // Refresh the posts list
        } else {
            const error = await response.json();
            showNotification(error.message || `Failed to ${action} post`, 'error');
        }
    } catch (error) {
        console.error(`Error ${action}ing post:`, error);
        showNotification(`Error ${action}ing post`, 'error');
    }
}

// Function to fetch and display community members
async function fetchCommunity() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to view community members', 'error');
            return;
        }

        const response = await fetch('http://localhost:3000/api/v1/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const allMembersGrid = document.querySelector('#all-tab .members-grid');
            const doctorsGrid = document.querySelector('#doctors-tab .doctors-grid');
            const clientsGrid = document.querySelector('#clients-tab .clients-grid');

            // Clear existing content
            allMembersGrid.innerHTML = '';
            doctorsGrid.innerHTML = '';
            clientsGrid.innerHTML = '';

            if (data.data && data.data.length > 0) {
                data.data.forEach(member => {
                    const memberCard = createMemberCard(member);
                    allMembersGrid.appendChild(memberCard.cloneNode(true));

                    if (member.role === 'doctor') {
                        doctorsGrid.appendChild(memberCard.cloneNode(true));
                    } else {
                        clientsGrid.appendChild(memberCard.cloneNode(true));
                    }
                });
            } else {
                const noMembersMessage = '<p class="no-members">No members found</p>';
                allMembersGrid.innerHTML = noMembersMessage;
                doctorsGrid.innerHTML = noMembersMessage;
                clientsGrid.innerHTML = noMembersMessage;
            }
        } else {
            console.error('Failed to fetch community members');
            showNotification('Failed to fetch community members', 'error');
        }
    } catch (error) {
        console.error('Error fetching community members:', error);
        showNotification('Error fetching community members', 'error');
    }
}

// Function to create a member card
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = `member-card ${member.role}`;
    card.innerHTML = `
        <div class="member-header">
            <img src="../../images/default-avatar.png" alt="${member.username}">
            <div class="member-info">
                <h4>${member.username}</h4>
                <p class="member-role">${member.role}</p>
                <p class="member-email">${member.email}</p>
            </div>
        </div>
        <div class="member-details">
            <p><i class="fas fa-baby"></i> Baby: ${member.babyName}</p>
            <p><i class="fas fa-venus-mars"></i> Gender: ${member.babyGender}</p>
            <p><i class="fas fa-calendar"></i> Birth Date: ${new Date(member.birthDate).toLocaleDateString()}</p>
        </div>
        <div class="member-actions">
            ${member.role === 'user' ? `
                <button class="btn primary-btn" onclick="handleMemberAction(this, '${member._id}', 'promote')">
                    <i class="fas fa-user-md"></i> Promote to Doctor
                </button>
            ` : member.role === 'doctor' ? `
                <button class="btn secondary-btn" onclick="handleMemberAction(this, '${member._id}', 'demote')">
                    <i class="fas fa-user"></i> Demote to User
                </button>
            ` : ''}
            <button class="btn danger-btn" onclick="handleMemberAction(this, '${member._id}', 'delete')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    return card;
}

// Function to handle member actions (promote, demote, delete)
async function handleMemberAction(button, memberId, action) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please login to perform this action', 'error');
        return;
    }

    try {
        let response;
        switch (action) {
            case 'promote':
                response = await fetch(`http://localhost:3000/api/v1/users/${memberId}/role`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: 'doctor' })
                });
                break;
            case 'demote':
                response = await fetch(`http://localhost:3000/api/v1/users/${memberId}/role`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: 'user' })
                });
                break;
            case 'delete':
                response = await fetch(`http://localhost:3000/api/v1/users/${memberId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                break;
        }

        if (response.ok) {
            showNotification(`Member ${action}d successfully`, 'success');
            fetchCommunity(); // Refresh the members list
        } else {
            const error = await response.json();
            showNotification(error.message || `Failed to ${action} member`, 'error');
        }
    } catch (error) {
        console.error(`Error ${action}ing member:`, error);
        showNotification(`Error ${action}ing member`, 'error');
    }
}

// Function to search community members
function searchCommunity(searchTerm) {
    const memberCards = document.querySelectorAll('.member-card');
    memberCards.forEach(card => {
        const username = card.querySelector('h4').textContent.toLowerCase();
        const email = card.querySelector('.member-email').textContent.toLowerCase();
        const role = card.querySelector('.member-role').textContent.toLowerCase();
        
        if (username.includes(searchTerm) || 
            email.includes(searchTerm) || 
            role.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}