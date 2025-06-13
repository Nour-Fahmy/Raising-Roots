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
    // Check if user is admin
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token || !user || user.role !== 'admin') {
        // Redirect to login page with admin redirect
        window.location.href = '../login.html?redirect=admin/index.html';
        return;
    }

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

    // Initialize expert applications
    initExpertApplications();
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
    
    // Community section tab buttons
    const communityTabs = document.querySelector('.community-tabs');
    if (communityTabs) {
        communityTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tabId = e.target.getAttribute('data-tab');
                switchTab('.community-section', tabId);
            }
        });
    }

    // Posts section tab buttons
    const postsTabs = document.querySelector('.posts-tabs');
    if (postsTabs) {
        postsTabs.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tabId = e.target.getAttribute('data-tab');
                switchTab('.posts-section', tabId);
            }
        });
    }

    // Initialize tab visibility
    const communitySection = document.querySelector('.community-section');
    const postsSection = document.querySelector('.posts-section');

    if (communitySection) {
        const communityPanes = communitySection.querySelectorAll('.tab-pane');
        communityPanes.forEach(pane => {
            if (!pane.classList.contains('active')) {
                pane.style.display = 'none';
            }
        });
    }

    if (postsSection) {
        const postsPanes = postsSection.querySelectorAll('.tab-pane');
        postsPanes.forEach(pane => {
            if (!pane.classList.contains('active')) {
                pane.style.display = 'none';
            }
        });
    }
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
        
        // Initialize specific sections
        if (sectionId === 'posts') {
            console.log('Initializing posts section...');
            fetchPosts();
        } else if (sectionId === 'community') {
            fetchCommunity();
        } else if (sectionId === 'expert-applications') {
            initExpertApplications();
        } else if (sectionId === 'products') {
            loadProducts(); // Load products when products section is shown
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
    // Get the tab container element
    const container = document.querySelector(tabContainer);
    if (!container) {
        console.error(`Tab container ${tabContainer} not found`);
        return;
    }

    // Get all tab buttons and panes within this container
    const tabButtons = container.querySelectorAll('.tab-btn');
    const tabPanes = container.querySelectorAll('.tab-pane');

    // Remove active class from all buttons and panes
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
        pane.style.display = 'none'; // Hide all panes
    });

    // Add active class to selected tab and pane
    const selectedButton = container.querySelector(`[data-tab="${tabId}"]`);
    const selectedPane = container.querySelector(`#${tabId}-tab`);

    if (selectedButton) selectedButton.classList.add('active');
    if (selectedPane) {
        selectedPane.classList.add('active');
        selectedPane.style.display = 'block'; // Show only the selected pane
    }

    // If switching to doctors or clients tab, ensure the data is loaded
    if (tabId === 'doctors' || tabId === 'clients') {
        fetchCommunity();
    }
    // If switching to reported or pending posts, ensure the data is loaded
    if (tabId === 'reported' || tabId === 'pending') {
        fetchPosts();
    }
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
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to view posts', 'error');
            return;
        }

        // Get the active tab
        const activeTab = document.querySelector('.posts-tabs .tab-btn.active');
        const activeTabId = activeTab ? activeTab.getAttribute('data-tab') : 'all-posts';

        // Get the appropriate container based on active tab
        let targetContainer;
        switch(activeTabId) {
            case 'reported':
                targetContainer = document.querySelector('#reported-tab .posts-grid');
                break;
            case 'pending':
                targetContainer = document.querySelector('#pending-tab .posts-grid');
                break;
            default:
                targetContainer = document.querySelector('#all-posts-tab .posts-grid');
        }

        if (!targetContainer) {
            console.error('Target container not found');
            return;
        }

        // Clear existing content
        targetContainer.innerHTML = '';

        // Build query parameters based on active tab
        let status;
        switch(activeTabId) {
            case 'reported':
                status = 'reported';
                break;
            case 'pending':
                status = 'pending';
                break;
            default:
                status = 'active';
        }

        // Fetch posts from backend
        const response = await fetch(`http://localhost:3000/api/v1/posts?status=${status}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            
            if (data.data && data.data.length > 0) {
                data.data.forEach(post => {
                    targetContainer.appendChild(createPostCard(post));
                });
            } else {
                targetContainer.innerHTML = `<p class="no-posts">No ${activeTabId.replace('-', ' ')} found</p>`;
            }
        } else {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch posts');
        }

    } catch (error) {
        console.error('Error fetching posts:', error);
        showNotification(error.message || 'Error fetching posts', 'error');
    }
}

// Function to handle post actions (approve, reject, delete)
async function handlePostAction(button, postId, action) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to perform this action', 'error');
            return;
        }

        let url = `http://localhost:3000/api/v1/posts/${postId}`;
        let method = 'PUT';
        let body = {};

        switch (action) {
            case 'approve':
                body = { status: 'active' };
                break;
            case 'reject':
            case 'delete':
                method = 'DELETE';
                break;
            default:
                throw new Error('Invalid action');
        }

        console.log('Sending request:', {
            url,
            method,
            body: method !== 'DELETE' ? body : undefined
        });

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            ...(method !== 'DELETE' && { body: JSON.stringify(body) })
        });

        const data = await response.json();
        console.log('Response:', data);

        if (!response.ok) {
            throw new Error(data.message || 'Failed to perform action');
        }

        showNotification(`Post ${action}d successfully`, 'success');
        fetchPosts(); // Refresh the posts list
    } catch (error) {
        console.error('Error handling post action:', error);
        showNotification(error.message || 'Error performing action', 'error');
    }
}

