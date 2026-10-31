# KYZMAT

**Master Product Requirements — MVP**

| | |
|---|---|
| Product | KYZMAT |
| Version | 1.3 |
| Date | 31 October 2026 |
| Status | Source of truth for the first release |
| Supersedes | KYZMAT 1.2 and earlier |
| Languages | Kyrgyz by default, Russian as a full translation |
| Stack | Mobile web app, Next.js, Supabase (Postgres, Auth, Realtime, Storage) |

KYZMAT is one product for two kinds of small company. An AC, filtration, or heating shop uses it as the client record. An oil or product-sales company uses it so agents can see stock and reserve it for a client. Both run the same loop: client, product, delivery, completed, and a reminder for the next maintenance or the next order.

The interface opens in Kyrgyz. Russian is a complete second language, switched by the person, not a partial overlay. On a phone, repeated values are picked from an autocomplete or a combobox. The keyboard is the exception, used when a value does not exist yet.

---

## 1. What changed in 1.1

Version 1.0 treated KYZMAT as a field-service visit log and left reservations out of the first release. That misses half the companies this product is for.

| Topic | 1.0 | 1.1 |
|---|---|---|
| Who it is for | HVAC technicians and owners | Service shops **and** oil or product-sales teams, on the same modules |
| Core record | A job | An **order**: client, products, delivery, completion, follow-up |
| Moment that matters | Closing a visit on site | Also answering the phone: model, date, address, notes |
| Stock | On-hand only. No holds | **Available = on hand − reserved.** A reservation belongs to an order and an agent |
| Reminder | Maintenance on an asset | Maintenance **or** the next order, from the same due list |
| WhatsApp, vans, offline stock | On the MVP path | Later. They are not required to solve the five-step loop |

### What changed in 1.2

| Topic | 1.1 | 1.2 |
|---|---|---|
| Language | English first | **Kyrgyz** is the default. **Russian** is a full translation |
| Data entry | Search plus typed forms | Autocomplete and comboboxes. A new value is typed once, then it joins the list |
| Notes, units, intervals, locality, model | Free text | Picked from a list. The list grows when someone adds a missing value |

### What changed in 1.3

| Topic | 1.2 | 1.3 |
|---|---|---|
| Who a company is | A setting of service, sales, or both, with no default story | Small shops default to **both**. Sales-only is for delivery businesses such as engine oil sold to oil-change shops |
| Product fields | Name plus several optional catalog fields | **Name is required.** Description is optional. Size and model may live in the name |

---

## 2. The two businesses

Small shops do **both**: they install or maintain equipment and they sell goods. A new company starts on `both`. The owner can switch the emphasis to `sales` or `service`. The records stay the same. Labels and which block leads on the client screen follow that setting.

Some companies are sales only. A car engine-oil seller delivers to oil-change shops and settles with them. They do not install a unit or book a maintenance visit. Their client is the shop, the product is the oil, and the order ends when it is delivered.

| | Service, inside a shop that does both | Sales, including sales-only |
|---|---|---|
| Examples | AC install and maintenance, water filtration, heating systems | Engine oil delivered to oil-change shops, filters, and other goods |
| What “product” means | The unit or part installed or serviced at an address. The name can carry the model, as in `AC MODEL 321d12 W3M` | The good the agent delivers. The name can carry the size, as in `Elf Oil 3.5 L` |
| What the client screen leads with | What was installed: product name, date, address, notes. Description if one was entered | Open reservations, last delivery, next reorder |
| What completion writes | A placement at the address, plus a maintenance date when the product has one | A fulfilled delivery, plus a reorder date when the product has one. No placement |
| Stock | The lines on the order are reserved, then removed from on-hand at completion | The agent reserves a quantity for that shop, then delivery completes it |

One client can have an installed boiler and a recurring oil order. An oil-change shop as a client may have only deliveries.

---

## 3. Problem

