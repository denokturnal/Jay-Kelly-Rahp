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
    
    play(trackUrl, index = -1) {
        // Implementation remains the same
        if (index >= 0) this.currentTrackIndex = index;
        
        // If it's a new track or the audio hasn't been created yet
        if (!this.audio || this.currentTrack !== trackUrl) {
            this.currentTrack = trackUrl;
            
            // Create new audio element if it doesn't exist
            if (!this.audio) {
                this.audio = new Audio();
                this.audio.volume = this.volume;
                
                // Set up event listeners for the new audio element
                this.audio.addEventListener('timeupdate', () => this.updateProgressBar());
                this.audio.addEventListener('loadedmetadata', () => {
                    this.duration = this.audio.duration;
                    this.updateDurationDisplay();
                });
                this.audio.addEventListener('ended', () => this.next());
                this.audio.addEventListener('error', (e) => {
                    console.error('Audio playback error:', e);
                    this.handlePlaybackError(trackUrl);
                });
            }
            
            // Set the new source
            this.audio.src = trackUrl;
            
            // Update now playing info
            this.updateNowPlaying();
        }
        
        // Play the audio
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.updatePlayButtons();
                this.startProgressTracking();
            })
            .catch(error => {
                console.error('Error playing audio:', error);
                this.handlePlaybackError(trackUrl);
            });
    }
    
    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayButtons();
            this.stopProgressTracking();
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play(this.currentTrack);
        }
    }
    
    setVolume(volume) {
        this.volume = volume;
        if (this.audio) {
            this.audio.volume = volume;
        }
    }
    
    seekTo(time) {
        if (this.audio) {
            this.audio.currentTime = time;
        }
    }
    
    seekToPercentage(percent) {
        if (this.audio && this.duration) {
            const time = (percent / 100) * this.duration;
            this.seekTo(time);
        }
    }
    
    startProgressTracking() {
        this.stopProgressTracking();
        this.progressInterval = setInterval(() => this.updateProgressBar(), 1000);
    }
    
    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    updateProgressBar() {
        if (this.audio) {
            this.currentTime = this.audio.currentTime;
            this.updateCurrentTimeDisplay();
            
            if (this.progressSlider) {
                const progress = (this.currentTime / this.duration) * 100 || 0;
                this.progressSlider.value = progress;
                
                if (this.progressBar) {
                    this.progressBar.style.width = `${progress}%`;
                }
            }
        }
    }
    
    updateCurrentTimeDisplay() {
        if (this.currentTimeEl) {
            this.currentTimeEl.textContent = this.formatTime(this.currentTime);
        }
    }
    
    updateDurationDisplay() {
        if (this.durationEl) {
            this.durationEl.textContent = this.formatTime(this.duration);
        }
    }
    
    updateVolumeUI() {
        if (this.volumeSlider) {
            this.volumeSlider.value = this.volume * 100;
        }
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    getCurrentTrack() {
        return this.playlist[this.currentTrackIndex] || null;
    }
    
    showNotification(message) {
        // Implementation for showing notifications
        console.log(message);
    }
    
    updatePlayButtons() {
        // Update play/pause buttons throughout the page
        document.querySelectorAll('.play-btn').forEach(btn => {
            const album = btn.closest('.album');
            if (album) {
                const trackUrl = album.dataset.trackUrl;
                if (trackUrl === this.currentTrack && this.isPlaying) {
                    btn.innerHTML = '<i class="fas fa-pause"></i>';
                    btn.classList.add('playing');
                } else {
                    btn.innerHTML = '<i class="fas fa-play"></i>';
                    btn.classList.remove('playing');
                }
            }
        });
    }
    
    updateNowPlaying(trackInfo = null) {
        if (!trackInfo) {
            trackInfo = this.getCurrentTrack() || {};
        }
        
        if (this.nowPlayingTitle) {
            this.nowPlayingTitle.textContent = trackInfo.title || 'Unknown Track';
        }
        
        if (this.nowPlayingArtist) {
            this.nowPlayingArtist.textContent = trackInfo.artist || 'Unknown Artist';
        }
        
        if (this.nowPlayingArt && trackInfo.artwork) {
            this.nowPlayingArt.src = trackInfo.artwork;
            this.nowPlayingArt.alt = trackInfo.title ? `${trackInfo.title} Artwork` : 'Album Artwork';
        }
    }
    
    // Playlist management
    initPlaylist() {
        // Get all tracks from the page
        const trackElements = document.querySelectorAll('.album[data-track-url]');
        this.playlist = Array.from(trackElements).map((el, index) => ({
            title: el.dataset.trackTitle || `Track ${index + 1}`,
            artist: el.dataset.trackArtist || 'Unknown Artist',
            url: el.dataset.trackUrl,
            artwork: el.dataset.artwork || ''
        }));
    }
    
    // Navigation methods
    next() {
        if (this.playlist.length > 0) {
            this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
            const nextTrack = this.playlist[this.currentTrackIndex];
            if (nextTrack) {
                this.play(nextTrack.url, this.currentTrackIndex);
            }
        }
    }
    
    prev() {
        if (this.playlist.length > 0) {
            this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
            const prevTrack = this.playlist[this.currentTrackIndex];
            if (prevTrack) {
                this.play(prevTrack.url, this.currentTrackIndex);
            }
        }
    }
    
    // Error handling
    handlePlaybackError(trackInfo) {
        console.error('Error playing track:', trackInfo);
        this.showNotification('Error playing track. Please try again.');
        this.pause();
    }
    
    // Event Listeners
    initEventListeners() {
        // Play/Pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        
        // Previous/Next buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
        
        // Progress bar seeking
        if (this.progressSlider) {
            this.progressSlider.addEventListener('input', (e) => {
                this.seekToPercentage(e.target.value);
            });
        }
        
        // Volume control
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value / 100);
            });
        }
    }
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Space: Play/Pause
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                this.togglePlayPause();
            }
            
            // Right Arrow: Seek forward 5 seconds
            if (e.code === 'ArrowRight' && this.audio) {
                this.seekTo(Math.min(this.audio.currentTime + 5, this.duration));
            }
            
            // Left Arrow: Seek backward 5 seconds
            if (e.code === 'ArrowLeft' && this.audio) {
                this.seekTo(Math.max(this.audio.currentTime - 5, 0));
            }
            
            // M: Toggle mute
            if (e.code === 'KeyM') {
                if (this.audio) {
                    this.audio.muted = !this.audio.muted;
                    this.showNotification(this.audio.muted ? 'Muted' : 'Unmuted');
                }
            }
            
            // Up Arrow: Increase volume
            if (e.code === 'ArrowUp' && this.volumeSlider) {
                const newVolume = Math.min(1, this.volume + 0.1);
                this.setVolume(newVolume);
                this.volumeSlider.value = newVolume * 100;
                this.showNotification(`Volume: ${Math.round(newVolume * 100)}%`);
            }
            
            // Down Arrow: Decrease volume
            if (e.code === 'ArrowDown' && this.volumeSlider) {
                const newVolume = Math.max(0, this.volume - 0.1);
                this.setVolume(newVolume);
                this.volumeSlider.value = newVolume * 100;
                this.showNotification(`Volume: ${Math.round(newVolume * 100)}%`);
            }
        });
    }
}

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

