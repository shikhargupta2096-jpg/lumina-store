---
name: premium-web-design-system
description: Niche-agnostic premium website design and implementation guidance. Use when building or redesigning modern websites, landing pages, portfolios, SaaS pages, product sites, agency sites, startup sites, dashboards with marketing surfaces, or any web UI where the user wants refined typography, immersive hero sections, glassmorphism, smooth motion, professional spacing, responsive polish, and non-generic visual taste.
---

# Premium Web Design System

Use this skill to design and build a high-end website experience based on layout taste, typography, animation, polish, and product-quality execution. Do not bind the design to any fixed niche. Adapt the visual system to the user's business, audience, brand, and content.

## Intake Rules

If the user does not provide enough context, ask 4-5 concise questions before designing. Ask only what materially changes the result.

Ask:

1. What is the niche or business type, and what should the website help visitors do?
2. How many pages or sections do you need?
3. What color direction should the brand use: light, dark, bold, minimal, luxury, playful, corporate, or custom colors?
4. What is the company or product name, and do you have a logo or brand assets?
5. Who is the target audience, and what is the main call to action?

If the user answers partially, make tasteful assumptions and continue. If the user says "just make it," choose a premium, clean, conversion-focused one-page site with a strong hero, partner/logo rail, feature section, proof section, testimonials, CTA, and footer.

## Design DNA

Build with a premium editorial-product aesthetic:

- Full-screen or near-full-screen first viewport with one dominant visual asset.
- Large confident typography with tight but readable tracking.
- One refined contrast typeface moment, such as an italic serif word inside a strong sans headline.
- Clean navigation in a glass or soft floating pill.
- Strong hierarchy: headline first, proof second, CTA third, decorative elements last.
- Glass cards only where they add information, not as filler.
- Use real images, video, or generated bitmap visuals instead of generic gradients.
- Keep the interface calm, spacious, and designed. Avoid clutter and template-like sections.
- Make the site look commercially approved, not like a generic AI-generated landing page.

## Typography

Use a premium font pairing:

- Primary sans: `Plus Jakarta Sans`, `Inter`, `Geist`, `Satoshi`, `Manrope`, or a similar modern geometric sans.
- Accent serif: `Cormorant Garamond`, `Playfair Display`, `Fraunces`, or a tasteful editorial serif.
- Use the accent serif sparingly: one word or phrase in the hero, one pull quote, or one high-impact section title.
- Use bold or semi-bold for major headings, not everywhere.
- Do not use negative letter spacing on small text. Use tighter tracking only on large display text.
- Body copy should be readable, short, and useful. Avoid marketing fluff.

Hero headline pattern:

```text
Next-Generation [Category] [Offer] Solutions
```

Treatment:

- Main words: modern sans, `font-bold` or `font-extrabold`, tight display spacing.
- Accent word: italic serif, slightly lighter weight.
- Supporting paragraph: medium weight, 1-2 lines, high contrast.

## Layout System

Use this page structure when the user has not specified a layout:

1. Hero: immersive image/video, nav overlay, proof pill, headline, short copy, CTA, optional glass metrics.
2. Collaboration strip: continuously sliding logos or partner names.
3. Core offer: 3-6 cards or panels explaining what the business does.
4. Visual proof: gallery, case studies, product screenshots, or results.
5. Process or technology: a sticky or scroll-reveal section if appropriate.
6. Testimonials: refined cards with avatars, quote marks, and strong spacing.
7. Final CTA: bold, simple, one action.
8. Footer: useful links, brand mark, copyright.

Keep sections visually distinct but connected. Use full-width bands, not stacks of nested cards.

## Hero Direction

The hero should feel cinematic and usable.

Required hero qualities:

- Use a strong real or generated visual as the background.
- Video is preferred when provided. It must be `autoplay`, `muted`, `loop`, `playsInline`, and include a poster image.
- Add a readable overlay using gradients, not a flat black sheet unless needed.
- Place headline and CTA near the lower-left or lower-center, not dead-center by default.
- Add proof elements such as avatar rating pills, metrics, or small glass cards.
- If using glass cards, keep them restrained and readable.
- On mobile, simplify the hero. Hide nonessential metric clusters that crowd the viewport.

Hero overlay checklist:

- Headline visible over image/video.
- CTA visible without scrolling on common mobile heights.
- No text collision with nav.
- No horizontal overflow.
- Motion fades or shifts on scroll only when smooth and purposeful.

## Glass UI

Use glassmorphism as an information layer:

- Background: `rgba(255,255,255,0.14-0.24)` or dark equivalent.
- Border: subtle white or neutral border at 15-30% opacity.
- Backdrop blur: medium to strong.
- Shadow: soft, large, low opacity.
- Radius: usually 18-30px for hero cards, 10-16px for compact UI.

Avoid making every card glass. Use normal solid cards for testimonials and content-heavy sections.

