/* ============================================
   AutoParts Pro - Main JavaScript
   ============================================ */

// ==========================================
// Product Data
// ==========================================
let products = [];

// ==========================================
// Filter State
// ==========================================
let activeCarBrand = null;
let activeCategories = [];
let productsLoaded = false;

async function loadProducts() {
  try {
    // Build query params from filter state
    const params = new URLSearchParams();
    if (activeCarBrand) {
      params.set('carBrand', activeCarBrand);
    }
    if (activeCategories.length > 0) {
      params.set('category', activeCategories.join(','));
    }

    const url = '/api/products' + (params.toString() ? '?' + params.toString() : '');
    const response = await fetch(url);
    const result = await response.json();

    if (result && result.success && Array.isArray(result.data)) {
      products = result.data.map(product => ({
        ...product,
        id: Number(product.id ?? product._id),
        brand: product.brand || product.partBrand || 'AutoParts Pro',
        carBrand: product.carBrand || product.car_brand || null,
        originalPrice: product.originalPrice == null ? null : Number(product.originalPrice),
        price: Number(product.price),
        rating: Number(product.rating || 0),
        reviews: Number(product.reviews || 0),
        stock: Number(product.stock || 0),
        images: Array.isArray(product.images) ? product.images : []
      }));
    } else {
      products = [];
    }

    productsLoaded = true;
    renderProducts('all');
    updateCartCount();
  } catch (error) {
    console.error('Failed to load products:', error);
    products = [];
    productsLoaded = true;
    renderProducts('all');
  }
}

