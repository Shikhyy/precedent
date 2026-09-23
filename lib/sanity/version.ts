/**
 * Compiler versions are stored and compared as numbers so GROQ can compare them.
 * Formula: maj * 1_000_000 + min * 1_000 + pat
 * e.g., "0.8.28" -> 8028, "0.4.24" -> 4024
 */
export const versionKey = (v: string): number => {
  const clean = v.replace(/^v/, "").trim();
  const [maj = 0, min = 0, pat = 0] = clean.split(".").map(Number);
  return (isNaN(maj) ? 0 : maj) * 1_000_000 +
         (isNaN(min) ? 0 : min) * 1_000 +
         (isNaN(pat) ? 0 : pat);
};

export const parseVersionKey = (k: number): string => {
  const maj = Math.floor(k / 1_000_000);
  const rem = k % 1_000_000;
  const min = Math.floor(rem / 1_000);
  const pat = rem % 1_000;
  return `${maj}.${min}.${pat}`;
};

export const isVersionInScope = (
  version: string,
  fromVersion?: number | null,
  toVersion?: number | null
): boolean => {
  const key = versionKey(version);
  if (fromVersion != null && key < fromVersion) return false;
  if (toVersion != null && key > toVersion) return false;
  return true;
};
