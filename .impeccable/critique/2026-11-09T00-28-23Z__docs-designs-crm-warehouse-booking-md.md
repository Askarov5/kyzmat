---
target: docs/designs/crm-warehouse-booking.md
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\docs\\designs\\crm-warehouse-booking.md"
target_fingerprint: "sha256:5180184e341b3bee14d5aa4a7087f1adf22d12c46ab9a084248f6f69ffe58fcd"
target_path: "C:\\Users\\AirPods\\Desktop\\git\\kyzmat\\docs\\designs\\crm-warehouse-booking.md"
timestamp: 2026-11-09T00-28-23Z
slug: docs-designs-crm-warehouse-booking-md
---
Method: dual-agent (A: 51a41265-942d-49ef-82ad-067fb66c794e · B: 02bd8233-61f3-495a-aa94-1612ad3c5c6d)

Context loading ran.

This report is from a subagent, so the closing questions are written here instead of a live decision page.

A newer Impeccable (v4.8.1) is available. Update now? It runs `npx impeccable update`.

Target: `docs/designs/crm-warehouse-booking.md` (APPROVED), read with `design.md`, `DESIGN.md`, and `PRODUCT.md`. Operate mode. No surface brief was found. The detector scanned the markdown only. No browser overlay was injected.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | `design.md` disables the button and shows `messages.saving`. An equal correction in `crm-warehouse-booking.md` writes nothing and specifies no status. The booking button's landing is stated in Success Criteria, not on the control. |
| 2 | Match System / Real World | 3 | Name-or-phone search, oblast then raion, and a hold for a named client match the shop. The card's "model" is defined as the product name, with no clerk-facing sentence. |
| 3 | User Control and Freedom | 2 | Cancel releases an open hold. A removed row can be restored. Complete has no reverse. Cancel is not specified as a locked exit. |
| 4 | Consistency and Standards | 2 | One slip and the same dock hold. `design.md` and the booking doc disagree on the company name below 380px, on what a client row is, and on how many actions the order screen has. |
| 5 | Error Prevention | 2 | Booking and correction lock the balance and refuse an oversell. A signed-in person with no membership is shown create-company. Cancel does not lock the order. |
| 6 | Recognition Rather Than Recall | 2 | The client is filled in from the row or the card. Free, held, and on-hand stay on the product screen. The members door is an unlabeled company name. |
| 7 | Flexibility and Efficiency | 2 | The same form opens from the row, the card, and Orders. Nothing says a half-filled order survives a phone call. One product per order is settled and is not this deduction. |
| 8 | Aesthetic and Minimalist Design | 3 | One white card, one blue booking button, Due left closed. Complete and cancel are unnamed controls, and the member list always includes removed rows. |
| 9 | Error Recovery | 2 | `design.md` puts a Notice above the button, in Kyrgyz and Russian. This pass says "alerts and writes nothing" and does not write the sentence or the next step. |
| 10 | Help and Documentation | 2 | Labels sit above fields. Join, the last-unit failure, and removal have no outdoor sentence. |
| **Total** | | **22/40** | **Acceptable** |

## Design Specificity Verdict

**LLM assessment.** The stock promise is written for these two shops. The frame around it is a category phone form.

`crm-warehouse-booking.md` is specific where the work is specific: search by name or phone, one product and one amount, free stock as on-hand minus holds for a named client, oblast then raion, `+996`, Kyrgyz default, and a warehouse role that cannot book. The office-hours note records the pull back to "THE USUAL CRM + warehouse." That fits an Operate counter.

The composition stops at a path. The approved picture is one sentence: a Clients row button, the same button on the card, and one new-order form with client, address, product, and amount. Styled variants did not run. Nothing in the markdown places the address, notes, and next date above the fold for the HVAC call, or puts the free count on the booking thumb for the oil promise. The white card, the blue button, and the four-item dock could belong to any small CRM.

