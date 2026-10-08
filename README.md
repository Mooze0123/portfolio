# Oskar Junebrink — Portfolio

A responsive, standalone portfolio built around the supplied visual references.

The homepage order is: header and introduction, four selected projects, a View more projects link, What I bring, About me, contact and footer. The highlights are Db Wheelhouse, Moto Guzzi, Hydrofic and Stone Golem, led by the company-collaboration master’s thesis. Rubber Band Toy, the speaker, DocBot and Chess Pieces are available on the project overview.

Selected-work photos retain their original landscape proportions and display without cropping, with subtle 12px corners. The image column is slightly wider on desktop, and project rows stack below 900px.

On the All projects overview, all eight preview images fill matching 16:10 frames with a slight crop. The frames have no background strips or extra padding around the speaker preview.

Each project image and “Read the case study” link opens a separate, shareable page with a project overview, process images, brief, contribution and result. A “What I learned” section closes each story with a project-specific reflection, skills developed, and tools and methods used. The top return link on each case study says “Back to selected work” and returns to the homepage’s work section when opened from the homepage; otherwise it says “View all projects” and opens the full overview. That choice survives refreshes and is scoped to the individual browser history entry. The bottom link always says “View all projects”; next-project links also remain available. The eight case-study pages are:

- `projects/db-journey/index.html`
- `projects/stone-golem/index.html`
- `projects/rubber-band-toy/index.html`
- `projects/moto-guzzi/index.html`
- `projects/hydrofic/index.html`
- `projects/brand-inspired-speaker/index.html`
- `projects/docbot/index.html`
- `projects/chess-pieces/index.html`

`projects/index.html` is the complete overview of these eight projects. Hydrofic uses a concise business story, a sourcing-to-customer diagram, approximate 2023 results, store and product imagery, and a product manual. Its supplied assets come from the Desktop’s `Hydro portfolio` folder. The results show the full values 6,000,000 SEK and 3000 orders, with 2023 mentioned once beneath them. Each figure counts up once as it enters view; revenue retains its comma separators during the animation. Reduced-motion preferences and browsers without IntersectionObserver retain the static final values.

Db Wheelhouse is based on the supplied `Desktop/db portfolio` thesis and imagery. It describes a two-person collaboration and identifies Oskar’s contribution in design, digital development and final prototype printing. It presents a working prototype and further engineering needs, without implying a product launch or production readiness. The evaluation uses the ten recorded responses from thesis Appendix 5: mobility 3.5/4.7, stability 2.4/4.5 and ease of use 3.5/4.6 for the standard bag/prototype. The deployment-state viewer is progressively enhanced: all states remain readable without JavaScript. The full thesis is kept in the source folder and is not bundled with the website.

DocBot presents a university team’s UI/UX and functional app prototype. Chess Pieces presents a group form study, with Oskar’s contribution in 3D modeling and visualization. Both use the current case-study layout and include learning, skills and tools sections. Their content and images come from the original portfolio.

The mobile menu expands from the floating header pill and reveals its links in sequence. Closing reverses the panel reveal, including when navigating to a section or another page, or pressing Escape. Reduced-motion preferences disable the animation. Header links on case studies return to the homepage work and about sections; Contact me scrolls to the page’s contact footer.

The page canvas and browser theme colour match the background at the top of each page, so scrolling past the top edge reveals the same light colour. Most pages use the hero’s light grey; the All projects overview and Hydrofic use white.

## Db animation

The Db case study includes a responsive animation section below the project overview, connected to the supplied YouTube video `M1vk_iWvmXg`. A play button loads the privacy-enhanced embedded player on demand, with fullscreen support. Without JavaScript, a link on the preview opens the video. The video ID is configured in `data-youtube-id` on the `data-project-film` section in `projects/db-journey/index.html`.

Stone Golem uses the same responsive animation player at the end of its case study, after “What I learned” and before project navigation. Its supplied video is `Ar3bK7M59j4`; the result-section link scrolls to the embedded animation.

DocBot uses the same player in a portrait frame after “What I learned”, with the supplied prototype walkthrough `QDSg-k8UG64`. The result-section link scrolls to the video, and the preview opens YouTube directly when JavaScript is unavailable.

The Stone Golem brief shows the original Stone Golem, Dragon and Portal sketches in a concept switcher beside the moodboard on desktop. Its pill buttons share the Db deployment viewer’s styling and behavior. Stone Golem is selected initially; all three sketches remain visible without JavaScript, and reduced-motion preferences disable the fade between concepts. Model development is shown in three images: blockout, sculpted form and the final textured character. These sit in one row on desktop and stack on mobile, with the full images preserved.

## Preview

Run `npm run dev`, then open http://localhost:5173/. No dependencies need to be installed. You can also open `index.html` directly in a browser. All pages use ordinary relative links and work without JavaScript; JavaScript adds the mobile menu interaction.

## Build

Run `npm run build` to produce a ready-to-host copy of the homepage, project overview, eight case studies and assets in `dist/`. Run `npm run preview` to serve that copy.

## Analytics

All ten HTML pages load the shared `analytics.js` integration for Google Analytics 4 measurement ID `G-5GEMEMP9QG`. The Google tag loads only on `junebrink.com` and `www.junebrink.com`, after the visitor chooses “Allow analytics”. Localhost, file previews and other hosts do not send traffic to GA4. Google's standard `config` command records the page view; there is no additional manual page-view event.

The cookie choice is remembered for six months. “Reject analytics” blocks the Google tag, and “Cookie settings” in every footer lets visitors change their choice. Withdrawing consent disables measurement, removes the GA cookies and reloads the page without Google's script. Advertising consent, Google Signals and ad personalization remain disabled. The recorded page address excludes query strings and fragments.

Run `npm test` to check page coverage, consent behavior and preview exclusions. After deployment, allow analytics on the live site and open GA4 **Reports → Realtime** to confirm visits. Browser tracking protection or ad blockers can prevent analytics even after consent; normal reports may take 24–48 hours to populate.

## Content and assets

- `index.html`: homepage content, project links, contact links and mobile menu.
- `projects/`: editable static HTML case studies and project overview.
- `styles.css`: typography, reference colors, homepage and case-study layouts, responsive behavior.
- `main.js`: shared animated mobile menu.
- `analytics.js`: shared GA4 and analytics cookie preferences.
- `assets/images/`: optimized local copies of the existing portfolio’s project images and portrait.
- `assets/images/projects/`: optimized process and brand images used in the case studies.
- `assets/documents/`: the supplied Hydrofic product manual and Oskar’s English CV, served as PDFs.
- `assets/fonts/`: locally hosted Inter font files.

The name, biography, contact details, project content and photography come from the existing portfolio in the adjacent `Portfolio/portfolio` folder. The original portfolio and design-reference folder remain untouched. The portfolio has no external image or font dependencies.

“View my CV” links in every footer and mobile menu open the supplied English resume, `assets/documents/oskar-junebrink-cv.pdf`, in a new tab. The original PDF is preserved unchanged. The footer’s “Follow me on Instagram” link opens @oskar.junebrink in a new tab. The header’s “Contact me” button scrolls to contact.

Capability icons adapt Lucide icons under the ISC license. Font and icon license notices are in `assets/licenses/`.
