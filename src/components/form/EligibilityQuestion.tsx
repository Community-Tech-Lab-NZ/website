"use client";

import { useState } from "react";
import { useElapsed } from "@/hooks/useElapsed";
import { Button } from "../Button";
import { Card } from "../Card";
import { Eyebrow, Note } from "../Typography";
import { Field } from "./Field";
import { FormAlert } from "./FormAlert";
import { Input } from "./Input";
import { RadioGroup } from "./RadioGroup";
import { Textarea } from "./Textarea";
import { postApplication } from "./submit";

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
  ticked,
}: {
  gates: readonly string[];
  /** Parallel to `gates`: true means that gate has been confirmed. */
  ticked: boolean[];
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

  // Offer the ones they have left unconfirmed first: those are the ones they
  // are most likely asking about.
  //
  // These used to be cut at 70 characters with an ellipsis, because a select's
  // row is one line and six full gate sentences do not fit in one. That made
  // the question "which one is the problem" unanswerable from the options
  // themselves. Radio rows wrap, so the sentences are whole now.
  //
  // The numbers went with the truncation. They were derived from the position
  // in the FILTERED list rather than in CTL_GATES, so "1." could point at the
  // fourth gate, and they matched nothing on screen either way: the checkboxes
  // above render the bare sentence with no number at all. The sentences
  // identify themselves.
  const unconfirmed = gates.filter((_, i) => !ticked[i]);
  const options = unconfirmed.length ? unconfirmed : gates;

  async function submit() {
    setSending(true);
    setError("");

    const result = await postApplication({
      formType: "question",
      submissionId: crypto.randomUUID(),
      elapsedMs: elapsed(),
      gate,
      name,
      email,
      question,
    });
    setSending(false);

    if (!result.ok) {
      setError(
        result.reason === "network"
          ? "We could not reach the server. Please try again in a moment."
          : result.error,
      );
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card tone="sunk">
        <Eyebrow>Question sent</Eyebrow>
        <Note className="mt-3">
          Thanks. We will come back to you by email. Your application is still here and
          nothing has been submitted.
        </Note>
      </Card>
    );
  }

  if (!open) {
    return (
      <Note muted>
        Cannot tick one of these?{" "}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ctl-link-grow cursor-pointer border-0 bg-transparent p-0 font-sans text-body-sm text-ink underline decoration-kowhai underline-offset-[var(--link-underline-offset)] hover:decoration-fern"
        >
          Get in touch before submitting
        </button>{" "}
        and we will talk it through. Some of them can be discussed.
      </Note>
    );
  }

  return (
    <Card tone="sunk">
      <Eyebrow>Ask about eligibility</Eyebrow>
      <Note className="mt-3">
        Four questions. Your application stays exactly where it is.
      </Note>

      <div className="mt-5 grid gap-5">
        <Field label="Which one is the problem" group>
          <RadioGroup
            options={options}
            value={gate}
            onChange={(e) => setGate(e.target.value)}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your name" required>
            <Input
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Email" required>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
        </div>
        <Field label="What would you like to ask" required>
          <Textarea rows={3} value={question} onChange={(e) => setQuestion(e.target.value)} />
        </Field>

        {error ? <FormAlert>{error}</FormAlert> : null}

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
