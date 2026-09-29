# Junebrink portfolio design system

This site uses a small, shared system so every project feels related while still having room for its own images and story. The homepage is a visual index; each project opens as a dedicated case-study route using the same frame and components.

## Foundations

- **Paper** `#f0ede4` — default page background
- **Ink** `#171815` — primary text and rules
- **Muted** `#686a64` — metadata and supporting copy
- **Accent** `#e15a2b` — links, markers and moments of emphasis
- **Dark** `#202522` — contact and dark case-study sections
- **Type** — Helvetica Neue / Neue Haas Grotesk fallback stack
- **Corners** — 2px for image frames, pill shape only for the small signature label
- **Spacing** — fluid `clamp()` values, with `--pad` for page gutters and `--section` for major sections

The source tokens live in [`styles/design-system.css`](styles/design-system.css). The homepage surface lives in [`styles/site.css`](styles/site.css); case-study layouts live in [`styles/case-study.css`](styles/case-study.css); lightweight behavior is shared in [`scripts/site.js`](scripts/site.js). The full writing and asset map lives in [`PORTFOLIO-CONTENT.md`](PORTFOLIO-CONTENT.md).

## Shared component anatomy

Every project page uses the same header, eyebrow, metadata rail, image frame, chapter rhythm and footer. A project page should follow this sequence:

1. `project-card__head` — index, project type and a compact kind label
2. `project-card__copy` — title, one-sentence promise and case-study link
3. `project-card__media` — one uncropped lead image on the homepage
4. `case-overview` — context, role, tools and outcomes
5. `case-chapter` — process evidence, images and captions
6. `case-reflection` + `case-next` — takeaway and navigation

Use a real `<img>` with `height: auto` for project imagery. Never use `object-fit: cover` for portfolio work: the complete image is part of the story.

## Adding a project

1. Add the project copy and asset mapping to [`PORTFOLIO-CONTENT.md`](PORTFOLIO-CONTENT.md).
2. Add one `<article class="project-card">` chapter to the `.project-list` in [`index.html`](index.html), linking to a new `projects/my-project/index.html` case study:

```html
<article class="project-card project-card--my-project" data-reveal>
  <div class="project-card__head">
    <span>08</span><p>Project type · 2026</p><span class="project-card__kind">Material + motion</span>
  </div>
  <div class="project-card__main">
    <div class="project-card__copy">
      <h3>My <em>Project</em></h3>
      <p>One sentence explaining the problem, making and outcome.</p>
      <a class="project-card__link" href="projects/my-project/">Open the story <span aria-hidden="true">↗</span></a>
    </div>
    <figure class="project-card__media" data-parallax>
      <img src="assets/images/my-project/cover.jpg" alt="Describe the project image" loading="lazy">
    </figure>
  </div>
</article>
```

3. Create the matching case page by copying the shared structure from an existing `projects/*/index.html`, then fill its `case-hero`, `case-overview`, `case-chapter`, galleries and reflection with the copy and assets from `PORTFOLIO-CONTENT.md`.
4. Keep the index number, metadata format and image treatment consistent. The shared CSS supplies spacing, hover movement, responsive layout and natural-height imagery.

For confidential work, use the existing `project-card--pending` pattern rather than inventing a second card style. Keep images as natural-height `<img>` elements; do not introduce `object-fit: cover`.