// ==========================================
// Cart State
// ==========================================
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId, quantity = 1, productOverride = null) {
  const normalizedId = Number(productId);
  const product = productOverride || products.find(p => Number(p.id) === normalizedId);
  if (!product) return;
  
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  
  saveCart();
  showNotification(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
}

function removeFromCart(productId) {
  cart = cart.filter(item => String(item.id) !== String(productId));
  saveCart();
}

function updateCartQuantity(productId, quantity) {
  const item = cart.find(i => String(i.id) === String(productId));
  if (item) {
    item.quantity = Math.max(1, quantity);
    saveCart();
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function updateCartCount() {
  const countElements = document.querySelectorAll('.cart-count');
  const count = getCartCount();
  countElements.forEach(el => {
    el.textContent = `(${count})`;
  });
  
  const badges = document.querySelectorAll('.header__action-badge');
  badges.forEach(badge => {
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  });
}

// ==========================================
// Notification
// ==========================================
function showNotification(message) {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 12l2 2 4-4"/>
      <circle cx="12" cy="12" r="10"/>
    </svg>
    <span>${message}</span>
  `;
  
  // Add notification styles
  notification.style.cssText = `
    position: fixed;
    top: 90px;
    right: 20px;
    z-index: 3000;
    background: linear-gradient(135deg, #1a1a2e, #16162a);
    border: 1px solid rgba(255, 107, 53, 0.3);
    color: #f0f0f5;
    padding: 14px 24px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Kanit', sans-serif;
    font-size: 0.9rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 107, 53, 0.15);
    transform: translateX(120%);
    transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  `;
  
  const svg = notification.querySelector('svg');
  svg.style.cssText = 'width: 20px; height: 20px; color: #2ec4b6; flex-shrink: 0;';
  
  document.body.appendChild(notification);
  
  // Trigger animation
  requestAnimationFrame(() => {
    notification.style.transform = 'translateX(0)';
  });
  
  // Auto remove
  setTimeout(() => {
    notification.style.transform = 'translateX(120%)';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// ==========================================
// Product Card Rendering
// ==========================================
function createProductCard(product) {
  const discount = product.originalPrice 
    ? Math.round((1 - product.price / product.originalPrice) * 100) 
    : 0;
  
  const badgeLabels = {
    sale: 'ลดราคา',
    new: 'สินค้าใหม่',
    hot: 'ขายดี'
  };
  
  const stars = Array(5).fill('').map((_, i) => {
    const filled = i < Math.floor(product.rating);
    return `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>`;
  }).join('');
  
  return `
    <div class="product-card" data-id="${product.id}" data-category="${product.category}" id="product-${product.id}">
      <div class="product-card__image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.badge ? `<span class="product-card__badge product-card__badge--${product.badge}">${badgeLabels[product.badge]}</span>` : ''}
        <button class="product-card__wishlist" aria-label="เพิ่มในรายการโปรด" onclick="event.stopPropagation(); showNotification('เพิ่มในรายการโปรดแล้ว');">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <div class="product-card__overlay">
          <button class="product-card__quick-view" onclick="event.stopPropagation(); window.location.href='pages/product.html?id=${product.id}'">
            ดูรายละเอียด
          </button>
        </div>
      </div>
      <div class="product-card__info">
        <div class="product-card__brand">${product.brand}</div>
        <h3 class="product-card__name">${product.name}</h3>
        <div class="product-card__price">
          <span class="product-card__price-current">฿${product.price.toLocaleString()}</span>
          ${product.originalPrice ? `<span class="product-card__price-original">฿${product.originalPrice.toLocaleString()}</span>` : ''}
        </div>
        <div class="product-card__rating">
          <div class="product-card__stars">${stars}</div>
          <span class="product-card__review-count">(${product.reviews})</span>
        </div>
        <div class="product-card__stock" style="font-size: 0.85rem; color: var(--color-text-secondary); margin-top: 8px;">
          เหลือสินค้า: <span style="color: ${product.stock > 0 ? 'var(--color-accent-primary)' : 'var(--color-red)'}; font-weight: 600;">${product.stock || 0}</span> ชิ้น
        </div>
      </div>
    </div>
  `;
}

function renderProducts(filter = 'all') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (!products.length) {
    if (!productsLoaded) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state__icon">📦</div>
          <h3 class="empty-state__title">กำลังโหลดสินค้า</h3>
          <p class="empty-state__text">รอสักครู่ขณะเชื่อมต่อกับฐานข้อมูล</p>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1; text-align:center; padding:80px 0;">
          <div class="empty-state__icon">📭</div>
          <h3 class="empty-state__title">ไม่พบสินค้าที่ตรงกับตัวกรอง</h3>
          <p class="empty-state__text">ลองเปลี่ยนยี่ห้อรถหรือหมวดหมู่แล้วลองใหม่</p>
        </div>
      `;
    }
    return;
  }
  
  let filtered;
  if (filter === 'all') {
    filtered = products;
  } else if (filter === 'bestseller') {
    // treat 'bestseller' as items with category 'bestseller' OR badge indicating hot/bestseller
    filtered = products.filter(p => p.category === 'bestseller' || (p.badge && ['hot', 'bestseller'].includes(String(p.badge).toLowerCase())));
  } else if (filter === 'promotion') {
    // promotion tab should match category 'promotion' or sale/promotion badges
    filtered = products.filter(p => p.category === 'promotion' || (p.badge && ['sale', 'promotion', 'promo'].includes(String(p.badge).toLowerCase())));
  } else if (filter === 'new') {
    // new tab should match category 'new' or badge 'new'
    filtered = products.filter(p => p.category === 'new' || (p.badge && String(p.badge).toLowerCase() === 'new'));
  } else {
    filtered = products.filter(p => p.category === filter);
  }
  
  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1; text-align:center; padding:80px 0;">
        <div class="empty-state__icon">📭</div>
        <h3 class="empty-state__title">ไม่พบสินค้าหมวดนี้</h3>
        <p class="empty-state__text">ลองเลือกหมวดอื่นหรือกลับไปหน้าหลัก</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(createProductCard).join('');
  
  // Re-trigger animations
  const cards = grid.querySelectorAll('.product-card');
  cards.forEach((card, i) => {
    card.style.animationDelay = `${i * 0.05}s`;
  });
  
  // Add click handlers for product cards
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      window.location.href = `pages/product.html?id=${id}`;
    });
  });
}

