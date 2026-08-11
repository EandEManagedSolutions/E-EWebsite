# E&E Managed Solutions — website

Static site. Plain HTML, CSS and JavaScript — no build step, no framework, no
dependencies. You can edit any of it in Notepad and refresh the browser.

---

## 1. Fill in the blanks first

Region and phone are done — the site says **South Louisiana** and
**(225) 230-8044** everywhere. One placeholder is left, and it's the important
one:

| Find | Replace with | Times |
|---|---|---|
| `[Partner One Name]` | First partner's name (about.html) | 1 |
| `[Partner Two Name]` | Second partner's name (about.html) | 1 |
| `[Their focus]` | e.g. `Networks & infrastructure` / `Security & compliance` | 2 |

**Also write by hand:** the two partner bios in `about.html`. They're marked with
bracketed instructions telling you what to cover. Don't skip these — for a
two-person shop they're the most persuasive thing on the site, and they're the
one part I couldn't write for you.

### Business model this copy assumes

Every page now reflects a specific, honest picture of how E&E operates today.
If any of this stops being true, search for it and update it — these claims are
repeated in several places (hero, trust strip, process steps, FAQ, contact page)
so a find-and-replace across all four `.html` files is the fastest way to catch
every instance:

- **Hours:** weekday evenings and weekends. `contact.html` currently says
  "Weekday evenings & weekends" rather than specific times — add real hours
  there if you want to be more precise (e.g. "Mon–Fri 6–9pm, Sat–Sun 9am–6pm").
- **Daytime emergencies:** if a client's system goes down during the day, the
  site promises we'll try to step away and respond, and that the fix happens
  that evening if we can't. That's in the Services FAQ and the contact page's
  emergency callout — both need to change together if this changes.
- **Monitoring:** the site does **not** claim 24/7 automated monitoring, on
  purpose — you said that's not in place yet. It's described as scheduled
  health checks during visits instead. If you stand up real monitoring
  tooling later, `services.html` (Managed IT bullet 2) is the place to
  upgrade that claim back to something continuous.
- **Pricing:** $85/hr remote, $100/hr on-site, custom-quoted monthly
  packages, fixed-price quotes for projects. Full breakdown lives in a new
  **Pricing section on `services.html`** (`#pricing`), linked from the
  homepage, footer, and services FAQ.
- Month-to-month, 30 days' notice; you get full account/credential handover if
  a client leaves. Unchanged from before — still worth a final gut-check.

### Pricing details I made a judgment call on

I filled these in with reasonable defaults since you hadn't specified them.
They're in the Pricing section on `services.html` (search `SETUP NOTE` in that
file to find the exact spot) — check them against what you actually want to
charge:

- **Remote support** billed in **15-minute increments**, no minimum.
- **On-site support** has a **1-hour minimum**, then 15-minute increments.
- On-site pricing **covers travel anywhere in South Louisiana** with no
  separate trip fee. If you want a mileage cutoff or a trip charge past a
  certain distance, add it here.
- **Monthly care plans** are deliberately **not** given a specific number —
  the copy says "quoted after assessment" rather than inventing a per-seat
  rate I have no basis for. That's a real, common MSP pattern (price after
  auditing device/user count), not a placeholder — but if you'd rather post a
  starting price (e.g. "from $X/user/month"), tell me and I'll add it.

---

## 2. Make the contact form work

The form currently validates but sends nowhere — a static site has no server to
receive it. Pick one:

**Formspree** (works on any host, free tier is plenty)
1. Sign up at formspree.io and create a form.
2. In `contact.html`, replace `#REPLACE-WITH-YOUR-FORM-ENDPOINT` with the URL
   they give you.

**Netlify Forms** (only if you host on Netlify)
1. In `contact.html`, change the form tag to:
   `<form data-validate netlify data-netlify="true" method="POST">`

Until then, the phone number and email link both work fine.

---

## 3. Preview it locally

From this folder:

```bash
python -m http.server 4321
```

Then open `http://localhost:4321`. Opening the `.html` files directly by
double-clicking mostly works, but a local server is closer to the real thing.

---

## 4. Publish it

Drag this folder onto **Cloudflare Pages**, **Netlify** or **GitHub Pages** —
all free, all fine for this. There's nothing to build or compile; the folder
*is* the website.

**Before you upload,** delete the seven original `*-unsplash.jpg` files in the
root. They're the full-resolution source photos (~52 MB) and aren't used by the
site — everything it needs is already in `assets/img/`.

---

## 5. What's here

```
index.html          Home
services.html       The four service lines in detail + FAQ
about.html          The story, the two partners, how you work
contact.html        Assessment form + direct contact details
assets/css/style.css   All styling (one file, commented by section)
assets/js/main.js      Mobile nav, scroll reveals, form validation
assets/img/            Web-optimized photos (WebP + JPEG fallback)
.claude/launch.json    Local preview config, safe to delete
```

---

## 6. The design, briefly

So you can extend it without it falling apart.

**Color.** Every competitor in managed IT is navy blue. This is built from a
live oak at dusk instead. Tokens live at the top of `style.css`:

| Token | Hex | Use |
|---|---|---|
| `--shade` | `#121A15` | Page background. Green-black, never navy. |
| `--understory` | `#1A2620` | Raised surfaces on dark |
| `--sage` | `#A9BCA2` | Body text on dark |
| `--lantern` | `#DFAF66` | Accent — backlit moss gold. **Dark backgrounds only.** |
| `--lantern-ink` | `#7A5623` | Same gold, dark enough to use as text on linen |
| `--linen` | `#F5F1E7` | Light section background |
| `--ink` | `#16201A` | Text on linen |

The one rule worth remembering: `--lantern` fails contrast as text on `--linen`
(1.9:1). On light backgrounds use `--lantern-ink` for text, and keep `--lantern`
for fills and rules only.

**Type.** Three faces, each with a job:
- **Fraunces** — headlines only. Warmth. Its `WONK` axis is deliberately off,
  because the swash ampersand is unreadable at heading sizes.
- **Karla** — everything you actually read.
- **JetBrains Mono** — eyebrows, labels, phone numbers, stats. This is what
  makes the site read as technical rather than merely rustic.

**Structure.** Sections alternate between *shade* (dark, atmospheric — these
persuade) and *clearing* (light linen — these inform). Add a section by giving
it `class="section shade"` or `class="section clearing"` and the text colors
follow automatically.

**The signature.** The hero photograph isn't in a box — its lower edge is masked
to transparent so the Spanish moss hangs down and dissolves into the page. If
you swap the hero image, keep one with detail reaching the bottom edge or the
effect disappears.

---

## 7. Accessibility

Verified, not assumed — measured against real rendered pixels rather than
computed styles, because text sits over photographs:

- All body text meets or exceeds WCAG AA (4.5:1); large text exceeds 3:1.
  Worst case on the site is 4.37:1 for the hero headline, which is large text.
- Keyboard navigable throughout, with a visible gold focus ring.
- Touch targets are 48px minimum.
- `prefers-reduced-motion` is respected — all scroll animations are disabled.
- Form errors appear next to the field, are announced via `aria-describedby`,
  and clear as soon as you fix them.

If you add anything, the one thing not to break: don't remove the focus ring.

---

## 8. Photo credits

Photos are from Unsplash (free to use commercially, no attribution required —
but it's good manners): Tetiana Sapon, Jonah Townsley, Arthur QJC, Tyler,
Valentin Lacoste, Albert Stoynov, FLYD.

The switch and padlock photos have been color-graded into the site palette;
the originals are much bluer and redder respectively.