These companies lose the thread between the phone call, the stock room, and the next visit or the next order.

1. **The client calls, and the answer is in someone’s head.** The shop needs the address, which model was installed, when, and the notes. That information is in a notebook, a gallery, or a personal chat.
2. **Two agents promise the same goods.** Oil and other product sales depend on seeing what is still free and holding it for a named client. A count that ignores holds causes a broken promise.
3. **Delivery and the follow-up are separate from the sale or the install.** Once the work is done, nobody has a reliable date for the next maintenance or the next order.

KYZMAT is for companies of roughly 1–15 people. It is multi-tenant. The first companies are set up with concierge onboarding. Isolation is in the database from the first table.

---

## 4. The MVP loop

This loop is the release. Everything in the first build serves one of these steps.

| Step | What the business records | What they can do the next time |
|---|---|---|
| 1. Client | Name, phone, one or more addresses, notes | Find them when they call |
| 2. Product | Catalog item, quantity on hand, quantity already reserved, quantity available | See what can still be promised |
| 3. Delivery | An order in progress: who it is for, which products, which address, who is taking it, the date | Move it from open to in delivery |
| 4. Completed | The order is done. Installs stay on the address. Sales stay on the client history. On-hand drops by the delivered quantity | Read it on the next call |
| 5. Reminder | A date for maintenance or for a new order | Turn that row into the next order |

An order can be completed without a long delivery (a counter sale, or an install written down after the fact). The record still lands on the client.

---

## 5. Users

Two roles. Everyone in the company can read clients, products, orders, and stock. Writes differ.

| | Owner | Agent |
|---|---|---|
| Who | Runs the shop. In a sales company, may also sell | Technician or sales agent |
| Can do | Invite and remove people, receive stock, correct counts, cancel any order, reassign delivery | Look up a client, create an order, reserve up to the available quantity, add notes, move delivery forward, complete or cancel their own open order |

Removing a member cuts off access on the next request. Clients, orders, placements, and stock stay with the company.

The product calls this person an agent in both businesses. A service company may think of them as a technician. The permissions are the same, so a shop that does both does not need a second role.

---

## 6. Goals and non-goals

### 6.1 Goals

- From a phone number or a name, the business opens one client card: addresses, what was installed (model, date, notes), open orders, last completion, and the next reminder.
- An agent sees on hand, reserved, and available for a product, and can reserve a quantity for a named client.
- A second agent cannot reserve quantity that is no longer available. The first agent’s hold shows the client and the agent’s name.
- Delivery moves open → in delivery → completed, or open → completed when there is nothing to track in between.
- Completion reduces on hand, closes the reservation, and files the install or the sale on the client.
- The due list shows maintenance and reorders inside 14 days. The owner or agent creates the next order from that row. Nothing sends itself.
- The app opens in Kyrgyz. A person can switch the whole interface to Russian, and that choice sticks.
- An order is built by tapping lists: client, address, product, quantity, date, and agent. Typing happens when the list has no match.

### 6.2 Non-goals

- Prices, invoices, taxes, payments
- Purchase orders, costing, serial-only warehouse identity, multiple warehouses
- A reservation that is not tied to a client and an order
- Automatic expiry of reservations, and automatic sending of reminders
- Per-van inventory. One warehouse pool in this release. A van bin waits until a shop is actually losing track of truck stock
- WhatsApp inbox, templates, and webhooks
- Offline reservation or offline stock changes
- Route optimization, GPS, signature capture
- Native apps, billing plans, self-serve signup
- A separate dispatcher role
- A third interface language, and machine translation of client names, product names, or notes
- Blank text forms as the way to pick a client, product, address, model, unit, interval, agent, date, or note

### 6.3 Success

**Service:** when a client calls, staff can say which model is at which address, when it was installed or last serviced, and what the notes say, without leaving KYZMAT.

**Sales:** two agents, looking at the same product, cannot both reserve the last available quantity. The client who got the hold is named on the product.

