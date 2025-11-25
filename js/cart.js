// Cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart if it doesn't exist
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }

    // Update cart count in the navigation
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    }

    // Add to cart function
    function addToCart(product) {
        // Validate product before adding to cart
        if (!product || typeof product !== 'object') {
            console.error('Invalid product:', product);
            return false;
        }

        // Ensure required fields exist and are valid
        if (!product.name || typeof product.name !== 'string' || !product.name.trim()) {
            console.error('Product name is required');
            return false;
        }

        const price = parseFloat(product.price);
        if (isNaN(price) || price < 0) {
            console.error('Invalid product price:', product.price);
            return false;
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item && item.name === product.name);

        if (existingItem) {
            existingItem.quantity = (parseInt(existingItem.quantity) || 0) + 1;
        } else {
            cart.push({
                name: product.name.trim(),
                price: price,
                image: (product.image && typeof product.image === 'string') ? product.image.trim() : 'img/placeholder.jpg',
                quantity: 1
            });
        }

        // Filter out any invalid items that might have snuck in
        const validCart = cart.filter(item => 
            item && 
            item.name && 
            typeof item.name === 'string' && 
            item.name.trim() && 
            !isNaN(parseFloat(item.price))
        );

        localStorage.setItem('cart', JSON.stringify(validCart));
        updateCartCount();
        showAddToCartFeedback();
        return true;
    }

    // Show feedback when item is added to cart
    function showAddToCartFeedback() {
        const feedback = document.createElement('div');
        feedback.className = 'cart-feedback';
        feedback.textContent = 'Item added to cart!';
        document.body.appendChild(feedback);

        // Trigger reflow
        feedback.offsetHeight;
        
        // Add show class
        feedback.classList.add('show');

        // Remove after animation and redirect to checkout
        setTimeout(() => {
            feedback.classList.remove('show');
            setTimeout(() => {
                feedback.remove();
                // Redirect to checkout page after popup is gone
                window.location.href = 'checkout.html';
            }, 300);
        }, 2000);
    }

    // Handle add to cart button clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart') || e.target.classList.contains('add-to-cart')) {
            const button = e.target.closest('.add-to-cart') || e.target;
            // Get attributes safely with fallbacks
            const name = button.getAttribute('data-name');
            const price = button.getAttribute('data-price');
            const image = button.getAttribute('data-image');
            
            // Only proceed if we have the minimum required data
            if (!name || !price) {
                console.error('Missing required product data');
                return;
            }
            
            const product = {
                name: name,
                price: price,
                image: image || 'img/placeholder.jpg'
            };
            
            // Add to cart and show feedback if successful
            if (!addToCart(product)) {
                console.error('Failed to add product to cart');
                // Show error feedback to user
                const errorFeedback = document.createElement('div');
                errorFeedback.className = 'cart-feedback error';
                errorFeedback.textContent = 'Failed to add item to cart';
                document.body.appendChild(errorFeedback);
                
                setTimeout(() => {
                    errorFeedback.classList.add('show');
                    setTimeout(() => {
                        errorFeedback.classList.remove('show');
                        setTimeout(() => errorFeedback.remove(), 300);
                    }, 2000);
                }, 0);
                return;
            }
            
            // Visual feedback
            button.classList.add('added');
            setTimeout(() => {
                button.classList.remove('added');
            }, 1000);
        }
    });

    // Initialize cart count on page load
    updateCartCount();
});
