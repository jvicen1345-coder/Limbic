import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { ADMIN_AREAS, parseAdminAreas } from "./admin-areas";
import {
  adminAreasForUser,
  evaluateOwnerAdminAreaTarget,
  hasAdminAreaForUser,
  isAdminEmail,
  unknownAdminAreaError,
} from "./admin-authz";

/**
 * Authz net for the admin-area model (#500).
 *
 * parseAdminAreas / adminAreasForUser / hasAdminArea / requireOwnerForTarget used to have
 * no node:test coverage — e2e/admin-areas.spec.ts writes the column and checks pages/nav,
 * and never calls grantAdminAreaAction / revokeAdminAreaAction (CI leaves the owner
 * allowlist unset). These tests hit the decision functions directly.
 *
 * The copyright co-admin / owner-suspend regression belongs on #496, which is in flight
 * separately. Do not add that case here.
 */

const OWNER_EMAIL = "owner@example.com";

function withAllowlist(value: string | undefined, fn: () => void) {
  const previous = process.env.FOUNDING_FUNDERS_ADMIN_EMAILS;
  if (value === undefined) delete process.env.FOUNDING_FUNDERS_ADMIN_EMAILS;
  else process.env.FOUNDING_FUNDERS_ADMIN_EMAILS = value;
  try {
    fn();
  } finally {
    if (previous === undefined) delete process.env.FOUNDING_FUNDERS_ADMIN_EMAILS;
    else process.env.FOUNDING_FUNDERS_ADMIN_EMAILS = previous;
  }
}

describe("parseAdminAreas", () => {
  it("returns only known areas and drops unknown values", () => {
    assert.deepEqual(parseAdminAreas(["licenses", "not-an-area", "copyright"]), ["licenses", "copyright"]);
  });

  it("returns none for guests / unknown JSON / non-arrays", () => {
    assert.deepEqual(parseAdminAreas(null), []);
    assert.deepEqual(parseAdminAreas(undefined), []);
    assert.deepEqual(parseAdminAreas("licenses"), []);
    assert.deepEqual(parseAdminAreas({ licenses: true }), []);
    assert.deepEqual(parseAdminAreas(1), []);
    assert.deepEqual(parseAdminAreas([]), []);
  });

  it("preserves allowlist order, not input order", () => {
    assert.deepEqual(parseAdminAreas(["foundingFunders", "licenses"]), ["licenses", "foundingFunders"]);
  });

  it("does not invent an accounts area — that page stays owner-only", () => {
    assert.ok(!(ADMIN_AREAS as readonly string[]).includes("accounts"));
    assert.deepEqual(parseAdminAreas(["accounts", "licenses"]), ["licenses"]);
  });
});

describe("adminAreasForUser", () => {
  it("gives every area to an allowlist user, ignoring the stored column", () => {
    withAllowlist(OWNER_EMAIL, () => {
      assert.deepEqual(
        adminAreasForUser({ email: OWNER_EMAIL, licenseEmail: null, adminAreas: ["licenses"] }),
        [...ADMIN_AREAS],
      );
      assert.deepEqual(
        adminAreasForUser({ email: "Owner@Example.com", licenseEmail: null, adminAreas: [] }),
        [...ADMIN_AREAS],
      );
      assert.deepEqual(
        adminAreasForUser({ email: null, licenseEmail: OWNER_EMAIL, adminAreas: null }),
        [...ADMIN_AREAS],
      );
    });
  });

  it("gives none when the allowlist is empty, even if the column is junk", () => {
    withAllowlist(undefined, () => {
      assert.equal(isAdminEmail(OWNER_EMAIL), false);
      assert.deepEqual(
        adminAreasForUser({ email: OWNER_EMAIL, licenseEmail: null, adminAreas: { nope: true } }),
        [],
      );
    });
  });

  it("gives a non-owner only the parsed subset", () => {
    withAllowlist(OWNER_EMAIL, () => {
      assert.deepEqual(
        adminAreasForUser({
          email: "coadmin@example.com",
          licenseEmail: null,
          adminAreas: ["licenses", "unknown", "copyright"],
        }),
        ["licenses", "copyright"],
      );
    });
  });
});

describe("hasAdminArea (hasAdminAreaForUser)", () => {
  it("is false for a guest / signed-out caller on every area", () => {
    withAllowlist(OWNER_EMAIL, () => {
      for (const area of ADMIN_AREAS) {
        assert.equal(hasAdminAreaForUser(null, area), false);
      }
    });
  });

  it("is true for every area when the caller is an allowlist owner", () => {
    withAllowlist(OWNER_EMAIL, () => {
      const owner = { email: OWNER_EMAIL, licenseEmail: null, adminAreas: [] };
      for (const area of ADMIN_AREAS) {
        assert.equal(hasAdminAreaForUser(owner, area), true, area);
      }
    });
  });

  it("is true only for granted areas on a co-admin", () => {
    withAllowlist(OWNER_EMAIL, () => {
      const coadmin = {
        email: "coadmin@example.com",
        licenseEmail: null,
        adminAreas: ["copyright", "licenses"],
      };
      assert.equal(hasAdminAreaForUser(coadmin, "copyright"), true);
      assert.equal(hasAdminAreaForUser(coadmin, "licenses"), true);
      assert.equal(hasAdminAreaForUser(coadmin, "appraisals"), false);
    });
  });
});

