/**
 * §6.6 — Services accordion + auto-advance 6s.
 *
 * Advance dipicu `animationend` dari progress bar, bukan
 * setTimeout: pause on hover jadi gratis (CSS
 * animation-play-state: paused ikut menunda animationend), dan
 * bar selalu sinkron dengan timer.
 *
 * Tambahan di luar situs referensi: pause on hover/focus, dan
 * auto-advance dimatikan permanen setelah klik manual.
 */
export function initServices(root = document) {
  const grid = root.querySelector("[data-services]");
  if (!grid) return () => {};

  const items = Array.from(grid.querySelectorAll("[data-service]"));
  const details = Array.from(grid.querySelectorAll("[data-detail]"));
  if (!items.length) return () => {};

  let index = items.findIndex((el) => el.classList.contains("active"));
  if (index < 0) index = 0;

  const setActive = (next) => {
    index = (next + items.length) % items.length;
    items.forEach((item, i) => {
      const on = i === index;
      item.classList.toggle("active", on);
      item.setAttribute("aria-selected", String(on));
      item.setAttribute("tabindex", on ? "0" : "-1");
    });
    details.forEach((d, i) => {
      const on = i === index;
      d.classList.toggle("visible", on);
      d.toggleAttribute("inert", !on);
      d.setAttribute("aria-hidden", String(!on));
    });
  };

  const onAnimEnd = (e) => {
    if (!e.target.classList.contains("service-progress")) return;
    if (grid.classList.contains("locked")) return;
    setActive(index + 1);
  };
  grid.addEventListener("animationend", onAnimEnd);

  // Pause on hover / focus.
  const pause = () => grid.classList.add("paused");
  const resume = () => grid.classList.remove("paused");
  grid.addEventListener("pointerenter", pause);
  grid.addEventListener("pointerleave", resume);
  grid.addEventListener("focusin", pause);
  grid.addEventListener("focusout", resume);

  // Klik manual → auto-advance mati permanen.
  items.forEach((item, i) => {
    item.addEventListener("click", () => {
      grid.classList.add("locked");
      setActive(i);
    });
    item.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      grid.classList.add("locked");
      setActive(i + dir);
      items[index].focus();
    });
  });

  setActive(index);

  return () => {
    grid.removeEventListener("animationend", onAnimEnd);
    grid.removeEventListener("pointerenter", pause);
    grid.removeEventListener("pointerleave", resume);
  };
}
