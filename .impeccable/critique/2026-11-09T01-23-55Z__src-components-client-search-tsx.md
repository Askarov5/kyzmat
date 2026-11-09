---
target: client search/list
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 2
p1_count: 2
target_identity: "file:C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\src\\components\\client-search.tsx"
target_fingerprint: "sha256:3354b2506a660f91fe52f3d08c4fd725d1cd71d9ef86c08c87e419e4a8801691"
target_path: "C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\src\\components\\client-search.tsx"
timestamp: 2026-11-09T01-23-55Z
slug: src-components-client-search-tsx
---
Method: dual-agent (A: 62551f94-81a5-4f3a-8005-4b1308fe53f9 · B: afe13d52-0d8d-4a3e-8322-a9787aea145c)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Zero-hit search shows only a second Add — no "nothing found" status; aria-expanded always true |
| 2 | Match System / Real World | 2 | Phone is mute display, not a call; order CTA leads over answering the call |
| 3 | User Control and Freedom | 2 | No clear/X on search; no way to collapse per-row order actions |
| 4 | Consistency and Standards | 2 | h1 text-2xl vs design text-3xl; Field lacks w-full; fake combobox |
| 5 | Error Prevention | 2 | Every row offers Новый заказ before client confirmation |
| 6 | Recognition Rather Than Recall | 2 | Rows show name+phone only — no address/last visit |
| 7 | Flexibility and Efficiency | 1 | No recents, tel: shortcut, or digit-pad-first path |
| 8 | Aesthetic and Minimalist Design | 2 | Dual Add on miss; ~109px rows so ~2 clients fit above dock |
| 9 | Error Recovery | 2 | Filter-miss recovery is only create, not clear/retry |
| 10 | Help and Documentation | 1 | No empty-list guidance; search label is ellipsis hint only |
| **Total** | | **18/40** | **Poor** |

## Design Specificity Verdict

**LLM assessment**: Not production-ready for this product. Tokens are KYZMAT-shaped, but task composition is generic admin CRM (Create → Search → Rows). Product job is find → call/open → order. An unrelated contacts list could ship unchanged.

**Deterministic scan**: CLI detect exit 0, 0 findings on client-search.tsx and clients/page.tsx.

**Visual overlays**: [Human] tab shows nested-cards on the list UL — flagged as false positive vs one Slip + ruled list pattern.

## Overall Impression

The shell looks like KYZMAT; the clients list behaves like a desktop admin roster. Stakeholder dissatisfaction is justified: Create owns the stamp primary, Find is a truncated field, call is not on the list, and every row burns a full secondary CTA.

## What's Working

1. One Slip, ruled list, bilingual chrome, ≥48px targets.
2. Local name/phone digit filter with new-client deep link on miss.
3. Query failure Notice path separate from empty list.

## Priority Issues

### [P0] Create owns the screen; Find does not
- Why: Call-time job is find existing; stamp blue trains the wrong habit.
- Fix: Search as hero; demote Add to secondary or zero-hit only.
- Suggested command: /impeccable distill

### [P0] Search control physically truncated
- Why: Field/input without w-full renders ~242px in a ~294px column — broken Find surface on phone.
- Fix: Force full-width Field in this layout.
- Suggested command: /impeccable adapt

### [P1] No call from the list
- Why: PRODUCT success is answering from the client thread; list forces extra navigation.
- Fix: Dedicated ≥48px tel: control without killing open-row.
- Suggested command: /impeccable harden

### [P1] Per-row Новый заказ destroys scan density
- Why: ~96–109px rows; only ~2 clients above dock; order before identity confirmation.
- Fix: Order after open, or one compact trailing action after confirm.
- Suggested command: /impeccable layout

### [P2] Zero-hit copy missing; Add duplicated
- Why: Looks like a broken list; can't tell filter-miss from failure.
- Fix: Explicit miss copy + single Add; quiet header Add while filtering.
- Suggested command: /impeccable clarify

## Persona Red Flags

**Casey**: Add in upper card anti-thumb; truncated search; filter state lost on app switch; tall rows + dock scroll tax.

**Jordan**: Twin Add buttons on miss; ellipsis label as only instruction; order on every stranger row.

**Айгерим**: Cannot dial from list; no address/notes on row; find buried under Create; sunlight skim fails on mute phones.

## Minor Observations

- Fake combobox ARIA (always expanded).
- h1 size drift from design.md.
- Client without phone handled; still no other recognizer on row.
- Dock Due disabled is honest but still a fourth nav decision.

## Questions to Consider

1. If the phone is ringing, why is the first blue thing «create a person»?
2. What if this screen were only a full-width digit/name find, with Add after zero hits?
3. Should Новый заказ exist on a list row before the clerk opens the client?
4. What would Айгерим’s first thumb target be if the last four digits were already in her head?
