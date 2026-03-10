/**
 * Converts a hero name to a URL-friendly slug.
 * Examples: "Chang'e" → "change", "X.Borg" → "x-borg", "Yi Sun-shin" → "yi-sun-shin"
 */
export function heroToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['\u2019]/g, '')       // Chang'e → change
    .replace(/[^a-z0-9]+/g, '-')    // non-alphanumeric runs → hyphen
    .replace(/^-+|-+$/g, '');       // trim edge hyphens
}