**Shared:** a completed order produces a due row for the next maintenance or the next order, and that row can become a new order in one step.

---

## 7. Experience

The people using this are on a phone, often while talking to a client.

- Primary actions sit in the bottom 40% of the screen: save, reserve, start delivery, complete.
- Targets are at least 48×48 px, with at least 8 px between them.
- Clients, orders, products, and due rows are stacked cards. No horizontal tables.
- Client lookup is an autocomplete. The first characters of a name or a phone filter the list. `+`, spaces, and dashes still match the stored number. The person taps a row. They do not finish by submitting a typed query into an empty page.
- Reservation and completion need a connection. The screen says so when they are unavailable. A client card already opened can still be read from cache.
- Empty states are part of the screen: no clients yet, nothing on hand, nothing due.
- The typeface covers Kyrgyz Cyrillic, including Ң, Ө, and Ү, in both weights used on screen.

### 7.1 Language

Kyrgyz (`ky`) is the language on first open. Russian (`ru`) is a full translation of the interface. The switch sits on the account control, and the choice is stored on the member. The next session opens in that language.

Every interface string ships in both languages: navigation, buttons, statuses, empty states, errors, units that come with the product, correction reasons, and the seeded locality names. A missing Russian string is a defect. It falls back to Kyrgyz, never to English.

Names the company creates — clients, products, models, note phrases — are stored once, as written. KYZMAT does not translate them. A product named in Russian still appears in Russian when the interface is Kyrgyz.

Dates and numbers follow the active language. The shop’s timezone is unchanged.

### 7.2 Picking instead of typing

If the value already exists, the control is an autocomplete or a combobox. Each option is a row at least 48 px tall. Filtering may use the keyboard. Choosing is a tap.

**Add** is the last row, and only when the filter matches nothing. Saving that value puts it in the list for the next person. The field does not stay a blank text box.

| Field | Control |
|---|---|
| Client | Autocomplete on name or phone |
| Address | Combobox of that client’s addresses. Add address is the last row |
| Locality | Combobox of Kyrgyzstan cities and districts. The label follows the active language. Kyrgyz and Russian names both match the filter |
| Product | Combobox of active products. Only the owner sees Add product |
| Model | Autocomplete of models already used for that product. A new model joins the list |
| Unit | Combobox. The seed is piece, liter, and drum, in Kyrgyz and Russian. Units the company adds are appended |
| Interval | Combobox: 2 weeks, 1 month, 3 months, 6 months, 12 months. Stored as days |
| Agent | Combobox of members |
| Date | Today, tomorrow, and the next days as rows, then a calendar. Not a typed date |
| Quantity | Stepper |
| Status | Buttons: in delivery, completed, cancelled |
| Note | Combobox of phrases this company has saved, most used first. Add phrase saves one line into that list |
| Product description | Optional line on Add product. Dimensions and other detail go here. Saving the product does not require it |
| Stock correction reason | Combobox: count correction, damaged, lost |
| Serial | Optional one-line entry. Skip is the default. A serial is unique to a unit, so it is not chosen from other units |
| New phone | Numeric entry only while creating a client the autocomplete did not find |

A form that asks the person to type a product name, a city, a model, or a note from an empty box does not meet this release.

Adding an address still needs one line for the street or house, because that string is new. The locality on that same form is the combobox. The phone on a brand-new client is the other line that starts empty. Both are saved into the lists above.

---

## 8. Screens

Bottom navigation: **Clients**, **Orders**, **Products**, **Due**. Team and stock corrections live under the owner’s menu on Clients or Products.

| Screen | Purpose |
|---|---|
| Clients | Autocomplete. The result row shows name, phone, locality |
| Client | The call screen. Phone (tap to call), addresses, notes, installed products, open orders, last completion, next reminder |
| Order | Client, address, lines, reserved quantities, assignee, date, status, notes. Bottom actions move the status |
| Products | On hand, reserved, available. Open a product to see which open orders hold it |
| Product on an order | Quantity stepper limited to what is still available for this order |
| Due | Follow-ups due within 14 days. Create order prefilled |
| Receive stock | Owner adds quantity to on hand |

