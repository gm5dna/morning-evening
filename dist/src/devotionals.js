import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { dateKey, isLeapYear } from "./date-utils.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let cachedDevotionals = null;
/**
 * Load all devotionals from the bundled JSON file.
 */
export function loadDevotionals() {
    if (cachedDevotionals)
        return cachedDevotionals;
    // In dist/, we're at dist/src/devotionals.js — data is at ../../data/
    const dataPath = join(__dirname, "..", "..", "data", "devotionals.json");
    const raw = readFileSync(dataPath, "utf-8");
    cachedDevotionals = JSON.parse(raw);
    return cachedDevotionals;
}
/**
 * Get a specific devotional by date and period.
 */
export function getDevotional(query, period) {
    const devotionals = loadDevotionals();
    const key = dateKey(query.month, query.day);
    return devotionals.find(d => d.date === key && d.period === period) ?? null;
}
/**
 * Get a random devotional.
 */
export function getRandomDevotional() {
    const devotionals = loadDevotionals();
    const idx = Math.floor(Math.random() * devotionals.length);
    return devotionals[idx];
}
/**
 * Search devotionals by keyword. Matches against scripture reference
 * and devotional text. Case-insensitive.
 */
export function searchDevotionals(term) {
    const devotionals = loadDevotionals();
    const lower = term.toLowerCase();
    const results = [];
    for (const devotional of devotionals) {
        const matches = [];
        if (devotional.scripture.toLowerCase().includes(lower)) {
            matches.push(devotional.scripture);
        }
        if (devotional.text.toLowerCase().includes(lower)) {
            const textLower = devotional.text.toLowerCase();
            const idx = textLower.indexOf(lower);
            const start = Math.max(0, idx - 40);
            const end = Math.min(devotional.text.length, idx + lower.length + 40);
            let snippet = devotional.text.slice(start, end);
            if (start > 0)
                snippet = "..." + snippet;
            if (end < devotional.text.length)
                snippet = snippet + "...";
            matches.push(snippet);
        }
        if (matches.length > 0) {
            results.push({ devotional, matches });
        }
    }
    return results;
}
/**
 * List all devotionals with their date, period, and scripture reference.
 * Optionally filter out 29 Feb on non-leap years.
 */
export function listDevotionals(includeLeapDay) {
    const devotionals = loadDevotionals();
    const showLeapDay = includeLeapDay ?? isLeapYear(new Date().getFullYear());
    return devotionals
        .filter(d => showLeapDay || d.date !== "february-29")
        .map(d => ({
        date: d.date,
        period: d.period,
        scripture: d.scripture,
    }));
}
//# sourceMappingURL=devotionals.js.map