/**
 * Quick Timestamp Utility
 * Detects @today and @now patterns in text and replaces them with formatted timestamps
 */

/**
 * Formats the current date as "Dec 2, 2025"
 */
export function formatToday(): string {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Formats the current date and time as "2:16 PM, Dec 2, 2025"
 */
export function formatNow(): string {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
    const date = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
    return `${time}, ${date}`;
}

/**
 * Processes text and replaces @today and @now with formatted timestamps
 * @param text - The input text to process
 * @returns The text with timestamps replaced
 */
export function processQuickTimestamp(text: string): string {
    // Replace @today (case insensitive, word boundary)
    let result = text.replace(/@today\b/gi, formatToday());
    // Replace @now (case insensitive, word boundary)
    result = result.replace(/@now\b/gi, formatNow());
    return result;
}

/**
 * Checks if text contains any quick timestamp triggers
 * @param text - The input text to check
 * @returns true if @today or @now is found
 */
export function hasQuickTimestamp(text: string): boolean {
    return /@(today|now)\b/i.test(text);
}

/**
 * Gets the position and type of the first quick timestamp trigger in text
 * @param text - The input text to search
 * @returns Object with index, length, and type, or null if not found
 */
export function findQuickTimestamp(
    text: string,
): { index: number; length: number; type: "today" | "now" } | null {
    const match = text.match(/@(today|now)\b/i);
    if (match && match.index !== undefined) {
        return {
            index: match.index,
            length: match[0].length,
            type: match[1].toLowerCase() as "today" | "now",
        };
    }
    return null;
}
