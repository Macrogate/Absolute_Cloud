/* =====================================================
   SCRIPT.JS — Absolute Cloud — Scroll Frame Scrubbing
   ===================================================== */

// ─── Hamburger Menu ──────────────────────────────────
const hamburger = document.getElementById("hamburger");
const navMenu   = document.getElementById("nav-menu");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
});

// ─── Sticky Navbar ───────────────────────────────────
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("sticky", window.scrollY > 50);
});

// ─── Existing card scroll-animate observer ────────────
const cards = document.querySelectorAll(".scroll-animate");
const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("show");
    });
  },
  { threshold: 0.2 }
);
cards.forEach(card => cardObserver.observe(card));


/* =====================================================
   HERO FRAME SCRUBBING ENGINE
   Maps scroll progress → frame index → draws on canvas
   ===================================================== */

const FRAME_DIR   = 'Server_rack_rotating_horizontally_20261003145152_frames/';
const FRAME_COUNT = 115;   // total frames (frame_112 missing, handled below)
const FRAME_PAD   = 3;     // zero-padding: frame_001.jpg

// Build the ordered list of frame filenames (skip 112 which is missing)
const frameFiles = [];
for (let i = 1; i <= 116; i++) {
  if (i === 112) continue;  // frame_112 is missing
  frameFiles.push(FRAME_DIR + 'frame_' + String(i).padStart(FRAME_PAD, '0') + '.jpg');
}

// Pre-allocate Image objects
const frameImages = frameFiles.map(() => new Image());

const canvas  = document.getElementById('server-canvas');
const ctx     = canvas ? canvas.getContext('2d') : null;
const heroScrollWrapper = document.querySelector('.hero-scroll-wrapper');
const heroTextEl        = document.querySelector('.hero-text');

let framesLoaded = 0;
let firstFrameReady = false;

/** Draw a specific frame image onto the canvas */
function drawFrame(img) {
  if (!ctx || !img.complete || !img.naturalWidth) return;

  // Set canvas intrinsic size to match image on first draw
  if (canvas.width !== img.naturalWidth) {
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
}

/** Compute which frame index to show based on scroll progress */
function getFrameIndex(progress) {
  // Map progress 0..1 → index 0..FRAME_COUNT-1
  return Math.min(
    frameImages.length - 1,
    Math.floor(progress * frameImages.length)
  );
}

/** Cubic ease-in-out */
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ─── Main scroll animation ────────────────────────────
function updateHeroScrollAnim() {
  if (!heroScrollWrapper) return;

  const wRect     = heroScrollWrapper.getBoundingClientRect();
  const wH        = heroScrollWrapper.offsetHeight;
  const vH        = window.innerHeight;

  // Scroll progress: 0 = wrapper top at viewport top, 1 = wrapper bottom at viewport top
  const scrolled  = -wRect.top;
  const maxScroll = wH - vH;
  const rawP      = Math.max(0, Math.min(1, scrolled / maxScroll));

  // ── Frame scrubbing ──────────────────────────────────
  if (ctx && firstFrameReady) {
    const idx = getFrameIndex(rawP);
    const img = frameImages[idx];
    if (img && img.complete && img.naturalWidth) {
      drawFrame(img);
    }
  }

  // ── Hero text reveal (eased, reveals during first 50% of scroll) ─
  if (heroTextEl) {
    const tp     = Math.min(1, rawP * 2.0);
    const teased = easeInOutCubic(tp);
    heroTextEl.style.opacity   = teased;
    heroTextEl.style.transform = `translateX(${-60 * (1 - teased)}px)`;
  }
}

// ─── Image preloading strategy ────────────────────────
// Load frame_001 first (shows immediately), then load rest in order
function preloadFrames() {
  if (!canvas) return;

  const heroImgWrapper = document.querySelector('.hero-image');
  if (heroImgWrapper) heroImgWrapper.classList.add('loading');

  // Load the very first frame with highest priority
  frameImages[0].onload = () => {
    framesLoaded++;
    firstFrameReady = true;
    drawFrame(frameImages[0]);  // Show first frame immediately
    if (heroImgWrapper) heroImgWrapper.classList.remove('loading');
  };
  frameImages[0].src = frameFiles[0];

  // Load remaining frames sequentially after a short delay
  // so the browser can paint the first frame before loading the rest
  setTimeout(() => {
    for (let i = 1; i < frameImages.length; i++) {
      frameImages[i].onload = () => { framesLoaded++; };
      frameImages[i].src = frameFiles[i];
    }
  }, 100);
}

// ─── Unified rAF scroll handler ───────────────────────
let ticking = false;
function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateHeroScrollAnim();
      updateParallaxBg();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener("scroll", onScroll, { passive: true });

// ─── EFFECT 2 & 4: Sigma cards + Scroll-reveal ───────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".sigma-card-3d, .scroll-reveal").forEach(el => {
  revealObserver.observe(el);
});

// ─── EFFECT 3: CTA Parallax Background Drift ─────────
const ctaSections = document.querySelectorAll(".cta-section");

function updateParallaxBg() {
  ctaSections.forEach(section => {
    const rect     = section.getBoundingClientRect();
    const viewH    = window.innerHeight;
    const progress = (viewH / 2 - rect.top - rect.height / 2) / viewH;
    const drift    = progress * 30;
    section.style.backgroundPosition = `center calc(50% + ${drift}px)`;
  });
}

// ─── Six Sigma card save/bookmark button ─────────────
var demoButtons;

function start() {
  demoButtons = document.querySelectorAll(".js-modify");
  for (var i = 0; i < demoButtons.length; i++) {
    demoButtons[i].addEventListener("click", toggleEffect);
  }
  var saveButtons = document.querySelectorAll(".js-save");
  for (var i = 0; i < saveButtons.length; i++) {
    saveButtons[i].addEventListener("click", toggleActive);
  }

  // Kick off frame preloading
  preloadFrames();

  // Set initial state
  updateHeroScrollAnim();
  updateParallaxBg();
}

function toggleEffect() {
  var target = document.querySelector(this.dataset.target);
  target.dataset.effect = this.dataset.effect;
  for (var i = 0; i < demoButtons.length; i++) {
    demoButtons[i].classList.remove("active");
  }
  toggleActive.call(this);
}

function toggleActive() {
  this.classList.toggle("active");
}

window.addEventListener("load", start);