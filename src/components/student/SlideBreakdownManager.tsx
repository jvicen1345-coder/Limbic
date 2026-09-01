"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { generateSlideBreakdown, generateSlideBreakdownFromPdf } from "@/app/actions/slide-breakdown";

export interface SlideBreakdownCourse {
  id: string;
  courseCode: string;
  courseName: string;
}

type SlideResult = { cardsCreated: number; notesUpdated: boolean; courseCode: string };

/** PDF-upload form for /student/slides (see that page's own doc comment) — picks an
 *  existing course rather than letting one be created here, since a flashcard/note has to
 *  belong to a course and Assignments (see components/student/SyllabiManager.tsx) already
 *  owns "add a new course." Result is a plain summary + a link into Study Guide, not an
 *  inline preview of the generated cards — the Flashcards/Self-Quiz/Visual Aids tabs there
 *  are already the review surface, no need to duplicate it here.
 *  "The input for slide breakdown needs to be pdf" — PDF upload (see
 *  generateSlideBreakdownFromPdf, lib/pdf-text.ts) is the primary path now; pasting text is
 *  still here as a fallback for a scanned/image-only PDF (this app has no OCR) or a reader
 *  who already has the text copied some other way, toggled behind a link rather than shown
 *  as an equal second tab, since PDF upload is what was actually asked for. */
export function SlideBreakdownManager({ courses }: { courses: SlideBreakdownCourse[] }) {
  // Deliberately no default course — defaulting to courses[0] (or "whichever was last
  // selected") let a student upload one lecture's slides while the picker was still sitting
  // on a different course from a prior visit, silently merging that lecture's AI-extracted
  // notes into the wrong course's Study Guide (studyNotes is one appended blob per course,
  // see Syllabus.studyNotes in schema.prisma — there's no way to undo that after the fact
  // short of manually editing the merged text). Requiring an explicit choice every time
  // closes that off instead of relying on the student to notice and change a pre-filled value.
  const [courseId, setCourseId] = useState("");
  const [mode, setMode] = useState<"pdf" | "text">("pdf");
  const [fileName, setFileName] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SlideResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (courses.length === 0) {
    return (
      <p className="atrium-dashboard-empty">
        Add a course in <Link href="/student/assignments">Assignments</Link> first — Study Guide Creator adds flashcards and notes to
        an existing course&rsquo;s Study Guide.
      </p>
    );
  }

  function applyResult(course: SlideBreakdownCourse, res: { cardsCreated: number; notesUpdated: boolean }) {
    setResult({ cardsCreated: res.cardsCreated, notesUpdated: res.notesUpdated, courseCode: course.courseCode });
  }

  function handlePdfChosen() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    if (!courseId) {
      setError("Select a course first.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setError(null);
    setResult(null);
    setFileName(file.name);
    const course = courses.find((c) => c.id === courseId);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("syllabusId", courseId);
      formData.set("file", file);
      const res = await generateSlideBreakdownFromPdf(formData);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      if (course) applyResult(course, res);
      setFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  }

  function handleTextSubmit() {
    setError(null);
    setResult(null);
    if (!courseId) {
      setError("Select a course first.");
      return;
    }
    if (!text.trim()) {
      setError("Paste your slide text first.");
      return;
    }
    const course = courses.find((c) => c.id === courseId);
    startTransition(async () => {
      const res = await generateSlideBreakdown(courseId, text);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      if (course) applyResult(course, res);
      setText("");
    });
  }

  return (
    <div>
      <div className="field">
        <label htmlFor="slide-course">Course</label>
        <select id="slide-course" className="input" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="" disabled>
            Select a course…
          </option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.courseCode} — {c.courseName}
            </option>
          ))}
        </select>
      </div>

      {mode === "pdf" ? (
        <>
          <div className="slide-breakdown-dropzone" style={{ marginTop: 14 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handlePdfChosen}
              disabled={pending || !courseId}
              style={{ display: "none" }}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={pending || !courseId}
              onClick={() => fileInputRef.current?.click()}
            >
              {pending ? "Reading your slides…" : "Choose PDF"}
            </button>
            {fileName && <span className="slide-breakdown-filename">{fileName}</span>}
          </div>
          <button type="button" className="slide-breakdown-mode-link" onClick={() => setMode("text")}>
            Have text instead of a PDF? Paste it here.
          </button>
          {/* Lecture slides belong to whoever made them — usually the instructor or the
              school, not the student uploading them. A student copying them for their own
              study has a reasonable fair-use position; Limbic ingesting them, generating
              derivatives and storing them has a weaker one, and Limbic is who a university
              would write to. Saying plainly what may be uploaded is both the fair thing to
              tell a student and part of what makes the DMCA process at /dmca work: §512
              protects a host best when it has told users what they may post. */}
          <p className="slide-breakdown-upload-notice">
            Only upload material you created or are permitted to use, and check your school&rsquo;s policy before
            uploading a lecture. Slide text is sent to Anthropic to be turned into flashcards and notes, and the
            result is stored under your account &mdash; see the{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </>
      ) : (
        <>
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
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 4 }}
            onClick={handleTextSubmit}
            disabled={pending || !courseId}
          >
            {pending ? "Reading your slides…" : "Break Down Slides with Limbic AI"}
          </button>
          <button type="button" className="slide-breakdown-mode-link" onClick={() => setMode("pdf")}>
            Upload a PDF instead
          </button>
        </>
      )}

      {error && <p className="syllabi-error">{error}</p>}

      {result && (
        <div className="slide-breakdown-result">
          Added {result.cardsCreated} flashcard{result.cardsCreated === 1 ? "" : "s"}
          {result.notesUpdated ? " and updated Visual Aids notes" : ""} for {result.courseCode}.{" "}
          <Link href="/student/study-guide">Open Study Guide →</Link>
        </div>
      )}
    </div>
  );
}
