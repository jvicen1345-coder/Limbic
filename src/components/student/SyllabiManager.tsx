"use client";

import { useState, useTransition } from "react";
import {
  getSyllabi,
  createSyllabus,
  deleteSyllabus,
  parseSyllabusFromText,
  addManualAssignment,
  updateAssignment,
  deleteAssignment,
  getSyllabusAssignments,
  updateSyllabusMeetingPattern,
  type SyllabusWithCount,
} from "@/app/actions/syllabus";
import { TrashIcon, ChevronRightIcon } from "@/components/icons";

const CATEGORIES = ["Exam", "Quiz", "Assignment", "Lab Practical", "Paper", "Presentation", "Clinical", "Other"] as const;
// Mon-first for display (this app's week always starts Monday, see getThisWeekDateRange) —
// MEETING_DAY_CODES (lib/calendar-events.ts) itself stays Sunday-first to match
// Date.getDay(), see that constant's own comment.
const MEETING_DAYS_DISPLAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** "Meets Mon 10:00 AM-10:50 AM, Fri 8:30 AM-9:20 AM" — the same class can meet at a
 *  different time on different days (see Syllabus.meetingTimes in prisma/schema.prisma), so
 *  each day gets its own optional time instead of one shared string. A day with no time in
 *  `times` just shows its name with nothing after it. */
function formatMeetingSchedule(days: string[], times: Record<string, string> | null): string {
  return MEETING_DAYS_DISPLAY_ORDER.filter((d) => days.includes(d))
    .map((day) => (times?.[day] ? `${day} ${times[day]}` : day))
    .join(", ");
}

/** One time input per selected meeting day — shared between the "Add Manually" new-course
 *  fields and the per-card editor below, which otherwise only differ in which state setter
 *  they call. */
