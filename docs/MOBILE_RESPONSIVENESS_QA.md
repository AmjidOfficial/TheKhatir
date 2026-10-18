# Mobile and cross-device QA checklist

Use this checklist before merging or promoting the Khatir Property Consultant & Builders website.

## Viewports to verify

- [ ] 320 × 568 (small Android / narrow viewport)
- [ ] 360 × 800 and 375 × 812 (common Android and iPhone widths)
- [ ] 390 × 844 and 430 × 932 (larger phones)
- [ ] 768 × 1024 (tablet portrait)
- [ ] 1024 × 768 (tablet landscape / small laptop)
- [ ] 1280 × 800 and 1440 × 900 (desktop)

## Public website

- [ ] Logo and company name remain readable without clipping.
- [ ] Mobile navigation opens, closes, scrolls on short screens, and closes after selecting a link.
- [ ] No horizontal page scrolling at 320 px.
- [ ] Property filters, search, cards, images, and action buttons fit narrow screens.
- [ ] Long titles, addresses, prices, and user-entered text wrap safely.
- [ ] Forms keep labels visible, show validation messages, and use comfortable touch targets.
- [ ] Footer contact details and links stack in a useful order.
- [ ] Reduced-motion preferences are respected.

## Authentication and workspace

- [ ] Login, signup, and password reset work with the approved Supabase project.
- [ ] Forms remain usable with the on-screen keyboard open.
- [ ] Dashboard cards stack on phones; tables or dense data have an intentional narrow-screen layout.
- [ ] Edit, archive, and review controls are reachable without horizontal scrolling.
- [ ] Private pages remain protected by server-side authentication and row-level security, not only hidden UI.

## Browser and accessibility

- [ ] Test current Chrome on Android, Safari on iOS, Firefox, and desktop Chromium.
- [ ] Test keyboard-only navigation, visible focus, screen-reader labels, and 200% zoom.
- [ ] Test direct route loads and refreshes on the actual deployment base path.
- [ ] Confirm no console errors, failed requests, or broken images.
- [ ] Confirm PWA install prompt, icon, and service-worker updates on real devices.

## Release note

CSS safeguards and the mobile navigation have been improved in code. This checklist is not a claim that every physical device has already been tested. Complete the checks in a real browser/device before calling the release production-ready.
