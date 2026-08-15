import {
  answerText,
  isConfirmation,
  renderApplicationText,
  type ApplicationSummary,
} from "./application-doc";
import { escapeHtml, escapeMultiline } from "./html";
import { FOOTER_NOTE } from "./navigation";
import { PRODUCTION_URL } from "./site";

/* The email layer of the design system.
 *
 * Every message is described once as `EmailContent` and rendered twice, as HTML
 * and as plain text. Writing the two by hand is how transactional email goes
 * wrong: someone edits the pretty one, the fallback keeps saying last month's
 * dates, and nobody notices because nobody reads the fallback. Here they cannot
 * disagree, because neither is written.
 *
 * WHY THE STYLING LOOKS LIKE 2004. Email clients are not browsers. Outlook
 * renders through Word, Gmail strips <style> blocks and anything it does not
 * recognise, and no client reliably supports flexbox, grid, custom properties or
 * external stylesheets. So: tables for layout, every visual rule inline, and
 * literal hex values instead of the token layer. The <style> block carries the
 * mobile breakpoint only, which is the one thing that cannot be inlined, and the
 * layout is readable without it.
 *
 * THE BRAND STILL APPLIES. Ink header band, the 2px Kōwhai rule under it as the
 * one gold thing, white card on Oat, hairline borders, near-square corners, flat
 * colour, no shadows. Archivo, Source Sans 3 and Space Mono lead each stack and
 * are used if the reader happens to have them; the fallbacks carry the rest.
 * Webfonts are deliberately not loaded: Gmail strips @font-face, so the request
 * buys nothing and leaks the reader's IP to a font host.
 */

// The locked palette, flattened. Alpha tints are composited against their
// surface here because Outlook drops rgba() entirely, and a dropped colour is a
// black one. Ink over white for ink-90/70/16, Oat over Ink for oat-70/16.
const INK = "#14211A";
const INK_BODY = "#2C3731"; // --ctl-ink-90 on white
const INK_MUTED = "#5B645F"; // --ctl-ink-70 on white, 6.1:1
const HAIRLINE = "#D9DBDA"; // --ctl-ink-16 on white
const KOWHAI = "#F0A81E";
const FERN = "#2E8E52";
const OAT = "#F3EFE3";
const WHITE = "#FFFFFF";

const DISPLAY = "Archivo,'Helvetica Neue',Helvetica,Arial,sans-serif";
const BODY = "'Source Sans 3','Source Sans Pro',-apple-system,'Segoe UI',Helvetica,Arial,sans-serif";
const MONO = "'Space Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";

// Always the production domain, never SITE_URL. An email is read in someone
// else's inbox, where a localhost or preview URL resolves to nothing.
const LOGO = `${PRODUCTION_URL}/logos/lockup-horizontal-dark-bg.png`;

const RULE = "----------------------------------------";
const TEXT_WIDTH = 72;

export type EmailMeta = {
  label: string;
  /** The value as it should be read, and as the plain-text part prints it. A
   *  URL belongs here, not only in `href`: the text part has nowhere else to
   *  put it. */
  value: string;
  href?: string;
  /** What the HTML part shows in place of `value`, for when the value is a
   *  40-character Google Docs URL that would wrap across three lines. */
  display?: string;
};

export type EmailCta = { label: string; href: string };

/* One mark in the credit wall.
 *
 * PNG only, and always a file from public/logos/email/ rather than the one the
 * site uses. Half the partner marks are SVG or WebP, which between them are
 * unreadable in every major client or in Outlook specifically, and three of
 * them are reversed and need their own ground baked in. scripts/
 * build-email-logos.mjs explains the whole conversion. */
export type EmailLogo = {
  /** Absolute URL, on the production domain. */
  src: string;
  /** The organisation's name. This is what most Outlook readers actually see,
   *  because images are off by default there. */
  alt: string;
  /** Display size in CSS pixels. The file itself is stored at 2x. */
  w: number;
  h: number;
  /** Wraps the mark in a link to the organisation's own site.
   *
   *  Optional because one of the six partners has no website to point at, and a
   *  mark that is a link when the one beside it is not has to be the normal
   *  case rather than a bug. Leave it unset and the image renders exactly as it
   *  did before. */
  href?: string;
};