**Deterministic scan.** `impeccable detect --json docs/designs/crm-warehouse-booking.md` exited 0 and returned `[]`. Zero findings, no rule names, no file locations. A markdown file has no rendered controls, so this clean result does not confirm the phone screens. The review above is the evidence. The detector did not catch the spec conflicts, and it did not clear them.

**Visual overlays.** No overlay. The target is a design document, not a viewable URL. No live server was started and no script was injected. There is no [Human] tab.

## Overall Impression

The hold is specified tightly enough to build, and the phone around it is not. The single biggest opportunity is to put the number being promised, and the door a new agent walks through, on the screen the thumb already has.

## Cognitive load

**6 failures. High.**

- **Single focus — fail.** `design.md` makes the client row one link. The booking doc adds "add order" on that same row. Due stays in the dock as a disabled item, which is fine. The search result has two targets.
- **Chunking — fail.** The order form is one stack: client, address, product, amount, date, note. Six fields, no subgroup. The limit is four.
- **Grouping — pass.** One slip, ruled rows, label above the control. The product detail groups on-hand, held, and free.
- **Visual hierarchy — fail.** `design.md` gives one primary Button per form. On the order screen, complete and cancel are both "a control," with no primary and no danger.
- **One thing at a time — fail.** The prose says the person picks client, then address, then product, then amount. The specified form shows those fields plus date and note together. The only disabled-until-parent rule in the set is the raion combobox.
- **Minimal choices — fail.** The header is five targets on one row: wordmark, company name, Kyrgyz, Russian, sign-out (`design.md`, page chrome and language). The dock is four, at the limit. The oblast list is nine places inside a closed combobox, which the interface standard already accepts, so it is not counted as a second wall of options.
- **Working memory — fail.** Free, held, and on-hand are on the product list and the detail page. The amount is judged after confirm. The owner has to remember that the company name opens the code and the member list.
- **Progressive disclosure — pass.** Comboboxes stay closed until focus. Warehouse does not get the order form. Agents do not get receive, correct, invite, or removal.

## Emotional journey

The peak this product promises is the promise itself: the clerk answers from the card, and two agents cannot sell the last unit. The spec puts the lock on the database and leaves the person alone on the screen.

Booking the last unit collects an amount while the free quantity sits on another screen. Success has no sentence. Failure is "alerts and writes nothing." The person who loses the race is not shown who holds the unit, or how many remain. That is the valley at the success line in `PRODUCT.md`: two agents unable to promise the same last unit.

Removing an agent sets `removed_at`, keeps the row, and can be cleared later. There is no specified confirm and no specified notice text. The agent's ending is a sign-out on the request that finds the removal, including one already in progress. The owner can undo it afterward. The agent in the yard cannot.

Stock correction asks for a new on-hand quantity. A typo above the held sum commits. An equal value writes nothing, so a missed tap and a no-op look the same in sunlight.

The booking end is "the order screen shows the saved product name and the amount," with the route after confirm left implied. The removal end is a notice whose words are unwritten, then the session is gone. Peak-end is flat because the spec specifies the transaction and not the sentence read outdoors.

`PRODUCT.md` says the person is interrupted. The booking doc says long typing happens when someone has stopped, and the car is for search and for starting the order. Nothing says the half-filled order is still there when the call ends.

## What's Working

- The hold is one transaction. It locks the balance, free equals on-hand minus open and in-delivery lines, and the insert happens only when the amount fits. On-hand does not change at booking. The product list shows that same free number. That is the warehouse promise, and it is specified tightly enough to build (`crm-warehouse-booking.md`, The order and The pile).
- The role split is explicit. Agent books, completes, and cancels. Warehouse receives and corrects and does not get the order form. Owner does both. A warehouse save alerts and writes nothing. The dock does not grow a fifth item.
- Removal is reversible on the same list. Rotating the code kills the previous code. A removed person cannot rejoin with that code. The model matches "the company can remove an agent anytime."

## Priority Issues

**[P0] The join task has no door.**

