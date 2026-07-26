"use client";

import { useState } from "react";
import { useElapsed } from "@/hooks/useElapsed";
import { Button } from "../Button";
import { Card } from "../Card";
import { Eyebrow } from "../Typography";
import { Field } from "./Field";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";

/* Closes the dead end in the eligibility section.
 *
 * The section copy tells applicants "if you cannot tick one, get in touch before
 * submitting, because some of them can be discussed" — while the handoff bans
 * contact addresses site-wide. The handoff's actual rule is not "no contact" but
 * "if a contact route is needed, it has to be a form", so this is a form.
 *
 * Deliberately INLINE rather than a /contact route. Sending someone away
 * mid-application risks losing a half-finished 50-minute form, which is the
 * exact failure the draft autosave exists to prevent.
 *
 * The best part is what it does not do: the copy does not change. The existing
 * sentence becomes true rather than being rewritten, so it needs no sign-off
 * from the programme team.
 */

export function EligibilityQuestion({
  gates,
  unticked,
}: {
  gates: string[];
  unticked: boolean[];
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [gate, setGate] = useState("");
  const elapsed = useElapsed();

  // Offer the ones they have left unticked first: those are the ones they are
  // most likely asking about.
  const candidates = gates.filter((_, i) => !unticked[i]);
  const options = (candidates.length ? candidates : gates).map((g, i) => ({
    value: g,
    label: `${i + 1}. ${g.slice(0, 70)}${g.length > 70 ? "..." : ""}`,
  }));

  async function submit() {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType: "question",
          submissionId: crypto.randomUUID(),
          elapsedMs: elapsed(),
          gate,
          name,
          email,
          question,
        }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setError("We could not reach the server. Please try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <Card tone="sunk">
        <Eyebrow>Question sent</Eyebrow>
        <p className="mt-3 max-w-measure font-sans text-body-sm text-body">
          Thanks. We will come back to you by email. Your application is still here and
          nothing has been submitted.
        </p>
      </Card>
    );
  }

  if (!open) {
    return (
      <p className="max-w-measure font-sans text-body-sm text-muted">
        Cannot tick one of these?{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="cursor-pointer border-0 bg-transparent p-0 font-sans text-body-sm text-ink underline decoration-kowhai underline-offset-[var(--link-underline-offset)] hover:decoration-fern"
        >
          Get in touch before submitting
        </button>{" "}
        and we will talk it through. Some of them can be discussed.
      </p>
    );
  }

  return (
    <Card tone="sunk">
      <Eyebrow>Ask about eligibility</Eyebrow>
      <p className="mt-3 max-w-measure font-sans text-body-sm text-body">
        Four questions. Your application stays exactly where it is.
      </p>

      <div className="mt-5 grid gap-5">
        <Field label="Which one is the problem">
          <Select
            placeholder="Select one"
            options={options}
            value={gate}
            onChange={(e) => setGate(e.target.value)}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
        <Field label="What would you like to ask" required>
          <Textarea rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
        </Field>

        {error ? (
          <p role="alert" className="font-sans text-body-sm font-semibold text-ink">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" size="sm" onClick={submit} disabled={sending}>
            {sending ? "Sending" : "Send question"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
}
