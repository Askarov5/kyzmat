---
target: order details page
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\src\\app\\orders\\[id]\\page.tsx"
target_fingerprint: "sha256:dbd7569ec53f99fefb463e2fad0939a107c4fa84570cdf24a52d700567944bf4"
target_path: "C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\src\\app\\orders\\[id]\\page.tsx"
timestamp: 2026-11-09T01-51-04Z
slug: src-app-orders-id-page-tsx
---
Method: dual-agent (A: c7e2fd3a-10b0-4fba-876c-02dbdf89b049 · B: e85861c5-2158-4425-9208-dff0a6df62a3)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Status is plain DL text; list Badge language dropped |
| 2 | Match System / Real World | 2 | Counter job order inverted into admin facts + ISO date |
| 3 | User Control and Freedom | 2 | Text back works; no undo after complete/cancel |
| 4 | Consistency and Standards | 1 | Breaks client-detail chrome and orders-list Badge pattern |
| 5 | Error Prevention | 1 | Cancel one tap, equal loudness to Complete, no confirm |
| 6 | Recognition Rather Than Recall | 2 | Phone/client navigation require memory |
| 7 | Flexibility and Efficiency | 1 | No tel:, no client link |
| 8 | Aesthetic and Minimalist Design | 2 | Two primaries violate one-action rule |
| 9 | Error Recovery | 2 | Notice OK; irreversible actions without undo |
| 10 | Help and Documentation | 2 | Holding-days meaning unexplained |
| **Total** | | **17/40** | **Poor** |

## Design Specificity Verdict

**LLM assessment**: Generic admin detail, not authored for KYZMAT. Section noun as h1, flat label/value rows, twin terminal buttons. Client detail already encodes counter grammar; this page ignores it.

**Deterministic scan**: CLI detect clean (0 findings) on page and order-actions. Live browser detect: 1 nested-cards warning on ruled list ul — false positive vs design system.

**Visual overlays**: Overlay visible in Human tab for nested-cards on the fact list.

## Overall Impression

Works as a data sheet, fails as a counter work surface. Biggest opportunity: make client name + status + call the spine, quiet cancel.

## What's Working

1. Failed query uses Notice, not empty list.
2. Actions gated to open/in_delivery + canBook; pending disables both.
3. Holding-days data exists and bilingual nouns are ready.

## Priority Issues

### P0 Twin scream CTAs / unprotected cancel
Complete and Cancel same width, both filled. Fix: one primary Complete; Cancel quieter with confirm. Suggested: quieter, harden.

### P0 Missing call + client jump
No phone, no client id link. Fix: select phone + id; Call strip; name opens client. Suggested: layout, harden.

### P1 Wrong title + back pattern
h1 is Orders; back text-only. Fix: BackIcon beside client name; status Badge in header. Suggested: layout.

### P1 Status not Badge
List uses Badge; detail flattens. Fix: same Badge map; holding as muted subline. Suggested: colorize, polish.

### P2 Undifferentiated fact wall + machine date
Equal rows; ISO date. Fix: chunk who/where/product; format date. Suggested: distill, clarify.

## Persona Red Flags

**Casey**: Mis-tap Cancel; no phone shortcut.
**Jordan**: Detail breaks the client-detail pattern; Orders title does not confirm which order.
**Aigul**: Needs call/address/status fast — none primary; cancel as loud as finish.

## Minor Observations

Nested white list inside Slip; right-aligned long notes; gap-4 vs client gap-3; no success Notice after complete; two forms cheat one-Button rule.

## Questions to Consider

1. If the clerk can only read three words in glare, why is one not the client name and one a colored status?
2. Why is Cancel peer to Complete when cancel is rare and irreversible?
3. What is this screen for if you cannot call or open the client?
