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