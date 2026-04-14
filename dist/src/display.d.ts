import type { Devotional, Period } from "./types.js";
/**
 * Display a full devotional reading to stdout.
 */
export declare function displayDevotional(devotional: Devotional): void;
/**
 * Display search results.
 */
export declare function displaySearchResults(results: Array<{
    devotional: Devotional;
    matches: string[];
}>, term: string): void;
/**
 * Display the list of all devotionals.
 */
export declare function displayList(entries: Array<{
    date: string;
    period: Period;
    scripture: string;
}>): void;
