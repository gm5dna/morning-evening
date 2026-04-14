import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

interface Devotional {
  date: string;
  period: "morning" | "evening";
  verse: string;
  scripture: string;
  text: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONTH_NAMES: Record<string, string> = {
  January: "january",
  February: "february",
  March: "march",
  April: "april",
  May: "may",
  June: "june",
  July: "july",
  August: "august",
  September: "september",
  October: "october",
  November: "november",
  December: "december",
};

const DAYS_IN_MONTH: Record<string, number> = {
  january: 31, february: 29, march: 31, april: 30, may: 31, june: 30,
  july: 31, august: 31, september: 30, october: 31, november: 30, december: 31,
};

const SOURCE_URL = "https://ccel.org/ccel/s/spurgeon/morneve/cache/morneve.txt";

// Header pattern: "Morning, January 1" or "Evening, January 1"
const HEADER_RE = /^(Morning|Evening),\s+(\w+)\s+(\d+)$/;

// Cross-reference line: "[33]Go To Evening Reading" or "[34]Go To Morning Reading"
const CROSSREF_RE = /^\[\d+\]Go To (Morning|Evening) Reading$/;

// Underscore separator line
const SEPARATOR_RE = /^_{10,}$/;

async function main(): Promise<void> {
  console.log(`Fetching ${SOURCE_URL} ...`);
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  const rawText = await response.text();
  console.log(`Fetched ${rawText.length} characters.`);

  const lines = rawText.split(/\r?\n/);
  const devotionals: Devotional[] = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    const headerMatch = line.match(HEADER_RE);

    if (!headerMatch) {
      i++;
      continue;
    }

    // Found a header
    const periodRaw = headerMatch[1]; // "Morning" or "Evening"
    const monthRaw = headerMatch[2];  // "January"
    const dayRaw = headerMatch[3];    // "1"

    const period = periodRaw.toLowerCase() as "morning" | "evening";
    const monthKey = MONTH_NAMES[monthRaw];
    if (!monthKey) {
      console.warn(`Unknown month "${monthRaw}" at line ${i + 1}, skipping.`);
      i++;
      continue;
    }
    const day = parseInt(dayRaw, 10);
    const dateKey = `${monthKey}-${day}`;

    i++; // Move past header

    // Skip blank lines after header
    while (i < lines.length && lines[i].trim() === "") {
      i++;
    }

    // Skip cross-reference line
    if (i < lines.length && CROSSREF_RE.test(lines[i].trim())) {
      i++;
    }

    // Skip blank lines after cross-reference
    while (i < lines.length && lines[i].trim() === "") {
      i++;
    }

    // Next non-blank line should be the scripture quote in quotes
    // It may span multiple lines. Collect until we find the closing quote.
    // The quote is surrounded by typographic or straight quotes.
    let scriptureQuote = "";
    if (i < lines.length) {
      const firstChar = lines[i].trim().charAt(0);
      if (firstChar === '"' || firstChar === '\u201c') {
        // Collect the full quote (may span lines)
        while (i < lines.length) {
          const qLine = lines[i].trim();
          if (qLine === "") break;
          scriptureQuote += (scriptureQuote ? " " : "") + qLine;
          i++;
          // Check if quote is closed
          if (scriptureQuote.endsWith('"') || scriptureQuote.endsWith('\u201d')) {
            break;
          }
        }
      }
    }

    // Skip blank lines after quote
    while (i < lines.length && lines[i].trim() === "") {
      i++;
    }

    // Next non-blank line(s) should be the scripture reference
    // This is typically one line like "Joshua 5:12" but could span lines
    let scripture = "";
    while (i < lines.length) {
      const refLine = lines[i].trim();
      if (refLine === "") break;
      // Stop if we hit a separator or next header
      if (SEPARATOR_RE.test(refLine) || HEADER_RE.test(refLine)) break;
      scripture += (scripture ? " " : "") + refLine;
      i++;
    }

    // Skip blank lines after reference
    while (i < lines.length && lines[i].trim() === "") {
      i++;
    }

    // Collect prose text until separator or next header
    const proseLines: string[] = [];
    while (i < lines.length) {
      const pLine = lines[i].trim();
      if (SEPARATOR_RE.test(pLine)) {
        i++; // skip the separator
        break;
      }
      if (HEADER_RE.test(pLine)) {
        break; // don't consume the next header
      }
      proseLines.push(pLine);
      i++;
    }

    // Join prose: collapse blank lines into paragraph breaks, trim
    const text = collapseProseLines(proseLines);

    if (!scripture) {
      console.warn(`No scripture reference found for ${dateKey} ${period} (line ~${i})`);
    }

    // Strip surrounding quotes from the scripture quote
    const verse = scriptureQuote
      .replace(/^[\u201c"]+/, "")
      .replace(/[\u201d"]+$/, "")
      .trim();

    devotionals.push({ date: dateKey, period, verse, scripture, text });
  }

  // Sort by date then period (morning before evening)
  devotionals.sort((a, b) => {
    const dateCompare = compareDateKeys(a.date, b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.period === "morning" ? -1 : 1;
  });

  // Validation
  console.log(`\nParsed ${devotionals.length} entries.`);

  // Check expected count: 366 days x 2 periods = 732
  // (Feb 29 may or may not be present — adjust expectation)
  const hasFeb29 = devotionals.some(d => d.date === "february-29");
  const expectedDays = hasFeb29 ? 366 : 365;
  const expectedEntries = expectedDays * 2;
  console.log(`February 29 entries: ${hasFeb29 ? "present" : "absent"}`);
  console.log(`Expected: ${expectedEntries} entries for ${expectedDays} days.`);

  if (devotionals.length !== expectedEntries) {
    console.error(`ERROR: Expected ${expectedEntries} entries, got ${devotionals.length}.`);
    const allMonths = Object.values(MONTH_NAMES);
    for (const month of allMonths) {
      const maxDay = DAYS_IN_MONTH[month];
      for (let d = 1; d <= maxDay; d++) {
        if (!hasFeb29 && month === "february" && d === 29) continue;
        const key = `${month}-${d}`;
        for (const p of ["morning", "evening"] as const) {
          const found = devotionals.find(dev => dev.date === key && dev.period === p);
          if (!found) {
            console.error(`  MISSING: ${key} ${p}`);
          }
        }
      }
    }
    process.exit(1);
  }

  console.log("All dates and periods verified.");

  // Spot-check a few entries
  const jan1m = devotionals.find(d => d.date === "january-1" && d.period === "morning");
  if (jan1m) {
    console.log(`\nSpot check — January 1 Morning:`);
    console.log(`  Scripture: ${jan1m.scripture}`);
    console.log(`  Text preview: ${jan1m.text.slice(0, 100)}...`);
  }

  const dec31e = devotionals.find(d => d.date === "december-31" && d.period === "evening");
  if (dec31e) {
    console.log(`\nSpot check — December 31 Evening:`);
    console.log(`  Scripture: ${dec31e.scripture}`);
    console.log(`  Text preview: ${dec31e.text.slice(0, 100)}...`);
  }

  // Write output
  // Resolve output path relative to the project root (two levels up from dist-scripts/scripts/)
  const outDir = join(__dirname, "..", "..", "data");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "devotionals.json");
  writeFileSync(outPath, JSON.stringify(devotionals, null, 2), "utf-8");
  console.log(`\nWrote ${devotionals.length} entries to ${outPath}`);
}

/**
 * Collapse an array of prose lines into clean paragraph text.
 * Blank lines become double newlines (paragraph breaks).
 * Consecutive non-blank lines are joined with spaces.
 */
function collapseProseLines(lines: string[]): string {
  const paragraphs: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line === "") {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    paragraphs.push(current.join(" "));
  }

  return paragraphs.join("\n\n").trim();
}

/**
 * Compare two date keys for sorting.
 */
function compareDateKeys(a: string, b: string): number {
  const monthOrder = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december",
  ];
  const [aMonth, aDay] = a.split("-");
  const [bMonth, bDay] = b.split("-");
  const aMonthIdx = monthOrder.indexOf(aMonth);
  const bMonthIdx = monthOrder.indexOf(bMonth);
  if (aMonthIdx !== bMonthIdx) return aMonthIdx - bMonthIdx;
  return parseInt(aDay, 10) - parseInt(bDay, 10);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