/* The partner and funder credit at the foot of the message.
 *
 * Broadcast mail only. A confirmation is read by someone who has just spent an
 * hour on the form and knows exactly who this is; a cold email to five hundred
 * organisations is read by someone deciding whether it is real, and six marks
 * they recognise from around the district answers that faster than a sentence
 * can. The sentence is there too, in the outro, because most Outlook readers
 * will never see these files load. */
export type EmailLogoWall = {
  /** Space Mono eyebrow above the grid. */
  label: string;
  logos: EmailLogo[];
  /** Set apart below the partners, under its own eyebrow, because the funder is
   *  not a partner: the QLDC Economic Diversification Fund pays for the
   *  programme and must be credited wherever the programme is promoted. */
  funder?: { label: string; logo: EmailLogo };
};

/* A labelled run of the body, for messages long enough to need finding your
 * place in.
 *
 * A confirmation is six sentences and wants no furniture. A broadcast is four
 * hundred words to someone who did not ask for it, and as one column of even
 * paragraphs it reads as a wall and gets skimmed to death. The label is the
 * same Space Mono eyebrow the site uses for exactly this (`WHY IT EXISTS`,
 * `HOW IT RUNS`, `KEY DATES`), so a reader can find the part they care about
 * without reading the parts they do not.
 *
 * `meta` rides inside a section rather than only at the top level so the dates
 * table can sit under its own heading instead of floating between paragraphs. */
export type EmailSection = {
  label: string;
  paragraphs?: string[];
  meta?: EmailMeta[];
};

/* What bulk mail has to carry and transactional mail must not.
 *
 * Set it and the footer switches form; leave it unset and a confirmation email
 * keeps the short footer it has always had. */
export type EmailBulk = {
  /** Where this address came from, in the reader's terms. A list that nobody
   *  hand-subscribed to has to say why it is in their inbox, and "you signed up"
   *  would be a lie. */
  reason: string;
  /** Optional, and deliberately omitted on the launch broadcast.
   *
   *  The Unsolicited Electronic Messages Act 2007 requires accurate information
   *  about who authorised the message and a working way to contact them. It
   *  does not require a postal address, which is a US CAN-SPAM habit. A message
   *  that names the programme, the lead organisation, the site and a monitored
   *  reply-to has already met the duty, so an address nobody could verify would
   *  be decoration at best and wrong at worst. */
  postalAddress?: string;
  /** In a Resend broadcast this is the literal `{{{RESEND_UNSUBSCRIBE_URL}}}`
   *  placeholder, substituted per recipient at send time.
   *
   *  OPTIONAL, AND CURRENTLY UNSET ON THE LAUNCH BROADCAST. Resend does not
   *  require the placeholder; it substitutes one only where it finds one. See
   *  the note in broadcast.ts for why it is off and what has to be true for
   *  that to stay defensible. Setting it again is the only change needed to
   *  put the link back. */
  unsubscribeUrl?: string;
};

export type EmailContent = {
  /** The inbox preview line. Without one, clients pull the first words of the
   *  body, which is the heading again. */
  preheader: string;
  /** Space Mono label above the heading. */
  eyebrow: string;
  heading: string;
  /** The supporting line directly under the heading, as the site's `Lede`.
   *
   *  Exists because the brand caps hero headlines at five words and puts the
   *  detail in the line beneath, which is the only way "Tell us a problem" also
   *  gets to say who does what about it. Set larger and lighter than body copy,
   *  so heading and lede read as one unit and the letter starts after them. */
  lede?: string;
  /** Paragraphs between the heading and everything else. */
  intro: string[];
  /** Named facts: who applied, where the Doc is. Rendered as rows, links live. */
  meta?: EmailMeta[];
  /** Labelled body sections, rendered after `intro`. Long messages only. */
  sections?: EmailSection[];
  /** Someone else's words, set apart from ours. */
  quote?: string;
  /** A full application, echoed back. */
  summary?: ApplicationSummary;
  /** Paragraphs after the body, before the footer. */
  outro?: string[];
  /** The one button. Broadcast mail needs somewhere obvious to go; a
   *  confirmation is not asking for anything and leaves this unset. */
  cta?: EmailCta;
  /** Sign-off and name, closing the message after the button. Its own field
   *  rather than a last `outro` entry, because outro entries are paragraphs and
   *  a signature is not: it sits tighter, and it has to come after the call to
   *  action rather than before it. Line breaks are kept. */
  signoff?: string;
  /** Partner and funder marks, closing the message. See `EmailLogoWall`. */
  logos?: EmailLogoWall;
  /** Set on broadcast mail only. See `EmailBulk`. */
  bulk?: EmailBulk;
  /** Applicant mail is sent from an address that bounces, and has to say so.
   *  Programme mail has a working reply-to, so it must not. */
  unmonitored: boolean;
};

