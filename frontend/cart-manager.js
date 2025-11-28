// Enhanced Cart Manager
class CartManager {
    constructor() {
        this.API_BASE = window.API_BASE || 'http://localhost:3000';
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.initializeCartIcon();
        this.updateCartBadge();
        this.setupEventListeners();
        // Try to sync/get cart from server if user is logged in
        this.fetchCartFromServer();
    }

    // Helper to read token from localStorage
    getAuthToken() {
        const auth = localStorage.getItem('studentgear_auth');
        if (!auth) return null;
        try { return JSON.parse(auth).token; } catch { return null; }
    }

    async fetchCartFromServer() {
        const token = this.getAuthToken();
        if (!token) return; // no user logged in; keep local cart

        try {
            const res = await fetch(`${this.API_BASE}/cart`, { headers: { 'x-auth-token': token } });
            if (!res.ok) return; // keep local cart on failure
            const data = await res.json();
            if (Array.isArray(data.cart)) {
                this.cart = data.cart;
                localStorage.setItem('cart', JSON.stringify(this.cart));
                this.updateCartBadge();
            }
        } catch (err) {
            console.warn('Could not fetch cart from server:', err);
        }
    }

    initializeCartIcon() {
        const existingIcon = document.querySelector('.cart-icon');
        if (!existingIcon) {
            const cartIcon = document.createElement('div');
            cartIcon.className = 'cart-icon';
            cartIcon.innerHTML = `
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-badge"></span>
            `;
            const navbar = document.querySelector('.navbar') || document.body;
            navbar.appendChild(cartIcon);
        }
    }

    getTotalItems() {
        return this.cart.reduce((total, item) => total + (item.quantity || 1), 0);
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        const count = this.getTotalItems();

        if (count > 0) {
            badge.textContent = count;
            badge.classList.add('visible');
        } else {
            badge.classList.remove('visible');
        }
    }

    calculateSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0);
    }

    showCartPreview() {
        const existingPreview = document.querySelector('.cart-preview');
        if (existingPreview) existingPreview.remove();

        const preview = document.createElement('div');
        preview.className = 'cart-preview';
        preview.innerHTML = this.cart.length === 0 ? this.getEmptyCartHTML() : this.getCartPreviewHTML();
        document.querySelector('.cart-icon').appendChild(preview);

        // Add animation class after a small delay
        setTimeout(() => preview.classList.add('visible'), 10);
    }

    getEmptyCartHTML() {
        return `
            <div class="cart-preview-header">
                <h3><i class="fas fa-shopping-cart"></i> Your Cart</h3>
            </div>
            <div class="empty-cart">
                <div class="empty-cart-icon">
                    <i class="fas fa-shopping-basket"></i>
                </div>
                <p class="empty-cart-text">Your cart is empty</p>
                <a href="#products" class="start-shopping-btn">
                    Start Shopping <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
    }

    getCartPreviewHTML() {
        const subtotal = this.calculateSubtotal();
        const shipping = subtotal >= 10000 ? 0 : 499;
        const total = subtotal + shipping;

        return `
            <div class="cart-preview-header">
                <h3><i class="fas fa-shopping-cart"></i> Your Cart (${this.getTotalItems()})</h3>
            </div>
            <div class="cart-items-container">
                ${this.cart.map(item => this.getCartItemHTML(item)).join('')}
            </div>
            <div class="cart-summary">
                <div class="cart-totals">
                    <div class="summary-row">
                        <span>Subtotal:</span>
                        <span>₹${subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping:</span>
                        <span>${shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                    </div>
                    ${shipping > 0 ? `
                        <div class="free-shipping-note">
                            <i class="fas fa-truck"></i>
                            Add ₹${(10000 - subtotal).toLocaleString('en-IN')} more for free shipping
                        </div>
                    ` : ''}
                    <div class="cart-total">
                        <span>Total:</span>
                        <span>₹${total.toLocaleString('en-IN')}</span>
                    </div>
                </div>
                <button onclick="cartManager.checkout()" class="checkout-btn">
                    <i class="fas fa-lock"></i> Secure Checkout
                </button>
            </div>
        `;
    }

    getCartItemHTML(item) {
        return `
            <div class="cart-item" data-product-name="${item.name}">
                <div class="item-image">
                    ${item.image}
                </div>
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <div class="item-price">₹${(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</div>
                    <div class="quantity-controls">
                        <button 
                            class="quantity-btn" 
                            onclick="cartManager.updateQuantity('${item.name}', -1)"
                            ${(item.quantity || 1) <= 1 ? 'disabled' : ''}
                        >
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity || 1}</span>
                        <button 
                            class="quantity-btn"
                            onclick="cartManager.updateQuantity('${item.name}', 1)"
                        >
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <button 
                    onclick="cartManager.removeFromCart('${item.name}')" 
                    class="remove-item" 
                    aria-label="Remove ${item.name} from cart"
                >
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    updateQuantity(productName, change) {
        const item = this.cart.find(i => i.name === productName);
        if (item) {
            const newQuantity = (item.quantity || 1) + change;
            if (newQuantity < 1) {
                this.removeFromCart(productName);
            } else {
                item.quantity = newQuantity;
                this.updateCart();
                this.showNotification(`Updated quantity of ${item.name}`);
                // try to sync update with server
                this.syncUpdateQuantityToServer(item.name, item.quantity);
            }
        }
    }

    addToCart(product) {
        const existingItem = this.cart.find(item => item.name === product.name);

        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
            this.showNotification(`Increased quantity of ${product.name}`);
        } else {
            product.quantity = 1;
            this.cart.push(product);
            this.showNotification(`Added ${product.name} to cart`);
        }

        const button = document.querySelector(`button[data-product="${product.name}"]`);
        if (button) {
            this.animateButtonSuccess(button);
            // Start a flying image animation from the product card to the cart icon
            this.animateFlyToCart(product.name, button);
        }

        this.updateCart();
        // Pulse the badge to indicate activity
        this.pulseBadge();

        // attempt to persist to server; if offline, we'll keep local copy
        this.syncAddToServer(product).catch(err => {
            console.warn('Add to server failed, keeping local cart', err);
        });
    }

    animateButtonSuccess(button) {
        button.classList.add('success');
        setTimeout(() => button.classList.remove('success'), 1000);
    }

    pulseBadge() {
        const badge = document.querySelector('.cart-badge');
        if (!badge) return;
        badge.classList.add('pulse');
        setTimeout(() => badge.classList.remove('pulse'), 900);
    }

    animateFlyToCart(productName, sourceButton) {
        try {
            // Find product card and image element
            const btn = sourceButton || document.querySelector(`button[data-product="${productName}"]`);
            if (!btn) return;
            const card = btn.closest('.product-card');
            if (!card) return;

            // Prefer an <img> inside the card if present
            const img = card.querySelector('img') || card.querySelector('.product-image');
            const rect = img ? img.getBoundingClientRect() : card.getBoundingClientRect();

            // Create a clone element to animate
            const clone = (img && img.cloneNode(true)) || document.createElement('div');
            clone.classList.add('fly-to-cart');
            if (!img) {
                clone.textContent = productName;
                clone.style.padding = '8px 12px';
                clone.style.background = '#fff';
                clone.style.border = '1px solid #eee';
            }

            // Set initial position
            clone.style.left = `${rect.left}px`;
            clone.style.top = `${rect.top}px`;
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;
            clone.style.position = 'fixed';
            clone.style.opacity = '1';
            document.body.appendChild(clone);

            // Target is cart icon center
            const cartIcon = document.querySelector('.cart-icon');
            const targetRect = cartIcon ? cartIcon.getBoundingClientRect() : { left: window.innerWidth - 40, top: 20, width: 32, height: 32 };
            const targetX = targetRect.left + targetRect.width / 2;
            const targetY = targetRect.top + targetRect.height / 2;

            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;

            // Compute translate values
            const translateX = targetX - startX;
            const translateY = targetY - startY;
            const scale = 0.28;

            // Trigger transform in next frame
            requestAnimationFrame(() => {
                clone.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
                clone.style.transition = 'transform 720ms cubic-bezier(.2,.9,.25,1), opacity 520ms ease-out';
                clone.style.opacity = '0.02';
            });

            // Clean up after animation
            setTimeout(() => {
                try { clone.remove(); } catch (e) { }
                // tiny badge pulse for emphasis
                this.pulseBadge();
            }, 800);
        } catch (e) {
            // ignore animation errors
            console.warn('fly to cart animation failed', e);
        }
    }

    removeFromCart(productName) {
        const itemElement = document.querySelector(`.cart-item[data-product-name="${productName}"]`);
        if (itemElement) {
            itemElement.classList.add('removing');
            setTimeout(() => {
                this.cart = this.cart.filter(item => item.name !== productName);
                this.updateCart();
                this.showNotification(`Removed ${productName} from cart`);
                // try to sync removal
                this.syncRemoveFromServer(productName).catch(err => console.warn('Remove sync failed', err));
            }, 300);
        }
    }

    // Server sync helpers
    async syncAddToServer(item) {
        const token = this.getAuthToken();
        if (!token) return; // nothing to do for anonymous
        const res = await fetch(`${this.API_BASE}/cart`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'x-auth-token': token }, body: JSON.stringify({ item })
        });
        if (!res.ok) throw new Error('Failed to add item on server');
        const data = await res.json();
        if (Array.isArray(data.cart)) {
            this.cart = data.cart; localStorage.setItem('cart', JSON.stringify(this.cart)); this.updateCartBadge();
        }
    }

    async syncUpdateQuantityToServer(name, quantity) {
        const token = this.getAuthToken();
        if (!token) return;
        try {
            const res = await fetch(`${this.API_BASE}/cart`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ name, quantity })
            });
            if (!res.ok) throw new Error('Failed to update quantity on server');
            const data = await res.json();
            if (Array.isArray(data.cart)) { this.cart = data.cart; localStorage.setItem('cart', JSON.stringify(this.cart)); this.updateCartBadge(); }
        } catch (err) {
            console.warn('syncUpdateQuantityToServer failed', err);
        }
    }

    async syncRemoveFromServer(name) {
        const token = this.getAuthToken();
        if (!token) return;
        const res = await fetch(`${this.API_BASE}/cart/${encodeURIComponent(name)}`, { method: 'DELETE', headers: { 'x-auth-token': token } });
        if (!res.ok) throw new Error('Failed to remove on server');
        const data = await res.json();
        if (Array.isArray(data.cart)) { this.cart = data.cart; localStorage.setItem('cart', JSON.stringify(this.cart)); this.updateCartBadge(); }
    }

    updateCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartBadge();

        const preview = document.querySelector('.cart-preview');
        if (preview) {
            this.showCartPreview();
        }
    }

    checkout() {
        if (!isLoggedIn) {
            this.showNotification('Please log in to checkout', 'warning');
            showLoginModal();
            return;
        }

        // Simulated checkout process
        this.showNotification('Processing your order...', 'info');
        // Add actual checkout logic here
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            ${message}
        `;
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => notification.classList.add('visible'), 10);

        // Animate out and remove
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-circle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || icons.success;
    }

    setupEventListeners() {
        const cartIcon = document.querySelector('.cart-icon');

        // Toggle cart preview on click
        cartIcon.addEventListener('click', (e) => {
            const preview = document.querySelector('.cart-preview');
            if (preview) {
                preview.remove();
            } else {
                this.showCartPreview();
            }
            e.stopPropagation();
        });

        // Close cart preview when clicking outside
        document.addEventListener('click', (e) => {
            const preview = document.querySelector('.cart-preview');
            const cartIcon = document.querySelector('.cart-icon');
            if (preview && !preview.contains(e.target) && !cartIcon.contains(e.target)) {
                preview.classList.remove('visible');
                setTimeout(() => preview.remove(), 300);
            }
        });

        // Setup keyboard navigation
        cartIcon.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.showCartPreview();
            }
        });
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Setup product buttons to use cart manager. Use a readiness guard so this
// initializes correctly whether the script is injected before or after
// DOMContentLoaded (app.loader.js injects scripts dynamically).
function setupProductButtons() {
    document.querySelectorAll('.btn-cart').forEach(btn => {
        const card = btn.closest('.product-card');
        if (!card) return;
        const nameEl = card.querySelector('.product-name');
        if (!nameEl) return;
        const productName = nameEl.textContent.trim();

        btn.setAttribute('data-product', productName);
        btn.innerHTML = `
            <i class="fas fa-cart-plus"></i>
            <span>Add to Cart</span>
        `;

        btn.addEventListener('click', () => {
            const priceText = card.querySelector('.product-price')?.textContent || '0';
            const imgText = card.querySelector('.product-image')?.textContent.trim() || '';
            const categoryText = card.querySelector('.product-category')?.textContent || '';
            const product = {
                name: productName,
                price: parseFloat(priceText.replace('₹', '').replace(',', '')) || 0,
                image: imgText,
                category: categoryText
            };
            cartManager.addToCart(product);
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupProductButtons);
} else {
    setupProductButtons();
}