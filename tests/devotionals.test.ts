import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  loadDevotionals,
  getDevotional,
  getRandomDevotional,
  searchDevotionals,
  listDevotionals,
} from "../src/devotionals.js";

describe("loadDevotionals", () => {
  it("loads all devotionals from JSON", () => {
    const devotionals = loadDevotionals();
    assert.ok(devotionals.length > 0, "Should load at least one devotional");
    // Should be 730 (365 days x 2) or 732 (366 days x 2) depending on Feb 29
    assert.ok(
      devotionals.length === 730 || devotionals.length === 732,
      `Expected 730 or 732 entries, got ${devotionals.length}`,
    );
  });

  it("returns cached result on second call", () => {
    const first = loadDevotionals();
    const second = loadDevotionals();
    assert.strictEqual(first, second, "Should return the same cached array");
  });
});

describe("getDevotional", () => {
  it("returns morning devotional for January 1", () => {
    const result = getDevotional({ month: 1, day: 1 }, "morning");
    assert.ok(result, "Should find January 1 morning");
    assert.equal(result.date, "january-1");
    assert.equal(result.period, "morning");
    assert.ok(result.scripture.length > 0, "Should have a scripture reference");
    assert.ok(result.text.length > 0, "Should have devotional text");
  });

  it("returns evening devotional for January 1", () => {
    const result = getDevotional({ month: 1, day: 1 }, "evening");
    assert.ok(result, "Should find January 1 evening");
    assert.equal(result.date, "january-1");
    assert.equal(result.period, "evening");
  });

  it("returns morning devotional for December 31", () => {
    const result = getDevotional({ month: 12, day: 31 }, "morning");
    assert.ok(result, "Should find December 31 morning");
    assert.equal(result.date, "december-31");
    assert.equal(result.period, "morning");
  });

  it("returns null for non-existent date", () => {
    const result = getDevotional({ month: 13, day: 1 }, "morning");
    assert.equal(result, null);
  });
});

describe("getRandomDevotional", () => {
  it("returns a valid devotional", () => {
    const result = getRandomDevotional();
    assert.ok(result, "Should return a devotional");
    assert.ok(result.date, "Should have a date");
    assert.ok(
      result.period === "morning" || result.period === "evening",
      "Should have a valid period",
    );
    assert.ok(result.scripture, "Should have a scripture reference");
    assert.ok(result.text, "Should have text");
  });
});

describe("searchDevotionals", () => {
  it("finds devotionals matching a keyword in text", () => {
    const results = searchDevotionals("shepherd");
    assert.ok(results.length > 0, "Should find at least one match for 'shepherd'");
    for (const { devotional, matches } of results) {
      assert.ok(matches.length > 0, "Each result should have at least one match");
    }
  });

  it("finds devotionals matching a scripture reference", () => {
    const results = searchDevotionals("Joshua");
    assert.ok(results.length > 0, "Should find at least one match for 'Joshua'");
  });

  it("returns empty array for no matches", () => {
    const results = searchDevotionals("xyzzyplugh");
    assert.deepEqual(results, []);
  });

  it("is case-insensitive", () => {
    const upper = searchDevotionals("LORD");
    const lower = searchDevotionals("lord");
    assert.equal(upper.length, lower.length, "Case should not affect results");
  });
});

describe("listDevotionals", () => {
  it("lists all devotionals with date, period, and scripture", () => {
    const list = listDevotionals();
    assert.ok(list.length > 0, "Should list at least one entry");
    const first = list[0];
    assert.ok(first.date, "Should have a date");
    assert.ok(first.period, "Should have a period");
    assert.ok(first.scripture, "Should have a scripture reference");
  });

  it("includes leap day when requested", () => {
    const withLeap = listDevotionals(true);
    const withoutLeap = listDevotionals(false);
    const feb29With = withLeap.filter(e => e.date === "february-29");
    const feb29Without = withoutLeap.filter(e => e.date === "february-29");
    assert.ok(feb29Without.length === 0, "Should exclude Feb 29 when not requested");
  });
});
