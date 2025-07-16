// Video lazy loading and optimization
document.addEventListener('DOMContentLoaded', function() {
    
    // Video lazy loading with Intersection Observer
    function setupVideoLazyLoading() {
        const videos = document.querySelectorAll('video[data-src]');
        
        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        
                        // Create placeholder
                        const placeholder = createVideoPlaceholder(video);
                        video.parentNode.insertBefore(placeholder, video);
                        video.style.display = 'none';
                        
                        // Load video source
                        video.src = video.dataset.src;
                        video.load();
                        
                        video.addEventListener('loadeddata', function() {
                            video.style.display = 'block';
                            video.classList.add('video-loaded');
                            
                            // Fade in effect
                            requestAnimationFrame(() => {
                                video.classList.add('fade-in');
                            });
                            
                            // Remove placeholder
                            setTimeout(() => {
                                if (placeholder.parentNode) {
                                    placeholder.parentNode.removeChild(placeholder);
                                }
                            }, 300);
                        });
                        
                        video.addEventListener('error', function() {
                            placeholder.textContent = 'Video failed to load';
                            placeholder.style.background = '#ffebee';
                            placeholder.style.color = '#c62828';
                        });
                        
                        observer.unobserve(video);
                    }
                });
            }, {
                rootMargin: '100px 0px',
                threshold: 0.01
            });

            videos.forEach(video => videoObserver.observe(video));
        } else {
            // Fallback for older browsers
            videos.forEach(video => {
                video.src = video.dataset.src;
                video.load();
            });
        }
    }

    function createVideoPlaceholder(video) {
        const placeholder = document.createElement('div');
        placeholder.className = 'video-placeholder';
        placeholder.style.cssText = `
            width: ${video.width || '100%'};
            height: ${video.height || '200px'};
            background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0),
                        linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
            font-size: 14px;
            position: relative;
            border-radius: 8px;
            overflow: hidden;
        `;
        
        const playIcon = document.createElement('div');
        playIcon.innerHTML = '▶';
        playIcon.style.cssText = `
            font-size: 32px;
            color: #666;
            background: rgba(255,255,255,0.8);
            border-radius: 50%;
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
        `;
        
        const loadingText = document.createElement('div');
        loadingText.textContent = 'Loading video...';
        loadingText.style.position = 'absolute';
        loadingText.style.bottom = '10px';
        
        placeholder.appendChild(playIcon);
        placeholder.appendChild(loadingText);
        
        return placeholder;
    }

    // Add CSS for video transitions
    if (!document.querySelector('#video-animation')) {
        const style = document.createElement('style');
        style.id = 'video-animation';
        style.textContent = `
            .video-loaded {
                opacity: 0;
                transition: opacity 0.3s ease-in-out;
            }
            .video-loaded.fade-in {
                opacity: 1;
            }
            
            /* Responsive video containers */
            .video-container {
                position: relative;
                width: 100%;
                height: 0;
                padding-bottom: 56.25%; /* 16:9 aspect ratio */
                overflow: hidden;
                border-radius: 8px;
            }
            
            .video-container video {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            /* Video controls optimization */
            video {
                preload: none;
            }
            
            video:hover {
                cursor: pointer;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize video lazy loading
    setupVideoLazyLoading();

    // Pause videos when not visible (performance optimization)
    function setupVideoVisibilityControl() {
        const videos = document.querySelectorAll('video');
        
        if ('IntersectionObserver' in window) {
            const visibilityObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target;
                    if (!entry.isIntersecting && !video.paused) {
                        video.pause();
                    }
                });
            }, {
                threshold: 0.1
            });

            videos.forEach(video => visibilityObserver.observe(video));
        }
    }

    setupVideoVisibilityControl();
});