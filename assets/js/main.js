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
     that vanishes. Once valid, the form is posted to its action (Formspree)
     in the background so nobody is thrown onto a third-party page. If fetch
     is unavailable the browser posts it the ordinary way instead.
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

    /* Background submit --------------------------------------------------- */
    var statusNote  = form.querySelector("[data-form-status]");
    var submitBtn   = form.querySelector("[type=submit]");
    var submitLabel = submitBtn ? submitBtn.textContent : "";
    var canPostInBackground = typeof window.fetch === "function" && "FormData" in window;
    var sending = false;

    var fallbackEmail = "support@eandemanagedsolutions.com";

    var setStatus = function (message, ok) {
      if (!statusNote) return;
      statusNote.textContent = message;
      statusNote.classList.toggle("is-ok", ok);
      statusNote.classList.toggle("is-error", !ok);
      statusNote.hidden = false;
      statusNote.scrollIntoView({
        block: "nearest",
        behavior: reduceMotion ? "auto" : "smooth"
      });
    };

    // Formspree replies with { errors: [{ field, message }] } when it refuses.
    var reasonFrom = function (data) {
      if (data && data.errors && data.errors.length && data.errors[0].message) {
        return data.errors[0].message;
      }
      return "";
    };

    var send = function () {
      if (sending) return;
      sending = true;

      if (statusNote) statusNote.hidden = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending…";
      }

      var done = function () {
        sending = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        }
      };

      window.fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          return res.json()
            .catch(function () { return {}; })
            .then(function (data) { return { ok: res.ok, data: data }; });
        })
        .then(function (result) {
          done();

          if (result.ok) {
            form.reset();
            setStatus(
              "Thanks — that's with us. You'll hear back from one of us, usually the same day.",
              true
            );
          } else {
            setStatus(
              reasonFrom(result.data) ||
                "Something went wrong at our end. Please try again, or email us at " + fallbackEmail + ".",
              false
            );
          }
        })
        .catch(function () {
          done();
          setStatus(
            "That didn't send — check your connection and try again, or email us at " + fallbackEmail + ".",
            false
          );
        });
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
        return;
      }

      if (!canPostInBackground) return; // let the browser post it normally

      e.preventDefault();
      send();
    });

    // Clear an error as soon as the person fixes it.
    form.addEventListener("input", function (e) {
      if (e.target.willValidate && e.target.checkValidity()) clearError(e.target);
    });
  }
})();
