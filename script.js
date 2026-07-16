/* =========================================================
   LUMINA &mdash; The Designer Light Store | script.js
   ========================================================= */

'use strict';

/* ---- Utility: debounce ---- */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* =========================================================
   1. NAVBAR &mdash; Scroll & Hamburger
   ========================================================= */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = mobileNav ? mobileNav.querySelectorAll('a') : [];

  // Scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Hamburger toggle
  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      hamburgerBtn.classList.toggle('open', isOpen);
      hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav on link click
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburgerBtn.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', debounce(updateActiveNav, 50), { passive: true });
  updateActiveNav();
})();

/* =========================================================
   2. HERO PARALLAX + PARTICLES
   ========================================================= */
(function initHero() {
  const heroBg = document.getElementById('hero-bg');
  const particlesContainer = document.getElementById('hero-particles');

  // Parallax on scroll
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight * 1.2) {
        heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.3}px)`;
      }
    }, { passive: true });
  }

  // Generate floating particles
  if (particlesContainer) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      const size = Math.random() * 3 + 1;
      const left = Math.random() * 100;
      const duration = Math.random() * 12 + 8;
      const delay = Math.random() * 10;
      const opacity = Math.random() * 0.4 + 0.1;

      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${opacity};
      `;

      particlesContainer.appendChild(particle);
    }
  }
})();

  // Render categories on the homepage
  function renderCategoryGrid() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;
    
    const data = window.PRODUCT_DB;
    if (!data || !data.categories) return;
  
    grid.innerHTML = data.categories.map(cat => {
      // Determine category data attribute string (used by CSS animations or sorting if needed)
      const catTypeAttr = cat.categoryType || 'indoor';
      
      return `
        <article class="product-card reveal" data-category="${catTypeAttr}" data-name="${cat.name}">
          <div class="product-card-img">
            <img src="images/${cat.img || 'placeholder.png'}" alt="${cat.name}" loading="lazy" />
            <div class="product-card-overlay">
              <span class="product-card-overlay-btn">Enquire Now</span>
            </div>
          </div>
          <div class="product-card-info">
            <p class="product-card-tag">${cat.tag || 'Collection'}</p>
            <h3 class="product-card-name">${cat.name}</h3>
            <p class="product-card-desc">${cat.shortDesc || cat.subtitle}</p>
          </div>
        </article>
      `;
    }).join('');
  
    // Wire product cards to the listing popup
    grid.querySelectorAll('.product-card').forEach(card => {
      const name = card.dataset.name;
      card.addEventListener('click', () => openProductListing(name));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProductListing(name); }
      });
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Browse ${name}`);
    });
  }
  
  // Call render on load before scroll reveal
  renderCategoryGrid();

/* =========================================================
   3. SCROLL REVEAL
   ========================================================= */
(function initScrollReveal() {
  // Exclude hero elements &mdash; they animate via CSS keyframes on load
  const revealEls = Array.from(
    document.querySelectorAll('.reveal, [data-reveal]')
  ).filter(el => !el.closest('#hero'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.revealDelay) || idx * 50;
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, Math.min(delay, 250));
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.07,
    rootMargin: '0px 0px 20px 0px'
  });

  revealEls.forEach((el, idx) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    el.dataset.revealDelay = idx * 50;
    observer.observe(el);
  });
})();

/* =========================================================
   4. COLLECTIONS FILTER
   ========================================================= */
(function initFilter() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.product-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;

      cards.forEach(card => {
        const category = card.dataset.category;
        const matches = filter === 'all' || category === filter;

        if (matches) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 350);
        }
      });
    });
  });

  // Set transition on cards
  cards.forEach(card => {
    card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
  });
})();

/* =========================================================
   5. PRODUCT MODAL
   ========================================================= */
const modalBackdrop = document.getElementById('modal-backdrop');
const modalImg   = document.getElementById('modal-img');
const modalTag   = document.getElementById('modal-tag');
const modalTitle = document.getElementById('modal-title');
const modalDesc  = document.getElementById('modal-desc');
const modalClose = document.getElementById('modal-close');

function openModal(card) {
  const name = card.dataset.name;
  const desc = card.dataset.desc;
  const img  = card.dataset.img;
  const tag  = card.dataset.tag;
  if (modalImg)   { modalImg.src = img; modalImg.alt = name; }
  if (modalTag)   modalTag.textContent  = tag;
  if (modalTitle) modalTitle.textContent = name;
  if (modalDesc) modalDesc.textContent = desc;

  if (modalBackdrop) {
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }
}

function closeModal() {
  if (modalBackdrop) {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }
}


// ---- Close events for the modal ----
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
}

/* =========================================================
   5b. DYNAMIC PRODUCT LISTING POPUP
   Catalog data is loaded from catalog.js (window.LUMINA_CATALOG).
   To update images: add files to images/<category>/ and run update-catalog.ps1
   ========================================================= */

/* Render a listing card — image path is built from the category folder + product img filename */
function renderCard(p, catData) {
  const folder   = catData ? catData.id : 'chandeliers';
  const imgFile  = p.img || 'placeholder.png';
  const imgSrc   = `images/${folder}/${imgFile}`;

  const specIcons = ['fa-ruler-combined', 'fa-layer-group', 'fa-lightbulb'];
  const badgeHTML = p.badge
    ? `<div class="listing-card-badge ${p.badgeClass === 'new' ? 'new' : ''}"${p.badgeClass === 'premium' ? ' style="background:linear-gradient(135deg,#9b59b6,#6c3483)"' : ''}>${p.badge}</div>`
    : '';
  const tagsHTML  = p.tags.map(t => `<span class="ltag">${t}</span>`).join('');
  const specsHTML = p.specs.map((s, i) =>
    `<div class="lspec"><i class="fa-solid ${specIcons[i % 3]}"></i> ${s}</div>`
  ).join('');

  return `
    <div class="listing-card">
      <div class="listing-card-img-wrap">
        <img src="${imgSrc}" alt="${p.name}" class="listing-card-img" loading="lazy" />
        ${badgeHTML}
      </div>
      <div class="listing-card-body">
        <div class="listing-card-tags">${tagsHTML}</div>
        <h3 class="listing-card-name">${p.name}</h3>
        <p class="listing-card-desc">${p.desc}</p>
        <div class="listing-card-specs">${specsHTML}</div>
        <div class="listing-card-cta">
          <a href="#contact" class="btn-primary" onclick="closeProductListing()" style="font-size:0.82rem;padding:0.65rem 1.4rem;">
            <span><i class="fa-solid fa-paper-plane"></i> Enquire Now</span>
          </a>
          <a href="tel:+919452088014" class="btn-outline" style="font-size:0.82rem;padding:0.65rem 1.2rem;">
            <i class="fa-solid fa-phone"></i> Call
          </a>
        </div>
      </div>
    </div>`;
}

/* Open the dynamic listing popup for any category */
const productListing  = document.getElementById('product-listing');
const listingTitleEl  = document.getElementById('listing-title');
const listingSubEl    = document.getElementById('listing-subtitle');
const listingGrid     = document.getElementById('listing-grid');
const listingCloseBtn = document.getElementById('listing-close');

function openProductListing(categoryName) {
  if (!productListing) return;
  const data = window.PRODUCT_DB;
  if (!data) {
    console.error("PRODUCT_DB not loaded. Make sure products.js is included.");
    return;
  }

  const catData = data.categories.find(c => c.name === categoryName);
  if (!catData) return;

  const catProducts = data.products.filter(p => p.categoryId === catData.id);

  if (listingTitleEl) listingTitleEl.textContent = categoryName;
  if (listingSubEl)   listingSubEl.textContent   = catData.subtitle;
  if (listingGrid)    listingGrid.innerHTML       = catProducts.map((p) => renderCard(p, catData)).join('');
  
  productListing.classList.add('open');
  productListing.scrollTop = 0;
  document.body.style.overflow = 'hidden';
  productListing.setAttribute('aria-hidden', 'false');
}

function closeProductListing() {
  if (productListing) {
    productListing.classList.remove('open');
    document.body.style.overflow = '';
    productListing.setAttribute('aria-hidden', 'true');
  }
}

if (listingCloseBtn) listingCloseBtn.addEventListener('click', closeProductListing);
if (productListing) {
  productListing.addEventListener('click', (e) => {
    if (e.target === productListing) closeProductListing();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeModal(); closeProductListing(); }
});



/* =========================================================
   6. TESTIMONIALS SLIDER
   ========================================================= */
window.initTestimonials = function initTestimonials() {
  const track = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('testimonials-prev');
  const nextBtn = document.getElementById('testimonials-next');
  const dotsContainer = document.getElementById('testimonials-dots');

  if (!track) return;

  const cards = track.querySelectorAll('.testimonial-card');
  let current = 0;
  let autoTimer;

  // Determine visible count
  function getVisible() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function totalSlides() {
    return Math.ceil(cards.length / getVisible());
  }

  // Build dots
  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides(); i++) {
      const dot = document.createElement('button');
      dot.classList.add('testimonials-dot');
      if (i === current) dot.classList.add('active');
      dot.setAttribute('aria-label', `Go to testimonial group ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    const dots = dotsContainer ? dotsContainer.querySelectorAll('.testimonials-dot') : [];
    dots.forEach((dot, i) => dot.classList.toggle('active', i === current));
  }

  function updateActive() {
    const visible = getVisible();
    cards.forEach((card, i) => {
      card.classList.toggle('active', Math.floor(i / visible) === current);
    });
  }

  function goTo(index) {
    const slides = totalSlides();
    current = ((index % slides) + slides) % slides;
    const visible = getVisible();
    const cardWidth = cards[0] ? cards[0].offsetWidth + 24 : 0; // 24 = gap
    track.style.transform = `translateX(-${current * visible * cardWidth}px)`;
    updateDots();
    updateActive();
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 4500);
  }

  // Swipe support
  let touchStartX = 0;
  if (track) {
    track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 40) {
        goTo(diff > 0 ? current + 1 : current - 1);
        resetAuto();
      }
    });
  }

  window.addEventListener('resize', debounce(() => {
    buildDots();
    goTo(0);
  }, 300));

  buildDots();
  updateActive();
  resetAuto();
};
window.initTestimonials();

