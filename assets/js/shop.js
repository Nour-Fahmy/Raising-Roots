// This is a test comment to check file write access.
// --- Core Shop State & DOM Elements ---
let categoryButtons;
let subcategoryButtons;
let subSubcategoryButtons;
let productsGrids;

let cartContainer;
let cartIcon;
let closeCart;
let cartItemsContainer;
let totalPriceElement;
let cartCountElement;

// Initialize cart from localStorage or empty array
let cart = [];
function initializeCart() {
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
        console.log('Cart initialized:', cart);
        
        // Update cart UI immediately after initialization
        updateCart();
        updateCartCount();
    } catch (error) {
        console.error('Error initializing cart:', error);
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
    }
}

// Listen for storage changes (login/logout)
window.addEventListener('storage', function(e) {
    if (e.key === 'token') {
        // Re-initialize cart when login state changes
        console.log('Login state changed, reinitializing cart');
        initializeCart();
    }
});

// Call initializeCart immediately
initializeCart();

// Function to handle clicks outside the cart
function handleClickOutside(event) {
    // Don't close if clicking on cart buttons, add to cart buttons, or their children
    if (event.target.closest('.cart-item-quantity') || 
        event.target.closest('.remove-item') ||
        event.target.closest('.cart-icon') ||
        event.target.closest('.add-to-cart') ||
        event.target.closest('.product-card')) {
        return;
    }
    
    if (cartContainer && cartIcon && !cartContainer.contains(event.target) && !cartIcon.contains(event.target)) {
        cartContainer.classList.remove('active');
    }
}

// --- Utility Functions ---

// Function to show a temporary notification
function showNotification(message, type = 'success') {
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification ${type}`;
    notificationElement.textContent = message;
    document.body.appendChild(notificationElement);

    // Automatically remove after 3 seconds
    setTimeout(() => {
        notificationElement.remove();
    }, 3000);
}

    // Function to hide all content sections and deactivate all sidebar items
    function resetAllStates() {
        document.querySelectorAll('.category-section, .subcategory-section, .sub-subcategory-section').forEach(section => {
            section.classList.remove('active');
        section.style.display = 'none'; // Explicitly hide sections
        });
        document.querySelectorAll('.category-button, .subcategory-button, .sub-subcategory-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.category-item, .subcategory-item, .sub-subcategory-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelectorAll('.subcategory').forEach(sub => {
            sub.classList.remove('active');
        });
    }

// --- Product Card Rendering ---
function renderShopProductCard(product) {
    const pid = product._id; // Ensure we always use MongoDB's _id
    console.log('Rendering product card with pid:', pid, 'for product:', product); // DIAGNOSTIC
    // Get stock from localStorage; if not present, use product.stock from DB
    let stock = localStorage.getItem(`stock_${pid}`);
    if (stock === null) {
        stock = product.stock;
        localStorage.setItem(`stock_${pid}`, stock);
    } else {
        stock = parseInt(stock);
    }
    const imageUrl = product.image ? `https://localhost:3000${product.image}` : '../images/default-avatar.png';
    return `
        <div class="product-card" data-product-id="${pid}">
            <div class="product-image">
                <img src="${imageUrl}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">EGP ${product.price.toFixed(2)}</p>
                <p class="product-description">${product.description || ''}</p>
                <p class="stock-info${stock < 10 ? ' low' : ''}">In Stock: ${stock}</p>
                <button class="add-to-cart" type="button" ${stock <= 0 ? 'disabled' : ''}>
                    ${stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
            </div>
        `;
}

// --- Cart Logic ---

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Cart saved to localStorage:', cart); // Debug log
    updateCartCount(); // Update count whenever cart is saved
}

function updateCartCount() {
    // Get all cart count elements (there might be multiple in the navigation)
    const cartCountElements = document.querySelectorAll('.cart-count');
    if (!cartCountElements.length) {
        console.warn('No cart count elements found');
            return;
        }

    // Calculate total items in cart
    const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    console.log('Updating cart count to:', totalItems); // Debug log

    // Update all cart count elements
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
        // Show/hide the count based on whether there are items
        element.style.display = totalItems > 0 ? 'block' : 'none';
    });
}

