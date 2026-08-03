"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useElapsed } from "@/hooks/useElapsed";
import { Button } from "../Button";
import { CaretList } from "../CaretList";
import { Card } from "../Card";
import { Body, Eyebrow, Heading, Note } from "../Typography";
import { Checkbox } from "./Checkbox";
import { EligibilityQuestion } from "./EligibilityQuestion";
import { Field } from "./Field";
import { FormAlert } from "./FormAlert";
import { Honeypot } from "./Honeypot";
import { Input } from "./Input";
import { Select } from "./Select";
import { StageBar } from "./StageBar";
import { StageNav, type StageMark } from "./StageNav";
import { Textarea } from "./Textarea";
import { emailIssues, postApplication, requiredIssue, type Issue } from "./submit";
import { useFormDraft } from "@/hooks/useFormDraft";
import {
  COMMUNITY_ASKS as ASK,
  CTL_GATES,
  DECLARATION_STATEMENTS,
  FORM_MESSAGES,
  LEGAL_STRUCTURES,
  ORG_SIZES,
  SENSITIVE_ANSWERS,
  SYSTEM_ANSWERS,
} from "@/lib/form-options";

/* The community application. Six sections, roughly 45 to 60 minutes.
 *
 * Copy for the section titles and intros is final and transcribed verbatim: it
 * is doing the real work of making a long form answerable by someone who has
 * never written a software specification.
 *
 * Beyond the prototype, this adds draft autosave, the inline eligibility
 * question panel, server error surfacing, and awareness of whether the window
 * is actually open.
 */

const SECTIONS = [
  {
    id: "a",
    label: "Your organisation",
    title: "Tell us who you are",
    intro:
      "Basic details about your organisation and the person we would talk to. None of this is scored, so answer quickly and move on.",
  },
  {
    id: "b",
    label: "Eligibility",
    title: "Check the basics",
    intro:
      "Six statements to confirm. They are the conditions of the programme rather than a test. If you cannot tick one, get in touch before submitting, because some of them can be discussed.",
  },
  {
    id: "c",
    label: "The problem",
    title: "Describe the problem, not the software",
    intro:
      "This is the section that matters most, and the one people most often overthink. Write about what is going wrong in your week, in the words you would use to explain it to a colleague. You do not need to know what should be built, or what it should be called. If you find yourself describing an app, back up and describe the day that made you want one.",
  },
  {
    id: "d",
    label: "Scope and fit",
    title: "Only if you have a sense of it",
    intro:
      "Most of this section is optional. If you already have a rough idea of what would help, tell us. If you do not, say so and leave it there. It will not count against you. The one question worth a real answer is whether other organisations might have the same problem, because we prioritise work that more than one group can use.",
  },
  {
    id: "e",
    label: "Readiness",
    title: "Who would work with the team",
    intro:
      "Building something is only half of it. A named person with a small, realistic amount of time makes a project far more likely to succeed than an enthusiastic answer nobody can deliver on. Be honest about capacity rather than generous.",
  },
  {
    id: "f",
    label: "Declaration",
    title: "Confirm and send",
    intro:
      "A short confirmation from someone authorised to speak for the organisation, then you are done.",
  },
] as const;

const EMPTY = {
  orgName: "",
  legalStructure: "",
  registrationNumber: "",
  contactName: "",
  contactRole: "",
  contactEmail: "",
  contactPhone: "",
  basedIn: "",
  orgSize: "",
  problem: "",
  problemToday: "",
  problemWho: "",
  problemSuccess: "",
  scopeEssentials: "",
  scopeReuse: "",
  scopeSystems: "",
  scopeSystemsWhich: "",
  scopeSensitive: "",
  scopeSensitiveWhat: "",
  readinessContact: "",
  readinessOwner: "",
  readinessTiming: "",
  readinessAnythingElse: "",
  declarationName: "",
  declarationRole: "",
};

type Values = typeof EMPTY;

/* Client-side mirror of the REQUIRED rules in the server schema, per section.
 * The mirror helpers in ./submit read FORM_MESSAGES — the same constants the
 * schema uses — so a client hint and a server rejection cannot disagree. The
 * server stays the source of truth; this exists so someone finds out about a
 * missing answer while they are looking at it, not from a round-trip after
 * fifty minutes of work.
 *
 * The mirror is deliberately presence-only plus the email shape. Everything
 * subtler (length caps, enum membership) still belongs to the server, where
 * the rule "never lose a long form to a validation rule that did not need to
 * exist" is enforced in one place. */
