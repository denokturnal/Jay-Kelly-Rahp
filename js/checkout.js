// Checkout page functionality
document.addEventListener('DOMContentLoaded', function() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const checkoutItems = document.getElementById('checkout-items');
    const emptyCart = document.querySelector('.empty-cart');
    const cartTable = document.createElement('div');
    cartTable.className = 'cart-table';
    
    // Format price
    function formatPrice(price) {
        return 'GH¢' + parseFloat(price).toFixed(1);
    }

    // Update cart display
    function updateCartDisplay() {
        cartTable.innerHTML = '';
        
        if (cart.length === 0) {
            emptyCart.style.display = 'block';
            cartTable.style.display = 'none';
            return;
        }
        
        emptyCart.style.display = 'none';
        cartTable.style.display = 'block';
        
        // Create cart header
        const header = document.createElement('div');
        header.className = 'cart-header';
        header.innerHTML = `
            <div class="cart-col item-col">Item</div>
            <div class="cart-col price-col">Price</div>
            <div class="cart-col qty-col">Qty</div>
            <div class="cart-col total-col">Total</div>
        `;
        cartTable.appendChild(header);
        
        // Add cart items
        let subtotal = 0;
        
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="cart-col item-col">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <button class="remove-item" data-index="${index}">Remove</button>
                    </div>
                </div>
                <div class="cart-col price-col">${formatPrice(item.price)}</div>
                <div class="cart-col qty-col">
                    <input type="number" min="1" value="${item.quantity}" class="qty-input" data-index="${index}">
                </div>
                <div class="cart-col total-col">${formatPrice(itemTotal)}</div>
            `;
            cartTable.appendChild(itemElement);
        });
        
        // Add cart footer with subtotal
        const footer = document.createElement('div');
        footer.className = 'cart-footer';
        footer.innerHTML = `
            <div class="cart-subtotal">
                <span>Subtotal:</span>
                <span class="subtotal-amount">${formatPrice(subtotal)}</span>
            </div>
            <a href="shop.html" class="btn btn-secondary">Continue Shopping</a>
            <button id="checkout-btn" class="btn btn-primary" style="display: flex; align-items: center; justify-content: center; gap: 10px;">
                <i class="fab fa-whatsapp"></i> Proceed to Checkout
            </button>
        `;
        cartTable.appendChild(footer);
        
        // Insert cart table before the empty cart message
        checkoutItems.insertBefore(cartTable, emptyCart);
        
        // Add event listeners for quantity changes
        document.querySelectorAll('.qty-input').forEach(input => {
            input.addEventListener('change', function() {
                const index = this.getAttribute('data-index');
                const newQty = parseInt(this.value);
                
                if (newQty < 1) {
                    this.value = 1;
                    return;
                }
                
                cart[index].quantity = newQty;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
            });
        });
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartDisplay();
                
                // Update cart count in navigation
                const cartCountElements = document.querySelectorAll('.cart-count');
                cartCountElements.forEach(element => {
                    const currentCount = parseInt(element.textContent) || 0;
                    element.textContent = currentCount - 1;
                });
            });
        });
    }
    
    // Initialize cart display
    updateCartDisplay();
    
    // Add click handler for the checkout button
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'checkout-btn') {
            e.preventDefault();
            
            // Get cart from localStorage
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            
            if (cart.length === 0) {
                showNotification('Your cart is empty.');
                return;
            }
            
            // Format order message
            let message = `*NEW ORDER REQUEST*\n\n`;
            message += `*🛒 Order Summary*\n\n`;
            
            let subtotal = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                message += `✔️ *${item.name}*\n`;
                message += `   Quantity: ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(itemTotal)}\n\n`;
            });
            
            message += `*Total: ${formatPrice(subtotal)}*\n\n`;
            message += `Please provide your shipping details to complete the order.`;
            
            // WhatsApp number (Jay Kelly Rahp's WhatsApp number)
            const whatsappNumber = '233271326182';
            
            // Send to WhatsApp
            const encodedText = encodeURIComponent(message);
            const whatsappWindow = window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
            
            // Show success message
            showNotification('Redirecting to WhatsApp to complete your order...');
            
            // Clear the cart after a short delay to ensure the window opens
            setTimeout(() => {
                // Clear the cart from localStorage
                localStorage.removeItem('cart');
                
                // Update cart count in navigation to zero
                const cartCountElements = document.querySelectorAll('.cart-count');
                cartCountElements.forEach(el => el.textContent = '0');
                
                // Update the cart display to show empty state
                const emptyCart = document.querySelector('.empty-cart');
                if (emptyCart) {
                    emptyCart.style.display = 'block';
                }
                
                // Hide the cart table if it exists
                const cartTable = document.querySelector('.cart-table');
                if (cartTable) {
                    cartTable.style.display = 'none';
                }
                
                // Show success message
                showNotification('Your order has been placed successfully!');
            }, 1000);
        }
    });
    
    // Show notification function
    function showNotification(message) {
        // Check if notification element exists, if not create it
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
            
            // Add some basic styling
            const style = document.createElement('style');
            style.textContent = `
                .notification {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #4CAF50;
                    color: white;
                    padding: 15px 25px;
                    border-radius: 4px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                    z-index: 1000;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                .notification.show {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Set message and show
        notification.textContent = message;
        notification.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
});