function MeetingTimeFields({
  days,
  times,
  onChangeTime,
}: {
  days: string[];
  times: Record<string, string>;
  onChangeTime: (day: string, value: string) => void;
}) {
  if (days.length === 0) return null;
  return (
    <div className="syllabi-meeting-times">
      {MEETING_DAYS_DISPLAY_ORDER.filter((d) => days.includes(d)).map((day) => (
        <div key={day} className="syllabi-meeting-time-row">
          <span className="syllabi-meeting-time-day">{day}</span>
          <input
            className="input syllabi-meeting-time-input"
            type="text"
            placeholder="Time (optional), e.g. 10:00-10:50 AM"
            value={times[day] ?? ""}
            onChange={(e) => onChangeTime(day, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

interface ReviewRow {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  courseCode: string;
  courseName: string;
}

interface AssignmentRow {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  completed: boolean;
}

/** Client-side add/manage UI for the syllabus tracker — see app/(app)/student/assignments/
 *  page.tsx (server gate + initial fetch) and app/actions/syllabus.ts (every mutation
 *  below). Assignments returned by parseSyllabusFromText are already persisted (see that
 *  action's own docstring) — the review table below is an edit-after-save step, not a
 *  staging area, so "Cancel" deletes what parsing just created rather than merely closing
 *  a draft. */
export function SyllabiManager({
  initialSyllabi,
  defaultTrimester,
  defaultYear,
}: {
  initialSyllabi: SyllabusWithCount[];
  defaultTrimester: number;
  defaultYear: number;
}) {
  const [syllabi, setSyllabi] = useState(initialSyllabi);
  const [addTab, setAddTab] = useState<"upload" | "manual">("upload");
  const [pending, startTransition] = useTransition();

  async function refreshSyllabi() {
    setSyllabi(await getSyllabi());
  }

  // --- Upload Syllabus Text tab ---
  const [courseCode, setCourseCode] = useState("");
  const [courseName, setCourseName] = useState("");
  const [trimester, setTrimester] = useState(defaultTrimester);
  const [year, setYear] = useState(defaultYear);
  const [syllabusText, setSyllabusText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [review, setReview] = useState<{ syllabusId: string; rows: ReviewRow[] } | null>(null);
  const [newRow, setNewRow] = useState({ title: "", dueDate: "", category: "Assignment" });
  const [parsedMeeting, setParsedMeeting] = useState<{ days: string[]; times: Record<string, string> | null } | null>(null);

  function handleParse() {
    setParseError(null);
    if (!courseCode.trim() || !courseName.trim() || !syllabusText.trim()) {
      setParseError("Course code, course name, and syllabus text are all required.");
      return;
    }
    startTransition(async () => {
      const created = await createSyllabus(courseCode, courseName, trimester, year);
      if ("error" in created) {
        setParseError(created.error);
        return;
      }
      if (!created.syllabus) {
        setParseError("Could not create this syllabus.");
        return;
      }
      const parsed = await parseSyllabusFromText(created.syllabus.id, syllabusText);
      if ("error" in parsed) {
        setParseError(parsed.error);
        await refreshSyllabi();
        return;
      }
      setReview({
        syllabusId: created.syllabus.id,
        rows: parsed.assignments.map((a) => ({
          id: a.id,
          title: a.title,
          dueDate: a.dueDate,
          category: a.category,
          courseCode: a.courseCode,
          courseName: a.courseName,
        })),
      });
      setParsedMeeting(parsed.meetingDays ? { days: parsed.meetingDays, times: parsed.meetingTimes } : null);
      await refreshSyllabi();
    });
  }

  function updateReviewRow(id: string, field: "title" | "dueDate" | "category", value: string) {
    setReview((prev) => (prev ? { ...prev, rows: prev.rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)) } : prev));
  }

  function handleDeleteReviewRow(id: string) {
    startTransition(async () => {
      await deleteAssignment(id);
      setReview((prev) => (prev ? { ...prev, rows: prev.rows.filter((r) => r.id !== id) } : prev));
      await refreshSyllabi();
    });
  }

  function handleAddAnotherRow() {
    if (!review || !newRow.title.trim() || !newRow.dueDate.trim()) return;
    startTransition(async () => {
      const result = await addManualAssignment(review.syllabusId, newRow.title, newRow.dueDate, newRow.category);
      if ("error" in result || !result.assignment) return;
      setReview((prev) =>
        prev
          ? {
              ...prev,
              rows: [
                ...prev.rows,
                {
                  id: result.assignment.id,
                  title: result.assignment.title,
                  dueDate: result.assignment.dueDate,
                  category: result.assignment.category,
                  courseCode: result.assignment.courseCode,
                  courseName: result.assignment.courseName,
                },
              ],
            }
          : prev
      );
      setNewRow({ title: "", dueDate: "", category: "Assignment" });
      await refreshSyllabi();
    });
  }

  function handleSaveAll() {
    if (!review) return;
    startTransition(async () => {
      await Promise.all(review.rows.map((r) => updateAssignment(r.id, r.title, r.dueDate, r.category)));
      setReview(null);
      setParsedMeeting(null);
      setCourseCode("");
      setCourseName("");
      setSyllabusText("");
      await refreshSyllabi();
    });
  }

  function handleCancelReview() {
    if (!review) return;
    startTransition(async () => {
      await Promise.all(review.rows.map((r) => deleteAssignment(r.id)));
      await deleteSyllabus(review.syllabusId);
      setReview(null);
      setParsedMeeting(null);
      await refreshSyllabi();
    });
  }

  // --- Add Manually tab ---
  const NEW_COURSE = "__new__";
  const [manualSyllabusId, setManualSyllabusId] = useState<string>(syllabi[0]?.id ?? NEW_COURSE);
  const [manualNewCode, setManualNewCode] = useState("");
  const [manualNewName, setManualNewName] = useState("");
  // Optional — set right when a new course is created, instead of the extra "save, then find
  // the card below, then click Edit" round trip that was the only way to do this before (see
  // the per-card editor further down, still there for correcting/removing a pattern later).
  const [manualMeetingDays, setManualMeetingDays] = useState<string[]>([]);
  const [manualMeetingTimes, setManualMeetingTimes] = useState<Record<string, string>>({});
  const [manualTitle, setManualTitle] = useState("");
  const [manualDueDate, setManualDueDate] = useState("");
  const [manualCategory, setManualCategory] = useState<string>(CATEGORIES[1]);
  const [manualError, setManualError] = useState<string | null>(null);

  function toggleManualMeetingDay(day: string) {
    setManualMeetingDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function handleManualSave() {
    setManualError(null);
    if (!manualTitle.trim() || !manualDueDate.trim()) {
      setManualError("Assignment title and due date are required.");
      return;
    }
    startTransition(async () => {
      let syllabusId = manualSyllabusId;
      if (syllabusId === NEW_COURSE || !syllabusId) {
        if (!manualNewCode.trim() || !manualNewName.trim()) {
          setManualError("New course code and course name are required.");
          return;
        }
        const created = await createSyllabus(manualNewCode, manualNewName, defaultTrimester, defaultYear);
        if ("error" in created) {
          setManualError(created.error);
          return;
        }
        if (!created.syllabus) {
          setManualError("Could not create this course.");
          return;
        }
        syllabusId = created.syllabus.id;
        if (manualMeetingDays.length > 0) {
          await updateSyllabusMeetingPattern(syllabusId, manualMeetingDays, manualMeetingTimes);
        }
      }
      const result = await addManualAssignment(syllabusId, manualTitle, manualDueDate, manualCategory);
      if ("error" in result) {
        setManualError(result.error);
        return;
      }
      setManualTitle("");
      setManualDueDate("");
      setManualCategory(CATEGORIES[1]);
      setManualMeetingDays([]);
      setManualMeetingTimes({});
      setManualSyllabusId(syllabusId);
      setManualNewCode("");
      setManualNewName("");
      await refreshSyllabi();
    });
  }

  // --- Existing syllabi list ---
  // Uncontrolled <details> (same pattern as components/ProgramTimelineSection.tsx's rotation
  // blocks) — the browser owns open/closed state, onToggle is only used to lazy-fetch this
  // syllabus's assignments the first time it's opened. The table itself renders whenever
  // assignmentsById has an entry, whether or not <details> is currently open — it's just
  // native-CSS-hidden while closed, so there's nothing to control here.
  const [assignmentsById, setAssignmentsById] = useState<Record<string, AssignmentRow[]>>({});

  function handleToggle(id: string, e: React.SyntheticEvent<HTMLDetailsElement>) {
    if (e.currentTarget.open && !assignmentsById[id]) {
      startTransition(async () => {
        const rows = await getSyllabusAssignments(id);
        setAssignmentsById((prev) => ({ ...prev, [id]: rows }));
      });
    }
  }

  // --- Meeting pattern editor (powers the Atrium's Class Schedule strip — see
  // AtriumWeekSchedule.tsx) — parseSyllabusFromText already sets this from the AI parse when
  // it can find a clear pattern, but plenty of syllabi don't state one in a parseable line,
  // and a manually-added course never runs the AI parse at all. This is the fallback: set or
  // correct it by hand, right on the syllabus card.
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [meetingDaysDraft, setMeetingDaysDraft] = useState<string[]>([]);
  const [meetingTimesDraft, setMeetingTimesDraft] = useState<Record<string, string>>({});

  function openMeetingEditor(s: SyllabusWithCount) {
    setEditingMeetingId(s.id);
    setMeetingDaysDraft(s.meetingDays ?? []);
    setMeetingTimesDraft(s.meetingTimes ?? {});
  }

  function toggleMeetingDay(day: string) {
    setMeetingDaysDraft((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  function handleSaveMeetingPattern(syllabusId: string) {
    startTransition(async () => {
      await updateSyllabusMeetingPattern(syllabusId, meetingDaysDraft, meetingTimesDraft);
      setEditingMeetingId(null);
      await refreshSyllabi();
    });
  }

  function handleDeleteSyllabus(id: string, label: string) {
    if (!window.confirm(`Delete ${label} and all its assignments? This can't be undone.`)) return;
    startTransition(async () => {
      await deleteSyllabus(id);
      setSyllabi((prev) => prev.filter((s) => s.id !== id));
    });
  }

  return (
    <div>
      <div className="syllabi-add-section">
        <div className="syllabi-add-tabs">
          <button
            type="button"
            className={addTab === "upload" ? "syllabi-add-tab syllabi-add-tab--active" : "syllabi-add-tab"}
            onClick={() => setAddTab("upload")}
          >
            Upload Syllabus Text
          </button>
          <button
            type="button"
            className={addTab === "manual" ? "syllabi-add-tab syllabi-add-tab--active" : "syllabi-add-tab"}
            onClick={() => setAddTab("manual")}
          >
            Add Manually
          </button>
        </div>

        {addTab === "upload" ? (
          <div className="syllabi-add-panel">
            {!review ? (
              <>
                <div className="syllabi-form-grid">
                  <div className="field">
                    <label htmlFor="syllabus-course-code">Course Code</label>
                    <input
                      id="syllabus-course-code"
                      className="input"
                      type="text"
                      placeholder="e.g. PT 638A"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="syllabus-course-name">Course Name</label>
                    <input
                      id="syllabus-course-name"
                      className="input"
                      type="text"
                      placeholder="e.g. Musculoskeletal Practice Management II"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="syllabus-trimester">Trimester</label>
                    <input
                      id="syllabus-trimester"
                      className="input"
                      type="number"
                      min={1}
                      max={9}
                      value={trimester}
                      onChange={(e) => setTrimester(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="syllabus-year">Year</label>
                    <input
                      id="syllabus-year"
                      className="input"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="field" style={{ marginTop: 14 }}>
                  <label htmlFor="syllabus-text">Syllabus Text</label>
                  <textarea
                    id="syllabus-text"
                    className="input"
                    style={{ minHeight: 200 }}
                    placeholder="Paste your full syllabus text here. Include all assignment names, due dates, and exam schedules."
                    value={syllabusText}
                    onChange={(e) => setSyllabusText(e.target.value)}
                  />
                </div>
                {parseError && <p className="syllabi-error">{parseError}</p>}
                <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleParse} disabled={pending}>
                  {pending ? "Reading your syllabus..." : "Parse Syllabus with Limbic AI"}
                </button>
              </>
            ) : (
              <div className="syllabi-review">
                <p className="syllabi-review-title">
                  {review.rows.length} assignment{review.rows.length === 1 ? "" : "s"} found — review before saving
                </p>
                {parsedMeeting && (
                  <p className="syllabi-review-meeting">
                    Also found a class schedule: meets {formatMeetingSchedule(parsedMeeting.days, parsedMeeting.times)} — it&rsquo;ll show up on
                    your Atrium&rsquo;s Class Schedule. Edit it below anytime.
                  </p>
                )}
                <div className="syllabi-review-table-wrap">
                  <table className="syllabi-review-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Due Date</th>
                        <th>Category</th>
                        <th>Course</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {review.rows.map((row) => (
                        <tr key={row.id}>
                          <td>
                            <input
                              className="input"
                              type="text"
                              value={row.title}
                              onChange={(e) => updateReviewRow(row.id, "title", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="input"
                              type="date"
                              value={row.dueDate}
                              onChange={(e) => updateReviewRow(row.id, "dueDate", e.target.value)}
                            />
                          </td>
                          <td>
                            <select
                              className="input"
                              value={row.category}
                              onChange={(e) => updateReviewRow(row.id, "category", e.target.value)}
                            >
                              {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="syllabi-review-course">{row.courseCode}</td>
                          <td>
                            <button
                              type="button"
                              className="syllabi-row-delete"
                              onClick={() => handleDeleteReviewRow(row.id)}
                              aria-label="Remove this assignment"
                            >
                              <TrashIcon size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td>
                          <input
                            className="input"
                            type="text"
                            placeholder="Add a missed assignment"
                            value={newRow.title}
                            onChange={(e) => setNewRow((r) => ({ ...r, title: e.target.value }))}
                          />
                        </td>
                        <td>
                          <input
                            className="input"
                            type="date"
                            value={newRow.dueDate}
                            onChange={(e) => setNewRow((r) => ({ ...r, dueDate: e.target.value }))}
                          />
                        </td>
                        <td>
                          <select
                            className="input"
                            value={newRow.category}
                            onChange={(e) => setNewRow((r) => ({ ...r, category: e.target.value }))}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td colSpan={2}>
                          <button type="button" className="btn btn-secondary" onClick={handleAddAnotherRow} disabled={pending}>
                            Add another
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="syllabi-review-actions">
                  <button type="button" className="btn btn-primary" onClick={handleSaveAll} disabled={pending}>
                    Save All
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCancelReview} disabled={pending}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="syllabi-add-panel">
            <div className="syllabi-form-grid">
              <div className="field">
                <label htmlFor="manual-course">Course Code</label>
                <select id="manual-course" className="input" value={manualSyllabusId} onChange={(e) => setManualSyllabusId(e.target.value)}>
                  {syllabi.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.courseCode} — {s.courseName}
                    </option>
                  ))}
                  <option value={NEW_COURSE}>+ New course</option>
                </select>
              </div>
              {manualSyllabusId === NEW_COURSE && (
                <>
                  <div className="field">
                    <label htmlFor="manual-new-code">New Course Code</label>
                    <input
                      id="manual-new-code"
                      className="input"
                      type="text"
                      placeholder="e.g. PT 638A"
                      value={manualNewCode}
                      onChange={(e) => setManualNewCode(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="manual-new-name">New Course Name</label>
                    <input
                      id="manual-new-name"
                      className="input"
                      type="text"
                      placeholder="e.g. Musculoskeletal Practice Management II"
                      value={manualNewName}
                      onChange={(e) => setManualNewName(e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label>Class meets each week (optional)</label>
                    <div className="syllabi-meeting-days">
                      {MEETING_DAYS_DISPLAY_ORDER.map((day) => (
                        <label
                          key={day}
                          className={manualMeetingDays.includes(day) ? "syllabi-meeting-day syllabi-meeting-day--on" : "syllabi-meeting-day"}
                        >
                          <input type="checkbox" checked={manualMeetingDays.includes(day)} onChange={() => toggleManualMeetingDay(day)} />
                          {day}
                        </label>
                      ))}
                    </div>
                    <MeetingTimeFields
                      days={manualMeetingDays}
                      times={manualMeetingTimes}
                      onChangeTime={(day, value) => setManualMeetingTimes((prev) => ({ ...prev, [day]: value }))}
                    />
                  </div>
                </>
              )}
              <div className="field">
                <label htmlFor="manual-title">Assignment Title</label>
                <input
                  id="manual-title"
                  className="input"
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="manual-due-date">Due Date</label>
                <input id="manual-due-date" className="input" type="date" value={manualDueDate} onChange={(e) => setManualDueDate(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="manual-category">Category</label>
                <select id="manual-category" className="input" value={manualCategory} onChange={(e) => setManualCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {manualError && <p className="syllabi-error">{manualError}</p>}
            <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleManualSave} disabled={pending}>
              Save
            </button>
          </div>
        )}
      </div>

      <div className="syllabi-list">
        <div className="atrium-section-label" style={{ marginTop: 28, marginBottom: 12 }}>
          My Syllabi
        </div>
        {syllabi.length === 0 ? (
          <p className="atrium-dashboard-empty">No syllabi uploaded yet — add one above to start tracking assignments.</p>
        ) : (
          syllabi.map((s) => (
            <div key={s.id}>
            <details className="syllabi-card" onToggle={(e) => handleToggle(s.id, e)}>
              <summary className="pro-accordion-summary syllabi-card-summary">
                <div>
                  <div className="syllabi-card-title">
                    {s.courseCode} — {s.courseName}
                  </div>
                  <div className="syllabi-card-meta">
                    Trimester {s.trimester} · {s.year} · {s.assignmentCount} assignment{s.assignmentCount === 1 ? "" : "s"}
                  </div>
                  <div className={s.meetingDays && s.meetingDays.length > 0 ? "syllabi-card-meeting" : "syllabi-card-meeting syllabi-card-meeting--unset"}>
                    <span>{s.meetingDays && s.meetingDays.length > 0 ? `Meets ${formatMeetingSchedule(s.meetingDays, s.meetingTimes)}` : "No class meeting time set"}</span>
                    <button
                      type="button"
                      className="syllabi-meeting-edit-link"
                      onClick={(e) => {
                        // Same preventDefault as the Delete button above — the editor renders
                        // as a sibling of <details> below (not inside .pro-accordion-content),
                        // so it doesn't need the accordion open to be visible.
                        e.preventDefault();
                        openMeetingEditor(s);
                      }}
                    >
                      {s.meetingDays && s.meetingDays.length > 0 ? "Edit" : "+ Set schedule"}
                    </button>
                  </div>
                </div>
                <div className="syllabi-card-actions">
                  <button
                    type="button"
                    className="syllabi-delete-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteSyllabus(s.id, `${s.courseCode} — ${s.courseName}`);
                    }}
                  >
                    Delete
                  </button>
                  <ChevronRightIcon size={16} className="pro-accordion-chevron" />
                </div>
              </summary>
              <div className="pro-accordion-content">
                {!assignmentsById[s.id] ? (
                  <p className="atrium-dashboard-empty">Loading…</p>
                ) : assignmentsById[s.id].length === 0 ? (
                  <p className="atrium-dashboard-empty">No assignments yet for this course.</p>
                ) : (
                  <table className="syllabi-review-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Due Date</th>
                        <th>Category</th>
                        <th>Done</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignmentsById[s.id].map((a) => (
                        <tr key={a.id}>
                          <td style={a.completed ? { textDecoration: "line-through", color: "var(--color-neutral-700)" } : undefined}>
                            {a.title}
                          </td>
                          <td>{a.dueDate}</td>
                          <td>{a.category}</td>
                          <td>{a.completed ? "Yes" : "No"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </details>
            {editingMeetingId === s.id && (
              <div className="syllabi-meeting-form">
                <div className="syllabi-meeting-days">
                  {MEETING_DAYS_DISPLAY_ORDER.map((day) => (
                    <label
                      key={day}
                      className={meetingDaysDraft.includes(day) ? "syllabi-meeting-day syllabi-meeting-day--on" : "syllabi-meeting-day"}
                    >
                      <input type="checkbox" checked={meetingDaysDraft.includes(day)} onChange={() => toggleMeetingDay(day)} />
                      {day}
                    </label>
                  ))}
                </div>
                <MeetingTimeFields
                  days={meetingDaysDraft}
                  times={meetingTimesDraft}
                  onChangeTime={(day, value) => setMeetingTimesDraft((prev) => ({ ...prev, [day]: value }))}
                />
                <div className="syllabi-meeting-form-actions">
                  <button type="button" className="btn btn-primary" onClick={() => handleSaveMeetingPattern(s.id)} disabled={pending}>
                    Save
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingMeetingId(null)} disabled={pending}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
