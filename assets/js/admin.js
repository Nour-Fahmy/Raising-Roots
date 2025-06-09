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
    const searchInput = document.getElementById('searchApplications');
    const statusFilter = document.getElementById('applicationStatus');
    const applicationsGrid = document.querySelector('.applications-grid');

    // Search functionality
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        filterApplications(searchTerm, statusFilter.value);
    });

    // Status filter functionality
    statusFilter.addEventListener('change', function(e) {
        const status = e.target.value;
        filterApplications(searchInput.value.toLowerCase(), status);
    });

    // Handle application actions
    applicationsGrid.addEventListener('click', function(e) {
        const target = e.target;
        
        // Approve application
        if (target.classList.contains('approve-btn') || target.closest('.approve-btn')) {
            const card = target.closest('.application-card');
            handleApplicationAction(card, 'approve');
        }
        
        // Reject application
        if (target.classList.contains('reject-btn') || target.closest('.reject-btn')) {
            const card = target.closest('.application-card');
            handleApplicationAction(card, 'reject');
        }
        
        // View details
        if (target.classList.contains('view-btn') || target.closest('.view-btn')) {
            const card = target.closest('.application-card');
            viewApplicationDetails(card);
        }
    });
}

function filterApplications(searchTerm, status) {
    const applications = document.querySelectorAll('.application-card');
    
    applications.forEach(card => {
        const expertName = card.querySelector('.expert-details h3').textContent.toLowerCase();
        const specialty = card.querySelector('.specialty').textContent.toLowerCase();
        const currentStatus = card.querySelector('.application-status').textContent.toLowerCase();
        
        const matchesSearch = expertName.includes(searchTerm) || specialty.includes(searchTerm);
        const matchesStatus = status === 'all' || currentStatus === status;
        
        card.style.display = matchesSearch && matchesStatus ? 'block' : 'none';
    });
}

function handleApplicationAction(card, action) {
    const expertName = card.querySelector('.expert-details h3').textContent;
    const statusElement = card.querySelector('.application-status');
    const actionButtons = card.querySelector('.application-actions');
    
    // Show confirmation dialog
    const confirmMessage = action === 'approve' 
        ? `Are you sure you want to approve ${expertName}'s application?`
        : `Are you sure you want to reject ${expertName}'s application?`;
    
    if (confirm(confirmMessage)) {
        // Update UI
        statusElement.textContent = action === 'approve' ? 'Approved' : 'Rejected';
        statusElement.className = `application-status ${action === 'approve' ? 'approved' : 'rejected'}`;
        
        // Disable action buttons
        actionButtons.querySelectorAll('.btn').forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
        
        // TODO: Send API request to update application status
        // sendApplicationStatusUpdate(card.dataset.applicationId, action);
        
        // Show success message
        showNotification(`${expertName}'s application has been ${action}d successfully!`, 'success');
    }
}

function viewApplicationDetails(card) {
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

// Add modal styles
const modalStyles = `
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
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