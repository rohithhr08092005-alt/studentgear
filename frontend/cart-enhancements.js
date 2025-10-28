// Enhanced Cart Manager
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    // Initialize cart system
    init() {
        this.initializeCartIcon();
        this.updateCartBadge();
        this.setupEventListeners();
    }

    // Create cart icon and badge in navbar
    initializeCartIcon() {
        const cartIcon = document.createElement('div');
        cartIcon.className = 'cart-icon';
        cartIcon.innerHTML = `
            <i class="fas fa-shopping-cart"></i>
            <span class="cart-badge"></span>
        `;
        document.querySelector('.navbar').appendChild(cartIcon);

        // Show/hide cart preview on hover
        cartIcon.addEventListener('mouseenter', () => this.showCartPreview());
        cartIcon.addEventListener('mouseleave', () => {
            const preview = document.querySelector('.cart-preview');
            if (preview) preview.remove();
        });
    }

    // Add a product to the cart
    addToCart(product) {
        this.cart.push(product);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartBadge();
        this.showNotification(`✅ Added to cart: ${product.name}`);
    }

    // Remove product from cart
    removeFromCart(productName) {
        const index = this.cart.findIndex(item => item.name === productName);
        if (index !== -1) {
            this.cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartBadge();
            this.showNotification(`🗑️ Removed from cart: ${productName}`);
            this.refreshCartPreview();
        }
    }

    // Refresh cart preview if it’s open
    refreshCartPreview() {
        const preview = document.querySelector('.cart-preview');
        if (preview) {
            preview.remove();
            this.showCartPreview();
        }
    }

    // Show cart preview
    showCartPreview() {
        const preview = document.createElement('div');
        preview.className = 'cart-preview';

        if (this.cart.length === 0) {
            preview.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        } else {
            const items = this.cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="item-image">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>₹${item.price.toLocaleString('en-IN')}</p>
                    </div>
                    <button class="remove-item" data-name="${item.name}">&times;</button>
                </div>
            `).join('');

            preview.innerHTML = `
                ${items}
                <div class="cart-total">
                    <span>Total:</span>
                    <span>₹${this.calculateCartTotal().toLocaleString('en-IN')}</span>
                </div>
                <button class="checkout-btn">Checkout</button>
            `;
        }

        document.querySelector('.cart-icon').appendChild(preview);

        // Attach event listeners
        preview.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', e => {
                const name = e.target.dataset.name;
                this.removeFromCart(name);
            });
        });

        const checkoutBtn = preview.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }
    }

    // Calculate total price
    calculateCartTotal() {
        return this.cart.reduce((total, item) => total + item.price, 0);
    }

    // Update cart badge
    updateCartBadge() {
        const cartCount = this.cart.length;
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            if (cartCount > 0) {
                badge.textContent = cartCount;
                badge.classList.add('visible');
            } else {
                badge.classList.remove('visible');
            }
        }
    }

    // Checkout process
    checkout() {
        if (!window.isLoggedIn) {
            this.showNotification('❌ Please log in to checkout');
            if (typeof showLoginModal === 'function') showLoginModal();
            return;
        }

        // TODO: integrate payment or redirect logic here
        this.showNotification('🛒 Proceeding to checkout...');
    }

    // Simple notification
    showNotification(msg) {
        const note = document.createElement('div');
        note.className = 'notification';
        note.textContent = msg;
        document.body.appendChild(note);
        setTimeout(() => note.remove(), 2000);
    }

    // Future event listeners (if needed)
    setupEventListeners() {
        // You can expand this method later
    }
}

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager = new CartManager();
});
