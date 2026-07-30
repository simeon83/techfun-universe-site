# TechFun Universe — Website

Static site built with [Eleventy](https://www.11ty.dev/) and edited through [Decap CMS](https://decapcms.org/) at `/admin`.

## Project structure

```
src/
  _includes/          Layouts and partials (base.njk, header, footer, post.njk)
  _data/               Site-wide data editable via Decap CMS Settings:
                         contact.yml, stats.yml, pricing.yml, currentYear.js
  admin/               Decap CMS admin panel (index.html + config.yml)
  assets/              CSS, JS, images (logo, favicon)
  content/
    blog/              Blog posts (.md) — each becomes a real page at /blog/<slug>/
    portfolio/         Portfolio projects (.md) — shown on the Portfolio page
    testimonials/      Client testimonials (.md) — shown on the homepage
    faq/               FAQ entries (.md) — shown on the FAQ page, ordered by "order" field
  index.njk, about.njk, services.njk, ... one file per top-level page
.eleventy.js           Eleventy config (collections, passthrough copy)
netlify.toml           Netlify build settings
```

## Local development

1. Install [Node.js](https://nodejs.org) 18 or later.
2. From the project root:
   ```
   npm install
   npm start
   ```
3. Open the local URL Eleventy prints (usually `http://localhost:8080`).

## Building for production

```
npm run build
```

This outputs the finished static site to `_site/`.

## Deploying on Netlify

1. Push this project to a GitHub repository.
2. In Netlify: **Add new site → Import an existing project**, and connect the repo.
3. Netlify will read `netlify.toml` automatically:
   - Build command: `npx @11ty/eleventy`
   - Publish directory: `_site`
4. Deploy. Your site goes live on a Netlify URL (add a custom domain afterward under **Domain settings**).

## Enabling the CMS (`/admin`)

Decap CMS is already wired into the templates, but it needs two things turned on in Netlify **after** your first deploy:

1. **Netlify Identity** — Site settings → Identity → Enable Identity.
2. **Git Gateway** — Site settings → Identity → Services → Enable Git Gateway.
3. Invite yourself as a user: Identity tab → Invite users → enter your email.
4. Visit `yoursite.netlify.app/admin`, accept the invite, set a password, and log in.

From there, editing a blog post, portfolio project, testimonial, FAQ entry, or the Settings (contact info, homepage stats, pricing) triggers a new commit — Netlify rebuilds the site automatically, and changes go live within a minute or two.

## Notes

- Contact form on `/contact/` uses Netlify Forms (`data-netlify="true"`) — submissions appear under the Netlify dashboard's **Forms** tab automatically after first deploy.
- If you'd rather host on GitHub Pages instead of Netlify, see the commented-out `backend` block at the top of `src/admin/config.yml` — you'll need a different Git-based auth method since GitHub Pages doesn't support Git Gateway.