**Client screen, service emphasis.** Installed products lead: model, serial if any, installed or last serviced date, address, notes.

**Client screen, sales emphasis.** Open reservations and the last delivery lead, then the next reorder date.

**Both.** The other block is still on the card, under the lead block.

---

## 9. Functional requirements

### FR-1. Company and access

Creating an owner creates the tenant, the owner membership, one warehouse, the timezone, and business focus `both`. The owner can set focus to `sales` for a company that only delivers, such as engine oil to oil-change shops.

Inviting an agent sends an email link. On accept, they can look up clients and create orders.

**Acceptance**

- A user outside the company cannot read its clients or stock.
- Removing an agent blocks the next request.
- Business focus only changes emphasis and labels, not which records exist.

### FR-2. Clients and addresses

A client has a display name, an optional phone in E.164 (unique per company when present), and notes. A client has one or more addresses (line, locality, optional label).

The owner can archive a client. Archived clients leave search. Their orders and installations remain.

Notes on the client are the scratch pad for the call: access instructions, preferences, what was promised verbally. Each note has an author and a time.

**Acceptance**

- The autocomplete finds a client by phone regardless of formatting, and by the start of the name.
- The client card shows installations, open orders, the latest completed order, and the next follow-up without opening each order.
- A note chosen or added during a call is visible on the next lookup.

### FR-3. Products and stock

**Name is the only required field.** A small catalog is a list of names. Size and model belong in the name when that is enough: `Elf Oil 3.5 L`, `AC MODEL 321d12 W3M`.

Everything else is optional:

- **Description.** A short extra line for dimensions or any detail that should not be crammed into the name. The product card shows it under the name when it is present.
- SKU, unit, maintenance interval, reorder interval, model, serial.

A product can be saved from the name alone. The Add product sheet does not block on the empty optional fields.

Two optional intervals, in days:

- **Maintenance interval.** Used when this product stays at the address (an AC, a filter bank, a heating unit).
- **Reorder interval.** Used when the client buys it again (oil and other consumable goods).

Either, both, or neither may be set. A filter might have both.

**On hand** is a single warehouse quantity per product. The owner receives stock and may correct it. A correction requires a reason: count correction, damaged, or lost. Corrections are new ledger rows. The balance updates in the same transaction.

**Reserved** is the sum of quantities on order lines whose order is `open` or `in_delivery`.

**Available** = on hand − reserved. It is never stored as its own source of truth. It is calculated. The product card shows all three numbers.

**Acceptance**

- Receiving 10, then reserving 4, shows on hand 10, reserved 4, available 6.
- A correction cannot push on hand below the quantity already reserved.
- Inactive products stay on old orders and disappear from the picker for new lines.

### FR-4. Orders and reservations

An order belongs to a client and one address, and has an assignee, a scheduled date, notes, and a status.

| Status | Meaning |
|---|---|
| `open` | Client and lines are set. Line quantities are reserved |
| `in_delivery` | Someone is taking the goods or doing the visit. Lines stay reserved |
| `completed` | Delivered or work finished. Reservation closes. On hand drops |
| `cancelled` | Reservation closes. On hand does not drop |

Allowed moves: `open` → `in_delivery` → `completed`, `open` → `completed`, and `open` or `in_delivery` → `cancelled`. Completed and cancelled are terminal.

Adding or raising a line reserves the extra quantity only when available covers it. The check and the insert happen in one transaction. Lowering or removing a line releases the difference immediately. Each line stores the agent who last reserved it.

The product card lists open and in-delivery holds with the client name, the agent name, the quantity, and the order status, so “out for delivery” is visible as a hold that is no longer on the shelf.

