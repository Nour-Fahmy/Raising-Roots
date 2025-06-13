document.addEventListener('DOMContentLoaded', function() {
    const categoryButtons = document.querySelectorAll('.category-button');
    const subcategoryButtons = document.querySelectorAll('.subcategory-button');
    const subSubcategoryButtons = document.querySelectorAll('.sub-subcategory-button');
    const subcategories = document.querySelectorAll('.subcategory');

    // Function to hide all content sections and deactivate all sidebar items
    function resetAllStates() {
        // Hide all content sections
        document.querySelectorAll('.category-section, .subcategory-section, .sub-subcategory-section').forEach(section => {
            section.classList.remove('active');
        });

        // Deactivate all sidebar buttons
        document.querySelectorAll('.category-button, .subcategory-button, .sub-subcategory-button').forEach(btn => {
            btn.classList.remove('active');
        });

        // Deactivate all sidebar list items (li) explicitly
        document.querySelectorAll('.category-item, .subcategory-item, .sub-subcategory-item').forEach(item => {
            item.classList.remove('active');
        });

        // Deactivate all subcategories
        document.querySelectorAll('.subcategory').forEach(sub => {
            sub.classList.remove('active');
        });
    }

    // Function to load products for a specific category
    async function loadProducts(category, subcategory = null, subSubcategory = null) {
        try {
            let url = '/api/v1/products';
            const params = new URLSearchParams();
            
            if (category) params.append('category', category);
            if (subcategory) params.append('subcategory', subcategory);
            if (subSubcategory) params.append('subSubcategory', subSubcategory);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const products = await response.json();
            return products;
        } catch (error) {
            console.error('Error loading products:', error);
            return [];
        }
    }

    // Function to create a product card
    function createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.productId = product._id;

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">EGP ${product.price}</p>
                <p class="stock-info">In Stock: ${product.stock}</p>
                <button class="add-to-cart" ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        `;

        // Add click event listener for add to cart button
        const addToCartBtn = card.querySelector('.add-to-cart');
        if (addToCartBtn && product.stock > 0) {
            addToCartBtn.addEventListener('click', () => {
                addToCart(
                    product._id,
                    product.name,
                    product.price,
                    product.image
                );
            });
        }

        return card;
    }

    // Function to display products in a grid
    function displayProducts(products, gridId) {
        const grid = document.getElementById(gridId);
        if (!grid) return;

        grid.innerHTML = '';
        if (products.length === 0) {
            grid.innerHTML = '<p class="no-products">No products found in this category.</p>';
            return;
        }

        products.forEach(product => {
            const card = createProductCard(product);
            grid.appendChild(card);
        });
    }

    // Function to handle category changes
    async function handleCategoryChange(category, subcategory = null, subSubcategory = null) {
        const products = await loadProducts(category, subcategory, subSubcategory);
        
        // Determine which grid to update based on the category
        let gridId;
        if (category === 'adult') {
            gridId = 'adult-products-grid';
        } else if (category === 'kids') {
            if (subcategory === 'boys') {
                if (subSubcategory === 'fashion') {
                    gridId = 'boys-fashion-grid';
                } else if (subSubcategory === 'toys') {
                    gridId = 'boys-toys-grid';
                }
            } else if (subcategory === 'girls') {
                if (subSubcategory === 'fashion') {
                    gridId = 'girls-fashion-grid';
                } else if (subSubcategory === 'toys') {
                    gridId = 'girls-toys-grid';
                }
            } else if (subcategory === 'feeding') {
                gridId = 'feeding-grid';
            } else if (subcategory === 'health') {
                gridId = 'health-grid';
            }
        }

        if (gridId) {
            displayProducts(products, gridId);
        }
    }

    // Handle category button clicks
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            const parentItem = this.closest('.category-item');

            // If clicked button is already active, deactivate it and show adult products
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                parentItem?.classList.remove('active');
                document.getElementById(`${category}-section`)?.classList.remove('active');
                
                // Show adult products when closing kids products
                const adultButton = document.querySelector('[data-category="adult"]');
                const adultSection = document.getElementById('adult-products');
                if (adultButton && adultSection) {
                    adultButton.classList.add('active');
                    adultButton.closest('.category-item')?.classList.add('active');
                    adultSection.classList.add('active');
                }
                return;
            }

            // Reset all other states first
            resetAllStates();

            // Activate the clicked category button and its parent li
            this.classList.add('active');
            parentItem?.classList.add('active');

            // Show corresponding content section
            document.getElementById(`${category}-section`)?.classList.add('active');

            // If it's the kids category, show all subcategory sections
            if (category === 'kids') {
                // Show all subcategory sections
                const subcategorySections = [
                    'boys-fashion-section',
                    'boys-toys-section',
                    'girls-fashion-section',
                    'girls-toys-section',
                    'feeding-section',
                    'health-section'
                ];

                subcategorySections.forEach(sectionId => {
                    const section = document.getElementById(sectionId);
                    if (section) {
                        section.classList.add('active');
                    }
                });
            }
        });
    });

    // Handle subcategory button clicks
    subcategoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling to parent category

            const subcategory = this.getAttribute('data-subcategory');
            const parentItem = this.closest('.subcategory-item');

            // Only allow toggle behavior for boys and girls products
            if (this.classList.contains('active') && (subcategory === 'boys' || subcategory === 'girls')) {
                this.classList.remove('active');
                parentItem?.classList.remove('active');
                document.getElementById(`${subcategory}-section`)?.classList.remove('active');
                return;
            }

            // Reset all other states first
            resetAllStates();

            // Activate parent category button ('kids') and its section/list
            const kidsCategoryButton = document.querySelector('.category-button[data-category="kids"]');
            if (kidsCategoryButton) {
                kidsCategoryButton.classList.add('active');
                kidsCategoryButton.closest('.category-item')?.classList.add('active');
                document.getElementById('kids-section')?.classList.add('active');
            }

            // Activate the clicked subcategory button and its parent li
            this.classList.add('active');
            parentItem?.classList.add('active');

            // Show corresponding subcategory content section
            document.getElementById(`${subcategory}-section`)?.classList.add('active');

            // If it's boys products, show both fashion and toys sections
            if (subcategory === 'boys') {
                const boysFashionSection = document.getElementById('boys-fashion-section');
                const boysToysSection = document.getElementById('boys-toys-section');
                if (boysFashionSection && boysToysSection) {
                    boysFashionSection.classList.add('active');
                    boysToysSection.classList.add('active');
                }
            }
            // If it's girls products, show both fashion and toys sections
            else if (subcategory === 'girls') {
                const girlsFashionSection = document.getElementById('girls-fashion-section');
                const girlsToysSection = document.getElementById('girls-toys-section');
                if (girlsFashionSection && girlsToysSection) {
                    girlsFashionSection.classList.add('active');
                    girlsToysSection.classList.add('active');
                }
            }
        });
    });

    // Handle sub-subcategory button clicks
    subSubcategoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling to parent subcategory

            const subSubcategory = this.getAttribute('data-sub-subcategory');
            const parentItem = this.closest('.sub-subcategory-item');

            // Reset all other states first
            resetAllStates();

            // Activate parent category ('kids') and its section/list
            const kidsCategoryButton = document.querySelector('.category-button[data-category="kids"]');
            if (kidsCategoryButton) {
                kidsCategoryButton.classList.add('active');
                kidsCategoryButton.closest('.category-item')?.classList.add('active');
                document.getElementById('kids-section')?.classList.add('active');
            }

            // Activate immediate parent subcategory button and its section/list
            const parentSubcategoryButton = this.closest('.sub-subcategory-list')?.previousElementSibling;
            if (parentSubcategoryButton) {
                parentSubcategoryButton.classList.add('active');
                parentSubcategoryButton.closest('.subcategory-item')?.classList.add('active');
                document.getElementById(`${parentSubcategoryButton.getAttribute('data-subcategory')}-section`)?.classList.add('active');
            }

            // Activate the clicked sub-subcategory button and its parent li
            this.classList.add('active');
            parentItem?.classList.add('active');

            // Show corresponding sub-subcategory content section
            document.getElementById(`${subSubcategory}-section`)?.classList.add('active');
        });
    });

    // Initialize the shop by clicking the first category button (Adult Products)
    const firstCategoryButton = document.querySelector('.category-button');
    if (firstCategoryButton) {
        firstCategoryButton.click();
    }

    // Add click event listener to adult products button
    const adultButton = document.querySelector('[data-category="adult"]');
    const adultSection = document.getElementById('adult-products');
    const adultProductsGrid = adultSection.querySelector('.products-grid');

    adultButton.addEventListener('click', function() {
        // Toggle active class on button
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Show adult section and hide others
        document.querySelectorAll('.category-section').forEach(section => {
            section.classList.remove('active');
        });
        adultSection.classList.add('active');

        // Toggle products grid visibility
        adultProductsGrid.style.display = adultProductsGrid.style.display === 'none' ? 'grid' : 'grid';
    });

    // Initialize cart count from localStorage if it exists
    const cartCount = document.querySelector('.cart-count');
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        const cart = JSON.parse(savedCart);
        cartCount.textContent = cart.length;
    }

    // Cart functionality
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Function to update cart in localStorage
    function updateCartStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Function to add item to cart
    function addToCart(productId, name, price, image) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
        
        updateCartStorage();
        updateCartUI();
        showNotification('Item added to cart!');
    }

    // Function to remove item from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartStorage();
        updateCartUI();
        showNotification('Item removed from cart!');
    }

    // Function to update item quantity
    function updateQuantity(productId, newQuantity) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = Math.max(0, newQuantity);
            if (item.quantity === 0) {
                removeFromCart(productId);
            } else {
                updateCartStorage();
                updateCartUI();
            }
        }
    }

    // Function to update cart UI
    function updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }

    // Function to show notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Toggle cart visibility
    const cartIcon = document.querySelector('.cart-icon');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.querySelector('.cart-items');
    const totalPrice = document.querySelector('.total-price');

    cartIcon.addEventListener('click', () => {
        cartContainer.classList.add('active');
        // Reset payment method to cash and hide credit card fields
        document.querySelector('input[name="payment"][value="cash"]').checked = true;
        document.querySelector('.credit-card-fields').style.display = 'none';
    });

    closeCart.addEventListener('click', () => {
        cartContainer.classList.remove('active');
    });

    // Checkout functionality
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutModal = document.querySelector('.checkout-modal');
    const closeCheckout = document.querySelector('.close-checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const orderSuccessMessage = document.getElementById('orderSuccessMessage');

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login page if not logged in
            window.location.href = 'login.html';
            return;
        }
        
        checkoutModal.classList.add('active');
    });

    closeCheckout.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
    });

    // Close modal when clicking outside
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
    });

    // Handle payment method selection
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const creditCardFields = document.querySelector('.credit-card-fields');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const apartmentInput = document.getElementById('apartment');
    const apartmentError = document.getElementById('apartmentError');

    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                creditCardFields.style.display = 'block';
                // Make credit card fields required
                document.getElementById('cardNumber').required = true;
                document.getElementById('cardName').required = true;
                document.getElementById('expiryDate').required = true;
                document.getElementById('cvv').required = true;
            } else {
                creditCardFields.style.display = 'none';
                // Remove required attribute
                document.getElementById('cardNumber').required = false;
                document.getElementById('cardName').required = false;
                document.getElementById('expiryDate').required = false;
                document.getElementById('cvv').required = false;
            }
        });
    });

    // Format card number with spaces
    const cardNumber = document.getElementById('cardNumber');
    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
    });

    // Format expiry date
    const expiryDate = document.getElementById('expiryDate');
    expiryDate.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    });

    // Only allow numbers in CVV
    const cvv = document.getElementById('cvv');
    cvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Handle form submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

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

        // Basic phone number validation
        const phone = phoneInput.value;
        if (phone.length !== 11) {
            phoneError.textContent = 'Please enter a valid 11-digit phone number.';
            phoneError.style.display = 'block';
            return;
        }

        // Apartment/Home Number validation (numbers only)
        const apartment = apartmentInput.value;
        if (apartment && !/^[0-9]+$/.test(apartment)) {
            apartmentError.textContent = 'Invalid input. Please enter numbers only.';
            apartmentError.style.display = 'block';
            return;
        }

        // Validate credit card if selected
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        if (selectedPayment === 'card') {
            const cardNumberInput = document.getElementById('cardNumber');
            const cardNameInput = document.getElementById('cardName');
            const expiryDateInput = document.getElementById('expiryDate');
            const cvvInput = document.getElementById('cvv');

            const cardNumber = cardNumberInput.value.replace(/\s/g, '');
            const expiryDate = expiryDateInput.value;
            const cvv = cvvInput.value;

            let hasCreditCardError = false;

            // Basic validation
            if (cardNumber.length !== 16) {
                document.getElementById('cardNumberError').textContent = 'Please enter a valid 16-digit card number.';
                document.getElementById('cardNumberError').style.display = 'block';
                hasCreditCardError = true;
            }
            if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
                document.getElementById('expiryDateError').textContent = 'Please enter a valid expiry date (MM/YY).';
                document.getElementById('expiryDateError').style.display = 'block';
                hasCreditCardError = true;
            }
            if (cvv.length !== 3) {
                document.getElementById('cvvError').textContent = 'Please enter a valid 3-digit CVV.';
                document.getElementById('cvvError').style.display = 'block';
                hasCreditCardError = true;
            }
            
            if (hasCreditCardError) {
                return; // Stop form submission if there are credit card errors
            }
        }

        console.log('Attempting to place order...');

        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            apartment: document.getElementById('apartment').value,
            payment: selectedPayment,
            items: cart,
            total: parseFloat(totalPrice.textContent.replace('EGP ', ''))
        };

        // Add credit card data if selected
        if (selectedPayment === 'card') {
            formData.cardDetails = {
                cardNumber: document.getElementById('cardNumber').value,
                cardName: document.getElementById('cardName').value,
                expiryDate: document.getElementById('expiryDate').value,
                cvv: document.getElementById('cvv').value
            };
        }

        // Here you would typically send this data to your server
        console.log('Order details:', formData);

        // Show success message
        console.log('Displaying success message...');
        orderSuccessMessage.style.display = 'flex';
        
        // Clear cart and close modals
        cart = [];
        updateCartStorage();
        updateCartUI();
        checkoutModal.classList.remove('active');
        cartContainer.classList.remove('active');
        
        // Reset form and hide success message after a few seconds
        checkoutForm.reset();
        setTimeout(() => {
            console.log('Hiding success message...');
            orderSuccessMessage.style.display = 'none';
        }, 3000);
    });

    // Listen for input on credit card fields to clear error messages
    document.getElementById('cardNumber').addEventListener('input', () => {
        document.getElementById('cardNumberError').textContent = '';
        document.getElementById('cardNumberError').style.display = 'none';
    });

    document.getElementById('cardName').addEventListener('input', () => {
        document.getElementById('cardNameError').textContent = '';
        document.getElementById('cardNameError').style.display = 'none';
    });

    document.getElementById('expiryDate').addEventListener('input', () => {
        document.getElementById('expiryDateError').textContent = '';
        document.getElementById('expiryDateError').style.display = 'none';
    });

    document.getElementById('cvv').addEventListener('input', () => {
        document.getElementById('cvvError').textContent = '';
        document.getElementById('cvvError').style.display = 'none';
    });

    // Listen for input on the phone field to clear error messages
    phoneInput.addEventListener('input', () => {
        if (phoneInput.value.length === 11) {
            phoneError.textContent = '';
            phoneError.style.display = 'none';
        }
    });

    // Listen for input on the apartment field to clear error messages
    apartmentInput.addEventListener('input', () => {
        if (/^[0-9]*$/.test(apartmentInput.value)) {
            apartmentError.textContent = '';
            apartmentError.style.display = 'none';
        }
    });

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
});

// Listen for navigation updates
window.addEventListener('navigationUpdated', function() {
    initializeCart();
});

function initializeCart() {
    // Initialize cart count from localStorage if it exists
    const cartCount = document.querySelector('.cart-count');
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        const cart = JSON.parse(savedCart);
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Initialize stock from localStorage or set initial values
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const stockInfoElement = card.querySelector('.stock-info');
        const productId = card.getAttribute('data-product-id');
        const savedStock = localStorage.getItem(`stock_${productId}`);
        
        if (savedStock !== null) {
            stockInfoElement.textContent = `In Stock: ${savedStock}`;
            const addToCartButton = card.querySelector('.add-to-cart');
            if (parseInt(savedStock) === 0) {
                addToCartButton.textContent = 'Out of Stock';
                addToCartButton.disabled = true;
                addToCartButton.style.backgroundColor = '#ccc';
                addToCartButton.style.cursor = 'not-allowed';
            }
        } else {
            // If no saved stock, save the initial stock value
            const initialStock = parseInt(stockInfoElement.textContent.replace('In Stock: ', ''));
            localStorage.setItem(`stock_${productId}`, initialStock.toString());
        }
    });

    // Cart functionality
    const cartContainer = document.querySelector('.cart-container');
    const cartIcon = document.querySelector('.cart-icon');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.querySelector('.cart-items');
    const totalPrice = document.querySelector('.total-price');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    // Initialize cart from localStorage or empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Function to save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        cartCount.textContent = cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Function to update stock in localStorage
    function updateStock(productId, newStock) {
        localStorage.setItem(`stock_${productId}`, newStock.toString());
    }

    // Toggle cart visibility
    cartIcon.addEventListener('click', () => {
        cartContainer.classList.add('active');
        // Reset payment method to cash and hide credit card fields
        document.querySelector('input[name="payment"][value="cash"]').checked = true;
        document.querySelector('.credit-card-fields').style.display = 'none';
    });

    closeCart.addEventListener('click', () => {
        cartContainer.classList.remove('active');
    });

    // Add to cart functionality
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productCard = button.closest('.product-card');
            const stockInfoElement = productCard.querySelector('.stock-info');
            const productId = productCard.getAttribute('data-product-id');
            let currentStock = parseInt(stockInfoElement.textContent.replace('In Stock: ', ''));

            if (currentStock <= 0) {
                alert('This item is out of stock!');
                return;
            }

            // Decrease stock and update display
            currentStock--;
            stockInfoElement.textContent = `In Stock: ${currentStock}`;
            updateStock(productId, currentStock);

            if (currentStock === 0) {
                button.textContent = 'Out of Stock';
                button.disabled = true;
                button.style.backgroundColor = '#ccc';
                button.style.cursor = 'not-allowed';
            }

            const product = {
                id: productId,
                title: productCard.querySelector('.product-title').textContent,
                price: parseFloat(productCard.querySelector('.product-price').textContent.replace('EGP ', '')),
                image: productCard.querySelector('.product-image').src,
                quantity: 1
            };

            // Check if product already exists in cart
            const existingItem = cart.find(item => item.id === product.id);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push(product);
            }

            // Save cart to localStorage
            saveCart();
            
            // Update cart display
            updateCart();
            cartContainer.classList.add('active');
        });
    });

    // Function to update cart display
    function updateCart() {
        cartItems.innerHTML = '';
        let total = 0;
        let count = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            count += item.quantity;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                <div class="cart-item-details">
                    <h3 class="cart-item-title">${item.title}</h3>
                    <p class="cart-item-price">EGP ${item.price.toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn increase">+</button>
                        <button class="remove-item">Remove</button>
                    </div>
                </div>
            `;

            // Add event listeners for quantity buttons
            const decreaseBtn = cartItem.querySelector('.decrease');
            const increaseBtn = cartItem.querySelector('.increase');
            const removeBtn = cartItem.querySelector('.remove-item');

            decreaseBtn.addEventListener('click', () => {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                    // Increase stock on product card
                    const productCard = document.querySelector(`[data-product-id="${item.id}"]`);
                    if (productCard) {
                        const stockInfoElement = productCard.querySelector('.stock-info');
                        let currentStock = parseInt(stockInfoElement.textContent.replace('In Stock: ', ''));
                        currentStock++;
                        stockInfoElement.textContent = `In Stock: ${currentStock}`;

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
                }
            });

            increaseBtn.addEventListener('click', () => {
                // Check if there is enough stock before increasing quantity in cart
                const productCard = document.querySelector(`[data-product-id="${item.id}"]`);
                const stockInfoElement = productCard.querySelector('.stock-info');
                let currentStock = parseInt(stockInfoElement.textContent.replace('In Stock: ', ''));

                if (currentStock > 0) {
                    item.quantity += 1;
                    // Decrease stock on product card
                    currentStock--;
                    stockInfoElement.textContent = `In Stock: ${currentStock}`;

                    if (currentStock === 0) {
                        const addToCartButton = productCard.querySelector('.add-to-cart');
                        if (addToCartButton) {
                            addToCartButton.textContent = 'Out of Stock';
                            addToCartButton.disabled = true;
                            addToCartButton.style.backgroundColor = '#ccc';
                            addToCartButton.style.cursor = 'not-allowed';
                        }
                    }
                    saveCart();
                    updateCart();
                } else {
                    alert('Not enough stock available!');
                }
            });

            removeBtn.addEventListener('click', () => {
                // Increase stock on product card by the quantity removed
                const productCard = document.querySelector(`[data-product-id="${item.id}"]`);
                if (productCard) {
                    const stockInfoElement = productCard.querySelector('.stock-info');
                    let currentStock = parseInt(stockInfoElement.textContent.replace('In Stock: ', ''));
                    currentStock += item.quantity;
                    stockInfoElement.textContent = `In Stock: ${currentStock}`;

                    const addToCartButton = productCard.querySelector('.add-to-cart');
                    if (addToCartButton) {
                        addToCartButton.textContent = 'Add to Cart';
                        addToCartButton.disabled = false;
                        addToCartButton.style.backgroundColor = '';
                        addToCartButton.style.cursor = '';
                    }
                }
                cart = cart.filter(cartItem => cartItem.id !== item.id);
                saveCart();
                updateCart();
            });

            cartItems.appendChild(cartItem);
        });

        // Update cart count and total
        cartCount.textContent = count;
        totalPrice.textContent = `EGP ${total.toFixed(2)}`;

        // Calculate and display estimated delivery date
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 3); // Add 3 days
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.querySelector('.delivery-date').textContent = deliveryDate.toLocaleDateString('en-US', options);
    }

    // Initial cart update
    updateCart();

    // Checkout functionality
    const checkoutBtn = document.querySelector('.checkout-btn');
    const checkoutModal = document.querySelector('.checkout-modal');
    const closeCheckout = document.querySelector('.close-checkout');
    const checkoutForm = document.getElementById('checkout-form');
    const orderSuccessMessage = document.getElementById('orderSuccessMessage');

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login page if not logged in
            window.location.href = 'login.html';
            return;
        }
        
        checkoutModal.classList.add('active');
    });

    closeCheckout.addEventListener('click', () => {
        checkoutModal.classList.remove('active');
    });

    // Close modal when clicking outside
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            checkoutModal.classList.remove('active');
        }
    });

    // Handle payment method selection
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const creditCardFields = document.querySelector('.credit-card-fields');
    const phoneInput = document.getElementById('phone');
    const phoneError = document.getElementById('phoneError');
    const apartmentInput = document.getElementById('apartment');
    const apartmentError = document.getElementById('apartmentError');

    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            if (e.target.value === 'card') {
                creditCardFields.style.display = 'block';
                // Make credit card fields required
                document.getElementById('cardNumber').required = true;
                document.getElementById('cardName').required = true;
                document.getElementById('expiryDate').required = true;
                document.getElementById('cvv').required = true;
            } else {
                creditCardFields.style.display = 'none';
                // Remove required attribute
                document.getElementById('cardNumber').required = false;
                document.getElementById('cardName').required = false;
                document.getElementById('expiryDate').required = false;
                document.getElementById('cvv').required = false;
            }
        });
    });

    // Format card number with spaces
    const cardNumber = document.getElementById('cardNumber');
    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
    });

    // Format expiry date
    const expiryDate = document.getElementById('expiryDate');
    expiryDate.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    });

    // Only allow numbers in CVV
    const cvv = document.getElementById('cvv');
    cvv.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Handle form submission
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

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

        // Basic phone number validation
        const phone = phoneInput.value;
        if (phone.length !== 11) {
            phoneError.textContent = 'Please enter a valid 11-digit phone number.';
            phoneError.style.display = 'block';
            return;
        }

        // Apartment/Home Number validation (numbers only)
        const apartment = apartmentInput.value;
        if (apartment && !/^[0-9]+$/.test(apartment)) {
            apartmentError.textContent = 'Invalid input. Please enter numbers only.';
            apartmentError.style.display = 'block';
            return;
        }

        // Validate credit card if selected
        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        if (selectedPayment === 'card') {
            const cardNumberInput = document.getElementById('cardNumber');
            const cardNameInput = document.getElementById('cardName');
            const expiryDateInput = document.getElementById('expiryDate');
            const cvvInput = document.getElementById('cvv');

            const cardNumber = cardNumberInput.value.replace(/\s/g, '');
            const expiryDate = expiryDateInput.value;
            const cvv = cvvInput.value;

            let hasCreditCardError = false;

            // Basic validation
            if (cardNumber.length !== 16) {
                document.getElementById('cardNumberError').textContent = 'Please enter a valid 16-digit card number.';
                document.getElementById('cardNumberError').style.display = 'block';
                hasCreditCardError = true;
            }
            if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
                document.getElementById('expiryDateError').textContent = 'Please enter a valid expiry date (MM/YY).';
                document.getElementById('expiryDateError').style.display = 'block';
                hasCreditCardError = true;
            }
            if (cvv.length !== 3) {
                document.getElementById('cvvError').textContent = 'Please enter a valid 3-digit CVV.';
                document.getElementById('cvvError').style.display = 'block';
                hasCreditCardError = true;
            }
            
            if (hasCreditCardError) {
                return; // Stop form submission if there are credit card errors
            }
        }

        console.log('Attempting to place order...');

        // Get form data
        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            apartment: document.getElementById('apartment').value,
            payment: selectedPayment,
            items: cart,
            total: parseFloat(totalPrice.textContent.replace('EGP ', ''))
        };

        // Add credit card data if selected
        if (selectedPayment === 'card') {
            formData.cardDetails = {
                cardNumber: document.getElementById('cardNumber').value,
                cardName: document.getElementById('cardName').value,
                expiryDate: document.getElementById('expiryDate').value,
                cvv: document.getElementById('cvv').value
            };
        }

        // Here you would typically send this data to your server
        console.log('Order details:', formData);

        // Show success message
        console.log('Displaying success message...');
        orderSuccessMessage.style.display = 'flex';
        
        // Clear cart and close modals
        cart = [];
        saveCart();
        updateCart();
        checkoutModal.classList.remove('active');
        cartContainer.classList.remove('active');
        
        // Reset form and hide success message after a few seconds
        checkoutForm.reset();
        setTimeout(() => {
            console.log('Hiding success message...');
            orderSuccessMessage.style.display = 'none';
        }, 3000);
    });
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeCart);

// Listen for navigation updates
window.addEventListener('navigationUpdated', initializeCart);
