// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

// Add to cart functionality
function addToCart(product) {
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
    showNotification('✅ Added to cart: ' + product.name);
}

// Add to wishlist functionality
function toggleWishlist(product) {
    const index = wishlist.findIndex(p => p.name === product.name);
    if (index === -1) {
        wishlist.push(product);
        showNotification('❤️ Added to wishlist: ' + product.name);
    } else {
        wishlist.splice(index, 1);
        showNotification('💔 Removed from wishlist: ' + product.name);
    }
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistUI();
}

// Update cart UI
function updateCartUI() {
    const cartBtns = document.querySelectorAll('.btn-cart');
    cartBtns.forEach(btn => {
        const productName = btn.closest('.product-card').querySelector('.product-name').textContent;
        const inCart = cart.some(p => p.name === productName);
        btn.classList.toggle('in-cart', inCart);
        btn.textContent = inCart ? 'In Cart' : 'Add to Cart';
    });
}

// Update wishlist UI
function updateWishlistUI() {
    const wishlistBtns = document.querySelectorAll('.btn-wishlist');
    wishlistBtns.forEach(btn => {
        const productName = btn.closest('.product-card').querySelector('.product-name').textContent;
        const inWishlist = wishlist.some(p => p.name === productName);
        btn.classList.toggle('active', inWishlist);
    });
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add to cart button listeners
    document.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                name: card.querySelector('.product-name').textContent,
                price: parseFloat(card.querySelector('.product-price').textContent.replace('₹', '').replace(',', '')),
                image: card.querySelector('.product-image').textContent.trim(),
                category: card.querySelector('.product-category').textContent
            };
            addToCart(product);
        });
    });

    // Wishlist button listeners
    document.querySelectorAll('.btn-wishlist').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                name: card.querySelector('.product-name').textContent,
                price: parseFloat(card.querySelector('.product-price').textContent.replace('₹', '').replace(',', '')),
                image: card.querySelector('.product-image').textContent.trim(),
                category: card.querySelector('.product-category').textContent
            };
            toggleWishlist(product);
        });
    });

    // Initialize UI states
    updateCartUI();
    updateWishlistUI();
});