// In your main.js file, update the click event listener for add to cart buttons
document.addEventListener('click', function(e) {
    // Check if the clicked element or any of its parents is an add to cart button
    const addToCartBtn = e.target.closest('.add-to-cart');
    if (!addToCartBtn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent multiple clicks
    if (addToCartBtn.classList.contains('processing')) return;
    addToCartBtn.classList.add('processing');
    
    const productCard = addToCartBtn.closest('.product');
    if (!productCard) {
        addToCartBtn.classList.remove('processing');
        return;
    }
    
    // Get product details
    const name = addToCartBtn.dataset.name || productCard.querySelector('h3')?.textContent || 'Product';
    const price = parseFloat(addToCartBtn.dataset.price) || 0;
    const image = addToCartBtn.dataset.image || productCard.querySelector('img')?.src || '';
    
    // Add single item to cart
    addToCart({
        name: name,
        price: price,
        image: image
    });
    
    // Reset processing state after a short delay
    setTimeout(() => {
        addToCartBtn.classList.remove('processing');
    }, 1000);
});

function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    showNotification('Item removed from cart');
    
    // If cart is empty and we're on the checkout page, refresh to show empty cart message
    if (cart.length === 0 && window.location.pathname.includes('checkout.html')) {
        // Small delay to show the notification before refresh
        setTimeout(() => {
            window.location.reload();
        }, 500);
    } 
    // If we're on the checkout page and cart is not empty, re-render the cart
    else if (window.location.pathname.includes('checkout.html')) {
        renderCheckout();
    }
}