// ==========================================
// Carousel
// ==========================================
function initCarousel() {
  const slides = document.querySelector('.hero__slides');
  const dots = document.querySelectorAll('.hero__dot');
  const prevBtn = document.querySelector('.hero__control--prev');
  const nextBtn = document.querySelector('.hero__control--next');
  
  if (!slides) return;
  
  let currentSlide = 0;
  const totalSlides = document.querySelectorAll('.hero__slide').length;
  let autoplayInterval;
  
  function goToSlide(index) {
    currentSlide = ((index % totalSlides) + totalSlides) % totalSlides;
    slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }
  
  function nextSlide() {
    goToSlide(currentSlide + 1);
  }
  
  function prevSlide() {
    goToSlide(currentSlide - 1);
  }
  
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000);
  }
  
  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }
  
  // Event listeners
  if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); prevSlide(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); nextSlide(); startAutoplay(); });
  
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(i);
      startAutoplay();
    });
  });
  
  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;
  
  const carousel = document.querySelector('.hero__carousel');
  if (carousel) {
    carousel.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoplay();
    }, { passive: true });
    
    carousel.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
      }
      startAutoplay();
    }, { passive: true });
  }
  
  startAutoplay();
}

// ==========================================
// Category Tabs
// ==========================================
function initCategoryTabs() {
  const tabs = document.querySelectorAll('.categories__tab');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderProducts(tab.dataset.category);

      // sync header nav active state when a category tab is clicked
      const headerLink = document.querySelector(`.header__nav-link[data-category="${tab.dataset.category}"]`);
      if (headerLink) {
        document.querySelectorAll('.header__nav-link').forEach(l => l.classList.remove('active'));
        headerLink.classList.add('active');
      }
    });
  });
}

// Initialize header navigation links to filter products
function initHeaderNav() {
  const links = document.querySelectorAll('.header__nav-link');
  if (!links || !links.length) return;

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const category = link.dataset.category || 'all';
      // sync category tab active state
      document.querySelectorAll('.categories__tab').forEach(t => t.classList.toggle('active', t.dataset.category === category));

      renderProducts(category);
      const productsSection = document.getElementById('products-section');
      if (productsSection) window.scrollTo({ top: productsSection.offsetTop - 80, behavior: 'smooth' });
    });
  });
}

// ==========================================
// Car Brand Filter
// ==========================================
function initBrandFilter() {
  const brandButtons = document.querySelectorAll('.brands__item[data-car-brand]');
  if (!brandButtons.length) return;

  brandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const brand = btn.dataset.carBrand;

      if (activeCarBrand === brand) {
        // Deselect — toggle off
        activeCarBrand = null;
        btn.classList.remove('active');
      } else {
        // Select new brand
        activeCarBrand = brand;
        brandButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }

      // Update section title
      const title = document.getElementById('products-title');
      if (title) {
        if (activeCarBrand) {
          const brandName = btn.getAttribute('aria-label') || brand;
          title.textContent = `สินค้าสำหรับ ${brandName}`;
        } else {
          title.textContent = 'สินค้าแนะนำ';
        }
      }

      loadProducts();
    });
  });
}

// ==========================================
// Mobile Menu
// ==========================================
function initMobileMenu() {
  const toggle = document.querySelector('.header__menu-toggle');
  const nav = document.querySelector('.header__nav');
  
  if (!toggle || !nav) return;
  
  toggle.addEventListener('click', () => {
    nav.classList.toggle('mobile-open');
    const isOpen = nav.classList.contains('mobile-open');
    toggle.innerHTML = isOpen 
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>';
  });
}

