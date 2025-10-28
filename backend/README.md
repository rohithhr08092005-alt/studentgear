# StudentGear Backend (dev)

This is a minimal development backend for the StudentGear frontend. It implements simple endpoints for products, authentication (demo), and cart management using in-memory storage.

Endpoints
- GET /                => status
- GET /products        => list of demo products
- POST /auth/login     => { email, password } -> { token, user }
- GET /cart            => returns cart for token (header `x-auth-token` or query `?token=`)
- POST /cart           => { item } adds item to cart
- PUT /cart            => { name, quantity } updates item quantity
- DELETE /cart/:name   => remove item from cart

Run (Windows cmd):

cd /d d:\project\backend
npm install
node server.js

Notes
- This is a demo server with in-memory storage. Data will not persist across restarts.
- For production use a real database and proper authentication.
