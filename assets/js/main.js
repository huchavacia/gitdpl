/* ==========================================================================
   Lernwick — site script (vanilla, no dependencies)
   menu · tabs · popular filter · master-class countdown · catalogue filters ·
   course tabs · coupon · wishlist · billing toggle · accordion · forms · reveal
   ========================================================================== */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  document.documentElement.classList.add("js");
  $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode: keep in memory */ } },
  };

  /* ---------- toast ---------- */
  const toastEl = $(".toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3600);
  }

  /* ---------- mobile menu ---------- */
  const burger = $(".burger");
  const nav = $("#site-nav");
  if (burger && nav) {
    const setMenu = (open, returnFocus) => {
      nav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (open) $("a", nav)?.focus();
      else if (returnFocus) burger.focus();
    };
    burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false, true);
    });
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !burger.contains(e.target)) setMenu(false);
    });
  }

  /* ---------- ARIA tabs helper ---------- */
  function tabs(list, onSelect) {
    const items = $$('[role="tab"]', list);
    const select = (tab, focus) => {
      items.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      if (focus) tab.focus();
      onSelect(tab);
    };
    items.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); select(items[(i + d + items.length) % items.length], true); }
        if (e.key === "Home") { e.preventDefault(); select(items[0], true); }
        if (e.key === "End") { e.preventDefault(); select(items[items.length - 1], true); }
      });
    });
    return select;
  }

  function setErr(field, msg) {
    const wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.toggle("is-invalid", !!msg);
    const err = $("[data-err]", wrap);
    if (err) err.textContent = msg || "";
    field.setAttribute("aria-invalid", msg ? "true" : "false");
  }

  /* ---------- newsletter ---------- */
  $$("[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("input[type=email]", form);
      const note = $(".form-note", form);
      const ok = EMAIL.test(input.value.trim());
      note.className = "form-note " + (ok ? "is-ok" : "is-err");
      note.textContent = ok ? "You’re in! Your first free lesson arrives on Friday." : "Please enter a valid email address.";
      if (ok) form.reset(); else input.focus();
    });
  });

  /* ---------- home: popular course tabs ---------- */
  const popGrid = $("[data-pop-grid]");
  const popTabs = $('[role="tablist"][aria-label="Course category"]');
  if (popGrid && popTabs) {
    tabs(popTabs, (tab) => {
      popGrid.setAttribute("aria-labelledby", tab.id);
      const cat = tab.dataset.cat;
      $$(".ccard", popGrid).forEach((c) => { c.hidden = cat !== "all" && c.dataset.cat !== cat; });
    });
  }

  /* ---------- home: live master class ---------- */
  const cd = $("[data-countdown]");
  if (cd) {
    // next Thursday, 18:00 local time (or next week's, if this one has passed)
    const next = new Date();
    next.setHours(18, 0, 0, 0);
    next.setDate(next.getDate() + ((4 - next.getDay() + 7) % 7));
    if (next <= new Date()) next.setDate(next.getDate() + 7);
    $("[data-mc-date]").textContent = next.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + ", 6:00 pm";
    const tick = () => {
      const ms = Math.max(0, next - Date.now());
      $('[data-cd="d"]', cd).textContent = Math.floor(ms / 864e5);
      $('[data-cd="h"]', cd).textContent = Math.floor(ms / 36e5) % 24;
      $('[data-cd="m"]', cd).textContent = Math.floor(ms / 6e4) % 60;
    };
    tick();
    setInterval(tick, 30000);

    const save = $("[data-save-seat]");
    const seats = $("[data-mc-seats]");
    save.addEventListener("click", () => {
      seats.textContent = Math.max(0, Number(seats.textContent) - 1);
      save.disabled = true;
      save.textContent = "Seat saved ✓";
      toast("Seat saved! In a real site this would email a calendar invite.");
    });
  }

  /* ---------- courses: catalogue filters ---------- */
  const grid = $("[data-c-grid]");
  if (grid) {
    const cards = $$(".ccard", grid);
    const search = $("[data-c-search]");
    const chips = $$("[data-c-cat]");
    const level = $("[data-c-level]");
    const price = $("[data-c-price]");
    const sort = $("[data-c-sort]");
    const empty = $("[data-c-empty]");
    const count = $("[data-c-count]");
    let cat = "all";

    const SORTS = {
      popular: (a, b) => b.dataset.students - a.dataset.students,
      rating: (a, b) => b.dataset.rating - a.dataset.rating,
      "price-asc": (a, b) => a.dataset.price - b.dataset.price,
      "price-desc": (a, b) => b.dataset.price - a.dataset.price,
    };

    function apply() {
      const q = search.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach((c) => {
        const text = (c.dataset.title + " " + $(".ccard__by", c).textContent).toLowerCase();
        const p = Number(c.dataset.price);
        const hit = (!q || text.includes(q))
          && (cat === "all" || c.dataset.cat === cat)
          && (level.value === "all" || c.dataset.level === level.value)
          && (price.value === "all" || (price.value === "free" ? p === 0 : p > 0));
        c.hidden = !hit;
        if (hit) shown++;
      });
      cards.slice().sort(SORTS[sort.value]).forEach((c) => grid.appendChild(c));
      count.textContent = shown;
      empty.hidden = shown > 0;
    }

    search.addEventListener("input", apply);
    [level, price, sort].forEach((s) => s.addEventListener("change", apply));
    chips.forEach((c) => c.addEventListener("click", () => {
      cat = c.dataset.cCat;
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      apply();
    }));
    $("[data-c-reset]").addEventListener("click", () => {
      search.value = ""; level.value = "all"; price.value = "all"; cat = "all";
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.cCat === "all")));
      apply();
      search.focus();
    });
    if (location.hash === "#search") search.focus();
    apply();
  }

  /* ---------- course: tabs, preview, coupon, wishlist, enrol ---------- */
  const courseTabs = $('[role="tablist"][aria-label="Course sections"]');
  if (courseTabs) {
    const select = tabs(courseTabs, (tab) => {
      $$('[role="tabpanel"]').forEach((p) => { p.hidden = p.id !== tab.getAttribute("aria-controls"); });
    });
    $$("[data-open-tab]").forEach((a) => a.addEventListener("click", (e) => {
      e.preventDefault();
      const tab = document.getElementById(a.dataset.openTab);
      select(tab, true);
      tab.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    }));
  }
  $("[data-preview]")?.addEventListener("click", () => toast("The free 2-minute preview would play here. Swap in your video embed."));

  const coupon = $("[data-coupon]");
  if (coupon) {
    const BASE = 49;
    const CODES = { LERN20: 0.2, FRIEND10: 0.1 };
    const now = $("[data-price-now]");
    coupon.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#coupon", coupon);
      const code = input.value.trim().toUpperCase();
      if (!code) { setErr(input, "Enter a code first."); input.focus(); return; }
      if (!(code in CODES)) { setErr(input, "That code isn’t valid. Try LERN20."); input.focus(); return; }
      setErr(input, "");
      const p = BASE * (1 - CODES[code]);
      now.textContent = "$" + (Number.isInteger(p) ? p : p.toFixed(2));
      toast(`Code ${code} applied: ${CODES[code] * 100}% off.`);
    });
  }

  const wish = $("[data-wishlist]");
  if (wish) {
    const paint = (on) => {
      wish.setAttribute("aria-pressed", String(on));
      wish.textContent = on ? "♥ Saved for later" : "♡ Save for later";
    };
    paint(store.get("lw-wish", false));
    wish.addEventListener("click", () => {
      const on = wish.getAttribute("aria-pressed") !== "true";
      store.set("lw-wish", on);
      paint(on);
    });
  }
  $("[data-enrol]")?.addEventListener("click", () => {
    toast(`Demo: enrolled for ${$("[data-price-now]").textContent}. Connect your checkout or LMS here.`);
  });

  /* ---------- pricing: billing toggle ---------- */
  const billBtns = $$("[data-billing]");
  if (billBtns.length) {
    const setBilling = (mode) => {
      billBtns.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.billing === mode)));
      $$(".plan").forEach((plan) => {
        const num = $("[data-price]", plan);
        if (!num) return;
        num.textContent = "$" + num.dataset[mode];
        $("[data-note]", plan).textContent = mode === "yearly"
          ? `Billed yearly: $${num.dataset.yearly * 12}`
          : "Billed monthly";
      });
    };
    billBtns.forEach((b) => b.addEventListener("click", () => setBilling(b.dataset.billing)));
    $$("[data-plan]").forEach((b) => b.addEventListener("click", () => toast(`Demo: ${b.dataset.plan} plan selected. Connect your billing provider here.`)));
  }

  /* ---------- accordion ---------- */
  $$("[data-acc] .acc__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      document.getElementById(btn.getAttribute("aria-controls")).hidden = !open;
    });
  });

  /* ---------- contact form ---------- */
  const contact = $("[data-contact]");
  if (contact) {
    const topicChips = $$("[data-topic-v]", contact);
    topicChips.forEach((c) => c.addEventListener("click", () => {
      topicChips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      contact.elements.topic.value = c.dataset.topicV;
    }));
    const rules = {
      name: (v) => (v.trim().length >= 2 ? "" : "Please tell us your name."),
      email: (v) => (EMAIL.test(v.trim()) ? "" : "Please enter a valid email."),
      message: (v) => (v.trim().length >= 10 ? "" : "A little more detail, please (10+ characters)."),
    };
    Object.keys(rules).forEach((n) => {
      contact.elements[n].addEventListener("blur", (e) => setErr(e.target, rules[n](e.target.value)));
    });
    contact.addEventListener("submit", (e) => {
      e.preventDefault();
      let first = null;
      Object.entries(rules).forEach(([n, rule]) => {
        const el = contact.elements[n];
        const msg = rule(el.value);
        setErr(el, msg);
        if (msg && !first) first = el;
      });
      const note = $(".form-note", contact);
      note.className = "form-note " + (first ? "is-err" : "is-ok");
      note.textContent = first
        ? "Please check the highlighted fields."
        : `Thanks! Your note about “${contact.elements.topic.value.toLowerCase()}” is on its way (demo). Connect this form to your inbox.`;
      if (first) { first.focus(); return; }
      contact.reset();
      topicChips.forEach((x, i) => x.setAttribute("aria-pressed", String(i === 0)));
    });
  }

  /* ---------- reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }
})();
