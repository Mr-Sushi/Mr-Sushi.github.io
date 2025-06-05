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
  const gallery     = document.getElementById('filmstrip-gallery');
  if (!manifestTag || !gallery) return;

  /** manifest = { "Folder name": numberOfImages, … } */
  const manifest = JSON.parse(manifestTag.textContent);

  let rtlToggle = false;          // alternate scroll direction for variety

  Object.entries(manifest).forEach(([folder, count]) => {
    // encode blanks / special chars so URLs are valid 
    const safeFolder = encodeURIComponent(folder);

    /* --- strip wrapper ------------------------------------------------- */
    const strip = document.createElement('div');
    strip.className        = 'filmstrip';
    strip.dataset.speed    = '40';                     // px / s (default)
    strip.dataset.direction= rtlToggle ? 'right' : 'left';
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
      img.src     = `assets/InsightImage/${safeFolder}/${num}.jpeg`;
      img.onerror = () => {
        img.src     = `assets/InsightImage/${safeFolder}/${num}.jpg`;
        img.onerror = null;
      };

      img.alt     = `${folder} – ${i}`;
      img.loading = 'lazy';
      reel.appendChild(img);
    }

    /* --- caption ------------------------------------------------------- */
    let caption;
    if (folder === "Abu Dhabi") {
      // 对于 Abu Dhabi，使用可点击链接跳转到详情页
      caption = document.createElement('a');
      caption.className = 'filmstrip-caption';
      caption.href      = `detail/${encodeURIComponent(folder)}.html`;
      caption.target    = '_blank';
      caption.textContent = getTranslatedCountryName(folder);
    } else {
      // 其他不变，保持为 div
      caption = document.createElement('div');
      caption.className   = 'filmstrip-caption';
      caption.textContent = getTranslatedCountryName(folder);
    }
    strip.appendChild(caption);

    gallery.appendChild(strip);
  });

  /* with DOM in place, kick off the scrolling logic */
  startScrolling();
});


/* ------------------------------------------------------------------ */
/* 2)  Scrolling / hover animation (previous code, wrapped in a fn)    */
/* ------------------------------------------------------------------ */
function startScrolling() {
  document.querySelectorAll('.filmstrip').forEach(strip => {
    const inner = strip.querySelector('.reel');
    if (!inner) return;

    /* force eager load so widths are known immediately */
    inner.querySelectorAll('img').forEach(img => img.loading = 'eager');

    /* wait until all images in this strip have either loaded or errored */
    const imgs = Array.from(inner.querySelectorAll('img'));
    const loadPromises = imgs.map(img => {
      return img.complete
        ? Promise.resolve()
        : new Promise(res => {
            img.addEventListener('load', res, { once: true });
            img.addEventListener('error', res, { once: true });
          });
    });

    Promise.all(loadPromises).then(() => {
      /* duplicate until we have at least one extra strip,
         and enough to cover the viewport with margin       */
      const origWidth = inner.scrollWidth;
      while (inner.scrollWidth < strip.clientWidth + origWidth) {
        inner.innerHTML += inner.innerHTML;
      }

      /* configuration */
      const speed     = parseFloat(strip.dataset.speed) || 40;       // px/s
      const direction = strip.dataset.direction === 'right' 
                        ? 'reverse' : 'normal';
      const width     = origWidth;          // loop distance equals original reel width
      const duration  = width / speed;                             // seconds

      /* dynamic keyframes */
      const animName = `scroll_${Math.random().toString(36).slice(2, 8)}`;
      const styleTag = document.createElement('style');
      styleTag.textContent = `
        @keyframes ${animName} {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${width}px); }
        }`;
      document.head.appendChild(styleTag);

      /* apply animation */
      inner.style.animation          = `${animName} ${duration}s linear infinite`;
      inner.style.animationDirection = direction;
    });
  });
}