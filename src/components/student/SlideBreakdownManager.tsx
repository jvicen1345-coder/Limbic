"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generateSlideBreakdown } from "@/app/actions/slide-breakdown";

export interface SlideBreakdownCourse {
  id: string;
  courseCode: string;
  courseName: string;
}

/** Paste-text form for /student/slides (see that page's own doc comment) — picks an
 *  existing course rather than letting one be created here, since a flashcard/note has to
 *  belong to a course and Assignments (see components/student/SyllabiManager.tsx) already
 *  owns "add a new course." Result is a plain summary + a link into Study Guide, not an
 *  inline preview of the generated cards — the Flashcards/Self-Quiz/Visual Aids tabs there
 *  are already the review surface, no need to duplicate it here. */
export function SlideBreakdownManager({ courses }: { courses: SlideBreakdownCourse[] }) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ cardsCreated: number; notesUpdated: boolean; courseCode: string } | null>(null);

  if (courses.length === 0) {
    return (
      <p className="atrium-dashboard-empty">
        Add a course in <Link href="/student/assignments">Assignments</Link> first — Slide Breakdown adds flashcards and notes to an
        existing course&rsquo;s Study Guide section.
      </p>
    );
  }

  function handleSubmit() {
    setError(null);
    setResult(null);
    if (!text.trim()) {
      setError("Paste your slide text first.");
      return;
    }
    startTransition(async () => {
      const res = await generateSlideBreakdown(courseId, text);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      const course = courses.find((c) => c.id === courseId);
      setResult({ cardsCreated: res.cardsCreated, notesUpdated: res.notesUpdated, courseCode: course?.courseCode ?? "" });
      setText("");
    });
  }

  return (
    <div>
      <div className="field">
        <label htmlFor="slide-course">Course</label>
        <select id="slide-course" className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.courseCode} — {c.courseName}
            </option>
          ))}
        </select>
      </div>

      <div className="field" style={{ marginTop: 14 }}>
        <label htmlFor="slide-text">Slide Text</label>
        <textarea
          id="slide-text"
          className="input"
          style={{ minHeight: 220 }}
          placeholder="Paste the text from this lecture's slides here."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {error && <p className="syllabi-error">{error}</p>}

      {result && (
        <div className="slide-breakdown-result">
          Added {result.cardsCreated} flashcard{result.cardsCreated === 1 ? "" : "s"}
          {result.notesUpdated ? " and updated Visual Aids notes" : ""} for {result.courseCode}.{" "}
          <Link href="/student/study-guide">Open Study Guide →</Link>
        </div>
      )}

      <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleSubmit} disabled={pending}>
        {pending ? "Reading your slides…" : "Break Down Slides with Limbic AI"}
      </button>
    </div>
  );
}
