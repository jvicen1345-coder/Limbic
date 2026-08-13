"use client";

import { useState, useTransition, type FormEvent } from "react";
import { submitVisitRequest } from "@/app/actions/connexion";

/** The Connexion Method's "Schedule Your Visit" section — the same dark CTA card + form
 *  embedded on /connexion and /connexion/delia (replaces the old email-only
 *  ConnexionWaitlistForm everywhere it appeared). /connexion/afit and /connexion/safety-score
 *  both link out to this instead of embedding their own copy. Renders the full section —
 *  heading, body, form, disclaimer — not just the form, so every page that wants "Schedule
 *  Your Visit" gets an identical, self-contained block. The `id="schedule"` anchor is what
 *  /connexion/afit's "Schedule Your Assessment" button targets via `/connexion#schedule`. */
export function ConnexionScheduleSection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canSubmit = name.trim().length > 0 && phone.trim().length > 0 && email.trim().length > 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      const result = await submitVisitRequest({ name, phone, email, preferredDate, preferredTime, message });
      if (result.ok) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Something went wrong, try again.");
      }
    });
  };

  return (
    <div className="connexion-cta-card" id="schedule">
      <div className="connexion-cta-title">Schedule Your Visit</div>
      <p className="connexion-cta-body">
        Book a home safety assessment with Delia Vicencio, PT, DPT, serving Orange County, California. A licensed
        physical therapist with 30 years of home health experience comes to you.
      </p>

      {submitted ? (
        <p className="connexion-visit-confirmation">
          Your request has been received. Delia will be in touch within 24 hours to confirm your visit.
        </p>
      ) : (
        <form className="connexion-visit-form" onSubmit={onSubmit}>
          <div className="connexion-visit-field">
            <label htmlFor="connexion-visit-name">Full name</label>
            <input
              id="connexion-visit-name"
              className="connexion-visit-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={pending}
            />
          </div>
          <div className="connexion-visit-field">
            <label htmlFor="connexion-visit-phone">Phone number</label>
            <input
              id="connexion-visit-phone"
              type="tel"
              className="connexion-visit-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              disabled={pending}
            />
          </div>
          <div className="connexion-visit-field">
            <label htmlFor="connexion-visit-email">Email address</label>
            <input
              id="connexion-visit-email"
              type="email"
              className="connexion-visit-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={pending}
            />
          </div>
          <div className="connexion-visit-field-row">
            <div className="connexion-visit-field">
              <div className="connexion-visit-field-label-row">
                <label htmlFor="connexion-visit-date">Preferred date</label>
                {preferredDate && (
                  <button
                    type="button"
                    className="connexion-visit-clear-btn"
                    onClick={() => setPreferredDate("")}
                    disabled={pending}
                  >
                    Clear
                  </button>
                )}
              </div>
              <input
                id="connexion-visit-date"
                type="date"
                className="connexion-visit-input"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="connexion-visit-field">
              <label htmlFor="connexion-visit-time">Preferred time</label>
              <select
                id="connexion-visit-time"
                className="connexion-visit-input"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                disabled={pending}
              >
                <option value="">No preference</option>
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
          </div>
          <div className="connexion-visit-field">
            <label htmlFor="connexion-visit-message">Brief message</label>
            <textarea
              id="connexion-visit-message"
              className="connexion-visit-input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us a little about what you're looking for..."
              disabled={pending}
            />
          </div>

          {error && <p className="connexion-visit-error">{error}</p>}

          <button type="submit" className="connexion-visit-button" disabled={pending || !canSubmit}>
            {pending ? "Sending…" : "Request Your Visit"}
          </button>
        </form>
      )}

      <p className="connexion-cta-fineprint">
        Serving Orange County, California. In-home visits only. Assessment fee: $150–250.
      </p>
    </div>
  );
}
