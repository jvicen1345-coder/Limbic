import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  OWNER_SUSPEND_BLOCKED,
  OWNER_UNSUSPEND_BLOCKED,
  copyrightOwnerTargetError,
} from "./copyright-owner-guard";

/**
 * A copyright co-admin must not be able to suspend (or lift a suspension of) an allowlist
 * owner — the lockout in issue #496. The policy lives in a pure helper so this file can
 * name the cases without standing up FOUNDING_FUNDERS_ADMIN_EMAILS in CI; the source-gate
 * below is what pins the server actions to actually call it.
 */

describe("copyrightOwnerTargetError (#496)", () => {
  it("lets a copyright co-admin suspend or unsuspend an ordinary reader", () => {
    assert.equal(
      copyrightOwnerTargetError({ action: "suspend", targetIsOwner: false, actorIsOwner: false }),
      null
    );
    assert.equal(
      copyrightOwnerTargetError({ action: "unsuspend", targetIsOwner: false, actorIsOwner: false }),
      null
    );
  });

  it("refuses suspend when the target is an allowlist owner, even if the actor is an owner", () => {
    assert.equal(
      copyrightOwnerTargetError({ action: "suspend", targetIsOwner: true, actorIsOwner: false }),
      OWNER_SUSPEND_BLOCKED
    );
    assert.equal(
      copyrightOwnerTargetError({ action: "suspend", targetIsOwner: true, actorIsOwner: true }),
      OWNER_SUSPEND_BLOCKED
    );
  });

  it("lets only an owner lift an owner suspension", () => {
    assert.equal(
      copyrightOwnerTargetError({ action: "unsuspend", targetIsOwner: true, actorIsOwner: false }),
      OWNER_UNSUSPEND_BLOCKED
    );
    assert.equal(
      copyrightOwnerTargetError({ action: "unsuspend", targetIsOwner: true, actorIsOwner: true }),
      null
    );
  });
});

function actionBody(source: string, name: string): string {
  const match = source.match(new RegExp(`export async function ${name}\\([\\s\\S]*?\\n\\}`));
  assert.ok(match, `${name} not found — did the action move?`);
  return match[0];
}

describe("copyright suspend/unsuspend actions refuse allowlist owners", () => {
  const source = readFileSync(path.join(process.cwd(), "src/app/actions/copyright.ts"), "utf8");

  it("both actions ask the owner-guard and check email plus licenseEmail", () => {
    assert.match(source, /copyrightOwnerTargetError/);
    for (const name of ["suspendUserAction", "unsuspendUserAction"] as const) {
      const body = actionBody(source, name);
      assert.match(body, /copyrightOwnerTargetError/, `${name} does not call the owner guard`);
      assert.match(body, /isAdminEmail\(target\.email\)/, `${name} does not check target.email`);
      assert.match(
        body,
        /isAdminEmail\(target\.licenseEmail\)/,
        `${name} does not check target.licenseEmail`
      );
      const guard = body.indexOf("copyrightOwnerTargetError");
      const write = body.indexOf("prisma.user.update");
      assert.ok(write > -1, `${name} no longer writes the user row`);
      assert.ok(guard < write, `${name} writes the user row before the owner guard`);
    }
  });
});
