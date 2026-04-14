import { formatDateDisplay } from "./date-utils.js";
import { BOLD, DIM, RESET, contentWidth, formatReference, parseDateKey, periodLabel, rule, wrapText, } from "./display-utils.js";
/**
 * Display a full devotional reading to stdout.
 */
export function displayDevotional(devotional) {
    const width = contentWidth();
    const { month, day } = parseDateKey(devotional.date);
    const dateStr = formatDateDisplay(month, day);
    const period = periodLabel(devotional.period);
    const lines = [];
    // Header
    lines.push(rule(width));
    const headerText = `MORNING & EVENING \u2014 ${period} \u00b7 ${dateStr}`;
    const headerPad = Math.max(0, Math.floor((width - headerText.length) / 2));
    lines.push(`${DIM}${" ".repeat(headerPad)}${headerText}${RESET}`);
    lines.push(rule(width));
    lines.push("");
    // Verse text — bold, in quotation marks
    const verseText = `\u201c${devotional.verse}\u201d`;
    const verseLines = wrapText(verseText, width - 2);
    for (const line of verseLines) {
        lines.push(`  ${BOLD}${line}${RESET}`);
    }
    // Scripture reference — right-aligned, dimmed italic with em-dash
    lines.push(`  ${formatReference(devotional.scripture, width - 2)}`);
    lines.push("");
    // Prose text — wrapped, with paragraph breaks preserved
    const paragraphs = devotional.text.split(/\n\n+/);
    for (const paragraph of paragraphs) {
        const wrapped = wrapText(paragraph, width - 4);
        for (const line of wrapped) {
            lines.push(`  ${line}`);
        }
        lines.push("");
    }
    // Footer rule
    lines.push(rule(width));
    process.stdout.write(lines.join("\n") + "\n");
}
/**
 * Display search results.
 */
export function displaySearchResults(results, term) {
    if (results.length === 0) {
        console.log(`No readings found matching "${term}".`);
        return;
    }
    const width = contentWidth();
    console.log(`${BOLD}Found ${results.length} reading${results.length === 1 ? "" : "s"} matching "${term}":${RESET}\n`);
    for (const { devotional, matches } of results) {
        const { month, day } = parseDateKey(devotional.date);
        const dateStr = formatDateDisplay(month, day);
        const period = periodLabel(devotional.period);
        console.log(`  ${BOLD}${period} \u00b7 ${dateStr}${RESET}`);
        console.log(`  ${DIM}${devotional.scripture}${RESET}`);
        // Show first match snippet
        const snippet = matches[0];
        if (snippet !== devotional.scripture) {
            const truncated = snippet.length > width - 6
                ? snippet.slice(0, width - 9) + "..."
                : snippet;
            console.log(`  ${DIM}Match: ${truncated}${RESET}`);
        }
        console.log("");
    }
    console.log(`${DIM}${rule(width)}${RESET}`);
}
/**
 * Display the list of all devotionals.
 */
export function displayList(entries) {
    const width = contentWidth();
    console.log(`${BOLD}Morning & Evening \u2014 All Readings${RESET}\n`);
    let currentMonth = "";
    for (const entry of entries) {
        const { month, day } = parseDateKey(entry.date);
        const dateStr = formatDateDisplay(month, day);
        const monthName = entry.date.split("-")[0];
        if (monthName !== currentMonth) {
            currentMonth = monthName;
            const heading = currentMonth[0].toUpperCase() + currentMonth.slice(1);
            console.log(`\n${BOLD}${heading}${RESET}`);
            console.log(`${DIM}${"─".repeat(heading.length)}${RESET}`);
        }
        const period = periodLabel(entry.period);
        const scriptureSnippet = entry.scripture.length > width - 30
            ? entry.scripture.slice(0, width - 33) + "..."
            : entry.scripture;
        console.log(`  ${dateStr} ${DIM}${period}${RESET}  ${scriptureSnippet}`);
    }
    console.log("");
}
//# sourceMappingURL=display.js.map