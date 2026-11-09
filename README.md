# Lernwick — Online Course & Education HTML Template

Free, static e-learning template from [html.design](https://html.design/).
Seven pages, three stylesheets, one vanilla script. No framework, no build step, no dependencies.

## Pages

- `index.html` — headline with a hand-drawn squiggle and an orange blob behind the first letter, a blob-masked student portrait with floating course and mentor stickers, photo collage, stats with an avatar stack, popular courses with category tabs, how-it-works steps, who-we-are, a live master class with a real countdown and seat counter, mentors, reviews
- `courses.html` — course catalogue: search (titles and mentors), category chips, level and price filters, four sort orders, live count, designed empty state
- `course.html` — course detail: hero with preview button, Overview / Curriculum / Mentor / Reviews tabs, module accordion with lesson list, rating breakdown, sticky enrol card with a working coupon field (try `LERN20`), wishlist saved in the browser, related courses
- `pricing.html` — three plans with a monthly/yearly toggle, pricing FAQ
- `about.html` — story, figures, values, mentor grid
- `contact.html` — validated contact form with topic chips, studio and contact cards, FAQ
- `404.html`

## Files

- `assets/css/tokens.css` — every colour, font, size, radius and shadow, plus reset, buttons and fields
- `assets/css/site.css` — header, menu, page heads, doodles, course card, mentor card, chips, tabs, accordion, footer, toast
- `assets/css/pages.css` — page sections
- `assets/js/main.js` — menu, tabs, filters, countdown, coupon, wishlist, billing toggle, accordion, form validation, reveal
- `assets/img/CREDITS.md` — photography sources

## Design

- **Layout:** modelled on a Dribbble e-learning shot. It has a big left headline with a hand-drawn arrow, a blob-shaped portrait carrying sticker cards, a starburst doodle and vertical labels, followed by a stats row with an avatar stack and "Most popular courses".
- **Palette:** "sticker" colours on pure white. Tangerine `#F7941D` is used only as a fill, with ink text on it, never white text. Peach `#FCE3C0` and sage `#C4E0B5` are card grounds, and near-black ink is `#1B1B1F`.
- **Type:** Poppins (headlines), Mulish (reading), Caveat (hand-written notes).
- **Doodles:** the squiggle arrow, starburst, blob and wavy underline are inline SVG or CSS, so they recolour with the tokens.

## Customising

- Change the palette in the first block of `tokens.css`.
- Course cards carry `data-cat`, `data-level`, `data-price`, `data-rating` and `data-students`; the catalogue filters and sorts read those attributes, so adding a course means adding one card.
- Coupon codes live in `CODES` inside `main.js`. Validate them on your server before charging anyone.
- The enrol, plan, master-class and form buttons show demo messages. Connect them to your LMS, checkout or inbox.
- Images hot-link from Pexels. Replace them with your own before launch.

## Accessibility

Semantic landmarks, skip link, one `h1` per page, labelled fields, ARIA tabs with arrow-key support, `aria-pressed` chips and toggles, `aria-expanded` accordions, Escape closes the mobile menu and returns focus, visible focus rings, ink-on-orange buttons for contrast, and `prefers-reduced-motion` honoured.

## Name check (informal, not a legal opinion)

TM check (informal): "Lernwick", 2026-09-21
- Web search: no company, product or brand; only a rare surname and a fictional place name
- Domain: lernwick.com, .co and .io do not resolve
- Rejected: ClassWick (an e-learning student project on GitHub), Scholvi, Tutorix, Kindlo, Mentoly, Learnoak (domains in use), Studbury (a street name)
- Verdict: ok to ship

## License

Free for personal and commercial use. Photos under the Pexels License. People named on the page are fictional.
