document.addEventListener('DOMContentLoaded', () => {
    loadNavigation();
    loadFooter();
});

async function loadNavigation() {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (!navPlaceholder) return;

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

    const navHtml = `
        <nav class="navbar">
            <div class="nav-left">
                <a href="/pages/homepage.html" class="logo">
                    <img src="/images/LogoIcon.png" alt="Home">
                </a>
            </div>
            
            <div class="nav-center">
                <div class="nav-item">
                    <a href="./BabyCare/Baby.html" class="nav-link">Baby Care</a>
                    <div class="dropdown">
                        <div class="dropdown-inner">
                            <div class="dropdown-section">
                                <h4>Daily Care</h4>
                                <a href="./BabyCare/nutrition.html">Feeding Guide</a>
                                <a href="./BabyCare/sleep.html">Sleep Schedule</a>
                                <a href="./BabyCare/health.html">Diapering Tips</a>
                            </div>
                            <div class="dropdown-section">
                                <h4>Health & Safety</h4>
                                <a href="#">First Aid</a>
                                <a href="#">Baby-Proofing</a>
                                <a href="#">Common Concerns</a>
                            </div>
                            <div class="dropdown-section">
                                <h4>Development</h4>
                                <a href="#">Milestones</a>
                                <a href="#">Activities</a>
                                <a href="#">Learning</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-item">
                    <a href="./community.html" class="nav-link">Community</a>
                    <div class="dropdown">
                        <div class="dropdown-inner">
                            <div class="dropdown-section">
                                <h4>Connect</h4>
                                <a href="./community.html">Find Local Groups</a>
                                <a href="#">Discussion Forums</a>
                                <a href="#">Parent Meetups</a>
                            </div>
                            <div class="dropdown-section">
                                <h4>Share & Learn</h4>
                                <a href="#">Success Stories</a>
                                <a href="#">Tips & Tricks</a>
                                <a href="#">Photo Gallery</a>
                            </div>
                            <div class="dropdown-section">
                                <h4>Events</h4>
                                <a href="#">Upcoming Events</a>
                                <a href="#">Workshops</a>
                                <a href="#">Playgroups</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-item">
                    <a href="#" class="nav-link">Expert Advice</a>
                    <div class="dropdown">
                        <div class="dropdown-inner">
                            <div class="dropdown-section">
                                <h4>Consultations</h4>
                                <a href="#">Book an Expert</a>
                                <a href="#">Video Calls</a>
                                <a href="#">Chat Support</a>
                            </div>
                            <div class="dropdown-section">
                                <h4>Resources</h4>
                                <a href="#">Articles</a>
                                <a href="#">Research</a>
                                <a href="#">Guidelines</a>
                            </div>
                            <div class="dropdown-section">
                                <h4>Learn</h4>
                                <a href="#">Webinars</a>
                                <a href="#">Q&A Sessions</a>
                                <a href="#">Expert Blog</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="nav-item">
                    <a href="#" class="nav-link">Marketplace</a>
                    <div class="dropdown">
                        <div class="dropdown-inner">
                            <div class="dropdown-section">
                                <h4>Marketplace</h4>
                                <a href="../pages/shop.html">Shop All Products</a>
                                <a href="../pages/shop.html?category=baby-care">Baby Care</a>
                                <a href="../pages/shop.html?category=toys">Toys & Games</a>
                                <a href="../pages/shop.html?category=clothing">Clothing</a>
                                <a href="../pages/shop.html?category=feeding">Feeding</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="nav-right">
                ${isLoggedIn ? `
                    <div class="profile-dropdown">
                        <button class="profile-btn">
                            <img src="${userData?.profilePicture || '/images/default-avatar.png'}" 
                                 alt="Profile" 
                                 class="profile-img">
                            <span>${userData?.username || 'Profile'}</span>
                        </button>
                        <div class="dropdown-content">
                            <a href="/pages/profile.html">View Profile</a>
                            <a href="/pages/profile.html#baby-info">Baby's Profile</a>
                            <a href="/pages/shop.html">My Orders</a>
                            <a href="#" onclick="window.handleLogout(event)">Logout</a>
                        </div>
                    </div>
                ` : `
                    <a href="/pages/login.html" class="login-btn">Login</a>
                    <a href="/pages/login.html" class="signup-btn">Sign Up</a>
                `}
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
}

async function loadFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (!footerPlaceholder) return;

    const footerHtml = `
        <footer class="footer">
            <p>&copy; 2025 Raising Roots. All rights reserved.</p>
            <p>
                <a href="about-us.html">About Us</a> |
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
        const response = await fetch('http://localhost:3000/api/v1/users/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        // Even if server logout fails, we've already cleared the token
        // so we can proceed with redirect
        console.log('Logging out and redirecting to homepage...');
        window.location.href = '/pages/homepage.html';
    } catch (error) {
        console.error('Error during logout:', error);
        // Still redirect to homepage even if server logout fails
        window.location.href = '/pages/homepage.html';
    }
} 