/* =========================================================
   7. FAQ ACCORDION
   ========================================================= */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });

    question.setAttribute('role', 'button');
    question.setAttribute('tabindex', '0');
    question.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        question.click();
      }
    });
  });
})();

/* =========================================================
   8. CONTACT FORM &mdash; Client-side validation
   ========================================================= */
(function initForm() {
  const form = document.getElementById('inquiry-form');
  const nameInput = document.getElementById('form-name');
  const submitBtn = document.getElementById('form-submit-btn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Stop native submission

    const phoneInput = document.getElementById('form-phone');
    const emailInput = document.getElementById('form-email');

    // Helper to show error
    const showError = (input, msgElementId, errorText) => {
      input.focus();
      input.style.borderColor = 'rgba(255, 80, 80, 0.7)';
      const msgEl = document.getElementById(msgElementId);
      if (msgEl) {
        msgEl.textContent = errorText;
        msgEl.style.display = 'block';
      }
      setTimeout(() => { 
        input.style.borderColor = ''; 
        if (msgEl) msgEl.style.display = 'none';
      }, 3000);
    };

    // Name validation
    if (nameInput && !nameInput.value.trim()) {
      showError(nameInput, 'name-error', 'Please enter your name.');
      return;
    }

    // Phone validation (Optional but must be valid format if provided)
    if (phoneInput && phoneInput.value.trim()) {
      const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
      if (!phoneRegex.test(phoneInput.value.trim())) {
        showError(phoneInput, 'phone-error', 'Please enter a valid phone number.');
        return;
      }
    }

    // Email validation (Optional but must be valid format if provided)
    if (emailInput && emailInput.value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        showError(emailInput, 'email-error', 'Please enter a valid email address.');
        return;
      }
    }

    // Gather values
    const name = nameInput ? nameInput.value : '';
    const phone = phoneInput ? phoneInput.value : '';
    const email = emailInput ? emailInput.value : '';
    const product = document.getElementById('form-product') ? document.getElementById('form-product').value : '';
    const msg = document.getElementById('form-message') ? document.getElementById('form-message').value : '';

    // Construct reliable mailto string
    const subject = `Lumina Inquiry from ${name} - ${product}`;
    const body = `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nProduct Interest: ${product}\n\nMessage:\n${msg}`;
    
    const mailtoLink = `mailto:shikhar.gupta2096@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;

    // Visual feedback
    if (submitBtn) {
      const span = submitBtn.querySelector('span');
      if (span) span.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mail App Opened!';
      submitBtn.style.background = 'linear-gradient(135deg, #4CAF50, #2e7d32)';
      setTimeout(() => {
        if (span) span.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Inquiry';
        submitBtn.style.background = '';
      }, 5000);
    }
    
    // Clear the form
    form.reset();
  });

  // Remove error highlight on input
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      nameInput.style.borderColor = '';
    });
  }
})();

/* =========================================================
   9. SMOOTH SCROLL for anchor links
   ========================================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // navbar height
      const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    }
  });
});

/* =========================================================
   10. INITIAL PAGE LOAD ANIMATION
   ========================================================= */
window.addEventListener('load', () => {
  document.documentElement.classList.add('page-loaded');
});

/* =========================================================
   11. GOOGLE REVIEWS INTEGRATION
   ========================================================= */
(async function initGoogleReviews() {
  try {
    const response = await fetch('reviews.json');
    if (!response.ok) return;
    const data = await response.json();
    
    // Update badge rating and count
    const badgeRating = document.querySelector('#google-rating-badge .badge-rating');
    const badgeCount = document.querySelector('#google-rating-badge .badge-count');
    if (badgeRating && data.overall_rating) {
      badgeRating.textContent = Number(data.overall_rating).toFixed(1);
    }
    if (badgeCount && data.total_reviews) {
      badgeCount.textContent = `${data.total_reviews} Google Reviews`;
    }

    // If there are actual text reviews, replace the hardcoded ones
    if (data.reviews && data.reviews.length > 0) {
      const track = document.getElementById('testimonials-track');
      if (!track) return;
      
      let html = '';
      data.reviews.forEach((r, index) => {
        const activeClass = index === 0 ? 'active' : '';
        const photoHtml = r.photo_url 
          ? `<div class="testimonial-avatar"><img src="${r.photo_url}" alt="${r.author}" /></div>`
          : `<div class="testimonial-avatar">${r.author.charAt(0)}</div>`;
          
        const starsHtml = '&#9733;'.repeat(Math.round(r.rating));
          
        html += `
          <div class="testimonial-card ${activeClass}">
            <div class="testimonial-quote">"</div>
            <p class="testimonial-text">${r.text}</p>
            <div class="testimonial-author">
              ${photoHtml}
              <div>
                <div class="testimonial-name">${r.author}</div>
                <div class="testimonial-location">${r.date}</div>
                <div class="testimonial-stars">${starsHtml}</div>
              </div>
            </div>
          </div>
        `;
      });
      
      track.innerHTML = html;
      
      // Re-initialize slider logic for the newly injected DOM nodes
      if (typeof window.initTestimonials === 'function') {
        window.initTestimonials();
      }
    }
  } catch (e) {
    console.log('No dynamic reviews loaded, falling back to defaults.');
  }
})();