function sectionIssues(
  section: number,
  values: Values,
  gates: boolean[],
  declared: boolean,
): Issue[] {
  switch (section) {
    case 0:
      return [
        ...requiredIssue("orgName", values.orgName),
        ...requiredIssue("contactName", values.contactName),
        ...emailIssues("contactEmail", values.contactEmail),
      ];
    case 1:
      return gates.every(Boolean) ? [] : [{ field: "gates", message: FORM_MESSAGES.gates }];
    case 2:
      return requiredIssue("problem", values.problem);
    case 3:
      return []; // everything in Scope and fit is optional, by design
    case 4:
      return requiredIssue("readinessContact", values.readinessContact);
    case 5:
      return [
        ...requiredIssue("declarationName", values.declarationName),
        ...(declared ? [] : [{ field: "declared", message: FORM_MESSAGES.declared }]),
      ];
    default:
      return [];
  }
}

export function CommunityForm({ canSubmit }: { canSubmit: boolean }) {
  const [step, setStep] = useState(0);
  // Gates and the declaration are intentionally not persisted: restoring a
  // pre-ticked legal confirmation nobody ticked this session would be wrong.
  const [gates, setGates] = useState<boolean[]>(CTL_GATES.map(() => false));
  const [declared, setDeclared] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [formError, setFormError] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const elapsed = useElapsed();

  const draft = useFormDraft<Values>("ctl-application-draft-v1", EMPTY);
  const values = draft.value;

  /* Moving between sections replaces the DOM (the keyed fade wrapper), so
     focus is managed: it lands on the new section's heading, which also tells
     screen reader users where they are. Skipped on first mount so loading the
     page never steals focus. */
  const headingRef = useRef<HTMLSpanElement>(null);
  const mountedRef = useRef(false);
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    headingRef.current?.focus({ preventScroll: false });
  }, [step]);

  const allGates = gates.every(Boolean);
  const last = step === SECTIONS.length - 1;
  const issueFor = (field: string) => issues.find((i) => i.field === field)?.message;

  const set = useMemo(
    () => (key: keyof Values) => (event: { target: { value: string } }) => {
      const next = event.target.value;
      draft.setValue((prev) => ({ ...prev, [key]: next }));
      // Typing into a field withdraws its complaint. Leaving a stale "this one
      // is required" under a field someone is actively filling in reads as the
      // form not listening.
      setIssues((prev) => prev.filter((i) => i.field !== key));
    },
    [draft],
  );

  /* Per-section state, recomputed every render. Cheap: presence checks over a
     couple of dozen strings.

     `resolved` is the validation truth — nothing outstanding in that section —
     and it is what Next, the submit pass and the declaration shortcut read. */
  const resolved = SECTIONS.map(
    (_, i) => sectionIssues(i, values, gates, declared).length === 0,
  );
  const incomplete = SECTIONS.filter((_, i) => !resolved[i]);
  const onlyDeclarationLeft = incomplete.length === 1 && !resolved[5] && step < 5;

  /* What the rail shows, which is deliberately NOT `resolved`.
   *
   * Scope and fit has no required questions, so it is resolved from first
   * paint. Marking it made a blank form open with a tick on section four and
   * "1 of 6 complete", which reads as progress nobody made — and, sitting
   * beside a row, was read as a pointer at the current stage instead.
   *
   * So a section says nothing until it has been opened. Walk the guided path
   * and marks appear behind you; the warning only ever appears on a section
   * someone opened and left unfinished, because Next validates and will not
   * let them past one otherwise. It takes jumping about in the rail to earn
   * one, which is exactly when it is worth saying.
   *
   * Trying to submit overrides all of that: at that point every outstanding
   * section has to be visible, opened or not. */
  const [visited, setVisited] = useState<number[]>([0]);
  const [triedSubmit, setTriedSubmit] = useState(false);
  /* Adjusted during render rather than in an effect, the same way SiteHeader
     closes its panel on a route change: React re-runs this pass before
     touching the DOM, so a section never paints unmarked for a frame and then
     corrects itself. The guard converges — it can only be true once per
     section. */
  if (!visited.includes(step)) setVisited([...visited, step]);

  const marks: StageMark[] = SECTIONS.map((_, i) => {
    if (resolved[i]) return visited.includes(i) ? "done" : "none";
    if (triedSubmit) return "attention";
    // Never on the section in view: its own fields carry the message there.
    return visited.includes(i) && i !== step ? "attention" : "none";
  });
  const done = marks.filter((m) => m === "done").length;

  /* Start over. draft.discard() only empties the saved answers, and on its own
     that left the form in a state nobody asked for: still on section four, the
     rail still ticked from a draft that no longer exists — and, because those
     sections had been visited and were now unresolved, ticks turning into
     warnings on a form the reader had just asked to be rid of.
     Everything the reader accumulated resets together, so "start over" means
     what it says. The gates and declaration are session state rather than draft
     state, and they clear here too: leaving legal confirmations ticked on an
     otherwise blank form would be exactly the wrong thing to keep.
     Sending step to 0 also moves focus to the first section's heading, through
     the effect above. */
  function startOver() {
    draft.discard();
    setStep(0);
    setVisited([0]);
    setTriedSubmit(false);
    setGates(CTL_GATES.map(() => false));
    setDeclared(false);
    setIssues([]);
    setFormError("");
  }

  /* Next validates the section it is leaving. Errors render inline on the
     fields in view and progression stops until they are dealt with — that is
     the promised hint. The step nav above stays freely clickable on purpose:
     validation guards the guided path, it does not lock people in. */
  function next() {
    const found = sectionIssues(step, values, gates, declared);
    if (found.length) {
      setIssues(found);
      return;
    }
    setIssues([]);
    setStep((s) => Math.min(s + 1, SECTIONS.length - 1));
  }

  async function submit() {
    /* From here on the rail flags every outstanding section, including ones
       nobody has opened. Before a submit attempt that would be nagging; after
       one it is the answer to "why can this not send". */
    setTriedSubmit(true);

    /* Client-side pass over the whole form before anything leaves the device.
       On failure, jump to the first section with a problem and show its
       errors there — the same courtesy the server-error path already extends.
       The server still validates everything again. */
    for (let i = 0; i < SECTIONS.length; i++) {
      const found = sectionIssues(i, values, gates, declared);
      if (found.length) {
        setIssues(found);
        setStep(i);
        return;
      }
    }

    setSending(true);
    setIssues([]);
    setFormError("");

    const result = await postApplication({
      formType: "community",
      submissionId: crypto.randomUUID(),
      website: honeypot,
      elapsedMs: elapsed(),
      ...values,
      gates,
      declared,
    });
    setSending(false);

    if (!result.ok) {
      if (result.reason === "network") {
        setFormError(
          "We could not reach the server. Your answers are saved on this device, so you can try again.",
        );
      } else {
        setIssues(result.issues);
        setFormError(result.error);
        // Send them to the first section carrying an error rather than leaving
        // them staring at a message about a field they cannot see.
        if (result.issues.length) {
          const index = SECTION_FOR_FIELD[result.issues[0].field];
          if (index !== undefined) setStep(index);
        }
      }
      return;
    }

    draft.clear();
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
          We reply to everyone. A local panel reads every application between 1 and 18
          September, and the three builds are announced on 24 September. We will be in
          touch before then either way.
        </Body>
      </div>
    );
  }

  return (
    <div>
      {/* Below lg the rail collapses to a sticky bar that expands. */}
      <StageBar stages={SECTIONS} current={step} marks={marks} onSelect={setStep} />

      {/* Stage rail beside the form rather than a strip above it. Six sections
          in a three-by-two grid showed every label but never read as a
          sequence, and the active underline was easy to lose under the
          audience tabs, which were another horizontal strip a few pixels
          higher. Top to bottom fixes the order and frees the other axis.
          The rail only appears at lg, where the apply page's form now spans the
          full container: 220 + 48 + 620 fits the 1024px content width. */}
      <div className="mt-6 lg:grid lg:grid-cols-[var(--stage-nav-w)_minmax(0,1fr)] lg:items-start lg:gap-7">
        <div className="hidden lg:sticky lg:top-7 lg:block">
          <StageNav
            stages={SECTIONS}
            current={step}
            marks={marks}
            onSelect={setStep}
            indicator
          />
          <p className="mt-4 border-t border-solid border-hairline pt-4 font-meta text-label uppercase tracking-[var(--tracking-step)] text-muted">
            {done} of {SECTIONS.length} complete
          </p>
        </div>

        <div>
          {/* The rail says which sections are outstanding. This says the one
              thing it cannot: that the outstanding one is only a signature. */}
          {onlyDeclarationLeft ? (
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <Note muted>Everything is answered. Only the declaration is left.</Note>
              <Button variant="secondary" size="sm" onClick={() => setStep(5)}>
                Go to the declaration
              </Button>
            </div>
          ) : null}

          {draft.restored ? (
            <Card tone="sunk" className="mb-6 max-w-[var(--form-measure)]">
              <Note>We restored your progress from this device. Nothing has been sent yet.</Note>
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={startOver}>
                  Start over
                </Button>
              </div>
            </Card>
          ) : null}

          {/* Keyed on step: changing section remounts this wrapper, replaying the
              same 220ms fade-and-rise the routes use, so moving through the form
              feels like moving through the site. The remount also lets focus be
              sent to the new section's heading — with a keyed swap the previously
              focused button is gone, and without managed focus a keyboard user
              would be dropped back to the top of the document. */}
          <div key={step} className="ctl-route-fade">
            <div className="max-w-[var(--form-measure)]">
              {/* h2, not h3: this sits directly under the page h1, and an h3 here
                  skipped a level. Visual size is unchanged. */}
              <Heading level={3} as="h2">
                {/* No scroll-mt here. The document's scroll-padding-top in
                    base.css clears the sticky bar for every scroll target on
                    the page, this heading included — and the two would not
                    compose, they would add up to 32px of over-scroll. */}
                <span ref={headingRef} tabIndex={-1} className="outline-none">
                  {SECTIONS[step].title}
                </span>
              </Heading>
              <Body className="mt-3">{SECTIONS[step].intro}</Body>
            </div>

            <div className="mt-6 grid max-w-[var(--form-measure)] gap-5">
            {step === 0 ? (
              <>
                {/* autoComplete throughout this block. It is worth more here
                    than on a typical contact form: this is 32 fields and 45 to
                    60 minutes, most of it on a phone, and the identity fields
                    are the boring toll a reader pays before reaching the
                    questions that actually matter. type="email" and type="tel"
                    were already choosing the right KEYBOARD; only these tokens
                    let iOS and Android offer the value itself. */}
                <Field label={ASK.orgName} required error={issueFor("orgName")}>
                  <Input
                    autoComplete="organization"
                    value={values.orgName}
                    onChange={set("orgName")}
                    placeholder="Wakatipu Community Trust"
                  />
                </Field>
                <Field
                  label={ASK.legalStructure}
                  hint="Registered charity, incorporated society, charitable trust, community group, not-for-profit."
                >
                  <Select
                    placeholder="Select one"
                    options={LEGAL_STRUCTURES}
                    value={values.legalStructure}
                    onChange={set("legalStructure")}
                  />
                </Field>
                <Field label={ASK.registrationNumber} hint="If you have one.">
                  <Input value={values.registrationNumber} onChange={set("registrationNumber")} />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={ASK.contactName} required error={issueFor("contactName")}>
                    <Input
                      autoComplete="name"
                      value={values.contactName}
                      onChange={set("contactName")}
                    />
                  </Field>
                  <Field label={ASK.contactRole}>
                    <Input
                      autoComplete="organization-title"
                      value={values.contactRole}
                      onChange={set("contactRole")}
                    />
                  </Field>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={ASK.contactEmail} required error={issueFor("contactEmail")}>
                    <Input
                      type="email"
                      autoComplete="email"
                      value={values.contactEmail}
                      onChange={set("contactEmail")}
                      placeholder="you@organisation.nz"
                    />
                  </Field>
                  <Field label={ASK.contactPhone}>
                    <Input
                      type="tel"
                      autoComplete="tel"
                      value={values.contactPhone}
                      onChange={set("contactPhone")}
                    />
                  </Field>
                </div>
                <Field
                  label={ASK.basedIn}
                  hint="Town or area within the Queenstown Lakes district."
                >
                  <Input
                    autoComplete="address-level2"
                    value={values.basedIn}
                    onChange={set("basedIn")}
                    placeholder="Wānaka"
                  />
                </Field>
                <Field
                  label={ASK.orgSize}
                  hint="Paid staff and regular volunteers. This helps us understand capacity, not to rule you out."
                >
                  <Select
                    placeholder="Select one"
                    options={ORG_SIZES}
                    value={values.orgSize}
                    onChange={set("orgSize")}
                  />
                </Field>
              </>
            ) : null}

            {step === 1 ? (
              <>
                {CTL_GATES.map((gate, i) => (
                  <Checkbox
                    key={i}
                    checked={gates[i]}
                    onChange={(e) => {
                      const next = [...gates];
                      next[i] = e.target.checked;
                      setGates(next);
                      if (next.every(Boolean)) {
                        setIssues((prev) => prev.filter((issue) => issue.field !== "gates"));
                      }
                    }}
                    label={gate}
                  />
                ))}
                {issueFor("gates") ? <FormAlert>{issueFor("gates")}</FormAlert> : null}
                {!allGates ? (
                  <Note muted>All six need to be confirmed before you can submit.</Note>
                ) : null}

                {/* Makes the section's own instruction true. The copy says "get in
                    touch before submitting" and, until now, pointed nowhere. */}
                <EligibilityQuestion gates={CTL_GATES} unticked={gates} />
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Field
                  label={ASK.problem}
                  required
                  error={issueFor("problem")}
                  hint="A sentence or two. Plain language is perfect. For example: we track volunteer hours on paper and it takes hours to total them each month."
                >
                  <Textarea rows={3} value={values.problem} onChange={set("problem")} />
                </Field>
                <Field
                  label={ASK.problemToday}
                  hint="Time, money, errors, frustration, or things you cannot do because of it. About 100 to 150 words."
                >
                  <Textarea rows={5} value={values.problemToday} onChange={set("problemToday")} />
                </Field>
                <Field
                  label={ASK.problemWho}
                  hint="Staff, volunteers, the people you serve, your board. Roughly how many, and how often. About 80 to 120 words."
                >
                  <Textarea rows={4} value={values.problemWho} onChange={set("problemWho")} />
                </Field>
                <Field
                  label={ASK.problemSuccess}
                  hint="Describe it in a way you could later tell whether it happened. About 80 to 120 words."
                >
                  <Textarea rows={4} value={values.problemSuccess} onChange={set("problemSuccess")} />
                </Field>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <Field
                  label={ASK.scopeEssentials}
                  hint="Just the essentials. We work out the details with you later if you are selected."
                >
                  <Textarea rows={4} value={values.scopeEssentials} onChange={set("scopeEssentials")} />
                </Field>
                <Field
                  label={ASK.scopeReuse}
                  hint="Reuse carries real weight in scoring. If you are not sure, say so."
                >
                  <Textarea rows={3} value={values.scopeReuse} onChange={set("scopeReuse")} />
                </Field>
                <Field label={ASK.scopeSystems}>
                  <Select
                    placeholder="Select one"
                    options={SYSTEM_ANSWERS}
                    value={values.scopeSystems}
                    onChange={set("scopeSystems")}
                  />
                </Field>
                <Field
                  label={ASK.scopeSystemsWhich}
                  hint="A CRM, spreadsheet, website, payment or membership system."
                >
                  <Input value={values.scopeSystemsWhich} onChange={set("scopeSystemsWhich")} />
                </Field>
                <Field
                  label={ASK.scopeSensitive}
                  hint="Client records, health information, children's details, donor or payment data. This does not rule you out, it helps us plan."
                >
                  <Select
                    placeholder="Select one"
                    options={SENSITIVE_ANSWERS}
                    value={values.scopeSensitive}
                    onChange={set("scopeSensitive")}
                  />
                </Field>
                <Field label={ASK.scopeSensitiveWhat}>
                  <Textarea rows={2} value={values.scopeSensitiveWhat} onChange={set("scopeSensitiveWhat")} />
                </Field>
              </>
            ) : null}

            {step === 4 ? (
              <>
                <Field
                  label={ASK.readinessContact}
                  required
                  error={issueFor("readinessContact")}
                  hint="A real person and a realistic amount of time, even if small, makes a selected project far more likely to succeed."
                >
                  <Textarea rows={3} value={values.readinessContact} onChange={set("readinessContact")} />
                </Field>
                <Field
                  label={ASK.readinessOwner}
                  hint="It is fine if this is the same person, or if you are not sure yet."
                >
                  <Textarea rows={3} value={values.readinessOwner} onChange={set("readinessOwner")} />
                </Field>
                <Field
                  label={ASK.readinessTiming}
                  hint="A funding round, a season, an event, or a system being switched off. Optional."
                >
                  <Textarea rows={2} value={values.readinessTiming} onChange={set("readinessTiming")} />
                </Field>
                <Field label={ASK.readinessAnythingElse} hint="Optional.">
                  <Textarea
                    rows={3}
                    value={values.readinessAnythingElse}
                    onChange={set("readinessAnythingElse")}
                  />
                </Field>
              </>
            ) : null}

            {step === 5 ? (
              <>
                <Note>By submitting this application, I confirm that:</Note>
                <CaretList items={DECLARATION_STATEMENTS} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label={ASK.declarationName} required error={issueFor("declarationName")}>
                    <Input
                      autoComplete="name"
                      value={values.declarationName}
                      onChange={set("declarationName")}
                    />
                  </Field>
                  <Field label={ASK.declarationRole}>
                    <Input
                      autoComplete="organization-title"
                      value={values.declarationRole}
                      onChange={set("declarationRole")}
                    />
                  </Field>
                </div>
                <Checkbox
                  checked={declared}
                  onChange={(e) => {
                    setDeclared(e.target.checked);
                    if (e.target.checked) {
                      setIssues((prev) => prev.filter((issue) => issue.field !== "declared"));
                    }
                  }}
                  label="I confirm the statements above on behalf of my organisation"
                />
                {issueFor("declared") ? <FormAlert>{issueFor("declared")}</FormAlert> : null}

                <Note muted>
                  Startup Queenstown Lakes holds this information on behalf of the programme,
                  and the selection panel reads it to assess applications. It is stored in
                  Google Workspace in the United States. You can ask to see or correct it at
                  any time. See the{" "}
                  <a href="/privacy" className="ctl-link-grow text-ink underline">
                    privacy notice
                  </a>
                  .
                </Note>
              </>
            ) : null}

            <Honeypot id="ctl-website" value={honeypot} onChange={setHoneypot} />

            {formError ? <FormAlert>{formError}</FormAlert> : null}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {step > 0 ? (
                <Button variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))}>
                  Back
                </Button>
              ) : null}

              {last ? (
                /* Not disabled on incomplete answers, deliberately. A dead button
                   explains nothing; clicking this runs the client-side pass, which
                   jumps to the first problem and says what it is. Disabled remains
                   only for states a user cannot fix from here: mid-send, or the
                   window not being open. */
                <Button
                  variant="primary"
                  size="lg"
                  disabled={sending || !canSubmit}
                  onClick={submit}
                >
                  {sending ? "Sending" : "Send my application"}
                </Button>
              ) : (
                <Button variant="secondary" onClick={next}>
                  Next: {SECTIONS[step + 1].label.toLowerCase()}
                </Button>
              )}
              {/* No "Section N of 6" here any more. The rail states it at lg and
                  the sticky bar states it below, both permanently. */}
            </div>

            {last && !canSubmit ? (
              <Note muted>
                Applications open on 15 August. You can fill this in now and it will be saved
                on this device.
              </Note>
            ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Which section each field lives in, so a server error can jump the user to it. */
const SECTION_FOR_FIELD: Record<string, number> = {
  orgName: 0,
  legalStructure: 0,
  registrationNumber: 0,
  contactName: 0,
  contactRole: 0,
  contactEmail: 0,
  contactPhone: 0,
  basedIn: 0,
  orgSize: 0,
  gates: 1,
  problem: 2,
  problemToday: 2,
  problemWho: 2,
  problemSuccess: 2,
  scopeEssentials: 3,
  scopeReuse: 3,
  scopeSystems: 3,
  scopeSystemsWhich: 3,
  scopeSensitive: 3,
  scopeSensitiveWhat: 3,
  readinessContact: 4,
  readinessOwner: 4,
  readinessTiming: 4,
  readinessAnythingElse: 4,
  declarationName: 5,
  declarationRole: 5,
  declared: 5,
};
