// app.loader.js — loads application scripts sequentially to reduce number of <script> tags in HTML
(function () {
    const scripts = [
        'script.js',
        'search.js',
        'auth.js',
        'filters.js',
        'contact.js',
        'cart-manager.js'
    ];

    function loadSequential(index) {
        if (index >= scripts.length) return;
        const s = document.createElement('script');
        s.src = scripts[index];
        s.async = false; // preserve execution order
        s.onload = () => loadSequential(index + 1);
        s.onerror = (e) => {
            console.error('Failed to load', scripts[index], e);
            loadSequential(index + 1);
        };
        document.body.appendChild(s);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => loadSequential(0));
    } else {
        loadSequential(0);
    }
})();
