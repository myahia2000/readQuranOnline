document.addEventListener('DOMContentLoaded', () => {
    const totalPages = 604;
    let currentPage = 1;

    // DOM Elements
    const iframe = document.getElementById('quran-frame');
    const surahList = document.getElementById('surah-list');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const pageInput = document.getElementById('page-input');
    const goBtn = document.getElementById('btn-go');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const pageContainer = document.getElementById('page-container');

    // Base dimensions for content rendering
    const baseWidth = 400;
    // Default base height, but we will try to read dynamic height
    let currentContentHeight = 740;

    let lastActiveSurahItem = null;

    // Initialize
    function init() {
        // Render Sidebar
        renderSidebar();

        // Check URL for page param
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = parseInt(urlParams.get('page'));

        if (pageParam && pageParam >= 1 && pageParam <= totalPages) {
            currentPage = pageParam;
        }

        // Set transform origin to top-left to simplify positioning logic
        if (iframe) {
            iframe.style.transformOrigin = '0 0';
        }

        loadPage(currentPage);
        setupEventListeners();

        // Handle initial responsive state
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active'); // Hidden by default on mobile
        }

        // Initial resize
        adjustLayout();
        // Listen for resize
        window.addEventListener('resize', adjustLayout);

        // Inject CSS to hide scrollbars and normalize behavior when iframe loads
        iframe.onload = function() {
            try {
                const win = iframe.contentWindow;
                const doc = iframe.contentDocument || (win && win.document);
                if (!doc) {
                    adjustLayout();
                    return;
                }

                // 1) Disable the original per-page keyboard navigation inside the Quran pages
                //    so that it doesn't interfere with the viewer's own navigation / scaling.
                try {
                    // Remove inline handler on <body id="body" onkeydown="myFunction(event)">
                    const bodyEl = doc.getElementById('body');
                    if (bodyEl) {
                        bodyEl.onkeydown = null;
                    }

                    // Neutralize any global handlers / functions the page defines
                    if (win) {
                        win.onkeydown = null;
                        if (typeof win.myFunction === 'function') {
                            win.myFunction = function () { /* disabled in viewer */ };
                        }

                        // Re‑attach arrow key navigation on the iframe window itself
                        win.addEventListener('keydown', (e) => {
                            // Ignore input fields inside the page, if any
                            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                                return;
                            }

                            // RTL semantics: Left Arrow = next (forward), Right Arrow = previous (backward)
                            if (e.key === 'ArrowLeft') {
                                e.preventDefault();
                                loadPage(currentPage + 1);
                            } else if (e.key === 'ArrowRight') {
                                e.preventDefault();
                                loadPage(currentPage - 1);
                            }
                        });
                    }
                } catch (innerErr) {
                    console.warn('Could not normalize iframe key handlers:', innerErr);
                }

                // 2) Inject CSS into the iframe document to hide scrollbars and unify layout
                const style = doc.createElement('style');
                style.textContent = `
                    html, body {
                        overflow: hidden !important;
                        margin: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        padding-bottom: 20px !important; /* Add bottom spacing */
                        box-sizing: border-box !important;
                    }
                    ::-webkit-scrollbar {
                        display: none;
                    }
                    /* Hide potential navigation elements inside the page if any */
                    .PageNumberDiv { display: none !important; }
                `;
                doc.head.appendChild(style);

                // Try to get actual content height
                if (doc.body && doc.body.scrollHeight > 100) {
                    const measuredHeight = Math.max(
                        doc.documentElement ? doc.documentElement.scrollHeight : 0,
                        doc.body.scrollHeight
                    );
                    currentContentHeight = Math.max(measuredHeight, 740);
                } else {
                    currentContentHeight = 740; // Fallback
                }

                // Re-adjust layout after load to ensure dimensions are correct
                adjustLayout();
            } catch (e) {
                console.warn("Cannot inject styles into iframe (CORS?):", e);
                // Fallback layout just in case
                adjustLayout();
            }
        };
    }

    function renderSidebar() {
        surahList.innerHTML = '';
        surahData.forEach(surah => {
            const li = document.createElement('li');
            li.className = 'surah-item';
            li.dataset.page = surah.startPage;
            li.innerHTML = `
                <span class="surah-number">${surah.number}. <span class="surah-name-en">${surah.nameEn}</span></span>
                <span class="surah-name-ar">${surah.nameAr}</span>
            `;
            surahList.appendChild(li);
        });
    }

    function closeSidebarMobile() {
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }

    function loadPage(page) {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        currentPage = page;

        // Reset height for new page load until onload fires
        // currentContentHeight = 740;

        // Format filename: P_001.html, P_012.html, P_123.html
        const pageStr = String(page).padStart(3, '0');
        const filename = `P_${pageStr}.html`;

        iframe.src = filename;

        // Update URL
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('page', page);
        window.history.pushState({ page: page }, '', newUrl);

        // Update Controls
        pageInput.value = page;
        prevBtn.disabled = page <= 1;
        nextBtn.disabled = page >= totalPages;

        // Update Active Surah in Sidebar
        highlightActiveSurah(page);

        // Close sidebar on mobile when navigating
        closeSidebarMobile();
    }

    function highlightActiveSurah(page) {
        // Find the surah that contains this page
        let activeSurah = null;
        for (let i = 0; i < surahData.length; i++) {
            if (surahData[i].startPage <= page) {
                activeSurah = surahData[i];
            } else {
                break;
            }
        }

        // Remove active class from previous
        if (lastActiveSurahItem) {
            lastActiveSurahItem.classList.remove('active');
            lastActiveSurahItem = null;
        }

        // Add active class to current
        if (activeSurah) {
            const activeItem = document.querySelector(`.surah-item[data-page="${activeSurah.startPage}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
                // Scroll sidebar to show active item if needed
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                lastActiveSurahItem = activeItem;
            }
        }
    }

    function adjustLayout() {
        if (!pageContainer || !iframe) return;

        // Set the explicit dimensions on the iframe to match base dimensions
        iframe.style.width = `${baseWidth}px`;
        iframe.style.height = `${currentContentHeight}px`;

        const containerWidth = pageContainer.clientWidth;
        const containerHeight = pageContainer.clientHeight;

        // Padding/Margin safety
        const padding = 0;

        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - padding;

        const scaleX = availableWidth / baseWidth;
        const scaleY = availableHeight / currentContentHeight;

        // Fit containment
        let scale = Math.min(scaleX, scaleY);
        // Ensure we don't scale up unnecessarily if it fits, but user likely wants 'fit to screen' behavior
        // so we stick with min scale.

        // Apply scale
        iframe.style.transform = `scale(${scale})`;

        // Center the iframe using margins since transform-origin is 0 0
        const scaledWidth = baseWidth * scale;
        const scaledHeight = currentContentHeight * scale;

        const marginLeft = (availableWidth - scaledWidth) / 2;
        const marginTop = (availableHeight - scaledHeight) / 2;

        iframe.style.marginLeft = `${Math.max(0, marginLeft)}px`;
        iframe.style.marginTop = `${Math.max(0, marginTop)}px`;
    }

    function setupEventListeners() {
        prevBtn.addEventListener('click', () => loadPage(currentPage - 1));
        nextBtn.addEventListener('click', () => loadPage(currentPage + 1));

        goBtn.addEventListener('click', () => {
            const val = parseInt(pageInput.value);
            if (val) loadPage(val);
        });

        pageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const val = parseInt(pageInput.value);
                if (val) loadPage(val);
            }
        });

        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent document click from closing it immediately
            toggleSidebar();
        });

        // Click outside sidebar to close it on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
                // If click is not inside sidebar and not on the toggle button
                if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    closeSidebarMobile();
                }
            }
        });

        // Surah List Navigation (Event Delegation)
        surahList.addEventListener('click', (e) => {
            const item = e.target.closest('.surah-item');
            if (item && item.dataset.page) {
                const startPage = parseInt(item.dataset.page);
                loadPage(startPage);
                // closeSidebarMobile() is called inside loadPage, so we don't need it here
            }
        });

        // Keyboard navigation (RTL book: "next" is Left Arrow, "previous" is Right Arrow)
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in an input field
            if (e.target.matches('input')) return;

            if (e.key === 'ArrowLeft') {
                // Left Arrow -> Next Page (forward in RTL book)
                loadPage(currentPage + 1);
            } else if (e.key === 'ArrowRight') {
                // Right Arrow -> Previous Page (backward in RTL book)
                loadPage(currentPage - 1);
            }
        });

        // Touch Swipe Navigation
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50; // Minimum distance to consider a swipe

        // Use pageContainer to capture touches on the main content area
        pageContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        pageContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const diff = touchEndX - touchStartX;

            if (Math.abs(diff) > swipeThreshold) {
                // Swipe detected
                if (diff > 0) {
                    // Swipe Right (Finger moves left to right) -> Previous Page
                    // In RTL books (like Quran), moving "forward" (physically turning the page left) is a Right-to-Left swipe.
                    // Moving "backward" (turning the page right) is a Left-to-Right swipe.
                    // So:
                    // Swipe Left (diff < 0) -> Next Page (Forward)
                    // Swipe Right (diff > 0) -> Previous Page (Backward)
                    loadPage(currentPage - 1);
                } else {
                    // Swipe Left (Finger moves right to left) -> Next Page
                    loadPage(currentPage + 1);
                }
            }
        }

        // Touchpad Swipe navigation (horizontal wheel event) - Kept for desktop trackpads
        let isSwiping = false;
        window.addEventListener('wheel', (e) => {
            // Check for significant horizontal scroll
            if (Math.abs(e.deltaX) > 30 && Math.abs(e.deltaY) < 20) {
                if (isSwiping) return;

                isSwiping = true;
                // Debounce to prevent multiple page turns
                setTimeout(() => { isSwiping = false; }, 800);

                if (e.deltaX > 0) {
                    // Wheel deltaX > 0 means scrolling right (content moves left)
                    // Analogous to Swipe Left gesture
                    loadPage(currentPage + 1);
                } else {
                    // Wheel deltaX < 0 means scrolling left
                    // Analogous to Swipe Right gesture
                    loadPage(currentPage - 1);
                }
            }
        }, { passive: true });
    }

    function toggleSidebar() {
        if (window.innerWidth > 768) {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
            // Adjust layout after transition (approx 300ms)
            setTimeout(adjustLayout, 350);
        } else {
            sidebar.classList.toggle('active');
        }
    }

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.page) {
            loadPage(e.state.page);
        }
    });

    init();
});
