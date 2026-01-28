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
    // Increased to 400x600 to accommodate zoom: 125% in legacy CSS (320*1.25 = 400)
    // This prevents right-side cropping while maintaining aspect ratio.
    const baseWidth = 400;
    const baseHeight = 600;

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

        // Inject CSS to hide scrollbars when iframe loads
        iframe.onload = function() {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const style = doc.createElement('style');
                style.textContent = `
                    body {
                        overflow: hidden !important;
                        margin: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                    }
                    ::-webkit-scrollbar {
                        display: none;
                    }
                    /* Hide potential navigation elements inside the page if any */
                    .PageNumberDiv { display: none !important; }
                `;
                doc.head.appendChild(style);

                // Re-adjust layout after load to ensure dimensions are correct
                adjustLayout();
            } catch (e) {
                console.warn("Cannot inject styles into iframe (CORS?):", e);
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
            li.addEventListener('click', () => {
                loadPage(surah.startPage);
                if (window.innerWidth <= 768) {
                    toggleSidebar(); // Close sidebar on mobile after selection
                }
            });
            surahList.appendChild(li);
        });
    }

    function loadPage(page) {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        currentPage = page;

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

        // Remove active class from all
        document.querySelectorAll('.surah-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current
        if (activeSurah) {
            const activeItem = document.querySelector(`.surah-item[data-page="${activeSurah.startPage}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
                // Scroll sidebar to show active item if needed
                activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    function adjustLayout() {
        if (!pageContainer || !iframe) return;

        // Set the explicit dimensions on the iframe to match base dimensions
        iframe.style.width = `${baseWidth}px`;
        iframe.style.height = `${baseHeight}px`;

        const containerWidth = pageContainer.clientWidth;
        const containerHeight = pageContainer.clientHeight;

        // Padding/Margin safety
        const padding = 0;

        const availableWidth = containerWidth - padding;
        const availableHeight = containerHeight - padding;

        const scaleX = availableWidth / baseWidth;
        const scaleY = availableHeight / baseHeight;

        // Fit containment
        let scale = Math.min(scaleX, scaleY);

        // Apply scale
        iframe.style.transform = `scale(${scale})`;
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

        sidebarToggle.addEventListener('click', toggleSidebar);

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in an input field
            if (e.target.matches('input')) return;

            if (e.key === 'ArrowLeft') {
                // Left Arrow -> Previous Page
                loadPage(currentPage - 1);
            } else if (e.key === 'ArrowRight') {
                // Right Arrow -> Next Page
                loadPage(currentPage + 1);
            }
        });
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
