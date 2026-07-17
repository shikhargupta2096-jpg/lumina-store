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
      
      let hotspotsHtml = '';
      if (cat.id === 'chandeliers') {
        hotspotsHtml = `
          <div class="hotspot" style="top: 25%; left: 35%;" data-product-name="Grand Crystal Cascade" data-model="https://modelviewer.dev/shared-assets/models/Astronaut.glb">
            <div class="hotspot-pulse"></div>
            <div class="hotspot-tooltip">Grand Crystal Cascade</div>
          </div>
          <div class="hotspot" style="top: 45%; left: 65%;" data-product-name="Art Deco Glamour Chandelier" data-model="https://modelviewer.dev/shared-assets/models/Astronaut.glb">
            <div class="hotspot-pulse"></div>
            <div class="hotspot-tooltip">Art Deco Glamour Chandelier</div>
          </div>
        `;
      }
      
      return `
        <div class="premium-card ${layoutClass} reveal" data-cat-id="${cat.id}" style="position: relative;">
          <img src="images/${cat.img || 'placeholder.png'}" class="card-img" alt="${cat.name}">
          ${hotspotsHtml}
          <div class="card-content">
            <span class="card-tag">${cat.tag || 'Collection'}</span>
            <h3 class="card-title">${cat.name}</h3>
            <p class="card-desc">${cat.shortDesc || cat.subtitle}</p>
          </div>
        </div>
      `;
    }).join('');

    // Attach Hotspot Listeners
    setTimeout(() => {
      const hotspots = document.querySelectorAll('.hotspot');
      hotspots.forEach(spot => {
        spot.addEventListener('click', (e) => {
          e.stopPropagation(); // prevent opening the whole category modal
          openARModal(spot.getAttribute('data-model'), '', spot.getAttribute('data-product-name'));
        });
      });
    }, 100);
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
        // Collect unique tags
        const allTags = new Set();
        products.forEach(p => {
          if (p.tags) p.tags.forEach(t => allTags.add(t));
        });
        
        let filterHtml = '';
        if (allTags.size > 0) {
          filterHtml = `
            <div class="product-filters" style="grid-column: 1/-1; display: flex; gap: 10px; overflow-x: auto; padding-bottom: 16px; margin-bottom: 16px; border-bottom: 1px solid var(--glass-border);">
              <button class="filter-btn active" data-filter="all">All</button>
              ${Array.from(allTags).map(tag => `<button class="filter-btn" data-filter="${tag}">${tag}</button>`).join('')}
            </div>
          `;
        }

        modalBody.innerHTML = filterHtml + products.map(p => {
          const badgeHtml = p.badge ? `<span class="product-badge">${p.badge}</span>` : '';
          const modelUrl = p.modelUrl || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
          const iosModelUrl = p.iosModelUrl || '';
          const tagsAttr = p.tags ? p.tags.join(',') : '';
          
          return `
            <div class="product-item" data-tags="${tagsAttr}" style="transition: opacity 0.3s ease;">
              <div class="product-img-wrapper" style="overflow: hidden; border-radius: 8px; margin-bottom: 24px; position: relative;">
                <img src="images/${p.categoryId}/${p.img}" class="product-img" alt="${p.name}" style="transition: transform 0.6s ease, filter 0.6s ease; margin-bottom: 0;" onerror="this.src='images/placeholder.png'">
                <div class="lifestyle-overlay" style="position: absolute; inset: 0; background: linear-gradient(rgba(0,0,0,0), rgba(195,163,94,0.15)); opacity: 0; transition: opacity 0.6s ease; pointer-events: none;"></div>
              </div>
              <h4>${p.name}</h4>
              <p>${p.desc}</p>
              ${badgeHtml}
              <button class="btn-ar magnetic-btn" data-model="${modelUrl}" data-ios-model="${iosModelUrl}" data-name="${p.name}">
                <i class="fa-solid fa-cube"></i> View in 3D / AR
              </button>
            </div>
          `;
        }).join('');
        
        // Attach Filter Listeners
        setTimeout(() => {
          const filterBtns = document.querySelectorAll('.filter-btn');
          const productItems = document.querySelectorAll('.product-item');
          
          filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              filterBtns.forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              const filter = btn.getAttribute('data-filter');
              
              productItems.forEach(item => {
                const itemTags = item.getAttribute('data-tags');
                if (filter === 'all' || (itemTags && itemTags.includes(filter))) {
                  item.style.display = 'block';
                  setTimeout(() => item.style.opacity = '1', 50);
                } else {
                  item.style.opacity = '0';
                  setTimeout(() => item.style.display = 'none', 300);
                }
              });
            });
          });
        }, 50);

        // Attach AR button listeners
        setTimeout(() => {
          const arButtons = document.querySelectorAll('.btn-ar');
          arButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              openARModal(btn.getAttribute('data-model'), btn.getAttribute('data-ios-model'), btn.getAttribute('data-name'));
            });
          });
          // re-init magnetic buttons for newly injected elements
          initMagneticButtons();
        }, 100);
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

  // --- AR Modal Logic ---
  const arModal = document.getElementById('ar-modal');
  const arModalClose = document.getElementById('ar-modal-close');
  const arModelViewer = document.getElementById('lumina-model-viewer');
  const arModalTitle = document.getElementById('ar-modal-title');

  function openARModal(modelSrc, iosSrc, productName) {
    if (arModal && arModelViewer) {
      arModelViewer.src = modelSrc;
      if (iosSrc) {
        arModelViewer.setAttribute('ios-src', iosSrc);
      } else {
        arModelViewer.removeAttribute('ios-src');
      }
      if (arModalTitle) arModalTitle.textContent = productName + ' (3D Preview)';
      
      arModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeARModal() {
    if (arModal) {
      arModal.classList.remove('active');
      // Only restore overflow if the main product modal isn't also active
      if (!modalOverlay || !modalOverlay.classList.contains('active')) {
        document.body.style.overflow = '';
      }
    }
  }

  if (arModalClose) arModalClose.addEventListener('click', closeARModal);
  if (arModal) {
    arModal.addEventListener('click', (e) => {
      if (e.target === arModal) closeARModal();
    });
  }
  // --- End AR Modal Logic ---

  if (modalClose) modalClose.addEventListener('click', closeProductModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeProductModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (arModal && arModal.classList.contains('active')) {
        closeARModal();
      } else {
        closeProductModal();
      }
    }
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

  // --- Luxury Cursor Logic ---
  const cursorDot = document.getElementById('cursor-dot');
  const cursorOutline = document.getElementById('cursor-outline');
  
  if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });
    
    const lag = 0.15;
    function animateCursor() {
      outlineX += (mouseX - outlineX) * lag;
      outlineY += (mouseY - outlineY) * lag;
      cursorOutline.style.left = outlineX + 'px';
      cursorOutline.style.top = outlineY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
    
    // Add hover states to all clickable things
    const addHoverState = (elements) => {
      elements.forEach(el => {
        if(el.dataset.cursorInit) return;
        el.dataset.cursorInit = 'true';
        el.addEventListener('mouseenter', () => {
          cursorDot.classList.add('hovered');
          cursorOutline.classList.add('hovered');
        });
        el.addEventListener('mouseleave', () => {
          cursorDot.classList.remove('hovered');
          cursorOutline.classList.remove('hovered');
        });
      });
    };
    
    // Observe DOM mutations to attach cursor listeners to dynamically added items
    const observer = new MutationObserver(() => {
      addHoverState(document.querySelectorAll('a, button, .premium-card, .filter-btn, .product-item'));
    });
    observer.observe(document.body, { childList: true, subtree: true });
    addHoverState(document.querySelectorAll('a, button, .premium-card, .filter-btn, .product-item'));
  }

  // --- Magnetic Button Physics ---
  window.initMagneticButtons = function() {
    const magneticBtns = document.querySelectorAll('.magnetic-btn, .btn-primary, .btn-outline, .close-btn');
    magneticBtns.forEach(btn => {
      if (btn.dataset.magneticInit) return;
      btn.dataset.magneticInit = 'true';
      
      btn.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.3s';
      
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        btn.style.transition = 'none'; // instant follow
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.3s';
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  };
  initMagneticButtons();

});
