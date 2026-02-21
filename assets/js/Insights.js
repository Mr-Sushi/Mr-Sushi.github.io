/*  Insights.js  –  build film‑strips from a manifest and start the
 *  auto‑scroll animation only *after* all images have been injected,
 *  so we get the right width and no first‑frame “jump”.
 */

function getTranslatedCountryName(name) {
  const lang = localStorage.getItem('language') || 'en';
  const translationsLang = translations[lang] || translations.en;
  const key = 'insight' + name.replace(/\s/g, '');
  return translationsLang[key] || name;
}

/* ------------------------------------------------------------------ */
/* 1)  Build the DOM from the <script id="gallery‑manifest"> JSON      */
/* ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  const manifestTag = document.getElementById('gallery-manifest');
  const gallery = document.getElementById('filmstrip-gallery');
  if (!manifestTag || !gallery) return;

  /** manifest = { "Folder name": numberOfImages, … } */
  const manifest = JSON.parse(manifestTag.textContent);

  let rtlToggle = false;          // alternate scroll direction for variety

  Object.entries(manifest).forEach(([folder, count]) => {
    // encode blanks / special chars so URLs are valid 
    const safeFolder = encodeURIComponent(folder);

    /* --- strip wrapper ------------------------------------------------- */
    const strip = document.createElement('div');
    strip.className = 'filmstrip';
    strip.dataset.speed = '40';                     // px / s (default)
    strip.dataset.direction = rtlToggle ? 'right' : 'left';
    rtlToggle = !rtlToggle;

    /* --- image reel ---------------------------------------------------- */
    const reel = document.createElement('div');
    reel.className = 'reel';
    strip.appendChild(reel);

    /* add <img> 1 … count */
    for (let i = 1; i <= count; i++) {
      const num = `0${i}`;                                       // "1" ➜ "01", "20" ➜ "020"
      const img = document.createElement('img');

      // first try .jpeg, fall back to .jpg if missing
      img.src = `assets/InsightImage/${safeFolder}/${num}.jpeg`;
      img.onerror = () => {
        img.src = `assets/InsightImage/${safeFolder}/${num}.jpg`;
        img.onerror = null;
      };

      img.alt = `${folder} – ${i}`;
      img.loading = 'lazy';
      reel.appendChild(img);
    }

    /* --- caption ------------------------------------------------------- */
    let caption;
    if (folder === "Abu Dhabi") {
      // 对于 Abu Dhabi，使用可点击链接跳转到详情页
      caption = document.createElement('a');
      caption.className = 'filmstrip-caption';
      caption.href = `detail/${encodeURIComponent(folder)}.html`;
      caption.target = '_blank';
      caption.textContent = getTranslatedCountryName(folder);
    } else {
      // 其他不变，保持为 div
      caption = document.createElement('div');
      caption.className = 'filmstrip-caption';
      caption.textContent = getTranslatedCountryName(folder);
    }
    strip.appendChild(caption);

    gallery.appendChild(strip);
  });

  /* with DOM in place, kick off the scrolling logic */
  startScrolling();
});


/* ------------------------------------------------------------------ */
/* 2)  Scrolling / hover animation (requestAnimationFrame scroller)   */
/* ------------------------------------------------------------------ */
function startScrolling() {
  let lastTime = performance.now();

  document.querySelectorAll('.filmstrip').forEach(strip => {
    const reel = strip.querySelector('.reel');
    if (!reel) return;

    // First run setup
    const imgs = Array.from(reel.querySelectorAll('img'));
    reel.innerHTML = ''; // clear out

    const half1 = document.createElement('div');
    half1.className = 'reel-half';
    imgs.forEach(img => half1.appendChild(img));
    reel.appendChild(half1);

    // Calculate how many clones we need to cover the screen
    // Assume at least ~150px per image if unloaded
    const estimatedW = imgs.length * 150;
    const screenW = window.innerWidth;
    const neededCopies = Math.max(2, Math.ceil((screenW * 2) / estimatedW));

    // Create the required number of clones
    for (let i = 1; i < neededCopies; i++) {
      reel.appendChild(half1.cloneNode(true));
    }

    // Store state directly on reel DOM element natively
    reel._pos = 0;
    reel._speed = parseFloat(strip.dataset.speed) || 40;
    reel._dir = strip.dataset.direction === 'right' ? 1 : -1;
    reel._w = 0; // will be populated by ResizeObserver

    // Use ResizeObserver to watch half1's width purely asynchronously
    // This avoids layout thrashing from reading offsetWidth every frame
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        reel._w = entry.contentRect.width;
      }
    });
    ro.observe(half1);
  });

  function animate(time) {
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    document.querySelectorAll('.filmstrip').forEach(strip => {
      const reel = strip.querySelector('.reel');
      if (!reel || reel._w === 0) return; // wait till width is known

      const w = reel._w;

      // If scrolling right and we are exactly at 0 to start, jump back by width to avoid white gap
      if (reel._dir === 1 && reel._pos === 0) {
        reel._pos = -w;
      }

      // Move by delta * speed
      reel._pos += reel._dir * reel._speed * delta;

      // Wrap around logic
      if (reel._dir === -1 && reel._pos <= -w) {
        // Scrolling left: jump back to start
        reel._pos += w;
      } else if (reel._dir === 1 && reel._pos >= 0) {
        // Scrolling right: jump back by width
        reel._pos -= w;
      }

      reel.style.transform = `translateX(${reel._pos}px)`;
    });

    requestAnimationFrame(animate);
  }

  // Kick off animation loop
  requestAnimationFrame(animate);
}