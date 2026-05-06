(() => {
  "use strict";

  const storageKeys = {
    theme: "forge-theme",
    posts: "forge-posts",
    registrations: "forge-registrations",
    chatLog: "forge-chat-log",
    chatOpen: "forge-chat-open",
    chatSound: "forge-chat-sound",
  };

  const aiReplies = {
    business: "Start with one painful customer problem, validate with 5 users this week, and ship one focused offer.",
    ideas: "Combine your current skill with a fast-growing niche and solve one repetitive workflow first.",
    review: "Strong ideas are clear, urgent, and measurable. Define who benefits, why now, and your first milestone.",
    default: "Great direction. Run a tiny experiment, collect signals, and iterate with weekly checkpoints.",
  };

  const predefinedPosts = [
    {
      name: "The Ember Network",
      handle: "@theembernetwork",
      source: "Instagram",
      postUrl: "https://www.instagram.com/theembernetwork",
      previewImage: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80",
      message: "Ignition Labs this week: business model and market strategy sprint. Share your progress update.",
      ts: Date.now() - 1000 * 60 * 20,
    },
    {
      name: "The Ember Network",
      handle: "@theembernetwork",
      source: "LinkedIn",
      postUrl: "https://www.linkedin.com/company/theembernetwork",
      previewImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
      message: "Spark Challenge applications are open. Pitch your idea and get feedback from mentors and founders.",
      ts: Date.now() - 1000 * 60 * 42,
    },
    {
      name: "The Ember Network",
      handle: "@theembernetwork",
      source: "Facebook",
      postUrl: "https://www.facebook.com/theembernetwork",
      previewImage: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80",
      message: "Entrepreneur of the Week spotlight drops Friday. Keep building and post one win from your week.",
      ts: Date.now() - 1000 * 60 * 74,
    },
  ];

  const q = (s, p = document) => p.querySelector(s);
  const qa = (s, p = document) => [...p.querySelectorAll(s)];

  function injectNavbar() {
    const mount = q("#site-navbar");
    if (!mount) return;
    mount.innerHTML = `
      <header id="navbar" class="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-transparent transition-all duration-500">
        <nav class="mx-auto flex max-w-7xl items-center justify-between px-8 md:px-12 py-4 lg:px-10">
          <a href="index.html" class="page-link text-xl font-semibold tracking-tight">The <span class="text-orange-500">Ember Network</span></a>
          <div class="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="index.html" class="page-link nav-link" data-nav="index">Home</a>
            <a href="about.html" class="page-link nav-link" data-nav="about">About</a>
            <a href="programs.html" class="page-link nav-link" data-nav="programs">Programs</a>
            <a href="join.html" class="page-link nav-link" data-nav="join">Join</a>
            <a href="community.html" class="page-link nav-link" data-nav="community">Community</a>
            <a href="resources.html" class="page-link nav-link" data-nav="resources">Resources</a>
            <a href="contact.html" class="page-link nav-link" data-nav="contact">Contact</a>
          </div>
          <div class="flex items-center gap-2">
            <button id="theme-toggle" class="rounded-full border border-zinc-300/70 px-3 py-2 text-sm transition hover:border-orange-400 dark:border-zinc-700 dark:hover:border-orange-500" aria-label="Toggle dark mode"><span id="theme-icon" aria-hidden="true"></span></button>
            <button id="mobile-menu-btn" class="rounded-full border border-zinc-300/70 px-3 py-2 text-sm md:hidden dark:border-zinc-700" aria-label="Open menu">Menu</button>
          </div>
        </nav>
        <div id="mobile-menu" class="hidden border-t border-zinc-200/70 bg-white/90 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 md:hidden">
          <div class="flex flex-col gap-3 text-sm">
            <a href="index.html" class="page-link mobile-link" data-nav="index">Home</a>
            <a href="about.html" class="page-link mobile-link" data-nav="about">About</a>
            <a href="programs.html" class="page-link mobile-link" data-nav="programs">Programs</a>
            <a href="join.html" class="page-link mobile-link" data-nav="join">Join</a>
            <a href="community.html" class="page-link mobile-link" data-nav="community">Community</a>
            <a href="resources.html" class="page-link mobile-link" data-nav="resources">Resources</a>
            <a href="contact.html" class="page-link mobile-link" data-nav="contact">Contact</a>
          </div>
        </div>
      </header>`;
  }

  function injectFooter() {
    const mount = q("#site-footer");
    if (!mount) return;
    mount.innerHTML = `
      <footer class="bg-zinc-950 text-zinc-300">
        <div class="mx-auto max-w-7xl px-8 md:px-12 py-14 lg:px-10">
          <div class="grid gap-12 border-b border-zinc-800 pb-10 lg:grid-cols-[1.2fr_1fr_1fr]">
            <div>
              <h5 class="text-2xl font-semibold text-white">The <span class="text-orange-500">Ember Network</span></h5>
              <p class="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
                A community of ignition and empowerment helping aspiring entrepreneurs
                transform small sparks into lasting ventures through mentorship, structure, and opportunity.
              </p>
              <a href="community.html" class="page-link mt-6 inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-400">
                Join the Network
              </a>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-zinc-500">Gateway</p>
              <div class="mt-4 grid gap-2">
                <a href="index.html" class="page-link text-xs uppercase tracking-[0.18em] text-zinc-300 transition hover:text-orange-400">Home</a>
                <a href="about.html" class="page-link text-xs uppercase tracking-[0.18em] text-zinc-300 transition hover:text-orange-400">About</a>
                <a href="programs.html" class="page-link text-xs uppercase tracking-[0.18em] text-zinc-300 transition hover:text-orange-400">Programs</a>
                <a href="join.html" class="page-link text-xs uppercase tracking-[0.18em] text-zinc-300 transition hover:text-orange-400">Join</a>
                <a href="community.html" class="page-link text-xs uppercase tracking-[0.18em] text-zinc-300 transition hover:text-orange-400">Community</a>
                <a href="resources.html" class="page-link text-xs uppercase tracking-[0.18em] text-zinc-300 transition hover:text-orange-400">Resources</a>
                <a href="contact.html" class="page-link text-xs uppercase tracking-[0.18em] text-zinc-300 transition hover:text-orange-400">Contact</a>
              </div>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-zinc-500">Connect</p>
              <div class="mt-4 grid gap-2">
                <a href="https://www.theembernetwork.com" class="text-xs uppercase tracking-[0.18em] text-zinc-300 transition hover:text-orange-400">Website</a>
                <a href="mailto:info@theembernetwork.com" class="text-xs tracking-[0.08em] text-zinc-300 transition hover:text-orange-400">info@theembernetwork.com</a>
                <a href="tel:+233509404673" class="text-xs tracking-[0.08em] text-zinc-300 transition hover:text-orange-400">+233 50 940 4673</a>
              </div>
              <div class="mt-5 flex flex-wrap gap-2 text-xs">
                <span class="rounded-full border border-zinc-700 px-3 py-1">Instagram</span>
                <span class="rounded-full border border-zinc-700 px-3 py-1">LinkedIn</span>
                <span class="rounded-full border border-zinc-700 px-3 py-1">YouTube</span>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-4 pt-6 text-xs text-zinc-500 md:flex-row md:items-center md:justify-between">
            <div class="flex flex-wrap gap-4">
              <span>Copyright 2026 The Ember Network</span>
              <span>Privacy Policy</span>
              <span>Cookie Settings</span>
            </div>
            <p class="text-zinc-400">Small Sparks Ignite Big Dreams</p>
          </div>
        </div>
        <div class="border-t border-zinc-800 bg-zinc-900/60">
          <div class="mx-auto max-w-7xl px-8 md:px-12 py-3 text-xs text-zinc-400 lg:px-10">
            TEN Spotlight: Members engage in weekly challenges, monthly workshops, and quarterly pitch reviews to build resilient ventures.
          </div>
        </div>
      </footer>`;
  }

  function injectChatbot() {
    const mount = q("#site-chatbot");
    if (!mount) return;
    mount.innerHTML = `
      <div id="chat-widget" class="fixed bottom-5 right-4 z-[9999]">
        <div class="group relative">
          <button id="chat-toggle" class="relative grid h-14 w-14 place-content-center rounded-full bg-orange-500 text-white shadow-glow transition-all duration-300 ease-in-out hover:scale-105" aria-label="Chat with us">
            <span class="absolute inset-0 rounded-full border border-orange-300/80 animate-pulseRing"></span>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path>
            </svg>
          </button>
          <span id="chat-tooltip" class="pointer-events-none absolute right-16 top-1/2 hidden -translate-y-1/2 rounded-full bg-zinc-900 px-3 py-1 text-xs text-white opacity-0 transition-all duration-300 group-hover:opacity-100 md:block">Ember Chat</span>
        </div>

        <div id="chat-panel" class="pointer-events-none absolute bottom-16 right-0 hidden w-[340px] max-w-[calc(100vw-1.5rem)] translate-y-3 scale-[0.98] overflow-hidden rounded-2xl border border-zinc-200 bg-white opacity-0 shadow-2xl transition-all duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-900 md:w-[360px]">
          <div class="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div class="flex items-center gap-3">
              <div class="grid h-9 w-9 place-content-center rounded-full bg-orange-500 text-sm font-semibold text-white">EN</div>
              <div>
                <p class="text-sm font-semibold">Ember Assistant</p>
                <p class="text-xs text-emerald-500">Online</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button id="chat-sound-toggle" class="rounded-full border border-zinc-300 px-2 py-1 text-[11px] text-zinc-600 transition hover:border-orange-400 dark:border-zinc-700 dark:text-zinc-300">Sound: On</button>
              <button id="chat-close" class="rounded-full border border-zinc-300 px-2 py-1 text-xs transition hover:border-orange-400 dark:border-zinc-700" aria-label="Close chat">×</button>
            </div>
          </div>

          <div id="chat-messages" class="no-scrollbar h-[58vh] max-h-[460px] space-y-3 overflow-y-auto bg-zinc-50 p-4 text-sm dark:bg-zinc-950/60"></div>

          <div class="border-t border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div class="mb-2 flex flex-wrap gap-2">
              <button class="quick-reply rounded-full bg-zinc-100 px-3 py-1 text-xs transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">Join Network</button>
              <button class="quick-reply rounded-full bg-zinc-100 px-3 py-1 text-xs transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">Get Help</button>
              <button class="quick-reply rounded-full bg-zinc-100 px-3 py-1 text-xs transition hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">See Programs</button>
            </div>
            <form id="chat-form" class="flex items-end gap-2">
              <input id="chat-input" type="text" class="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none transition focus:border-orange-500 dark:border-zinc-700 dark:bg-zinc-950" placeholder="Type a message..." />
              <button class="grid h-10 w-10 place-content-center rounded-xl bg-orange-500 text-white transition hover:bg-orange-400" aria-label="Send message">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M22 2L11 13"></path>
                  <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>`;
  }

  function initPageTransition() {
    document.body.classList.add("page-ready");
    qa("a.page-link").forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || href.startsWith("#")) return;
        const url = new URL(href, window.location.href);
        const isSameOrigin = url.origin === window.location.origin;
        if (!isSameOrigin || !url.pathname.endsWith(".html")) return;
        e.preventDefault();
        document.body.classList.add("page-leaving");
        setTimeout(() => { window.location.href = url.href; }, 220);
      });
    });
  }

  function initTheme() {
    const root = document.documentElement;
    const btn = q("#theme-toggle");
    const icon = q("#theme-icon");
    const setThemeIcon = (isDark) => {
      if (!icon) return;
      icon.innerHTML = isDark
        ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="M4.93 4.93l1.41 1.41"></path><path d="M17.66 17.66l1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="M6.34 17.66l-1.41 1.41"></path><path d="M19.07 4.93l-1.41 1.41"></path></svg>'
        : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3c.3 0 .6.02.9.06A7 7 0 0 0 21 12.79z"></path></svg>';
    };
    const savedTheme = localStorage.getItem(storageKeys.theme);
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = savedTheme ? savedTheme === "dark" : prefersDark;

    if (shouldUseDark) {
      root.classList.add("dark");
    }
    setThemeIcon(shouldUseDark);

    btn?.addEventListener("click", () => {
      root.classList.toggle("dark");
      const isDark = root.classList.contains("dark");
      setThemeIcon(isDark);
      localStorage.setItem(storageKeys.theme, isDark ? "dark" : "light");
      document.dispatchEvent(new CustomEvent("theme-changed"));
    });
  }

  function initNavbarAndMenu() {
    const navbar = q("#navbar");
    const root = document.documentElement;
    const page = document.body.dataset.page;
    qa(`[data-nav='${page}']`).forEach((el) => el.classList.add("text-orange-500", "font-semibold"));

    // Apply the same hero-style nav typography across all pages.
    qa(".nav-link").forEach((link) => {
      link.classList.add("text-xs", "uppercase", "tracking-[0.18em]");
    });

    const applyNavContrast = (scrolled) => {
      const desktopLinks = qa(".nav-link").filter((link) => !link.classList.contains("text-orange-500"));
      desktopLinks.forEach((link) => {
        // Hero state: bright links over media; scrolled state: readable on solid navbar.
        link.classList.toggle("text-white/90", !scrolled);
        link.classList.toggle("text-zinc-700", scrolled && !root.classList.contains("dark"));
        link.classList.toggle("text-zinc-200", scrolled && root.classList.contains("dark"));
      });
    };

    const update = () => {
      const scrolled = window.scrollY > 20;
      navbar?.classList.toggle("bg-white/90", scrolled);
      navbar?.classList.toggle("dark:bg-zinc-950/85", scrolled);
      navbar?.classList.toggle("backdrop-blur", scrolled);
      navbar?.classList.toggle("border-zinc-200/70", scrolled);
      navbar?.classList.toggle("dark:border-zinc-800", scrolled);
      applyNavContrast(scrolled);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    document.addEventListener("theme-changed", update);

    q("#mobile-menu-btn")?.addEventListener("click", () => q("#mobile-menu")?.classList.toggle("hidden"));
    qa(".mobile-link").forEach((link) => link.addEventListener("click", () => q("#mobile-menu")?.classList.add("hidden")));
  }

  function initScrollProgress() {
    const progress = q("#scroll-progress");
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress && (progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initRevealAndParallax() {
    const steps = qa(".story-step");
    const revealNodes = qa(".reveal");
    steps.forEach((step) => {
      const bg = step.dataset.bg;
      if (bg) step.style.backgroundImage = `url('${bg}')`;
    });
    if (revealNodes.length) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-8");
          }
        });
      }, { threshold: 0.2 });
      revealNodes.forEach((node) => {
        node.classList.add("opacity-0", "translate-y-8", "transition-all", "duration-700");
        obs.observe(node);
      });
    }
    if (steps.length) {
      window.addEventListener("scroll", () => {
        const y = window.scrollY;
        steps.forEach((step, idx) => step.style.backgroundPositionY = `${y * (0.12 + idx * 0.03)}px`);
      }, { passive: true });
    }
  }

  function initCounters() {
    const counters = qa(".counter");
    if (!counters.length) return;
    const seen = new WeakSet();
    const animate = (node) => {
      const target = Number(node.dataset.target || 0);
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / 1500, 1);
        node.textContent = Math.floor(target * (1 - (1 - p) ** 3)).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !seen.has(entry.target)) { seen.add(entry.target); animate(entry.target); }
      });
    }, { threshold: 0.45 });
    counters.forEach((c) => obs.observe(c));
  }

  function initCommunityHub() {
    const cards = qa(".community-card");
    const buttons = qa(".filter-btn");
    cards.forEach((card) => card.addEventListener("click", () => q(".community-extra", card)?.classList.toggle("hidden")));
    const setActive = (active) => buttons.forEach((btn) => {
      const on = btn === active;
      btn.classList.toggle("bg-orange-500", on);
      btn.classList.toggle("text-white", on);
      btn.classList.toggle("border-orange-500", on);
    });
    buttons.forEach((btn, i) => {
      if (i === 0) setActive(btn);
      btn.addEventListener("click", () => {
        setActive(btn);
        const f = btn.dataset.filter;
        cards.forEach((card) => card.classList.toggle("hidden", !(f === "all" || card.dataset.category === f)));
      });
    });
  }

  function initHomeGateway() {
    const items = qa(".home-gateway-item");
    const bg = q("#home-gateway-bg");
    const copy = q("#home-gateway-copy");
    if (!items.length || !bg || !copy) return;

    const setActive = (item) => {
      const nextBg = item.dataset.bg;
      const nextCopy = item.dataset.copy;
      if (nextBg) bg.style.backgroundImage = `url('${nextBg}')`;
      if (nextCopy) copy.textContent = nextCopy;
      items.forEach((btn) => {
        const active = btn === item;
        btn.classList.toggle("bg-white/25", active);
        btn.classList.toggle("border-orange-300/80", active);
      });
    };

    setActive(items[0]);
    items.forEach((item) => {
      item.addEventListener("mouseenter", () => setActive(item));
      item.addEventListener("focus", () => setActive(item));
      item.addEventListener("click", () => setActive(item));
    });
  }

  function initMicroInteractions() {
    const interactive = qa(".community-card, .hover-lift");
    interactive.forEach((node) => {
      node.classList.add("transition", "duration-300");
      node.addEventListener("mouseenter", () => node.classList.add("-translate-y-1"));
      node.addEventListener("mouseleave", () => {
        node.classList.remove("-translate-y-1");
        node.style.transform = "";
      });
      node.addEventListener("mousemove", (event) => {
        const rect = node.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        node.style.transform = `translateY(-2px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
      });
    });
  }

  function escapeHtml(v) {
    return v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  function getStoredPosts() {
    try { const v = JSON.parse(localStorage.getItem(storageKeys.posts) || "[]"); return Array.isArray(v) ? v : []; } catch { return []; }
  }

  function setStoredPosts(posts) { localStorage.setItem(storageKeys.posts, JSON.stringify(posts)); }

  function getAllPosts() { return [...getStoredPosts(), ...predefinedPosts].sort((a, b) => b.ts - a.ts); }

  function timeAgo(ts) {
    const sec = Math.floor((Date.now() - ts) / 1000);
    if (sec < 60) return "just now";
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
  }

  function socialIcon(source) {
    const s = (source || "").toLowerCase();
    if (s.includes("instagram")) {
      return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1"></circle></svg>';
    }
    if (s.includes("linkedin")) {
      return '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3A1.95 1.95 0 1 0 5.3 6.9 1.95 1.95 0 0 0 5.25 3zM20.44 13.32c0-3.02-1.61-4.82-4.26-4.82-1.96 0-2.84 1.08-3.33 1.84V8.5H9.48c.04 1.21 0 11.5 0 11.5h3.37v-6.42c0-.34.03-.69.12-.93.27-.69.88-1.4 1.9-1.4 1.34 0 1.88 1.03 1.88 2.53V20H20.44z"></path></svg>';
    }
    if (s.includes("facebook")) {
      return '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V5c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2V11H8v3h2.3v8h3.2z"></path></svg>';
    }
    return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12h16"></path><path d="M12 4v16"></path></svg>';
  }

  function renderFeed() {
    const list = q("#feed-list");
    if (!list) return;
    list.innerHTML = getAllPosts().slice(0, 3).map((p) => `
      <article class="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900">
        <div class="flex items-center justify-between px-4 pt-4">
          <div>
            <strong class="text-sm">${escapeHtml(p.name)}</strong>
            ${p.handle ? `<span class="ml-2 text-xs text-zinc-500">${escapeHtml(p.handle)}</span>` : ""}
          </div>
          <span class="text-xs text-zinc-500">${timeAgo(p.ts)}</span>
        </div>
        <div class="px-4 pb-4 pt-2">
          ${p.source ? `<p class="mb-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">${socialIcon(p.source)} ${escapeHtml(p.source)} Preview</p>` : ""}
          <p class="text-sm text-zinc-700 dark:text-zinc-200">${escapeHtml(p.message)}</p>
        </div>
        <img src="${escapeHtml(p.previewImage || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=80")}" alt="Social media preview image" class="h-48 w-full object-cover" loading="lazy" />
        <div class="flex items-center justify-between border-t border-zinc-200 px-4 py-3 text-xs dark:border-zinc-800">
          <span class="text-zinc-500">Social preview card</span>
          ${(p.postUrl || p.source)
            ? `<a href="${escapeHtml(p.postUrl || "#")}" class="inline-flex items-center gap-1 text-orange-500 transition hover:text-orange-400" target="_blank" rel="noopener noreferrer">View Post <span aria-hidden="true">↗</span></a>`
            : ""}
        </div>
      </article>
    `).join("");
  }

  function initLiveFeed() {
    renderFeed();
    q("#post-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = q("#post-name")?.value.trim();
      const message = q("#post-message")?.value.trim();
      if (!name || !message) return;
      const posts = getStoredPosts();
      posts.unshift({ name, message, source: "Community", postUrl: "", ts: Date.now() });
      setStoredPosts(posts.slice(0, 20));
      renderFeed();
      q("#post-form")?.reset();
    });
    setInterval(() => {
      const names = ["Nora", "Ethan", "Mila", "Kai"];
      const msgs = ["Would love a partner for growth experiments.", "Shipping my creator toolkit this weekend.", "Anyone open to testing an AI assistant prototype?", "Running customer interviews today - sharing insights soon."];
      const posts = getStoredPosts();
      posts.unshift({ name: names[Math.floor(Math.random() * names.length)], message: msgs[Math.floor(Math.random() * msgs.length)], source: "Community", postUrl: "", ts: Date.now() });
      setStoredPosts(posts.slice(0, 20));
      renderFeed();
    }, 16000);
  }

  function formatChatTime(ts) {
    const d = new Date(ts || Date.now());
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function renderChatHistory(showTyping = false) {
    const box = q("#chat-messages");
    if (!box) return;
    const history = JSON.parse(localStorage.getItem(storageKeys.chatLog) || "[]");
    box.innerHTML = "";

    history.forEach((m) => {
      const row = document.createElement("div");
      row.className = m.role === "user" ? "ml-auto w-fit max-w-[86%]" : "w-fit max-w-[86%]";
      row.innerHTML = `
        <div class="${m.role === "user" ? "rounded-2xl rounded-br-sm bg-orange-500 px-3 py-2 text-white" : "rounded-2xl rounded-bl-sm bg-zinc-200 px-3 py-2 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"}">
          ${escapeHtml(m.text)}
        </div>
        <p class="mt-1 text-[10px] text-zinc-500 ${m.role === "user" ? "text-right" : "text-left"}">${formatChatTime(m.ts)}</p>
      `;
      box.appendChild(row);
    });

    if (showTyping) {
      const typing = document.createElement("div");
      typing.className = "w-fit max-w-[86%]";
      typing.innerHTML = `
        <div class="rounded-2xl rounded-bl-sm bg-zinc-200 px-3 py-2 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <span class="inline-flex items-center gap-1">
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.2s]"></span>
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.1s]"></span>
            <span class="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500"></span>
          </span>
        </div>
      `;
      box.appendChild(typing);
    }
    box.scrollTop = box.scrollHeight;
  }

  function addChatMessage(role, text) {
    const log = JSON.parse(localStorage.getItem(storageKeys.chatLog) || "[]");
    log.push({ role, text, ts: Date.now() });
    localStorage.setItem(storageKeys.chatLog, JSON.stringify(log.slice(-40)));
    renderChatHistory();
  }

  function playNotification() {
    if (localStorage.getItem(storageKeys.chatSound) === "off") return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 880;
      gain.gain.value = 0.03;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore audio failures.
    }
  }

  function getAIReply(input) {
    const value = input.toLowerCase();
    if (value.includes("hello") || value.includes("hi")) return "Hello! Welcome to The Ember Network.";
    if (value.includes("join") || value.includes("membership")) return "You can join from the Community page membership section. We will review your application and onboard you.";
    if (value.includes("idea")) return "Start by defining one urgent problem, validate with real users, and iterate quickly with mentor feedback.";
    if (value.includes("help")) return "I can help with joining the network, programs, and startup guidance. Ask me anything.";
    if (value.includes("start") || value.includes("business")) return aiReplies.business;
    if (value.includes("review")) return aiReplies.review;
    return "I'm here to help you grow your ideas.";
  }

  function initChatbot() {
    const widget = q("#chat-widget");
    const panel = q("#chat-panel");
    const toggle = q("#chat-toggle");
    const close = q("#chat-close");
    const input = q("#chat-input");
    const soundToggle = q("#chat-sound-toggle");

    const isOpen = () => !!panel && !panel.classList.contains("hidden");
    const setOpen = (open) => {
      if (!panel) return;
      panel.classList.toggle("hidden", !open);
      panel.classList.toggle("pointer-events-none", !open);
      panel.classList.toggle("opacity-0", !open);
      panel.classList.toggle("translate-y-3", !open);
      panel.classList.toggle("scale-[0.98]", !open);
      panel.classList.toggle("opacity-100", open);
      panel.classList.toggle("translate-y-0", open);
      panel.classList.toggle("scale-100", open);
      localStorage.setItem(storageKeys.chatOpen, open ? "1" : "0");
      if (open) input?.focus();
    };

    const history = JSON.parse(localStorage.getItem(storageKeys.chatLog) || "[]");
    if (!history.length) {
      localStorage.setItem(storageKeys.chatLog, JSON.stringify([{ role: "assistant", text: "Hello! I am Ember Assistant. How can I help today?", ts: Date.now() }]));
    }
    renderChatHistory();

    if (localStorage.getItem(storageKeys.chatSound) === null) localStorage.setItem(storageKeys.chatSound, "on");
    const syncSound = () => {
      if (!soundToggle) return;
      soundToggle.textContent = localStorage.getItem(storageKeys.chatSound) === "off" ? "Sound: Off" : "Sound: On";
    };
    syncSound();
    soundToggle?.addEventListener("click", () => {
      const next = localStorage.getItem(storageKeys.chatSound) === "off" ? "on" : "off";
      localStorage.setItem(storageKeys.chatSound, next);
      syncSound();
    });

    if (localStorage.getItem(storageKeys.chatOpen) === "1") setOpen(true);
    const toggleChat = () => setOpen(!isOpen());
    const closeChat = () => setOpen(false);
    toggle?.addEventListener("click", toggleChat);
    toggle?.addEventListener("touchend", (event) => {
      event.preventDefault();
      toggleChat();
    }, { passive: false });
    close?.addEventListener("click", closeChat);
    close?.addEventListener("touchend", (event) => {
      event.preventDefault();
      closeChat();
    }, { passive: false });

    document.addEventListener("click", (event) => {
      if (!isOpen() || !widget) return;
      if (!widget.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) setOpen(false);
    });

    const sendQuickReply = (btn) => {
      const txt = (btn.textContent || "").trim();
      if (!txt) return;
      addChatMessage("user", txt);
      renderChatHistory(true);
      setTimeout(() => {
        addChatMessage("assistant", getAIReply(txt));
        playNotification();
      }, 1100);
    };
    qa(".quick-reply").forEach((btn) => {
      btn.addEventListener("click", () => sendQuickReply(btn));
      btn.addEventListener("touchend", (event) => {
        event.preventDefault();
        sendQuickReply(btn);
      }, { passive: false });
    });

    q("#chat-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const txt = input?.value.trim() || "";
      if (!txt) return;
      addChatMessage("user", txt);
      renderChatHistory(true);
      setTimeout(() => {
        addChatMessage("assistant", getAIReply(txt));
        playNotification();
      }, 1200);
      if (input) input.value = "";
    });
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("flex", "pointer-events-auto");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex", "pointer-events-auto");
    modal.setAttribute("aria-hidden", "true");
  }

  function initRegistration() {
    const form = q("#registration-form");
    if (!form) return;
    const errorNode = q("#registration-error");
    const successModal = q("#success-modal");
    const successMessage = q("#success-message");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = q("#reg-name")?.value.trim();
      const email = q("#reg-email")?.value.trim();
      const role = q("#reg-role")?.value.trim();
      const idea = q("#reg-idea")?.value.trim();

      errorNode?.classList.add("hidden");
      if (!name || !email || !role || !idea) {
        if (errorNode) {
          errorNode.textContent = "Please complete all fields before submitting.";
          errorNode.classList.remove("hidden");
        }
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errorNode) {
          errorNode.textContent = "Please enter a valid email address.";
          errorNode.classList.remove("hidden");
        }
        return;
      }

      const submitBtn = q("button[type='submit'], button", form);
      if (submitBtn) submitBtn.disabled = true;
      submitSubmission({ source: "registration", name, email, role, idea })
        .then((result) => {
          if (successMessage) {
            successMessage.textContent = result?.fallback
              ? `Welcome ${name}. Your registration was saved and will be synced once online.`
              : `Welcome to the network, ${name}. A tailored onboarding email is on its way.`;
          }
          openModal(successModal);
          form.reset();
          setTimeout(() => addChatMessage("assistant", `Welcome ${name}! We received your registration and prepared starter resources for ${role.toLowerCase()}s.`), 500);
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    q("#close-success-btn")?.addEventListener("click", () => closeModal(successModal));
    successModal?.addEventListener("click", (e) => { if (e.target === successModal) closeModal(successModal); });
  }

  function initContactForm() {
    const form = q("#contact-form");
    if (!form) return;
    const submitBtn = q("button[type='submit'], button", form);
    let statusNode = q("#contact-form-status");
    if (!statusNode) {
      statusNode = document.createElement("p");
      statusNode.id = "contact-form-status";
      statusNode.className = "text-sm";
      form.appendChild(statusNode);
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const [nameInput, emailInput, messageInput] = qa("input, textarea", form);
      const payload = {
        source: "contact",
        name: nameInput?.value?.trim() || "",
        email: emailInput?.value?.trim() || "",
        message: messageInput?.value?.trim() || "",
      };
      if (!payload.name || !payload.email || !payload.message) {
        statusNode.textContent = "Please complete all fields.";
        statusNode.className = "text-sm text-red-500";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        statusNode.textContent = "Please enter a valid email address.";
        statusNode.className = "text-sm text-red-500";
        return;
      }
      statusNode.textContent = "Sending your message...";
      statusNode.className = "text-sm text-zinc-500 dark:text-zinc-400";
      if (submitBtn) submitBtn.disabled = true;
      submitSubmission(payload)
        .then((result) => {
          statusNode.textContent = result?.fallback
            ? "You're offline. Your message is saved locally and will sync when online."
            : "Message sent successfully. We'll be in touch shortly.";
          statusNode.className = result?.fallback ? "text-sm text-amber-500" : "text-sm text-emerald-500";
          form.reset();
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  function initBookingForm() {
    const form = q("#booking-form");
    if (!form) return;
    const submitBtn = q("button[type='submit'], button", form);
    let statusNode = q("#booking-form-status");
    if (!statusNode) {
      statusNode = document.createElement("p");
      statusNode.id = "booking-form-status";
      statusNode.className = "text-sm";
      form.appendChild(statusNode);
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = q("input[name='name'], #booking-name", form)?.value?.trim() || "";
      const email = q("input[type='email'], input[name='email'], #booking-email", form)?.value?.trim() || "";
      const details = q("textarea, #booking-details, #booking-message", form)?.value?.trim() || "";
      if (!name || !email || !details) {
        statusNode.textContent = "Please complete all booking fields.";
        statusNode.className = "text-sm text-red-500";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        statusNode.textContent = "Please enter a valid email address.";
        statusNode.className = "text-sm text-red-500";
        return;
      }
      statusNode.textContent = "Submitting booking request...";
      statusNode.className = "text-sm text-zinc-500 dark:text-zinc-400";
      if (submitBtn) submitBtn.disabled = true;
      submitSubmission({ source: "booking", name, email, details })
        .then((result) => {
          statusNode.textContent = result?.fallback
            ? "You're offline. Booking request saved locally and will sync when online."
            : "Booking request submitted. We will contact you shortly.";
          statusNode.className = result?.fallback ? "text-sm text-amber-500" : "text-sm text-emerald-500";
          form.reset();
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  async function submitSubmission(payload) {
    const endpoint = "./.netlify/functions/submit";
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Remote submit failed");
      return await res.json();
    } catch {
      const key = payload.source === "registration" ? storageKeys.registrations : "forge-contact-submissions";
      const current = JSON.parse(localStorage.getItem(key) || "[]");
      current.unshift({ ...payload, ts: Date.now(), fallback: true });
      localStorage.setItem(key, JSON.stringify(current.slice(0, 50)));
      return { ok: true, fallback: true };
    }
  }

  function initAccordions() {
    qa("[data-accordion-trigger]").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const id = trigger.getAttribute("data-accordion-trigger");
        const panel = q(`[data-accordion-panel='${id}']`);
        if (!panel) return;
        const isHidden = panel.classList.contains("hidden");
        panel.classList.toggle("hidden", !isHidden);
        trigger.setAttribute("aria-expanded", String(isHidden));
      });
    });
  }

  function initMultiStepApplication() {
    const form = q("#application-form");
    if (!form) return;
    const steps = qa("[data-step]", form);
    const progress = q("#application-progress");
    const progressText = q("#application-progress-text");
    const statusNode = q("#application-status");
    let currentStep = 0;

    const sync = () => {
      steps.forEach((step, index) => step.classList.toggle("hidden", index !== currentStep));
      const pct = ((currentStep + 1) / steps.length) * 100;
      if (progress) progress.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    };

    qa("[data-next-step]", form).forEach((btn) => {
      btn.addEventListener("click", () => {
        const requiredFields = qa("[required]", steps[currentStep]);
        const invalid = requiredFields.find((field) => !field.value?.trim());
        if (invalid) {
          statusNode && (statusNode.textContent = "Please complete required fields before continuing.");
          statusNode && (statusNode.className = "mt-4 text-sm text-red-500");
          invalid.focus();
          return;
        }
        currentStep = Math.min(currentStep + 1, steps.length - 1);
        statusNode && (statusNode.textContent = "");
        sync();
      });
    });

    qa("[data-prev-step]", form).forEach((btn) => {
      btn.addEventListener("click", () => {
        currentStep = Math.max(currentStep - 1, 0);
        statusNode && (statusNode.textContent = "");
        sync();
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const submitBtn = q("button[type='submit']", form);
      const payload = {
        source: "application",
        name: q("#app-name", form)?.value?.trim() || "",
        email: q("#app-email", form)?.value?.trim() || "",
        stage: q("#app-stage", form)?.value?.trim() || "",
        goal: q("#app-goal", form)?.value?.trim() || "",
        availability: q("#app-availability", form)?.value?.trim() || "",
      };
      if (!payload.name || !payload.email || !payload.stage || !payload.goal || !payload.availability) {
        statusNode && (statusNode.textContent = "Please complete all fields before submitting.");
        statusNode && (statusNode.className = "mt-4 text-sm text-red-500");
        return;
      }
      if (submitBtn) submitBtn.disabled = true;
      statusNode && (statusNode.textContent = "Submitting your application...");
      statusNode && (statusNode.className = "mt-4 text-sm text-zinc-500 dark:text-zinc-400");
      submitSubmission(payload)
        .then((result) => {
          statusNode && (statusNode.textContent = result?.fallback
            ? "Saved locally while offline. We will sync when online."
            : "Application submitted successfully. We'll contact you shortly.");
          statusNode && (statusNode.className = result?.fallback ? "mt-4 text-sm text-amber-500" : "mt-4 text-sm text-emerald-500");
          form.reset();
          currentStep = 0;
          sync();
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    sync();
  }

  function init() {
    injectNavbar();
    injectFooter();
    injectChatbot();

    initPageTransition();
    initTheme();
    initNavbarAndMenu();
    initScrollProgress();
    initRevealAndParallax();
    initCounters();
    initHomeGateway();
    initCommunityHub();
    initMicroInteractions();
    initLiveFeed();
    initRegistration();
    initContactForm();
    initBookingForm();
    initMultiStepApplication();
    initAccordions();
    initChatbot();
  }

  document.addEventListener("DOMContentLoaded", init);
})();





