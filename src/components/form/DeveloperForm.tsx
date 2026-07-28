"use client";

import { useState } from "react";
import { useElapsed } from "@/hooks/useElapsed";
import { Button } from "../Button";
import { Body, Eyebrow, Heading } from "../Typography";
import { Checkbox } from "./Checkbox";
import { Field } from "./Field";
import { FileUpload } from "./FileUpload";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { DEVELOPER_HOURS, DEVELOPER_SEATS, EMAIL_PATTERN } from "@/lib/form-options";

/* The developer application. A few minutes, single page.
 *
 * No draft autosave here: it is eight fields, and the cost of losing it is
 * minutes rather than an hour. Adding a restore notice to a form this short
 * would be more friction than protection.
 *
 * The CV goes up as multipart alongside the JSON payload, so the whole thing is
 * one request. A failed upload does not fail the application.
 */

type Issue = { field: string; message: string };

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
       schema, so a local hint and a server rejection never disagree; the
       server still validates everything again. */
    const found: Issue[] = [
      ...(seat ? [] : [{ field: "seat", message: "Tell us which seat fits." }]),
      ...(shipped.trim()
        ? []
        : [{ field: "shipped", message: "Point us at something you have shipped." }]),
      ...(name.trim() ? [] : [{ field: "name", message: "This one is required." }]),
      ...(!email.trim()
        ? [{ field: "email", message: "We need an email address to reply to." }]
        : !EMAIL_PATTERN.test(email.trim())
          ? [{ field: "email", message: "That does not look like an email address." }]
          : []),
    ];
    if (found.length) {
      setIssues(found);
      return;
    }

    setSending(true);
    setIssues([]);
    setFormError("");

    try {
      const payload = {
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
      };

      const body = new FormData();
      body.set("payload", JSON.stringify(payload));
      if (cv) body.set("cv", cv);

      const res = await fetch("/api/apply", { method: "POST", body });
      const json = (await res.json()) as { ok: boolean; error?: string; issues?: Issue[] };

      if (!res.ok || !json.ok) {
        setIssues(json.issues ?? []);
        setFormError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setFormError("We could not reach the server. Please try again in a moment.");
    } finally {
      setSending(false);
    }
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
          options={[...DEVELOPER_SEATS]}
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
          options={[...DEVELOPER_HOURS]}
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
        <a href="/privacy" className="text-ink underline">
          privacy notice
        </a>
        .
      </p>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="ctl-dev-website">Website</label>
        <input
          id="ctl-dev-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {formError ? (
        <p role="alert" className="max-w-measure font-sans text-body-sm font-semibold text-ink">
          {formError}
        </p>
      ) : null}

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
