# Radiant Health and Wellness

Marketing site for Radiant Health and Wellness — a whole-person primary care practice opening September 1st in Ewing, NJ.

Static HTML/CSS/JS, deployed via Vercel.

## Structure

- `index.html` — Home
- `about.html` — About / provider bio
- `services.html` — Services, including EHR patient portal details
- `contact.html` — Address, hours, phone/fax/email, Apple Maps + Get Directions
- `css/styles.css` — Shared styles (yellow/gold hero + main sections, green/gold footer/contact)
- `js/main.js` — Mobile nav toggle, active-link highlighting, footer year
- `assets/img/` — Logo, favicon, and photos

## Assets to replace

The following are placeholders and should be swapped with final files (same filenames, so no HTML changes needed):

- `assets/img/logo.png` — final transparent logo
- `assets/img/favicon.png` — favicon
- `assets/img/hero-stock.jpg` — hero section stock photo
- `assets/img/about-me.jpg` — provider photo for About section

## Local preview

Open `index.html` directly in a browser, or serve locally:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

Connected to Vercel as a static site (see `vercel.json`). Pushes to `main` on GitHub deploy automatically once the Vercel project is linked.

```bash
npx vercel        # first-time link + preview deploy
npx vercel --prod # production deploy
```

## Contact info on file

- Address: 25 Scotch Road, Suite 5, Ewing, NJ 08618
- Phone: 609-766-4345
- Fax: 609-710-7674
- Email: care@radianthealthnp.org
- Opening: September 1st
