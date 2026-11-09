---
target: address comboboxes
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\src\\components\\place-fields.tsx"
target_fingerprint: "sha256:ac98de7ba6f2db2f49b9f98bf8ea03224f40b62269498770e1b9fe35d6121960"
target_path: "C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\src\\components\\place-fields.tsx"
timestamp: 2026-11-06T01-09-15Z
slug: src-components-place-fields-tsx
---
Method: dual-agent (A: de276ea1-d771-47bc-96e9-63147d3af491 · B: eb09fa63-a6ac-4451-ac1f-30d7197cd386)

# Critique: address comboboxes

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | The disabled raion is clear. The open list has no cue and runs under the dock. |
| 2 | Match System / Real World | 3 | Labels and order are the real place words. |
| 3 | User Control and Freedom | 2 | Escape and a new oblast work. The open list covers Save. |
| 4 | Consistency and Standards | 2 | The enabled combobox and every option reuse the street field. |
| 5 | Error Prevention | 3 | The child stays closed until an oblast is chosen. The box still invites a typed name. |
| 6 | Recognition Rather Than Recall | 2 | Closed, nothing says a list exists. |
| 7 | Flexibility and Efficiency | 2 | Typing filters. The list affordance is invisible. |
| 8 | Aesthetic and Minimalist Design | 3 | The closed slip is one ticket. The open list is a stack of identical boxes. |
| 9 | Error Recovery | 2 | A missed pick reports the placeholder, not what to do. |
| 10 | Help and Documentation | 1 | No manual. The oblast box still reads as another street line. |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

The slip is KYZMAT. The closed combobox is not. On `/clients/new` at 390px the street field and the oblast control are the same 48px box: 2px radius, `#b7c5d3` border, `#fbfcfd` fill. The placeholder is the only difference. After a pick, the value looks typed. The open options are that box again, 8px apart. The product rule (child disabled, no list, until an oblast is chosen) shows up only as the paper-gray raion.

**Deterministic scan:** `impeccable detect` on `place-fields.tsx` and `combobox.tsx` returned `[]` (exit 0). The in-page overlay reported no anti-patterns. The detector missed the identical boxes. That is a composition failure, not a rule hit.

## Priority Issues

**[P1] The closed combobox is the street field.**
No chevron, no different fill. A clerk cannot tell a list from a line they must type.
Fix: the picker is a sheet control with a drawn chevron. The typed field stays the white `Field`.

**[P1] Open options look like more inputs.**
Each row is a 48px bordered box. They read as fields under the address, not as rows to tap.
Fix: one menu of ruled rows on the sheet.

**[P1] The list runs under the dock.**
«Чуйская область» sat half under the dock. After Talas, the last raions were off the slip.
Fix: the menu overlays the page above the dock and scrolls inside itself.

**[P2] A typed name that was not tapped fails as the placeholder.**
«Область…» is the browser message. The clerk thinks the name was saved.

**[P2] In Russian, cities are the unlabeled short rows.**
Бишкек, Ош, and Талас sit beside rows that say область or район.

## What's Working

- The raion stays disabled and listless until an oblast is chosen.
- Choosing an oblast closes the parent and opens only that oblast's places.
- Targets stay 48px. Placeholder ink on the field is readable in sun. The weak part is the box edge, not the type.
