// Global Academic Leaders: header, menus, testimonial filter and the SAT guide form.
(() => {
  const header = document.querySelector("[data-header]");
  const menuToggle = header.querySelector(".menu-toggle");
  const offerItem = header.querySelector(".has-menu");
  const offerTrigger = offerItem.querySelector(".site-nav__trigger");

  // Lift the header off the page once it scrolls.
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile menu.
  const setMenu = (open) => {
    header.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuToggle.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));

  // "What I offer" dropdown.
  const setOffer = (open) => {
    offerItem.classList.toggle("is-open", open);
    offerTrigger.setAttribute("aria-expanded", String(open));
  };
  offerTrigger.addEventListener("click", () => setOffer(!offerItem.classList.contains("is-open")));
  document.addEventListener("click", (event) => {
    if (!offerItem.contains(event.target)) setOffer(false);
    if (!header.contains(event.target)) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (offerItem.classList.contains("is-open")) {
      setOffer(false);
      offerTrigger.focus();
    } else if (header.classList.contains("is-open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  // Testimonials filter.
  const filter = document.querySelector("[data-filter-group]");
  if (filter) {
    const cards = [...document.querySelectorAll("[data-quotes] [data-service]")];
    const status = document.querySelector("[data-filter-status]");
    filter.addEventListener("click", (event) => {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      const value = button.dataset.filter;
      filter.querySelectorAll("[data-filter]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
      let shown = 0;
      cards.forEach((card) => {
        const match = value === "all" || card.dataset.service === value;
        card.hidden = !match;
        if (match) shown += 1;
      });
      status.textContent = `Showing ${shown} ${shown === 1 ? "testimonial" : "testimonials"}`;
    });
  }

  // SAT guide form. Add data-endpoint="https://..." to the form (Formspree, Netlify
  // Forms, or an email automation) and it posts there. Without one, it opens the
  // visitor's email app with the request addressed to Shubh.
  const form = document.querySelector("[data-guide-form]");
  if (form) {
    const input = form.querySelector("input[type=email]");
    const fields = form.querySelector(".guide-form__fields");
    const error = form.querySelector(".guide-form__error");
    const success = form.querySelector(".guide-form__success");
    const button = form.querySelector("button[type=submit]");
    const invalidMessage = error.textContent;

    const isValid = () => input.value.trim() !== "" && input.checkValidity();
    const showError = (message = invalidMessage) => {
      error.textContent = message;
      error.hidden = false;
      input.setAttribute("aria-invalid", "true");
    };
    const clearError = () => {
      error.hidden = true;
      input.setAttribute("aria-invalid", "false");
    };

    input.addEventListener("blur", () => {
      if (input.value && !isValid()) showError();
    });
    input.addEventListener("input", () => {
      if (!error.hidden && isValid()) clearError();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!isValid()) {
        showError();
        input.focus();
        return;
      }
      const email = input.value.trim();
      const label = button.textContent;
      button.disabled = true;
      button.textContent = "Sending...";
      try {
        let title = "Check your inbox.";
        let text = `The guide is on its way to ${email}.`;
        if (form.dataset.endpoint) {
          const response = await fetch(form.dataset.endpoint, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: new FormData(form),
          });
          if (!response.ok) throw new Error(`Guide request failed: ${response.status}`);
        } else {
          const subject = encodeURIComponent("Free SAT guide");
          const body = encodeURIComponent(`Hi Shubh, please send the free SAT guide and resources to ${email}.`);
          window.location.href = `mailto:${form.dataset.fallbackEmail}?subject=${subject}&body=${body}`;
          title = "One more step.";
          text = "Send the email that just opened, and I'll reply with the guide.";
        }
        success.querySelector("[data-guide-title]").textContent = title;
        success.querySelector("[data-guide-text]").textContent = text;
        fields.hidden = true;
        success.hidden = false;
        success.focus();
      } catch (err) {
        console.error(err);
        showError("That didn't go through. Check your connection and try again.");
      } finally {
        button.disabled = false;
        button.textContent = label;
      }
    });
  }
})();
