# THE SIX. · Independent Soi 6 bar directory

A mobile-first, zero-framework **prototype**, not a live, verified directory. The idea: walk the street, see which venue group a bar is *reported* to belong to, and check whether anyone has documented an **upstairs/ST lady-drink minimum** without treating hearsay as an official rule.

## Quick start

- **Fastest:** open `index.html` in your browser. It includes its own venue data and does not require an API.
- **Recommended local development:** from this folder, run `python -m http.server 8080`, then visit `http://localhost:8080`.
- **Static deploy:** upload `index.html` to Cloudflare Pages, GitHub Pages, Netlify, or a similar static host. No API keys, npm install, database, or build service required.

## What's implemented (research update: 20 October 2026)

- Original, responsive two-sided **schematic** of Soi 6, oriented Beach Road at top and Second Road at bottom.
- **100 named locations:** 98 bars, plus Queen Victoria Inn and Perry Kaffeine. Seeded from a 2026 published street diagram. These are *not* a claim that every venue still operates today.
- Five distinct affiliations: Nightwish, Baba, Better, Panda and Other/unknown. Affiliation is based on public reports, **not corporate ownership records**. **Other/unknown does not imply independence.**
- Search, group chips, filters for specific ST minimum / reported no minimum / mixed or unnumbered claims / group-only unknown, and mobile list layout.
- Individual venue facts with provenance and uncertainty (as available).
- **14 venues have 18 individual dated evidence items**, including historical minimum claims, explicit no-minimum reports, disputed requests and an alleged closure. Specific ST drink counts are available for Tomcats and Soi 6 Bar. Six other location-specific ST reports claim no fixed requirement or describe conflicting experiences. Additional reports describe unknown-count, seasonal, and off-site-only rules. The four network summaries are **NOT treated as venue policies**.
- Add observations with date, exact drink number and notes. Saved to browser `localStorage` when possible; otherwise kept for that session. No data goes to any server.
- Export the base dataset plus local field observations as JSON for manual review.

## Data editing

This version is a **single-file static prototype**: edit the embedded venue data in `index.html` and commit to `main`. There is no build step or server-side database yet. A structured `venues.json` dataset and a compilation script are planned but are **not currently included** in this repository.

## Live preview

- Staging site: https://the-six-staging.vercel.app
- GitHub repository: https://github.com/zak23/the_six
- Vercel is configured to track the GitHub repository; confirm that this commit creates a new deployment before relying on automatic updates.

Important per-venue fields:

- `id`: durable machine-readable key
- `side`: `left` or `right`, oriented **Beach Road → Second Road**
- `position`: rough order along that side, **not a GPS coordinate**
- `group`: `nightwish`, `baba`, `better`, `panda`, `unconfirmed`
- `group_status`: external-report status, not corporate verification
- `st_min`: integer for a specifically reported upstairs minimum, `0` for specifically reported no minimum, or `null` for unknown
- `rule_status`: `reported`, `conflicted`, `hint` or `unknown` in this research release
- `rule_date`, `rule_source`, `rule_note`: provenance for a primary ST report; `rule_date` reflects the publication date, not a staff verification date
- `evidence`: array of individual reported claims with `scope` (`upstairs`, `offsite / LT`, `unspecified`, `status`), publication date, source URL, number when unambiguous, and cautionary notes
- `offsite_note`: separate long-time/off-site reports, **not** a short-time rule
- `metadata.group_intel`: group-level leads shown on every group bar card as context, not automatically inherited as an official policy
- `metadata.street_pricing`: approximate street price benchmarks, not bar-specific prices
- `quirk`: other non-personal house or venue facts, with careful uncertainty language
- `last_checked`: reserve for future on-site verification

**Do not confuse upstairs/short-time requirements with barfine-to-leave, room fees or long-time policies.** They are separate in the evidence timeline. Neither an old report nor a group claim is proof of a standing requirement.

## Research caveat

The report date shown is the **publication date**, not necessarily when the customer visited. Some comments mention an earlier visit and some claims contradict one another. A `0` label means someone *reported* no minimum at a particular time, **never** a guarantee. A `?` means the count is unspecified, contradictory, or only relates to off-site/LT. The Toy Box closure report is especially uncertain because it conflicts with a later street directory. See `research-notes.md` for the per-bar evidence trail.

## Editorial policy for a public version

1. Separate **officially confirmed by staff**, **firsthand observation**, **third-party report**, **disputed**, and **unknown**. Require dates, source URLs/evidence and review expirations.
2. Never mark a policy as universal to a chain based only on comments. The day, individual staff member, room availability and details of the visit may matter.
3. Never publish identifying information about workers or visitors, photos without consent, or allegations against named individuals.
4. Add an owner/operator correction process and a simple moderation queue before accepting public reports.
5. Treat venue locations as **illustrative** until you collect each frontage position yourself or verify precise points with a licensed map provider. Google Maps links currently perform a **name search**, not a precision pin.
6. Confirm applicable Thai rules and your hosting/advertising platform's adult-nightlife content policies before public monetisation.

## Sources (starter references, not permission to copy their branding or imagery)

- Soi 6 2026 street bar list and affiliation overview: https://guestfriendlyhotels.asia/soi-6-bars-pattaya/ (published June 5, 2026)
- Additional street cross-reference: https://soi6.com/
- 2026 bar network guide: https://www.pattaya.love/areas/soi-6/
- Historical minimum-drink experiences: https://www.reddit.com/r/Pattaya/comments/1ouzq22/soi_6_bars_with_35_drink_minimum/
- June 2026 Hollywood and Fire reports: https://www.reddit.com/r/Pattaya/comments/1u2dwc6/hollywood_soi_6_question/
- January 2026 variation reports: https://www.reddit.com/r/Pattaya/comments/1qo0qvg/minimum_lds_on_soi_6/

Attributions are for underlying factual leads. The layout, code and visual design of this prototype are original.

## Next versions

**v0.2.1: trusted field data**: one-pass, frontage-by-frontage phone audit; coordinates; reliable operator group classification; last-confirmed date; location/photo corrections with consent; moderation and change log.

**v0.3: public platform**: proper PWA manifest/service worker, map provider, anonymous read-only access, server-backed submissions reviewed before publication, storage/data export, spam mitigation, accessibility and translation.

**v1.0: sustainable project**: lightweight, clearly labelled advertising independent of venue coverage, private analytics, caching, editorial guidelines, opt-out/correction flow, and compliance review. Advertising should never alter the substance of a rule report.