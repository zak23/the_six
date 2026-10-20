# THE SIX.

**An independent, evidence-led map and field guide to Pattaya's Soi 6.**

[**Open the live staging site**](https://the-six-staging.vercel.app) · [GitHub repository](https://github.com/zak23/the_six) · [Research playbook](docs/RESEARCH_PLAYBOOK.md) · [Agent instructions](AGENTS.md)

> **Development release · v0.2 · 20 October 2026**
>
> This is a prototype and historical research snapshot, **not a verified, real-time map or a promise about any bar's current rules**. THE SIX. is not affiliated with, operated by, sponsored by, or endorsed by any venue or bar group.

## The idea

Soi 6 packs dozens of venues into a few hundred metres. Their names, operators, layouts, and house rules change, and the available information is scattered across street diagrams, operator announcements, travel guides, reviews, forums, and word of mouth.

THE SIX. brings the **places**, **reported bar-group affiliations**, and **source-linked house-rule intelligence** into one phone-friendly interface. Instead of pretending that a rumour is policy, it shows **what was reported, by whom, when, and with what uncertainty**.

The longer-term vision is an independently operated, installable progressive web app (PWA) with accurately positioned venues, moderated community reports, transparent corrections, and clearly labelled advertising. The immediate goal is to build a useful and trustworthy directory first.

### Editorial principles

1. **Evidence before certainty.** Every meaningful rule or price claim should have provenance. Unknown is an acceptable answer.
2. **Anecdotes are not policies.** A single customer report is a dated claim, not an official rule. Conflicting experiences remain visible.
3. **Scope matters.** Upstairs/on-premises short-time (ST), leaving the venue/off-site or long-time (LT), room fees, bar fines, and drink prices are different subjects.
4. **A group is not a venue.** A claim about Nightwish, Baba, Better, or Panda must not silently become a rule attributed to every bar in the group.
5. **Map position is not GPS accuracy.** Today's display is a schematic and should be labelled accordingly.
6. **People are not the product.** Document public venue information, not worker identities, customers, private contacts, or intimate details.
7. **Editorial independence.** Advertising and commercial relationships must never buy favourable classifications or suppress corrections.

## What works today

| Feature | Current state |
| --- | --- |
| Two-sided Soi 6 street diagram | Working, **approximate ordering**, Beach Road at the top and Second Road at the bottom |
| Venue catalogue | **100 named locations** in the original snapshot: 98 bars and two other businesses |
| Group colours | Nightwish, Baba, Better, Panda, and **Other / unknown** |
| Search and filters | Name search, group filter, street/list views, reported-minimum filters |
| Venue details | Per-bar notes, selected reported minimums, sources and dated evidence timeline |
| Research intelligence | **14 venues with 18 venue-specific evidence items** in the October 2026 snapshot |
| Indicative street prices | Approximate historic ranges, clearly **not venue-specific quotes** |
| Field observations | Add dated observations; review history in **My notes**, remove mistakes and undo the latest removal |
| Backup and restore | Export JSON; preview and merge private notes from a backup, with duplicate protection |
| GitHub → Vercel | Commits to `main` automatically deploy to staging |
| Precise venue GPS / backend / real-time validation | **Not implemented yet** |
| Installed/offline PWA, shared submissions, advertising | **Roadmap only** |

**Important:** The venue count and research totals describe the seeded prototype, not a live census. Even the number of operating bars is expected to change. The classifications are based on published material, **not independently verified corporate ownership records**. In particular, **Other / unknown does not mean independently owned**.

## Try it

### Live staging

**https://the-six-staging.vercel.app**

This is the demonstration and development environment. The project deliberately sends a `noindex` directive and serves a disallowing `robots.txt`. **No-indexing is not access control:** anyone who has the URL may be able to view the site. Do not use it to store secrets, private submissions, or identifying personal data.

### Run locally

No account, framework, Node modules, build system, API key, or database required.

1. Clone or download this repository.
2. Open `index.html` in a modern browser.
3. Alternatively, serve it locally from the repository root for a normal HTTP preview:

~~~sh
python -m http.server 8080
~~~

Then open `http://localhost:8080`.

The site is intentionally self-contained: HTML, CSS, JavaScript, and the dataset live in the same `index.html`. A separate `venues.json`, `compile.py`, or build pipeline **does not currently exist**. Creating one is a planned refactor, not a prerequisite for running this release.

### Edit from a phone

**Working from multiple devices or with multiple agents?** Start at the [shared work log](docs/work-log/README.md). Claim a task there before editing, check who owns each file, and leave progress and handoff notes. Each task has its own file so contributors do not have to edit one shared log entry.

The canonical source is [`zak23/the_six`](https://github.com/zak23/the_six), on the `main` branch. Changes can be made through GitHub or by an authorised coding agent. A push to `main` causes Vercel to rebuild and publish the staging URL automatically.

For research updates, use [the research playbook](docs/RESEARCH_PLAYBOOK.md) and the instructions in [`AGENTS.md`](AGENTS.md) before editing the map. **A commit being deployed does not mean a claim was fact-checked.**

## How to use the guide

- **Browse the schematic:** bars appear on their reported street side, with group colours.
- **Search or filter:** find an individual bar or compare one operator group.
- **Open a venue:** inspect the date, source links, notes and any conflicting visitor accounts.
- **Read the scope:** a purported upstairs minimum is not automatically an off-site minimum, and neither is a room fee.
- **Record what you learn:** use the observation form during a visit. It is private to that browser/device until exported.
- **Review your notes:** open **My notes** to see dated observations across venues. Remove a mistaken note and use **Undo removal** to restore the latest removal during the session.
- **Export JSON:** use either export button to back up the dataset and your local observations. Exporting does **not** upload or publish them.
- **Restore a backup:** open **My notes → Restore backup**, choose an exported JSON file, review the counts, then choose **Import notes**. Existing notes are kept and duplicates are skipped. Only valid observations for known venue IDs are imported; venue data in the file never changes the published directory.

A displayed **0** means someone **reported no compulsory minimum** in a particular context, not that the venue guarantees a zero minimum. A **?** means uncertain, conflicting, incomplete, or not comparable. A numbered badge is a **reported upstairs/ST count**, not an official quote.

## Repository layout

~~~text
the_six/
├── index.html                         # Entire working prototype, styles, UI and embedded data
├── vercel.json                        # Static Vercel config and no-index response headers
├── robots.txt                         # Discourage indexing during development
├── README.md                          # Product, setup and contributor orientation
├── AGENTS.md                          # Rules for any coding / research agent
├── research-notes.md                  # Existing Oct 2026 drink-minimum evidence and caveats
├── docs/
│   └── RESEARCH_PLAYBOOK.md           # Source directory, searches, verification and intake
└── .github/
    └── agents/
        ├── soi6-research.agent.md     # Finds new venue data and prepares sourced proposals
        └── soi6-data-editor.agent.md  # Safely edits the site using reviewed evidence
~~~

The files under `.github/agents/` provide roles for compatible agent tools. Root `AGENTS.md` is the default instruction file for agents that understand that convention.

## How the data is represented

The current entry point is `const DB = {...}` inside `index.html`:

- `DB.metadata` contains snapshot dates, limitations, indicative street prices, and **group-level research leads**.
- `DB.venues` is the array of venue records.
- `GROUPS` defines labels and display colours.
- Device-only field observations are held separately under the key `the-six-field-observations-v1`. The note with the latest **observation date** can override a displayed venue badge **for that device only**, not the published dataset. The last saved note wins ties; restoring an older backup preserves existing notes on the same date.

Selected fields in a venue record:

| Field | Meaning |
| --- | --- |
| `id` | Stable slug. **Do not change lightly**, because local observations reference it. |
| `name`, `kind` | Venue's name and type, or other business |
| `side`, `position` | Schematic side and approximate ordering, **not coordinates** |
| `group`, `group_status` | Reported operator affiliation and its qualification |
| `st_min` | Specifically reported ST/upstairs drink count; **`0` = explicitly reported none**, `null` = unknown |
| `st_label`, `rule_status` | Visible wording and whether the evidence is reported, conflicted, hinted, or unknown |
| `rule_date`, `rule_source`, `rule_note` | Headline report's publication date, link and explanation |
| `evidence[]` | Individual dated claims, including their separate scenarios |
| `offsite_note`, `quirk` | Distinct off-site information and other cautiously worded observations |
| `last_checked` | Reserved for **genuine verification**, not the date someone edited the file |

**Backup limits:** restore accepts JSON files under 2 MB and at most 2,000 candidate notes. Invalid dates, future observations, notes longer than 500 characters, and unknown venue IDs are skipped and counted in the preview. If browser storage is unavailable, changes last only for the session; export before leaving. Undo is session-only and applies to the latest removal.

Dates should use ISO `YYYY-MM-DD`; if observation time is recorded, use the **Asia/Bangkok** timezone and make the time type explicit. The source publication date, customer visit date, staff confirmation date and editorial review date are **not interchangeable**.

Our evidence and future data-model conventions are in [`docs/RESEARCH_PLAYBOOK.md`](docs/RESEARCH_PLAYBOOK.md). This is the authoritative guide for source discovery and uncertainty labels.

## Research and corrections

The existing dataset was seeded primarily from a **June 2026 street diagram**, then enriched with a small set of public visitor accounts. These are useful leads, not grounds for calling every listing current.

**Where research starts:**

- [Soi6.com](https://soi6.com/): a live web directory and street-order cross-check.
- [Guest Friendly Hotels' June 2026 Soi 6 guide](https://guestfriendlyhotels.asia/soi-6-bars-pattaya/): the original broad map snapshot; dated.
- [G-DIARY's Japanese-language map](https://gdiary.com/staff_blog/pattaya/soi6/): a separate June 2026 street-layout cross-check.
- [Pattaya.love's Soi 6 directory](https://www.pattaya.love/areas/soi-6/): a second directory for names and alleged group affiliations.
- [Public Reddit discussions](https://www.reddit.com/r/Pattaya/): useful for leads, especially conflicting reports; **never official policies**.
- Publicly accessible venue/operator announcements and, where authorised, on-site, non-identifying field checks.

The complete source list, targeted search queries, confidence standards, follow-up cadence and review templates live in [**Research Playbook**](docs/RESEARCH_PLAYBOOK.md). Agents should use that rather than inventing their own criteria.

### Correcting a record

1. Identify the **exact venue** using the stable `id`; match spelling, side, location and aliases.
2. Identify the **exact claim**: name, closure, affiliation, hours, drink minimum, room fee, off-site fee or other rule.
3. Find a dated, linkable source, or an authorised in-person observation with a recorded date and non-identifying context.
4. Record any contradiction **without deleting the previous evidence trail**.
5. Update only the relevant venue fields; group-wide clues stay on the group summary.
6. Review the change before publishing. Never label an unverified report as an officially enforced rule.

For a mistaken listing or changed rule, we want an operator correction path and an auditable change history before opening public submissions. At present, use a GitHub issue with **venue-level facts only**; never include people's names, faces, personal messages or private contact details.

## Development workflow

The stack is intentionally boring, fast, and easy to host:

- **Frontend:** plain HTML, CSS and modern vanilla JavaScript.
- **Data:** embedded `DB` object with 100 seeded locations.
- **Persistence:** `localStorage` only for individual field notes; no shared backend or admin login.
- **Hosting:** Vercel, linked to GitHub `main`.
- **Build command:** none.

For a code or dataset change:

1. Read `AGENTS.md`, the research playbook and the [shared work log](docs/work-log/README.md); publish a task claim and check for overlapping work before editing.
2. Inspect the current `index.html` and `research-notes.md` rather than assuming a future architecture is already in place.
3. Make the smallest safe change; retain venue IDs, evidence links, and cautionary language.
4. Check JS syntax and JSON validity where applicable, then manually smoke-test mobile and desktop.
5. Push or merge to `main` and confirm Vercel deployment status. A build passing does not substitute for UX or factual checks.

### Browser regression checks

The site still runs without Node or dependencies. Optional development checks use Node.js and Playwright to exercise desktop (1440px), phone (390px), and narrow phone (320px) layouts, search and filters, evidence cards, keyboard focus, local observations, JSON downloads, backup preview/restore, removal/undo, duplicate protection, and damaged or unavailable browser storage.

Install test tools outside the repository, then run from its root:

~~~sh
npm install --prefix /tmp/the-six-qa playwright@1.48.2
/tmp/the-six-qa/node_modules/.bin/playwright install chromium
NODE_PATH=/tmp/the-six-qa/node_modules node tests/smoke.cjs
~~~

Set `BASE_URL=https://the-six-staging.vercel.app` to run the same checks against the deployed site. Test notes stay in disposable browser contexts and are never published.

### Manual QA checklist

- Street and list views load; search and group filters behave on a narrow phone.
- Both sides of the street are in the expected order.
- Venue counts and bar/group labels are sensible; unknown is not displayed as independent.
- **Upstairs counts, reported zeros, hints, conflicting reports and off-site quotes remain distinct.**
- Evidence links open the intended source; dates describe the correct type of date.
- Local observations save, can be exported, and do not alter the public source dataset.
- No individual worker/customer identifiers, photographs, private links, or unsourced defamatory claims have entered the repository.
- The staging site still has `noindex` directives; the page remains useable without a build or external API.

## Roadmap

| Phase | Goal |
| --- | --- |
| **v0.2.1: research hygiene** | Audit the entire street in person; verify open/closed and renamed venues; record verified frontage order; reconcile operator group affiliations; maintain reviewed evidence dates |
| **v0.3: data foundation** | Move `DB` to version-controlled structured data, introduce validated claim types and source records, tests, migrations and editor tools |
| **v0.4: real map + PWA** | Proper geolocation (licensed or independently captured), stable venue IDs, offline cache, install prompt, accessibility and a Thai-friendly UI |
| **v0.5: community intelligence** | Moderated submissions, evidence review, operator correction channel, abuse/spam controls and a public changelog |
| **v1.0: independent publication** | Advertising clearly separated from editorial data, privacy-conscious analytics, content policy review and sustainable maintenance |

These are goals, **not shipped features or promised dates**. In particular, avoid advertising “live” bar status without a suitable authoritative source and refresh mechanism.

## Legal, safety and reuse

This is an information and geographic-discovery project about adult nightlife. It does **not** arrange sexual services, book workers, or endorse any venue.

- Do not collect or publish personal data about venue staff or customers. No worker profiles, facial imagery, private messages or identifying allegations.
- Only use legally and technically authorised sources. Respect site terms, rate limits, platform rules, mapping-data licences, robots rules and copyright. **Do not copy third-party maps, photographs, branding or database exports.**
- A visible public post does not grant permission for bulk scraping or republication. Some operator websites impose restrictions on use for competing sites. See the restricted-source note in the research playbook.
- Distinguish historical anecdotes, published venue statements and genuine first-hand confirmation.
- Check the applicable Thai legal and advertising requirements before adding public user-generated reviews, paid placements or adult-content integrations.
- We have not declared an open-source licence. **Publicly visible source code is not automatically freely licensed for reuse.**

## Contributing

Useful contributions include identifying a renamed bar, catching a misplaced frontage, verifying a group affiliation, contributing a **dated venue-level** policy report, improving mobile accessibility, or fixing the app.

Please provide **venue name/ID, what changed, source URL or observation date, what exactly was observed, and whether anyone else independently confirmed it**. Propose changes rather than smoothing over uncertainty.

If you are an automated agent, start at [**AGENTS.md**](AGENTS.md). If you are researching places or rules, use [**RESEARCH_PLAYBOOK.md**](docs/RESEARCH_PLAYBOOK.md). The useful thing about THE SIX. is not claiming we know everything; it is being clear about what we know and what we don't.
