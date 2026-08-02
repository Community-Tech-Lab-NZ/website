import { Resend } from "resend";

/* Confirmation emails, sent through Resend.
 *
 * Send-only. The programme publishes no inbox and replies bounce, so the email
 * says so plainly rather than leaving someone waiting on a dead address. After
 * 45 to 60 minutes of work, an on-screen "thanks" alone is a thin receipt, so
 * the applicant's own answers are echoed back — that copy is often the only one
 * they have.
 *
 * Failure here NEVER fails a submission. By the time this runs the application
 * is already stored; an email that does not arrive is an annoyance, a lost
 * application is not.
 */

export type EmailConfig = { apiKey: string; from: string; enabled: boolean };

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

function wrap(bodyLines: string[]): string {
  return [
    ...bodyLines,
    "",
    "This address is not monitored, so please do not reply to this email.",
    "",
    "Community Tech Lab",
    "A Startup Queenstown Lakes programme, funded by the QLDC Economic Diversification Fund",
  ].join("\n");
}

export async function sendCommunityConfirmation(
  config: EmailConfig,
  to: string,
  orgName: string,
  formatted: string,
): Promise<void> {
  if (!config.enabled) return;

  const resend = new Resend(config.apiKey);
  await resend.emails.send({
    from: config.from,
    to,
    subject: "Application received · Community Tech Lab",
    text: wrap([
      `Thanks. We have your application for ${orgName}.`,
      "",
      "A local panel reads every application between 1 and 18 September, and the three builds are announced on 24 September. We reply to everyone, either way.",
      "",
      "Your answers are copied below so you have a record of them.",
      "",
      "----------------------------------------",
      "",
      formatted,
    ]),
  });
}

export async function sendDeveloperConfirmation(
  config: EmailConfig,
  to: string,
  name: string,
  formatted: string,
): Promise<void> {
  if (!config.enabled) return;

  const resend = new Resend(config.apiKey);
  await resend.emails.send({
    from: config.from,
    to,
    subject: "Application received · Community Tech Lab",
    text: wrap([
      `Thanks ${name}. We have your application.`,
      "",
      "We will be in touch about the seats once the three builds are confirmed on 24 September.",
      "",
      "Your answers are copied below so you have a record of them.",
      "",
      "----------------------------------------",
      "",
      formatted,
    ]),
  });
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
 */
export async function sendApplicationCopy(
  config: EmailConfig,
  to: string,
  application: {
    kind: "community" | "developer";
    who: string;
    applicantEmail: string;
    docUrl: string;
    cvUrl: string;
    formatted: string;
  },
): Promise<void> {
  if (!config.enabled) return;

  const { kind, who, applicantEmail, docUrl, cvUrl, formatted } = application;
  const links = [docUrl && `Doc: ${docUrl}`, cvUrl && `CV: ${cvUrl}`].filter(
    (line): line is string => Boolean(line),
  );

  const resend = new Resend(config.apiKey);
  await resend.emails.send({
    from: config.from,
    to,
    replyTo: applicantEmail,
    subject: `${kind === "community" ? "Organisation" : "Developer"} application · ${who}`,
    text: [
      `${who} <${applicantEmail}> applied.`,
      ...(links.length ? ["", ...links] : []),
      "",
      "----------------------------------------",
      "",
      formatted,
      "",
      "Reply directly to this email to reach them.",
    ].join("\n"),
  });
}

/** Alerts the programme inbox that a question came in during the open window. */
export async function sendQuestionAlert(
  config: EmailConfig,
  to: string,
  name: string,
  fromEmail: string,
  gate: string,
  question: string,
): Promise<void> {
  if (!config.enabled) return;

  const resend = new Resend(config.apiKey);
  await resend.emails.send({
    from: config.from,
    to,
    replyTo: fromEmail,
    subject: `Eligibility question from ${name}`,
    text: [
      `${name} <${fromEmail}> asked about eligibility.`,
      gate ? `\nGate: ${gate}` : "",
      "",
      question,
      "",
      "Reply directly to this email to answer them.",
    ].join("\n"),
  });
}
