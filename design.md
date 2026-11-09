# KYZMAT interface standard

This file is the source of truth for screens, forms, and copy. Follow it on every UI change. The product is a phone app for a shop counter and a yard, used in daylight with one thumb. Kyrgyz is the default language. Russian is a full translation.

## Subject

A daylight phone app for a shop counter. The screen is a soft gray ground, a white card, and one blue action. Tailgrids’ free light theme supplies the components: button, field, card, badge, and alert.

Do not apply landing-page, marketing, or glass-navigation patterns. No dark mode, no second typeface, no all-caps eyebrows, no decorative em dashes, no swipe actions, no data tables on a phone.

## Tokens

Defined in `src/app/globals.css`. Use the Tailwind names. Do not invent a new palette.

| Token | Hex | Use |
| --- | --- | --- |
| `paper` | `#f3f4f6` | Page background |
| `sheet` | `#ffffff` | Card, dock, header |
| `ink` | `#1f2937` | Text |
| `primary-500` / `stamp` | `#3758f9` | The next action, the active language, the current dock item |
| `stamp-hover` | `#2237ee` | Primary control under a pointer |
| `line` | `#e5e7eb` | Borders and row rules |
| `danger` | `#dc2626` | Destructive action |
| `danger-hover` | `#b91c1c` | Danger control under a pointer |
| `mute` | `#374151` | Secondary text and placeholders |
| `field` | `#ffffff` | Field and choice fill |
| `row` | `#f3f4f6` | Row hover and the keyboard-active choice |
| `row-selected` | `#eff3ff` | The chosen list row |

Tailgrids component colors (`button-primary`, `alert-danger`, `badge-primary`, `input`) live in the same file. `Button`, `ButtonLink`, `Field`, `Slip`, `ListRow`, and `Notice` in `src/components/ui.tsx` are the app wrappers around those components.

`color-scheme` is `light`. The viewport `themeColor` is `#f3f4f6`.

## Type

Noto Sans only, with `latin`, `cyrillic`, and `cyrillic-ext`, so Ң Ө Ү render. Body text is 16px. Labels are 14px and semibold. A page title is `text-3xl font-semibold tracking-tight text-pretty`. Counts and phone numbers use `tabular-nums`.

Company names, product names, and client names are stored as written. Do not machine-translate them.

## Page chrome

- `PageFrame` wraps every screen: sticky header, then `<main id="main">` with one `Slip`.
- Header: one row. Wordmark is `Logo`: one rounded slip with a dog-ear cut and a smaller unit square in that cut (header white reads as the fold), in `currentColor`, plus the word `KYZMAT`. It links to `/` with `translate="no"` on the left. On the right, `AccountMenu` shows the company name (not a person name) with a user icon. The open menu has no language caption: full-width equal KY/RU chips (`.lang-set`, `aria-label` only), owner invite as an explicit code link, and sign-out as quiet danger text that arms a confirm. No second header row. Company, client, and product names stay untranslated.
- The slip is one white card: `rounded-2xl`, a hairline border, and a small shadow. One card per screen.
- App screens add `AppShell`. The dock order is Clients, Orders, Products, Due. A section that is not built yet is a disabled item, not a dead link. The current item uses `aria-current="page"` and a primary tint.
- Dock and header are `z-20`. The skip link is `z-30`. Main content clears the dock with `pb-28`. `scroll-padding-top` is `calc(4rem + env(safe-area-inset-top))`.
- Respect `env(safe-area-inset-top)` on the header and `env(safe-area-inset-bottom)` on the dock.

## Components

Extend a screen with `src/components/ui.tsx`. Do not put `primary`, `danger-button`, `field`, `slip`, or `list-row` on a raw element.

- `Slip` is the one white card.
- `Button` is the primary next action, from the Tailgrids button. `tone="danger"` is the destructive fill. One `Button` per form.
- `ButtonLink` is that same action when it navigates, including `tel:`.
- `Field` is the text input. Extra classes such as `tabular-nums` go through `className`.
- `ListRow` is a result row. `ruled` draws the line under it.

`Combobox`, `PlaceFields`, `LocaleSwitch`, and `AppShell` stay product components. They encode shop rules.

## Touch and motion

