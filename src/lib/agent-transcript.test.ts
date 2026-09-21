import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appendNodeTurn, questionEchoTurn, QUESTION_TURN_ID } from "./agent-transcript";

describe("agent transcript", () => {
  it("echoes the trimmed question as the opening turn", () => {
    const turn = questionEchoTurn("  lateral ankle sprain  ");
    assert.deepEqual(turn, { nodeId: QUESTION_TURN_ID, label: "lateral ankle sprain", detail: "" });
  });

  it("appends a node's label and existing detail, in selection order", () => {
    const echoed = [questionEchoTurn("knee pain")];
    const withSubjective = appendNodeTurn(echoed, {
      id: "r1-0",
      label: "Subjective Findings",
      detail: "History and reported symptom pattern.",
    });
    const withObjective = appendNodeTurn(withSubjective, {
      id: "r1-1",
      label: "Objective Tests",
      detail: "Special tests and functional measures.",
    });
    assert.deepEqual(
      withObjective.map((turn) => turn.nodeId),
      [QUESTION_TURN_ID, "r1-0", "r1-1"],
    );
    assert.equal(withObjective[1]?.label, "Subjective Findings");
    assert.equal(withObjective[1]?.detail, "History and reported symptom pattern.");
  });

  it("does not duplicate a node that was already read", () => {
    const once = appendNodeTurn([questionEchoTurn("knee pain")], {
      id: "r1-0",
      label: "Subjective Findings",
      detail: "History and reported symptom pattern.",
    });
    const twice = appendNodeTurn(once, {
      id: "r1-0",
      label: "Subjective Findings",
      detail: "History and reported symptom pattern.",
    });
    assert.equal(twice, once);
    assert.equal(twice.length, 2);
  });

  it("ignores a node with no reasoning", () => {
    const echoed = [questionEchoTurn("knee pain")];
    const next = appendNodeTurn(echoed, { id: "center", label: "Limbic Agent" });
    assert.equal(next, echoed);
  });

  it("does not append the center when its detail is the question already echoed", () => {
    const echoed = [questionEchoTurn("knee pain after a mileage spike")];
    const next = appendNodeTurn(echoed, {
      id: "center",
      label: "Runner's knee pain",
      detail: "knee pain after a mileage spike",
    });
    assert.equal(next, echoed);
  });

  it("still appends a non-center node whose detail matches the question text", () => {
    const echoed = [questionEchoTurn("knee pain")];
    const next = appendNodeTurn(echoed, {
      id: "r1-2",
      label: "Same words",
      detail: "knee pain",
    });
    assert.equal(next.length, 2);
    assert.equal(next[1]?.nodeId, "r1-2");
  });
});
