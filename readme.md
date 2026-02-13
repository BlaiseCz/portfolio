# Blaise Cz Portfolio (GitHub Pages)

Modern, responsive portfolio website for:

- Java + Python backend engineering
- Go learning journey
- Healthcare industry software delivery
- AI model training and agentic pipelines

Live URL: <https://blaisecz.github.io/portfolio/>

## Tech Stack

- HTML5 + semantic sections
- CSS (responsive layout, focus states, mobile navigation)
- Vanilla JavaScript (data-driven projects, filtering/search, contact form UX)
- GitHub Pages hosting

## Project Structure

```text
.
├── data/
│   └── projects.json
├── .github/
│   └── workflows/
│       └── prettier.yml
├── index.html
├── styles.css
├── script.js
├── favicon.svg
├── LICENSE
├── CONTRIBUTING.md
└── CHANGELOG.md
```

## Deploy to GitHub Pages (click-by-click)

1. Push this repository to GitHub.
2. Open: `https://github.com/blaisecz/portfolio`.
3. Click **Settings**.
4. In the left menu, click **Pages**.
5. In **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main`
   - **Folder**: `/ (root)`
6. Click **Save**.
7. Wait 1–3 minutes and refresh the Pages screen.
8. Open: <https://blaisecz.github.io/portfolio/>

## Contact Form Setup (Formspree)

The form is already wired for static hosting and JavaScript submission.

If you want to use your own endpoint:

1. Create a form at <https://formspree.io/>.
2. Copy your endpoint (example: `https://formspree.io/f/xxxxxxx`).
3. Update the `<form action="...">` in `index.html`.
4. Commit and push.

## Updating Projects (no HTML editing)

Edit only `data/projects.json`.

Each item includes:

- `title`
- `tags` (array)
- `highlights` (2–3 bullet points)
- `links.repo` and optional `links.demo`

## Local Preview

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173>.

## Accessibility + UX Notes

- Skip-to-content link
- Focus-visible outlines
- Mobile nav with proper `aria-expanded`
- Contact form status feedback and submit-button disabling
- Copy-email button with confirmation state
