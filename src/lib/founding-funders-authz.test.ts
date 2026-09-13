import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { ADMIN_AREA_DESCRIPTIONS } from "./admin-areas";
import { shouldWriteIsProOnFoundingClaim } from "./founding-funders-authz";

/**
 * Founding Funders co-admin blast radius (#497).
 *
 * The all-users roster and the isPro write on claimFoundingSpotAction used to follow
 * hasAdminArea("foundingFunders"). Tightened: roster + Pro stay owner-only; the claim
 * action never writes isPro for the caller. Policy lives in a pure helper so these tests
 * do not need FOUNDING_FUNDERS_ADMIN_EMAILS; the source-gates pin the page and action.
 */

describe("shouldWriteIsProOnFoundingClaim (#497)", () => {
  it("lets an owner grant Pro when claiming someone else", () => {
    assert.equal(shouldWriteIsProOnFoundingClaim({ callerIsOwner: true, targetIsCaller: false }), true);
  });

  it("refuses Pro when the caller is claiming themselves, even as an owner", () => {
    assert.equal(shouldWriteIsProOnFoundingClaim({ callerIsOwner: true, targetIsCaller: true }), false);
  });

  it("never writes Pro for a co-admin, including claiming another reader", () => {
    assert.equal(shouldWriteIsProOnFoundingClaim({ callerIsOwner: false, targetIsCaller: false }), false);
    assert.equal(shouldWriteIsProOnFoundingClaim({ callerIsOwner: false, targetIsCaller: true }), false);
  });
});

describe("foundingFunders chip copy (#497)", () => {
  it("does not advertise the registered-user roster as a co-admin capability", () => {
    const copy = ADMIN_AREA_DESCRIPTIONS.foundingFunders;
    assert.doesNotMatch(copy, /registered-user roster/);
    assert.match(copy, /owner/i);
    assert.match(copy, /payment/i);
  });
});

function actionBody(source: string, name: string): string {
  const match = source.match(new RegExp(`export async function ${name}\\([\\s\\S]*?\\n\\}`));
  assert.ok(match, `${name} not found — did the action move?`);
  return match[0];
}

describe("claimFoundingSpotAction source-gates (#497)", () => {
  const source = readFileSync(path.join(process.cwd(), "src/app/actions/founding-funders.ts"), "utf8");
  const body = actionBody(source, "claimFoundingSpotAction");

  it("asks the Pro-write helper after resolving the caller and target", () => {
    assert.match(body, /shouldWriteIsProOnFoundingClaim/);
    assert.match(body, /isSiteAdmin\(\)/);
    assert.match(body, /getCurrentUser\(\)/);
    const helper = body.indexOf("shouldWriteIsProOnFoundingClaim");
    const write = body.indexOf("isPro: true");
    assert.ok(write > -1, "claimFoundingSpotAction no longer writes isPro");
    assert.ok(helper < write, "claimFoundingSpotAction writes isPro before asking the helper");
  });

  it("only writes isPro when the helper says so", () => {
    assert.match(body, /if \(writeIsPro\)/);
    const guard = body.indexOf("if (writeIsPro)");
    const write = body.indexOf("isPro: true");
    assert.ok(guard > -1 && write > guard, "isPro write is not behind writeIsPro");
  });
});

describe("founding-funders page roster source-gates (#497)", () => {
  const page = readFileSync(path.join(process.cwd(), "src/app/founding-funders/page.tsx"), "utf8");

  it("loads the registered-user PII query only for an owner", () => {
    assert.match(page, /isSiteAdmin/);
    assert.match(page, /const \[data, isAdmin, isOwner\]/);
    assert.match(page, /isOwner\s*\?/);
    assert.match(page, /prisma\.user\.findMany/);
    const ownerGate = page.indexOf("isOwner");
    const findMany = page.indexOf("prisma.user.findMany");
    assert.ok(ownerGate > -1 && findMany > ownerGate, "user.findMany is not behind isOwner");
  });

  it("renders RegisteredUsersPanel only for an owner", () => {
    assert.match(page, /isOwner && <RegisteredUsersPanel/);
  });
});
