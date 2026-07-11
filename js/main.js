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

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Style the notification
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.backgroundColor = '#333';
    notification.style.color = 'white';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '1000';
    notification.style.animation = 'fadeIn 0.3s';
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
    }
    
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background-color: #333;
        color: white;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        animation: fadeIn 0.3s ease-out;
    }
`;
document.head.appendChild(style);

// Shopping Cart Functions
function addToCart(productId, productName, price, quantity = 1) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: price,
            quantity: quantity
        });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`${productName} added to cart`);
    return false; // Prevent form submission
}

function removeFromCart(index) {
    if (index >= 0 && index < cart.length) {
        const item = cart[index];
        cart.splice(index, 1);
        saveCart();
        renderCart();
        showNotification(`${item.name} removed from cart`);
    }
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline-block' : 'none';
    }
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = formatPrice(0);
        return;
    }
    
    let total = 0;
    
    cartItems.innerHTML = cart.map((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        return `
            <div class="cart-item">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">
                        ${formatPrice(item.price)} × ${item.quantity}
                        <span>${formatPrice(itemTotal)}</span>
                    </div>
                </div>
                <button onclick="removeFromCart(${index})" class="remove-item">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
    
    if (cartTotal) {
        cartTotal.textContent = formatPrice(total);
    }
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
// cart is already declared at the top of the file

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

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize mobile menu if elements exist
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    // Initialize cart count
    updateCartCount();
    
    // Initialize mobile menu if elements exist
    if (hamburger && navLinks) {
        const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
        
        // Toggle mobile menu
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            
            // Update ARIA attribute
            hamburger.setAttribute('aria-expanded', isActive);
            
            // Toggle overlay
            if (mobileMenuOverlay) {
                mobileMenuOverlay.classList.toggle('active');
            }
            
            // Toggle overflow on body when menu is open
            if (isActive) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close mobile menu when clicking on a nav link
        const navItems = document.querySelectorAll('.nav-links a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                    if (mobileMenuOverlay) {
                        mobileMenuOverlay.classList.remove('active');
                    }
                    document.body.style.overflow = '';
                }
            });
        });

        // Close menu when clicking overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', () => {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                mobileMenuOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !hamburger.contains(e.target) &&
                (!mobileMenuOverlay || !mobileMenuOverlay.contains(e.target))) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                if (mobileMenuOverlay) {
                    mobileMenuOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        });

        // Close menu on window resize (in case user rotates device)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992 && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                if (mobileMenuOverlay) {
                    mobileMenuOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        });
        
        // Handle escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                if (mobileMenuOverlay) {
                    mobileMenuOverlay.classList.remove('active');
                }
                document.body.style.overflow = '';
            }
        });
    }
    
    // If we're on the checkout page, render it
    if (window.location.pathname.includes('checkout.html')) {
        renderCheckout();
    }
    
    console.log('Application initialized successfully');
});

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