There is no reserve button outside an order. There is no timer that silently releases a hold. An order left open keeps the hold until someone completes or cancels it. The Orders list shows how long an open order has been holding stock. The owner can cancel it.

**Acceptance**

- Two agents reserving the last unit: one succeeds, the other sees available 0 and the client who holds it.
- Cancelling an order returns that quantity to available and leaves on hand unchanged.
- Completing an order decreases on hand by the line quantities and reserved returns to zero for those lines.
- A second phone sees the new available figure without a manual reload while it is on the product.

### FR-5. Completion and the address record

Completing an order:

1. Closes the reservation and decreases on hand, as in FR-4.
2. For each line whose product has a maintenance interval, or whose product is marked as installed equipment, writes or updates a **placement** at that address: product, quantity, model and serial if entered on the line, the completion date, and the order note.
3. Writes a **follow-up** when the product has an interval. Maintenance follow-ups attach to the placement. Reorder follow-ups attach to the client, the address, and the product. The due date is the completion date plus the interval. The person completing can confirm or change that date. Dismissing skips the follow-up.

Model and serial are text on the line and on the placement. They are how the shop answers “which unit.” They are not a barcode identity. A photo of the unit or the delivery is optional, stored in a private bucket, and shown on the placement and the order.

**Acceptance**

- After an AC install is completed, a search for that client shows the model, the date, the address, and the note.
- After an oil delivery is completed, the client shows the product, the quantity, the date, and the address. No placement is required when the product has only a reorder interval.
- The due list includes the new follow-up on the confirmed date.

### FR-6. Due list

The due list is a query.

Show follow-ups with a due date on or before today + 14 days, for clients who are not archived, where no open or in-delivery order was already created from that follow-up.

**Create order** prefills the client, the address, the product, and the quantity from the last completed line. The new order reserves stock the same way as any other order. If available is short, the order still opens and the line shows the shortfall. It does not reserve more than available. The agent sees the gap on the card.

Nothing is sent automatically. A phone call from this list is enough for the first release.

**Acceptance**

- A follow-up with an open order created from it disappears from Due.
- Create order on a maintenance row produces an order whose completion can move the placement’s next date.
- Create order works with no messaging integration.

### FR-7. What the phone must show when stock or the network fails

| Situation | What the person sees |
|---|---|
| No client match | The autocomplete stays open and its last row is Add client. The characters already entered are kept |
| Nothing on hand | On hand 0, available 0, and Receive for the owner |
| Reserve above available | The line stays at the previous quantity. Available and the other holds stay on screen |
| Offline | Client card already loaded remains readable. Reserve, receive, and complete are disabled, with a one-line reason |
| Order holding stock for many days | The age is on the order card. The owner has Cancel |

### FR-8. Language

The first screen after sign-in is Kyrgyz unless that member has chosen Russian. Switching language redraws the interface without sending the person back to the start of an order. An in-progress order keeps its selected client, products, and quantities.

Seeded localities and seeded units have a Kyrgyz label and a Russian label. Filtering a locality combobox matches either label.

**Acceptance**

- A new member sees Kyrgyz.
- After switching to Russian, killing the app and opening it again still shows Russian.
- Statuses, the due list, empty states, and the reservation error are Russian in that session.
- A product created with a Kyrgyz name stays in Kyrgyz while the interface is Russian.
- Ң, Ө, and Ү render in labels and in company data.

### FR-9. Autocomplete and comboboxes

The controls in §7.2 are the input method for those fields. The order screen picks client, address, product, agent, and date. Quantity uses the stepper. Notes pick a saved phrase.

Add creates the missing client, address, product, model, unit, or phrase and selects it. The owner is the person who can add a product or a unit. An agent can add a client, an address, a model, and a note phrase.

**Acceptance**