- **Why it matters:** Success says a new phone joins with the company code and does not create a company (`crm-warehouse-booking.md`, Success Criteria). The screen specified for a signed-in person with no membership is the create-company form, and that path does not become the invite screen (Invite and removal). The join page accepts one code. No control, route, or sentence connects those two screens. The person who was invited is looking at the form that starts a second shop.
- **Fix:** On the company link, a signed-in person with no membership sees one code field and one primary button that inserts `agent`. Create-company stays the path for someone starting a shop, with one Kyrgyz sentence and one Russian sentence that point an invited person at the code. A wrong code uses a Notice above the button and writes nothing.
- **Suggested command:** `/impeccable shape`

**[P1] The last unit is judged after confirm.**

- **Why it matters:** On-hand, held, and free are on the product list and the detail page (The pile). The order form's fields are client, address, product, amount, date, and note (The order). Over-free "alerts and writes nothing." `design.md` requires that alert to be a Kyrgyz sentence and a Russian sentence in a Notice above the button. This pass does not write it, and it does not keep the free number on the form. Two agents can type the same last can and learn the result only after the thumb hits confirm.
- **Fix:** When a product is chosen, show its free count on the form in mute `tabular-nums`, above the amount. The Notice names that count and tells the person to enter a smaller amount. The locked check stays the authority.
- **Suggested command:** `/impeccable clarify`

**[P1] Below 380px the header cannot satisfy both files.**

- **Why it matters:** `design.md` and `DESIGN.md` hide the company name below 380px so the language words stay whole, and show the name only when it fits. The booking doc shows the name at phone width, including below 380px, and makes it the owner's only link to the code, rotate, and the member list (Invite and removal, and the R3-2 remedy). The header is already one row: wordmark, name, Kyrgyz, Russian, sign-out. A common phone is 360–375px wide. On that width, one of the two files fails: the owner has no members control, or Kyrgyz and Russian cannot both stay whole.
- **Fix:** Specify one header row that keeps both language words whole and gives the owner a control of at least 48px that opens the code and the member list. Warehouse and agents still see the company name as text. Do not add a dock item and do not add a second header.
- **Suggested command:** `/impeccable layout`

**[P1] Complete and cancel can disagree about the pile, and neither is named.**

- **Why it matters:** Complete locks the order and the balance, then ships and decrements on-hand (The order). Cancel sets `cancelled` while status is open or in delivery and does not lock the order. Reviewer concern R3-3 says a cancel that has already seen `open` can commit after complete has shipped, leaving the order cancelled and the pile already reduced. That remedy is not in the body. "Unresolved at the cap" omits R3-3. `design.md` allows one primary Button per form and uses `tone="danger"` for a destructive submit. The order screen says complete and cancel "live" there, with no tone. Removal, code rotation, and correction commit the same way, with no outdoor sentence.
- **Fix:** Put the R3-3 remedy into The order: one transaction, lock the order, set `cancelled` only while status is still `open` or `in_delivery`, otherwise alert and write nothing. On that screen, complete is the one primary Button and cancel is `tone="danger"`. Write the Kyrgyz and Russian Notice for removal, rotation, a below-held correction, and an equal correction that changed nothing.
- **Suggested command:** `/impeccable harden`

**[P2] The client row is two targets in one 48px link.**

- **Why it matters:** `design.md` defines the row as one link at least 48px tall, name first. The booking doc adds add-order on each row and on the card. The sketch names the button and does not say how the link and the button split the thumb. A row that stays one target high cannot hold a second 48px control. The primary path is "start an order from the row."
- **Fix:** Inside the one rounded list, give the name link and the add-order button each a target at least 48px tall. Keep them ruled rows. Do not turn the list into a stack of cards.
- **Suggested command:** `/impeccable adapt`

## Persona Red Flags

**Casey (one thumb, interrupted).** The new-order form. Six fields, confirm at the end, dock cleared by `pb-28`, no specified draft if the call moves them to WhatsApp. The note sits on the form the car is not supposed to type (`crm-warehouse-booking.md`, Constraints). The client row asks for a second tap beside the row link. Sign-out, language, and the owner's only members door sit in the header, above the thumb. Below 380px that header is the collision above.

