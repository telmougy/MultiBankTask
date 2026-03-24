/**
 * Task 2: String Character Frequency
 *
 * Counts character occurrences in a string and returns them
 * in order of first appearance.
 *
 * Assumptions:
 * - Case-sensitive: 'A' and 'a' are distinct characters
 * - Spaces excluded: per the provided example output ("hello world" → no space),
 *   whitespace characters are intentionally omitted from the count
 * - All other characters included: special chars, unicode, punctuation are counted
 * - Output order: characters appear in order of first occurrence in the input
 */

/**
 * Counts the frequency of each character in the input string.
 * Uses a Map to preserve insertion order (first appearance).
 * Spaces are excluded per the specification example.
 */
export function charFrequency(input: string): Map<string, number> {
  const freq = new Map<string, number>();

  for (const char of input) {
    if (char === ' ') continue; // Exclude spaces per spec example
    freq.set(char, (freq.get(char) ?? 0) + 1);
  }

  return freq;
}

/**
 * Formats character frequency as a human-readable string.
 * Example: "hello world" → "h:1, e:1, l:3, o:2, w:1, r:1, d:1"
 */
export function formatFrequency(input: string): string {
  const freq = charFrequency(input);
  return Array.from(freq.entries())
    .map(([char, count]) => `${char}:${count}`)
    .join(', ');
}

// CLI entry point: run with `npx ts-node task2-string-frequency/charFrequency.ts "hello world"`
if (require.main === module) {
  const input = process.argv[2];
  if (input === undefined) {
    console.error('Usage: npx ts-node task2-string-frequency/charFrequency.ts "<string>"');
    process.exit(1);
  }
  console.log(`Input:  "${input}"`);
  console.log(`Output: ${formatFrequency(input)}`);
}