// Update createPostCard function to show appropriate buttons based on status
function createPostCard(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    
    // Format date
    const postDate = new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Determine which buttons to show based on post status
    let actionButtons = '';
    if (post.status === 'pending') {
        actionButtons = `
            <button class="btn primary-btn" onclick="handlePostAction(this, '${post._id}', 'approve')">
                <i class="fas fa-check"></i> Approve
            </button>
            <button class="btn danger-btn" onclick="handlePostAction(this, '${post._id}', 'delete')">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;
    } else {
        actionButtons = `
            <button class="btn danger-btn" onclick="handlePostAction(this, '${post._id}', 'delete')">
                <i class="fas fa-trash"></i> Delete
            </button>
        `;
    }

    card.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <img src="${post.author.avatar || '../../images/default-avatar.png'}" alt="${post.author.username}" class="author-avatar">
                <div class="post-author-info">
                    <h4>${post.author.username}</h4>
                    <p>${postDate}</p>
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
        </div>
        <div class="post-actions">
            ${actionButtons}
        </div>
    `;

    return card;
}

async function fetchCommunity() {
    let targetContainer;
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to view community members', 'error');
            return;
        }

        // Get the active tab
        const activeTab = document.querySelector('.community-tabs .tab-btn.active');
        const activeTabId = activeTab ? activeTab.getAttribute('data-tab') : 'all';

        // Get the appropriate container based on active tab
        switch(activeTabId) {
            case 'doctors':
                targetContainer = document.querySelector('#doctors-tab .doctors-grid');
                break;
            case 'clients':
                targetContainer = document.querySelector('#clients-tab .clients-grid');
                break;
            default:
                targetContainer = document.querySelector('#all-tab .members-grid');
        }

        if (!targetContainer) {
            console.error('Target container not found');
            return;
        }

        // Clear existing content
        targetContainer.innerHTML = '';

        // Build query parameters based on active tab
        let role;
        switch(activeTabId) {
            case 'doctors':
                role = 'doctor';
                break;
            case 'clients':
                role = 'user';
                break;
            default:
                role = 'all';
        }

        // Show loading state
        targetContainer.innerHTML = '<div class="loading">Loading members...</div>';

        // Fetch users from backend
        const url = role === 'all' 
            ? 'http://localhost:3000/api/v1/users'
            : `http://localhost:3000/api/v1/users?role=${role}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        // Clear loading state
        targetContainer.innerHTML = '';

        if (!response.ok) {
            throw new Error('Failed to fetch community members');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Server returned non-JSON response');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch community members');
        }

        if (data.data && data.data.length > 0) {
            data.data.forEach(user => {
                targetContainer.appendChild(createMemberCard(user));
            });
        } else {
            targetContainer.innerHTML = `<p class="no-members">No ${activeTabId} found</p>`;
        }

    } catch (error) {
        console.error('Error fetching community members:', error);
        showNotification(error.message || 'Error fetching community members', 'error');
        if (targetContainer) {
            targetContainer.innerHTML = `<p class="error-message">Error loading members. Please try again.</p>`;
        }
    }
}

// Update createMemberCard function to match the backend data structure
function createMemberCard(member) {
    const card = document.createElement('div');
    card.className = 'member-card';
    
    // Format join date
    const joinDate = new Date(member.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // Determine member status and role display
    const statusClass = member.status === 'active' ? 'active' : 'pending';
    const roleDisplay = member.role === 'doctor' ? 'Doctor' : 
                       member.role === 'user' ? 'Client' : member.role;

    card.innerHTML = `
        <div class="member-header">
            <img src="${member.avatar || '../../images/default-avatar.png'}" alt="${member.username}" class="member-avatar">
            <div class="member-info">
                <h4>${member.username}</h4>
                <span class="member-role ${statusClass}">${roleDisplay}</span>
            </div>
        </div>
        <div class="member-details">
            <p><i class="fas fa-envelope"></i> ${member.email}</p>
            ${member.specialty ? `<p><i class="fas fa-stethoscope"></i> ${member.specialty}</p>` : ''}
            <p><i class="fas fa-calendar"></i> Joined ${joinDate}</p>
        </div>
        <div class="member-actions">
            ${member.status === 'pending' ? `
                <button class="btn primary-btn" onclick="handleMemberAction(this, '${member._id}', 'approve')">
                    <i class="fas fa-check"></i> Approve
                </button>
            ` : ''}
            <button class="btn danger-btn" onclick="handleMemberAction(this, '${member._id}', 'delete')">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;

    return card;
}

