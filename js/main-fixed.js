// WhatsApp Integration Functions
function sendToWhatsApp(phoneNumber, message) {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// Shopping Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Format price helper function
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Audio Player Class
class AudioPlayer {
    constructor() {
        this.audio = null;
        this.currentTrack = null;
        this.isPlaying = false;
        this.volume = 0.7; // Default volume
        this.currentTime = 0;
        this.duration = 0;
        this.progressInterval = null;
        this.playlist = [];
        this.currentTrackIndex = -1;
        
        // Initialize UI elements
        this.audioElement = document.getElementById('audio-player');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.progressBar = document.querySelector('.progress');
        this.progressSlider = document.getElementById('progress');
        this.volumeSlider = document.getElementById('volume');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.nowPlayingTitle = document.getElementById('now-playing-title');
        this.nowPlayingArtist = document.getElementById('now-playing-artist');
        this.nowPlayingArt = document.getElementById('now-playing-art');
        this.musicPlayer = document.querySelector('.music-player');
        
        // Initialize event listeners
        this.initEventListeners();
        this.initKeyboardShortcuts();
        
        // Initialize playlist from the page
        this.initPlaylist();
    }
    
    // ... (rest of the AudioPlayer methods remain the same)
}

// Shopping Cart Functions
function updateCartCount() {
    const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'flex' : 'none';
    }
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({...product, quantity: 1});
    }
    saveCart();
    showNotification('Added to cart!');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCheckout();
}

// Mobile Menu Functions
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!navLinks || !hamburger || !menuOverlay) return;
    
    const isActive = navLinks.classList.contains('active');
    
    if (isActive) {
        // Close menu
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
        menuOverlay.classList.remove('active');
        document.body.style.overflow = '';
        
        // Remove the active class after transition ends
        navLinks.addEventListener('transitionend', function handler() {
            navLinks.removeEventListener('transitionend', handler);
            if (!navLinks.classList.contains('active')) {
                menuOverlay.style.display = 'none';
            }
        });
    } else {
        // Open menu
        menuOverlay.style.display = 'block';
        setTimeout(() => {
            menuOverlay.classList.add('active');
            navLinks.classList.add('active');
            hamburger.classList.add('active');
            document.body.style.overflow = 'hidden';
        }, 10);
    }
}

function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    if (!hamburger || !navLinks || !menuOverlay) return;
    
    // Toggle menu on hamburger click
    hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking on overlay
    menuOverlay.addEventListener('click', function() {
        toggleMenu();
    });

    // Close menu when clicking on a nav link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            toggleMenu();
        });
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize cart count
    updateCartCount();
    
    // Add to cart functionality
    document.addEventListener('click', function(e) {
        const addToCartBtn = e.target.closest('.add-to-cart');
        if (!addToCartBtn) return;
        
        e.preventDefault();
        const product = {
            id: addToCartBtn.dataset.id,
            name: addToCartBtn.dataset.name,
            price: parseFloat(addToCartBtn.dataset.price),
            image: addToCartBtn.dataset.image
        };
        addToCart(product);
    });
    
    // Initialize animations
    const animateOnScroll = () => {
        document.querySelectorAll('.fade-in').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
    
    // Initialize audio player if on a page with audio
    if (document.getElementById('audio-player')) {
        const audioPlayer = new AudioPlayer();
    }
});