/** Wraps our own copy to a readable measure for the plain-text part. Applicants'
 *  answers are left exactly as typed: rewrapping someone's prose can break a
 *  pasted URL, and their line breaks are meaningful. */
function wrap(text: string, width = TEXT_WIDTH): string {
  // Bold markers are an HTML-part instruction. The text part has no way to
  // honour them and must not show them, so they come off here. Safe to do in
  // `wrap` because every caller is passing copy this repo wrote: applicants'
  // answers are rendered by renderApplicationText, which never calls this.
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    // Inline links come down to their label, and the URL is dropped rather than
    // printed beside it. The credit line names six organisations: spelling out
    // five URLs mid-sentence turns one readable sentence into forty words of
    // punctuation, and the plain-text part exists for the reader whose client
    // cannot render the HTML, not as a reference sheet. The names are proper
    // nouns and findable; the one URL that has to survive, the site's own, is in
    // the footer of every part.
    .replace(/\[([^\]]+)\]\((?:https?:\/\/[^)\s]+)\)/g, "$1")
    .split(/\r?\n/)
    .map((line) => {
      const out: string[] = [];
      let current = "";
      for (const word of line.split(" ")) {
        if (current && current.length + 1 + word.length > width) {
          out.push(current);
          current = word;
        } else {
          current = current ? `${current} ${word}` : word;
        }
      }
      out.push(current);
      return out.join("\n");
    })
    .join("\n");
}

// --- HTML ------------------------------------------------------------------

/* The brand name in running copy, marked **like this**, rendered as the site's
 * gold sweep and linked home.
 *
 * The sweep is `.ctl-sweep-gold` in styles/tokens/utilities.css: a Kōwhai bar
 * under the words, which the site animates across and email cannot. What is
 * drawn here is that rule's reduced-motion state, the one already written for
 * readers who asked not to be moved, so this is the same device rather than an
 * email-only invention of one.
 *
 * NOT bold. At 16px, Archivo bold sitting inside Source Sans body copy stopped
 * reading as a name and started reading as a raised voice.
 *
 * Underline rather than a background block, because the site's device is a bar
 * beneath the words and a filled highlight is a different, heavier thing. A
 * client that drops `text-decoration-color` still renders an Ink underline,
 * which is still visibly a link, the same fallback `htmlLink` relies on.
 *
 * Applied AFTER escaping, and only on paths carrying copy this repo wrote: the
 * lede, and htmlParagraph, which serves intro, outro and sections. Applicants'
 * answers render through htmlSummary and never arrive here, so two asterisks
 * typed into a form field stay two asterisks. */
const SWEEP = "#F7CF83"; // Kōwhai at .55 on white, composited: Outlook drops rgba()

function brandMark(escaped: string): string {
  return escaped.replace(
    /\*\*(.+?)\*\*/g,
    // skip-ink off: left on, the bar breaks around the descender in "Community"
    // and reads as three separate underlines rather than one sweep. The site
    // paints a background bar, which never breaks, so this is what matches it.
    `<a href="${PRODUCTION_URL}" style="color:${INK};text-decoration:underline;text-decoration-color:${SWEEP};text-decoration-thickness:4px;text-underline-offset:1px;text-decoration-skip-ink:none;">$1</a>`,
  );
}

