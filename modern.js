// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAigaPZBTCHCETCjnnqmI531H6XPzprxaQ",
  authDomain: "lumina-website-b5035.firebaseapp.com",
  projectId: "lumina-website-b5035",
  storageBucket: "lumina-website-b5035.firebasestorage.app",
  messagingSenderId: "680162335951",
  appId: "1:680162335951:web:111545f42277680459ebba",
  measurementId: "G-GRYZQ1JJLD"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Fetch Data from Firestore
  let categories = [];
  let products = [];

  try {
    // Fetch categories
    const catSnapshot = await db.collection('categories').orderBy('order').get();
    catSnapshot.forEach(doc => {
      categories.push({ id: doc.id, ...doc.data() });
    });

    // Fetch products
    const prodSnapshot = await db.collection('products').get();
    prodSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    // Fallback: if Firestore is empty, try local products.json
    if (categories.length === 0) {
      console.warn('Firestore empty — falling back to products.json');
      const response = await fetch('products.json?v=' + new Date().getTime());
      const jsonData = await response.json();
      categories = jsonData.categories || [];
      products = jsonData.products || [];
    }

  } catch(e) {
    console.warn("Firestore fetch failed — falling back to products.json", e);
    try {
      const response = await fetch('products.json?v=' + new Date().getTime());
      const jsonData = await response.json();
      categories = jsonData.categories || [];
      products = jsonData.products || [];
    } catch(e2) {
      console.error("Both Firestore and products.json failed.", e2);
      return;
    }
  }

  // 2. Render Minimal Collection Grid with Stagger Delays
  const grid = document.getElementById('collection-grid');
  if (grid && categories.length) {
    grid.innerHTML = categories.map((cat, index) => {
      return `
        <div class="liquid-card liquid-reveal" style="--stagger-idx: ${index + 1};" data-cat-id="${cat.id}">
          <div class="card-img-wrapper">
            <img src="images/${cat.img || 'placeholder.png'}" class="card-img" alt="${cat.name}">
          </div>
          <div class="card-content">
            <h3 class="card-title">${cat.name}</h3>
            <p class="card-desc">${cat.shortDesc || cat.subtitle}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // 3. Scroll Reveal Animation (Intersection Observer)
  const revealElements = document.querySelectorAll('.liquid-reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 4. Hero Parallax
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      heroBg.style.transform = `translateY(${scrollY * 0.3}px) scale(1.05)`;
    });
  }

  // 5. Modal Logic
  const modalOverlay = document.getElementById('product-modal');
  const modalClose = document.getElementById('modal-close');
  const modalBody = document.getElementById('modal-body');
  const modalTitle = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');

  const cards = document.querySelectorAll('.liquid-card[data-cat-id]');
  
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.getAttribute('data-cat-id');
      const category = categories.find(c => c.id === catId);
      if (!category) return;
      
      const catProducts = products.filter(p => p.categoryId === catId);
      
      if (modalTitle) modalTitle.textContent = category.name;
      if (modalSubtitle) modalSubtitle.textContent = category.longDesc || category.subtitle;
      
      if (catProducts.length === 0) {
        modalBody.innerHTML = '<p style="color: var(--color-muted); font-size: 1.1rem; grid-column: 1/-1;">No products found in this collection.</p>';
      } else {
        modalBody.innerHTML = catProducts.map(p => {
          return `
            <div class="product-item">
              <img src="images/${p.categoryId}/${p.img}" class="product-img" alt="${p.name}" onerror="this.src='images/placeholder.png'">
              <h4>${p.name}</h4>
              <p>${p.desc}</p>
            </div>
          `;
        }).join('');
      }
      
      if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; 
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

});