- Every button, field, list row, and nav item is at least 48px tall (`min-h-12` or the shared classes).
- Interactive controls use Tailgrids’ `rounded-lg` (8px). The card uses `rounded-2xl`.
- Press feedback is `scale(0.98)` on `transform` only, and it is removed under `prefers-reduced-motion`.
- Transitions list `background-color`, `color`, or `transform`. Duration 160ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`. Never `transition: all`.
- Hover styles exist only inside `@media (hover: hover)`.
- `touch-action: manipulation` and no tap highlight. Fine pointers get `overscroll-behavior: none` on `html`.
- Focus is a 2px primary outline with 2px offset. A primary or danger fill uses the Tailgrids focus ring.

## Forms

One form, one primary button, at the end, label from `messages.save` (or the specific verb, such as receive). While pending, the button is disabled and the label is `messages.saving`.

- Label sits above the control, in the same `gap-2` stack. The placeholder is a hint, never the only name of the field.
- Text inputs are `Field`. The next action is `Button`. A secondary choice inside a list uses `.choice`. Archive and other destructive submits use `Button` with `tone="danger"`.
- Stack fields with `gap-4` (16px).
- Mark required with the `required` attribute. Do not add a red asterisk.
- A disabled field uses `.field:disabled`: paper background and mute text. Do not render its list.
- Put the error in `Notice`, directly above the submit button. Map each server error code to a sentence in both languages.
- A failed query is an alert. It must not look like an empty list. Empty copy (`noClients`, `noProducts`) is only for a successful query that returned nothing.
- `autoComplete` matches the data: `name`, `tel`, `street-address`, `one-time-code`. Search and catalog fields use `off`.
- `spellCheck={false}` on phone and code fields.

## Lists and comboboxes

Repeated values are picked, not typed. The keyboard is for a value the shop has not used before.

`Combobox` rules:

- The list is closed until the field is focused, the user types, or the parent passes `startOpen`.
- A closed combobox is not a `Field`. It is a white control with a chevron and the same radius as a field. A value the clerk types, such as the street, stays a `Field` with no mark.
- The open list is a rounded menu of ruled rows over the card, above the dock, scrolling inside `max-h-64`. Rows are not extra fields.
- Choosing a row writes the label into the field, stores the id in the hidden input, and closes the list.
- `aria-selected` is true only for the chosen row. The keyboard row uses `data-active`. The first row must not look chosen before a pick.
- `Escape` closes the list and keeps the current value.
- A new phrase is offered only when `addLabel` is set and the filter has no match.
- Option buttons are rows in that menu.

Place picking is always two comboboxes, in this order, via `PlaceFields`:

1. Oblast. The first list is the seven oblasts plus Bishkek and Osh, because those two are republican cities.
2. Raion or city. Disabled, with no list, until an oblast is chosen. Then it opens and shows only `placesIn(oblastId)`. `key={oblastId}` clears the previous child.

The street line is a separate required text field labeled with `messages.address`, above the two lists. The saved locality is the child place. The server rejects a child whose parent is not the chosen oblast.

## Phone

Sign-in and sign-up accept only a Kyrgyz number: the field always shows `+996`, digits only, exactly nine digits after the code. Use `kyrgyzPhoneDraft` and `toKyrgyzE164`. Reject a local `0…` number on those screens.

A client phone is optional. When it is filled, store it with `toE164`. A local `0` plus ten digits may become `+996` there. Leave the field empty when the shop has no number.

## Language

- Dictionaries live in `src/i18n/messages.ts` with a matching key on `Messages`. Add Kyrgyz and Russian together. Missing Russian falls back to Kyrgyz, never to English.
- The visible `lang` is the active locale. Language lives inside `AccountMenu` as two equal full-width `.lang-set` buttons (no visible “Тил / Язык” label). The pressed language is primary text on a primary tint, the same mark as the current dock item. The primary fill stays on the next action.
- Default locale is Kyrgyz.
- Write short sentences a counter clerk can read outdoors. No jargon, no English in the UI.

## Lists of records

- Every list page shares one title row: page title on the left (`min-w-0 flex-1`), primary Add on the right (`ButtonLink` with plus icon + add label, `shrink-0`). Same lane, never stacked.
- Product and order lists stay ruled rows inside one rounded list, not a table. An order status is a Tailgrids badge. Each order shows a short code (`orderCode`: last 8 hex of the id, prefixed `#`) on the list and on the detail header. Order search is icon + placeholder only and matches that code, the full id, or the client name. A filter button sits on the same lane as search; it opens a dropdown with client and status Comboboxes, one primary Apply, and clear when filters are active (`?clientId=`, `?status=`). An active-filter count badge marks the button. Product list rows keep compact icon counts (`StockFigures` `size="row"`). Product detail uses `size="card"`: free qty is the hero with a visible label and promise line, on-hand and held are labeled rows, and a mute equation teaches free = on-hand − held. Zero free uses danger text. Detail chrome matches client/order (BackIcon beside the name). Receive stays the one primary warehouse action; correct stock is a quiet control that opens a confirm-style panel.
- The clients list is find-first: that title row, then full-width search with a search icon and placeholder only (no visible label; `aria-label` from `messages.search`). Each client is its own raised tile (`rounded-lg`, hairline, soft shadow) with gap between tiles. On the left, icon-only add-order (`aria-label`). The middle opens the client and shows place under the name as raion/city, oblast (from the first address). On the right, icon-only WhatsApp (`https://wa.me/` + digits) and call (`tel:`) when a phone exists (`aria-label` keeps the names). Zero hits show `noMatch` plus one primary Add; an empty shop shows `noClients` plus Add. Product search uses the same icon + placeholder pattern.
- The client detail Slip is call-first and compact: back beside the name, one primary Call (number on the button is allowed here as the dial target), secondary add-order, then a choice that opens that client’s orders (`/orders?clientId=…`). Service dates render only when present. Address and note section titles share a row with a compact `DiscloseTrigger` (+ add). Lists stay ruled. Opening add shows a tinted bordered `DisclosePanel` with its own title and cancel; Save lives only inside that panel. Address panel may start open when the client has no address.
- The order detail Slip mirrors that grammar: back icon beside the **client name** (links to the client), status as the same Badge colors as the orders list, holding days as mute text beside the badge. Call is primary when a phone exists; a secondary choice opens the client card. Address, product+qty, scheduled date, and note are ruled rows with icons—not a flat label/value sheet. Open orders show one primary Complete; Cancel is a quiet danger text control that arms a confirm panel (same pattern as archive).
- Search filters the loaded list on the device. Format numbers inside the client component. Do not pass `Intl.NumberFormat` from a server component.
- Cap a list query at 500 rows.

## What a new screen includes

1. Copy keys in Kyrgyz and Russian.
2. `PageFrame` or the existing app layout. Do not build a second header.
3. One slip. One primary action.
4. Empty state and a distinct query-failure alert.
5. Thumb reach: the primary action stays in the form, and the dock stays the way to change sections.

Orders is the list of open work. A client card secondary choice opens `/orders?clientId=…` and pre-fills the client filter Combobox. Due stays in the dock as a disabled item until that section exists.
