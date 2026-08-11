"use client";

import { useState, useTransition, type FormEvent } from "react";
import { joinConnexionWaitlistAction } from "@/app/actions/connexion";

/** The Connexion Certified Provider waitlist form — same shape as
 *  components/founding-funders/WaitlistForm.tsx (collect an email, swap to a confirmation
 *  message on success), reused on both /connexion's bottom CTA and /connexion/safety-score's
 *  coming-soon state. */
export function ConnexionWaitlistForm({ initialCount }: { initialCount: number }) {
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(initialCount);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await joinConnexionWaitlistAction(email);
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
        <p className="connexion-waitlist-confirmation">You&rsquo;re on the list.</p>
        <p className="connexion-waitlist-count">
          {count} {count === 1 ? "person is" : "people are"} already waiting.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form className="connexion-waitlist-form" onSubmit={onSubmit}>
        <input
          type="email"
          required
          className="connexion-waitlist-input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={pending}
          aria-label="Email address"
        />
        <button type="submit" className="connexion-waitlist-button" disabled={pending}>
          {pending ? "Joining…" : "Join Waitlist"}
        </button>
      </form>
      {error && <p className="connexion-waitlist-error">{error}</p>}
      <p className="connexion-waitlist-count">
        {count} {count === 1 ? "person is" : "people are"} already waiting.
      </p>
    </div>
  );
}
