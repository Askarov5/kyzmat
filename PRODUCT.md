# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary users are the owner and the agents of a small company in Kyrgyzstan, about 1 to 15 people. They work at a shop counter and in the yard, often on a phone, often in sunlight, with one thumb.

Two kinds of company share the product. An AC, filtration, or heating shop keeps the client record: what was installed, when, where, and the notes. An oil or product-sales company needs agents to see stock and reserve it for a named client. Most small shops do both. A new company starts as both. Sales-only is a real setting, for example an engine-oil seller that delivers to oil-change shops and does not keep an install record.

## Product Purpose

KYZMAT keeps one thread from the phone call, through the stock room, to the next visit or the next order. The loop is client, product, delivery, completed, then a reminder.

Success is a clerk answering the call with the model, date, address, and notes, and two agents being unable to promise the same last unit.

## Positioning

One order covers both a service visit and a stock hold. Available quantity is on hand minus what open and in-delivery orders have reserved for a named client. A neighboring visit log or a plain inventory count cannot make that promise.

## Operating Context

The person is on a phone at the counter or in the yard. Repeated values are picked from a list. The keyboard is for a value the shop has not used before.

Sign-in is Google, Apple, or a WhatsApp code. The sign-in phone is a Kyrgyz number, `+996` plus nine digits. A client phone is optional.

A place is chosen as an oblast first, then only that oblast’s raions and cities. Bishkek and Osh sit in the first list because they are republican cities.

The shop timezone starts as `Asia/Bishkek`. The first companies are set up with concierge onboarding. Each company is a tenant.

## Capabilities and Constraints

Roles are owner and agent. Both can read clients, products, orders, and stock. The owner creates the company, adds products, receives stock, and corrects it. An agent reserves a quantity for a named client.

A product requires a name and a price in whole soms. Description, SKU, unit, maintenance interval, and reorder interval are optional. Size and model may live in the name. A maintenance interval is for equipment that stays at an address. A reorder interval is for goods the client buys again. A serial belongs to one physical unit, not the catalog row.

Stock is one warehouse pool. Available is calculated, never stored. Completion ships stock and writes a placement only when the product tracks installation.

Kyrgyz is the default interface language. Russian is a full translation. Company, client, and product names are stored as written and are not translated.

Orders support multiple product lines with per-line quantities; book, complete, and cancel are in the app. Delivery status transition (`in_delivery`) and the due list are specified and are not built yet. Clients and products are.

Open: the legal entity named on the pilot privacy notice, in Kyrgyz and in Russian, before any company beyond the first partner.

## Brand Commitments

The product name is KYZMAT. Interface sentences are short enough for a counter clerk to read outdoors. There is no English in the interface.

## Evidence on Hand

`PRD.md` version 1.3, 31 October 2026, is the requirements source. The running app is the Next.js project in this repository.

No customer quotes, press, pricing, or logo file exist. Do not invent them. The privacy notice has no legal entity yet.

## Product Principles

- One loop serves a shop that installs and a shop that only delivers.
- A value that already exists is picked. It is typed once, then it joins the list.
- Stock promised to a named client cannot be promised again.
- The call is answered from the client record: model, date, address, notes.
- Kyrgyz is the language of the work. Russian is complete.

## Accessibility & Inclusion

The interface is used outdoors in direct sunlight, one-handed. Targets are at least 48px. Kyrgyz letters, including Ң, Ө, and Ү, must render. A failed query is told as an error, not shown as an empty list.
