const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('main section[id]');
const revealItems = document.querySelectorAll('.reveal');
const contactForm = document.querySelector('.contact-form');
const formStatus = document.querySelector('.form-status');
const header = document.querySelector('.site-header');
const scrollProgress = document.querySelector('.scroll-progress');
const heroVisual = document.querySelector('.hero-visual');
const portraitRing = document.querySelector('.portrait-ring');
const magneticItems = document.querySelectorAll('.magnetic');
const tiltCards = document.querySelectorAll('.card, .mini-card, .contact-panel');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isTouchLike = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const cpuCores = navigator.hardwareConcurrency || 4;
const memoryGb = navigator.deviceMemory || 4;
const isLowPowerDevice = cpuCores <= 4 || memoryGb <= 4;
const enableAdvancedEffects = !prefersReducedMotion && !isTouchLike && !isLowPowerDevice;
const canAnimateDecorations = !prefersReducedMotion && !isLowPowerDevice;
const enableHeavyEffects = enableAdvancedEffects && cpuCores >= 8 && memoryGb >= 8 && window.innerWidth >= 1024;
const targetRefreshRate = prefersReducedMotion || isTouchLike || isLowPowerDevice ? 60 : 120;
const animationFrameInterval = 1000 / targetRefreshRate;

const closeMenu = () => {
    if (!menuToggle || !navMenu) {
        return;
    }

    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
};

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        const isOpen = menuToggle.classList.toggle('is-open');
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        navMenu.classList.toggle('is-open', isOpen);
    });
}

// Like Engine with Loading & Sounds
(function() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const progressBar = loadingOverlay?.querySelector('.progress-bar') || null;
    const likeBtns = document.querySelectorAll('.like-btn');

    // Web Audio API for sounds
    let audioContext = null;
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    function playLikeSound() {
        const ctx = initAudio();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }

    function playSuccessSound() {
        const ctx = initAudio();
        const notes = [523, 659, 784]; // C, E, G scale
        notes.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.15);
            
            oscillator.start(ctx.currentTime + i * 0.1);
            oscillator.stop(ctx.currentTime + i * 0.1 + 0.15);
        });
    }

    // Loading functions
    function showLoading() {
        if (!loadingOverlay) return;
        loadingOverlay.classList.add('active');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }, 100);
        return { interval, progress };
    }

    function hideLoading(state = {}) {
        if (!loadingOverlay) return;
        const timer = setTimeout(() => {
            loadingOverlay.classList.remove('active');
            clearTimeout(timer);
        }, 300);
        return state;
    }

    // Like storage
    function getLikes() {
        return JSON.parse(localStorage.getItem('portfolioLikes') || '{}');
    }

    function setLikes(likes) {
        localStorage.setItem('portfolioLikes', JSON.stringify(likes));
    }

    function updateLikeButton(btn, project, count, liked) {
        btn.classList.toggle('liked', liked);
        btn.querySelector('.like-count').textContent = count;
        if (liked) {
            playLikeSound();
        }
    }

    // Initialize likes on load
    function initLikes() {
        const likes = getLikes();
        likeBtns.forEach(btn => {
            const project = btn.dataset.project;
            const count = likes[project]?.count || parseInt(btn.querySelector('.like-count').textContent) || 0;
            const liked = likes[project]?.liked || false;
            updateLikeButton(btn, project, count, liked);
        });
    }

    // Like handler
    function handleLike(btn) {
        if (btn.classList.contains('loading')) return;

        const project = btn.dataset.project;
        btn.classList.add('loading');

        const likes = getLikes();
        const current = likes[project] || { count: 0, liked: false };

        // Show loading
        const loadingState = showLoading();
        setTimeout(() => {
            // Toggle like
            current.liked = !current.liked;
            if (current.liked) {
                current.count = (current.count || 0) + 1;
                playSuccessSound();
            } else {
                current.count = Math.max(0, (current.count || 0) - 1);
            }

            likes[project] = current;
            setLikes(likes);

            updateLikeButton(btn, project, current.count, current.liked);
            btn.classList.remove('loading');

            hideLoading();
            loadingState?.interval && clearInterval(loadingState.interval);
        }, 1500);
    }

    // Event listeners
    document.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.like-btn');
        if (targetBtn) {
            handleLike(targetBtn);
        }
    });

    // Init on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLikes);
    } else {
        initLikes();
    }
})();



