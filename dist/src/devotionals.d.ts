import type { Devotional, Period, DateQuery } from "./types.js";
/**
 * Load all devotionals from the bundled JSON file.
 */
export declare function loadDevotionals(): Devotional[];
/**
 * Get a specific devotional by date and period.
 */
export declare function getDevotional(query: DateQuery, period: Period): Devotional | null;
/**
 * Get a random devotional.
 */
export declare function getRandomDevotional(): Devotional;
/**
 * Search devotionals by keyword. Matches against scripture reference
 * and devotional text. Case-insensitive.
 */
export declare function searchDevotionals(term: string): Array<{
    devotional: Devotional;
    matches: string[];
}>;
/**
 * List all devotionals with their date, period, and scripture reference.
 * Optionally filter out 29 Feb on non-leap years.
 */
export declare function listDevotionals(includeLeapDay?: boolean): Array<{
    date: string;
    period: Period;
    scripture: string;
}>;
