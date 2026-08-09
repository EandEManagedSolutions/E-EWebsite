/* ==========================================================================
   E&E Managed Solutions -- interaction
   --------------------------------------------------------------------------
   No dependencies, no build step. Everything degrades: with JavaScript off
   the nav is a plain visible list, all content is visible, and the contact
   form still submits.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Header: solid once you have scrolled past the hero lip ----------- */
  var header = document.querySelector(".site-header");

  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- Mobile navigation ------------------------------------------------ */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  if (toggle && links) {
    var setNav = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Escape closes and returns focus to the button that opened it.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setNav(false);
        toggle.focus();
      }
    });

    // Any navigation choice closes the panel.
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setNav(false);
    });

    // Clicking away closes it.
    document.addEventListener("click", function (e) {
      if (
        toggle.getAttribute("aria-expanded") === "true" &&
        !e.target.closest(".nav") &&
        !e.target.closest(".nav-toggle")
      ) {
        setNav(false);
      }
    });

    // Returning to desktop width must not leave the panel in a stuck state.
    window.matchMedia("(min-width: 881px)").addEventListener("change", function (e) {
      if (e.matches) setNav(false);
    });
  }

  /* --- Reveal on scroll -------------------------------------------------- */
  var revealables = document.querySelectorAll(".reveal");

  if (!revealables.length) {
    // nothing to do
  } else if (reduceMotion || !("IntersectionObserver" in window)) {
    // Show everything immediately rather than animating it.
    revealables.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          // Stagger siblings slightly so a grid settles in sequence rather
          // than snapping in as one block.
          var group = entry.target.parentElement;
          var index = group ? Array.prototype.indexOf.call(group.children, entry.target) : 0;
          entry.target.style.transitionDelay = Math.min(index, 5) * 70 + "ms";

          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealables.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --- Footer year ------------------------------------------------------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());

  /* --- Contact form ------------------------------------------------------
     Uses the browser's own constraint validation; this only takes over the
     messaging so errors appear next to the field instead of in a tooltip
     that vanishes. The form still posts normally when valid.
     --------------------------------------------------------------------- */
  var form = document.querySelector("[data-validate]");

  if (form) {
    var showError = function (field, message) {
      var holder = field.closest(".field");
      if (!holder) return;

      var note = holder.querySelector(".field-error");
      if (!note) {
        note = document.createElement("p");
        note.className = "field-hint field-error";
        note.style.color = "var(--danger)";
        note.id = field.id + "-error";
        holder.appendChild(note);
      }

      note.textContent = message;
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", note.id);
      field.style.borderColor = "var(--danger)";
    };

    var clearError = function (field) {
      var holder = field.closest(".field");
      if (!holder) return;

      var note = holder.querySelector(".field-error");
      if (note) note.remove();

      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
      field.style.borderColor = "";
    };

    var messageFor = function (field) {
      if (field.validity.valueMissing) {
        return field.dataset.missing || "This one's required.";
      }
      if (field.validity.typeMismatch && field.type === "email") {
        return "That email address doesn't look right — check for a typo.";
      }
      if (field.validity.tooShort) {
        return "A little more detail would help.";
      }
      return "Please check this field.";
    };

    form.setAttribute("novalidate", "");

    form.addEventListener("submit", function (e) {
      var invalid = null;

      Array.prototype.forEach.call(form.elements, function (field) {
        if (!field.willValidate) return;

        if (field.checkValidity()) {
          clearError(field);
        } else {
          showError(field, messageFor(field));
          if (!invalid) invalid = field;
        }
      });

      if (invalid) {
        e.preventDefault();
        invalid.focus();
        invalid.scrollIntoView({
          block: "center",
          behavior: reduceMotion ? "auto" : "smooth"
        });
      }
    });

    // Clear an error as soon as the person fixes it.
    form.addEventListener("input", function (e) {
      if (e.target.willValidate && e.target.checkValidity()) clearError(e.target);
    });
  }
})();
