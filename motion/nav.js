/**
 * §6.1 — Navigation behaviour.
 * State: .scrolled (background + blur), .hidden (sembunyi saat
 * scroll turun), .nav-dark (inversi di atas section gelap).
 * Semua pembacaan scroll dibatch dalam satu rAF.
 */
export function initNav(root = document) {
  const nav = root.querySelector("[data-nav]");
  if (!nav) return () => {};

  const darkSections = Array.from(root.querySelectorAll("[data-dark]"));
  const drawer = root.querySelector("[data-drawer]");
  const moreBtn = root.querySelector("[data-more]");
  const burger = root.querySelector("[data-burger]");
  const menu = root.querySelector("[data-mobile-menu]");
  const navH = nav.offsetHeight || 56;

  let lastY = window.scrollY;
  let ticking = false;

  const update = () => {
    const y = window.scrollY;

    nav.classList.toggle("scrolled", y > 40);

    // Sembunyi saat turun (setelah lewat hero), muncul saat naik.
    if (y > 240 && y > lastY + 4) nav.classList.add("hidden");
    else if (y < lastY - 4) nav.classList.remove("hidden");

    // Inversi warna kalau band nav menimpa section gelap.
    const overDark = darkSections.some((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= navH * 0.6 && r.bottom >= navH * 0.6;
    });
    nav.classList.toggle("nav-dark", overDark);

    lastY = y;
    ticking = false;
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  update();

  // Drawer: hover ditangani CSS; klik untuk keyboard & touch.
  const onMore = () => {
    const open = drawer.classList.toggle("open");
    moreBtn.setAttribute("aria-expanded", String(open));
  };
  if (moreBtn && drawer) moreBtn.addEventListener("click", onMore);

  // Mobile menu
  const closeMenu = () => {
    menu.classList.remove("open");
    document.body.classList.remove("menu-open");
    burger.setAttribute("aria-expanded", "false");
  };
  const onBurger = () => {
    const open = menu.classList.toggle("open");
    document.body.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
  };
  if (burger && menu) {
    burger.addEventListener("click", onBurger);
    menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
  }

  const onKey = (e) => {
    if (e.key !== "Escape") return;
    if (menu && menu.classList.contains("open")) closeMenu();
    if (drawer && drawer.classList.contains("open")) {
      drawer.classList.remove("open");
      moreBtn.setAttribute("aria-expanded", "false");
    }
  };
  window.addEventListener("keydown", onKey);

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("keydown", onKey);
  };
}