function updateCart() {
    if (!cartItemsContainer || !totalPriceElement) {
        console.warn('Cart container elements not found');
        return;
    }

    // Ensure cart variable is updated with latest from localStorage
    try {
        const savedCart = localStorage.getItem('cart');
        cart = savedCart ? JSON.parse(savedCart) : [];
        console.log('Cart loaded from localStorage:', cart); // Debug log
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        cart = [];
    }

    cartItemsContainer.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        // Add validation for cart item structure
        if (!item.id || !item.title || !item.price || !item.image) {
            console.error('Invalid cart item detected:', item);
                return;
            }

        const itemTotal = item.price * (item.quantity || 0);
        total += itemTotal;
        count += (item.quantity || 0);

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-image">
            <div class="item-details">
                <h3 class="cart-item-title">${item.title}</h3>
                <p class="cart-item-price">EGP ${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" type="button">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn increase" type="button">+</button>
                    <button class="remove-item" type="button">Remove</button>
                </div>
            </div>
        `;

        // Attach event listeners to quantity buttons for cart items
        cartItem.querySelector('.decrease').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            if (item.quantity > 1) {
                item.quantity -= 1;
                // Update stock on the main product card
                const productCard = document.querySelector(`[data-product-id="${item.id}"]`);
                if (productCard) {
                    const stockInfoElement = productCard.querySelector('.stock-info');
                    let currentStock = parseInt(stockInfoElement.textContent.replace('In Stock: ', ''));
                    currentStock++;
                    stockInfoElement.textContent = `In Stock: ${currentStock}`;
                    localStorage.setItem(`stock_${item.id}`, currentStock);
                    const addToCartButton = productCard.querySelector('.add-to-cart');
                    if (addToCartButton) {
                        addToCartButton.textContent = 'Add to Cart';
                        addToCartButton.disabled = false;
                        addToCartButton.style.backgroundColor = '';
                        addToCartButton.style.cursor = '';
                    }
                }
                saveCart();
                updateCart();
                updateCartCount();
            }
        });

        cartItem.querySelector('.increase').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            const productCard = document.querySelector(`[data-product-id="${item.id}"]`);
            if (productCard) {
                const stockInfoElement = productCard.querySelector('.stock-info');
                let currentStock = parseInt(stockInfoElement.textContent.replace('In Stock: ', ''));
                if (currentStock > 0) {
                    item.quantity += 1;
                    currentStock--;
                    stockInfoElement.textContent = `In Stock: ${currentStock}`;
                    localStorage.setItem(`stock_${item.id}`, currentStock);
                    if (currentStock === 0) {
                        const addToCartButton = productCard.querySelector('.add-to-cart');
                        if (addToCartButton) {
                            addToCartButton.textContent = 'Out of Stock';
                            addToCartButton.disabled = true;
                            addToCartButton.style.backgroundColor = '#ccc';
                            addToCartButton.style.cursor = '';
                        }
                    }
                    saveCart();
                    updateCart();
                    updateCartCount();
                }
            }
        });

        cartItem.querySelector('.remove-item').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            // Remove item from cart
            cart = cart.filter(cartItem => cartItem.id !== item.id);
            // Update stock on the main product card
            const productCard = document.querySelector(`[data-product-id="${item.id}"]`);
            if (productCard) {
                const stockInfoElement = productCard.querySelector('.stock-info');
                let currentStock = parseInt(stockInfoElement.textContent.replace('In Stock: ', ''));
                currentStock += item.quantity;
                stockInfoElement.textContent = `In Stock: ${currentStock}`;
                localStorage.setItem(`stock_${item.id}`, currentStock);
                const addToCartButton = productCard.querySelector('.add-to-cart');
                if (addToCartButton) {
                    addToCartButton.textContent = 'Add to Cart';
                    addToCartButton.disabled = false;
                    addToCartButton.style.backgroundColor = '';
                    addToCartButton.style.cursor = '';
                }
            }
            saveCart();
            updateCart();
            updateCartCount();
            showNotification(getTranslation('item_removed_from_cart'), 'success');
        });

        cartItemsContainer.appendChild(cartItem);
    });

    totalPriceElement.textContent = `EGP ${total.toFixed(2)}`;
    updateCartCount(); // Update count after cart update
    updateDeliveryTimeDisplay(); // Update delivery time after cart update
}

function updateDeliveryTimeDisplay() {
    const deliveryDateElement = document.querySelector('.delivery-date');
    if (!deliveryDateElement) {
        console.warn('Delivery date element not found');
        return;
    }

    const today = new Date();
    const deliveryMinDays = 3;
    const deliveryMaxDays = 5;

    const minDate = new Date(today);
    minDate.setDate(today.getDate() + deliveryMinDays);

    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + deliveryMaxDays);

    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const minDateFormatted = minDate.toLocaleDateString(undefined, options);
    const maxDateFormatted = maxDate.toLocaleDateString(undefined, options);

    deliveryDateElement.textContent = `${minDateFormatted} - ${maxDateFormatted}`;
}

// --- Event Delegation for Product Grids ---
function setupGridDelegation() {
    // Get all product grids
    const productGrids = document.querySelectorAll('.products-grid');
    console.log('Setting up grid delegation for', productGrids.length, 'grids');

    productGrids.forEach(grid => {
        // Remove any existing listeners to prevent duplicates by cloning and replacing
        const oldGrid = document.querySelector(`#${grid.id}`);
        if (oldGrid) { // Ensure the old grid exists before trying to replace
            const newGrid = oldGrid.cloneNode(true);
            oldGrid.replaceWith(newGrid);
            newGrid.addEventListener('click', async (e) => {
                const addToCartButton = e.target.closest('.add-to-cart');
                if (addToCartButton) {
                    e.stopPropagation(); // Prevent event bubbling
                    const productCard = addToCartButton.closest('.product-card');
                    if (!productCard) return;

                    console.log('Add to cart clicked for product:', productCard.dataset.productId);

                    const productId = productCard.dataset.productId;
                    const productTitle = productCard.querySelector('.product-title').textContent;
                    const productPrice = parseFloat(productCard.querySelector('.product-price').textContent.replace('EGP ', ''));
                    const productImage = productCard.querySelector('.product-image img').src;
                    const stockInfo = productCard.querySelector('.stock-info');
                    let currentStock = parseInt(stockInfo.textContent.replace('In Stock: ', ''));

                    if (currentStock <= 0) {
                        showNotification(getTranslation('out_of_stock'), 'error');
                        return;
                    }

                    // Check if product is already in cart
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                            title: productTitle,
                            price: productPrice,
                            image: productImage,
                quantity: 1
            });
        }
        
                    // Update stock
                    currentStock--;
                    stockInfo.textContent = `In Stock: ${currentStock}`;
                    localStorage.setItem(`stock_${productId}`, currentStock);

                    // Update UI
                    if (currentStock === 0) {
                        addToCartButton.textContent = 'Out of Stock';
                        addToCartButton.disabled = true;
                        addToCartButton.style.backgroundColor = '#ccc';
                        addToCartButton.style.cursor = 'not-allowed';
                    }

                    saveCart();
                    updateCart();
                    updateCartCount();
                    showNotification(getTranslation('item_added_to_cart'), 'success');
                }
            });
        }
    });
}