/* `[label](https://…)` inside a paragraph, for the few places a name in a
 * sentence has to be the link.
 *
 * The credit line naming six partner organisations is the case this exists for:
 * they are named in running prose, and a meta row underneath repeating each name
 * beside its URL would be the same six names twice.
 *
 * DELIBERATELY NOT A MARKDOWN RENDERER. Two syntaxes now, this and the brand
 * mark, both applied after escaping and both on paths carrying copy this repo
 * wrote. Applicants' answers render through htmlSummary and never arrive here,
 * so a reader who types brackets into a form field gets brackets back.
 *
 * Only http(s) is matched. A `javascript:` or `data:` URL cannot reach this from
 * anywhere in the codebase today, and the restriction means it still cannot if
 * some later caller passes text it did not write.
 *
 * The label is NOT re-escaped: it arrives already escaped, and running it
 * through escapeHtml again turns an ampersand into `&amp;amp;`. That is why this
 * cannot simply call htmlLink. */
function inlineLinks(escaped: string): string {
  return escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    `<a href="$2" style="color:${INK};text-decoration:underline;text-decoration-color:${KOWHAI};">$1</a>`,
  );
}

function htmlParagraph(text: string, top = 20): string {
  return `<p style="margin:${top}px 0 0;font-family:${BODY};font-size:16px;line-height:1.6;color:${INK_BODY};">${inlineLinks(brandMark(escapeMultiline(text)))}</p>`;
}

function htmlEyebrow(text: string, color = INK_MUTED): string {
  return `<p style="margin:0;font-family:${MONO};font-size:11px;line-height:1.4;letter-spacing:0.16em;text-transform:uppercase;color:${color};">${escapeHtml(text)}</p>`;
}

function htmlLink(href: string, label: string): string {
  // Ink with a Kōwhai underline, as everywhere else. Clients that ignore
  // text-decoration-color fall back to an Ink underline, which is still a link.
  return `<a href="${escapeHtml(href)}" style="color:${INK};text-decoration:underline;text-decoration-color:${KOWHAI};">${escapeHtml(label)}</a>`;
}

/* Label and value side by side, until there is no room for side by side.
 *
 * Two columns at 34% and 66% is right on a desktop and wrong on a phone: at
 * 390px the label column is 99px, so "The three chosen problems are announced"
 * breaks over four lines next to a date sitting on one, and the key dates read
 * as a ragged column of fragments. The stacking rule in the <style> block puts
 * the label on its own line above the value at narrow widths, which is what the
 * classes here are for. A client that drops the <style> block keeps the two
 * columns, which is the same layout it has always had rather than a broken one. */