const navLinkBySectionId = new Map(
    [...navLinks]
        .map((link) => {
            const href = link.getAttribute('href') || '';
            return [href.replace('#', ''), link];
        })
        .filter(([id]) => Boolean(id))
);

navLinks.forEach((link) => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('is-open')) {
            closeMenu();
        }
    });
});

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    {
        threshold: 0.16,
        rootMargin: '0px 0px -40px 0px'
    }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            const matchingLink = navLinkBySectionId.get(entry.target.id);
            if (!matchingLink) {
                return;
            }

            if (entry.isIntersecting) {
                navLinks.forEach((link) => link.classList.remove('active'));
                matchingLink.classList.add('active');
            }
        });
    },
    {
        threshold: 0.45,
        rootMargin: '-20% 0px -35% 0px'
    }
);

sections.forEach((section) => sectionObserver.observe(section));

if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = contactForm.elements.name.value.trim();
        formStatus.textContent = name
            ? `Thanks, ${name}. Your message is ready to send.`
            : 'Thanks. Your message is ready to send.';
        contactForm.reset();
    });
}

const updateScrollEffects = () => {
    const scrollTop = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

    if (scrollProgress) {
        scrollProgress.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
    }

    if (header) {
        header.classList.toggle('scrolled', scrollTop > 24);
    }
};

updateScrollEffects();
let scrollRafId = null;
let lastScrollFrameTime = 0;
window.addEventListener('scroll', () => {
    if (scrollRafId !== null) {
        return;
    }

    scrollRafId = requestAnimationFrame((timestamp) => {
        if (timestamp - lastScrollFrameTime < animationFrameInterval) {
            scrollRafId = null;
            return;
        }

        lastScrollFrameTime = timestamp;
        updateScrollEffects();
        scrollRafId = null;
    });
}, { passive: true });

if (enableAdvancedEffects && heroVisual && portraitRing) {
    let heroPointerFrame = null;
    let heroPointerEvent = null;
    let lastHeroPointerFrameTime = 0;

    heroVisual.addEventListener('pointermove', (event) => {
        heroPointerEvent = event;
        if (heroPointerFrame !== null) {
            return;
        }

        heroPointerFrame = requestAnimationFrame((timestamp) => {
            if (timestamp - lastHeroPointerFrameTime < animationFrameInterval) {
                heroPointerFrame = null;
                return;
            }

            lastHeroPointerFrameTime = timestamp;
            const rect = heroVisual.getBoundingClientRect();
            const x = (heroPointerEvent.clientX - rect.left) / rect.width;
            const y = (heroPointerEvent.clientY - rect.top) / rect.height;
            const rotateY = (x - 0.5) * 10;
            const rotateX = (0.5 - y) * 10;
            portraitRing.style.setProperty('--tilt-x', `${rotateY.toFixed(2)}deg`);
            portraitRing.style.setProperty('--tilt-y', `${rotateX.toFixed(2)}deg`);
            heroPointerFrame = null;
        });
    });

    heroVisual.addEventListener('pointerleave', () => {
        portraitRing.style.setProperty('--tilt-x', '0deg');
        portraitRing.style.setProperty('--tilt-y', '0deg');
    });
}

if (enableAdvancedEffects) {
    magneticItems.forEach((item) => {
        if (!enableHeavyEffects) {
            return;
        }

        let frameId = null;
        let pointerEvent = null;
        let lastFrameTime = 0;

        item.addEventListener('pointermove', (event) => {
            pointerEvent = event;
            if (frameId !== null) {
                return;
            }

            frameId = requestAnimationFrame((timestamp) => {
                if (timestamp - lastFrameTime < animationFrameInterval) {
                    frameId = null;
                    return;
                }

                lastFrameTime = timestamp;
                const rect = item.getBoundingClientRect();
                const x = pointerEvent.clientX - rect.left - rect.width / 2;
                const y = pointerEvent.clientY - rect.top - rect.height / 2;
                item.style.transform = `translate(${(x * 0.08).toFixed(2)}px, ${(y * 0.08).toFixed(2)}px)`;
                frameId = null;
            });
        });

        item.addEventListener('pointerleave', () => {
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
            item.style.transform = '';
        });
    });

    tiltCards.forEach((card) => {
        if (!enableHeavyEffects) {
            return;
        }

        let frameId = null;
        let pointerEvent = null;
        let lastFrameTime = 0;

        card.addEventListener('pointermove', (event) => {
            if (window.innerWidth < 821) {
                return;
            }

            pointerEvent = event;
            if (frameId !== null) {
                return;
            }

            frameId = requestAnimationFrame((timestamp) => {
                if (timestamp - lastFrameTime < animationFrameInterval) {
                    frameId = null;
                    return;
                }

                lastFrameTime = timestamp;
                const rect = card.getBoundingClientRect();
                const px = (pointerEvent.clientX - rect.left) / rect.width;
                const py = (pointerEvent.clientY - rect.top) / rect.height;
                const tiltX = (0.5 - py) * 4;
                const tiltY = (px - 0.5) * 6;
                card.style.transform = `perspective(700px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-6px)`;
                frameId = null;
            });
        });

        card.addEventListener('pointerleave', () => {
            if (frameId !== null) {
                cancelAnimationFrame(frameId);
                frameId = null;
            }
            card.style.transform = '';
        });
    });
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 820) {
        closeMenu();
    }
});

