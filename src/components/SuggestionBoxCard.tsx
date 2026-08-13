"use client";

import { useState, useTransition } from "react";
import { submitSuggestionAction } from "@/app/actions/suggestions";
import { CheckIcon } from "@/components/icons";

export function SuggestionBoxCard() {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const result = await submitSuggestionAction(body);
      if (result.ok) {
        setBody("");
        setSent(true);
      } else {
        setError(result.error ?? "Something went wrong, try again.");
      }
    });
  };

  return (
    <div className="card elev-sm" style={{ marginBottom: 18 }}>
      <div className="card-kicker">Suggestion box</div>
      <p className="card-body" style={{ marginTop: 2 }}>
        Have an idea or some feedback for Limbic? Send it below: this is completely anonymous; nothing here is
        tied back to your account.
      </p>

      <div className="field" style={{ marginTop: 10 }}>
        <label htmlFor="suggestion-body">Your suggestion</label>
        <textarea
          className="input"
          id="suggestion-body"
          rows={4}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            setSent(false);
          }}
          placeholder="What should Limbic build or fix next?"
        />
      </div>

      {error && (
        <p style={{ fontSize: 12.5, color: "var(--color-danger)", margin: "4px 0 0" }}>{error}</p>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <button type="button" className="btn btn-primary" disabled={pending || !body.trim()} onClick={handleSubmit}>
          {pending ? "Sending…" : "Send Suggestion"}
        </button>
        {sent && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--color-success)" }}>
            <CheckIcon size={13} />
            Sent anonymously, thank you
          </span>
        )}
      </div>
    </div>
  );
}