- Creating an order for an existing client and an existing product does not require a text field. The agent taps rows and the stepper.
- A locality is chosen from the list. A typed city that is not selected is not saved.
- Adding the phrase once makes it a row the next agent can tap.
- Serial can be left empty and the order still completes.

---

## 10. Domain model

Identifiers are UUIDs. Every company-owned table has `tenant_id`. Timestamps are UTC. Scheduled dates and follow-up dates are calendar dates in `tenants.timezone`.

| Entity | Fields that matter |
|---|---|
| `tenants` | `name`, `timezone`, `focus` (`both` by default \| `sales` \| `service`) |
| `members` | `user_id`, `role` (`owner` \| `agent`), `locale` (`ky` default \| `ru`) |
| `clients` | `display_name`, optional `phone_e164`, `archived_at` |
| `client_notes` | `client_id`, author, body |
| `addresses` | `client_id`, line, `locality_id`, optional label |
| `products` | `name` required. Optional `description`, `sku`, `unit_id`, `maintenance_interval_days`, `reorder_interval_days`, `tracks_placement`. `active` defaults on |
| `units` | Seeded piece, liter, drum, with `label_ky` and `label_ru`. Company-added units keep the text the owner entered, shown in both languages |
| `localities` | Seeded Kyrgyzstan cities and districts, `name_ky`, `name_ru` |
| `note_phrases` | Company list, the text as saved, a use count for sorting |
| `stock_balances` | `(product_id)`, `qty >= 0` |
| `stock_moves` | `product_id`, positive `qty`, kind (`receive` \| `ship` \| `correct_in` \| `correct_out`), optional `order_id`, author, optional reason. Rows are immutable |
| `orders` | `client_id`, `address_id`, assignee, `scheduled_on`, `status`, optional `source_follow_up_id` |
| `order_lines` | `order_id`, `product_id`, `qty`, `reserved_qty`, optional model, serial, `reserved_by` |
| `order_notes` | `order_id`, author, body |
| `placements` | `address_id`, `product_id`, `qty`, optional model, serial, notes, `installed_on`, optional photo path, link to the latest order |
| `follow_ups` | `client_id`, `address_id`, optional `product_id`, optional `placement_id`, `reason` (`maintenance` \| `reorder`), `due_on`, `source_order_id` |

`reserved_qty` on a line is the hold while the order is `open` or `in_delivery`. On completion it stays as the historical quantity and the live hold is treated as zero because the order is terminal. Shipping is the `ship` move written in that same transaction.

`tracks_placement` defaults on when a maintenance interval is set, and off when only a reorder interval is set. The owner can override it. An AC unit tracks a placement. A drum of oil does not.

---

## 11. Reservation rule

This is the whole availability model. There is no second inventory system.

```
available = on_hand − sum(reserved_qty of lines on open and in_delivery orders)
```

A reserve or an increase runs in one transaction:

1. Lock the product’s balance row.
2. Recompute available.
3. Reject the change when the requested increase is greater than available.
4. Write the line.

Completion, in one transaction:

1. Lock the balance.
2. Insert a `ship` move for each line.
3. Decrease on hand.
4. Set the order to `completed`.

Cancellation changes status only. On hand is untouched. Those lines no longer count toward reserved.

Realtime subscriptions on order lines and balances are how the other agent’s phone updates. They use the signed-in user, so company isolation still applies.

---

## 12. Tenancy and privacy

Enable row-level security on every company-owned table. Policies call `is_member(tenant_id)` for both read and write, so a client cannot choose another company’s id.

```sql
create or replace function public.is_member(tid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.members
    where user_id = auth.uid()
      and tenant_id = tid
  );
$$;
```

Do not read the company id from user-editable metadata. Owner-only actions (receive, correct, cancel someone else’s order, invite) are extra checks on the membership role. They are not a permission builder.

Addresses, phones, notes, and photos are client data. Photo buckets are private. Signed URLs expire. Archive is the way a client leaves search.

---

## 13. Architecture

One Next.js app. One Supabase project. No separate service for inventory.

