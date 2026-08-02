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

export type EmailContent = {
  /** The inbox preview line. Without one, clients pull the first words of the
   *  body, which is the heading again. */
  preheader: string;
  /** Space Mono label above the heading. */
  eyebrow: string;
  heading: string;
  /** Paragraphs between the heading and everything else. */
  intro: string[];
  /** Named facts: who applied, where the Doc is. Rendered as rows, links live. */
  meta?: EmailMeta[];
  /** Someone else's words, set apart from ours. */
  quote?: string;
  /** A full application, echoed back. */
  summary?: ApplicationSummary;
  /** Paragraphs after the body, before the footer. */
  outro?: string[];
  /** Applicant mail is sent from an address that bounces, and has to say so.
   *  Programme mail has a working reply-to, so it must not. */
  unmonitored: boolean;
};

/** Wraps our own copy to a readable measure for the plain-text part. Applicants'
 *  answers are left exactly as typed: rewrapping someone's prose can break a
 *  pasted URL, and their line breaks are meaningful. */
function wrap(text: string, width = TEXT_WIDTH): string {
  return text
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

function htmlParagraph(text: string, top = 20): string {
  return `<p style="margin:${top}px 0 0;font-family:${BODY};font-size:16px;line-height:1.6;color:${INK_BODY};">${escapeMultiline(text)}</p>`;
}

function htmlEyebrow(text: string, color = INK_MUTED): string {
  return `<p style="margin:0;font-family:${MONO};font-size:11px;line-height:1.4;letter-spacing:0.16em;text-transform:uppercase;color:${color};">${escapeHtml(text)}</p>`;
}

function htmlLink(href: string, label: string): string {
  // Ink with a Kōwhai underline, as everywhere else. Clients that ignore
  // text-decoration-color fall back to an Ink underline, which is still a link.
  return `<a href="${escapeHtml(href)}" style="color:${INK};text-decoration:underline;text-decoration-color:${KOWHAI};">${escapeHtml(label)}</a>`;
}

function htmlMeta(meta: EmailMeta[]): string {
  const rows = meta
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 0;border-top:1px solid ${HAIRLINE};font-family:${BODY};font-size:14px;line-height:1.5;color:${INK_MUTED};" width="34%" valign="top">${escapeHtml(item.label)}</td>
          <td style="padding:12px 0;border-top:1px solid ${HAIRLINE};font-family:${BODY};font-size:14px;line-height:1.5;color:${INK};word-break:break-word;" valign="top">${
            item.href
              ? htmlLink(item.href, item.display ?? item.value)
              : escapeHtml(item.display ?? item.value)
          }</td>
        </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:28px;">${rows}</table>`;
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
    ...content.intro.map((text) => htmlParagraph(text, 24)),
    content.meta?.length ? htmlMeta(content.meta) : "",
    content.quote ? htmlQuote(content.quote) : "",
    content.summary ? htmlSummary(content.summary, summaryNeedsHeader(content)) : "",
    ...(content.outro ?? []).map((text) => htmlParagraph(text, 28)),
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
  /* The one rule that cannot be inlined. Everything else is, so a client that
     drops this block still gets the full layout, just at a fixed measure. */
  @media only screen and (max-width:620px){
    .ctl-pad{padding-left:24px!important;padding-right:24px!important}
    .ctl-heading{font-size:26px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;width:100%;background-color:${OAT};color-scheme:light;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${OAT};">${escapeHtml(content.preheader)}${"&#847;&zwnj;&nbsp;".repeat(60)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:${OAT};">
  <tr>
    <td align="center" style="padding:32px 16px 48px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;">

        <tr>
          <td class="ctl-pad" style="background-color:${INK};padding:28px 32px;">
            <img src="${LOGO}" width="208" height="56" alt="Community Tech Lab" style="display:block;border:0;outline:none;text-decoration:none;width:208px;height:56px;font-family:${DISPLAY};font-size:20px;font-weight:800;color:${OAT};">
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
    </td>
  </tr>
</table>
</body>
</html>`;
}

// --- Plain text ------------------------------------------------------------

export function renderTextEmail(content: EmailContent): string {
  const blocks: string[] = [wrap(content.heading), ...content.intro.map((p) => wrap(p))];

  if (content.meta?.length) {
    // The value, never the href: the href of an email address is a mailto:,
    // which nobody wants to read.
    blocks.push(content.meta.map((item) => `${item.label}: ${item.value}`).join("\n"));
  }
  if (content.quote) {
    blocks.push([RULE, content.quote, RULE].join("\n\n"));
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

  const footer = [
    content.unmonitored
      ? wrap("This address is not monitored, so please do not reply to this email.")
      : "",
    ["Community Tech Lab", FOOTER_NOTE, PRODUCTION_URL].join("\n"),
  ].filter(Boolean);

  return [...blocks, ...footer].join("\n\n");
}
