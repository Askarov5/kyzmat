---
target: layout header and mobile
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\src\\components\\page-frame.tsx"
target_fingerprint: "sha256:f2902c64e7b0a1a1b11e076f33155d29e00c1cd7c339b7a65916da4a398117a6"
target_path: "C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\src\\components\\page-frame.tsx"
timestamp: 2026-11-06T00-27-52Z
slug: src-components-page-frame-tsx
---
Method: dual-agent (A: fa989602-573d-45bc-a29e-467cef88b99a · B: 25c1a004-45d9-425c-9a48-7c5a8d60944c)

# Critique: layout header and mobile frame

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Current dock item and pressed language are clear. Dead dock items only get smaller and grayer. |
| 2 | Match System / Real World | 3 | Dock words are shop language. The header is a generic bilingual app bar. |
| 3 | User Control and Freedom | 3 | Wordmark goes home. Sign-out leaves in one tap with no return. |
| 4 | Consistency and Standards | 3 | 48px targets hold. Disabled dock labels drop to 12px. Scroll padding is 88px under a 123px header. |
| 5 | Error Prevention | 2 | Sign-out is a 48px control stacked under the language segment. |
| 6 | Recognition Rather Than Recall | 3 | Sections are words. A long company name ellipsizes with no full title. |
| 7 | Flexibility and Efficiency | 2 | Language and sign-out are full submits on every screen, above the thumb. |
| 8 | Aesthetic and Minimalist Design | 2 | The second header row and the filled language pill are louder than the shop name. |
| 9 | Error Recovery | 2 | Accidental sign-out goes to login. The chrome has no undo. |
| 10 | Help and Documentation | 2 | Nothing says why Orders and Due do nothing. |
| **Total** | | **25/40** | **Acceptable** |

## Design Specificity Verdict

The slip is a Kyrgyz shop ticket: paper ground, torn edge, stamp rail, Noto Sans, and dock words a clerk says. The header is not. KYZMAT, a filled language segment, a muted company line, and sign-out are a generic bilingual app bar. On a phone the column is full width. At 1280px the ticket stays a centered 448px column while the dock sheet stretches edge to edge.

**Deterministic scan:** `impeccable detect` on `page-frame.tsx`, `app-shell.tsx`, `locale-switch.tsx`, and `layout.tsx` returned `[]` (exit 0). The in-page overlay on `/products/new` at 390×844 also reported no anti-patterns (badge 0, no pins). The detector missed the 123px header, the 12px dead dock labels, and the dock bar that is wider than the ticket. Those are composition failures, not rule hits. The live helper bar overlapping the dock is helper chrome, not app chrome, so it is not an app finding.

## Overall Impression

The dock is the phone. The header is a settings strip that spends the first 123px and the only stamp fill before the clerk reaches the slip.

## What's Working

- Dock labels are full words, 48px tall, and do not wrap at 390px in Kyrgyz or Russian. The current item uses stamp text and an inset bar.
- Header and dock use the ticket materials: paper, sheet, 2px radius, Noto Sans. Safe-area padding is on the header and the dock.
- Ink on paper is strong in sunlight. White on the stamp fill is also strong. The failure is size and placement, not a missing color.

## Priority Issues

**[P1] The header is two rows and 123px tall.**
Why it matters: On `/products/new` the save button starts under the dock. Scroll padding is 88px, short of the header, so a focused field tucks under the company row.
Fix: One row, at least 48px. Wordmark and company name on the left. Language and sign-out on the right. Put the full company name in `title`.
Suggested command: /impeccable layout

**[P1] The language segment is the loudest control.**
Why it matters: The active language uses the same stamp fill as Save, in the top corner, on every screen, outside one-thumb reach.
Fix: Keep both languages and the pressed state. Active language is stamp text with an inset bar, the same mark as the current dock item. Stamp fill stays on the next action.
Suggested command: /impeccable quieter

**[P1] Sign-out has its own 48px row under the language control.**
Why it matters: A thumb aimed at the top-right hits exit. It has the same height and weight as a real action.
Fix: Mute color, same 48px target, on the single header row. A confirm modal is the wrong interruption for this ticket.
Suggested command: /impeccable quieter

**[P2] Disabled dock labels are 12px.**
Why it matters: Orders and Due are the labels a clerk cannot read in sun. Mute on sheet already clears contrast. The failure is size.
Fix: All four labels at 14px semibold. Disabled stays mute and not a link.
Suggested command: /impeccable layout

**[P3] At 1280px the dock sheet stretches past the ticket.**
Why it matters: The header and slip are a 448px column. The dock background runs the full window.
Fix: The dock sheet uses the same `max-w-md` column. The phone column stays full width.
Suggested command: /impeccable adapt

## Persona Red Flags

**Counter clerk, sunlight, one thumb.** Language and sign-out sit in the top 123px. The dock is the only chrome in reach. Orders and Due are 12px. The company name is 14px mute. Save starts behind the dock because the header already spent 123px.

**First-time owner.** The filled language control looks like the main button, above Add client. KYZMAT does not name the section. Orders and Due look like quieter links and do nothing.

**Returning agent.** The language is already chosen, and the language segment is still the loudest header control. Sign-out is easier to hit than a once-a-day exit. Two dock slots stay occupied by dead items.

## Minor Observations

- At 390px `max-w-md` is full width. That is a phone screen, not a floating card.
- The skip link stays hidden until focus.
- The current dock item spends stamp as text and a 3px bar. The language segment is the control that spends the fill.

## Questions to Consider

- If the language is already chosen, why is it the largest blue object on the screen?
- If the top of the screen were the top of the paper ticket, what would be printed there besides the shop name?