// Lightning Storm System
if (enableHeavyEffects) {
    const pageShell = document.querySelector('.page-shell');
    let stormTimer = null;
    let activeLightning = 0;
const maxActiveLightning = 1;

    function createLightning(clientX = Math.random() * window.innerWidth, clientY = Math.random() * window.innerHeight) {
        if (!pageShell || activeLightning >= maxActiveLightning) {
            return;
        }

        activeLightning += 1;
        const container = document.createElement('div');
        container.className = 'lightning-container';
        container.style.left = `${clientX}px`;
        container.style.top = `${clientY}px`;
        container.style.setProperty('--random-rot', `${(Math.random() - 0.5) * 60}deg`);
        
        // Random variant
        const variant = Math.floor(Math.random() * 3);
        let boltHTML = '';
        
        if (variant === 0) {
            boltHTML = `
                <div class="lightning-bolt lightning-main"></div>
                <div class="lightning-bolt lightning-branch lightning-branch-1"></div>
                <div class="lightning-bolt lightning-branch lightning-branch-2"></div>
            `;
        } else if (variant === 1) {
            boltHTML = `
                <div class="lightning-bolt lightning-arc"></div>
                <div class="lightning-glow nebula-glow"></div>
            `;
        } else {
            boltHTML = `
                <div class="lightning-bolt lightning-burst"></div>
                <div class="lightning-sparks"></div>
            `;
        }
        
        container.innerHTML = boltHTML;
        pageShell.appendChild(container);
        
        requestAnimationFrame(() => container.classList.add('lightning-strike'));
        setTimeout(() => {
            container.remove();
            activeLightning = Math.max(0, activeLightning - 1);
        }, 600);
    }

    // Auto Storm: Random strikes every 9-18s + screen flash
    function scheduleStorm() {
        const nextDelay = 9000 + Math.random() * 9000;
        stormTimer = setTimeout(() => {
            if (document.hidden) {
                scheduleStorm();
                return;
            }

            createLightning();
            const flash = document.createElement('div');
            flash.className = 'storm-flash';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 300);

            scheduleStorm();
        }, nextDelay);
    }

    function startStorm() {
        if (stormTimer !== null) {
            clearTimeout(stormTimer);
            stormTimer = null;
        }
        scheduleStorm();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startStorm);
    } else {
        startStorm();
    }

    document.addEventListener('click', (e) => {
        if (e.target.closest('button, a, input, textarea, .nav-menu')) return;
        createLightning(e.clientX, e.clientY);
    }, { passive: true });
}

// Custom Cursor Implementation
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');

