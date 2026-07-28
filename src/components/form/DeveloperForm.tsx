"use client";

import { useState } from "react";
import { useElapsed } from "@/hooks/useElapsed";
import { Button } from "../Button";
import { Body, Eyebrow, Heading } from "../Typography";
import { Checkbox } from "./Checkbox";
import { Field } from "./Field";
import { FileUpload } from "./FileUpload";
import { FormAlert } from "./FormAlert";
import { Honeypot } from "./Honeypot";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { emailIssues, postApplication, requiredIssue, type Issue } from "./submit";
import { DEVELOPER_HOURS, DEVELOPER_SEATS, FORM_MESSAGES } from "@/lib/form-options";

/* The developer application. A few minutes, single page.
 *
 * No draft autosave here: it is eight fields, and the cost of losing it is
 * minutes rather than an hour. Adding a restore notice to a form this short
 * would be more friction than protection.
 *
 * The CV goes up as multipart alongside the JSON payload, so the whole thing is
 * one request. A failed upload does not fail the application.
 */

export function DeveloperForm({ canSubmit }: { canSubmit: boolean }) {
  const [seat, setSeat] = useState("");
  const [shipped, setShipped] = useState("");
  const [basedIn, setBasedIn] = useState("");
  const [hours, setHours] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [aiUnderstood, setAiUnderstood] = useState(false);
  const [cv, setCv] = useState<File | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [formError, setFormError] = useState("");
  const elapsed = useElapsed();

  const issueFor = (field: string) => issues.find((i) => i.field === field)?.message;

  async function submit() {
    /* Client-side pass before anything is sent. Same messages as the server
       schema (both read FORM_MESSAGES), so a local hint and a server
       rejection never disagree; the server still validates everything again. */
    const found: Issue[] = [
      ...requiredIssue("seat", seat, FORM_MESSAGES.seat),
      ...requiredIssue("shipped", shipped, FORM_MESSAGES.shipped),
      ...requiredIssue("name", name),
      ...emailIssues("email", email),
    ];
    if (found.length) {
      setIssues(found);
      return;
    }

    setSending(true);
    setIssues([]);
    setFormError("");

    const result = await postApplication(
      {
        formType: "developer",
        submissionId: crypto.randomUUID(),
        website: honeypot,
        elapsedMs: elapsed(),
        seat,
        shipped,
        basedIn,
        hours,
        name,
        email,
        understood,
        aiUnderstood,
      },
      cv,
    );
    setSending(false);

    if (!result.ok) {
      if (result.reason === "network") {
        setFormError("We could not reach the server. Please try again in a moment.");
      } else {
        setIssues(result.issues);
        setFormError(result.error);
      }
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-6 max-w-[var(--form-measure)]">
        <Eyebrow>Received</Eyebrow>
        <Heading level={2} className="mt-5">
          Thank you. We have your application.
        </Heading>
        <Body className="mt-5">
          We reply to everyone. The three builds are announced on 24 September, and we
          will be in touch about seats around then.
        </Body>
      </div>
    );
  }

  return (
    <div className="mt-6 grid max-w-[var(--form-measure)] gap-5">
      <Field label="Which seat fits" required error={issueFor("seat")}>
        <Select
          placeholder="Select one"
          options={DEVELOPER_SEATS}
          value={seat}
          onChange={(e) => setSeat(e.target.value)}
        />
      </Field>

      <Field
        label="Something you have shipped"
        required
        error={issueFor("shipped")}
        hint="A repository, a site, or a short description. Anything real."
      >
        <Textarea
          rows={4}
          value={shipped}
          onChange={(e) => setShipped(e.target.value)}
          placeholder="github.com/yourname/rostering-tool"
        />
      </Field>

      <Field label="Your CV" hint="Optional. PDF or Word, if you have one handy.">
        <FileUpload onChange={setCv} />
      </Field>

      <Field label="Where in the district are you based">
        <Input
          value={basedIn}
          onChange={(e) => setBasedIn(e.target.value)}
          placeholder="Frankton"
        />
      </Field>

      <Field
        label="Roughly how many hours a week could you give"
        hint="The build assumes about 12 hours a week for five weeks, evenings and weekends."
      >
        <Select
          placeholder="Select one"
          options={DEVELOPER_HOURS}
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" required error={issueFor("name")}>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Email" required error={issueFor("email")}>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.nz"
          />
        </Field>
      </div>

      <Checkbox
        checked={understood}
        onChange={(e) => setUnderstood(e.target.checked)}
        label="I understand the rate is a community rate, well under commercial, and that everything built is released open source"
      />

      <Checkbox
        checked={aiUnderstood}
        onChange={(e) => setAiUnderstood(e.target.checked)}
        label="I understand AI tools may be used to help summarise and organise what I submit, and that people make every decision"
      />

      <p className="max-w-measure font-sans text-body-sm text-muted">
        Startup Queenstown Lakes holds this information on behalf of the programme. See
        the{" "}
        <a href="/privacy" className="ctl-link-grow text-ink underline">
          privacy notice
        </a>
        .
      </p>

      <Honeypot id="ctl-dev-website" value={honeypot} onChange={setHoneypot} />

      {formError ? <FormAlert>{formError}</FormAlert> : null}

      <div>
        <Button
          variant="primary"
          size="lg"
          disabled={!understood || !aiUnderstood || sending || !canSubmit}
          onClick={submit}
        >
          {sending ? "Sending" : "Send my application"}
        </Button>
      </div>

      {!canSubmit ? (
        <p className="font-sans text-body-sm text-muted">
          Applications open on 15 August.
        </p>
      ) : null}
    </div>
  );
}
