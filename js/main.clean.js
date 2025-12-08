/**
 * Main JavaScript File
 * Handles mobile menu, audio player, cart functionality, and other UI interactions
 */

// Global variables
const cart = JSON.parse(localStorage.getItem('cart')) || [];

/**
 * Utility Functions
 */
const Utils = {
    // Format price as currency
    formatPrice: (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    },

    // Save cart to localStorage
    saveCart: () => {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    },

    // Open WhatsApp with message
    sendToWhatsApp: (phoneNumber, message) => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    },

    // Update cart count in UI
    updateCartCount: () => {
        const count = cart.reduce((total, item) => total + (parseInt(item.quantity) || 1), 0);
        const cartCounts = document.querySelectorAll('.cart-count');
        cartCounts.forEach(el => {
            el.textContent = count;
            el.style.display = count > 0 ? 'flex' : 'none';
        });
    }
};

/**
 * Mobile Menu Class
 */
class MobileMenu {
    constructor() {
        this.hamburger = document.querySelector('.hamburger');
        this.navLinks = document.getElementById('navbarContent');
        this.overlay = document.createElement('div');
        this.isOpen = false;
        
        if (this.hamburger && this.navLinks) {
            this.init();
        }
    }
    
    init() {
        // Set initial ARIA attributes
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.hamburger.setAttribute('aria-controls', 'navbarContent');
        this.navLinks.setAttribute('aria-expanded', 'false');
        
        // Create and append overlay
        this.overlay.classList.add('nav-overlay');
        document.body.appendChild(this.overlay);
        
        // Add event listeners
        this.hamburger.addEventListener('click', (e) => this.toggleMenu(e));
        this.overlay.addEventListener('click', () => this.closeMenu());
        
        // Close when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => this.closeMenu());
        });
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });
    }
    
    toggleMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        this.isOpen ? this.closeMenu() : this.openMenu();
    }
    
    openMenu() {
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.navLinks.setAttribute('aria-expanded', 'true');
        this.overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        this.navLinks.classList.add('active');
        this.hamburger.classList.add('active');
    }
    
    closeMenu() {
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.navLinks.setAttribute('aria-expanded', 'false');
        this.overlay.classList.remove('visible');
        document.body.style.overflow = '';
        this.isOpen = false;
        this.navLinks.classList.remove('active');
        this.hamburger.classList.remove('active');
    }
}

/**
 * Cart Functionality
 */
const Cart = {
    // Add item to cart
    addToCart: (e) => {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (!addToCartBtn) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const product = addToCartBtn.closest('.product');
        const productId = product.getAttribute('data-id');
        const productName = product.getAttribute('data-name') || 'Product';
        const productPrice = parseFloat(product.getAttribute('data-price')) || 0;
        const productImage = product.querySelector('img')?.src || '';
        
        // Check if item already in cart
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }
        
        // Update UI
        Utils.saveCart();
        showNotification(`${productName} added to cart`);
    },
    
    // Remove item from cart
    removeFromCart: (index) => {
        if (index >= 0 && index < cart.length) {
            const item = cart[index];
            cart.splice(index, 1);
            Utils.saveCart();
            showNotification(`${item.name} removed from cart`);
            return true;
        }
        return false;
    },
    
    // Update cart display
    updateCartDisplay: () => {
        const cartItemsContainer = document.getElementById('cart-items');
        const emptyCartMessage = document.getElementById('empty-cart-message');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItemsContainer) return;
        
        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            if (cartTotal) cartTotal.style.display = 'none';
            cartItemsContainer.innerHTML = '';
            return;
        }
        
        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (cartTotal) cartTotal.style.display = 'block';
        
        // Render cart items
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${Utils.formatPrice(item.price)} x ${item.quantity || 1}</p>
                    <button class="remove-from-cart" data-index="${index}">Remove</button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-from-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                Cart.removeFromCart(index);
                Cart.updateCartDisplay();
            });
        });
        
        // Update total
        if (cartTotal) {
            const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
            cartTotal.querySelector('span').textContent = Utils.formatPrice(total);
        }
    }
};

/**
 * Notification System
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger reflow
    notification.offsetHeight;
    
    // Add show class
    notification.classList.add('show');
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Initialize the application
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu
    if (document.querySelector('.hamburger') && document.getElementById('navbarContent')) {
        new MobileMenu();
    }
    
    // Initialize cart functionality
    document.addEventListener('click', Cart.addToCart);
    
    // Update cart display if on cart page
    if (document.getElementById('cart-items')) {
        Cart.updateCartDisplay();
    }
    
    // Initialize smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (window.location.pathname === anchor.pathname || anchor.pathname === '/') {
            anchor.addEventListener('click', (e) => {
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without page jump
                    if (history.pushState) {
                        history.pushState(null, null, targetId);
                    } else {
                        window.location.hash = targetId;
                    }
                }
            });
        }
    });
    
    // Add animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.classList.add('animated');
            }
        });
    };
    
    // Initial animation check
    animateOnScroll();
    
    // Listen for scroll events
    window.addEventListener('scroll', () => {
        animateOnScroll();
    });
});

// Add animation classes to elements
document.querySelectorAll('.album, .video-item, .event-card, .product').forEach(el => {
    el.classList.add('animate-on-scroll');
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});
