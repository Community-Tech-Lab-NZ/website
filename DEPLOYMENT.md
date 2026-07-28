# Deployment

Everything needed to get communitytechlab.co.nz live, in the order it has to
happen. Steps 1 to 3 can be done today; step 4 needs the domain pointing at
Vercel first.

Current state of the domain, re-checked 28 July 2026:

- Registered, resolving to a parking page (apex `A` → `13.248.243.5`,
  `76.223.105.230`; `www` is a `CNAME` to the apex, so it parks too)
- DNS managed at **GoDaddy** (nameservers `ns71.domaincontrol.com`,
  `ns72.domaincontrol.com`)
- **No MX records and no SPF**, so Resend's records are a clean addition
- **A DMARC record already exists** — GoDaddy adds one by default:
  ```
  _dmarc  TXT  v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;
  ```
  This matters. See step 3

---

## 1. Google: the applications Sheet and Drive folders

Do this first. Nothing else depends on it, and the end-to-end test cannot run
until it exists.

1. In the programme Google account, create a Sheet with tabs named **exactly**:
   `Community`, `Developers`, `Questions`, `_raw`
2. Create two Drive folders, e.g. `Applications` and `CVs`
3. At [console.cloud.google.com](https://console.cloud.google.com), create a
   project. No billing card is needed; the APIs used here are free at this volume
4. Enable the **Google Sheets API**, **Google Drive API** and **Google Docs API**
5. Create a service account, then a JSON key, and download it
6. **Share the Sheet and both folders with the service account's email address,
   as Editor.** This is the step people miss, and every write returns 403 until
   it is done

The Sheet and folders stay owned by the programme account. The service account
only writes to them, so revoking access later is a sharing change rather than a
redeploy.

## 2. Vercel

1. Import the repository
2. Add the environment variables from [`.env.example`](.env.example). Set
   `SEND_CONFIRMATIONS` to `false` for now
3. Deploy. The preview URL works immediately and is deliberately **not
   indexable**: `robots.txt` blocks it and every page carries `noindex`

## 3. Resend

1. Sign up with the programme Google account
2. Add `communitytechlab.co.nz` and follow the domain verification steps
3. Resend gives you **SPF and DKIM TXT records**. Add them in **GoDaddy's DNS
   panel** (Domains → communitytechlab.co.nz → DNS). No nameserver change and no
   mailbox: sending needs the domain verified, not an inbox
4. Once Resend shows the domain verified, set `SEND_CONFIRMATIONS` to `true`

### DMARC: leave the existing record alone

GoDaddy has already published `p=quarantine` on this domain. Two consequences:

- **Do not add a second DMARC record.** A domain with two `_dmarc` TXT records is
  treated as having none, so adding one would silently switch DMARC off rather
  than strengthen it
- **`p=quarantine` is enforcing, not reporting.** Any mail sent from this domain
  before Resend's SPF and DKIM are verified will be quarantined or junked. So
  `SEND_CONFIRMATIONS` staying `false` until Resend shows the domain verified is
  not just tidy sequencing — sending early actively trains spam filters against
  the domain

The alignment settings (`adkim=r`, `aspf=r`, both relaxed) are what Resend needs,
so nothing has to change. Optionally add your own address to `rua=` alongside
GoDaddy's to receive the aggregate reports yourself.

## 4. Point the domain at Vercel

In Vercel, add `communitytechlab.co.nz` as a domain on the project. Vercel will
give you one of two options:

- **Change nameservers to Vercel's** — simplest, but it moves *all* DNS for the
  domain, including the Resend records, which then have to be recreated in
  Vercel. If you do this, do it **before** step 3
- **Keep GoDaddy DNS and add records** — an `A` record for the apex and a
  `CNAME` for `www`. Leaves the Resend records untouched

**Recommended: keep DNS at GoDaddy.** The mail records and the site records then
live in one place you already control, and nothing has to be redone.

Remove the existing parking A records (`13.248.243.5`, `76.223.105.230`) when
you add Vercel's, or the domain will resolve inconsistently.

`www` is currently a `CNAME` to the apex. Repoint it at Vercel rather than
leaving it, or `www` keeps resolving to whatever the apex does at the moment the
cache expires.

## 5. Before applications open

- [ ] End-to-end submission test against the **real** Sheet. Set
      `APPLICATION_WINDOW_OVERRIDE=open` temporarily, submit both forms, and
      confirm the `_raw` row, the structured row, the generated Doc, the CV in
      Drive and the confirmation email. Delete the test rows afterwards
- [ ] **Unset `APPLICATION_WINDOW_OVERRIDE`.** Left set, the form stays in that
      state forever. The server logs a warning on every request while it is
      active
- [ ] Failure-path test: revoke the service account's access to the Sheet and
      submit. The applicant must see an honest "could not save, try again",
      never a false success
- [ ] Check the site with reduced motion **off**. Both development machines had
      it enabled at OS level, so the animations were verified from the compiled
      CSS rather than observed running
- [ ] Submit the sitemap in Google Search Console and confirm the domain
- [ ] Replace the six partner logo placeholders
- [ ] Confirm QLDC's required credit wording. The Economic Futures / QLDC
      lockup is now in place, but a funder's own wording overrides ours and
      the footer line is still the one we wrote

## Still outstanding

Tracked here so they do not get lost:

- **One partner logo is still missing**: *Queenstown Coders Connect*, which has
  no logo file and no website. The other five are in place, each on the ground
  its mark was designed for — reversed marks (Startup Queenstown Lakes, huddl)
  in fitted Ink chips, the rest directly on the light cell
- **Queenstown Coders Connect has no website**, so it is the one partner in the
  footer without a link. If they have a page anywhere — even a LinkedIn or
  Meetup — it belongs in `src/lib/navigation.ts`
- **QLDC's required credit wording.** The funder logo is in place. Their
  wording for the credit line is not confirmed and overrides ours when it is
- **Privacy notice sign-off** from Startup Queenstown Lakes, plus two facts to
  confirm: how long applications are really kept, and how someone makes an
  access request given the site publishes no address
- **Legal review of the programme terms.** The page carries its own notice that
  the underlying agreements are drafts
- **Scoring rubric wording.** `/organisations` and `/apply` name two of the six
  criteria differently. Weights match, labels do not
