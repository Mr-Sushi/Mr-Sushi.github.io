document.addEventListener("DOMContentLoaded", () => {
    const greetingAnimation = document.getElementById("greeting-animation");
    // <main> 没有 id，所以用 querySelector
    const mainContent = document.querySelector("main");
    
    if (greetingAnimation && mainContent) {
      // 如果已经播放过动画，则直接显示主内容、隐藏问候语
      if (sessionStorage.getItem("greetingPlayed")) {
        greetingAnimation.style.display = "none";
        mainContent.style.display = "block";
      } else {
        // 尚未播放过：在 5 秒后隐藏问候语，显示主内容
        setTimeout(() => {
          greetingAnimation.style.display = "none";
          mainContent.style.display = "block";
        }, 5000); // 5 秒后切换
    
        // 标记动画已播放
        sessionStorage.setItem("greetingPlayed", "true");
      }
    } // <-- 结束 if (greetingAnimation && mainContent)

    // 2. 平滑滚动（仅拦截以 “#” 开头的同页锚点）——
    //    其它 href（index.html、projects.html …）让浏览器自行跳转
    document.querySelectorAll("nav ul li a").forEach(link => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        link.addEventListener("click", e => {
          e.preventDefault();
          const targetId = href.slice(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
    });
  
    // 3. 多语言切换逻辑
    
    function setLanguage(lang) {

      // 普通文本节点
      document.querySelectorAll("[data-translate]").forEach(el => {
        const key = el.dataset.translate;
        const val = translations[lang][key];
        if (val) el.innerHTML = val;
      });

      // 表单占位符
      document.querySelectorAll("[data-translate-placeholder]").forEach(el => {
        const key = el.dataset.translatePlaceholder;
        const val = translations[lang][key];
        if (val) el.placeholder = val;
      });

      // 按钮文本 (保持 sendButton 支持)
      const sendBtn = document.querySelector(".btn-submit[data-translate]");
      if (sendBtn) {
        const key = sendBtn.dataset.translate;
        const val = translations[lang][key];
        if (val) sendBtn.textContent = val;
      }
    }
    
    // 默认语言
    const browserLang = navigator.language.startsWith("zh") ? "zh" : "en";
    setLanguage(browserLang);
    
    // 语言切换按钮
    document.getElementById("lang-en").addEventListener("click", () => setLanguage("en"));
    document.getElementById("lang-zh").addEventListener("click", () => setLanguage("zh"));
// --- mobile‑drawer language buttons ---
const drawerLangEn = document.getElementById("drawer-lang-en");
const drawerLangZh = document.getElementById("drawer-lang-zh");

if (drawerLangEn) {
  drawerLangEn.addEventListener("click", () => {
    setLanguage("en");
    /* close drawer after switch */
    if (mobileDrawer) mobileDrawer.classList.remove("open");
  });
}
if (drawerLangZh) {
  drawerLangZh.addEventListener("click", () => {
    setLanguage("zh");
    if (mobileDrawer) mobileDrawer.classList.remove("open");
  });
}

  // 1. 动态打字示例
  const typedTextSpan = document.getElementById("typed-text");

  // 你想轮流显示的短句子
  const textArray = [
    "AI-driven tools",
    "products",
    "cool things",
    "awesome user experiences"
  ];
  let textArrayIndex = 0;  // 当前短句索引
  let charIndex = 0;       // 当前字符位置
  const typingDelay = 100; // 打字速度(ms)
  const erasingDelay = 50; // 退字速度(ms)
  const newTextDelay = 2000; // 打完后停留多久再擦除

  function type() {
    if (charIndex < textArray[textArrayIndex].length) {
      typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, typingDelay);
    } else {
      // 打完当前短句后，暂停一会儿再开始擦除
      setTimeout(erase, newTextDelay);
    }
  }

  function erase() {
    if (charIndex > 0) {
      // 逐个退字
      typedTextSpan.textContent = textArray[textArrayIndex].substring(0, charIndex - 1);
      charIndex--;
      setTimeout(erase, erasingDelay);
    } else {
      // 退完后，切换到下一个短句
      textArrayIndex++;
      if (textArrayIndex >= textArray.length) textArrayIndex = 0;
      // 等待一点时间再开始下一轮打字
      setTimeout(type, typingDelay);
    }
  }

  // 启动打字动画
  if (typedTextSpan) {
    type();
  }


    // ========= Intersection Observer 逻辑 (Hero 进出视口时切换导航栏样式) =========
    const header = document.querySelector("header");
    const hero = document.querySelector(".hero-section");

    const options = {
      root: null,
      threshold: 0 
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Hero可见 => 导航移除scrolled类
          header.classList.remove("scrolled");
        } else {
          // Hero不可见 => 导航加scrolled类
          header.classList.add("scrolled");
        }
      });
    }, options);
  
    if (hero) {
      observer.observe(hero);
    }

    /* ===== Mobile nav drawer ===== */
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const mobileDrawer = document.getElementById("mobile-drawer");
    const drawerCloseBtn = document.getElementById("drawer-close");

    if (hamburgerBtn && mobileDrawer && drawerCloseBtn) {
      // open drawer
      hamburgerBtn.addEventListener("click", () => {
        mobileDrawer.classList.add("open");
      });

      // close drawer by X button
      drawerCloseBtn.addEventListener("click", () => {
        mobileDrawer.classList.remove("open");
      });

      // close drawer when clicking any link inside
      mobileDrawer.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          mobileDrawer.classList.remove("open");
        });
      });
    }


  
  /* ===== Contact form → Google Sheet ===== */
  const scriptURL =
    "https://script.google.com/macros/s/AKfycbyXPLD9vxhZGgKX9w6WPGuLJR_73a4oZolRkopxmJ9Mcuo7v7x12wL8zXMd2CMHLB5q/exec";
  const gForm = document.forms["submit-to-google-sheet"];
  
  if (gForm) {
    gForm.addEventListener("submit", (e) => {
      e.preventDefault();
  
      /* --- show modal immediately with spinner --- */
      const modal      = document.getElementById("send-modal");
      const modalText  = document.getElementById("modal-text");
      const modalOkBtn = document.getElementById("modal-ok");
      const spinner    = document.getElementById("spinner");

      if (modal) {
        modal.classList.remove("hidden");
        if (modalText)  modalText.textContent = translations[browserLang]?.sendSending || "Sending…";
        if (spinner)    spinner.classList.remove("hidden");
        if (modalOkBtn) modalOkBtn.classList.add("hidden");
      }

      fetch(scriptURL, { method: "POST", body: new FormData(gForm) })
        .then(() => {
          if (modalText)  modalText.textContent = translations[browserLang]?.sendSuccess || "Your message has been sent successfully!";
          if (spinner)    spinner.classList.add("hidden");
          if (modalOkBtn) modalOkBtn.classList.remove("hidden");
        })
        .catch((err) => {
          console.error("Error!", err.message);
          if (modalText)  modalText.textContent = "Error: " + err.message;
          if (spinner)    spinner.classList.add("hidden");
          if (modalOkBtn) modalOkBtn.classList.remove("hidden");
        });
    });

    // OK button closes modal & resets form
    const modalOkBtn = document.getElementById("modal-ok");
    if (modalOkBtn) {
      modalOkBtn.addEventListener("click", () => {
        const modal = document.getElementById("send-modal");
        if (modal) modal.classList.add("hidden");
        gForm.reset();
      });
    }
  }
  
  /* ===== 3D hover for insight cards (.hover-3d) ===== */
  const cards3D = document.querySelectorAll(".hover-3d");
  const damp    = 30; // rotation intensity (larger = stronger tilt)

  const setCardRotation = (e, card) => {
    const rect = card.getBoundingClientRect();
    const px   = (e.clientX ?? e.touches[0].clientX) - rect.left;
    const py   = (e.clientY ?? e.touches[0].clientY) - rect.top;
    const rx   = ((px - rect.width / 2)  / rect.width)  * -damp; // rotateY
    const ry   = ((py - rect.height / 2) / rect.height) *  damp; // rotateX
    card.style.setProperty("--rx", `${rx}deg`);
    card.style.setProperty("--ry", `${ry}deg`);
  };

  cards3D.forEach(card => {
    // pointerenter: activate
    card.addEventListener("pointerenter", () => {
      card.classList.add("is-hovering");
    });

    // pointermove: update rotation
    card.addEventListener("pointermove", ev => setCardRotation(ev, card));

    // pointerleave: reset
    const reset = () => {
      card.classList.remove("is-hovering");
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    };
    card.addEventListener("pointerleave", reset);
    card.addEventListener("pointercancel", reset);
  });
});

