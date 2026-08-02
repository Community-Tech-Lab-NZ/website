import { Resend } from "resend";
import type { ApplicationSummary } from "./application-doc";
import { renderHtmlEmail, renderTextEmail, type EmailContent } from "./email-template";

/* Confirmation emails, sent through Resend.
 *
 * Send-only. The programme publishes no inbox and replies bounce, so the email
 * says so plainly rather than leaving someone waiting on a dead address. After
 * 45 to 60 minutes of work, an on-screen "thanks" alone is a thin receipt, so
 * the applicant's own answers are echoed back — that copy is often the only one
 * they have.
 *
 * The wording tracks the on-screen confirmation in CommunityForm and
 * DeveloperForm. Someone reads the screen and then the email within a minute of
 * each other, and two versions of the same promise is how a programme starts
 * looking careless about the parts that are not code.
 *
 * WHAT IS SENT AND HOW IT IS SENT ARE SEPARATE. Each message is a `Message`
 * built by a pure function, and the senders below only address and post them.
 * That is what lets `pnpm preview:emails` render the real thing to disk: the
 * preview cannot show one email while the programme sends another.
 *
 * Failure here NEVER fails a submission. By the time this runs the application
 * is already stored; an email that does not arrive is an annoyance, a lost
 * application is not.
 */

export type EmailConfig = { apiKey: string; from: string; enabled: boolean };

export type Message = { subject: string; replyTo?: string; content: EmailContent };

export function getEmailConfig(): EmailConfig | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return null;

  return {
    apiKey,
    from,
    // Lets the path be deployed and verified before the domain's DNS is live.
    enabled: process.env.SEND_CONFIRMATIONS === "true",
  };
}

/** Every message goes out as both parts. Clients that render HTML get the
 *  branded one, everything else gets a letter that says the same thing. */
async function post(config: EmailConfig, to: string, message: Message): Promise<void> {
  const resend = new Resend(config.apiKey);
  await resend.emails.send({
    from: config.from,
    to,
    ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    subject: message.subject,
    html: renderHtmlEmail(message.content),
    text: renderTextEmail(message.content),
  });
}

const ANSWERS_NOTE = "Your answers are copied below so you have a record of them.";

// --- What each message says ------------------------------------------------

export function communityConfirmation(summary: ApplicationSummary): Message {
  return {
    subject: "Application received · Community Tech Lab",
    content: {
      preheader: `We have the application for ${summary.subject}. A local panel reads every one between 1 and 18 September.`,
      eyebrow: "Application received",
      heading: "Thank you. We have your application.",
      // Names the organisation rather than repeating the heading. In HTML the
      // heading is display type and this is body, so "we have your
      // application" twice reads as a heading and its opening sentence; in the
      // plain-text part they are two adjacent lines saying one thing.
      intro: [
        `It is the application for ${summary.subject}, and there is nothing else you need to do.`,
        "We reply to everyone. A local panel reads every application between 1 and 18 September, and the three builds are announced on 24 September. We will be in touch before then either way.",
        ANSWERS_NOTE,
      ],
      summary,
      unmonitored: true,
    },
  };
}

export function developerConfirmation(summary: ApplicationSummary): Message {
  // First name only. "Thanks Tama" reads like a person wrote it; the full name
  // as typed into a form field does not.
  const firstName = summary.subject.trim().split(/\s+/)[0];

  return {
    subject: "Application received · Community Tech Lab",
    content: {
      preheader: "We have your application. The three builds are announced on 24 September.",
      eyebrow: "Application received",
      heading: "Thank you. We have your application.",
      intro: [
        firstName ? `Thanks ${firstName}. Your application is in.` : "Thanks. Your application is in.",
        "We reply to everyone. The three builds are announced on 24 September, and we will be in touch about seats around then.",
        ANSWERS_NOTE,
      ],
      summary,
      unmonitored: true,
    },
  };
}

