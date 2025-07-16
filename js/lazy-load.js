// Intersection Observer for lazy loading images and lightbox optimization
document.addEventListener('DOMContentLoaded', function() {
    // Create placeholder for images while loading
    function createPlaceholder(img) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        placeholder.style.cssText = `
            width: 100%;
            height: 200px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 14px;
        `;
        placeholder.textContent = 'Loading...';
        
        // Add CSS animation if not already added
        if (!document.querySelector('#loading-animation')) {
            const style = document.createElement('style');
            style.id = 'loading-animation';
            style.textContent = `
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
                .image-loaded {
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out;
                }
                .image-loaded.fade-in {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
        
        return placeholder;
    }

    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Create and insert placeholder
                    const placeholder = createPlaceholder(img);
                    img.parentNode.insertBefore(placeholder, img);
                    img.style.display = 'none';
                    
                    // Load the image
                    const tempImg = new Image();
                    tempImg.onload = function() {
                        img.src = tempImg.src;
                        img.classList.add('image-loaded');
                        img.style.display = 'block';
                        
                        // Fade in effect
                        requestAnimationFrame(() => {
                            img.classList.add('fade-in');
                        });
                        
                        // Remove placeholder after fade in
                        setTimeout(() => {
                            if (placeholder.parentNode) {
                                placeholder.parentNode.removeChild(placeholder);
                            }
                        }, 300);
                    };
                    
                    tempImg.onerror = function() {
                        placeholder.textContent = 'Failed to load';
                        placeholder.style.background = '#ffebee';
                        placeholder.style.color = '#c62828';
                    };
                    
                    tempImg.src = img.dataset.src || img.src;
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Optimize lightbox loading - only load images when lightbox is opened
    const lightboxLinks = document.querySelectorAll('a[data-lightbox]');
    
    lightboxLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Preload other images in the same gallery for smoother navigation
            const gallery = this.dataset.lightbox;
            const galleryLinks = document.querySelectorAll(`a[data-lightbox="${gallery}"]`);
            
            galleryLinks.forEach(galleryLink => {
                if (galleryLink !== this) {
                    const img = new Image();
                    img.src = galleryLink.href;
                }
            });
        });
    });
});