function updateCartCount() {
    const count = cart.length; // Each item is a single unit
    const cartCounts = document.querySelectorAll('#cart-count, .cart-count');
    
    cartCounts.forEach(cartCount => {
        if (cartCount) {
            cartCount.textContent = count;
            cartCount.style.display = count > 0 ? 'flex' : 'none';
        }
    });
    
    return count;
}

// Format price helper function
function formatPrice(price) {
    return 'GH¢' + parseFloat(price).toFixed(2);
}

// Render checkout page if we're on the checkout page
function renderCheckout() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutSummary = document.getElementById('checkout-summary');
    const checkoutForm = document.getElementById('checkout-form');
    const emptyCart = checkoutItems ? checkoutItems.querySelector('.empty-cart') : null;
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (cart.length === 0) {
        if (emptyCart) emptyCart.style.display = 'block';
        if (checkoutSummary) checkoutSummary.style.display = 'none';
        if (checkoutForm) checkoutForm.style.display = 'none';
        return;
    }
    
    if (emptyCart) emptyCart.style.display = 'none';
    if (checkoutSummary) checkoutSummary.style.display = 'block';
    if (checkoutForm) checkoutForm.style.display = 'block';
    
    let subtotal = 0;
    
    // Render cart items
    if (checkoutItems) {
        // Clear existing items but keep the empty-cart element if it exists
        const children = Array.from(checkoutItems.children).filter(child => !child.classList.contains('empty-cart'));
        children.forEach(child => child.remove());
        
        // Add each cart item to the checkout
        cart.forEach((item, index) => {
            const itemTotal = parseFloat(item.price) * (item.quantity || 1);
            subtotal += itemTotal;
            
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-image">
                    <img src="${item.image || 'img/placeholder.jpg'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">
                        <span class="price">${formatPrice(item.price)}</span>
                        <span class="quantity">x ${item.quantity || 1}</span>
                    </div>
                </div>
                <div class="cart-item-total">
                    ${formatPrice(itemTotal)}
                </div>
                <button class="remove-item" data-index="${index}" aria-label="Remove item">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            checkoutItems.appendChild(itemEl);
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                removeFromCart(index);
            });
        });
    }
    
    // Update subtotal and total
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(subtotal); // Shipping calculated later via WhatsApp
        
    // Update summary
    if (document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`;
    }
}

/**
 * Mobile Menu Functionality
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
        
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }
    
    openMenu() {
        this.hamburger.setAttribute('aria-expanded', 'true');
        this.navLinks.setAttribute('aria-expanded', 'true');
        this.overlay.classList.add('visible');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        
        // Add active class to nav links
        this.navLinks.classList.add('active');
        this.hamburger.classList.add('active');
    }
    
    closeMenu() {
        this.hamburger.setAttribute('aria-expanded', 'false');
        this.navLinks.setAttribute('aria-expanded', 'false');
        this.overlay.classList.remove('visible');
        document.body.style.overflow = '';
        this.isOpen = false;
        
        // Remove active class from nav links
        this.navLinks.classList.remove('active');
        this.hamburger.classList.remove('active');
    }
}

// Initialize mobile menu when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize mobile menu if elements exist
    if (document.querySelector('.hamburger') && document.getElementById('navbarContent')) {
        new MobileMenu();
    }

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Menu Setup
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.querySelector('.menu-overlay');
    const html = document.documentElement;
    
    // Check if device is touch-enabled
    const isTouchDevice = 'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0 || 
                         navigator.msMaxTouchPoints > 0;
    
    // Add touch class to HTML if touch device
    if (isTouchDevice) {
        html.classList.add('touch-device');
    } else {
        html.classList.add('no-touch-device');
    }

    // Toggle mobile menu with better touch support
    function toggleMenu() {
        if (!navLinks || !hamburger) return;
        
        const isActive = navLinks.classList.contains('active');
        
        // Toggle menu state
        if (isActive) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.touchAction = '';
            document.body.style.position = '';
            document.body.style.width = '';
            
            // Remove the active class after transition ends
            setTimeout(() => {
                navLinks.classList.remove('animating');
            }, 300);
        } else {
            navLinks.classList.add('active', 'animating');
            hamburger.classList.add('active');
            document.body.style.overflow = 'hidden';
            document.body.style.touchAction = 'none';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }
    }
    
    // Initialize mobile menu functionality
    function initMobileMenu() {
        if (!hamburger || !navLinks) return;
        
        // Toggle menu on hamburger click
        hamburger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        }, { passive: false });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('active') && 
                !navLinks.contains(e.target) && 
                !hamburger.contains(e.target)) {
                toggleMenu();
            }
        }, { passive: true });
        
        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                toggleMenu();
            }
        }, { passive: true });

        // Handle nav link clicks
        const navItems = document.querySelectorAll('.nav-link');
        navItems.forEach(item => {
            // Add touch feedback
            item.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            }, { passive: true });
            
            item.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            }, { passive: true });
            
            // Handle click/tap
            item.addEventListener('click', function() {
                if (navLinks.classList.contains('active')) {
                    // Small delay to allow the link to be followed
                    setTimeout(() => {
                        toggleMenu();
                    }, 100);
                }
            }, { passive: true });
        });
    }
    
    // Initialize mobile menu if elements exist
    if (hamburger && navLinks) {
        initMobileMenu();
    }

    // Close mobile menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992 && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Initialize cart count
    updateCartCount();
    
    // Single event listener for all add to cart buttons
    document.addEventListener('click', function(e) {
        // Check if the clicked element or any of its parents is an add to cart button
        const addToCartBtn = e.target.closest('.add-to-cart, .btn-shop');
        if (!addToCartBtn) return;
        
        e.preventDefault();
        
        // Prevent multiple clicks
        if (addToCartBtn.classList.contains('processing')) return;
        addToCartBtn.classList.add('processing');
        
        const productCard = addToCartBtn.closest('.product');
        if (!productCard) {
            addToCartBtn.classList.remove('processing');
            return;
        }
        
        // Get quantity from input if it exists, otherwise default to 1
        const quantityInput = productCard.querySelector('.quantity-selector');
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        
        // Get product details
        let name, price, image;
        
        if (addToCartBtn.dataset.product) {
            name = addToCartBtn.dataset.product;
            price = parseFloat(addToCartBtn.dataset.price) || 0;
            image = productCard.querySelector('img')?.src || '';
        } else {
            name = productCard.querySelector('h3')?.textContent || 'Product';
            const priceText = productCard.querySelector('.price')?.textContent || '0';
            const priceMatch = priceText.match(/[\d.]+/);
            price = priceMatch ? parseFloat(priceMatch[0]) : 0;
            image = productCard.querySelector('img')?.src || '';
        }
        
        // Add to cart with specified quantity
        addToCart({
            name: name,
            price: price,
            image: image
        }, quantity);
        
        // Reset processing state after a short delay
        setTimeout(() => {
            addToCartBtn.classList.remove('processing');
        }, 1000);
    });

    // If we're on the checkout page, render it
    if (window.location.pathname.includes('checkout.html')) {
        renderCheckout();
    }
    
    // ... [Rest of the existing DOMContentLoaded logic remains] ...
    
    // Mobile Navigation Toggle
    // Add this code to main.js, right after the DOMContentLoaded event listener
    // Toggle mobile menu
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling up to document
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Toggle overflow on body when menu is open
            if (navLinks.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    }

    // Close mobile menu when clicking on a nav link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (hamburger) {
                    hamburger.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks && navLinks.classList.contains('active') && 
            !nav.contains(e.target) && 
            !hamburger.contains(e.target)) {
            navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Close menu on window resize (in case user rotates device)
    let resizeTimer;
    window.addEventListener('resize', () => {
        if (window.innerWidth > 992 && navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Smooth scrolling for anchor links on the same page
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Only process if the link is on the same page (starts with # and is not a file link)
        if (window.location.pathname === anchor.pathname || anchor.pathname === '/') {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page reload
                    history.pushState(null, null, targetId);
                }
            });
        }
    });
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class based on scroll position
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // Define track URLs with Audiomack streaming links
    const trackUrls = {
        'Grandeza': 'https://audiomack.com/jay-kelly-rahp/album/grandeza',
        'THE EARPEACE ALBUM': 'https://audiomack.com/jay-kelly-rahp/album/the-earpeace-album',
        'Synthetic Dreams': 'https://audiomack.com/jay-kelly-rahp/album/synthetic-dreams',
        'Midnight Sessions': 'https://audiomack.com/jay-kelly-rahp/album/midnight-sessions',
        'Urban Echoes': 'https://audiomack.com/jay-kelly-rahp/album/urban-echoes',
        'Neon Dreams': 'https://audiomack.com/jay-kelly-rahp/song/neon-dreams',
        'Midnight Vibes': 'https://audiomack.com/jay-kelly-rahp/song/midnight-vibes',
        'Echoes in the Void': 'https://audiomack.com/jay-kelly-rahp/song/echoes-in-the-void'
    };
    
    // Store trackUrls globally for the AudioPlayer to access
    window.trackUrls = trackUrls;
    
    // Initialize audio player
    const audioPlayer = new AudioPlayer();
    
    // Play button functionality
    document.addEventListener('click', function(e) {
        // Handle play button clicks
        const playButton = e.target.closest('.play-btn');
        if (playButton) {
            e.preventDefault();
            e.stopPropagation();
            
            const album = playButton.closest('.album');
            if (!album) return;
            
            const trackId = album.dataset.track;
            const trackUrl = trackUrls[trackId];
            
            if (!trackUrl) {
                console.warn('No track URL found for:', trackId);
                return;
            }
            
            // Toggle play/pause for the clicked track
            if (audioPlayer.isPlaying && audioPlayer.currentTrack === trackUrl) {
                audioPlayer.pause();
            } else {
                audioPlayer.play(trackUrl);
            }
        }
        
        // Handle album art clicks (open Audiomack)
        const albumArt = e.target.closest('.album-art');
        if (albumArt && !e.target.closest('.play-btn')) {
            e.preventDefault();
            const album = albumArt.closest('.album');
            const audiomackLink = album.querySelector('a[href^="https://audiomack.com"]');
            if (audiomackLink) {
                window.open(audiomackLink.href, '_blank');
            }
        }
    });
    
    // Update play buttons when audio state changes
    document.addEventListener('play', function(e) {
        if (e.target.tagName === 'AUDIO') {
            audioPlayer.updatePlayButtons();
        }
    });
    
    document.addEventListener('pause', function(e) {
        if (e.target.tagName === 'AUDIO') {
            audioPlayer.updatePlayButtons();
        }
    });
    
    // Booking Form Submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const formValues = Object.fromEntries(formData.entries());
            
            // Format the message for WhatsApp
            const whatsappNumber = '233271326182'; // Jay Kelly Rahp's WhatsApp number
            let message = `*New Booking Request*\n\n`;
            message += `*Name:* ${formValues.name}\n`;
            message += `*Email:* ${formValues.email}\n`;
            message += `*Phone:* ${formValues.phone}\n`;
            message += `*Event Type:* ${formValues['event-type']}\n`;
            message += `*Event Date:* ${formValues['event-date']}\n`;
            message += `*Budget Range:* ${formValues.budget}\n\n`;
            message += `*Event Details:*\n${formValues.message || 'No additional details provided.'}`;
            
            // Send to WhatsApp
            sendToWhatsApp(whatsappNumber, message);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message show';
            successMessage.innerHTML = 'Thank you for your booking request! We\'ll contact you shortly via WhatsApp.';
            bookingForm.appendChild(successMessage);
            
            // Reset form
            setTimeout(() => {
                bookingForm.reset();
                successMessage.remove();
            }, 5000);
        });
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (email) {
                // Format the message for WhatsApp
                const message = `*New Newsletter Subscription*\n\nEmail: ${email}\n\nPlease add me to your mailing list!`;
                
                // WhatsApp number with country code (no + or 00)
                const whatsappNumber = '233271326182'; // Jay Kelly Rahp's WhatsApp number
                
                // Send to WhatsApp
                sendToWhatsApp(whatsappNumber, message);
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message show';
                successMessage.textContent = 'Thank you for subscribing! You\'ll hear from us soon.';
                this.appendChild(successMessage);
                
                // Reset form
                emailInput.value = '';
                
                // Remove success message after 5 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
            }
        });
    }
    
    // Checkout functionality (The original code had this logic which clears the cart without redirecting to checkout.html)
    // I am commenting this out as the primary checkout button should be the cart icon, leading to checkout.html.
    /*
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
                return;
            }
            // Logic for direct WhatsApp checkout from index page
            // ...
        });
    }
    */
    
    // Add animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.album, .video-item, .event-card, .product');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Initialize elements for animation
    document.querySelectorAll('.album, .video-item, .event-card, .product').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    });
    
    // Initial check in case elements are already in view
    animateOnScroll();
    
    // Check on scroll
    window.addEventListener('scroll', animateOnScroll);
    
    // Preloader
    window.addEventListener('load', function() {
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.style.transition = 'opacity 0.5s ease';
            preloader.style.opacity = '0';
            
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }
    });
    
    // Add current year to footer
    const currentYear = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.current-year');
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
    
    // Initialize tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            tooltip.style.left = `${rect.left + (this.offsetWidth - tooltip.offsetWidth) / 2}px`;
            
            this.addEventListener('mouseleave', function() {
                tooltip.remove();
            }, { once: true });
        });
});

    
        
        // If clicking play on the current track, just resume playback
        if (this.audio && this.currentTrack === trackUrl) {
            this.audio.play().catch(error => console.error('Error resuming playback:', error));
            this.isPlaying = true;
            this.updatePlayButtons();
            this.updateNowPlaying();
            this.startProgressTracking();
            this.musicPlayer.classList.add('visible');
            return;
        }
        
        // Stop any current audio
        if (this.audio) {
            this.audio.pause();
            this.audio = null;
        }
        
        // Set the current track index if provided
        if (index >= 0) {
            this.currentTrackIndex = index;
        } else if (trackUrl) {
            // Find the track in the playlist
            const trackIndex = this.playlist.findIndex(track => track.url === trackUrl);
            if (trackIndex >= 0) {
                this.currentTrackIndex = trackIndex;
            }
        }
        
        // Get track info
        const trackInfo = this.playlist[this.currentTrackIndex];
        if (!trackInfo) return;
        
        // Create new audio element
        this.audio = new Audio(trackInfo.url);
        this.audio.volume = this.volume;
        this.currentTrack = trackInfo.url;
        
        // Set up event listeners
        this.audio.addEventListener('loadedmetadata', () => {
            this.duration = this.audio.duration;
            this.updateProgressBar();
            this.updateDurationDisplay();
            
            // Start playing if not already playing
            if (!this.isPlaying) {
                this.audio.play().catch(error => {
                    console.error('Error playing audio:', error);
                    this.handlePlaybackError(trackInfo);
                });
            }
        });
        
        this.audio.addEventListener('timeupdate', () => {
            this.currentTime = this.audio.currentTime;
            this.updateProgressBar();
        });
        
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updatePlayButtons();
            this.updateNowPlaying(trackInfo);
            this.startProgressTracking();
            this.musicPlayer.classList.add('visible');
            this.showNotification(`Now playing: ${trackInfo.title}`);
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.handlePlaybackError(trackInfo);
        });
            
        this.audio.addEventListener('ended', () => {
            this.next();
        });
        
        // Try to play the audio
        this.audio.play().catch(error => {
            console.error('Error playing audio:', error);
            this.handlePlaybackError(trackInfo);
        });
    }
    
    pause() {
        if (this.audio) {
            this.audio.pause();
            this.isPlaying = false;
            this.updatePlayButtons();
            this.stopProgressTracking();
        }
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else if (this.currentTrack) {
            this.play(this.currentTrack);
        } else if (this.playlist.length > 0) {
            // If nothing is playing but we have a playlist, play the first track
            this.play(this.playlist[0].url, 0);
        }
    }
    
    setVolume(volume) {
        this.volume = volume / 100; // Convert from 0-100 to 0-1
        if (this.audio) {
            this.audio.volume = this.volume;
        }
        // Update volume icon based on level
        const volumeIcon = document.querySelector('.volume-icon');
        if (volumeIcon) {
            if (this.volume <= 0) {
                volumeIcon.className = 'fas fa-volume-mute volume-icon';
            } else if (this.volume < 0.5) {
                volumeIcon.className = 'fas fa-volume-down volume-icon';
            } else {
                volumeIcon.className = 'fas fa-volume-up volume-icon';
            }
        }
    }
    
    seekTo(time) {
        if (this.audio) {
            this.audio.currentTime = time;
            this.currentTime = time;
            this.updateProgressBar();
        }
    }
    
    seekToPercentage(percent) {
        if (this.audio && this.duration) {
            const seekTime = (percent / 100) * this.duration;
            this.seekTo(seekTime);
        }
    }
    
    startProgressTracking() {
        this.stopProgressTracking();
        this.progressInterval = setInterval(() => {
            this.updateProgressBar();
            this.updateCurrentTimeDisplay();
        }, 1000);
    }
    
    stopProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }
    
    updateProgressBar() {
        if (!this.audio) return;
        
        const progress = (this.audio.currentTime / this.duration) * 100 || 0;
        this.progressBar.style.width = `${progress}%`;
        this.progressSlider.value = progress;
    }
    
    updateCurrentTimeDisplay() {
        if (!this.audio) return;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }
    
    updateDurationDisplay() {
        if (!this.audio) return;
        this.durationEl.textContent = this.formatTime(this.audio.duration || 0);
    }
    
    updateVolumeUI() {
        if (this.volumeSlider) {
            this.volumeSlider.value = this.volume * 100;
        }
    }
    
    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    getCurrentTrack() {
        if (this.currentTrackIndex >= 0 && this.currentTrackIndex < this.playlist.length) {
            return this.playlist[this.currentTrackIndex];
        }
        return null;
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }
    
    updatePlayButtons() {
        const playPauseIcon = this.playPauseBtn ? this.playPauseBtn.querySelector('i') : null;
        if (!playPauseIcon) return;
        
        if (this.isPlaying) {
            playPauseIcon.className = 'fas fa-pause';
        } else {
            playPauseIcon.className = 'fas fa-play';
        }
    }
    
    updateNowPlaying(trackInfo = null) {
        if (!trackInfo) {
            trackInfo = this.getCurrentTrack();
        }
        
        if (!trackInfo) return;
        
        if (this.nowPlayingTitle) {
            this.nowPlayingTitle.textContent = trackInfo.title;
        }
        
        if (this.nowPlayingArtist) {
            this.nowPlayingArtist.textContent = trackInfo.artist || 'Jay Kelly Rahp';
        }
        
        if (this.nowPlayingArt) {
            this.nowPlayingArt.src = trackInfo.artwork || 'https://placehold.co/60/0a0e2a/ff3c78/png?text=Album+Art';
            this.nowPlayingArt.alt = trackInfo.title;
        }
    }
    
    // Playlist management
    initPlaylist() {
        // Get all album elements
        const albums = document.querySelectorAll('.album');
        this.playlist = [];
        
        // Define audio file paths (update these with your actual audio file paths)
        const audioFiles = {
            'Grandeza': 'audio/grandeza.mp3',
            'THE EARPEACE ALBUM': 'audio/earpeace.mp3',
            'Synthetic Dreams': 'audio/synthetic-dreams.mp3',
            'Midnight Sessions': 'audio/midnight-sessions.mp3',
            'Urban Echoes': 'audio/urban-echoes.mp3',
            'Neon Dreams': 'audio/neon-dreams.mp3',
            'Midnight Vibes': 'audio/midnight-vibes.mp3',
            'Echoes in the Void': 'audio/echoes-void.mp3'
        };
        
        albums.forEach((album, index) => {
            const trackId = album.dataset.track;
            const title = album.dataset.track || `Track ${index + 1}`;
            const artist = 'Jay Kelly Rahp';
            const artwork = album.querySelector('img')?.src || '';
            const url = audioFiles[trackId] || '';
            
            if (url) {
                this.playlist.push({
                    id: trackId,
                    title,
                    artist,
                    artwork,
                    url,
                    element: album
                });
            }
        });
    }
    
    // Navigation methods
    next() {
        if (this.playlist.length === 0) return;
        
        let nextIndex = this.currentTrackIndex + 1;
        if (nextIndex >= this.playlist.length) {
            // If repeat is enabled, go back to the first track
            nextIndex = 0;
        }
        
        this.play(this.playlist[nextIndex].url, nextIndex);
    }
    
    prev() {
        if (this.playlist.length === 0) return;
        
        let prevIndex = this.currentTrackIndex - 1;
        if (prevIndex < 0) {
            // If at the first track, go to the last one
            prevIndex = this.playlist.length - 1;
        }
        
        this.play(this.playlist[prevIndex].url, prevIndex);
    }
    
    // Error handling
    handlePlaybackError(trackInfo) {
        console.error(`Error playing track: ${trackInfo?.title || 'Unknown'}`);
        this.showNotification(`Error playing: ${trackInfo?.title || 'track'}`);
        
        // Try to open the Audiomack link directly
        if (trackInfo?.element) {
            const link = trackInfo.element.querySelector('a[href^="https://audiomack.com"]');
            if (link) {
                window.open(link.href, '_blank');
            }
        }
    }
    
    // Event Listeners
    initEventListeners() {
        // Play/Pause button
        if (this.playPauseBtn) {
            this.playPauseBtn.addEventListener('click', () => {
                this.togglePlayPause();
            });
        }
        
        // Previous button
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prev();
            });
        }
        
        // Next button
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.next();
            });
        }
        
        // Volume slider
        if (this.volumeSlider) {
            this.volumeSlider.addEventListener('input', (e) => {
                this.setVolume(e.target.value);
            });
            this.updateVolumeUI(); // Set initial UI value
        }
        
        // Progress slider
        if (this.progressSlider) {
            // Handle seeking when the user drags the slider
            this.progressSlider.addEventListener('input', (e) => {
                this.seekToPercentage(e.target.value);
                this.updateCurrentTimeDisplay();
            });
            
            // Resume progress tracking when user is done seeking
            this.progressSlider.addEventListener('change', () => {
                if (this.isPlaying) {
                    this.startProgressTracking();
                }
            });
        }
    }
    
    // Initialize keyboard shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch (e.key) {
                case ' ': // Spacebar to toggle play/pause
                    e.preventDefault();
                    this.togglePlayPause();
                    break;
                case 'ArrowRight': // Right arrow to skip forward
                    e.preventDefault();
                    this.seekTo(this.currentTime + 5);
                    break;
                case 'ArrowLeft': // Left arrow to skip backward
                    e.preventDefault();
                    this.seekTo(this.currentTime - 5);
                    break;
                case 'm': // 'm' to mute/unmute
                    // Simple mute logic (resets volume to 0 or back to 0.7)
                    if (this.audio) {
                        if (this.audio.volume > 0) {
                            this.setVolume(0);
                        } else {
                            this.setVolume(70); // Set back to 70%
                        }
                    }
                    break;
            }
        });
    }
}

    // Initialize mobile menu if elements exist
    if (hamburger && navLinks) {
        initMobileMenu();
    }
    
    // Initialize cart count
    updateCartCount();
    
    // Initialize animations
    const animatedElements = document.querySelectorAll('.album, .video-item, .event-card, .product');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
    });
    
    // Initialize scroll animations
    window.addEventListener('scroll', animateOnScroll, { passive: true });
    animateOnScroll(); // Run once on load
});