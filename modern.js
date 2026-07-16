document.addEventListener('DOMContentLoaded', async () => {

  // 1. Fetch Data
  let data;
  try {
    const response = await fetch('products.json?v=' + new Date().getTime());
    data = await response.json();
  } catch(e) {
    console.error("Failed to load products.json. Ensure you are running a local web server (not file://).", e);
    return;
  }

  // 2. Render Bento Grid
  const grid = document.getElementById('bento-grid');
  if (grid && data.categories) {
    // 12-column grid layout pattern
    const layoutClasses = ['col-span-8', 'col-span-4', 'col-span-4', 'col-span-4', 'col-span-4', 'col-span-6', 'col-span-6'];
    
    grid.innerHTML = data.categories.map((cat, index) => {
      const layoutClass = layoutClasses[index % layoutClasses.length];
      
      return `
        <div class="premium-card ${layoutClass} reveal" data-cat-id="${cat.id}">
          <img src="images/${cat.img || 'placeholder.png'}" class="card-img" alt="${cat.name}">
          <div class="card-content">
            <span class="card-tag">${cat.tag || 'Collection'}</span>
            <h3 class="card-title">${cat.name}</h3>
            <p class="card-desc">${cat.shortDesc || cat.subtitle}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Scroll Reveal Animation (Intersection Observer)
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Optional: stop observing once revealed
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. Hero Parallax
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroBg.style.transform = `translateY(${scrollY * 0.4}px) scale(1.05)`;
    });
  }

  // 5. Modal Logic
  const modalOverlay = document.getElementById('product-modal');
  const modalClose = document.getElementById('modal-close');
  const modalBody = document.getElementById('modal-body');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');

  // Re-select cards after they are rendered
  const cards = document.querySelectorAll('.premium-card[data-cat-id]');
  
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.getAttribute('data-cat-id');
      const category = data.categories.find(c => c.id === catId);
      if (!category) return;
      
      // Filter products
      const products = data.products.filter(p => p.categoryId === catId);
      
      // Update Modal Header
      if (modalTitle) modalTitle.textContent = category.name;
      if (modalSubtitle) modalSubtitle.textContent = category.longDesc || category.subtitle;
      
      // Render Products
      if (products.length === 0) {
        modalBody.innerHTML = '<p style="color: #666; font-size: 1.2rem; grid-column: 1/-1;">No products found in this collection.</p>';
      } else {
        modalBody.innerHTML = products.map(p => {
          const badgeHtml = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
          return `
            <div class="product-item">
              <img src="images/${p.categoryId}/${p.img}" class="product-img" alt="${p.name}" onerror="this.src='images/placeholder.png'">
              <h4>${p.name}</h4>
              <p>${p.desc}</p>
              ${badgeHtml}
            </div>
          `;
        }).join('');
      }
      
      // Show Modal
      if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
      }
    });
  });

  function closeProductModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeProductModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProductModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProductModal();
  });

  // 6. Contact Form Logic (if form exists on this page)
  const form = document.getElementById('inquiry-form');
  const nameInput = document.getElementById('form-name');
  const submitBtn = document.getElementById('form-submit-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Stop native submission

      const phoneInput = document.getElementById('form-phone');
      const emailInput = document.getElementById('form-email');

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

      if (nameInput && !nameInput.value.trim()) {
        showError(nameInput, 'name-error', 'Please enter your name.');
        return;
      }

      if (phoneInput && phoneInput.value.trim()) {
        const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
        if (!phoneRegex.test(phoneInput.value.trim())) {
          showError(phoneInput, 'phone-error', 'Please enter a valid phone number.');
          return;
        }
      }

      if (emailInput && emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
          showError(emailInput, 'email-error', 'Please enter a valid email address.');
          return;
        }
      }

      const name = nameInput ? nameInput.value : '';
      const phone = phoneInput ? phoneInput.value : '';
      const email = emailInput ? emailInput.value : '';
      const product = document.getElementById('form-product') ? document.getElementById('form-product').value : '';
      const msg = document.getElementById('form-message') ? document.getElementById('form-message').value : '';

      const subject = `Lumina Inquiry from ${name} - ${product}`;
      const body = `Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nProduct Interest: ${product}\n\nMessage:\n${msg}`;
      
      const mailtoLink = `mailto:shikhar.gupta2096@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;

      if (submitBtn) {
        const span = submitBtn.querySelector('span');
        if (span) span.innerHTML = '<i class="fa-solid fa-circle-check"></i> Mail App Opened!';
        submitBtn.style.background = 'rgba(76, 175, 80, 0.4)';
        setTimeout(() => {
          if (span) span.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Inquiry';
          submitBtn.style.background = '';
        }, 5000);
      }
      
      form.reset();
    });
  }

});
