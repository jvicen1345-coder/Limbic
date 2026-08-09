"use client";

import { useState, useTransition, type FormEvent } from "react";
import { joinWaitlistAction } from "@/app/actions/founding-funders";

/** Section 5's "coming soon" state (see FOUNDING_FUNDERS_OPEN) — collects an email into
 *  FoundingFunderWaitlist and swaps to a confirmation message on success, updating the
 *  "X people are already waiting" count inline rather than requiring a page reload. */
export function WaitlistForm({ initialCount }: { initialCount: number }) {
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(initialCount);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await joinWaitlistAction(email);
      setCount(result.waitlistCount);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Something went wrong — try again.");
      }
    });
  };

  if (submitted) {
    return (
      <div>
        <p className="ff-waitlist-confirmation">You&rsquo;re on the list.</p>
        <p className="ff-cta-count">
          {count} {count === 1 ? "person is" : "people are"} already waiting.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form className="ff-waitlist-form" onSubmit={onSubmit}>
        <input
          type="email"
          required
          className="ff-waitlist-input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          aria-label="Email address"
        />
        <button type="submit" className="ff-waitlist-button" disabled={pending}>
          {pending ? "Joining…" : "Notify Me"}
        </button>
      </form>
      {error && <p className="ff-waitlist-error">{error}</p>}
      <p className="ff-cta-count">
        {count} {count === 1 ? "person is" : "people are"} already waiting.
      </p>
    </div>
  );
}