/* A programme-side copy of an application, sent alongside the applicant's own
 * confirmation.
 *
 * The Sheet is the record. This is a second one, landing somewhere a person
 * actually reads, so that a Sheet nobody opens for a week is not the only place
 * an application exists. It carries the Doc and CV links, and replies go to the
 * applicant rather than into the void.
 *
 * Sent as its own message rather than a bcc on the confirmation, deliberately: a
 * typo in the applicant's address must not take the programme's copy down with
 * it.
 *
 * Branded like the applicant's copy rather than stripped back, because it is
 * read by the delivery lead, the chair and the panel, and it gets forwarded.
 */
export function applicationCopy(application: {
  summary: ApplicationSummary;
  applicantEmail: string;
  docUrl: string;
  cvUrl: string;
}): Message {
  const { summary, applicantEmail, docUrl, cvUrl } = application;
  const isCommunity = summary.kind === "community";

  // A failed Doc or CV writes a sentence into these fields instead of a URL, so
  // the row carries what went wrong. Shown either way, but a link is only a link
  // when it is one, and the failure sentence has to be readable as written.
  const file = (label: string, value: string) => {
    if (!value) return [];
    const isUrl = /^https?:\/\//.test(value);
    return [{ label, value, ...(isUrl ? { href: value, display: `Open the ${label}` } : {}) }];
  };

  const meta = [
    { label: isCommunity ? "Organisation" : "Applicant", value: summary.subject },
    { label: "Email", value: applicantEmail, href: `mailto:${applicantEmail}` },
    { label: "Reference", value: summary.reference },
    { label: "Submitted", value: summary.submittedAt },
    ...file("Doc", docUrl),
    ...file("CV", cvUrl),
  ];

  return {
    subject: `${isCommunity ? "Organisation" : "Developer"} application · ${summary.subject}`,
    replyTo: applicantEmail,
    content: {
      preheader: `${summary.subject} applied. Reply to this email to reach them.`,
      eyebrow: isCommunity ? "New organisation application" : "New developer application",
      heading: summary.subject,
      intro: [],
      meta,
      summary,
      outro: ["Reply directly to this email to reach them."],
      unmonitored: false,
    },
  };
}

/** Alerts the programme inbox that a question came in during the open window. */
export function questionAlert(question: {
  name: string;
  fromEmail: string;
  gate: string;
  body: string;
}): Message {
  return {
    subject: `Eligibility question · ${question.name}`,
    replyTo: question.fromEmail,
    content: {
      preheader: `${question.name} asked about eligibility. Reply to this email to answer them.`,
      eyebrow: "Eligibility question",
      heading: question.name,
      intro: [],
      meta: [
        { label: "From", value: question.name },
        { label: "Email", value: question.fromEmail, href: `mailto:${question.fromEmail}` },
        ...(question.gate ? [{ label: "Gate", value: question.gate }] : []),
      ],
      quote: question.body,
      outro: ["Reply directly to this email to answer them."],
      unmonitored: false,
    },
  };
}

// --- Sending ---------------------------------------------------------------

export async function sendCommunityConfirmation(
  config: EmailConfig,
  to: string,
  summary: ApplicationSummary,
): Promise<void> {
  if (!config.enabled) return;
  await post(config, to, communityConfirmation(summary));
}

export async function sendDeveloperConfirmation(
  config: EmailConfig,
  to: string,
  summary: ApplicationSummary,
): Promise<void> {
  if (!config.enabled) return;
  await post(config, to, developerConfirmation(summary));
}

export async function sendApplicationCopy(
  config: EmailConfig,
  to: string,
  application: {
    summary: ApplicationSummary;
    applicantEmail: string;
    docUrl: string;
    cvUrl: string;
  },
): Promise<void> {
  if (!config.enabled) return;
  await post(config, to, applicationCopy(application));
}

export async function sendQuestionAlert(
  config: EmailConfig,
  to: string,
  name: string,
  fromEmail: string,
  gate: string,
  question: string,
): Promise<void> {
  if (!config.enabled) return;
  await post(config, to, questionAlert({ name, fromEmail, gate, body: question }));
}