The browser talks to Postgres through the user session. Reservation and completion go through a single database function each, so the available check cannot be skipped by a modified client.

Auth is email and password for the owner, and an email invite for agents.

“Today” and the 14-day due window use `tenants.timezone`.

WhatsApp is not on this path. The client card is how the business answers a call in the first release.

---

## 14. Build order

1. Company, members, Kyrgyz and Russian strings, clients, addresses, locality combobox, note phrases.
2. Products, receive, correct, on-hand.
3. Orders, lines, the reservation transaction, available on the product card.
4. Delivery statuses and completion: ship, placement, follow-up.
5. The client card assembled for a phone call.
6. Due list and create-the-next-order.

A service pilot can go live at step 5 if placements matter more than stock. A sales pilot needs step 3 before agents promise goods. Both are the same app.

---

## 15. Primary flows

### A client calls a service shop

1. Staff type the first digits or letters and tap the client in the autocomplete.
2. The card shows the address, the installed model, the date, and the notes.
3. They add a note from the call if something changed.
4. If the client wants a visit, they create an order from the placement. Stock is reserved when a quantity is added and available.

### An agent reserves oil

1. The agent finds the client or creates one, with the delivery address.
2. They add the product and a quantity. The transaction reserves it.
3. The product card now shows a lower available number, the client, and the agent.
4. Another agent attempting the remainder sees the hold.
5. Status moves to in delivery, then completed. On hand drops. A reorder follow-up is offered from the product’s interval.

### The reminder becomes the next order

1. Someone opens Due.
2. They create an order. Client, address, and product are already filled.
3. The reservation runs again against today’s available quantity.
4. Delivery and completion work as any other order. The next date is confirmed at completion.

---

## 16. Later

Build these when a real company hits the limit.

| Trigger | Pattern |
|---|---|
| Goods sit on a specific van and the warehouse count is no longer the truth | A second location. Transfers are ledger moves. Reservations stay against a chosen location. Available is still on hand minus reserved at that location |
| Open orders sit for weeks and block stock the agent has forgotten | An age warning first. Automatic release only with an explicit number of days the owner chooses |
| The shop wants the reminder sent for them | A list of due rows the owner confirms, then one channel (SMS or WhatsApp). No unattended send |
| Clients already talk to the shop on WhatsApp | Cloud API, one number per company, verified webhook, idempotent message id, company resolved from `phone_number_id`. The client card stays the system of record |
| The same person must not see another agent’s clients | Agents read their own orders plus unassigned. The owner reads all |
| A unit’s barcode would speed up the install form | The scan fills model or serial. The person confirms. The placement is still keyed by the address and the order |

---

## 17. Pilot readiness

Before a second company is connected:

- Two companies cannot read each other’s clients or stock.
- An agent cannot reserve more than available, including two agents at the same time.
- Completing an order drops on hand once, not twice, when the request is retried.
- A service client search shows model, date, address, and notes.
- A sales product card shows who holds the reserved quantity.
- A completed order with an interval shows up on Due, and Create order reserves only what is still available.
- The due window matches the shop’s timezone around local midnight.
- Photos, if used, are unreachable when logged out.
- A new sign-in is Kyrgyz, a switch to Russian survives a reload, and Kyrgyz letters render.
- An order for an existing client and product is completed by tapping lists and the quantity stepper.

---

## 18. Decided

1. **Small shops do both.** That is the default. Sales-only is a real setting for companies such as engine-oil sellers: the client is an oil-change shop, the work is delivery, and there is no install record.
2. **A product name is required. Every other product field is optional.** Description holds dimensions and similar detail. Shops with a short catalog may put that detail in the name instead (`Elf Oil 3.5 L`, `AC MODEL 321d12 W3M`).

## 19. Open point

The legal entity named on the pilot privacy notice, before any company beyond the first partner. The notice needs a Kyrgyz version and a Russian version.