**Jordan (first-time agent).** The signed-in, no-membership screen is create-company. The join page has no specified way in. After a bad code, the page alerts and writes nothing, with no sentence. On the order form, the three stock facts are on the product screen, and a too-large amount only alerts. The card calls the model the product name (Maintenance date) and does not say that in the interface. Due sits in the dock and does not open.

**Alex (owner who already knows the shop).** The header company name is the only door to invite and removal and is not labeled as that door. One visit that promises two products is two orders, which is the settled rule, so the friction he will feel is opening that form twice with no retained client. The client card leads with the earliest `next_on` only when `maintenance_days` is already 14, 30, 90, 180, or 365, and this markdown never names the screen that sets that value. Correction replaces a known pile with a typed number and shows no delta before the write.

## Minor Observations

- The concerns footer is stale against the body. The lock-first correction and the always-visible company name are in the main text. "Unresolved at the cap" still quotes the old R3-1 and R3-2 problems, and it drops R3-3, whose remedy was never copied into The order.
- An equal correction writes nothing and specifies no status. In sunlight that is the same as a tap that missed.
- Empty-state sentences for join, the member list, and an empty product combobox are not in this pass. `design.md` requires an empty state that is distinct from a failed query. Agents cannot create a product, so an empty catalog needs a sentence.
- `design.md` caps a list at 500 rows and filters search on the device. A phone number outside that cap never appears. The booking doc says client search stays.
- The primary booking verb is "confirms the booking." `design.md` takes the label from `messages.save` or a specific verb such as receive. The Kyrgyz and Russian verb is not chosen.
- Date and note stay on the form with no stated required or optional mark.
- Premise 1 says the card shows the next maintenance date. Completion writes `client_service.next_on` only when `maintenance_days` is already one of five intervals. This pass does not name the control that sets the interval, so a new product never grows the date Tynarbek asked for.
- `PRODUCT.md` says completion ships stock and writes a placement when the product tracks installation. The booking complete transaction writes a `ship` move, decrements on-hand, and may write `next_on`. Placement is neither included nor ruled out.

## Conflicts

- **Company name under 380px.** `design.md` and `DESIGN.md`, Language: below 380px the company name hides so the language words stay whole. Page chrome shows the name when it fits. `crm-warehouse-booking.md`, Invite and removal: the name stays visible at phone width, including below 380px, and for the owner that name is the link to the code, rotate, and the member list.
- **Who the roles are.** `PRODUCT.md`, Capabilities: roles are owner and agent. The booking doc adds `warehouse`. The stored `owner` role is the admin. This pass has already decided the warehouse role. `PRODUCT.md` has not caught up.
- **What completion writes.** `PRODUCT.md`: completion ships stock and writes a placement only when the product tracks installation. The booking complete transaction sets `completed`, inserts a `ship` move, decrements on-hand, and may write `client_service.next_on`.
- **One primary control.** `design.md`: one `Button` per form, danger tone for a destructive submit. The booking constraints repeat "one primary button." The order screen then places complete and cancel there as two unnamed controls.
- **What a row is.** `design.md`, Lists of records: the row is a link of at least 48px. The booking doc: each row and the client card get one action, add order.
- **Cancel, inside the booking doc.** The order sets `cancelled` when status is open or in delivery, with no lock. R3-3 says that must be one locked transaction. The remedy is not in the body. Unresolved at the cap omits R3-3 and still lists R3-1 and R3-2, whose remedy text is already in The pile and Invite and removal.

## Gaps that fail on a phone in daylight

