document.addEventListener('DOMContentLoaded', () => {
    loadNavigation();
    loadFooter();
});

async function loadNavigation() {
    console.log('loadNavigation function called.'); // Added for debugging
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (!navPlaceholder) return;

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

    // Get current page path
    const currentPath = window.location.pathname;
    const isShopPage = currentPath.includes('shop.html');
    const isBabyCarePage = currentPath.includes('BabyCare');

    // Get current cart count from localStorage
    const savedCart = localStorage.getItem('cart');
    const cartCount = savedCart ? JSON.parse(savedCart).reduce((total, item) => total + item.quantity, 0) : 0;

    // Get current language
    const currentLang = localStorage.getItem('language') || 'en';

    // Determine the correct path prefix based on current page
    const pathPrefix = isBabyCarePage ? '../' : './';

    const navHtml = `
        <nav class="navbar">
            <div class="nav-left">
                <a href="${pathPrefix}homepage.html" class="logo">
                    <img src="${pathPrefix}../images/LogoIcon.png" alt="Home">
                </a>
            </div>
            
            <div class="nav-center">
                <div class="nav-item">
                    <a href="${pathPrefix}BabyCare/Baby.html" class="nav-link" data-i18n="baby_care">Baby Care</a>
                    <div class="dropdown">
                        <div class="dropdown-inner">
                            <div class="dropdown-section">
                                <h4 data-i18n="daily_care">Daily Care</h4>
                                <a href="${pathPrefix}BabyCare/nutrition.html" data-i18n="feeding_guide">Feeding Guide</a>
                                <a href="${pathPrefix}BabyCare/sleep.html" data-i18n="sleep_schedule">Sleep Schedule</a>
                                <a href="${pathPrefix}BabyCare/health.html" data-i18n="diapering_tips">Diapering Tips</a>
                            </div>
                            <div class="dropdown-section">
                                <h4 data-i18n="health_safety">Health & Safety</h4>
                                <a href="#" data-i18n="first_aid">First Aid</a>
                                <a href="#" data-i18n="baby_proofing">Baby-Proofing</a>
                                <a href="#" data-i18n="common_concerns">Common Concerns</a>
                            </div>
                            <div class="dropdown-section">
                                <h4 data-i18n="development">Development</h4>
                                <a href="#" data-i18n="milestones">Milestones</a>
                                <a href="#" data-i18n="activities">Activities</a>
                                <a href="#" data-i18n="learning">Learning</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-item">
                    <a href="${pathPrefix}community.html" class="nav-link" data-i18n="community">Community</a>
                    <div class="dropdown">
                        <div class="dropdown-inner">
                            <div class="dropdown-section">
                                <h4 data-i18n="connect">Connect</h4>
                                <a href="${pathPrefix}community.html" data-i18n="find_groups">Find Local Groups</a>
                                <a href="#" data-i18n="discussion_forums">Discussion Forums</a>
                                <a href="#" data-i18n="parent_meetups">Parent Meetups</a>
                            </div>
                            <div class="dropdown-section">
                                <h4 data-i18n="share_learn">Share & Learn</h4>
                                <a href="#" data-i18n="success_stories">Success Stories</a>
                                <a href="#" data-i18n="tips_tricks">Tips & Tricks</a>
                                <a href="#" data-i18n="photo_gallery">Photo Gallery</a>
                            </div>
                            <div class="dropdown-section">
                                <h4 data-i18n="events">Events</h4>
                                <a href="#" data-i18n="upcoming_events">Upcoming Events</a>
                                <a href="#" data-i18n="workshops">Workshops</a>
                                <a href="#" data-i18n="playgroups">Playgroups</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-item">
                    <a href="${pathPrefix}community.html#expert-section" class="nav-link" data-i18n="expert_advice">Expert Advice</a>
                    <div class="dropdown">
                        <div class="dropdown-inner">
                            <div class="dropdown-section">
                                <h4 data-i18n="consultations">Consultations</h4>
                                <a href="${pathPrefix}community.html#expert-section" data-i18n="book_expert">Book an Expert</a>
                                <a href="${pathPrefix}community.html#expert-section" data-i18n="video_calls">Video Calls</a>
                                <a href="${pathPrefix}community.html#expert-section" data-i18n="chat_support">Chat Support</a>
                            </div>
                            <div class="dropdown-section">
                                <h4 data-i18n="resources">Resources</h4>
                                <a href="${pathPrefix}community.html#expert-section" data-i18n="articles">Articles</a>
                                <a href="${pathPrefix}community.html#expert-section" data-i18n="research">Research</a>
                                <a href="${pathPrefix}community.html#expert-section" data-i18n="guidelines">Guidelines</a>
                            </div>
                            <div class="dropdown-section">
                                <h4 data-i18n="learn">Learn</h4>
                                <a href="${pathPrefix}community.html#expert-section" data-i18n="webinars">Webinars</a>
                                <a href="${pathPrefix}community.html#expert-section" data-i18n="qa_sessions">Q&A Sessions</a>
                                <a href="${pathPrefix}community.html#expert-section" data-i18n="expert_blog">Expert Blog</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-item">
                    <a href="${pathPrefix}shop.html" class="nav-link" data-i18n="marketplace">Marketplace</a>
                    <div class="dropdown">
                        <div class="dropdown-inner">
                            <div class="dropdown-section">
                                <h4 data-i18n="marketplace">Marketplace</h4>
                                <a href="${pathPrefix}shop.html" data-i18n="shop_all">Shop All Products</a>
                                <a href="${pathPrefix}shop.html?category=baby-care" data-i18n="baby_care_products">Baby Care</a>
                                <a href="${pathPrefix}shop.html?category=toys" data-i18n="toys_games">Toys & Games</a>
                                <a href="${pathPrefix}shop.html?category=clothing" data-i18n="clothing">Clothing</a>
                                <a href="${pathPrefix}shop.html?category=feeding" data-i18n="feeding">Feeding</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="nav-right">
                ${isLoggedIn ? `
                    ${isShopPage ? `
                        <div class="cart-icon">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count">${cartCount}</span>
                        </div>
                    ` : ''}
                    <div class="profile-dropdown">
                        <button class="profile-btn">
                            <img src="${userData?.profilePicture || pathPrefix + '../images/default-avatar.png'}" 
                                 alt="Profile" 
                                 class="profile-img">
                            <span>${userData?.username || 'Profile'}</span>
                        </button>
                        <div class="dropdown-content">
                            <a href="${pathPrefix}profile.html" data-i18n="view_profile">View Profile</a>
                            <a href="${pathPrefix}profile.html#baby-info" data-i18n="baby_profile">Baby's Profile</a>
                            <a href="${pathPrefix}shop.html" data-i18n="my_orders">My Orders</a>
                            <a href="#" onclick="window.handleLogout(event)" data-i18n="logout">Logout</a>
                        </div>
                    </div>
                ` : `
                    ${isShopPage ? `
                        <div class="cart-icon">
                            <i class="fas fa-shopping-cart"></i>
                            <span class="cart-count">${cartCount}</span>
                        </div>
                    ` : ''}
                    <a href="${pathPrefix}login.html?redirect=${isShopPage ? 'shop.html' : 'homepage.html'}" class="login-btn" data-i18n="login">Login</a>
                    <a href="${pathPrefix}login.html?redirect=${isShopPage ? 'shop.html' : 'homepage.html'}" class="signup-btn" data-i18n="signup">Sign Up</a>
                `}
                <button class="lang-btn" onclick="window.setLanguage(localStorage.getItem('language') === 'en' ? 'ar' : 'en')">${currentLang === 'en' ? 'العربية' : 'English'}</button>
            </div>
        </nav>
    `;

    navPlaceholder.innerHTML = navHtml;

    // Add event listeners for dropdowns
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.querySelector('.dropdown').style.display = 'block';
        });
        item.addEventListener('mouseleave', () => {
            item.querySelector('.dropdown').style.display = 'none';
        });
    });

    // Add event listener for profile dropdown
    const profileBtn = document.querySelector('.profile-btn');
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            document.querySelector('.profile-dropdown').classList.toggle('active');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.profile-dropdown')) {
                document.querySelector('.profile-dropdown')?.classList.remove('active');
            }
        });
    }

    // If we're on the shop page, reinitialize cart functionality
    if (isShopPage) {
        // Dispatch a custom event to notify shop.js that navigation has been updated
        window.dispatchEvent(new CustomEvent('navigationUpdated'));
    }

    // Apply translations if available
    if (window.applyTranslations) {
        window.applyTranslations(currentLang);
    }
}