// Update handleMemberAction function to use the correct endpoint
async function handleMemberAction(button, memberId, action) {
    const token = localStorage.getItem('token');
    if (!token) {
        showNotification('Please login to perform this action', 'error');
        return;
    }

    const card = button.closest('.member-card');
    const memberName = card.querySelector('h4').textContent;

    if (!confirm(`Are you sure you want to ${action} this member: "${memberName}"?`)) {
        return;
    }

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        let response;
        switch (action) {
            case 'approve':
                response = await fetch(`http://localhost:3000/api/v1/users/${memberId}`, {
                    method: 'PUT',
                    headers: headers,
                    body: JSON.stringify({ status: 'active' })
                });
                break;
            case 'delete':
                response = await fetch(`http://localhost:3000/api/v1/users/${memberId}`, {
                    method: 'DELETE',
                    headers: headers
                });
                break;
            default:
                throw new Error('Invalid action');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${action} member`);
        }

        showNotification(`Member ${action}d successfully`, 'success');

        // Update UI
        if (action === 'delete') {
            card.remove();
        } else {
            // Refresh the community members list
            await fetchCommunity();
        }

    } catch (error) {
        console.error(`Error ${action}ing member:`, error);
        showNotification(error.message || `Error ${action}ing member`, 'error');
    }
}

// Function to search community members
function searchCommunity(searchTerm) {
    const memberCards = document.querySelectorAll('.member-card');
    memberCards.forEach(card => {
        const username = card.querySelector('h4').textContent.toLowerCase();
        const email = card.querySelector('.member-email').textContent.toLowerCase();
        const role = card.querySelector('.member-role').textContent.toLowerCase();
        
        if (username.includes(searchTerm) || email.includes(searchTerm) || role.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Add event listener for community search
document.getElementById('searchCommunity')?.addEventListener('input', (e) => {
    searchCommunity(e.target.value.toLowerCase());
});

// Product Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const addProductBtn = document.getElementById('addProductBtn');
    const productForm = document.querySelector('.product-form');
    const addItemForm = document.getElementById('addItemForm');
    const cancelAddBtn = document.getElementById('cancelAddBtn');
    const productCategory = document.getElementById('productCategory');
    const subcategoryGroup = document.getElementById('subcategoryGroup');
    const subSubcategoryGroup = document.getElementById('subSubcategoryGroup');
    const productSubcategory = document.getElementById('productSubcategory');
    const productSubSubcategory = document.getElementById('productSubSubcategory');

    // Show/Hide product form
    addProductBtn.addEventListener('click', () => {
        productForm.style.display = 'block';
    });

    cancelAddBtn.addEventListener('click', () => {
        productForm.style.display = 'none';
        addItemForm.reset();
    });

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

    // Handle form submission
    addItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('name', document.getElementById('productName').value);
        formData.append('description', document.getElementById('productDescription').value);
        formData.append('price', document.getElementById('productPrice').value);
        formData.append('stock', document.getElementById('productStock').value);
        formData.append('category', document.getElementById('productCategory').value);
        formData.append('subcategory', document.getElementById('productSubcategory').value);
        formData.append('subSubcategory', document.getElementById('productSubSubcategory').value);

        // Handle image file
        const imageInput = document.getElementById('productImage');
        if (imageInput.files.length > 0) {
            formData.append('image', imageInput.files[0]);
        }

        try {
            const response = await fetch('/api/v1/products', {
                method: 'POST',
                body: formData // FormData will automatically set the correct Content-Type
            });

            if (!response.ok) {
                throw new Error('Failed to add product');
            }

            const result = await response.json();
            alert('Product added successfully!');
            productForm.style.display = 'none';
            addItemForm.reset();
            loadProducts(); // Refresh the product list
        } catch (error) {
            console.error('Error adding product:', error);
            alert('Failed to add product. Please try again.');
        }
    });
});

// Load and display products
async function loadProducts() {
    try {
        const response = await fetch('/api/v1/products');
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const products = await response.json();
        const productsGrid = document.getElementById('productsGrid');
        
        if (!productsGrid) {
            console.error('Products grid element not found');
            return;
        }

        if (products.length === 0) {
            productsGrid.innerHTML = '<p class="no-products">No products found</p>';
            return;
        }

        productsGrid.innerHTML = products.map(product => `
            <div class="product-card" data-product-id="${product._id}">
                <img src="${product.image || '../images/placeholder.png'}" alt="${product.name}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description || ''}</p>
                    <p class="product-price">EGP ${product.price}</p>
                    <p class="stock-info ${product.stock < 10 ? 'low' : ''}">In Stock: ${product.stock}</p>
                    <div class="product-categories">
                        <span class="category-tag">${product.category}</span>
                        ${product.subcategory ? `<span class="category-tag">${product.subcategory}</span>` : ''}
                        ${product.subSubcategory ? `<span class="category-tag">${product.subSubcategory}</span>` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="btn edit-btn" onclick="editProduct('${product._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn delete-btn" onclick="deleteProduct('${product._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        const productsGrid = document.getElementById('productsGrid');
        if (productsGrid) {
            productsGrid.innerHTML = '<p class="error-message">Failed to load products. Please try again later.</p>';
        }
    }
}

// Edit product function
async function editProduct(productId) {
    try {
        const response = await fetch(`/api/v1/products/${productId}`);
        const product = await response.json();

        // Populate form with product data
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productSubcategory').value = product.subcategory || '';
        document.getElementById('productSubSubcategory').value = product.subSubcategory || '';
        
        // Show current image preview if exists
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.src = product.image || '../images/placeholder.png';
            imagePreview.style.display = product.image ? 'block' : 'none';
        }

        // Show/hide subcategory and sub-subcategory fields based on category
        const subcategoryGroup = document.getElementById('subcategoryGroup');
        const subSubcategoryGroup = document.getElementById('subSubcategoryGroup');
        
        if (product.category === 'kids') {
            subcategoryGroup.style.display = 'block';
            if (product.subcategory === 'boys' || product.subcategory === 'girls') {
                subSubcategoryGroup.style.display = 'block';
            }
        }

        // Show the form
        document.querySelector('.product-form').style.display = 'block';
        
        // Update form submission to handle edit
        const form = document.getElementById('addItemForm');
        form.onsubmit = async (e) => {
            e.preventDefault();
            
            const formData = new FormData();
            formData.append('name', document.getElementById('productName').value);
            formData.append('description', document.getElementById('productDescription').value);
            formData.append('price', document.getElementById('productPrice').value);
            formData.append('stock', document.getElementById('productStock').value);
            formData.append('category', document.getElementById('productCategory').value);
            formData.append('subcategory', document.getElementById('productSubcategory').value);
            formData.append('subSubcategory', document.getElementById('productSubSubcategory').value);

            // Handle image file
            const imageInput = document.getElementById('productImage');
            if (imageInput.files.length > 0) {
                formData.append('image', imageInput.files[0]);
            }

            try {
                const updateResponse = await fetch(`/api/v1/products/${productId}`, {
                    method: 'PUT',
                    body: formData
                });

                if (!updateResponse.ok) {
                    throw new Error('Failed to update product');
                }

                alert('Product updated successfully!');
                document.querySelector('.product-form').style.display = 'none';
                form.reset();
                loadProducts(); // Refresh the product list
            } catch (error) {
                console.error('Error updating product:', error);
                alert('Failed to update product. Please try again.');
            }
        };
    } catch (error) {
        console.error('Error loading product for edit:', error);
        alert('Failed to load product details. Please try again.');
    }
}

// Delete product function
async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const response = await fetch(`/api/v1/products/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            alert('Product deleted successfully!');
            loadProducts(); // Refresh the product list
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    }
}

// Load products when the page loads
document.addEventListener('DOMContentLoaded', loadProducts);