function htmlMeta(meta: EmailMeta[]): string {
  const rows = meta
    .map(
      (item) => `
        <tr>
          <td class="ctl-meta-l" style="padding:12px 0;border-top:1px solid ${HAIRLINE};font-family:${BODY};font-size:14px;line-height:1.5;color:${INK_MUTED};" width="34%" valign="top">${escapeHtml(item.label)}</td>
          <td class="ctl-meta-v" style="padding:12px 0;border-top:1px solid ${HAIRLINE};font-family:${BODY};font-size:14px;line-height:1.5;color:${INK};word-break:break-word;" valign="top">${
            item.href
              ? htmlLink(item.href, item.display ?? item.value)
              : escapeHtml(item.display ?? item.value)
          }</td>
        </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:28px;">${rows}</table>`;
}

function htmlSection(section: EmailSection): string {
  // Hairline above, then the label. The rule is what makes this scannable at
  // arm's length: an eyebrow alone is small enough that the eye slides past it
  // in a column of body copy, and the line gives it something to sit on.
  const body = [
    ...(section.paragraphs ?? []).map((text, i) => htmlParagraph(text, i === 0 ? 14 : 18)),
    section.meta?.length ? htmlMeta(section.meta) : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:36px;">
      <tr>
        <td style="padding-top:26px;border-top:1px solid ${HAIRLINE};">
          ${htmlEyebrow(section.label)}
          ${body}
        </td>
      </tr>
    </table>`;
}

function htmlCta(cta: EmailCta): string {
  // A table cell with a background colour, not a styled <a>. Outlook ignores
  // padding on inline elements, so a padded link collapses to bare underlined
  // text on the one client where the button matters most. Flat Ink, Oat label,
  // near-square corners, no shadow, exactly as the site draws it.
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:32px;">
      <tr>
        <td style="background-color:${INK};border-radius:2px;">
          <a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:15px 30px;font-family:${DISPLAY};font-size:16px;font-weight:700;line-height:1.2;color:${OAT};text-decoration:none;">${escapeHtml(cta.label)}</a>
        </td>
      </tr>
    </table>`;
}

/* One mark, sized to its slot and free to shrink out of it.
 *
 * `width:Wpx;max-width:100%;height:auto` is the whole trick. The attributes are
 * for Outlook, which ignores the CSS and holds the file at its stated size,
 * which is fine because Outlook is always 600px wide. Everywhere else the CSS
 * wins, and on a phone the mark scales down inside its column instead of
 * pushing the card into horizontal scroll. Baking each chip into its PNG is
 * what makes that safe: mark and ground are one image and cannot scale apart.
 *
 * A mark in the grid is centred twice, by the cell's align attribute and by
 * auto margins, because different clients honour different halves of that. The
 * funder mark stands alone under its own eyebrow and sits left, with it. */
function htmlLogo(logo: EmailLogo, centred = true): string {
  const margin = centred ? "0 auto" : "0";
  const img = `<img src="${escapeHtml(logo.src)}" width="${logo.w}" height="${logo.h}" alt="${escapeHtml(logo.alt)}" style="display:block;margin:${margin};border:0;outline:none;text-decoration:none;width:${logo.w}px;max-width:100%;height:auto;font-family:${BODY};font-size:13px;color:${INK_MUTED};">`;
  // `border:0` on the anchor as well as the image. Older Outlook draws a blue
  // rule around a linked image from the anchor rather than the img, so setting
  // it in one place only leaves the box that setting it at all was meant to
  // remove. `display:block` keeps the anchor from adding descender space under
  // the mark and pushing it off-centre in its cell.
  return logo.href
    ? `<a href="${escapeHtml(logo.href)}" style="display:block;border:0;outline:none;text-decoration:none;">${img}</a>`
    : img;
}

function htmlLogoWall(wall: EmailLogoWall): string {
  /* Two columns, not the site's three.
   *
   * The card is 536px of usable width on a desktop and about 295px on a phone,
   * and a table in an email does not reflow: whatever column count is set here
   * is the column count everywhere. Three columns puts each mark in 98px on a
   * phone, where "Technology Queenstown" is 25px wide and unreadable. Two gives
   * every mark 268px on a desktop, which is the site's own 200px cap with room
   * to spare, and 147px on a phone, which still reads. */
  /* Hairline cells, as the site's wall has.
   *
   * Without them the marks float: six logos at wildly different widths, three
   * on their own coloured ground and three not, read as a scattering rather
   * than a set. The rules are what make it one object. Drawn as collapsed
   * borders rather than the site's 1px-gap-over-a-tinted-background, which
   * needs a background to show through a gap and is exactly the sort of thing
   * Outlook renders as six grey blocks. */
  const cell = `border:1px solid ${HAIRLINE};padding:18px 10px;`;
  const rows: string[] = [];
  for (let i = 0; i < wall.logos.length; i += 2) {
    const pair = wall.logos.slice(i, i + 2);
    const cells = pair
      .map(
        (logo) =>
          `<td width="50%" align="center" valign="middle" style="${cell}">${htmlLogo(logo)}</td>`,
      )
      .join("");
    // An odd count would otherwise leave the last mark stretched across the
    // full width instead of sitting in its own column.
    const filler = pair.length === 1 ? `<td width="50%" style="${cell}">&nbsp;</td>` : "";
    rows.push(`<tr>${cells}${filler}</tr>`);
  }

  const funder = wall.funder
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:28px;">
        <tr>
          <td style="padding-top:24px;border-top:1px solid ${HAIRLINE};">
            ${htmlEyebrow(wall.funder.label)}
            <div style="margin-top:14px;">${htmlLogo(wall.funder.logo, false)}</div>
          </td>
        </tr>
      </table>`
    : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:40px;">
      <tr>
        <td style="padding-top:26px;border-top:1px solid ${HAIRLINE};">
          ${htmlEyebrow(wall.label)}
          <!-- table-layout:fixed so the two columns stay exactly half each. On
               auto layout the columns size to their contents, and these marks
               range from 56px to 232px wide: the wall comes out lopsided at
               600px, and in a client that honours max-width and narrows the
               card, the images keep their natural size and push the whole card
               into horizontal scroll instead of scaling down. -->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:16px;border-collapse:collapse;table-layout:fixed;">
            ${rows.join("\n")}
          </table>
          ${funder}
        </td>
      </tr>
    </table>`;
}

function htmlQuote(text: string): string {
  // A left rule rather than a tinted panel: flat colour only. Fern, not Kōwhai,
  // because the rule under the header is already the viewport's one gold thing
  // and Fern is what the brand reserves for small structural markers.
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:28px;">
      <tr>
        <td style="padding:4px 0 4px 20px;border-left:2px solid ${FERN};font-family:${BODY};font-size:16px;line-height:1.6;color:${INK};">${escapeMultiline(text)}</td>
      </tr>
    </table>`;
}

/* Whether the echoed application has to introduce itself.
 *
 * No, when a meta table above it has already named the applicant and given the
 * reference and the date. Printing them twice on one screen reads as a template
 * nobody checked.
 *
 * Asked here rather than in each renderer, because for a while only the HTML
 * one asked it: the plain-text part of the programme copy repeated the
 * reference and the date four lines apart and the organisation's name three
 * times. Both renderers now read this, so they cannot answer it differently. */
function summaryNeedsHeader(content: EmailContent): boolean {
  return !content.meta?.length;
}

function htmlSummary(summary: ApplicationSummary, withHeader: boolean): string {
  const sections = summary.sections
    .map((section, i) => {
      const number = String(i + 1).padStart(2, "0");
      // A written answer leads with its question, small and muted, because the
      // answer is what is being read. A ticked box is the other way round: the
      // statement is the content and the status is the note on it, otherwise
      // six identical "Confirmed" lines shout over six different sentences.
      const fields = section.fields
        .map((field) => {
          const [lead, follow] = isConfirmation(field)
            ? [escapeHtml(answerText(field)), escapeHtml(field.label)]
            : [escapeHtml(field.label), escapeMultiline(answerText(field))];

          // A skipped optional question is muted, so it cannot be mistaken at a
          // glance for an answer that says "Not answered".
          const skipped = !isConfirmation(field) && !field.value;

          return `
          <tr>
            <td style="padding:16px 0 0;">
              <p style="margin:0;font-family:${BODY};font-size:13px;line-height:1.5;color:${INK_MUTED};">${lead}</p>
              <p style="margin:4px 0 0;font-family:${BODY};font-size:16px;line-height:1.6;color:${skipped ? INK_MUTED : INK};word-break:break-word;">${follow}</p>
            </td>
          </tr>`;
        })
        .join("");

      return `
        <tr>
          <td style="padding:32px 0 12px;border-top:1px solid ${HAIRLINE};">
            ${htmlEyebrow(`${number} · ${section.title}`)}
          </td>
        </tr>
        ${fields}`;
    })
    .join("");

  const header = withHeader
    ? `<tr>
        <td style="padding-bottom:4px;">
          <p style="margin:0;font-family:${BODY};font-size:14px;line-height:1.6;color:${INK_MUTED};">Reference ${escapeHtml(summary.reference)}<br>Submitted ${escapeHtml(summary.submittedAt)}</p>
        </td>
      </tr>`
    : "";

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:36px;">
      ${header}
      ${sections}
    </table>`;
}

export function renderHtmlEmail(content: EmailContent): string {
  const blocks = [
    htmlEyebrow(content.eyebrow),
    `<h1 class="ctl-heading" style="margin:18px 0 0;font-family:${DISPLAY};font-size:34px;line-height:1.1;font-weight:800;color:${INK};">${escapeHtml(content.heading)}</h1>`,
    content.lede
      ? `<p style="margin:14px 0 0;font-family:${BODY};font-size:19px;line-height:1.5;color:${INK_BODY};">${brandMark(escapeMultiline(content.lede))}</p>`
      : "",
    ...content.intro.map((text) => htmlParagraph(text, 24)),
    content.meta?.length ? htmlMeta(content.meta) : "",
    content.quote ? htmlQuote(content.quote) : "",
    ...(content.sections ?? []).map(htmlSection),
    content.summary ? htmlSummary(content.summary, summaryNeedsHeader(content)) : "",
    ...(content.outro ?? []).map((text) => htmlParagraph(text, 28)),
    content.cta ? htmlCta(content.cta) : "",
    content.signoff
      ? `<p style="margin:32px 0 0;font-family:${BODY};font-size:16px;line-height:1.6;color:${INK_BODY};">${escapeMultiline(content.signoff)}</p>`
      : "",
    // Last thing in the card, after the signature. It is a credential, not part
    // of the letter: a reader who is already convinced never needs it, and a
    // reader who is not goes looking for it at the bottom.
    content.logos ? htmlLogoWall(content.logos) : "",
  ]
    .filter(Boolean)
    .join("\n");

  const footerLines = [
    content.unmonitored
      ? `<p style="margin:0 0 16px;font-family:${BODY};font-size:13px;line-height:1.6;color:${INK_MUTED};">This address is not monitored, so please do not reply to this email.</p>`
      : "",
    `<p style="margin:0;font-family:${BODY};font-size:13px;line-height:1.6;color:${INK_MUTED};">
        <strong style="font-family:${DISPLAY};font-weight:700;color:${INK};">Community Tech Lab</strong><br>
        ${escapeHtml(FOOTER_NOTE)}<br>
        ${htmlLink(PRODUCTION_URL, PRODUCTION_URL.replace(/^https:\/\//, ""))}
      </p>`,
    content.bulk
      ? `<p style="margin:16px 0 0;font-family:${BODY};font-size:13px;line-height:1.6;color:${INK_MUTED};">
        ${content.bulk.postalAddress ? `${escapeHtml(content.bulk.postalAddress)}<br>` : ""}
        ${escapeHtml(content.bulk.reason)}<br>
        ${
          content.bulk.unsubscribeUrl
            ? `${htmlLink(content.bulk.unsubscribeUrl, "Unsubscribe")}, or reply and say so.`
            : `To stop hearing from us, reply and say so.`
        }
      </p>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `<!doctype html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(content.heading)}</title>
<style>
  /* The rules that cannot be inlined. Everything else is, so a client that
     drops this block still gets the full layout, just at a fixed measure. */
  @media only screen and (max-width:620px){
    .ctl-pad{padding-left:24px!important;padding-right:24px!important}
    .ctl-heading{font-size:26px!important}
    /* Key dates stack: label on its own line, value under it. The hairline
       moves to the label, which is now the top of each pair, so the rule still
       separates rows rather than splitting one in half. */
    .ctl-meta-l,.ctl-meta-v{display:block!important;width:auto!important}
    .ctl-meta-l{padding:14px 0 0!important}
    .ctl-meta-v{padding:2px 0 14px!important;border-top:0!important;font-size:15px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${OAT};color-scheme:light;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${OAT};">${escapeHtml(content.preheader)}${"&#847;&zwnj;&nbsp;".repeat(60)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${OAT};">
  <tr>
    <td align="center" style="padding:32px 16px 48px;">
      <!--[if mso | IE]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
      <!-- FLUID, NOT FIXED. This was width="600" style="width:600px;max-width:100%"
           and it did not shrink. A table cannot go below its own min-content
           width, and a 600px table inside a shrink-to-fit cell makes that cell
           600px wide, so max-width:100% resolved against 600 and meant nothing.
           On a 390px phone the card stayed 600 and the whole message needed
           sideways scrolling to read.

           width:100% with a max-width does shrink, because the width now comes
           from the parent rather than from the contents. Outlook ignores
           max-width entirely and would run the card to the full window, so the
           mso conditional above wraps it in a 600px table that only Outlook
           and IE can see. Everything else ignores the comment. -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;">

        <tr>
          <td class="ctl-pad" style="background-color:${INK};padding:28px 32px;">
            <!-- max-width on the mark too: at 260px fixed it was wider than the
                 content column on a 320px screen and pushed the header out. -->
            <a href="${PRODUCTION_URL}" style="display:inline-block;text-decoration:none;border:0;"><img src="${LOGO}" width="260" height="70" alt="Community Tech Lab" style="display:block;border:0;outline:none;text-decoration:none;width:260px;max-width:100%;height:auto;font-family:${DISPLAY};font-size:20px;font-weight:800;color:${OAT};"></a>
          </td>
        </tr>

        <!-- The 2px Kōwhai rule under the header. The one gold thing. -->
        <tr>
          <td style="background-color:${KOWHAI};height:2px;line-height:2px;font-size:2px;">&nbsp;</td>
        </tr>

        <tr>
          <td class="ctl-pad" style="background-color:${WHITE};padding:40px 32px;border-left:1px solid ${HAIRLINE};border-right:1px solid ${HAIRLINE};border-bottom:1px solid ${HAIRLINE};">
            ${blocks}
          </td>
        </tr>

        <tr>
          <td class="ctl-pad" style="padding:28px 32px 0;">
            ${footerLines}
          </td>
        </tr>

      </table>
      <!--[if mso | IE]></td></tr></table><![endif]-->
    </td>
  </tr>
</table>
</body>
</html>`;
}

// --- Plain text ------------------------------------------------------------

export function renderTextEmail(content: EmailContent): string {
  const blocks: string[] = [
    wrap(content.heading),
    ...(content.lede ? [wrap(content.lede)] : []),
    ...content.intro.map((p) => wrap(p)),
  ];

  if (content.meta?.length) {
    // The value, never the href: the href of an email address is a mailto:,
    // which nobody wants to read.
    blocks.push(content.meta.map((item) => `${item.label}: ${item.value}`).join("\n"));
  }
  if (content.quote) {
    blocks.push([RULE, content.quote, RULE].join("\n\n"));
  }
  for (const section of content.sections ?? []) {
    // Upper-cased here rather than by CSS, because the plain-text part has no
    // CSS and the label has to read as a heading on its own.
    blocks.push(section.label.toUpperCase());
    for (const paragraph of section.paragraphs ?? []) blocks.push(wrap(paragraph));
    if (section.meta?.length) {
      blocks.push(section.meta.map((item) => `${item.label}: ${item.value}`).join("\n"));
    }
  }
  if (content.summary) {
    // The same rendering the panel's Doc gets, so the applicant's copy and the
    // record read identically.
    blocks.push(
      RULE,
      renderApplicationText(content.summary, summaryNeedsHeader(content)),
      RULE,
    );
  }
  for (const paragraph of content.outro ?? []) {
    blocks.push(wrap(paragraph));
  }
  if (content.cta) {
    // Label then bare URL on its own line. Not wrapped: `wrap` would break a
    // long link across two lines and the client would stop linkifying it.
    blocks.push(`${content.cta.label}:\n${content.cta.href}`);
  }
  if (content.signoff) {
    blocks.push(content.signoff);
  }

  // `content.logos` is deliberately not rendered here. It is a wall of marks,
  // and the only thing it says in words is the six partner names and the
  // funder, which the outro already says in a sentence written to be read. A
  // text part cannot show a logo, so all it could add is that list a second
  // time, four lines below the first.

  // --- footer ---

  const footer = [
    content.unmonitored
      ? wrap("This address is not monitored, so please do not reply to this email.")
      : "",
    ["Community Tech Lab", FOOTER_NOTE, PRODUCTION_URL].join("\n"),
    content.bulk
      ? [
          content.bulk.postalAddress ?? "",
          wrap(content.bulk.reason),
          content.bulk.unsubscribeUrl
            ? `To stop hearing from us, reply and say so, or unsubscribe:\n${content.bulk.unsubscribeUrl}`
            : "To stop hearing from us, reply and say so.",
        ]
          .filter(Boolean)
          .join("\n")
      : "",
  ].filter(Boolean);

  return [...blocks, ...footer].join("\n\n");
}
