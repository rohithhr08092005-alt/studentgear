const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- In-memory demo data ---
const PRODUCTS = [
    { id: 1, name: 'Student Developer Laptop', price: 54999, description: 'Lightweight laptop for coding and projects.' },
    { id: 2, name: 'Mechanical Keyboard', price: 3799, description: 'Tactile mechanical keyboard for fast typing.' },
    { id: 3, name: 'Portable SSD 1TB', price: 6999, description: 'Fast NVMe portable SSD for datasets.' }
];

// Simple in-memory carts keyed by token (demo only)
const carts = {};

// --- Routes ---
app.get('/', (req, res) => {
    res.json({ ok: true, message: 'StudentGear backend is running' });
});

// Products
app.get('/products', (req, res) => {
    res.json({ products: PRODUCTS });
});

// Auth (demo)
// Accepts { email, password } and returns a demo token and user object
app.post('/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
    // Demo: accept any credentials
    const user = { name: email.split('@')[0], email };
    const token = 'demo-token-' + Buffer.from(email).toString('hex');
    // Ensure a cart exists for this token
    if (!carts[token]) carts[token] = [];
    res.json({ token, user });
});

// Get cart for current token (x-auth-token header) or demo
app.get('/cart', (req, res) => {
    const token = req.headers['x-auth-token'] || req.query.token || 'anonymous';
    const cart = carts[token] || [];
    res.json({ cart });
});

// Add item to cart
app.post('/cart', (req, res) => {
    const token = req.headers['x-auth-token'] || req.body.token || 'anonymous';
    const item = req.body.item;
    if (!item || !item.name) return res.status(400).json({ error: 'Missing item' });
    carts[token] = carts[token] || [];
    const existing = carts[token].find(i => i.name === item.name);
    if (existing) existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
    else carts[token].push({ ...item, quantity: item.quantity || 1 });
    res.json({ cart: carts[token] });
});

// Update item quantity
app.put('/cart', (req, res) => {
    const token = req.headers['x-auth-token'] || req.body.token || 'anonymous';
    const { name, quantity } = req.body || {};
    if (!name || typeof quantity !== 'number') return res.status(400).json({ error: 'Missing name or quantity' });
    carts[token] = carts[token] || [];
    const item = carts[token].find(i => i.name === name);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });
    if (quantity <= 0) {
        carts[token] = carts[token].filter(i => i.name !== name);
    } else {
        item.quantity = quantity;
    }
    res.json({ cart: carts[token] });
});

// Remove item
app.delete('/cart/:name', (req, res) => {
    const token = req.headers['x-auth-token'] || req.query.token || 'anonymous';
    const name = req.params.name;
    carts[token] = (carts[token] || []).filter(i => i.name !== name);
    res.json({ cart: carts[token] });
});

// Start server
app.listen(PORT, () => {
    console.log(`StudentGear backend listening on http://localhost:${PORT}`);
});