- **Join has no entry.** The no-membership screen is create-company. The join page is specified separately. Nothing on the phone tells a new agent how to reach the code.
- **The booking form does not show the number it checks.** Free, held, and on-hand are on the product list and the detail page. The oversell alert has no sentence and no instruction to lower the amount.
- **The header fight is a layout.** Five targets, one row, and two files disagree about the company name below 380px.
- **Remove, rotate, complete, and correct have no outdoor sentence.** Cancel is not the same locked write as complete. A mis-tap on a 48px row signs the agent out. The later restore does not help the person who was mid-request.
- **The client row's second target has no hit area.**
- **The half-finished order has no specified survival.** Interruption is the operating context. No draft, no retained client, no retained amount.
- **`maintenance_days` has an effect and no cited screen.**
- **After confirm, the destination is implied.** Success Criteria require the order screen to show the product and the amount. The primary button is not given that destination in The order.
- **New screens are missing the empty and failure sentences `design.md` requires.** Join, members, and an empty product combobox.

## Settled, and not open again

- Finish the Next.js and Supabase trial. This pass does not replace it. A rewrite is ruled out in Approaches Considered.
- The product is search by name or phone, a client card, and a booking. The booking is the stock update. Invoices, an AI note-taker, a document pile, tasks, internal chat, and the Due dock are out. Due stays in the dock, disabled. Dock order stays Clients, Orders, Products, Due.
- One order, one product, one whole amount from 1 through 100000. Any other amount alerts and writes nothing. A second product is a second order.
- Agents book, complete, and cancel. They do not receive, correct, or type a new on-hand number. Warehouse receives and corrects, and does not book, complete, cancel, create a product, archive, invite, or remove. The owner does all of it. Add-order is hidden for warehouse. A warehouse save alerts and writes nothing.
- Booking does not change on-hand. Free is on-hand minus amounts on lines whose orders are `open` or `in_delivery`. The product list shows that free number. The detail page shows on-hand, held, and free. Available is calculated.
- This pass does not add a control that sets `in_delivery`. New orders stay `open` until complete or cancel. Existing `in_delivery` rows still count in the hold.
- Complete locks the order and the balance, ships, and decrements on-hand in that same write. A completed order cannot be cancelled by the cancel control. Cancel writes no stock move and leaves on-hand unchanged. The hole is the missing lock on cancel, not the meaning of the two actions.
- Correction locks first and re-reads on-hand and the held sum. Below the held sum alerts and writes nothing. Equal to on-hand writes nothing. Higher writes `correct_in`. Lower writes `correct_out`.
- The owner's entry to the code, rotate, and the member list is the company name, not a dock item. Warehouse and agents see that name as text. Rotating the code makes the previous code fail. Removal sets `removed_at` and keeps the row. Restore clears `removed_at`. The shared code does not clear a removal. The next request that finds the removal shows a notice in that membership's locale and signs the session out. A WhatsApp message was not requested. Joining inserts `agent` and does not create a tenant. A wrong code alerts and writes nothing. The create-company form stays for a person who is starting a shop.
- No equipment-model column this pass. The model on the card is the product name. Notes stay in `client_notes`. `next_on` is per client and product, in `tenants.timezone`, default `Asia/Bishkek`.
- The order form keeps the trial's date and note. Address choices are that client's addresses. From the row or the card, the client is already set. From Orders, the client starts empty. One primary button confirms the booking and is disabled while it saves.
- Client search by name or phone digits stays. Place picking stays oblast, then that oblast's raions and cities, including Bishkek and Osh in the first list. Kyrgyz is default. Russian is complete. No English in the interface. Company, client, and product names stay as written. Noto Sans. One white card. Targets at least 48px. Sign-in phone is `+996` plus nine digits. A failed query is an alert, not an empty list. The deliverable is the phone website.
- The assignment stands: watch a real search before adding the product line, and ask what the shop will pay and on what date.

## Questions to Consider

- The company name is the only door to the people who can empty the warehouse. On the phone where that name was hidden so Kyrgyz and Russian could stay whole, what is the owner's thumb actually hitting?
- When the last can is already promised, the agent hears it after typing the amount. What has to be on the form before confirm, or the alert is a dead end?
- Removal ends a session that may be mid-booking, and the same list can restore the person later. What does the owner read at the tap, and what does the agent read as the session ends?
