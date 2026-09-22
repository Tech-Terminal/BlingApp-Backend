/**
 * Parses a simple duration string (e.g. '1d', '12h', '30m', '60s') into milliseconds.
 * Defaults to 1 day (86400000ms) if invalid format.
 */
export function parseDurationToMs(duration: string): number {
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) return 86400000; // default 1 day
    const value = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'm': return value * 60 * 1000;
        case 's': return value * 1000;
        default: return 86400000;
    }
}
