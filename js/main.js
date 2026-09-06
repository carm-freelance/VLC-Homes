(function () {
  "use strict";

  /* ---------- Header shadow on scroll ---------- */
  const header = document.getElementById("site-header");
  const onScroll = () => {
    if (window.scrollY > 8) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");

  const closeMobileNav = () => {
    mobileNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  /* ---------- Property filters ---------- */
  const filterButtons = document.querySelectorAll("#property-filters .filter-btn");
  const propertyCards = document.querySelectorAll("#property-grid .property-card");
  const noResults = document.getElementById("no-results");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      propertyCards.forEach((card) => {
        const tags = card.dataset.tags || "";
        const matches = filter === "all" || tags.split(" ").includes(filter);
        card.style.display = matches ? "" : "none";
        if (matches) visibleCount++;
      });

      noResults.hidden = visibleCount !== 0;
    });
  });

  /* ---------- Contact form validation ---------- */
  const form = document.getElementById("contact-form");
  const successMsg = document.getElementById("form-success");

  const validators = {
    nombre: (v) => v.trim().length > 1,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    mensaje: (v) => v.trim().length > 4,
  };

  function setFieldState(field, valid) {
    field.classList.toggle("has-error", !valid);
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let isValid = true;

      Object.keys(validators).forEach((name) => {
        const input = form.elements[name];
        const field = input.closest(".form-field");
        const valid = validators[name](input.value);
        setFieldState(field, valid);
        if (!valid) isValid = false;
      });

      const rgpd = form.elements["rgpd"];
      const rgpdField = rgpd.closest(".checkbox-field");
      const rgpdValid = rgpd.checked;
      rgpdField.classList.toggle("has-error", !rgpdValid);
      if (!rgpdValid) isValid = false;

      if (!isValid) {
        const firstError = form.querySelector(".has-error");
        if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      // Demo submission — replace with a real endpoint integration.
      successMsg.hidden = false;
      form.reset();
      form.querySelectorAll(".has-error").forEach((el) => el.classList.remove("has-error"));
      successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    Object.keys(validators).forEach((name) => {
      const input = form.elements[name];
      input.addEventListener("input", () => {
        const field = input.closest(".form-field");
        if (field.classList.contains("has-error") && validators[name](input.value)) {
          setFieldState(field, true);
        }
      });
    });

    form.elements["rgpd"].addEventListener("change", (e) => {
      const field = e.target.closest(".checkbox-field");
      if (e.target.checked) field.classList.remove("has-error");
    });
  }

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
