/**
 * avatarHelper.js
 *
 * Deterministic and gender-aware avatar assignment based on a username's first letter.
 *
 * Strategy
 * ────────
 *  1. Folder structure in public/avatars/:
 *     - male/   → avatar_01.png … avatar_15.png (15 avatars)
 *     - female/ → avatar_01.png … avatar_15.png (15 avatars)
 *  2. Each gender group has 15 avatars divided into 5 letter buckets (3 avatars per bucket).
 *  3. Letter mapping uses charCode modulo 5:
 *       Bucket 0 → 1 … 3   (A F K P U Z 0 5)
 *       Bucket 1 → 4 … 6   (B G L Q V 1 6)
 *       Bucket 2 → 7 … 9   (C H M R W 2 7)
 *       Bucket 3 → 10 … 12 (D I N S X 3 8)
 *       Bucket 4 → 13 … 15 (E J O T Y 4 9)
 *  4. If gender is provided ('male' | 'female'), pick within that gender's bucket.
 *     If gender is not provided, randomly pick between 'male' and 'female'.
 */

/** Total number of male avatars */
export const MALE_AVATAR_COUNT = 18;

/** Total number of female avatars */
export const FEMALE_AVATAR_COUNT = 12;

/** Total overall avatars (18 male + 12 female) */
export const AVATAR_COUNT = 30;

/** Avatar counts per gender */
export const GENDER_AVATAR_COUNTS = {
  male: MALE_AVATAR_COUNT,
  female: FEMALE_AVATAR_COUNT,
};

/** Number of letter buckets (modulo 5: 0 to 4) */
export const BUCKET_COUNT = 5;

/** Valid gender options */
export const VALID_GENDERS = ['male', 'female'];

/**
 * Verified gender bucket layout:
 * - male: 18 avatars partitioned across 5 buckets (4, 4, 4, 3, 3)
 * - female: 12 avatars partitioned across 5 buckets (2, 2, 3, 3, 2)
 */
export const GENDER_BUCKET_MAP = {
  male: [
    [1, 2, 3, 4],     // Bucket 0: A, F, K, P, U, Z, 0, 5
    [5, 6, 7, 8],     // Bucket 1: B, G, L, Q, V, 1, 6
    [9, 10, 11, 12],  // Bucket 2: C, H, M, R, W, 2, 7
    [13, 14, 15],     // Bucket 3: D, I, N, S, X, 3, 8
    [16, 17, 18],     // Bucket 4: E, J, O, T, Y, 4, 9
  ],
  female: [
    [1, 2],           // Bucket 0: A, F, K, P, U, Z, 0, 5
    [3, 4],           // Bucket 1: B, G, L, Q, V, 1, 6
    [5, 6, 7],        // Bucket 2: C, H, M, R, W, 2, 7
    [8, 9, 10],       // Bucket 3: D, I, N, S, X, 3, 8
    [11, 12],         // Bucket 4: E, J, O, T, Y, 4, 9
  ],
};

/** Legacy constant for backward compatibility */
export const AVATARS_PER_BUCKET = 3;

/**
 * Normalise gender string.
 *
 * @param {string|null} gender
 * @returns {'male'|'female'|null}
 */
export function normalizeGender(gender) {
  if (!gender || typeof gender !== 'string') return null;
  const g = gender.trim().toLowerCase();
  return VALID_GENDERS.includes(g) ? g : null;
}

/**
 * Map a single character to a bucket index (0 – BUCKET_COUNT-1).
 * Falls back to a random bucket for characters outside A-Z / 0-9.
 *
 * @param {string} char - Single character (case-insensitive)
 * @returns {number} Bucket index 0–4
 */
export function charToBucket(char) {
  if (!char || typeof char !== 'string') {
    return Math.floor(Math.random() * BUCKET_COUNT);
  }

  const c = char.toUpperCase().charCodeAt(0);

  // A-Z  → code 65-90
  if (c >= 65 && c <= 90) return c % BUCKET_COUNT;

  // 0-9  → code 48-57
  if (c >= 48 && c <= 57) return c % BUCKET_COUNT;

  // Anything else → random bucket
  return Math.floor(Math.random() * BUCKET_COUNT);
}

/**
 * Return avatar selection based on first letter and optional gender.
 *
 * @param {string} letter - First character of username
 * @param {string|null} [gender=null] - 'male' | 'female'
 * @returns {{ index: number, gender: string, bucket: number }}
 */
export function pickAvatarForLetter(letter, gender = null) {
  const resolvedGender = normalizeGender(gender) || (Math.random() < 0.5 ? 'male' : 'female');
  const bucket = charToBucket(letter);

  const bucketPool = GENDER_BUCKET_MAP[resolvedGender][bucket];
  const index = bucketPool[Math.floor(Math.random() * bucketPool.length)];

  return {
    index,
    gender: resolvedGender,
    bucket,
    valueOf: () => index,
    toString: () => String(index),
    [Symbol.toPrimitive](hint) {
      return hint === 'string' ? String(index) : index;
    },
  };
}

/**
 * Build the public-facing URL path for a given avatar index and gender.
 *
 * @param {number|object} indexOrObj - Avatar index or pick result object
 * @param {string|null} [gender=null] - 'male' | 'female'
 * @returns {string} e.g. "/avatars/male/avatar_04.png"
 */
export function buildAvatarUrl(indexOrObj, gender = null) {
  let index = indexOrObj;
  let effectiveGender = gender;

  if (indexOrObj && typeof indexOrObj === 'object') {
    index = indexOrObj.index;
    if (!effectiveGender) {
      effectiveGender = indexOrObj.gender;
    }
  }

  effectiveGender = normalizeGender(effectiveGender);
  const num = Number(index);

  if (effectiveGender) {
    const maxCount = GENDER_AVATAR_COUNTS[effectiveGender] || 18;
    const clamped = Math.max(1, Math.min(num, maxCount));
    const padded = String(clamped).padStart(2, '0');
    return `/avatars/${effectiveGender}/avatar_${padded}.png`;
  }

  // Fallback: if no gender, default to male
  const padded = String(Math.max(1, Math.min(num || 1, 18))).padStart(2, '0');
  return `/avatars/male/avatar_${padded}.png`;
}

/**
 * Given a username's first letter and optional gender,
 * return resolved avatar URL, index, gender, and bucket.
 *
 * @param {string} letter - First character of a username
 * @param {string|null} [gender=null] - 'male' | 'female'
 * @returns {{ url: string, index: number, gender: string, bucket: number }}
 */
export function resolveAvatarForLetter(letter, gender = null) {
  const choice = pickAvatarForLetter(letter, gender);
  const url = buildAvatarUrl(choice.index, choice.gender);
  return {
    url,
    index: choice.index,
    gender: choice.gender,
    bucket: choice.bucket,
  };
}


