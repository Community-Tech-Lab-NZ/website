# Community Tech Lab — website

**[communitytechlab.co.nz](https://communitytechlab.co.nz)**

The website for Community Tech Lab, a civic tech initiative in the Queenstown Lakes
District, Aotearoa New Zealand.

Six partner organisations run a programme that pairs senior developer mentors with
juniors to build three custom, open-source web solutions for local community
organisations — real tools for real civic and social needs in the district.

## What this site is for

- Explain the initiative and what it offers
- Set out the opportunity for community organisations thinking about applying
- Celebrate the teams doing the work
- Host documentation for the solutions once they ship

## Timeline

| Phase             | When             |
| ----------------- | ---------------- |
| Discovery & build | Sep – Nov 2026   |
| Public showcase   | 26 November 2026 |

## Getting started

Requires Node 20+ and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

The site runs at http://localhost:3000.

The site runs fully without any configuration. Forms validate, and the submission
route reports an honest failure rather than pretending to save. See
[`.env.example`](.env.example) to connect the real Sheet.

## Commands

| Command             | What it does                                          |
| ------------------- | ----------------------------------------------------- |
| `pnpm dev`          | Start the dev server                                  |
| `pnpm build`        | Production build                                      |
| `pnpm start`        | Serve the production build                            |
| `pnpm lint`         | Lint with ESLint                                      |
| `pnpm check:brand`  | Fail on values that bypass the design token layer     |
| `pnpm check:logic`  | Window boundaries, eligibility gates, anti-spam rules |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4.

## Brand

The visual mark is **The Caret** — simple and forward-looking. Tone throughout the
site is warm, grounded and community-focused. No corporate jargon.

The brand system is **locked**: four colours, an 8px spacing base derived from the
logo's cursor block, and a fixed type scale. `brand-guide.md` is the reference and
`src/styles/tokens/` is the implementation.

Two rules worth knowing before you write a component:

- **The tokens are the source of truth.** The `@theme` block in
  `src/app/globals.css` only maps them onto Tailwind. Change a value in
  `tokens/`, never in the mapping.
- **Off-brand utilities do not compile.** Every theme namespace is cleared, so
  `bg-blue-500` and `rounded-lg` genuinely do not exist. Arbitrary values are the
  remaining gap, and `pnpm check:brand` catches those.

Some rules the tooling cannot enforce, from the brand guide: two colours maximum
per surface, one gold thing per viewport, gold is never body copy, and cards take
a hairline border and no shadow.

## How applications are collected

Submissions go to a Google Sheet owned by the programme, with a formatted Google
Doc generated per application so the panel has something readable to work from.

The ordering in `src/app/api/apply/route.ts` is deliberate: the raw JSON is
written to the `_raw` tab **before** any formatting, Doc creation, upload or
email. Once that write succeeds the route never returns an error, because telling
someone their application failed after 50 minutes of work — when the data is
actually saved — is the worst outcome this code can produce. Everything after
that step is best-effort and logged.

The community form autosaves to `localStorage` as it is filled in. The
eligibility gates and the declaration are deliberately not persisted.

## Deploying

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full sequence: the Google Sheet and
Drive setup, Vercel, Resend DNS at GoDaddy, and pointing the domain.

Preview deployments are deliberately not indexable — `robots.txt` blocks them and
every page carries `noindex`, so a preview URL can never compete with the real
domain in search.

## Contributing

This is an open-source project, and contributions from the programme's participants
and the wider community are welcome. If you're a mentor or junior on the programme,
check the issues list for work that's ready to pick up.

## Related repositories

The three community solutions built during the programme live alongside this one in
the [`Community-Tech-Lab-NZ`](https://github.com/Community-Tech-Lab-NZ) organisation.

## Licence

MIT — see [LICENSE](LICENSE).
