// WebP format support and image optimization
document.addEventListener('DOMContentLoaded', function() {
    
    // Check WebP support
    function supportsWebP() {
        return new Promise((resolve) => {
            const webP = new Image();
            webP.onload = webP.onerror = function() {
                resolve(webP.height === 2);
            };
            webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
    }

    // Replace image sources with WebP versions if supported
    async function optimizeImages() {
        const webpSupported = await supportsWebP();
        
        if (webpSupported) {
            // Replace image sources with WebP versions
            const images = document.querySelectorAll('img');
            
            images.forEach(img => {
                const originalSrc = img.src || img.dataset.src;
                if (originalSrc) {
                    // Check if WebP version exists
                    const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                    
                    // Test if WebP version exists
                    const testImg = new Image();
                    testImg.onload = function() {
                        // WebP version exists, use it
                        if (img.dataset.src) {
                            img.dataset.src = webpSrc;
                        } else {
                            img.src = webpSrc;
                        }
                    };
                    testImg.onerror = function() {
                        // WebP version doesn't exist, keep original
                        // No action needed
                    };
                    testImg.src = webpSrc;
                }
            });

            // Handle lightbox images
            const lightboxLinks = document.querySelectorAll('a[data-lightbox]');
            lightboxLinks.forEach(link => {
                const originalHref = link.href;
                const webpHref = originalHref.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                
                const testImg = new Image();
                testImg.onload = function() {
                    link.href = webpHref;
                };
                testImg.src = webpHref;
            });
        }
    }

    // Image compression quality detection and adjustment
    function detectConnectionSpeed() {
        // Use Network Information API if available
        if ('connection' in navigator) {
            const connection = navigator.connection;
            const effectiveType = connection.effectiveType;
            
            switch(effectiveType) {
                case 'slow-2g':
                case '2g':
                    return 'low';
                case '3g':
                    return 'medium';
                case '4g':
                default:
                    return 'high';
            }
        }
        
        // Fallback: assume medium quality
        return 'medium';
    }

    // Adjust image quality based on connection
    function adjustImageQuality() {
        const connectionSpeed = detectConnectionSpeed();
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            const originalSrc = img.src || img.dataset.src;
            if (originalSrc && originalSrc.includes('/assets/')) {
                let qualitySuffix = '';
                
                switch(connectionSpeed) {
                    case 'low':
                        qualitySuffix = '_low';
                        break;
                    case 'medium':
                        qualitySuffix = '_med';
                        break;
                    case 'high':
                    default:
                        // Use original quality
                        break;
                }
                
                if (qualitySuffix) {
                    const adjustedSrc = originalSrc.replace(/(\.[^.]+)$/, qualitySuffix + '$1');
                    
                    // Test if quality version exists
                    const testImg = new Image();
                    testImg.onload = function() {
                        if (img.dataset.src) {
                            img.dataset.src = adjustedSrc;
                        } else {
                            img.src = adjustedSrc;
                        }
                    };
                    testImg.src = adjustedSrc;
                }
            }
        });
    }

    // Progressive image loading with blur effect
    function setupProgressiveLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        images.forEach(img => {
            // Create low-quality placeholder
            const lowQualitySrc = img.dataset.src.replace(/(\.[^.]+)$/, '_thumb$1');
            
            // Load thumbnail first
            const thumbnail = new Image();
            thumbnail.onload = function() {
                img.src = thumbnail.src;
                img.style.filter = 'blur(5px)';
                img.style.transition = 'filter 0.3s ease';
            };
            thumbnail.src = lowQualitySrc;
            
            // Then load full quality
            const fullImg = new Image();
            fullImg.onload = function() {
                img.src = fullImg.src;
                img.style.filter = 'none';
            };
            fullImg.src = img.dataset.src;
        });
    }

    // Add CSS for progressive loading
    if (!document.querySelector('#progressive-loading')) {
        const style = document.createElement('style');
        style.id = 'progressive-loading';
        style.textContent = `
            /* Progressive loading styles */
            img[data-src] {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
            }
            
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
            
            /* Responsive images */
            img {
                max-width: 100%;
                height: auto;
            }
            
            /* Low bandwidth optimizations */
            @media (max-width: 768px) {
                img {
                    image-rendering: -webkit-optimize-contrast;
                    image-rendering: crisp-edges;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize optimizations
    optimizeImages();
    adjustImageQuality();
    
    // Setup progressive loading for data-src images
    setupProgressiveLoading();
});