import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clueState } from "./helpers";
import type { CrosswordClue } from "@/lib/crossword-puzzles";

const solution = [
  ["C", "A", "T", null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
  [null, null, null, null, null],
];
const clue: CrosswordClue = { number: 1, clue: "Pet", answer: "CAT", row: 0, col: 0, length: 3 };
const grid = (row: string[]) => [row, ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""]];

describe("clueState", () => {
  it("is empty while any square is blank", () => {
    assert.equal(clueState(clue, "across", grid(["C", "A", "", "", ""]), solution), "empty");
  });
  it("is correct only when every letter matches (case-insensitive)", () => {
    assert.equal(clueState(clue, "across", grid(["c", "A", "T", "", ""]), solution), "correct");
  });
  it("is wrong when filled with a mismatch", () => {
    assert.equal(clueState(clue, "across", grid(["C", "A", "R", "", ""]), solution), "wrong");
  });
});
