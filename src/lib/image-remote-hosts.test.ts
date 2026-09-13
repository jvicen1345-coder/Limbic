import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  IMAGE_REMOTE_HOSTS,
  IMAGE_REMOTE_PATTERNS,
  isOptimizableImageSrc,
} from "./image-remote-hosts";
import { BUNDLED_TOPIC_PHOTOS } from "./topic-photos-data";

describe("isOptimizableImageSrc", () => {
  it("accepts same-origin rasters and the closed CDN allowlist", () => {
    assert.equal(isOptimizableImageSrc("/logo-icon.png"), true);
    assert.equal(isOptimizableImageSrc("https://i.ytimg.com/vi/abc123/hqdefault.jpg"), true);
    assert.equal(
      isOptimizableImageSrc(
        "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d2/Kinesio_taping.jpg/1280px-Kinesio_taping.jpg?utm_source=commons.wikimedia.org"
      ),
      true
    );
    assert.equal(
      isOptimizableImageSrc("https://upload.wikimedia.org/wikipedia/commons/d/d2/Kinesio_taping.jpg"),
      true
    );
    assert.equal(
      isOptimizableImageSrc("https://images.pexels.com/photos/12345/pexels-photo-12345.jpeg?auto=compress"),
      true
    );
  });

  it("rejects data-URLs, publisher hosts, and hostname lookalikes", () => {
    assert.equal(isOptimizableImageSrc("data:image/png;base64,aaaa"), false);
    assert.equal(isOptimizableImageSrc("https://publisher.example/og.jpg"), false);
    assert.equal(isOptimizableImageSrc("https://evil.thumb.wikimedia.org/wikipedia/commons/x.jpg"), false);
    assert.equal(isOptimizableImageSrc("http://thumb.wikimedia.org/wikipedia/commons/x.jpg"), false);
    assert.equal(isOptimizableImageSrc("//thumb.wikimedia.org/wikipedia/commons/x.jpg"), false);
    assert.equal(isOptimizableImageSrc("https://images.pexels.com/other/not-photos.jpg"), false);
  });

  it("keeps every bundled Home fallback photo on the allowlist", () => {
    for (const photo of BUNDLED_TOPIC_PHOTOS) {
      assert.equal(isOptimizableImageSrc(photo.url), true, photo.url);
    }
  });
});

describe("images.remotePatterns SSRF posture", () => {
  const config = readFileSync(path.join(process.cwd(), "next.config.ts"), "utf8");

  it("wires next.config to the shared closed allowlist", () => {
    assert.match(config, /IMAGE_REMOTE_PATTERNS/);
    assert.doesNotMatch(config, /hostname:\s*["']\*{1,2}/);
    assert.doesNotMatch(config, /hostname:\s*["']\*\./);
    for (const host of IMAGE_REMOTE_HOSTS) {
      assert.ok(
        IMAGE_REMOTE_PATTERNS.some((pattern) => pattern.hostname === host),
        `${host} missing from IMAGE_REMOTE_PATTERNS`
      );
    }
  });

  it("does not declare an internet-wildcard remotePattern hostname", () => {
    for (const pattern of IMAGE_REMOTE_PATTERNS) {
      assert.ok(!pattern.hostname.includes("*"), `${pattern.hostname} is a hostname wildcard`);
    }
  });
});

describe("compressed marketing rasters", () => {
  it("keeps logo-icon.png well under the previous 118 KiB on-disk size", () => {
    const bytes = statSync(path.join(process.cwd(), "public/logo-icon.png")).size;
    assert.ok(bytes < 50_000, `logo-icon.png is ${bytes} bytes; recompress before shipping`);
  });
});

describe("out-of-scope image surfaces stay on raw img", () => {
  it("keeps Nexus data-URLs and HEP clinician URLs off next/image", () => {
    const nexus = readFileSync(path.join(process.cwd(), "src/components/NexusPostCard.tsx"), "utf8");
    const hep = readFileSync(path.join(process.cwd(), "src/app/(app)/hep/page.tsx"), "utf8");
    const articleImage = readFileSync(path.join(process.cwd(), "src/components/ArticleImage.tsx"), "utf8");
    assert.match(nexus, /data-URL image, next\/image can't optimize it anyway/);
    assert.match(hep, /clinician-pasted external URL/);
    assert.match(articleImage, /from "next\/image"/);
  });
});