## Motion Taste

Motion should feel expensive and quiet:

- Use scroll-reveal for section entry: opacity + 16-32px translate.
- Use gentle hover lift on cards: 1-8px, not dramatic.
- Use continuous marquees only for logos, testimonials, or subtle data rails.
- Use sticky image transformations only when the section benefits from storytelling.
- Respect `prefers-reduced-motion`.
- Avoid noisy bouncing, spinning, overdone parallax, and animation that blocks reading.

Recommended timing:

- Reveal: 700-900ms, cubic-bezier `(0.22, 1, 0.36, 1)`.
- Hover: 250-500ms ease-out.
- Marquee: 24-40s linear infinite.
- Hero scroll fade: opacity and translate tied to scroll progress.

## Collaboration Logo Rail

Add a partner or collaboration rail after the hero when trust matters.

Rules:

- Move continuously right-to-left.
- Duplicate items for a seamless loop.
- Add soft left/right gradient masks.
- Use company names as typographic logos if no logo files are provided.
- Keep the band clean and shallow. It should support the hero, not compete with it.

## Testimonials

Use testimonials that look designed, not like default cards.

Preferred style:

- White or very light section background.
- Centered eyebrow and title.
- 3-column grid on desktop, 1-2 columns on smaller screens.
- Soft neutral cards with modest radius.
- Large pale quote mark.
- Short, punchy testimonial text.
- Avatar/name chip overlapping the bottom of each card.
- Add 3-6 testimonials when possible.

Do not use long paragraphs unless the testimonial section is the main content.

## Color Direction

If the user has no colors, choose a professional palette based on the niche:

- Clean tech: deep green/blue, white, electric accent.
- Luxury: black/white, warm gray, restrained metallic accent.
- SaaS: neutral background, dark text, one confident accent.
- Creative: strong contrast, expressive accent, still controlled.
- Health/wellness: soft neutrals, green/blue accents, high readability.

Avoid one-note palettes. Do not flood the page with a single hue family. Accent colors should guide action and proof, not cover everything.

## Responsive Rules

Mobile is not a squeezed desktop.

- Hide or simplify decorative hero clusters on mobile.
- Keep CTA visible in the first viewport when possible.
- Use `clamp()` for hero type, but do not scale normal UI text with viewport width.
- Ensure buttons and nav are easy to tap.
- Avoid horizontal scrolling except intentional carousels.
- Check 390px, 768px, 1440px widths.
- Ensure text never overlaps images, cards, or nav.

## Implementation Standards

Use the existing framework and project style. Prefer established components and tokens.

For Next.js/React:

- Use `next/image` for images.
- Use `<video>` directly for local background videos.
- Use semantic HTML.
- Keep client components only where interactivity requires them.
- Use CSS/Tailwind classes consistently.
- Use local assets from `public/`.
- Add `output: 'export'` only when a static export is required.

For any stack:

- Keep asset names clear.
- Use real alt text for meaningful images.
- Decorative media should be hidden from screen readers or have empty alt.
- Keep performance in mind: compress media, lazy load noncritical assets, avoid massive JS.

## Copywriting Taste

Write like a professional brand team:

- Be specific, direct, and confident.
- Use short supporting copy.
- Avoid phrases like "revolutionize your business" unless the brand truly calls for it.
- Replace vague AI-sounding copy with concrete outcomes.

Bad:

```text
We provide innovative solutions to transform your future.
```

Better:

```text
Build faster, cleaner workflows with systems your team can trust every day.
```

## Verification Checklist

Before finishing, verify:

- Page loads with no runtime overlay.
- No console errors.
- Hero text is readable over media.
- Video loops, is muted, and plays inline.
- Images render and are not broken.
- Mobile has no horizontal overflow.
- Nav menu opens and closes correctly.
- CTA is visible and tappable.
- Logo rail loops smoothly.
- Testimonials align cleanly and do not overlap.
- Build passes.

If tools are available, use browser verification and screenshots. If not, run the strongest local checks available and clearly report what could not be verified.

## Anti-Patterns

Avoid:

- Generic AI-looking gradient hero sections.
- Decorative blobs, random orbs, or bokeh backgrounds.
- Too many cards in the first viewport.
- Text inside tiny pills when an icon or simple label works better.
- Over-rounded every element.
- Dense copy blocks.
- Multiple competing CTAs.
- Unverified responsive layouts.
- Using stock-like images that do not show the actual subject.
- Leaving placeholder brand names, template copy, or dead links.

## Default Build Plan

When asked to create or redesign a site:

1. Ask intake questions if required.
2. Inspect the existing project and assets.
3. Establish typography, color, spacing, and motion direction.
4. Build the hero first.
5. Add trust/proof sections.
6. Build the content sections.
7. Add testimonials and final CTA.
8. Polish mobile.
9. Run build and browser verification.
10. Report changed files, verification results, and the local URL or output folder.