if (cursorDot && cursorRing && enableAdvancedEffects) {
    const isCyberTheme = document.body.classList.contains('cyber-shot');
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let hasMousePosition = false;
    let ringAnimationId = null;
    const cursorRefreshRate = targetRefreshRate;
    const cursorFrameInterval = animationFrameInterval;
    let lastCursorFrameTime = 0;

    const startRingAnimation = () => {
        if (ringAnimationId !== null) {
            return;
        }

        const animateRing = (timestamp) => {
            if (timestamp - lastCursorFrameTime < cursorFrameInterval) {
                ringAnimationId = requestAnimationFrame(animateRing);
                return;
            }

            lastCursorFrameTime = timestamp;
            const dx = mouseX - ringX;
            const dy = mouseY - ringY;

            ringX += dx * 0.15;
            ringY += dy * 0.15;

            cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;

            // Stop the loop when the ring has caught up to avoid unnecessary work while idle.
            if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
                ringAnimationId = null;
                return;
            }

            ringAnimationId = requestAnimationFrame(animateRing);
        };

        ringAnimationId = requestAnimationFrame(animateRing);
    };

    const setInteractiveCursor = (isActive) => {
        if (isCyberTheme) {
            if (isActive) {
                cursorDot.style.width = '14px';
                cursorDot.style.height = '14px';
                cursorDot.style.borderRadius = '2px';
                cursorDot.style.backgroundColor = '#7dffe2';
                cursorDot.style.boxShadow = '0 0 0 1px rgba(125, 255, 226, 0.58), 0 0 22px rgba(53, 240, 198, 0.45)';

                cursorRing.style.width = '56px';
                cursorRing.style.height = '56px';
                cursorRing.style.borderRadius = '0';
                cursorRing.style.borderColor = '#35f0c6';
                cursorRing.style.backgroundColor = 'rgba(53, 240, 198, 0.08)';
                cursorRing.style.boxShadow = '0 0 24px rgba(53, 240, 198, 0.3)';
                return;
            }

            cursorDot.style.width = '10px';
            cursorDot.style.height = '10px';
            cursorDot.style.borderRadius = '2px';
            cursorDot.style.backgroundColor = '#35f0c6';
            cursorDot.style.boxShadow = '0 0 0 1px rgba(53, 240, 198, 0.45), 0 0 16px rgba(53, 240, 198, 0.35)';

            cursorRing.style.width = '36px';
            cursorRing.style.height = '36px';
            cursorRing.style.borderRadius = '0';
            cursorRing.style.borderColor = 'rgba(53, 240, 198, 0.75)';
            cursorRing.style.backgroundColor = 'transparent';
            cursorRing.style.boxShadow = '0 0 18px rgba(53, 240, 198, 0.2)';
            return;
        }

        if (isActive) {
            cursorDot.style.width = '12px';
            cursorDot.style.height = '12px';
            cursorDot.style.backgroundColor = 'var(--gold)';

            cursorRing.style.width = '48px';
            cursorRing.style.height = '48px';
            cursorRing.style.borderColor = 'var(--cyan)';
            cursorRing.style.backgroundColor = 'rgba(23, 201, 255, 0.1)';
            return;
        }

        cursorDot.style.width = '8px';
        cursorDot.style.height = '8px';
        cursorDot.style.backgroundColor = 'var(--cyan)';

        cursorRing.style.width = '32px';
        cursorRing.style.height = '32px';
        cursorRing.style.borderColor = 'var(--violet)';
        cursorRing.style.backgroundColor = 'transparent';
    };

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        hasMousePosition = true;

        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
        
        // Dot follows instantly
        cursorDot.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
        startRingAnimation();
    });

    document.addEventListener('mouseover', (event) => {
        if (event.target.closest('a, button, input, textarea, .card, .magnetic')) {
            setInteractiveCursor(true);
        }
    });

    document.addEventListener('mouseout', (event) => {
        if (event.target.closest('a, button, input, textarea, .card, .magnetic')) {
            setInteractiveCursor(false);
        }
    });

    if (hasMousePosition) {
        startRingAnimation();
    }
}

// Init stars (generate fewer for perf)
document.addEventListener('DOMContentLoaded', () => {
    // Page Loader Logic
    const pageLoader = document.getElementById('pageLoader');
    if (pageLoader && !prefersReducedMotion) {
        const minLoaderTimeMs = 1200;
        const loaderStart = performance.now();

        const finishLoader = () => {
            const elapsed = performance.now() - loaderStart;
            const delay = Math.max(0, minLoaderTimeMs - elapsed);

            setTimeout(() => {
                document.body.classList.add('loaded');
                pageLoader.classList.add('loaded');
            }, delay);
        };

        if (document.readyState === 'complete') {
            finishLoader();
        } else {
            window.addEventListener('load', finishLoader, { once: true });
        }
    } else if (pageLoader) {
        document.body.classList.add('loaded');
        pageLoader.classList.add('loaded');
    }

    if (!canAnimateDecorations) {
        return;
    }

    const starsContainer = document.createElement('div');
    starsContainer.className = 'stars-container';
    document.body.appendChild(starsContainer);

    // Reduced count for perf
    const starCount = enableHeavyEffects ? 28 : 16;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = star.style.height = (0.4 + Math.random() * 1.6) + 'px';
        star.style.animationDelay = Math.random() * 2 + 's';
        star.style.animationDuration = (2 + Math.random() * 3) + 's';
        fragment.appendChild(star);
    }

    starsContainer.appendChild(fragment);
    
    // Keep decorative animation lightweight for smoother scrolling/input.
});