// ==========================================
// Search
// ==========================================
function initSearch() {
  const form = document.getElementById('search-form');
  const input = document.getElementById('search-input');
  
  if (!form || !input) return;

  const runSearch = () => {
    const query = input.value.trim();

    // Empty input -> auto reset back to the full list
    if (!query) {
      document.querySelectorAll('.categories__tab').forEach(t => t.classList.toggle('active', t.dataset.category === 'all'));
      renderProducts('all');
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results = products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.brand.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );

    const grid = document.getElementById('products-grid');
    if (grid) {
      if (results.length > 0) {
        grid.innerHTML = results.map(createProductCard).join('');
      } else {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state__icon">🔍</div>
            <h3 class="empty-state__title">ไม่พบสินค้า</h3>
            <p class="empty-state__text">ลองค้นหาด้วยคำอื่น</p>
          </div>
        `;
      }
    }

    // Reset category tabs since search overrides category filtering
    document.querySelectorAll('.categories__tab').forEach(t => t.classList.remove('active'));
  };

  // Debounce so we don't re-render on every rapid keystroke
  let debounceTimer = null;
  const debouncedSearch = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runSearch, 250);
  };

  // Live search as the user types (covers typing, pasting, and clearing the field)
  input.addEventListener('input', debouncedSearch);

  // Keep submit working too (e.g. pressing Enter), runs immediately with no delay
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearTimeout(debounceTimer);
    runSearch();
  });
}

// ==========================================
// Authentication
// ==========================================

function getAuthToken() {
  return localStorage.getItem('authToken');
}

function getCurrentUser() {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
}

function isUserLoggedIn() {
  return !!getAuthToken();
}

function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('tokenTimestamp');
  location.reload();
}

function updateAuthUI() {
  const loginBtn = document.getElementById('login-btn');
  const user = getCurrentUser();
  
  if (!loginBtn) return;
  
  const isSubpage = window.location.pathname.includes('/pages/');
  const pathPrefix = isSubpage ? '' : 'pages/';
  
  if (isUserLoggedIn() && user) {
    // User is logged in
    loginBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>${user.name}</span>
    `;
    loginBtn.onclick = showUserMenu;
  } else {
    // User is not logged in
    loginBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      <span>ลงชื่อเข้าใช้</span>
    `;
    loginBtn.onclick = () => window.location.href = pathPrefix + 'login.html';
  }
}

function showUserMenu(e) {
  e.stopPropagation();
  
  // Remove existing menu
  const existing = document.querySelector('.user-menu');
  if (existing) {
    existing.remove();
    return;
  }
  
  const user = getCurrentUser();
  const menu = document.createElement('div');
  menu.className = 'user-menu';
  
  const isSubpage = window.location.pathname.includes('/pages/');
  const pathPrefix = isSubpage ? '' : 'pages/';
  
  menu.innerHTML = `
    <div class="user-menu__item user-menu__header">
      <div class="user-menu__name">${user.name}</div>
      <div class="user-menu__email">${user.email}</div>
    </div>
    <div class="user-menu__divider"></div>
    <a href="${pathPrefix}profile.html" class="user-menu__item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
      แก้ไขโปรไฟล์
    </a>
    <a href="${pathPrefix}orders.html" class="user-menu__item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/>
      </svg>
      ประวัติการสั่งซื้อ
    </a>
    <div class="user-menu__divider"></div>
    <button class="user-menu__item" onclick="logoutUser();">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14l5-5m0 0l-5-5m5 5H9"/>
      </svg>
      ออกจากระบบ
    </button>
  `;
  
  menu.style.cssText = `
    position: absolute;
    top: 60px;
    right: 20px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    min-width: 250px;
    z-index: 2000;
    animation: slideDown 0.2s ease-out;
  `;
  
  document.querySelector('.header__actions').style.position = 'relative';
  document.querySelector('.header__actions').appendChild(menu);
  
  // Close on outside click
  document.addEventListener('click', function closeMenu(e) {
    if (!menu.contains(e.target) && e.target !== document.getElementById('login-btn')) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  });
}

// ==========================================
// Login Modal (Updated)
// ==========================================
function initLoginModal() {
  const loginBtn = document.getElementById('login-btn');
  
  if (!loginBtn) return;
  
  // Update auth UI on page load
  updateAuthUI();
}

// ==========================================
// Back to Top
// ==========================================
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ==========================================
// Loading Screen
// ==========================================
function initLoading() {
  const overlay = document.querySelector('.loading-overlay');
  if (!overlay) return;
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 500);
    }, 800);
  });
}

// ==========================================
// Scroll Animations (Intersection Observer)
// ==========================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.product-card, .feature, .promo-banner__item').forEach(el => {
    observer.observe(el);
  });
}

// ==========================================
// Header scroll effect
// ==========================================
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    
    if (currentScroll > 100) {
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    } else {
      header.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
  });
}

// ==========================================
// Format Price
// ==========================================
function formatPrice(price) {
  return `฿${price.toLocaleString()}`;
}

// ==========================================
// Initialize All
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initLoading();
  initCarousel();
  initHeaderNav();
  initCategoryTabs();
  initBrandFilter();
  initMobileMenu();
  initSearch();
  initLoginModal();
  initBackToTop();
  initHeaderScroll();
  renderProducts('all');
  updateCartCount();
  loadProducts();
  
  // Delay scroll animations
  setTimeout(initScrollAnimations, 500);
});