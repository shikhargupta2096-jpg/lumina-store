/* ============================================================
   modern.js — Premium Lumina Experience
   ============================================================
   • Supabase PostgreSQL data loading with products.json fallback
   • Supabase Storage CDN media delivery
   • Dynamic collection grid rendering
   • Glass UI product modal
   • Scroll-reveal via Intersection Observer
   • Hero parallax
   • Mobile menu toggle
   ============================================================ */

// Supabase Configuration
const SUPABASE_URL = "https://hykotrvfvzbhupaefaax.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5a290cnZmdnpiaHVwYWVmYWF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg5NjE5MDEsImV4cCI6MjEwNDUzNzkwMX0.OYYixQZf551o0OD4D_2eexXsUHexy3Gm6dHByPxlpao";
const MEDIA_BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/media`;

// Helper to construct media URLs
function getMediaUrl(path) {
  if (!path) return `${MEDIA_BASE_URL}/placeholder.webp`;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.replace(/^images\//, '').replace(/^\/+/, '');
  return `${MEDIA_BASE_URL}/${cleanPath}`;
}

// Initialize Supabase Client (if SDK is available)
const supabaseClient = (window.supabase && typeof window.supabase.createClient === 'function')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

document.addEventListener('DOMContentLoaded', async () => {

  /* =========================================================
     1. DATA LOADING — Supabase (PostgreSQL) with products.json fallback
     ========================================================= */
  let categories = [];
  let products = [];

  const timeoutPromise = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timed out')), ms));

  async function loadData() {
    try {
      // 1. Fetch categories
      let catData = [];
      if (supabaseClient) {
        const { data, error } = await supabaseClient
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        if (error) throw error;
        catData = data || [];
      } else {
        const catRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*&order=display_order`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (!catRes.ok) throw new Error(`Categories fetch failed: ${catRes.status}`);
        catData = await catRes.json();
      }

      // 2. Fetch products
      let prodData = [];
      if (supabaseClient) {
        const { data, error } = await supabaseClient
          .from('products')
          .select('*');
        if (error) throw error;
        prodData = data || [];
      } else {
        const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        if (!prodRes.ok) throw new Error(`Products fetch failed: ${prodRes.status}`);
        prodData = await prodRes.json();
      }

      if (!catData.length || !prodData.length) {
        throw new Error('Empty dataset from Supabase');
      }

      categories = catData.map(c => ({
        ...c,
        longDesc: c.long_desc || c.longDesc || '',
        shortDesc: c.short_desc || c.shortDesc || '',
        categoryType: c.category_type || c.categoryType || ''
      }));

      products = prodData.map(p => ({
        ...p,
        categoryId: p.category_id || p.categoryId || '',
        desc: p.description || p.desc || '',
        badgeClass: p.badge_class || p.badgeClass || ''
      }));

      console.log(`✓ Successfully loaded ${categories.length} categories and ${products.length} products from Supabase.`);
    } catch (err) {
      console.warn('Supabase data fetch failed, falling back to products.json:', err.message);
      try {
        const res = await fetch('products.json?v=' + Date.now());
        const data = await res.json();
        categories = data.categories || [];
        products = data.products || [];
        console.log(`✓ Loaded fallback data from products.json: ${categories.length} categories, ${products.length} products.`);
      } catch (fallbackErr) {
        console.error('Both Supabase and products.json failed to load.', fallbackErr);
      }
    }
  }

  await Promise.race([
    loadData(),
    timeoutPromise(3500)
  ]).catch(err => {
    console.warn('Data load timed out or had uncaught error:', err);
  });

  /* =========================================================
     2. RENDER COLLECTION GRID
     ========================================================= */
  const grid = document.getElementById('collection-grid');
  if (grid && categories.length) {
    grid.innerHTML = categories.map((cat, index) => {
      const imgSrc = (cat.img && cat.img.startsWith('http'))
        ? cat.img
        : getMediaUrl(cat.img);

      return `
        <div class="card-hover-glow bg-midnight-card border border-midnight-line hover:border-crimson/50 transition-colors duration-300 rounded-2xl overflow-hidden cursor-pointer reveal group tilt-card"
             style="--i:${index}"
             data-cat-id="${cat.id}">
          <div class="tilt-inner w-full h-full flex flex-col">
            <!-- Image Stage with Light Sweep -->
            <div class="relative aspect-square overflow-hidden bg-midnight">
              <!-- Diagonal Glass Light Sweep Effect -->
              <div class="card-light-sweep"></div>

              <!-- Index Badge -->
              <div class="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-midnight/70 backdrop-blur-md border border-glass-border text-[9px] font-mono tracking-widest text-ash uppercase group-hover:text-crimson group-hover:border-crimson/40 transition-colors">
                0${index + 1}
              </div>

              <img src="${imgSrc}"
                   alt="${cat.name}"
                   loading="lazy"
                   class="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-500 scale-100 group-hover:scale-105"
                   style="transition: transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease;"
                   onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 400 400%27%3E%3Crect fill=%27%23161820%27 width=%27400%27 height=%27400%27/%3E%3Ctext x=%27200%27 y=%27210%27 text-anchor=%27middle%27 fill=%27%23555%27 font-family=%27system-ui%27 font-size=%2714%27%3EImage Unavailable%3C/text%3E%3C/svg%3E'"/>
            </div>
            <!-- Info Bar -->
            <div class="px-5 py-5 flex items-center justify-between border-t border-midnight-line group-hover:border-crimson/30 transition-colors">
              <div>
                <h3 class="font-sans font-bold text-snow text-sm tracking-[0.15em] uppercase group-hover:text-crimson transition-colors">${cat.name}</h3>
                <p class="font-sans text-ash text-[11px] mt-1 line-clamp-1">${cat.subtitle || ''}</p>
              </div>
              <div class="card-hover-arrow">
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach 3D tilt interaction to collection cards
    initCardTilt();
  }

  /* =========================================================
     3. SCROLL REVEAL — Intersection Observer
     ========================================================= */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -40px 0px'
    });

    els.forEach(el => observer.observe(el));
  }
  initReveal();

  /* =========================================================
     4. HERO PARALLAX
     ========================================================= */
  const heroBg = document.getElementById('hero-bg');
  if (heroBg) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          heroBg.style.transform = `translateY(${scrollY * 0.25}px) scale(1.05)`;
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* =========================================================
     ACCESSIBILITY: FOCUS TRAP UTILITY (WCAG 2.1 AA)
     ========================================================= */
  function createFocusTrap(element, onEscape) {
    let previousActiveElement = null;

    function getFocusables() {
      if (!element) return [];
      return Array.from(element.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (typeof onEscape === 'function') onEscape();
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = getFocusables();
      if (!focusables.length) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first || !element.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !element.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    return {
      activate(preferredInitial) {
        previousActiveElement = document.activeElement;
        document.addEventListener('keydown', handleKeyDown);
        requestAnimationFrame(() => {
          if (preferredInitial && typeof preferredInitial.focus === 'function') {
            preferredInitial.focus();
          } else {
            const focusables = getFocusables();
            if (focusables.length) focusables[0].focus();
          }
        });
      },
      deactivate() {
        document.removeEventListener('keydown', handleKeyDown);
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
          previousActiveElement.focus();
        }
        previousActiveElement = null;
      }
    };
  }

  /* =========================================================
     5. MOBILE MENU — With Focus Trap & Click-Outside
     ========================================================= */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileBackdrop = document.getElementById('mobile-menu-backdrop');
  if (mobileToggle && mobileMenu) {
    let menuOpen = false;

    const mobileMenuTrap = createFocusTrap(mobileMenu, () => setMenuState(false));

    function setMenuState(open) {
      menuOpen = open;
      mobileToggle.setAttribute('aria-expanded', String(menuOpen));

      if (menuOpen) {
        mobileMenu.classList.remove('hidden');
        if (mobileBackdrop) {
          mobileBackdrop.classList.remove('hidden');
          requestAnimationFrame(() => mobileBackdrop.classList.add('opacity-100'));
        }
        requestAnimationFrame(() => {
          mobileMenu.classList.add('open');
          mobileMenuTrap.activate();
        });
      } else {
        mobileMenuTrap.deactivate();
        mobileMenu.classList.remove('open');
        if (mobileBackdrop) {
          mobileBackdrop.classList.remove('opacity-100');
          setTimeout(() => {
            if (!menuOpen) mobileBackdrop.classList.add('hidden');
          }, 300);
        }
        setTimeout(() => {
          if (!menuOpen) mobileMenu.classList.add('hidden');
        }, 300);
      }
      const icon = mobileToggle.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = menuOpen ? 'close' : 'menu';
    }

    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setMenuState(!menuOpen);
    });

    // Close on backdrop tap or click
    if (mobileBackdrop) {
      mobileBackdrop.addEventListener('click', () => setMenuState(false));
      mobileBackdrop.addEventListener('touchstart', () => setMenuState(false), { passive: true });
    }

    // Close on link click
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        setMenuState(false);
      });
    });

    // Click outside dismissal fallback
    document.addEventListener('click', (e) => {
      if (menuOpen && !mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        setMenuState(false);
      }
    });
  }

  /* =========================================================
     6. PRODUCT MODAL — Glass UI with Focus Trap
     ========================================================= */
  const modalOverlay = document.getElementById('product-modal');
  const modalInner   = document.getElementById('modal-inner');
  const modalClose   = document.getElementById('modal-close');
  const modalBody    = document.getElementById('modal-body');
  const modalTitle   = document.getElementById('modal-title');
  const modalSub     = document.getElementById('modal-subtitle');

  const modalTrap = createFocusTrap(modalInner || modalOverlay, () => closeModal());

  function openModal(catId) {
    const cat = categories.find(c => c.id === catId);
    if (!cat || !modalOverlay) return;

    const catProducts = products.filter(p => p.categoryId === catId);

    if (modalTitle) modalTitle.textContent = cat.name;
    if (modalSub)   modalSub.innerHTML = cat.longDesc || cat.subtitle || '';

    if (catProducts.length === 0) {
      modalBody.innerHTML = '<p class="text-ash text-base col-span-full text-center py-12">No products found in this collection yet.</p>';
    } else {
      modalBody.innerHTML = catProducts.map(p => {
        const pImgSrc = (p.img && p.img.startsWith('http'))
          ? p.img
          : getMediaUrl(`${p.categoryId}/${p.img || 'placeholder.webp'}`);

        const specsHTML = (p.specs || []).map(s =>
          `<span class="inline-block px-3 py-1 text-[11px] tracking-wide uppercase border border-midnight-line text-ash rounded-full">${s}</span>`
        ).join('');

        const badgeHTML = p.badge
          ? `<span class="absolute top-3 right-3 z-10 px-3 py-1 bg-crimson text-midnight text-[10px] tracking-[0.1em] uppercase font-bold rounded-full">${p.badge}</span>`
          : '';

        return `
          <div class="flex flex-col bg-midnight-soft border border-midnight-line hover:border-crimson/30 rounded-2xl overflow-hidden transition-colors group">
            <div class="relative aspect-square bg-midnight-card flex items-center justify-center border-b border-midnight-line skeleton-shimmer overflow-hidden">
              ${badgeHTML}
              <img src="${pImgSrc}" alt="${p.name}" class="w-full h-full object-cover filter group-hover:drop-shadow-[0_0_15px_rgba(200,169,110,0.3)] group-hover:scale-110 transition-all duration-700 opacity-0 scale-105 transform" onload="this.classList.remove('opacity-0', 'scale-105'); this.parentElement.classList.remove('skeleton-shimmer')" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 400 400%27%3E%3Crect fill=%27%23161820%27 width=%27400%27 height=%27400%27/%3E%3Ctext x=%27200%27 y=%27210%27 text-anchor=%27middle%27 fill=%27%23555%27 font-family=%27system-ui%27 font-size=%2714%27%3EImage Unavailable%3C/text%3E%3C/svg%3E'; this.classList.remove('opacity-0', 'scale-105'); this.parentElement.classList.remove('skeleton-shimmer')"/>
            </div>
            <div class="p-5">
              <h4 class="font-sans font-bold text-snow text-lg uppercase group-hover:text-crimson transition-colors m-0">${p.name}</h4>
            </div>
          </div>
        `;
      }).join('');
    }

    // Show & Activate Focus Trap
    modalOverlay.classList.remove('opacity-0', 'pointer-events-none');
    modalOverlay.classList.add('opacity-100', 'pointer-events-auto');
    if (modalInner) {
      modalInner.classList.remove('translate-y-8', 'scale-[0.97]');
      modalInner.classList.add('translate-y-0', 'scale-100');
    }
    document.body.style.overflow = 'hidden';
    modalTrap.activate(modalClose);
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalTrap.deactivate();
    modalOverlay.classList.add('opacity-0', 'pointer-events-none');
    modalOverlay.classList.remove('opacity-100', 'pointer-events-auto');
    if (modalInner) {
      modalInner.classList.add('translate-y-8', 'scale-[0.97]');
      modalInner.classList.remove('translate-y-0', 'scale-100');
    }
    document.body.style.overflow = '';
  }

  // Bind card clicks
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-cat-id]');
    if (card) {
      openModal(card.getAttribute('data-cat-id'));
    }
  });

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  /* =========================================================
     7. ENQUIRE PRODUCT — Scroll to form
     ========================================================= */
  window.enquireProduct = function(productName) {
    closeModal();
    setTimeout(() => {
      const inquiry = document.getElementById('inquiry');
      if (inquiry) inquiry.scrollIntoView({ behavior: 'smooth' });
      // Try to find the textarea and pre-fill
      const textarea = inquiry ? inquiry.querySelector('textarea') : null;
      if (textarea) {
        textarea.value = 'I would like to enquire about the ' + productName + '.';
        textarea.focus();
      }
    }, 200);
  };

  /* =========================================================
     8. AMBIENT SPOTLIGHT CURSOR
     ========================================================= */
  function initSpotlightCursor() {
    const spotlight = document.getElementById('spotlight-cursor');
    if (!spotlight) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isVisible = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        spotlight.style.opacity = '1';
      }
    });

    window.addEventListener('mouseleave', () => {
      isVisible = false;
      spotlight.style.opacity = '0';
    });

    // Smooth lerp follower for buttery organic lighting feel
    function animate() {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;
      spotlight.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    }
    animate();
  }
  initSpotlightCursor();

  /* =========================================================
     9. 3D CARD TILT INTERACTION
     ========================================================= */
  function initCardTilt() {
    // Only run on devices with precision pointer / hover
    if (window.matchMedia('(hover: none)').matches) return;

    const cards = document.querySelectorAll('.tilt-card');

    cards.forEach((card) => {
      let bounds = null;

      card.addEventListener('mouseenter', () => {
        bounds = card.getBoundingClientRect();
      });

      card.addEventListener('mousemove', (e) => {
        if (!bounds) bounds = card.getBoundingClientRect();
        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        // Calculate rotation between -8deg and +8deg
        const xPct = mouseX / bounds.width - 0.5;
        const yPct = mouseY / bounds.height - 0.5;
        const rotateY = xPct * 16;
        const rotateX = -yPct * 16;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        bounds = null;
      });
    });
  }

  /* =========================================================
     10. CURATED BY SPACE INTERACTIVE VISUALIZER
     ========================================================= */
  function initSpaceVisualizer() {
    const spaceData = {
      foyer: {
        badge: '20–26 Ft Ceiling Volume',
        tagline: 'Statement Centerpieces',
        title: 'Grand Foyer & Living',
        desc: 'Double-height volumes require vertical scale and 360° light dispersion. Cascading crystal raindrops and multi-tier architectural fixtures establish an instant luxury first impression.',
        img: getMediaUrl('space_foyer.webp'),
        temp: '2700K Warm Ambient',
        fixture: 'Cascading Raindrop & Sputnik',
        scale: '1.8m to 3.5m Custom Drop',
        ctaCatId: 'chandeliers'
      },
      dining: {
        badge: 'Focused Lumens & Warm Ambiance',
        tagline: 'Linear Sculptural Illumination',
        title: 'Dining & Kitchen Island',
        desc: 'Dining spaces demand glare-free horizontal lighting that illuminates dinnerware while preserving intimacy. Linear brass bubble clusters and diffused fluted cylinders enhance conversation.',
        img: getMediaUrl('space_dining.webp'),
        temp: '2700K to 3000K Warm Neutral',
        fixture: 'Linear Brass Glass Cluster',
        scale: '1.2m to 2.4m Length',
        ctaCatId: 'pendant-lights'
      },
      suite: {
        badge: 'Serene Indirect Luminescence',
        tagline: 'Restful Architecture',
        title: 'Master Suite & Salons',
        desc: 'Bedside pendants and recessed architectural perimeter coves eliminate direct overhead glare, producing a soft cocooning sanctuary for luxury hospitality and master residences.',
        img: getMediaUrl('space_suite.webp'),
        temp: '2200K to 2700K Candlelight Warm',
        fixture: 'Fluted Glass Bedside Drops',
        scale: '0.8m to 1.4m Balanced Drops',
        ctaCatId: 'wall-sconces'
      }
    };

    const tabs = document.querySelectorAll('.space-tab');
    const stageImg = document.getElementById('space-stage-img');
    const badgeEl = document.getElementById('space-badge');
    const taglineEl = document.getElementById('space-tagline');
    const titleEl = document.getElementById('space-title');
    const descEl = document.getElementById('space-desc');
    const tempEl = document.getElementById('space-temp');
    const fixtureEl = document.getElementById('space-fixture');
    const scaleEl = document.getElementById('space-scale');
    const ctaEl = document.getElementById('space-cta');

    if (!tabs.length || !stageImg) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-space');
        const data = spaceData[key];
        if (!data) return;

        // Active tab styling
        tabs.forEach(t => {
          t.className = 'space-tab px-6 py-3 rounded-full font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all duration-300 border border-midnight-line text-ash hover:text-snow hover:border-crimson/50';
        });
        tab.className = 'space-tab active px-6 py-3 rounded-full font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all duration-300 bg-crimson text-midnight shadow-[0_0_25px_rgba(200,169,110,0.35)]';

        // Image crossfade transition
        stageImg.style.opacity = '0';
        stageImg.style.transform = 'scale(1.04)';

        setTimeout(() => {
          stageImg.src = data.img;
          badgeEl.textContent = data.badge;
          taglineEl.textContent = data.tagline;
          titleEl.textContent = data.title;
          descEl.textContent = data.desc;
          tempEl.textContent = data.temp;
          fixtureEl.textContent = data.fixture;
          scaleEl.textContent = data.scale;

          stageImg.style.opacity = '1';
          stageImg.style.transform = 'scale(1)';
        }, 220);
      });
    });
  }
  initSpaceVisualizer();


  /* =========================================================
     12. BEFORE & AFTER LIGHTING COMPARISON SLIDER
     ========================================================= */
  function initComparisonSlider() {
    const box = document.getElementById('compare-slider-box');
    const wrapper = document.getElementById('compare-before-wrapper');
    const imgBefore = document.getElementById('compare-before-img');
    const imgAfter = document.getElementById('compare-after-img');
    const handle = document.getElementById('compare-handle');
    const beforeLabel = document.getElementById('transform-before-label');
    const afterLabel = document.getElementById('transform-after-label');
    const tabs = document.querySelectorAll('.transform-tab');

    if (!box || !wrapper || !imgBefore || !handle) return;

    const transformData = {
      living: {
        beforeImg: getMediaUrl('room_before.webp'),
        afterImg: getMediaUrl('room_after.webp'),
        beforeLabel: 'Before: Standard Cold Downlights',
        afterLabel: 'After: Lumina Bespoke Ambiance'
      },
      dining: {
        beforeImg: getMediaUrl('dining_before.webp'),
        afterImg: getMediaUrl('dining_after.webp'),
        beforeLabel: 'Before: Harsh Kitchen Fluorescents',
        afterLabel: 'After: Lumina Linear Amber Cluster'
      },
      suite: {
        beforeImg: getMediaUrl('bedroom_before.webp'),
        afterImg: getMediaUrl('bedroom_after.webp'),
        beforeLabel: 'Before: Blinding Overhead Glare',
        afterLabel: 'After: Lumina Bedside Drop Sanctuary'
      }
    };

    let isDragging = false;

    function syncImgWidth() {
      const boxWidth = box.offsetWidth;
      imgBefore.style.width = boxWidth + 'px';
    }
    syncImgWidth();
    window.addEventListener('resize', syncImgWidth);

    function updateSlider(clientX) {
      const rect = box.getBoundingClientRect();
      let offsetX = clientX - rect.left;

      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const pct = (offsetX / rect.width) * 100;
      wrapper.style.width = pct + '%';
      handle.style.left = pct + '%';
    }

    // Tab switching for 3 categories
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const key = tab.getAttribute('data-transform');
        const data = transformData[key];
        if (!data) return;

        tabs.forEach(t => {
          t.className = 'transform-tab px-6 py-3 rounded-full font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all duration-300 border border-midnight-line text-ash hover:text-snow hover:border-crimson/50';
        });
        tab.className = 'transform-tab active px-6 py-3 rounded-full font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all duration-300 bg-crimson text-midnight shadow-[0_0_25px_rgba(200,169,110,0.35)]';

        // Fade images during switch
        imgBefore.style.opacity = '0';
        if (imgAfter) imgAfter.style.opacity = '0';

        setTimeout(() => {
          imgBefore.src = data.beforeImg;
          if (imgAfter) imgAfter.src = data.afterImg;
          if (beforeLabel) beforeLabel.textContent = data.beforeLabel;
          if (afterLabel) afterLabel.textContent = data.afterLabel;

          // Reset handle to 50%
          wrapper.style.width = '50%';
          handle.style.left = '50%';
          syncImgWidth();

          imgBefore.style.opacity = '1';
          if (imgAfter) imgAfter.style.opacity = '1';
        }, 180);
      });
    });

    // Mouse handlers
    box.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch handlers for mobile/tablet
    box.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches && e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) updateSlider(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }
  initComparisonSlider();

  /* =========================================================
     13. ARCHITECTURAL LIGHTING STUDIO (DIMMER & COLOR TEMP)
     ========================================================= */
  function initLightingStudioController() {
    const dimmerLayer = document.getElementById('lighting-dimmer-layer');
    const tintLayer = document.getElementById('lighting-tint-layer');
    const panel = document.getElementById('lighting-studio-panel');
    const triggerBtn = document.getElementById('lighting-studio-trigger');
    const closeBtn = document.getElementById('lighting-studio-close');
    const navDesktopBtn = document.getElementById('studio-toggle-nav-desktop');
    const navMobileBtn = document.getElementById('studio-toggle-nav-mobile');
    const slider = document.getElementById('lighting-dimmer-slider');
    const dimmerValDisplay = document.getElementById('dimmer-percentage-display');
    const cctDisplay = document.getElementById('cct-display');
    const badge = document.getElementById('current-ambiance-badge');
    const cctButtons = document.querySelectorAll('.cct-btn');
    const sceneEveningBtn = document.getElementById('scene-evening-btn');
    const sceneGalleryBtn = document.getElementById('scene-gallery-btn');
    const sceneResetBtn = document.getElementById('lighting-reset-btn');

    if (!dimmerLayer || !tintLayer) return;

    // State
    let currentLumens = 100;
    let currentCCT = '2700';

    const cctData = {
      '2200': {
        bg: 'rgba(255, 140, 20, 0.28)',
        label: '2200K Candlelight Warm',
        short: '2200K'
      },
      '2700': {
        bg: 'rgba(255, 180, 107, 0.18)',
        label: '2700K Warm Amber',
        short: '2700K'
      },
      '4000': {
        bg: 'rgba(215, 235, 255, 0.14)',
        label: '4000K Pure Neutral',
        short: '4000K'
      }
    };

    function applyAmbiance(lumens, cct, updateInputs = true) {
      currentLumens = Math.max(20, Math.min(100, parseInt(lumens, 10)));
      currentCCT = String(cct);

      // Dimmer layer opacity: 100% -> 0; 20% -> 0.62
      const dimmerOpacity = ((100 - currentLumens) / 100) * 0.72;
      dimmerLayer.style.opacity = dimmerOpacity.toFixed(3);

      // CCT tint color & opacity
      const data = cctData[currentCCT] || cctData['2700'];
      tintLayer.style.backgroundColor = data.bg;

      // Update UI elements
      if (updateInputs && slider) {
        slider.value = currentLumens;
      }
      if (dimmerValDisplay) {
        dimmerValDisplay.textContent = `${currentLumens}% Lumens`;
      }
      if (cctDisplay) {
        cctDisplay.textContent = data.label;
      }
      if (badge) {
        badge.textContent = `${currentLumens}% · ${data.short}`;
      }

      // Update CCT active button
      cctButtons.forEach(btn => {
        if (btn.dataset.cct === currentCCT) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    // Toggle Panel
    function togglePanel(e) {
      if (e) e.stopPropagation();
      if (!panel) return;
      const isHidden = panel.classList.contains('hidden');
      if (isHidden) {
        panel.classList.remove('hidden');
        panel.classList.add('lighting-studio-pop');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('lighting-studio-pop');
      }
    }

    function closePanel() {
      if (panel && !panel.classList.contains('hidden')) {
        panel.classList.add('hidden');
        panel.classList.remove('lighting-studio-pop');
      }
    }

    if (triggerBtn) triggerBtn.addEventListener('click', togglePanel);
    if (navDesktopBtn) navDesktopBtn.addEventListener('click', togglePanel);
    if (navMobileBtn) navMobileBtn.addEventListener('click', togglePanel);
    if (closeBtn) closeBtn.addEventListener('click', closePanel);

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (panel && !panel.classList.contains('hidden')) {
        if (!panel.contains(e.target) && 
            (!triggerBtn || !triggerBtn.contains(e.target)) && 
            (!navDesktopBtn || !navDesktopBtn.contains(e.target)) &&
            (!navMobileBtn || !navMobileBtn.contains(e.target))) {
          closePanel();
        }
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel && !panel.classList.contains('hidden')) {
        closePanel();
      }
    });

    // Slider Event
    if (slider) {
      slider.addEventListener('input', (e) => {
        applyAmbiance(e.target.value, currentCCT, false);
      });
    }

    // CCT Button clicks
    cctButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cct = btn.dataset.cct;
        if (cct) applyAmbiance(currentLumens, cct, true);
      });
    });

    // Preset Scenes
    if (sceneEveningBtn) {
      sceneEveningBtn.addEventListener('click', () => {
        applyAmbiance(40, '2200', true);
      });
    }
    if (sceneGalleryBtn) {
      sceneGalleryBtn.addEventListener('click', () => {
        applyAmbiance(90, '4000', true);
      });
    }
    if (sceneResetBtn) {
      sceneResetBtn.addEventListener('click', () => {
        applyAmbiance(100, '2700', true);
      });
    }

    // Initial Ambiance setup
    applyAmbiance(100, '2700', true);
  }
  initLightingStudioController();

  /* =========================================================
     14. ANATOMY OF A MASTERPIECE — INTERACTIVE HOTSPOT TOUR
     ========================================================= */
  function initHotspotTour() {
    const fixtureImg = document.getElementById('tour-fixture-img');
    const pinsLayer = document.getElementById('hotspot-pins-layer');
    const modelTabs = document.querySelectorAll('.tour-model-tab');
    const modelTag = document.getElementById('tour-model-tag');
    const hotspotTag = document.getElementById('tour-hotspot-tag');
    const componentTitle = document.getElementById('tour-component-title');
    const componentDesc = document.getElementById('tour-component-desc');
    const specLabel1 = document.getElementById('tour-spec-label-1');
    const spec1 = document.getElementById('tour-spec-1');
    const specLabel2 = document.getElementById('tour-spec-label-2');
    const spec2 = document.getElementById('tour-spec-2');
    const specLabel3 = document.getElementById('tour-spec-label-3');
    const spec3 = document.getElementById('tour-spec-3');
    const stepCounter = document.getElementById('tour-step-counter');
    const prevBtn = document.getElementById('tour-prev-btn');
    const nextBtn = document.getElementById('tour-next-btn');
    const chipsContainer = document.getElementById('tour-chips-container');
    const detailContent = document.getElementById('tour-detail-content');

    if (!pinsLayer || !fixtureImg) return;

    const tourData = {
      chandelier: {
        name: "The Sovereign Grand Chandelier",
        modelTag: "Model: Lumina-CR-904",
        img: getMediaUrl("cat_chandeliers.webp"),
        hotspots: [
          {
            id: 1,
            x: "50%",
            y: "4%",
            chip: "01 Canopy",
            tag: "01 / STRUCTURAL ANCHOR",
            title: "Solid Naval Brass Ceiling Canopy & Load-Bearing Chain",
            desc: "Forged from high-tensile solid naval brass, rated for up to 120kg architectural suspension. Features an integrated concealed swiveling hook and damping vibration isolator for seismic stability.",
            specs: [
              { label: "Tensile Rating", val: "120kg Static Load" },
              { label: "Alloy Grade", val: "CuZn39Pb3 Naval Alloy" },
              { label: "Protective Barrier", val: "PVD Micro-Satin & Nano-Seal" }
            ]
          },
          {
            id: 2,
            x: "50%",
            y: "22%",
            chip: "02 Crown Swags",
            tag: "02 / UPPER TIER CROWN",
            title: "Hand-Formed Crystal Bobeches & Cascading Swags",
            desc: "Each crystal strand is meticulously threaded by master artisans using micro-gage stainless steel safety cotter pins, ensuring perfectly arched catenary draping without mechanical stress.",
            specs: [
              { label: "Strand Count", val: "48 Calibrated Crystal Swags" },
              { label: "Tolerance", val: "±0.5mm Catenary Balance" },
              { label: "Artisan Time", val: "14 Hours Hand-Threading" }
            ]
          },
          {
            id: 3,
            x: "19%",
            y: "56%",
            chip: "03 Brass Armature",
            tag: "03 / SCROLLWORK ARMATURE",
            title: "Hand-Chased Brass Sconce Arms & Candle Sleeves",
            desc: "Curvilinear dual-scroll arms cast using traditional investment sand casting, then hand-chased with fine chisels to produce antique architectural contours before receiving a brushed PVD luster.",
            specs: [
              { label: "Casting Method", val: "Heavy Investment Sand Cast" },
              { label: "Wall Thickness", val: "3.2mm Solid Wall" },
              { label: "Wiring System", val: "Heat-Resistant Teflon Silver Wire" }
            ]
          },
          {
            id: 4,
            x: "50%",
            y: "72%",
            chip: "04 Crystal Basket",
            tag: "04 / OPTICAL CORE",
            title: "32-Facet Diamond-Ground K9 Crystal Basket",
            desc: "Over 1,200 individual optical K9 prisms arranged in concentric tiered rows. Every facet is cold-worked on diamond wheels to create intense prismatic refraction with 99.8% light transmittance.",
            specs: [
              { label: "Prism Count", val: "1,240 Calibrated Prisms" },
              { label: "Clarity Rating", val: "Zero Air Inclusions (VVS Grade)" },
              { label: "Refractive Index", val: "1.516 Nd Prismatic Dispersion" }
            ]
          },
          {
            id: 5,
            x: "50%",
            y: "92%",
            chip: "05 Crystal Finial",
            tag: "05 / TERMINAL ACCENT",
            title: "Faceted Crystal Pendeloque Centerpiece",
            desc: "A solid 80mm hand-beveled teardrop crystal pendant anchoring the chandelier's focal center of gravity, capturing downward photometrics and dispersing them into soft ambient floor caustics.",
            specs: [
              { label: "Component Mass", val: "650g Solid Optical Glass" },
              { label: "Bevel Geometry", val: "64 Dual-Angle Facets" },
              { label: "Cut Profile", val: "Traditional French Pendeloque" }
            ]
          }
        ]
      },
      sconce: {
        name: "The Aurelia Fluted Sconce",
        modelTag: "Model: Lumina-SC-208",
        img: getMediaUrl("cat_sconces.webp"),
        hotspots: [
          {
            id: 1,
            x: "52%",
            y: "28%",
            chip: "01 Backplate",
            tag: "01 / MOUNTING PLANE",
            title: "Monolithic Brushed Brass Backplate",
            desc: "CNC-milled from 8mm thick solid brass plate with micro-chamfered edges, creating a floating shadow gap against Venetian plaster or marble walls with completely invisible mounting hardware.",
            specs: [
              { label: "Plate Thickness", val: "8mm Solid Billet Brass" },
              { label: "Mounting", val: "Dual Hidden Keyhole Brackets" },
              { label: "Finish Treatment", val: "Directional Hairline Satin Brass" }
            ]
          },
          {
            id: 2,
            x: "50%",
            y: "43%",
            chip: "02 Fluted Glass",
            tag: "02 / OPTICAL DIFFUSION",
            title: "Mouth-Blown Fluted Borosilicate Cylinder",
            desc: "Individually mouth-blown into ribbed steel molds. The vertical parabolic flutes refract interior LED filaments into continuous vertical glare-free light ribbons.",
            specs: [
              { label: "Glass Chemistry", val: "Heavy Borosilicate Tube" },
              { label: "Wall Thickness", val: "4.5mm Thermal-Shock Glass" },
              { label: "Glaze Finish", val: "Hydrophobic Anti-Static Treatment" }
            ]
          },
          {
            id: 3,
            x: "50%",
            y: "54%",
            chip: "03 LED Core",
            tag: "03 / PHOTOMETRIC ENGINE",
            title: "Linear 98+ CRI Lumiled Architectural Engine",
            desc: "Custom 360-degree cylindrical LED board radiating a true continuous spectrum (R9 > 95), bringing out the rich warmth of wood, skin tones, and stone textures.",
            specs: [
              { label: "Color Rendering", val: "98.4 CRI (Museum Grade)" },
              { label: "Color Temp", val: "2700K Warm Dim Compatible" },
              { label: "L70 Lifespan", val: "60,000 Hours Continuous" }
            ]
          },
          {
            id: 4,
            x: "50%",
            y: "71%",
            chip: "04 Precision Joinery",
            tag: "04 / PRECISION JOINERY",
            title: "Threaded Machined Brass Retention Collar",
            desc: "Knurled retaining ring turned on precision swiss-lathes, allowing tool-less relamping and maintenance with high-temperature silicone vibration dampening O-rings.",
            specs: [
              { label: "Thread Pitch", val: "0.75mm Fine Metric Thread" },
              { label: "Gasket Seal", val: "Fluorosilicone O-Ring Seal" },
              { label: "Ingress Rating", val: "IP44 Splash & Dust Proof" }
            ]
          }
        ]
      }
    };

    let activeModel = 'chandelier';
    let activeHotspotIndex = 0;

    function renderTour(modelKey, initialIndex = 0) {
      activeModel = modelKey;
      activeHotspotIndex = initialIndex;
      const data = tourData[activeModel];
      if (!data) return;

      // Update image
      fixtureImg.style.opacity = '0';
      setTimeout(() => {
        fixtureImg.src = data.img;
        fixtureImg.alt = data.name;
        fixtureImg.style.opacity = '1';
      }, 150);

      if (modelTag) modelTag.textContent = data.modelTag;

      // Render Pins
      pinsLayer.innerHTML = '';
      data.hotspots.forEach((spot, idx) => {
        const pin = document.createElement('button');
        pin.className = 'hotspot-pin group';
        pin.style.left = spot.x;
        pin.style.top = spot.y;
        pin.dataset.index = idx;
        pin.setAttribute('aria-label', spot.title);

        pin.innerHTML = `
          <div class="reticle-container">
            <!-- Dual Sonar Radar Waves -->
            <span class="sonar-wave sonar-wave-1"></span>
            <span class="sonar-wave sonar-wave-2"></span>

            <!-- Outer Notched Aperture Ring -->
            <span class="reticle-aperture"></span>

            <!-- Architectural Crosshair Ticks -->
            <span class="crosshair-tick tick-top"></span>
            <span class="crosshair-tick tick-bottom"></span>
            <span class="crosshair-tick tick-left"></span>
            <span class="crosshair-tick tick-right"></span>

            <!-- Pin Core -->
            <span class="pin-core">
              <span class="font-mono font-bold text-[10px] leading-none">0${idx + 1}</span>
            </span>

            <!-- Coordinate Tag -->
            <span class="reticle-coord">P-0${idx + 1}</span>
          </div>

          <!-- HUD Tooltip -->
          <div class="hotspot-tooltip">
            <div class="hud-tooltip-inner">
              <span class="hud-label">CAD // LOC 0${idx + 1}</span>
              <span class="hud-title">${spot.chip}</span>
            </div>
          </div>
        `;

        pin.addEventListener('click', (e) => {
          e.stopPropagation();
          selectHotspot(idx);
        });

        pinsLayer.appendChild(pin);
      });

      // Render Quick Chips
      if (chipsContainer) {
        chipsContainer.innerHTML = '';
        data.hotspots.forEach((spot, idx) => {
          const chip = document.createElement('button');
          chip.className = 'tour-chip px-3 py-1.5 rounded-lg border border-white/10 text-ash hover:text-snow hover:border-crimson/50 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer';
          chip.textContent = spot.chip;
          chip.dataset.index = idx;

          chip.addEventListener('click', () => {
            selectHotspot(idx);
          });

          chipsContainer.appendChild(chip);
        });
      }

      selectHotspot(activeHotspotIndex);
    }

    function selectHotspot(index) {
      const data = tourData[activeModel];
      if (!data || !data.hotspots[index]) return;
      activeHotspotIndex = index;
      const spot = data.hotspots[index];

      // Update active pin
      const pins = pinsLayer.querySelectorAll('.hotspot-pin');
      pins.forEach((p, idx) => {
        if (idx === index) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });

      // Update active chip
      if (chipsContainer) {
        const chips = chipsContainer.querySelectorAll('.tour-chip');
        chips.forEach((c, idx) => {
          if (idx === index) {
            c.className = 'tour-chip active px-3 py-1.5 rounded-lg border border-crimson bg-crimson/20 text-crimson font-mono text-[10px] uppercase tracking-wider font-semibold shadow-[0_0_12px_rgba(200,169,110,0.2)] cursor-pointer';
          } else {
            c.className = 'tour-chip px-3 py-1.5 rounded-lg border border-white/10 text-ash hover:text-snow hover:border-crimson/50 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer';
          }
        });
      }

      // Update counter
      if (stepCounter) {
        stepCounter.textContent = `${index + 1} / ${data.hotspots.length}`;
      }

      // Animate card content
      if (detailContent) {
        detailContent.style.opacity = '0.3';
        detailContent.style.transform = 'translateY(4px)';
        setTimeout(() => {
          if (hotspotTag) hotspotTag.textContent = spot.tag;
          if (componentTitle) componentTitle.textContent = spot.title;
          if (componentDesc) componentDesc.textContent = spot.desc;

          if (spot.specs[0]) {
            if (specLabel1) specLabel1.textContent = spot.specs[0].label;
            if (spec1) spec1.textContent = spot.specs[0].val;
          }
          if (spot.specs[1]) {
            if (specLabel2) specLabel2.textContent = spot.specs[1].label;
            if (spec2) spec2.textContent = spot.specs[1].val;
          }
          if (spot.specs[2]) {
            if (specLabel3) specLabel3.textContent = spot.specs[2].label;
            if (spec3) spec3.textContent = spot.specs[2].val;
          }

          detailContent.style.opacity = '1';
          detailContent.style.transform = 'translateY(0)';
        }, 120);
      }
    }

    // Prev / Next controls
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        const data = tourData[activeModel];
        if (!data) return;
        const newIndex = (activeHotspotIndex - 1 + data.hotspots.length) % data.hotspots.length;
        selectHotspot(newIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const data = tourData[activeModel];
        if (!data) return;
        const newIndex = (activeHotspotIndex + 1) % data.hotspots.length;
        selectHotspot(newIndex);
      });
    }

    // Model Tab click handlers
    modelTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const model = tab.dataset.model;
        if (!model || model === activeModel) return;

        modelTabs.forEach(t => {
          t.className = 'tour-model-tab px-6 py-3 rounded-full font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all duration-300 border border-midnight-line text-ash hover:text-snow hover:border-crimson/50 cursor-pointer';
        });
        tab.className = 'tour-model-tab active px-6 py-3 rounded-full font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all duration-300 bg-crimson text-midnight shadow-[0_0_25px_rgba(200,169,110,0.35)] cursor-pointer';

        renderTour(model, 0);
      });
    });

    // Initial render
    renderTour('chandelier', 0);
  }
  initHotspotTour();

  /* =========================================================
     15. TOP BAR SCROLLSPY & ACTIVE SECTION HIGHLIGHTING
     ========================================================= */
  function initScrollSpy() {
    const navTabs = document.querySelectorAll('.nav-tab');
    if (!navTabs.length) return;

    // Track sections matching nav link hrefs
    const sectionConfig = [
      { id: 'collections', el: document.getElementById('collections') },
      { id: 'spaces', el: document.getElementById('spaces') },
      { id: 'transformation', el: document.getElementById('transformation') },
      { id: 'craftsmanship', el: document.getElementById('craftsmanship') },
      { id: 'story', el: document.getElementById('story') },
      { id: 'testimonials', el: document.getElementById('testimonials') },
      { id: 'inquiry', el: document.getElementById('inquiry') }
    ].filter(item => item.el !== null);

    let lastActiveTabId = undefined;
    function setActiveTab(targetId) {
      if (lastActiveTabId === targetId) return;
      lastActiveTabId = targetId;

      navTabs.forEach(tab => {
        const href = tab.getAttribute('href');
        if (targetId && href === `#${targetId}`) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }

    function updateActiveSection() {
      // Near the top (hero), no tab is active
      if (window.scrollY < 240) {
        setActiveTab(null);
        return;
      }

      // Check if user has scrolled to the bottom
      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 100) {
        setActiveTab('inquiry');
        return;
      }

      const viewportOffset = window.scrollY + window.innerHeight * 0.35;
      let activeId = null;

      for (let i = 0; i < sectionConfig.length; i++) {
        const item = sectionConfig[i];
        const top = item.el.offsetTop;
        let bottom = top + item.el.offsetHeight;


        if (viewportOffset >= top && viewportOffset < bottom) {
          activeId = item.id;
          break;
        }
      }

      setActiveTab(activeId);
    }

    // Direct click feedback
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const href = tab.getAttribute('href');
        if (href && href.startsWith('#')) {
          const targetId = href.substring(1);
          setActiveTab(targetId);
        }
      });
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveSection();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // Initial check
    updateActiveSection();
  }
  initScrollSpy();

  /* =========================================================
     16. SCROLL PROGRESS INDICATOR
     ========================================================= */
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress-bar');
    if (!progressBar) return;

    function updateProgress() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = Math.min(Math.max(window.scrollY / scrollHeight, 0), 1);
      progressBar.style.transform = `scaleX(${progress})`;
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateProgress();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', updateProgress, { passive: true });
    updateProgress();
  }
  initScrollProgress();

  /* =========================================================
     17. ADAPTIVE GLASS ISLAND NAVBAR (Scroll Compression & Rim Glow)
     ========================================================= */
  function initAdaptiveNavbar() {
    const navContainer = document.getElementById('nav-island-container');
    const navIsland = document.getElementById('nav-island');
    if (!navIsland) return;

    let isScrolled = false;
    function updateNavbar() {
      const scrolled = window.scrollY > 80;
      if (scrolled !== isScrolled) {
        isScrolled = scrolled;
        if (isScrolled) {
          navIsland.classList.add('scrolled');
          if (navContainer) navContainer.classList.add('scrolled');
        } else {
          navIsland.classList.remove('scrolled');
          if (navContainer) navContainer.classList.remove('scrolled');
        }
      }
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateNavbar();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    updateNavbar();
  }
  initAdaptiveNavbar();

  /* =========================================================
     18. PRISMATIC CRYSTAL CAUSTIC SPARKLE CURSOR
     ========================================================= */
  function initCrystalCaustics() {
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let lastSparkTime = 0;
    const SPARK_COOLDOWN = 110; // ms
    const MAX_ACTIVE_SPARKS = 8;

    function spawnSpark(x, y) {
      if (document.querySelectorAll('.crystal-spark').length >= MAX_ACTIVE_SPARKS) return;

      const spark = document.createElement('span');
      spark.className = 'crystal-spark';
      spark.textContent = '✦';

      // Random displacement vector
      const angle = Math.random() * Math.PI * 2;
      const distance = 12 + Math.random() * 20;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;
      const rot = (Math.random() - 0.5) * 60;

      spark.style.left = `${x}px`;
      spark.style.top = `${y}px`;
      spark.style.setProperty('--dx', `${dx.toFixed(1)}px`);
      spark.style.setProperty('--dy', `${dy.toFixed(1)}px`);
      spark.style.setProperty('--rot', `${rot.toFixed(1)}deg`);

      document.body.appendChild(spark);

      spark.addEventListener('animationend', () => {
        spark.remove();
      }, { once: true });
    }

    const interactiveSelector = 'button, a, .card-hover-glow, .tour-chip, .space-tab, .transform-tab, .testimonial-glass-card, .hotspot-pin, input, textarea, select';

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(interactiveSelector);
      if (target) {
        const now = performance.now();
        if (now - lastSparkTime > SPARK_COOLDOWN) {
          lastSparkTime = now;
          spawnSpark(e.clientX, e.clientY);
        }
      }
    }, { passive: true });

    document.addEventListener('mousemove', (e) => {
      const target = e.target.closest(interactiveSelector);
      if (target) {
        const now = performance.now();
        if (now - lastSparkTime > SPARK_COOLDOWN) {
          lastSparkTime = now;
          spawnSpark(e.clientX, e.clientY);
        }
      }
    }, { passive: true });
  }
  initCrystalCaustics();

  /* =========================================================
     INQUIRY FORM — Supabase Database Submission
     ========================================================= */
  const inquiryForm = document.getElementById('inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = inquiryForm.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn.innerHTML;

      // Gather form data
      const name = (inquiryForm.querySelector('#inquiry-name')?.value || '').trim();
      const email = (inquiryForm.querySelector('#inquiry-email')?.value || '').trim();
      const interest = (inquiryForm.querySelector('input[name="interest"]:checked')?.value || 'residential');
      const details = (inquiryForm.querySelector('#inquiry-details')?.value || '').trim();

      // Basic validation
      if (!name || !email) {
        showFormFeedback(inquiryForm, 'error', 'Please fill in your name and email.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormFeedback(inquiryForm, 'error', 'Please enter a valid email address.');
        return;
      }

      // Disable button & show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg>
        Sending...
      `;

      try {
        const payload = {
          name,
          email,
          interest,
          details,
          source: 'website-inquiry-form'
        };

        if (supabaseClient) {
          const { error } = await supabaseClient.from('inquiries').insert([payload]);
          if (error) throw error;
        } else {
          // Direct REST API fallback
          const res = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify([payload])
          });
          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Inquiry submission failed: ${errText}`);
          }
        }

        // Success
        showFormFeedback(inquiryForm, 'success', 'Thank you! Our design team will reach out within 24 hours.');
        inquiryForm.reset();

      } catch (err) {
        console.error('Inquiry submission error:', err);
        showFormFeedback(inquiryForm, 'error', 'Something went wrong. Please try WhatsApp or call us directly.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHTML;
      }
    });
  }

  /**
   * Show inline feedback message below the form.
   * @param {HTMLFormElement} form
   * @param {'success'|'error'} type
   * @param {string} message
   */
  function showFormFeedback(form, type, message) {
    // Remove any existing feedback
    const existing = form.parentElement.querySelector('.form-feedback');
    if (existing) existing.remove();

    const el = document.createElement('div');
    el.className = 'form-feedback';
    el.style.cssText = `
      margin-top: 1rem;
      padding: 1rem 1.25rem;
      border-radius: 0.75rem;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      animation: fadeInUp 0.4s ease-out;
    `;

    if (type === 'success') {
      el.style.background = 'rgba(34, 197, 94, 0.1)';
      el.style.border = '1px solid rgba(34, 197, 94, 0.3)';
      el.style.color = '#4ade80';
      el.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.1rem;">check_circle</span> ${message}`;
    } else {
      el.style.background = 'rgba(239, 68, 68, 0.1)';
      el.style.border = '1px solid rgba(239, 68, 68, 0.3)';
      el.style.color = '#f87171';
      el.innerHTML = `<span class="material-symbols-outlined" style="font-size:1.1rem;">error</span> ${message}`;
    }

    form.insertAdjacentElement('afterend', el);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s ease-out';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 400);
    }, 8000);
  }

});