// --- Fetch & Render Products for Specific Grids ---
async function fetchAndRenderProductsForGrid(gridId, category, subcategory = null, subSubcategory = null) {
    try {
        let url = `https://localhost:3000/api/v1/products?category=${category}`;
        if (subcategory) url += `&subcategory=${subcategory}`;
        if (subSubcategory) {
            // Handle the sub-subcategory parameter correctly
            // For fashion and toys, we need to use the full identifier (e.g., girls-fashion, boys-toys)
            url += `&subSubcategory=${subSubcategory}`;
        }

        console.log(`Fetching products for ${gridId} from URL: ${url}`); // Debug log

        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            mode: 'cors',
            credentials: 'include',
            cache: 'no-cache'
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch products for ${category}/${subcategory || ''}/${subSubcategory || ''}`);
        }

        const products = await response.json();
        console.log(`Fetched ${products.length} products for ${gridId}:`, products); // Debug log with products

        const targetGrid = document.querySelector(gridId);
        if (!targetGrid) {
            console.error(`Target grid not found: ${gridId}`);
            return;
        }
        
        // Ensure the parent section is visible
        const parentSection = targetGrid.closest('.category-section, .subcategory-section, .sub-subcategory-section');
        if (parentSection) {
            parentSection.style.display = 'block';
            parentSection.classList.add('active');
        }

        if (products.length > 0) {
            targetGrid.innerHTML = products.map(renderShopProductCard).join('');
            console.log(`Rendered ${products.length} products in ${gridId}`);
            // Setup event delegation after rendering products
            setupGridDelegation();
            } else {
            targetGrid.innerHTML = '<p class="no-products" data-i18n="no_products">No products available.</p>';
        }

        updateCartCount();
        updateCart();

    } catch (err) {
        console.error(`Failed to load products for ${gridId}:`, err);
        const targetGrid = document.querySelector(gridId);
        if (targetGrid) {
            targetGrid.innerHTML = '<p class="no-products" data-i18n="no_products">Failed to load products. Please try again later.</p>';
        }
    }
}

// --- Fetch & Render All Products (Orchestrator) ---
async function fetchAndRenderAllShopProducts() {
    console.log('Fetching and rendering all shop products (orchestrator).');
    
    // Fetch adult products
    await fetchAndRenderProductsForGrid('#adult-products-grid', 'adult');
    
    // Fetch kids products with proper sub-subcategory identifiers
    await Promise.all([
        fetchAndRenderProductsForGrid('#girls-fashion-grid', 'kids', 'girls', 'girls-fashion'),
        fetchAndRenderProductsForGrid('#boys-fashion-grid', 'kids', 'boys', 'boys-fashion'),
        fetchAndRenderProductsForGrid('#boys-toys-grid', 'kids', 'boys', 'boys-toys'),
        fetchAndRenderProductsForGrid('#girls-toys-grid', 'kids', 'girls', 'girls-toys'),
        fetchAndRenderProductsForGrid('#feeding-grid', 'kids', 'feeding'),
        fetchAndRenderProductsForGrid('#health-grid', 'kids', 'health')
    ]);
}

// --- Main Shop Initialization ---
async function initializeShopPage() {
    console.log('Initializing shop page');
    
    // Re-query all necessary DOM elements on initialization
    categoryButtons = document.querySelectorAll('.category-button');
    subcategoryButtons = document.querySelectorAll('.subcategory-button');
    subSubcategoryButtons = document.querySelectorAll('.sub-subcategory-button');

    // Initialize cart elements immediately
    cartContainer = document.querySelector('.cart-container');
    cartIcon = document.querySelector('.cart-icon');
    closeCart = document.querySelector('.close-cart');
    cartItemsContainer = document.querySelector('.cart-items');
    totalPriceElement = document.querySelector('.total-price');
    
    // Get all cart count elements
    const cartCountElements = document.querySelectorAll('.cart-count');
    console.log('Found cart count elements:', cartCountElements.length);

    // Debug logging for cart elements
    console.log('Cart elements found:', {
        cartContainer: !!cartContainer,
        cartIcon: !!cartIcon,
        closeCart: !!closeCart,
        cartItemsContainer: !!cartItemsContainer,
        totalPriceElement: !!totalPriceElement,
        cartCountElements: cartCountElements.length
    });

    // Initialize cart UI
    initializeCart();
    updateCart(); // This will also update the cart count

    // Listen for cart opened event
    document.addEventListener('cartOpened', () => {
        console.log('Cart opened event received');
        if (cartContainer) {
            cartContainer.classList.add('active');
            // Reset payment method to cash and hide credit card fields
            const cashPayment = document.querySelector('input[name="payment"][value="cash"]');
            const creditCardFields = document.querySelector('.credit-card-fields');
            if (cashPayment) cashPayment.checked = true;
            if (creditCardFields) creditCardFields.style.display = 'none';
        }
    });

    // Setup cart modal toggle listeners
    if (cartIcon && cartContainer) {
        console.log('Setting up cart icon click listener in shop');
        cartIcon.addEventListener('click', () => {
            console.log('Cart icon clicked in shop');
            cartContainer.classList.add('active');
            // Dispatch cart opened event
            document.dispatchEvent(new CustomEvent('cartOpened'));
        });

        // Add click outside listener
        document.addEventListener('click', handleClickOutside);
            } else {
        console.error('Cart icon or container not found:', { cartIcon: !!cartIcon, cartContainer: !!cartContainer });
    }

    if (closeCart && cartContainer) {
        closeCart.addEventListener('click', () => {
            cartContainer.classList.remove('active');
        });
    }

    // Listen for navigation loaded event
    document.addEventListener('navigationLoaded', () => {
        console.log('Navigation loaded event received in shop');
        // Re-initialize cart elements after navigation is loaded
        cartIcon = document.querySelector('.cart-icon');
        cartContainer = document.querySelector('.cart-container');
        
        // Update cart count after navigation is loaded
        updateCartCount();
        
        if (cartIcon && cartContainer) {
            console.log('Re-setting up cart icon click listener after navigation load');
            cartIcon.addEventListener('click', () => {
                console.log('Cart icon clicked after navigation load');
                cartContainer.classList.add('active');
                document.dispatchEvent(new CustomEvent('cartOpened'));
            });
        }
    });

    // Initial setup to clear all states and explicitly set default Adult Products as active
    resetAllStates(); // Hide all sections and deactivate all buttons/items

    // Explicitly activate Adult Products as default
    const defaultCategoryButton = document.querySelector('.category-button[data-category="adult"]');
    const defaultCategoryItem = document.querySelector('.category-item[data-category="adult"]');
    const defaultSection = document.getElementById('adult-products');

    if (defaultCategoryButton) {
        defaultCategoryButton.classList.add('active');
    }
    if (defaultCategoryItem) {
        defaultCategoryItem.classList.add('active');
    }
    if (defaultSection) {
        defaultSection.classList.add('active');
        defaultSection.style.display = 'block';
        await fetchAndRenderProductsForGrid('#adult-products-grid', 'adult');
    }

    // Set up all other listeners
    setupCategoryListeners();
    setupSubcategoryListeners();
    setupSubSubcategoryListeners();
    setupGridDelegation(); // Initial setup for product grids
    
    // Check URL for direct category/subcategory links and activate them
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    const subcategoryParam = urlParams.get('subcategory');
    const subSubcategoryParam = urlParams.get('subSubcategory');

    if (categoryParam) {
        const targetCategoryButton = document.querySelector(`.category-button[data-category="${categoryParam}"]`);
        if (targetCategoryButton) {
            // Simulate a click on the category button to trigger its logic
            targetCategoryButton.click();
        }
        if (subcategoryParam) {
            const targetSubcategoryButton = document.querySelector(`.subcategory-button[data-subcategory="${subcategoryParam}"]`);
            if (targetSubcategoryButton) {
                targetSubcategoryButton.click();
            }
            if (subSubcategoryParam) {
                const targetSubSubcategoryButton = document.querySelector(`.sub-subcategory-button[data-sub-subcategory="${subSubcategoryParam}"]`);
                if (targetSubSubcategoryButton) {
                    targetSubSubcategoryButton.click();
                }
            }
        }
    }

    // Initialize checkout elements
    apartmentInput = document.getElementById('apartment');
    cardNumber = document.getElementById('cardNumber');
    expiryDate = document.getElementById('expiryDate');
    cvv = document.getElementById('cvv');
    checkoutBtn = document.querySelector('.checkout-btn');
    checkoutModal = document.querySelector('.checkout-modal');
    closeCheckout = document.querySelector('.close-checkout');
    checkoutForm = document.getElementById('checkout-form');
    orderSuccessMessage = document.getElementById('orderSuccessMessage');
    phoneInput = document.getElementById('phone');
    phoneError = document.getElementById('phoneError');

    // Add validation for apartment number
    if (apartmentInput) {
        apartmentInput.addEventListener('input', function() {
            const value = parseInt(this.value);
            if (value < 0) {
                this.value = 0;
                document.getElementById('apartmentError').textContent = 'Apartment number cannot be negative';
            } else {
                document.getElementById('apartmentError').textContent = '';
            }
        });

        // Also prevent negative numbers on keypress
        apartmentInput.addEventListener('keypress', function(e) {
            if (e.key === '-' || e.key === 'e') {
                e.preventDefault();
            }
        });
    }

    // Formatting for card number and expiry date
    if(cardNumber) {
        cardNumber.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value;
        });
    }
    if(expiryDate) {
        expiryDate.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2);
            }
            e.target.value = value;
        });
    }
    if(cvv) {
        cvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }

    // Checkout form submission
    if (checkoutBtn && checkoutModal && closeCheckout && checkoutForm && orderSuccessMessage && phoneInput && phoneError) {
    checkoutBtn.addEventListener('click', () => {
            // Check if cart is empty
            cart = JSON.parse(localStorage.getItem('cart')) || []; // Ensure cart is fresh
        if (cart.length === 0) {
                alert(getTranslation('cart_empty'));
            return;
        }
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
            // If cart is not empty and user is logged in, open the checkout modal
        checkoutModal.classList.add('active');
            // Reset payment method to cash and hide credit card fields when opening modal
            document.querySelector('input[name="payment"][value="cash"]').checked = true;
            // Ensure credit card fields are hidden when opening the modal
            const creditCardFields = document.querySelector('.credit-card-fields');
            if (creditCardFields) {
                creditCardFields.style.display = 'none';
                document.getElementById('cardNumber').required = false;
                document.getElementById('cardName').required = false;
                document.getElementById('expiryDate').required = false;
                document.getElementById('cvv').required = false;
            }
    });

    closeCheckout.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
    });

    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
    });

    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const creditCardFields = document.querySelector('.credit-card-fields');
    const apartmentError = document.getElementById('apartmentError');

    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                creditCardFields.style.display = 'block';
                document.getElementById('cardNumber').required = true;
                document.getElementById('cardName').required = true;
                document.getElementById('expiryDate').required = true;
                document.getElementById('cvv').required = true;
            } else {
                creditCardFields.style.display = 'none';
                document.getElementById('cardNumber').required = false;
                document.getElementById('cardName').required = false;
                document.getElementById('expiryDate').required = false;
                document.getElementById('cvv').required = false;
            }
        });
    });

        checkoutForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            console.log('Checkout form submitted. Current cart state at start:', cart); // DIAGNOSTIC 1

            // Get user info and form data
            const userString = localStorage.getItem('user');
            let userId = null;
            if (userString) {
                try {
                    const userObject = JSON.parse(userString);
                    userId = userObject.id;
                } catch (e) {
                    console.error('Error parsing user data from localStorage:', e);
                }
            }
            const token = localStorage.getItem('token');
            console.log('User info (after parsing):', { userId, token });
            console.log('Cart state before userId/token check:', cart); // DIAGNOSTIC 2

            // Clear previous error messages
            phoneError.textContent = '';
            phoneError.style.display = 'none';
            document.getElementById('cardNumberError').textContent = '';
            document.getElementById('cardNumberError').style.display = 'none';
            document.getElementById('cardNameError').textContent = '';
            document.getElementById('cardNameError').style.display = 'none';
            document.getElementById('expiryDateError').textContent = '';
            document.getElementById('expiryDateError').style.display = 'none';
            document.getElementById('cvvError').textContent = '';
            document.getElementById('cvvError').style.display = 'none';
            apartmentError.textContent = '';
            apartmentError.style.display = 'none';

            // Validate form fields
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const phone = phoneInput.value;
            const address = document.getElementById('address').value.trim();
            const apartment = apartmentInput ? apartmentInput.value : '';
            const selectedPayment = document.querySelector('input[name="payment"]:checked').value;

            console.log('Form data:', { firstName, lastName, phone, address, apartment, selectedPayment });

            // Validate phone number
            if (phone.length !== 11) {
                phoneError.textContent = getTranslation('invalid_phone');
                phoneError.style.display = 'block';
                console.error('Phone number validation failed.');
                return;
            }

            // Validate apartment number
            if (apartment && (!/^[0-9]+$/.test(apartment) || parseInt(apartment) < 1 || parseInt(apartment) > 999)) {
                apartmentError.textContent = getTranslation('invalid_apartment');
                apartmentError.style.display = 'block';
                console.error('Apartment number validation failed.');
                return;
            }

            // Validate credit card fields if card payment is selected
            if (selectedPayment === 'card') {
                const cardNumberInput = document.getElementById('cardNumber');
                const cardNameInput = document.getElementById('cardName');
                const expiryDateInput = document.getElementById('expiryDate');
                const cvvInput = document.getElementById('cvv');

                if (!cardNumberInput?.value || cardNumberInput.value.replace(/\s/g, '').length !== 16) {
                    document.getElementById('cardNumberError').textContent = getTranslation('invalid_card_number') || 'Please enter a valid 16-digit card number.';
                    document.getElementById('cardNumberError').style.display = 'block';
                    console.error('Card number validation failed.');
                    return;
                }
                if (!cardNameInput?.value.trim()) {
                    document.getElementById('cardNameError').textContent = getTranslation('invalid_card_name') || 'Card name cannot be empty.';
                    document.getElementById('cardNameError').style.display = 'block';
                    console.error('Card name validation failed.');
                    return;
                }
                if (!expiryDateInput?.value || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(expiryDateInput.value)) {
                    document.getElementById('expiryDateError').textContent = getTranslation('invalid_expiry_date') || 'Please enter a valid expiry date (MM/YY).';
                    document.getElementById('expiryDateError').style.display = 'block';
                    console.error('Expiry date format validation failed.');
                    return;
                }
                const [month, year] = expiryDateInput.value.split('/').map(Number);
                const currentYear = new Date().getFullYear() % 100;
                const currentMonth = new Date().getMonth() + 1;

                if (year < currentYear || (year === currentYear && month < currentMonth)) {
                    document.getElementById('expiryDateError').textContent = getTranslation('expiry_date_past') || 'Expiry date cannot be in the past.';
                    document.getElementById('expiryDateError').style.display = 'block';
                    console.error('Expiry date in past validation failed.');
                    return;
                }

                if (!cvvInput?.value || !/^[0-9]{3,4}$/.test(cvvInput.value)) {
                    document.getElementById('cvvError').textContent = getTranslation('invalid_cvv') || 'Please enter a valid 3 or 4-digit CVV.';
                    document.getElementById('cvvError').style.display = 'block';
                    console.error('CVV validation failed.');
                    return;
                }
            }

            // Ensure cart is not empty
            if (!cart || cart.length === 0) {
                alert(getTranslation('cart_empty'));
                console.error('Cart is empty, cannot proceed with order.');
                return;
            }

            // --- ACTUAL ORDER SUBMISSION TO BACKEND AND UI UPDATE ---
            try {
                // IMPORTANT: Check for userId/token before attempting database save
                if (!userId || !token) {
                    console.log('Cart state inside userId/token check (should not be here if logged in):', cart); // DIAGNOSTIC (if hit)
                    console.warn('No user ID or token found in localStorage. Skipping database order save.');
                    // Still show frontend success as we agreed, even if no user for DB save.
                    checkoutModal.classList.remove('active');
                    orderSuccessMessage.classList.add('active');
                    setTimeout(() => {
                        orderSuccessMessage.classList.remove('active');
                    }, 5000);

                    cart = [];
                    saveCart();
                    updateCart();
                    updateCartCount();
                    return; // Skip backend save if user is not logged in
                }
                console.log('Cart state after userId/token check (should be full if logged in):', cart); // DIAGNOSTIC 3

                // Prepare order data according to our backend schema (order.js)
                // THIS MUST BE DONE BEFORE CLEARING CART
                console.log('Cart state immediately before orderData construction:', cart); // DIAGNOSTIC 4
                const orderData = {
                    user: userId,
                    products: cart.map(item => ({
                        product: item.id, // Assuming item.id is the product _id from MongoDB
                        quantity: item.quantity
                    })),
                    shippingAddress: {
                        firstName,
                        lastName,
                        phone,
                        address,
                        apartment: parseInt(apartment)
                    },
                    paymentMethod: selectedPayment
                };

                console.log('Attempting to send order data to backend:', orderData);
                
                // Send order to backend
                const response = await fetch('/api/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Include token for authentication
                    },
                    body: JSON.stringify(orderData)
                });

                console.log('Backend response status for order save:', response.status);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Backend error saving order:', errorData);
                    alert(getTranslation('error_creating_order') || 'Error creating order. Please try again.');
                    return; // Stop if backend save failed
                }

                const orderResult = await response.json();
                console.log('Order successfully saved to database:', orderResult);

                // Display success message and clear cart ONLY AFTER successful backend save
                checkoutModal.classList.remove('active');
                orderSuccessMessage.classList.add('active');
                setTimeout(() => {
                    orderSuccessMessage.classList.remove('active');
                }, 5000);

                cart = [];
                saveCart();
                updateCart();
                updateCartCount();

            } catch (error) {
                console.error('Network or unexpected error during order creation:', error);
                alert(getTranslation('error_creating_order') || 'Error creating order. Please try again.');
            }
        });
    }
}

// --- Event Listeners for Category Navigation ---
function setupCategoryListeners() {
    categoryButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            console.log(`Category button clicked: ${category}`); // Debug log

            // Reset all states first
            resetAllStates();

            // Activate clicked category
            this.classList.add('active');
            this.closest('.category-item')?.classList.add('active');

            // Special handling for 'kids' category to display all kids products
            if (category === 'kids') {
                // Show the kids section
                const kidsSection = document.getElementById('kids-section');
                if (kidsSection) {
                    kidsSection.classList.add('active');
                    kidsSection.style.display = 'block';
                }

                // Show all subcategory sections
                const subcategorySections = [
                    'boys-products',
                    'girls-products',
                    'feeding-section',
                    'health-section'
                ];

                subcategorySections.forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        section.classList.add('active');
                        section.style.display = 'block';
                    }
                });

                // Show all sub-subcategory sections
                const subSubcategorySections = [
                    'boys-fashion-section',
                    'boys-toys-section',
                    'girls-fashion-section',
                    'girls-toys-section'
                ];

                subSubcategorySections.forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        section.classList.add('active');
                        section.style.display = 'block';
                    }
                });

                // Fetch all kids products
                await Promise.all([
                    // Boys products
                    fetchAndRenderProductsForGrid('#boys-fashion-grid', 'kids', 'boys', 'boys-fashion'),
                    fetchAndRenderProductsForGrid('#boys-toys-grid', 'kids', 'boys', 'boys-toys'),
                    // Girls products
                    fetchAndRenderProductsForGrid('#girls-fashion-grid', 'kids', 'girls', 'girls-fashion'),
                    fetchAndRenderProductsForGrid('#girls-toys-grid', 'kids', 'girls', 'girls-toys'),
                    // Other categories
                    fetchAndRenderProductsForGrid('#feeding-grid', 'kids', 'feeding'),
                    fetchAndRenderProductsForGrid('#health-grid', 'kids', 'health')
                ]);

            } else if (category === 'adult') {
                // For adult category, explicitly show the adult section and fetch products
                const adultSection = document.getElementById('adult-products');
                if (adultSection) {
                    adultSection.classList.add('active');
                    adultSection.style.display = 'block';
                    console.log('Adult section display style:', window.getComputedStyle(adultSection).display);
                }
                await fetchAndRenderProductsForGrid('#adult-products-grid', 'adult');
            }
        });
    });
}

// Handle subcategory button clicks
function setupSubcategoryListeners() {
    subcategoryButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation();
            // Clear all active classes from buttons and items
            document.querySelectorAll('.category-button, .subcategory-button, .sub-subcategory-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.category-item, .subcategory-item, .sub-subcategory-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelectorAll('.subcategory').forEach(sub => {
                sub.classList.remove('active');
            });

            // Hide all subcategory and sub-subcategory sections
            document.querySelectorAll('.subcategory-section, .sub-subcategory-section').forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });

            const subcategory = this.getAttribute('data-subcategory');
            const parentCategoryButton = document.querySelector('.category-button[data-category="kids"]');
            if (parentCategoryButton) {
                parentCategoryButton.classList.add('active');
                parentCategoryButton.closest('.category-item')?.classList.add('active');
                document.getElementById('kids-section')?.classList.add('active');
                document.getElementById('kids-section').style.display = 'block';
            }

            this.classList.add('active');
            this.closest('.subcategory-item')?.classList.add('active');

            // Show the specific subcategory products section
            if (subcategory === 'girls') {
                // Show girls products section
                const girlsProductsSection = document.getElementById('girls-products');
                if (girlsProductsSection) {
                    girlsProductsSection.classList.add('active');
                    girlsProductsSection.style.display = 'block';
                }

                // Hide both girls fashion and toys sections initially
                const girlsFashionSection = document.getElementById('girls-fashion-section');
                const girlsToysSection = document.getElementById('girls-toys-section');
                if (girlsFashionSection) {
                    girlsFashionSection.classList.remove('active');
                    girlsFashionSection.style.display = 'none';
                }
                if (girlsToysSection) {
                    girlsToysSection.classList.remove('active');
                    girlsToysSection.style.display = 'none';
                }

                // Don't fetch any products here - they will be fetched when clicking sub-subcategory buttons
            } else if (subcategory === 'boys') {
                // Show boys products section
                const boysProductsSection = document.getElementById('boys-products');
                if (boysProductsSection) {
                    boysProductsSection.classList.add('active');
                    boysProductsSection.style.display = 'block';
                }

                // Hide both boys fashion and toys sections initially
                const boysFashionSection = document.getElementById('boys-fashion-section');
                const boysToysSection = document.getElementById('boys-toys-section');
                if (boysFashionSection) {
                    boysFashionSection.classList.remove('active');
                    boysFashionSection.style.display = 'none';
                }
                if (boysToysSection) {
                    boysToysSection.classList.remove('active');
                    boysToysSection.style.display = 'none';
                }

                // Don't fetch any products here - they will be fetched when clicking sub-subcategory buttons
            } else if (subcategory === 'feeding') {
                await fetchAndRenderProductsForGrid('#feeding-grid', 'kids', 'feeding');
            } else if (subcategory === 'health') {
                await fetchAndRenderProductsForGrid('#health-grid', 'kids', 'health');
            }
        });
    });
}

// Handle sub-subcategory button clicks
function setupSubSubcategoryListeners() {
    subSubcategoryButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.stopPropagation();
            // Clear all active classes from buttons and items
            document.querySelectorAll('.category-button, .subcategory-button, .sub-subcategory-button').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelectorAll('.category-item, .subcategory-item, .sub-subcategory-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelectorAll('.subcategory').forEach(sub => {
                sub.classList.remove('active');
            });

            // Hide all sub-subcategory sections first
            document.querySelectorAll('.sub-subcategory-section').forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });

            const subSubcategory = this.getAttribute('data-sub-subcategory');
            const parentSubcategoryButton = this.closest('.subcategory-item')?.querySelector('.subcategory-button');
            const parentCategoryButton = document.querySelector('.category-button[data-category="kids"]');

            // Activate parent category and subcategory
            if (parentCategoryButton) {
                parentCategoryButton.classList.add('active');
                parentCategoryButton.closest('.category-item')?.classList.add('active');
                document.getElementById('kids-section')?.classList.add('active');
                document.getElementById('kids-section').style.display = 'block';
            }

            if (parentSubcategoryButton) {
                parentSubcategoryButton.classList.add('active');
                parentSubcategoryButton.closest('.subcategory-item')?.classList.add('active');
                
                // Show the parent subcategory section
                const parentSubcategory = parentSubcategoryButton.getAttribute('data-subcategory');
                const parentSubcategorySection = document.getElementById(`${parentSubcategory}-products`);
                if (parentSubcategorySection) {
                    parentSubcategorySection.classList.add('active');
                    parentSubcategorySection.style.display = 'block';
                }
            }

            this.classList.add('active');
            this.closest('.sub-subcategory-item')?.classList.add('active');

            // Show only the specific sub-subcategory section
            const activeSubSubcategorySection = document.getElementById(`${subSubcategory}-section`);
            if (activeSubSubcategorySection) {
                activeSubSubcategorySection.classList.add('active');
                activeSubSubcategorySection.style.display = 'block';
            }

            // Extract subcategory from parent button's data-subcategory attribute
            const subcategory = parentSubcategoryButton ? parentSubcategoryButton.getAttribute('data-subcategory') : null;

            // Fetch and render products only for the clicked sub-subcategory
            // Use the full sub-subcategory identifier (e.g., girls-fashion, boys-toys)
            await fetchAndRenderProductsForGrid(`#${subSubcategory}-grid`, 'kids', subcategory, subSubcategory);
        });
    });
}

// Ensure initializeShopPage is called when the DOM is fully loaded or on navigation updates
window.addEventListener('DOMContentLoaded', initializeShopPage);

// Initial setup for translations (if i18n.js is loaded)
if (window.initializeTranslations) {
    window.initializeTranslations();
} 