/**
 * VLC Homes — Gestión del consentimiento de cookies (LSSI-CE / RGPD).
 * Inyecta el banner y el panel de preferencias, y expone
 * window.VLCCookies para reabrir la configuración desde cualquier página.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "vlchomes_cookie_consent";
  const CONSENT_VERSION = 1;

  function readConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.version !== CONSENT_VERSION) return null;
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(partial) {
    const consent = {
      necessary: true,
      analytics: !!partial.analytics,
      marketing: !!partial.marketing,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {
      /* localStorage no disponible: el aviso volverá a mostrarse en la próxima visita */
    }
    document.dispatchEvent(new CustomEvent("vlccookiesconsent", { detail: consent }));
    return consent;
  }

  /* ---------- Markup ---------- */
  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "region");
  banner.setAttribute("aria-label", "Aviso de cookies");
  banner.innerHTML = `
    <div class="cookie-banner-text">
      <p>Utilizamos cookies propias y, en su caso, de terceros para fines técnicos y,
      con tu consentimiento, analíticos o de personalización. Puedes aceptarlas todas,
      rechazar las no esenciales o configurar tus preferencias. Más información en
      nuestra <a href="politica-cookies.html">Política de Cookies</a>.</p>
    </div>
    <div class="cookie-banner-actions">
      <button type="button" class="btn btn-outline btn-sm" data-cookie-action="reject">Rechazar no esenciales</button>
      <button type="button" class="btn btn-ghost btn-sm" data-cookie-action="settings">Configurar</button>
      <button type="button" class="btn btn-primary btn-sm" data-cookie-action="accept">Aceptar todas</button>
    </div>
  `;

  const overlay = document.createElement("div");
  overlay.className = "cookie-modal-overlay";
  overlay.innerHTML = `
    <div class="cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookie-modal-title">
      <div class="cookie-modal-header">
        <div>
          <h2 id="cookie-modal-title">Preferencias de cookies</h2>
        </div>
        <button type="button" class="cookie-modal-close" data-cookie-action="close" aria-label="Cerrar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>
      <p class="cookie-modal-intro">
        Elige qué categorías de cookies quieres permitir. Puedes cambiar esta decisión
        en cualquier momento desde el enlace "Preferencias de cookies" del pie de página.
        Consulta el detalle en nuestra <a href="politica-cookies.html">Política de Cookies</a>.
      </p>

      <div class="cookie-category">
        <div class="cookie-category-head">
          <h3>Necesarias</h3>
          <label class="cookie-switch">
            <input type="checkbox" checked disabled aria-label="Cookies necesarias, siempre activas">
            <span class="cookie-switch-track"></span>
          </label>
        </div>
        <p>Imprescindibles para que la web funcione correctamente y para recordar tu decisión sobre cookies. No requieren consentimiento (art. 22.2 LSSI-CE).</p>
      </div>

      <div class="cookie-category">
        <div class="cookie-category-head">
          <h3>Analíticas</h3>
          <label class="cookie-switch">
            <input type="checkbox" id="cookie-toggle-analytics" aria-label="Permitir cookies analíticas">
            <span class="cookie-switch-track"></span>
          </label>
        </div>
        <p>Nos ayudarían a entender cómo se usa la web para mejorarla. Actualmente no se activan hasta que exista una herramienta analítica en funcionamiento.</p>
      </div>

      <div class="cookie-category">
        <div class="cookie-category-head">
          <h3>Marketing</h3>
          <label class="cookie-switch">
            <input type="checkbox" id="cookie-toggle-marketing" aria-label="Permitir cookies de marketing">
            <span class="cookie-switch-track"></span>
          </label>
        </div>
        <p>Permitirían mostrar comunicaciones o anuncios personalizados sobre nuestras propiedades. Actualmente no se utilizan.</p>
      </div>

      <div class="cookie-modal-footer">
        <button type="button" class="btn btn-outline" data-cookie-action="reject">Rechazar no esenciales</button>
        <button type="button" class="btn btn-primary" data-cookie-action="save">Guardar preferencias</button>
      </div>
    </div>
  `;

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(banner);
    document.body.appendChild(overlay);

    const analyticsToggle = overlay.querySelector("#cookie-toggle-analytics");
    const marketingToggle = overlay.querySelector("#cookie-toggle-marketing");

    function showBanner() {
      requestAnimationFrame(() => banner.classList.add("is-visible"));
    }
    function hideBanner() {
      banner.classList.remove("is-visible");
    }
    function openModal() {
      const current = readConsent();
      analyticsToggle.checked = !!(current && current.analytics);
      marketingToggle.checked = !!(current && current.marketing);
      overlay.classList.add("is-visible");
    }
    function closeModal() {
      overlay.classList.remove("is-visible");
    }

    const existing = readConsent();
    if (!existing) {
      showBanner();
    }

    document.addEventListener("click", (event) => {
      const action = event.target.closest("[data-cookie-action]");
      if (!action) return;
      const type = action.dataset.cookieAction;

      if (type === "accept") {
        saveConsent({ analytics: true, marketing: true });
        hideBanner();
        closeModal();
      } else if (type === "reject") {
        saveConsent({ analytics: false, marketing: false });
        hideBanner();
        closeModal();
      } else if (type === "settings") {
        openModal();
      } else if (type === "save") {
        saveConsent({ analytics: analyticsToggle.checked, marketing: marketingToggle.checked });
        hideBanner();
        closeModal();
      } else if (type === "close") {
        closeModal();
      }
    });

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-visible")) closeModal();
    });

    window.VLCCookies = {
      getConsent: readConsent,
      openPreferences: () => {
        openModal();
        hideBanner();
      },
    };
  });
})();