describe("requireOwnerForTarget (evaluateOwnerAdminAreaTarget)", () => {
  const ordinary = {
    adminAreas: ["licenses"],
    isGuest: false,
    email: "reader@example.com",
    licenseEmail: null,
  };

  it("refuses a non-owner caller, including a full-area co-admin", () => {
    withAllowlist(OWNER_EMAIL, () => {
      const fullCoadminTarget = { ...ordinary, adminAreas: [...ADMIN_AREAS] };
      const refused = evaluateOwnerAdminAreaTarget({ callerIsOwner: false, target: fullCoadminTarget });
      assert.equal(refused.error, "Only a full admin can change co-admin access.");
      assert.equal(refused.current, undefined);
    });
  });

  it("refuses a missing target", () => {
    const refused = evaluateOwnerAdminAreaTarget({ callerIsOwner: true, target: null });
    assert.equal(refused.error, "That account no longer exists.");
  });

  it("refuses granting to a guest", () => {
    const refused = evaluateOwnerAdminAreaTarget({
      callerIsOwner: true,
      target: { ...ordinary, isGuest: true, email: null },
    });
    assert.equal(refused.error, "Guest accounts can't be given admin access.");
  });

  it("refuses writing chips onto an allowlist owner", () => {
    withAllowlist(OWNER_EMAIL, () => {
      const refused = evaluateOwnerAdminAreaTarget({
        callerIsOwner: true,
        target: { ...ordinary, email: OWNER_EMAIL },
      });
      assert.equal(refused.error, "That account is already a full admin through the environment allowlist.");
    });
  });

  it("returns the parsed current areas for an owner acting on an ordinary account", () => {
    withAllowlist(OWNER_EMAIL, () => {
      const ok = evaluateOwnerAdminAreaTarget({
        callerIsOwner: true,
        target: { ...ordinary, adminAreas: ["copyright", "bogus"] },
      });
      assert.equal(ok.error, undefined);
      assert.deepEqual(ok.current, ["copyright"]);
    });
  });
});

describe("unknown admin area", () => {
  it("refuses a value that is not in ADMIN_AREAS", () => {
    assert.equal(unknownAdminAreaError("accounts"), "Unknown admin area.");
    assert.equal(unknownAdminAreaError("nexus"), "Unknown admin area.");
    assert.equal(unknownAdminAreaError(""), "Unknown admin area.");
  });

  it("accepts every delegable area", () => {
    for (const area of ADMIN_AREAS) {
      assert.equal(unknownAdminAreaError(area), undefined, area);
    }
  });
});

/**
 * Wiring: the extracted helpers only help if grant/revoke/hasAdminArea still call them.
 * Same shape as the Nexus action source-gate in e2e/nexus-hidden.spec.ts.
 */
describe("admin-area write / hasAdminArea source gates", () => {
  const root = process.cwd();
  const actions = readFileSync(path.join(root, "src/app/actions/admin.ts"), "utf8");
  const adminLib = readFileSync(path.join(root, "src/lib/admin.ts"), "utf8");
  const layout = readFileSync(path.join(root, "src/app/(app)/layout.tsx"), "utf8");
  const nexusVisibility = readFileSync(path.join(root, "src/lib/nexus-visibility.ts"), "utf8");

  it("grant and revoke go through the owner gate and refuse unknown areas", () => {
    for (const name of ["grantAdminAreaAction", "revokeAdminAreaAction"]) {
      const match = actions.match(new RegExp(`export async function ${name}\\([\\s\\S]*?\\n\\}`));
      assert.ok(match, `${name} not found`);
      const body = match[0];
      assert.match(body, /unknownAdminAreaError\(area\)/, `${name} skipped the unknown-area check`);
      assert.match(body, /requireOwnerForTarget\(userId\)/, `${name} skipped the owner gate`);
    }
    assert.match(actions, /const callerIsOwner = await isSiteAdmin\(\)/);
    assert.match(actions, /evaluateOwnerAdminAreaTarget/);
  });

  it("hasAdminArea uses the shared user predicate, not a leftover isAdmin check", () => {
    assert.match(adminLib, /export async function hasAdminArea/);
    assert.match(adminLib, /hasAdminAreaForUser\(await getCurrentUser\(\), area\)/);
  });

  it("Nexus visibility stays owner-allowlist, not admin-areas", () => {
    // The failure mode #490 called out: a co-admin with every area leaking Nexus through
    // an old isAdmin / adminAreas-length nav prop. Layout must keep asking nexusVisibleTo,
    // which itself must keep asking isAdminEmail — not adminAreasForUser / hasAdminArea.
    assert.match(layout, /const showNexus = nexusVisibleTo\(user\)/);
    assert.match(nexusVisibility, /isAdminEmail\(user\.email\) \|\| isAdminEmail\(user\.licenseEmail\)/);
    assert.doesNotMatch(nexusVisibility, /adminAreasForUser|hasAdminArea|ADMIN_AREAS/);
  });
});
