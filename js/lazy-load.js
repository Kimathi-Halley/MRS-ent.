// Intersection Observer for lazy loading images and lightbox optimization
document.addEventListener('DOMContentLoaded', function() {
    // Create placeholder for images while loading
    function createPlaceholder(img) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        
        // Get dimensions from the image or its container
        const container = img.closest('.blog-img') || img.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Use container dimensions or fallback to reasonable defaults
        const width = containerRect.width || '100%';
        const height = img.height || containerRect.height || 300;
        
        placeholder.style.cssText = `
            width: ${typeof width === 'number' ? width + 'px' : width};
            height: ${typeof height === 'number' ? height + 'px' : height};
            background: #f5f5f5;
            position: relative;
            overflow: hidden;
            border-radius: 8px;
        `;
        
        // Create shimmer effect
        const shimmer = document.createElement('div');
        shimmer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, 
                transparent 0%, 
                rgba(255, 255, 255, 0.4) 50%, 
                transparent 100%
            );
            transform: translateX(-100%);
            animation: shimmer 1.5s infinite;
        `;
        
        // Create icon
        const icon = document.createElement('div');
        icon.innerHTML = '<i class="ph ph-pipe-wrench" style="font-size: 48px; color: #ddd;"></i>';
        icon.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        `;
        
        placeholder.appendChild(icon);
        placeholder.appendChild(shimmer);
        
        // Add CSS animation if not already added
        if (!document.querySelector('#loading-animation')) {
            const style = document.createElement('style');
            style.id = 'loading-animation';
            style.textContent = `
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .image-loaded {
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out;
                }
                .image-loaded.fade-in {
                    opacity: 1;
                }
                .image-placeholder {
                    display: block;
                    min-height: 200px;
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
                        // Update placeholder for error state
                        placeholder.style.background = '#ffebee';
                        const icon = placeholder.querySelector('i');
                        if (icon) {
                            icon.className = 'ph ph-x-circle';
                            icon.style.color = '#c62828';
                        }
                        const shimmer = placeholder.querySelector('div:last-child');
                        if (shimmer) {
                            shimmer.style.display = 'none';
                        }
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