async function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    const footerHtml = `
        <footer class="footer">
            <p>&copy; 2025 Raising Roots. All rights reserved.</p>
            <p>
                <a href="about.html">About Us</a> |
                <a href="#">Facebook</a> |
                <a href="#">Instagram</a> |
                <a href="#">Twitter</a>
            </p>
            <p>
                Download our app:
                <a href="#">Google Play</a> |
                <a href="#">App Store</a>
            </p>
        </footer>
    `;

    footerPlaceholder.innerHTML = footerHtml;
}

// Make handleLogout globally accessible
window.handleLogout = async function(e) {
    if (e) e.preventDefault(); // Prevent default if called from onclick
    
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

        // Get current page path and determine the correct redirect
        const currentPath = window.location.pathname;
        let redirectPath;

        if (currentPath.includes('shop.html')) {
            redirectPath = './shop.html';
        } else if (currentPath.includes('BabyCare')) {
            redirectPath = window.location.pathname;
        } else if (currentPath.includes('community.html')) {
            redirectPath = './community.html';
        } else if (currentPath.includes('profile.html')) {
            redirectPath = './homepage.html';
        } else {
            // For homepage and other pages
            redirectPath = './homepage.html';
        }

        // Redirect to the appropriate page
        console.log('Logging out and redirecting to:', redirectPath);
        window.location.href = redirectPath;
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect even if server logout fails
        window.location.href = './homepage.html';
    }
} 